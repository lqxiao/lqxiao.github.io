# A Brief Survey to LLM Hallucination

## What is hallucination?

Hallucination is usually defined as model generates nonsensical or unfaithful content. 

There are two types of hallucination: 

1. Intrinsic hallucination (also known as in-context hallucination or faithfulness hallucination): When a model's response contradicts or conflicts with the given context. 
1. Extrinsic hallucination (also known as factuality hallucination): Model’s response is not aligned with verifiable real-world facts. Model’s knowledge is limited to pre-training, so model has to know what is does not know to avoid hallucination.

Hallucination is a critical issue as it not only diminishes the practical utility of a model but also undermines user trust. It is far better to admit, "I do not know," than to provide an unreliable or inaccurate response.

Hallucination occurs in humans as well. An interesting experiment conducted in a preschool demonstrated how easily humans can hallucinate. When teachers placed bandages on children while they were napping, the children, upon waking, began to fabricate various explanations for their bandages—ranging from mosquito bites to falling down. This illustrates that any intelligent agent can easily hallucinate when it is not well aligned.

![Text: place bandage on children](images/llm-hallucination-2.png)

*Text: place bandage on children*

![Text: (he) pulled me to fall down](images/llm-hallucination-3.png)

*Text: (he) pulled me to fall down*

![Figure 1.  Some examples of LLM hallucination. From Huang et al., 2024](images/llm-hallucination-1.png)

*Figure 1.  Some examples of LLM hallucination. [From [Huang et al., 2024](https://arxiv.org/abs/2311.05232)] ]*

*Figure 1.  Some examples of LLM hallucination. [From [[Huang et al., 2024](https://arxiv.org/abs/2311.05232)] ]*

## What Causes Hallucination?

### Pre-training Data Issues 

Crawled datasets are not always reliable, as they may contain incorrect or conflicting information. For instance, societal biases are often linked to hallucination. Biased text, for example, might stereotypically associate the profession of nursing with women.

### Overfit to New Knowledge 

Forcing a model to overfit data it doesn't truly understand causes imitative falsehood [[Lin et al.. 2021](https://arxiv.org/abs/2109.07958)]. When the model lacks comprehensive understanding of training examples, it simply learns to mimic responses without genuine knowledge. It's worth noting that training on new knowledge doesn't necessarily cause hallucination—overfitting does [ [Gekhman et al. 2024](https://arxiv.org/abs/2405.05904)]. In post-training stage, model needs to be taught to distinguish what it knows and what does not. This is often omitted, especially learning from teacher models or human teachers. 

### Unfaithful Fine-tuning Dataset  

Fine-tuning datasets are obtained through human editing, templates, or teacher models. Models learn to hallucinate when their "teachers" do. LIMA conducted by [[Zhou et al.. 2023](https://arxiv.org/abs/2305.11206)], shows that finetuning samples could be as less as 1000 when high quality. It proves that quality is much more important than quality for alignment. 

### Hallucination from RLHF

Model may learn sycophancy when being reinforced with human preference [[Perez et al. 2022](https://arxiv.org/pdf/2212.09251)]. It bends to human preference to get higher reward score. This could be related to dataset quality problem or reward hacking. 

### Others 

Hallucination also related to model’s reasoning ability, decoding strategies [[Lee et al. 2022](https://arxiv.org/pdf/2206.04624)] et al.

## Hallucination Evaluation 

Hallucination evaluation assesses the veracity of an LLM’s responses, while hallucination detection evaluates the accuracy of a detection method in identifying hallucinations. In this section, we concentrate on hallucination evaluation benchmarks. 

### Factuality｜Multi-Choice

**TruthfulQA** [[Stephanie et al.., 2022](https://arxiv.org/pdf/2109.07958)] is a benchmark made up of questions designed to cause imitative falsehoods. It contains two subtasks, generation and multi-choice, where generation rely on human for judgement. The benchmark comprises 817 questions that span 38 categories. For multi-choice task, user can use accuracy, but for generation task, metric needs to be built by them own. 

![Figure 2. TruthfulQA examples. The questions are misleading or unanswerable.](images/llm-hallucination-4.png)

*Figure 2. TruthfulQA examples. The questions are misleading or unanswerable. *

**Factor** [[Muhlgay](https://arxiv.org/search/cs?searchtype=author&query=Muhlgay,+D)[ et al. 2021](https://arxiv.org/abs/2307.06908)] is multi-choice benchmark for evaluate LLM hallucination. It use likelihood of answer completion instead accuracy to calculate performance. 

![Figure 3. An examples from Factor benchmark. Image from Dor et al., 2021](images/llm-hallucination-5.png)

*Figure 3. An examples from Factor benchmark. Image from [Dor et al., 2021]*

*Figure 3. An examples from Factor benchmark. Image from [Dor et al., 2021] *

### Factuality ｜RAG

**SAFE** [[Jerry et al.., 2024](https://arxiv.org/pdf/2403.18802)] is an automated evaluation method that decomposes a long-form response into individual facts. SAFE employs a multi-step reasoning process, including querying Google Search, to verify each fact's accuracy. LLM-judge is used to rate each facts. To assess long-form factuality, the paper extends the traditional F1 score. This metric balances the proportion of supported facts (precision) with the proportion of provided facts relative to a user-defined preferred response length (recall).

![Figure 4. How does SAFE work. Image from Jerry et al.., 2024](images/llm-hallucination-6.png)

*Figure 4. How does SAFE work. Image from [Jerry et al.., 2024](https://arxiv.org/pdf/2403.18802)]*

*Figure 4. How does SAFE work. Image from [[Jerry et al.., 2024](https://arxiv.org/pdf/2403.18802)]*

### Factuality ｜LLM-Judge

HaluEval 2.0 [[Junyi et al.., 2023](https://arxiv.org/pdf/2305.11747)] is a benchmark designed to evaluate and detect hallucinations in LLM outputs. They also propose a straightforward yet effective detection method to identify when LLMs generate unfaithful or incorrect information. Paper used GPT-4 for judgement.

HALLUQA [[Cheng et al. 2023](https://arxiv.org/pdf/2310.03368)] focus on hallucination on Chinese language. It manually writes question set and uses ChatGPT3.5/Puyu/GLM-130B to generate candidate answers. It contains misleading, misleading-hard and knowledge three different subsets. GPT-4 is employed to check the correctness of the LLM’s response against ground-truth. 

### Factuality | Consistency 

[Agrawal et al. (2023)](https://arxiv.org/pdf/2305.18248) investigates whether large language models (LLMs) can internally detect when they generate fabricated or "hallucinated" references, such as nonexistent book or article citations. They ask LLM several time to check the consistency of its answer. Indirect query output a list of author and LLM is employed to check. 

![Figure 5.  Image from Ayush et al., (2023)](images/llm-hallucination-7.png)

*Figure 5.  Image from [Ayush et al., (2023)](https://arxiv.org/pdf/2305.18248) *

### Faithfulness 

**FaithBench** [[Forrest et al.., 2024](https://arxiv.org/pdf/2410.13210)] introduces a benchmark designed to evaluate hallucinations—instances where large language models (LLMs) produce unsupported or incorrect information—in summarization tasks. FaithBench assesses summaries generated by 10 contemporary LLMs from 8 distinct families, including GPT, Llama, Gemini, Mistral, Phi, Claude, Command-R, and Qwen. This diversity ensures a comprehensive analysis across various architectures and training methodologies.

The benchmark includes ground truth annotations provided by human experts, offering detailed justifications at the level of individual text spans. This meticulous annotation process enhances the reliability of the benchmark.

FaithBench emphasizes "challenging" summaries—those where state-of-the-art hallucination detection models, including GPT-4o-as-a-judge, exhibit disagreement. By concentrating on these difficult cases, the benchmark aims to push the boundaries of current detection capabilities

Current hallucination detection models show limited effectiveness when tested against FaithBench. The best-performing detectors achieved balanced accuracies and F1-macro scores around 50-55%, highlighting significant room for improvement in this area.

![Figure 6. Performance of different model on FaithBench.](images/llm-hallucination-8.png)

*Figure 6. Performance of different model on FaithBench.*

## Mitigation Methods 

### Data Curation

To enhance factual accuracy and reduce biases in large language models (LLMs), careful selection and processing of pre-training data are key. High-quality, curated datasets from reliable sources, like academic or "textbook-like" materials, help ensure factual correctness. Strategies like up-sampling factual data during pre-training further improve accuracy and mitigate hallucination. Deduplication is also critical, addressing both exact and near-duplicates. Exact duplicates can be identified efficiently using methods like suffix arrays, while near-duplicates rely on hash-based techniques such as MinHash [[A.Z. et al.](https://ieeexplore.ieee.org/abstract/document/666900/), 1997] or semantic approaches like SemDeDup [[Abbas et al. 2023](https://arxiv.org/abs/2303.09540)], which detect similarities through embeddings. These measures collectively aim to refine data quality and boost model performance.

For post-training datasets, it is crucial to avoid introducing new knowledge and overfitting, as this can lead to imitative hallucinations. Overfitting compromises the model's ability to generalise and may cause it to reproduce incorrect information. Tools such as those developed by [Akyürek et al. ](https://arxiv.org/abs/2205.11482)(2022) have been designed to trace information back to the pretraining corpus, providing greater transparency and control over knowledge sources.

### **RAG**

Retrieval-Augmented Generation (RAG) enhances large language models (LLMs) by integrating external knowledge through a retrieve-then-read pipeline. This process involves retrieving relevant information from external sources and generating responses based on both the user query and the retrieved documents. By decoupling external knowledge from the LLM, RAG effectively mitigates hallucinations caused by knowledge gaps without compromising the model's performance.

RAG implementations can be categorized based on the timing of retrieval:

1. **One-Time Retrieval**: Retrieval occurs once before the generation phase. The model retrieves relevant documents in a single step and then generates the response based on this information.
1. **Iterative Retrieval**: Retrieval and generation occur in multiple cycles. The model retrieves information, generates a partial response, and then uses this intermediate output to perform further retrievals, refining the response iteratively.
1. **Post-Hoc Retrieval (Self-Critique)**: Retrieval happens after an initial response is generated. The model first produces a response based on its internal knowledge, and then retrieval is used to verify and potentially adjust the response for accuracy.
1. **Self-Reflective Retrieval-Augmented Generation (Self-RAG)**, further enhances this framework by enabling the model to decide adaptively when and what to retrieve during the generation process. Self-RAG allows the model to:
This self-reflective mechanism enhances the model's versatility and effectiveness across diverse tasks, including open-domain question answering, reasoning, and fact verification. Studies have demonstrated that Self-RAG outperforms traditional RAG approaches and state-of-the-art LLMs in improving factual accuracy and citation precision in generated content.

In summary, RAG and its advanced variant, Self-RAG, represent significant advancements in enhancing the reliability and factual accuracy of LLMs by effectively integrating external knowledge and enabling adaptive retrieval strategies.

![Figure 6. Illustration of three different retrieval schema. Image from Lei et al (2024) .](images/llm-hallucination-9.png)

*Figure 6. Illustration of three different retrieval schema. Image from [Lei et al (2024)](https://arxiv.org/abs/2311.05232) .*

![Figure 7. Self-RAG. Image from Asai et al. 2024](images/llm-hallucination-10.png)

*Figure 7. Self-RAG. Image from [Asai et al. 2024](https://arxiv.org/abs/2310.11511)]*

*Figure 7. Self-RAG. Image from [[Asai et al. 2024](https://arxiv.org/abs/2310.11511)]*

### **Inference Sampling Methods**

[Lee et al., (2022) ](https://arxiv.org/pdf/2206.04624)examines how different decoding strategies impact the factual accuracy of generated text. It highlights that commonly used methods like nucleus sampling (top-p) can introduce randomness at each decoding step, leading to potential factual inaccuracies. To address the shortcomings of existing decoding methods, the authors propose "factual-nucleus sampling." This approach dynamically adjusts the randomness during text generation to enhance factual accuracy while maintaining the quality and diversity of the output. When generating t-th tokens, the top-p possibility is reset as: 

$$
p_t = max(w, p \times \lambda ^{t-1})
$$

### **Fine-tuning **

[Nakano, et al. (2022](https://arxiv.org/abs/2112.09332)) from OpenAI proposed WebChat, where model is taught to use browser to generate better answers. They found SFT (supervised finetuning) and rejection sampling perform the best.  The model’s answers are preferred 56% of the time by human, demonstrating human-level usage of the text-based browser.

![Figure 8. WebChat method to produce demonstration datasets. Image from Nakano, et al., 2022](images/llm-hallucination-11.png)

*Figure 8. WebChat method to produce demonstration datasets. Image from [Nakano, et al., 2022](https://arxiv.org/abs/2112.09332)]*

*Figure 8. WebChat method to produce demonstration datasets. Image from [[Nakano, et al., 2022](https://arxiv.org/abs/2112.09332)] *

## Citation

Cited as:

> Xiao, Liqiang (Dec. 2024). A Brief Survey to LLM Hallucination.

Or

```bibtex
@article{LiqiangXiao2024hallucination,
  title   = "A Brief Survey to LLM Hallucination",
  author  = "Liqiang Xiao",
  journal = "liqiangxiao.github.io",
  year    = "2024",
  month   = "Dec.",
  url     = "https://tangy-violet-c0c.notion.site/A-Brief-Survey-to-LLM-Hallucination-16fe59a847948094865ac1e6ed1a3fa3"
}
```

## References: 

[1] Huang, Lei, et al. "[A survey on hallucination in large language models: Principles, taxonomy, challenges, and open questions.](https://arxiv.org/abs/2311.05232)" *ACM Transactions on Information Systems* (2023).

[2] Lin, Stephanie, Jacob Hilton, and Owain Evans. "[Truthfulqa: Measuring how models mimic human falsehoods.](https://arxiv.org/abs/2109.07958)" *arXiv preprint arXiv:2109.07958* (2021).

[3] Gekhman, Zorik, et al. "[Does Fine-Tuning LLMs on New Knowledge Encourage Hallucinations?.](https://arxiv.org/abs/2405.05904)" *arXiv preprint arXiv:2405.05904* (2024).

[4] Zhou, Chunting, et al. "[Lima: Less is more for alignment.](https://arxiv.org/abs/2305.11206)" *Advances in Neural Information Processing Systems* 36 (2024).

[5] Perez, Ethan, et al. "[Discovering language model behaviors with model-written evaluations.](https://arxiv.org/pdf/2212.09251)" *arXiv preprint arXiv:2212.09251* (2022).

[6] Chen, Jiuhai, and Jonas Mueller. "[Quantifying uncertainty in answers from any language model and enhancing their trustworthiness.](https://aclanthology.org/2024.acl-long.283/)" *Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers)*. 2024.

[7] Muhlgay, Dor, et al. "[Generating benchmarks for factuality evaluation of language models.](https://arxiv.org/abs/2307.06908)" *arXiv preprint arXiv:2307.06908* (2023).

[8] Wei, Jerry, et al. "[Long-form factuality in large language models.](https://arxiv.org/abs/2403.18802)" *arXiv preprint arXiv:2403.18802* (2024).

[9] Li, Junyi, et al. "[Halueval: A large-scale hallucination evaluation benchmark for large language models.](https://arxiv.org/abs/2305.11747)" *arXiv preprint arXiv:2305.11747* (2023).

[10] Cheng, Qinyuan, et al. "[Evaluating hallucinations in chinese large language models.](https://arxiv.org/abs/2310.03368)" *arXiv preprint arXiv:2310.03368* (2023).

[11] Agrawal, Ayush, et al. "[Do Language Models Know When They're Hallucinating References?](https://arxiv.org/abs/2305.18248)." *arXiv preprint arXiv:2305.18248* (2023).

[12] Bao, Forrest Sheng, et al. "[FaithBench: A Diverse Hallucination Benchmark for Summarization by Modern LLMs](https://arxiv.org/abs/2410.13210)." *arXiv preprint arXiv:2410.13210* (2024).

[13] Akyürek, Ekin, et al. "[Towards tracing factual knowledge in language models back to the training data.](https://arxiv.org/abs/2205.11482)" *arXiv preprint arXiv:2205.11482* (2022).

[14] Asai, Akari, et al. "[Self-rag: Learning to retrieve, generate, and critique through self-reflection.](https://arxiv.org/abs/2310.11511)" *arXiv preprint arXiv:2310.11511* (2023).

[15] Lee, Nayeon, et al. "[Factuality enhanced language models for open-ended text generation.](https://proceedings.neurips.cc/paper_files/paper/2022/hash/df438caa36714f69277daa92d608dd63-Abstract-Conference.html)" *Advances in Neural Information Processing Systems* 35 (2022): 34586-34599.

[16] Nakano, Reiichiro, et al. "[Webgpt: Browser-assisted question-answering with human feedback.](https://arxiv.org/abs/2112.09332)" *arXiv preprint arXiv:2112.09332* (2021).

[17] Broder, Andrei Z. "[On the resemblance and containment of documents.](https://ieeexplore.ieee.org/abstract/document/666900/)" *Proceedings. Compression and Complexity of SEQUENCES 1997 (Cat. No. 97TB100171)*. IEEE, 1997.
