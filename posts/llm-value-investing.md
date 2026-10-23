# Can LLMs Be Good Value Investors?

Last update: 11/15/2025 | Estimated Reading Time: 40mins | Author: Liqiang Xiao

> Grok 4 is like Warren Buffet and DeepSeek is like Li Lu

> News ruins not only human investing, but LLMs’ as well.

---

It’s easy to imagine LLMs outperforming humans in high-frequency trading: machines are faster, tireless, and consistent. Whether LLMs make good value investors, however, remains an open question.

## Introduction

AI now rivals or exceeds human performance in many domains—not only in games with bounded search spaces but also in areas like competitive mathematics, where systems such as Gemini and ChatGPT have reported medal-level results. Naturally, people ask which jobs AI will replace and which will resist automation. Work centered on human language (e.g., interpreting, customer support), computer languages (e.g., UI engineering), or highly standardized procedures (e.g., routine tax prep, warehousing) appears most exposed. By contrast, roles that are highly personalized (e.g., plumbers—see Hinton’s tongue-in-cheek advice) or require deep, contextual judgment (e.g., political leadership) seem more resilient.

Our live project, Alpha Arena ([nof1.ai](https://nof1.ai/)), explores LLMs in Bitcoin trading. As of 2025-11-12, Qwen and DeepSeek reportedly outperformed the market, hinting that LLMs can excel in higher-frequency settings where speed and persistence dominate. But value investing is different: it prizes business insight over reflexes.

Originating with Benjamin Graham (buy below intrinsic value with a margin of safety) and refined by Warren Buffett (“wonderful businesses at fair prices” rather than cigar butts), value investing has been adapted globally by investors like Duan Yongping (“China’s Warren Buffett”). Effective value investors cultivate deep understanding of a company’s economics, culture, product differentiation, and competitive landscape—often built over years and not fully captured on the public internet. That makes value investing a hard test for LLMs and likely hard to automate in the near term.

## Value-Investor Experiment Design

We ran a simple test: prompt each LLM to construct a portfolio with minimal instruction—kept intentionally sparse to avoid biasing the outcome and to surface each model’s own “understanding” of value investing. We evaluated leading models (ChatGPT-5, Claude, Grok, DeepSeek, Qwen), enabling thinking mode and web search to give each its best shot, while disabling personalization/memory to avoid user-specific preferences creeping in.

> 💡 

System Prompt

Suppose you are a value investor. Create a portfolio. Provide:

1. The stock tickers.
1. A brief value rationale for each.
1. A target portfolio allocation (percentages) that sums to 100%.

## Results

The LLMs’ portfolios are as Figure 1. It seems LLMs prefer to select 5-10 stocks, not too much or less. They all use diversity to reduce the risk, where Deepseek is the most centralized, selected only 5 stocks, and ChatGPT 5.1 selected 10 stocks. There is no ratio of a stock surpass 20%.

![Figure 1. portfolio created by different LLMs with web search](images/llm-value-investing-1.png)

*Figure 1. portfolio created by different LLMs with web search*

We found that when web search is open, model’s behavior can be easily impacted by retrieved context, and the selection is pretty random. So we also collected the portfolios when web search is turned off. By turning off the web search the model’s selection is more stable. 

![Figure 2. portfolio created by different LLMs w/o web search](images/llm-value-investing-2.png)

*Figure 2. portfolio created by different LLMs w/o web search*

We also counted the frequency of the selected companies to show the popularity of difference securities. It is shows that when website is turned off, BRK.B is the most popular stock between LLMs as value investors. PFE, JNJ and JPM are also popular among LLMs. When web search is turned on models prefer VZ, which has high divide of 6.71%, or companies like INTC and BABA that has hope to overcome crisis. 

![Figure 2: selected frequency w/o web search of different tickers](images/llm-value-investing-3.png)

*Figure 2: selected frequency w/o web search of different tickers*

![Figure 3: selected frequency with web search on of different tickers](images/llm-value-investing-4.png)

*Figure 3: selected frequency with web search on of different tickers*

To study the similarity between LLMs and humans investors, we also illustrated the masters’ portfolio. Different to LLMs, most of masters’ portfolio is more centralized. The ratio of the biggest two holds usually approach or surpass 50%. From Figure 4, we can see that humans show more interest than LLMs to tech companies, like GOOG and APPL. This may indicates the bias of LLMs that value investors prefer traditional business.  

![Figure 3. Human Masters’ Portfolio as of 11/13/2025.](images/llm-value-investing-5.png)

*Figure 3. Human Masters’ Portfolio as of 11/13/2025. *

![Figure 4. frequency of stocks in human masters’s portfolio.](images/llm-value-investing-6.png)

*Figure 4. frequency of stocks in human masters’s portfolio. *

To quantify how closely LLM-built portfolios resemble those of human investors, we compute **weight-adjusted overlap** (a weighted Jaccard index), as illustrated in Figure 5. This measures the portion of each pair of portfolios that is held in common after accounting for position sizes—useful for assessing similarity, not claiming substitutability.

**Weighted Overlap (0–100%)**

$$
\textbf{Overlap} = \sum_i \min(w^A_i,\; w^B_i)
$$

- We align on the **union of tickers**; missing names get weight 0, and weights are **normalized to 100%**.
- Interpretation: **0%** = no shared exposure; **100%** = identical portfolios.
- When both portfolios sum to 100%, **Overlap = 100% − Active Share**.
- The metric is intuitive and robust even when holdings lists barely overlap.

Figure 5 indicates that LLM portfolios generally exhibit low overlap with those of well-known human value investors (measured by weighted overlap). An exception is DeepSeek, which shows notably high similarity to Li Lu. Grok 4 overlaps 39.3% with Warren Buffett; counting its explicit 20% BRK.B position as part of that common exposure, the effective overlap is roughly ~60%. Notably, all LLMs except Qwen3-Max hold BRK.B, suggesting a tendency—intentional or not—to “copy Warren Buffett’s homework.”

![Figure 5. Overlap between LLMs and humans’ portfolios.](images/llm-value-investing-7.png)

*Figure 5. Overlap between LLMs and humans’ portfolios. *

We asked how much money each model could make in practice, so we back-tested their portfolios using split- and dividend-adjusted prices (total return) with BRK.B and SPY as baselines, assuming buy-and-hold weights and reinvested dividends. Over the last five years (2020-11-12 → 2025-11-14), most models beat SPY—except Qwen3-Max and Claude Sonnet 4.5—with Gemini 2.5 Pro on top, powered by outsized gains in BRK.B and JPM. Over the last ten years (2015-11-12 → 2025-11-14), only Grok 4 beat the market, thanks to long-run compounders AAPL and WMT. These are historical backtests, not guarantees; shifts in start dates, rebalancing, fees/taxes, or data sources can change the rankings.

*Table 1. Compound Annual Growth Rate (CAGR) of model w/o web search. Bold notes it beats the market, and underline notes the best performance. *

| LLM Portfolio | 5-year CAGR (2020-11-12 → 2025-11-14) | 10-year CAGR (2015-11-12 → 2025-11-14) |
|---|---|---|
| ChatGPT 5 | **16.43%** | 11.04% |
| ChatGPT 5.1 | **15.35**% | 12.10% |
| Gemini 2.5 Pro | **19.87%** | 13.09% |
| Grok 4 | **17.47%** | **16.62****%** |
| Deepseek | **15.75%** | 14.34% |
| Qwen3-Max | 15.22% | 12.50% |
| Claude Sonnet 4.5 | 12.16% | 7.86% |
| BRK.B (Baseline) | 17.74% | 14.37% |
| SPY (Baseline) | 15.32% | 14.52% |

By turning on web search for LLMs in Table 2, most of LLMs’ return get decreased. Claude is an exception, since it choses Google when web open. 

*Table 2. Compound Annual Growth Rate (CAGR) of model with web search. Bold notes it beats the market, and underline notes the best performance. *

| LLM Portfolio | 5Y CAGR (2020-11-12 → 2025-11-14) | 10 CAGR (2015-11-12 → 2025-11-14) |
|---|---|---|
| ChatGPT 5 | 11.33% | 11.14% |
| ChatGPT 5.1 | 7.27% | 9.72% |
| Genimi 2.5 Pro | 11.68% | **14.93%** |
| Grok 4 | 9.01% | 3.41% |
| Deepseek | 8.13% | 7.16% |
| Qwen3-Max | 14.03% | 11.41% |
| Claude Sonnet 4.5 | **18.42%** | 13.19% |
| BRK.B (Baseline) | 17.74% | 14.37% |
| SPY (Baseline) | 15.32% | 14.52% |

## Findings

**Grok 4 is like Warren Buffet and Deepseek is like Li Lu **

Usually LLMs selection is very different to humans’. But Grok’s portfilio shows high overlap to Warren Buffet, and Deepseek shows high overlap to Li Lu. It is interesting that Deepseek and Li Lu happen to both come from China. 

**LLMs can be easily influenced by News like human. **

By prompting the LLMs many times, we the patterns of LLM gradually become clear and we can draw some conclusion here. We found LLMs are not consistency to their selections. When we search function is turned off, their output is pretty consistent. But if we turned on web search to them, their selection could be easily impacted by research results, which is pretty similar to small investors. The model even selected two EFT (VTV and BND) without  in Web Search #2. As web search exposure varies, the models’ selection also fluctuates along with the news. This is also a good lesson for human that internet content may distract you and make you choice more arbitrary. 

![Figure 7: ablation study on Deepseek with web search on and off. The selection is more arbitrary when web search is on.](images/llm-value-investing-8.png)

*Figure 7: ablation study on Deepseek with web search on and off. The selection is more arbitrary when web search is on. *

**LLMs prefer diversity to reduce risk**

LLMs rarely put more than 20% money on a single stocks, which is different to the reputable value investors. True value investors usually centralize their invest onto one or two major companies. Centrailization is usually used as an indicator of wether a people truely understand value investing. 

**LLMs do not like Magnificent Seven. **

It is weird that all LLMs do not bat heavily on Magnificent Seven, but prefer to invest on stocks with high divide and low PE. The tech company that LLMs selected like INTC, BABA, GOOGL, are all with low PE for a while. 

> Seems model understanding to value investing is more close to Graham or early stage of Buffett, buying stock with cheep price instead of buying great company with a fair price. 

Overall LLMs could name out the classic principles of value investing, like low PE, strong cash flow, high dividend, undervalued assets. Not they did not consider the factors that are hard to quantify like business modal, culture and product difference. These are something that cannot learned from internet only, and may need years of experience in an sector. This makes LLMs neglect the company like Apple, Nvidia etc. 

## Future Work

This work is and very limited offline and static test to popular LLMs, and did very simple back-test to estimate the return. But historical performance do not represent the future performance, also LLMs could operate the portfolio also in the future. So to better reflect model’s potential, we should conduct some online and live test. 

Furthermore, in this work we used very simple prompt to avoid introduce bias to the model. We in the future, could invest how to prompt model to achieve better performance. 

## Citation

Please cite this work as:

```plain text
Xiao, Liqiang. "Why We Think". Lil'Log (May 2025). https://lilianweng.github.io/posts/2025-05-01-thinking/
```

Or use the BibTex citation:

```plain text
@article{weng2025think,
  title = {Why We Think},
  author = {Weng, Lilian},
  journal = {lilianweng.github.io},
  year = {2025},
  month = {May},
  url = "https://lilianweng.github.io/posts/2025-05-01-thinking/"
}

```

---

## Appendix

### Value Rationale

### ChatGPT 5 (Extended Thinking)

ChatGPT 5.1 (Extended Thinking)
