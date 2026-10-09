# LLM Evolution via Self-Play

Self-play is a kind of self-evolutional method that a large language model (LLM) generates its own prompts and responses in order to improve its performance through interaction with itself. Instead of relying solely on human-generated data, the model plays both roles—questioner and responder—to simulate realistic conversations, debates, or problem-solving sessions (Figure 1.). This process helps expose the model to a broader distribution of scenarios, enhances reasoning, and enables it to explore failure modes or refine skills through iterative self-evaluation. Often, a reward model or automated feedback mechanism is used to score and select better responses, making self-play a powerful tool for fine-tuning LLMs in alignment, safety, or task-specific capabilities without requiring constant human intervention.

![Figure 1. An illustration of self-play for llm](images/llm-self-play-1.png)

*Figure 1. An illustration of self-play for llm*

The key challenges of self-play algorithms are threefold:

- Generating verifiable questions with minimal human prior;
- Verifying the correctness of generated responses;
- Designing an effective curriculum by gradually increasing the difficulty of questions.
Aligned with these challenge dimensions, we summarize recent works in the following table.

## Self-Play for RL

[Absolute Zero](https://arxiv.org/pdf/2505.03335) proposed a novel self-play for math and coding tasks, which consumer zero pre-curated data and achieve strong performance. It forms coding task into triplets [input, function, output], and employed an code executor to help verify the correctness of proposal and responses. Also, it use a self-adversarial RL training between proposer and solver, the proposer’s reward is opposite to solver’s reward. This could help improve the problem-proposing and -solving ability. 

![Figure 2. Illustration of Absolute Zero algorithm. (image comes from Absolute Zero paper)](images/llm-self-play-2.png)

*Figure 2. Illustration of Absolute Zero algorithm. (image comes from Absolute Zero [paper](https://arxiv.org/pdf/2505.03335))*

[Genius](https://arxiv.org/abs/2504.08672) employs prepared queries without ground-truth. It samples multiple response, and use foresight score to calculate reward advantage. Genius runs in an unsupervised method since there is no supervised data for both actor and reward model.

![figure](images/llm-self-play-4.png)

[MINIMO](https://arxiv.org/abs/2407.00695) applied self-play in mathematical proof problem, and leverage constrained decoding to improve conjectures quality. 

[SPC](https://arxiv.org/pdf/2504.19162) enhanced model’s critic ability by proposal a self-play critic game. SPC lets two model play a Adversarial Games, where sneaky generator to generate wrong math progress and critic finds it, which enhanced model’s error correction ability on process bench. 

## Self-Play for RLHF

[eva](https://arxiv.org/html/2411.00062v3) applied self-play onto RLHF, and proposed an evolve method to generate more prompts with human prompt. It optimizes proposer and solver with regret score. It improve human preference largely.  [Constitutional AI](http://arxiv.org/pdf/2212.08073#:~:text=We%20continue%20to%20utilize%20human,is%20exactly%20the) use AI to produce preference dataset. If the feedback model is the same with generator, it is an self-play paradigm. [Sol-Ver](https://arxiv.org/abs/2502.14948#:~:text=work%2C%20we%20explore%20an%20effective,generation%20on%20MBPP%20and%20LiveCodeBench) proposed a solver-verifier self-play loop, where the model alternates between writing code solutions and verifying them with generated test cases. Sol-ver used SFT and DPO training to improve the performance.

![Figure 3. An illustration of eva. (image comes from eva paper)](images/llm-self-play-3.png)

*Figure 3. An illustration of eva. (image comes from [eva](https://arxiv.org/pdf/2411.00062v3) paper)*

## Self-Play for SFT

[SPIN](https://arxiv.org/pdf/2401.01335) begins with a model already fine-tuned on some human demonstrations, then iteratively improves it via self-play. At each iteration, the current model generates answers to the original human-provided prompts, producing a set of *self-generated responses*. The model is then fine-tuned to distinguish and prefer the higher-quality responses (often the man demonstration vs. its own weaker outputs) – effectively learning from its own mistakes and successes. This self-discriminative training steadily elevates a weak model to a stronger one without new human data.

## Discussion

The core idea behind LLM self-play is to shift query generation from an offline, human-curated stage to an online, model-driven loop. By letting the model create, solve, and grade its own problems, we can trim human effort and let the system “self-evolve” during training. Despite rapid progress, three gaps remain:

1. **Narrow task focus (mostly coding).**
  Coding problems dominate because they are easy to auto-verify with a compiler or unit tests. Extending self-play to domains such as mathematics, tool use, or open-ended reasoning will require new automatic-verification strategies.

1. **Limited work with explicit reasoning models.**
  Chain-of-thought–style models already show stronger zero-shot performance. Running self-play on top of these “reasoning-first” architectures could yield harder self-generated challenges and push the ceiling on problem-solving ability.

1. **Almost no exploration with agentic systems.**
  Multi-turn agents that can plan, reflect, and call tools should synergize with self-play: the agent proposes tasks, iteratively improves its own solutions, and critiques the results. Studying this feedback loop could unlock much more powerful agentic behaviors through self-evolution.

## Citation

Cited as:

> Xiao, Liqiang (Aug. 2025). *LLM Evolution via Self-Play.*

Or

```bibtex
@misc{Xiao2025SelfPlay,
author       = {Xiao, Liqiang},
title        = {LLM Evolution via Self-Play},
year         = {2025},
month        = aug,
howpublished = {\url{[https://tangy-violet-c0c.notion.site/LLM-Evolution-via-Self-Play-202e59a847948006a90fd284820dbbd8](https://tangy-violet-c0c.notion.site/LLM-Evolution-via-Self-Play-202e59a847948006a90fd284820dbbd8)}},
note         = {Blog post},
}
```
