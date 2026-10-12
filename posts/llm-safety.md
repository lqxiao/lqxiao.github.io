# From Lab to Launch: Industrial-Strength LLM Safety

After two years working on LLM safety, I’d like to distill what I’ve learned and look toward the next horizon. I hope this post helps anyone tackling safety in an industrial setting. Although academia and industry share much of the same technical knowledge, their priorities differ:

1. **How over why.** In production we often don’t know *why* the model behaves a certain way or exactly *where* it learned a bad habit, but we still have to know *how* to fix it—quickly and reliably.
1. **Simplicity and maintainability.** Complex solutions are hard to evaluate, hard to hand off to teammates, and hard to ship on schedule. Industry therefore favors methods that are simple, auditable, and easy to manage.
1. **Scalability.** A company faces more safety edge-cases and higher release standards than any single research project. We must convert “talent problems” into “resource problems,” budgeting head-count, GPU hours, and monitoring pipelines so the solution grows with the product.

Below are the lessons that stood out to me over the past two years—many now common wisdom in the LLM world:

1. **Data quality rules everything.**
  *Eyeballing your data* is non-negotiable—echoing Jason Wei’s point that metrics can’t replace human intuition ([tweet](https://x.com/_jasonwei/status/1945294042138599722)). Expect to spend 80 % of your time on curation.

  - *You don’t know it until you see it.* Humans rarely out-write an LLM from scratch; instead, prompt the model, then select and polish the best outputs.
  - *Data-driven beats SOPs.* Language is endlessly case-specific. Written guidelines alone won’t capture every nuance, so sit with annotators and walk through examples.
  - *People conserve energy.* Annotators will finish as quickly as you let them; cross-checks and iterative review are needed to keep quality high.
1. **Build the benchmark first.**
  A solid benchmark shows where you stand and what to optimize. Once you have a query generator and a reward model, 80 % of the job is done.

1. **Aim for generality.**
  Real-world inputs are broad and messy. Toy or narrow-domain fixes overfit quickly; design solutions that generalize.

1. **Keep it simple.**
  The best principles are usually the simplest. Flashy techniques may look clever but often sink projects—witness how plain next-token prediction eclipsed more elaborate language-modeling schemes.

These guidelines have saved me countless cycles—and, I hope, will save you some too.

## Safety Work is Like a Scaled‑Down LLM Development Project in Its Own Right.

Working on LLM safety is essentially a miniature version of building the entire model. You must engage with—and understand—every stage of the pipeline: supervised fine‑tuning (SFT), DPO, RL, agent orchestration, prompt engineering, filtering, and more, because any single stage can shift the model’s safety distribution. That means tracking not only your safety data but also the characteristics of every other dataset involved. The challenge is to keep the model safe without degrading its capabilities, embodying SSI’s vision that *[We approach safety and capabilities in tandem](https://ssi.inc/#:~:text=We)**.*

Large‑language‑model (LLM) safety is the discipline of ensuring that powerful text‑generating models behave in ways that are reliable, controllable, and aligned with human values. It spans technical safeguards—such as fine‑tuning, reinforcement learning from feedback, red‑team prompting, agent, and automatic toxicity filtering—as well as governance measures like audit trails and usage policies. The core goal is to prevent harmful outputs (e.g., disinformation, hate speech, personal‑data leaks), mitigate bias, and avoid “emergent” behaviors such as jailbreaks or unchecked self‑recommendations. By treating safety as a first‑class requirement, researchers and practitioners aim to unlock the benefits of LLMs—better search, coding assistance, scientific discovery—while minimizing the societal, ethical, and security risks that come with models capable of open‑ended reasoning and persuasion.

## **Safety Must Be Involved at Every Step of LLM Development**

As noted earlier, safety must be woven into **every stage of the LLM lifecycle**. Each phase—data collection, training, fine-tuning, tool integration, and deployment—can introduce new risks, yet each also offers levers for mitigating them. Safety-related data and objectives should appear throughout the training pipeline to prevent catastrophic forgetting during continual learning, but they can’t crowd out other capabilities. Striking the right safety-to-performance ratio is therefore a continual balancing art.

### SFT (Supervised Fine-Tuning)

Toxicity, Profanity, Illegal Behavior, Human and animal harm etc. could be largely mitigated in SFT stage. STP is demonstration learning, which directly tells model what is right behavior we want. But it cannot teach model what kind of behavior is wrong, which mean the investigation to the distribution is not wide enough. For example, you can easily teach model to provide help when user has intent to commit suicide, but it is hard to forbidden model saying “water beads is joyful” when selling water beads to children. SFT loss is: 

![figure](images/llm-safety-1.png)

, which is simple so the key is to prepare high quality training data. 

Numerous approaches have been proposed for creating safety‑oriented SFT datasets (see the papers linked below). After extensive trial and error, I’ve found three methods that are both straightforward and effective:

1. **Humans **can write short and clear response, e.g. clean refusal or PR (Public relationship) questions. If the response is long or involved expertise, revising LLM’s response is more suitable.
1. **Prompt distillation **is a series of methods that prompt LLMs to generate responses. *[Mu et al. (2023](https://cdn.openai.com/rule-based-rewards-for-language-model-safety.pdf)**) *use query+instructions to generate golden/bad response for reward calibration. [Guan et al.(2024](https://openai.com/index/deliberative-alignment/)) used query+policy to generate safety reasoning responses to fine-tune LLMs. Prompt distillation is widely used method to generate alignment data, since models’ instruction following ability is pretty strong now.
1. **Constitutional AI (CAI)** (*[Bai et al., 2022)](https://doi.org/10.48550/arXiv.2212.08073)* instructs LLMs to revise flawed responses according to a predefined policy. The process generates rejected/accepted response pairs, making it well suited to preference‑learning methods such as DPO *[(Rafailov et al., 2023)](https://doi.org/10.48550/arXiv.2305.18290)*. CAI, however, challenges the model’s instruction‑following ability: LLMs often add unwanted boilerplate—for example, “Sure, I can help you revise the text according to the policy. Here is the revised version … If you have other questions, I am happy to help.” Requiring the model to place the revised answer inside an XML tag helps mitigate this problem.

### DPO 

Direct Preference Optimization (DPO) fine-tunes a model to prefer *good* completions over *bad* ones by minimizing a preference-weighted KL objective.  For safety, the “good” side represents policy-compliant, harmless, or redacted answers, while the “bad” side shows the unsafe behavior we hope to avoid. Data curation pipeline for DPO is very similar to SFT. Basically you may use [prompt distillation](/233e59a8479480c6b2e3fe08eb05ad9c?pvs=25#23be59a8479480179d80f469d778287e) and [CAI](/233e59a8479480c6b2e3fe08eb05ad9c?pvs=25#23ee59a8479480d89863fcf0229d976c) to prepare preference pairs. In a prompt-distillation setup, the model’s answer to the *raw* query serves as the **rejected** response, while the answer to *query + policy* becomes the **chosen** response.  Under Constitutional AI (CAI), the model’s original draft is treated as *rejected* and its policy-guided rewrite as *chosen*.  To make DPO fine-tuning more effective, here are some tips:

1. the distribution of both rejected and chosen response should be close to original model.
1. make rejected and chosen responses contrastive. Rejected and chosen pairs should differ *only* along the safety dimension; everything else—factual content, structure, length—should be as similar as possible. A high-signal contrast gives the loss a clear gradient.

### Reinforcement Learning for Safety

For safety RL, reward model is much more important than algorithms. Based on my experiments, complex algorithms does not impact the performance much. In the opposite, simple algorithm, like RLOO, self-critic, shows better stability. *[Ahmadian et al. (2024](https://doi.org/10.48550/arXiv.2402.14740)**)* revisited different algorithms and found complex algorithm does not necessary render better performance. So in the rest part of this section, we will focus on reward model.

![Figure 1. training reward curve of different RL algorithms for safety. I did not fine-grained tune hypar-parameter, so this picture cannot show best performance of each algo but stability.](images/llm-safety-2.png)

*Figure 1. training reward curve of different RL algorithms for safety. I did not fine-grained tune hypar-parameter, so this picture cannot show best performance of each algo but stability.*

![Figure 2. Test rewards plotted throughout training. (Image source: Ahmadian et al. (2024)](images/llm-safety-3.png)

*Figure 2. Test rewards plotted throughout training. (Image source: *[Ahmadian et al. (2024](https://doi.org/10.48550/arXiv.2402.14740)**)* *

There are several kinds of graders for RL, **RM (reward model), LLMaaJ (LLM-as-a-Judge) (***[Mu et al., 2023](https://cdn.openai.com/rule-based-rewards-for-language-model-safety.pdf)**)***, Rule-based Reward model**. RM is trained on ranked dataset, which needs diverse query and high-quality labels. Study found RM performs the best when using same query set for actor training, which means we may face scalability problem. It might be hard to use 1K labeled samples to train a RM, then use 1M queries for actor training. Rule-based reward model use verifiable graders like string-match. It is easy to manage but rarely used for safety training since safety problem are usually semantic. **LLMaaJ **prompts an on-hand LLM to generate reward score without training. It does not need massive preference labeling, and is scalable using LLM’s generalization ability. [Jiang et al. (2024)](https://doi.org/10.48550/arXiv.2402.03700) found that strong model could reach very high agreement with human on evaluation. So we could believe LLM itself a very good reward model if prompted properly. LLMaaJ is a suitable methods for industry for following reasons: 

1. Industry policies evolve constantly—both their wording and their sheer number. New rules accumulate over time, and existing ones are revised as interpretations shift. In such a fluid environment, the data and checkpoints of a reward model can become obsolete surprisingly quickly.
1. Fast delivery is another reason that we cannot chose RM for industry. Collecting preference data may take longer time than a release cycle.
So in the rest of this section we focus on LLMaaJ method. 

![figure](images/llm-safety-9.png)

![Figure 3. Method to generate golden and training dataset for LLMaaJ graders. (source from (Mu et al., 2023) )](images/llm-safety-4.png)

*Figure 3. Method to generate golden and training dataset for LLMaaJ graders. (source from **(***[Mu et al., 2023](https://cdn.openai.com/rule-based-rewards-for-language-model-safety.pdf)**) *)*

Because policy compliance often depends on nuanced meaning rather than rigid syntax, an LLM‑based grader works best. Below is a streamlined workflow for building a high‑performance LLM judge prompt.

1. **Curate a “gold” prompt set**
  Collect a few hundred prompts—single‑turn or multi‑turn dialogues—that target your policy space.

1. **Generate diverse, labeled responses**
  For each prompt, synthesize 5–10 candidate answers. Create them “label‑first”: decide the compliance label you want (e.g., *Compliant*, *Violation*) and craft a response to match. See Figure 3 for an example using explicit propositions to steer each label.

1. **Human verification**
  Have annotators confirm that every response carries the intended label.

1. **Draft a prompt template**
  Create a template with placeholders such as `{question}` and `{response}` (plus any other context). The `{question}` slot will hold the *judgment prompt* you fine‑tune in the next step.

1. **Tune the judgment prompt**
  Write a concise instruction for each label and iterate on wording until a held‑out LLM reaches the highest F1 score. *Important:* Instruct the model to output **only** “Yes” or “No”; their softmax score will serve as a continuous signal.

1. **Learn label weights (optional)**
  If you have a multi‑label signals, fit weights $w$ with linear regression on your dataset $\mathbb{D}$ using a margin‑ranking loss:

$$
\begin{equation}\mathcal{L}(w)=\frac{1}{\lvert\mathbb{D}\rvert}\,\sum_{(p,c_a,c_b)\,\in\,\mathbb{D}}\Bigl[\max\!\bigl(0,\,        1 + R_{\text{tot}}(p,c_b,w) - R_{\text{tot}}(p,c_a,w)      \bigr)\Bigr]\end{equation}
$$

  where $p$ is the judgment prompt, $c_b$ and $c_a$ are two completions with a known ranking, and $w$ is the weighted score.

  *Note:* This requires that in **Step 2** each prompt have at least two responses whose relative ranking is known (see Table 1).

By following these steps, you obtain an LLM judge that delivers reliable, continuous rewards for policy‑aligned training.

![figure](images/llm-safety-10.png)

![Table 1. An example for data labeling with ranked responses.](images/llm-safety-5.png)

**Table 1. An example for data labeling with ranked responses.**

![Figure 4 Training progress with LLMaaJ graders.](images/llm-safety-6.png)

*Figure 4 Training progress with LLMaaJ graders.*

The choice of LLM that runs the LLM-as-a-Judge (LLMaaJ) prompts is critical. Stronger base models typically offer more reliable judgments, but probability calibration also matters because we read the soft-max score as a confidence value. Key observations:

1. **Base vs. fine-tuned models.** In our experiments (Table 2), the base Qwen2-32B outperformed the instruction-tuned Qwen2.5-32B-Instruct. A closer look revealed that the instruct model’s soft-max outputs were almost binary, providing little gradation, whereas the base model produced a near-normal score distribution that better reflects the true Yes/No probabilities.
1. **Temperature tuning.** Each model has an optimal sampling temperature for LLMaaJ; adjusting it can noticeably improve scoring reliability.
These nuances—model choice and temperature—often matter as much as the prompt itself.

![Table 2: Validation Loss of different model with different sampling temperature.](images/llm-safety-7.png)

*Table 2: Validation Loss of different model with different sampling temperature.*

After RL training, we found above method has significant performance improvement to our scenario and easy to scale up the number of training prompts. Also, it has very good balance on over-refusal benchmarks, like XSTest [(Röttger et al., 2024)](https://arxiv.org/abs/2308.01263), because it has clear distinguish for hard refusal and comply. Furthermore, we found this safety training also has contribution to instruction following ability and helpfulness, e.g. we improved AlpacaEval 2 from 24 to 26.32 on Mistral-7B model. The assumption is that, in comply grader, the LLM considers if the response satisfy all request in input prompt.

After reinforcement‑learning fine‑tuning, the method delivered a substantial performance boost while remaining easy to scale to larger prompt sets. Because the reward function draws a sharp line between “hard refusal” and “compliance,” the model avoids the over‑refusal problem flagged by benchmarks such as **XSTest** [(Röttger et al., 2024)](https://arxiv.org/abs/2308.01263).

Surprisingly, Safety training also improved general instruction‑following: on **AlpacaEval 2 ****[(](https://arxiv.org/abs/2404.04475)**[Dubois et al., 2024](https://arxiv.org/abs/2404.04475)**[)](https://arxiv.org/abs/2404.04475)** the Mistral‑7B checkpoint rose from **24.00** to **26.32**. We suspect this happens because the compliance judge explicitly rewards answers that satisfy every requirement in the user prompt, nudging the model toward more complete and helpful responses. *This result makes us wonder whether the same approach could also be applied to helpfulness. *

### Red Teaming | Jailbreaking

LLM red teaming is the practice of systematically probing large language models to uncover failures, vulnerabilities, and unsafe behaviors before deployment. It involves crafting adversarial prompts and scenarios—such as attempts to elicit harmful, biased, or policy‑violating outputs—to test the model’s robustness against real‑world misuse. Insights from red‑team exercises guide safety fine‑tuning, guardrail design, and evaluation benchmarks, helping ensure that LLMs operate reliably and align with intended ethical and security standards. Red teaming, in industry, is usually used for high risk PR issue, such as prompt leakage, illegal activity, brand damage, sensitive political topics.

Here are several different method to conduct red teaming: 

1. **Manual attacks** rely on human experts or crowdsourced users to jailbreak the model. People excel at divergent thinking and can devise creative exploits that automated methods often miss. After a product is released, we can harvest real-world jailbreak prompts from social-media platforms—Twitter, for instance—to enrich our attack corpus.
1. **Strategy Attacks **do not require direct access to target model, they either run white-box attack refinement on some open source models or only encode designed malicious prompts to jailbreaking prompts. The results from these two ways will be redirected to attack target model without further modifications. AmpleGCG-Plus [(Kumar et al., 2024)](https://arxiv.org/abs/2410.22143), GCG-T ([Zou et al., 2023)](https://arxiv.org/abs/2307.15043?utm_source=chatgpt.com) found attacks were transferrable between models. The successful attacks on white-box model could also successfully jailbreak black-box models. ICA [(Wei et al., 2023)](https://arxiv.org/abs/2310.06387) ArtPrompt (ASCII) [(Jiang et al., 2024)](https://arxiv.org/pdf/2402.11753), ArtPrompt [(Jiang et al., 2024)](https://arxiv.org/abs/2402.11753), CodeAttack [(Ren et al., 2024)](https://arxiv.org/abs/2206.00052) designed effective strategies, and prove effective.   
![Figure 5: CodeAttach and example of strategy attacks.](images/llm-safety-8.png)

*Figure 5: CodeAttach and example of strategy attacks.*

1. **Learnable attacks **interact with the target model in real time, refining jailbreak prompts through an iterative probe-and-update loop. After each attempt, an auxiliary scorer—usually another language model or a reward model—evaluates the response and guides the next prompt revision. PAIR [(Chao et al., 2023)](https://jailbreaking-llms.github.io/)boosts success rates by systematically paraphrasing candidate prompts, whereas AutoDAN and its Turbo variant [(Liu et al., 2024)](https://arxiv.org/abs/2410.05295) expand and evolve a strategy library to push attack performance even higher.
Once we collected enough successful jailbreak cases via above method, we could convert those case into SFT or RL training data to mitigate the risk. 

### Safety in Agentic System
