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
> System Prompt
>
> Suppose you are a value investor. Create a portfolio. Provide:
>
> 1. The stock tickers.
> 1. A brief value rationale for each.
> 1. A target portfolio allocation (percentages) that sums to 100%.

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

```text
Xiao, Liqiang. "Can LLMs Be Good Value Investors?" (Nov 2025). https://lqxiao.github.io/post.html?p=llm-value-investing
```

Or use the BibTex citation:

```text
@misc{xiao2025valueinvestors,
  title        = {Can LLMs Be Good Value Investors?},
  author       = {Xiao, Liqiang},
  year         = {2025},
  month        = nov,
  howpublished = {\url{https://lqxiao.github.io/post.html?p=llm-value-investing}},
  note         = {Blog post}
}

```

---

## Appendix

### Value Rationale

### ChatGPT 5 (Extended Thinking)

| Ticker | Allocation % | Brief value rationale |
|---|---|---|
| **BRK.B** | **20%** | Berkshire is basically a diversified, cash-gushing collection of insurers, BNSF rail, energy assets, and a big public-equity book. After its 2024–25 profit surge, shares are trading around what some analysts call “near intrinsic value,” so you’re not overpaying for quality, and you get Buffett/Abel capital allocation for free. ([Reuters](https://www.reuters.com/markets/us/berkshire-hathaway-shares-rise-new-high-after-record-profit-2025-02-24/?utm_source=chatgpt.com)) |
| **JNJ** | **15%** | AAA-like balance sheet, 60+ years of dividend hikes, and a 2.6–2.8% forward yield while trading at only a mid-teens earnings multiple — classic “defensive value” healthcare. Cash flows are steady and the payout is well covered. ([Yahoo Finance](https://finance.yahoo.com/quote/JNJ/key-statistics/?utm_source=chatgpt.com)) |
| **JPM** | **15%** | Best-in-class U.S. bank, earning through cycles. It’s at ~15× forward earnings despite record profitability and scale advantages; that’s reasonable versus the market for this quality. You also get a healthy dividend and buybacks. ([Yahoo Finance](https://finance.yahoo.com/quote/JPM/?utm_source=chatgpt.com)) |
| **BMY** | **12%** | Big Pharma that the market discounts because of patent overhang, yet it just raised 2025 revenue guidance and is adding to its pipeline via deals — so you’re paying a value multiple for assets the street still needs to re-price. ([bms.com](https://www.bms.com/assets/bms/us/en-us/pdf/investor-info/doc_financials/quarterly_reports/2025/BMY-Q3-2025-Earnings-Press-Release.pdf?utm_source=chatgpt.com)) |
| **GM** | **10%** | Cyclical, yes, but it’s at a single-digit P/E that’s well below auto peers, even after raising profit guidance — i.e. the market still prices in too much risk. Any stabilization in EV spend or tariffs can unlock multiple expansion. ([Yahoo Finance](https://finance.yahoo.com/news/gm-still-bargain-32-8-111153858.html?utm_source=chatgpt.com)) |
| **TGT** | **10%** | Shares are still far under the 2024 high because margins and traffic softened, but analysts’ fair-value estimates sit above the current price and ops are improving — that’s classic “temporary problem, decent franchise” territory. ([Yahoo Finance](https://finance.yahoo.com/news/fresh-look-target-tgt-valuation-211549668.html?utm_source=chatgpt.com)) |
| **GSK** | **10%** | Big, cash-generative pharma with an active buyback, 3–4% dividend yield, and it trades around ~8–9× earnings — cheaper than many U.S. peers despite better near-term growth guidance. That’s straight value. ([GSK](https://www.gsk.com/media/zhfdbsly/q2-2025-results-announcement.pdf?utm_source=chatgpt.com)) |
| **STZ** | **8%** | Branded alcohol name that sold off on softer beer/wine guidance, pushing the multiple down while the franchise (Modelo, Corona, premium wine) is still high-quality. You’re buying a strong brand portfolio at a discounted growth multiple. ([morningstar.com](https://www.morningstar.com/stocks/xnys/stz/quote?utm_source=chatgpt.com)) |

ChatGPT 5.1 (Extended Thinking)

| Ticker | Company | Weight | Brief value rationale (value-investor style) |
|---|---|---|---|
| **BRK.B** | Berkshire Hathaway | **18%** | Diversified “mini index” of quality operating businesses (insurance, rail, utilities, industrials) plus a huge stock portfolio and very large cash pile. Shares trade around **1.5× book value**, a moderate multiple given the quality and diversification. ([ycharts.com](https://ycharts.com/companies/BRK.B/price_to_book_value?utm_source=chatgpt.com)) Long-term investors like Chris Bloomstran estimate intrinsic value not far above current prices, implying “fair to slightly cheap” rather than a bubble. ([barrons.com](https://www.barrons.com/articles/berkshire-intrinsic-value-stock-buffett-69d5ac61?utm_source=chatgpt.com)) Still, it provides a value-style anchor versus today’s very expensive broad market. ([Business Insider](https://www.businessinsider.com/stock-market-crash-imf-risk-disorderly-corrections-valuations-global-economy-2025-10?utm_source=chatgpt.com)) |
| **JPM** | JPMorgan Chase | **10%** | Best-of-breed global bank with strong ROE, conservative underwriting, and leading franchises in investment banking & credit cards. The stock trades on a **P/E ~15–16**, only modestly above its 3- and 5-year averages around 11–12, and at **~2.5× book value** for a very high-quality bank. ([fullratio.com](https://fullratio.com/stocks/nyse-jpm/pe-ratio?utm_source=chatgpt.com)) Not deep-value “cigar butt,” but a high-quality compounder at a reasonable price. |
| **XOM** | Exxon Mobil | **12%** | Integrated oil & gas major generating huge free cash flow (FCF). Recent results show quarterly FCF of **$6.3B** and **$28B+** over the last year, with plans to return large sums via dividends and buybacks. ([ExxonMobil](https://corporate.exxonmobil.com/news/news-releases/2025/1031-exxonmobil-announces-third-quarter-2025-results?utm_source=chatgpt.com)) Current **FCF yield ~4.8%** is above many large caps, and analysts project FCF could grow to about **$44.7B by 2029** as production and refining projects ramp. ([financecharts.com](https://www.financecharts.com/stocks/XOM/value/fcf-yield?utm_source=chatgpt.com)) The market prices in cyclical and energy-transition risks, giving a value investor a decent cash-flow yield and inflation hedge. |
| **PFE** | Pfizer | **10%** | Big pharma whose share price has been crushed post-COVID, despite still-solid cash flows and a strong pipeline. The dividend is **~6.5–7%**, far above both its own 5-year average and the healthcare sector’s typical ~1.7–1.8%. ([Kiplinger](https://www.kiplinger.com/investing/stocks-with-the-highest-dividend-yields-in-the-sandp-500?utm_source=chatgpt.com)) That high yield signals pessimism about future earnings; a value investor is betting that not all of that pessimism is justified. Key risk: payout ratio is currently near 100%, so if earnings disappoint, the dividend could be pressured. ([finance.yahoo.com](https://finance.yahoo.com/quote/PFE.DE/key-statistics/?utm_source=chatgpt.com)) |
| **VZ** | Verizon | **8%** | Mature U.S. telecom with slow growth but strong, relatively predictable cash flows. Verizon has raised its dividend for **19 consecutive years**, and today yields around **6–7%**. ([Verizon](https://www.verizon.com/about/news/verizon-boosts-shareholder-payout-19th-consecutive-year-dividend-growth?utm_source=chatgpt.com)) The market worries about heavy capex and debt; a value investor focuses on stable cash flows covering the dividend and modest growth as 5G investments normalize. |
| **UL** | Unilever (ADR) | **8%** | Global consumer-staples company with strong brands (Dove, Hellmann’s, etc.). On trailing earnings the stock trades in the low-20s P/E, but **forward P/E is in the mid-teens (~17)**, cheaper than many consumer peers and far below AI-driven market darlings. ([wealthyhood.com](https://wealthyhood.com/en/stocks/ul.nyse/?utm_source=chatgpt.com)) This is a classic **“quality at a reasonable price”** idea: defensive, inflation-resistant cash flows, but not priced like a bond proxy anymore. |
| **INTC** | Intel | **8%** | Deep-cyclical semiconductor turn-around. Intel has struggled for years, but big government and strategic partners (SoftBank, Nvidia) are backing its foundry ambitions. SoftBank’s recent **$2B investment at $23/share** came when Intel traded near or **below book value**, implying asset-backed downside protection. ([Tom's Hardware](https://www.tomshardware.com/tech-industry/semiconductors/softbank-to-buy-usd2-billion-in-intel-shares-at-usd23-each-firm-still-owns-majority-share-of-arm?utm_source=chatgpt.com)) Newer analysis notes the stock has since rallied hard and valuation is controversial, but there’s still a case that the market underestimates its long-term manufacturing and foundry optionality compared with price. ([Value Sense Blog](https://blog.valuesense.io/intel-stock-turnaround-undervalued/?utm_source=chatgpt.com)) High risk, but potentially high reward if execution improves. |
| **UPS** | United Parcel Service | **10%** | Global logistics leader hurt by post-COVID volume normalization, Amazon mix changes, labor costs, and restructuring headlines. The stock has traded near **five-year lows** and badly lagged the market. ([Investopedia](https://www.investopedia.com/ups-stock-closes-at-lowest-level-in-nearly-5-years-11703013?utm_source=chatgpt.com)) Yet multiple DCF models suggest UPS is **~30–45% undervalued**, and other analyses highlight a **P/E in the 12–13 range and dividend yield around 6–8%** with management insisting the dividend is covered by projected earnings and FCF. ([Webull](https://www.webull.com/news/13823550574052352?utm_source=chatgpt.com)) Aggressive cost cuts (including major job reductions) aim to restore margins, though customer-concentration and labor-relations risks remain. ([marketwatch.com](https://www.marketwatch.com/story/upss-stock-falls-after-a-revenue-miss-deal-with-largest-customer-to-cut-volume-1984fcb7?utm_source=chatgpt.com)) |
| **BTI** | British American Tobacco | **8%** | “Sin stock” with durable demand, pricing power, and huge cash flows. BTI trades at **under 12× expected 2025 earnings** with a **~5.8–6% dividend yield**, and several analyses call it **significantly undervalued** on a DCF basis (one places fair value ~33% above the current price). ([StockAnalysis](https://stockanalysis.com/stocks/bti/?utm_source=chatgpt.com)) ESG concerns and declining cigarette volumes depress the multiple, but reduced-risk products and ongoing deleveraging support the long-term value case. |
| **BABA** | Alibaba (ADR) | **8%** | Chinese e-commerce + cloud giant that went from market darling to pariah amid regulation and geopolitics, then staged a huge rally. There is **debate** about value: some DCF models show it **~35–40% undervalued**, while others now see it **~20% overvalued** after the rebound. ([Webull](https://www.webull.com/news/13809921653097472?utm_source=chatgpt.com)) On simple metrics, though, its **P/E in the mid-teens (~16–17)** is still well below global peers like Amazon and Microsoft, and it is shrinking share count via sizable buybacks. ([Seeking Alpha](https://seekingalpha.com/article/4823600-alibaba-still-undervalued-90-percent-rally-isnt-end-of-story?utm_source=chatgpt.com)) This position is a classic **“controversy discount”**: you’re paid for taking China/regulatory and governance risk. |

ChatGPT 5.1 (Extended Thinking) #2 

| Ticker | Company (Region) | Allocation | Brief value rationale (value-investor lens) |
|---|---|---|---|
| **BRK.B** | Berkshire Hathaway (US) | **16%** | Acts like a diversified value fund: insurance float, operating businesses, and a huge equity portfolio. Trades around **16× earnings** and roughly **1.6× book** – not “cheap,” but reasonable for a high-quality compounder with strong capital allocation and a history of buying back shares when undervalued. ([finance.yahoo.com](https://finance.yahoo.com/quote/BRK-B/?utm_source=chatgpt.com)) |
| **JPM** | JPMorgan Chase (US) | **10%** | Best-in-class global bank with high ROE and scale advantages. Valued around **15–16× earnings** and about **2.5× book**, a premium to peers but supported by profitability and risk controls – a case of paying a fair price for a superior franchise rather than a cigar-butt bank. ([fullratio.com](https://fullratio.com/stocks/nyse-jpm/pe-ratio?utm_source=chatgpt.com)) |
| **JNJ** | Johnson & Johnson (US) | **11%** | AAA-rated balance sheet, diversified pharma/med-tech, and a 60+ year dividend-growth record. Current dividend yield is roughly **2.6–2.8%**, with mid-single-digit dividend growth and relatively low payout ratio – classic “quality at a reasonable price” defensive holding. ([finance.yahoo.com](https://finance.yahoo.com/quote/JNJ/key-statistics/?utm_source=chatgpt.com)) |
| **PG** | Procter & Gamble (US) | **9%** | Owner of staple brands in categories like home and personal care, with strong pricing power. Dividend yield is ~**2.7–2.9%** and has grown for decades, with a payout ratio around 60%; valuation is not deep value, but stable cash flows and brand moat fit a conservative value style. ([finance.yahoo.com](https://finance.yahoo.com/quote/PG/key-statistics/?utm_source=chatgpt.com)) |
| **XOM** | Exxon Mobil (US) | **10%** | Integrated oil & gas major with disciplined capital allocation and long dividend record (over 40 years of increases). Currently yields about **3.3–3.5%**, with a low beta and projects like the Golden Pass LNG terminal expected to add billions in earnings as global LNG demand grows – cyclical but supported by assets and cash flow. ([macrotrends.net](https://www.macrotrends.net/stocks/charts/XOM/exxon/dividend-yield-history?utm_source=chatgpt.com)) |
| **JPM** | (already above) |  |  |
| **INTC** | Intel (US) | **6%** | Turnaround / contrarian semi pick. Still far below prior highs, with investors worried about execution, but now cutting costs, monetizing non-core assets (e.g., sale of a majority Altera stake), and partnering with Nvidia while receiving government support. Recent guidance and restructuring reflect a push to restore margins; if foundry and AI strategy work, current price could understate normalized earnings power. ([LinkedIn](https://www.linkedin.com/pulse/intel-q3-2025-financial-results-driving-ai-foundry-leadership-amjad-npnmf?utm_source=chatgpt.com)) |
| **BMY** | Bristol-Myers Squibb (US) | **6%** | Big pharma priced pessimistically due to patent-cliff fears. Trades around **16× trailing earnings** with a **~5% dividend yield**, near 52-week lows, and commentary from value-oriented analysts calling it “too cheap” versus its pipeline and cash flows (forward P/E estimated nearer single digits). Classic case of sentiment overhang vs underlying cash generation. ([fullratio.com](https://fullratio.com/stocks/nyse-bmy/pe-ratio?utm_source=chatgpt.com)) |
| **7203.T** | Toyota Motor (Japan) | **8%** | Global auto leader with strong balance sheet and conservative culture. Trades at roughly **9× earnings** and about **1.1× book**, cheaper than many global auto peers despite leadership in hybrids and scale in manufacturing. This is more of a cyclical value name, but backed by a solid franchise and technology edge. ([Investing.com](https://www.investing.com/equities/toyota-motor-corporation?utm_source=chatgpt.com)) |
| **005930.KS** | Samsung Electronics (Korea) | **8%** | Dominant in memory chips and a key player in smartphones and displays. Forward P/E around **11×**, below sector averages (~14×), with P/B under 2× – reasonable for a tech firm with strong net cash and cyclical earnings that tend to normalize higher in memory upcycles. ([finance.yahoo.com](https://finance.yahoo.com/quote/005930.KS/key-statistics/?utm_source=chatgpt.com)) |
| **NESN.SW** | Nestlé (Switzerland) | **9%** | Global consumer-staples giant with broad product and geographic diversification. Trades near **20× earnings** with a **~3.7–3.9% dividend yield**, supported by decades of uninterrupted dividends and steady, if modest, growth – a “bond-like” value anchor for a defensive sleeve. ([finance.yahoo.com](https://finance.yahoo.com/quote/NESN.SW/?utm_source=chatgpt.com)) |
| **UL** | Unilever ADR (UK / Global) | **7%** | Household-brands powerhouse with exposure to emerging markets. Currently yields about **3.3–3.4%**, around or above its long-term median, and generates strong free cash flow despite FX and growth headwinds. Valuation (~**19–20× normalized earnings**) is lower than many branded-goods peers, giving some margin of safety if management’s efficiency and portfolio moves succeed. ([morningstar.com](https://www.morningstar.com/stocks/xnys/ul/quote?utm_source=chatgpt.com) |

### Claude Sonnet 4.5 (Extended Thinking + Web Search Open)

| **Stock Ticker** | **Allocation %** | **Value Rationale** |
|---|---|---|
| BRK.B | 20% | Trades below book value with diverse holdings, strong cash generation, and Warren Buffett's disciplined capital allocation. Essentially buying a diversified portfolio of undervalued businesses at a discount. |
| BAC | 15% | Trading below tangible book value with improving profitability from higher interest rates. Strong deposit franchise and capital return program. |
| BABA | 10% | Dramatically undervalued due to China concerns; trading at single-digit P/E with strong free cash flow generation and dominant e-commerce/cloud position. |
| C | 10% | Persistent discount to book value and peers; ongoing restructuring should unlock value. Strong capital returns planned. |
| GOOGL | 15% | Reasonable valuation for a dominant franchise; strong moat in search, robust free cash flow, and undermonetized assets (YouTube, Cloud). |
| ET | 10% | High dividend yield (~8-9%) with stable cash flows from midstream energy infrastructure. Trading at attractive multiples to distributable cash flow. |
| GM | 8% | Low P/E despite strong profitability; significant EV investments not reflected in valuation. Share buybacks enhance returns. |
| PFE | 7% | Oversold post-COVID; high dividend yield, strong pipeline, and trading well below historical averages despite solid fundamentals. |
| CVS | 5% | Integrated healthcare model undervalued; trading at distressed multiples despite stable cash flows and cost synergy opportunities. |

### Qwen3-Max (Thinking + Search)

| Stock Ticker | Allocation (%) | Value Rationale |
|---|---|---|
| JNJ | 15% | High-quality company with wide economic moat, stable healthcare business, consistent dividend growth, and attractive valuation relative to intrinsic value |
| CSCO | 12% | Trading at compelling valuation with strong cash flow generation, dominant market position in networking infrastructure, and generous dividend yield providing downside protection |
| CVX | 12% | Energy giant with significant free cash flow generation, attractive dividend yield above 4%, trading at low P/E ratio relative to long-term earnings power |
| TM | 10% | World-class automotive manufacturer with superior operational efficiency, strong balance sheet, consistent profitability through cycles, trading at significant discount to domestic competitors |
| SCHW | 10% | Dominant player in growing wealth management industry with scalable business model, strong competitive advantages in low-cost brokerage, trading below historical valuation multiples |
| IBM | 10% | Legacy technology company undergoing strategic transformation with focus on hybrid cloud and AI, attractive dividend yield above 4%, strong cash flow generation, trading at significant discount to intrinsic value |
| O | 10% | Monthly dividend-paying REIT with fortress balance sheet, long-term net lease contracts providing stable cash flows, trading at attractive valuation relative to dividend growth trajectory |
| LOW | 10% | Home improvement retailer with strong competitive positioning, trading at compelling P/E ratio below 15, robust free cash flow generation, significant share repurchases at depressed valuations |
| EMN | 6% | Specialty materials company with pricing power in niche markets, trading at deep value with high dividend yield above 5%, strong cash conversion capabilities, significant upside potential as cyclical headwinds subside |
| QCOM | 5% | Semiconductor leader in mobile technology with dominant patent portfolio, trading at attractive valuation relative to earnings power, strong dividend growth trajectory, exposure to multiple growth vectors beyond smartphones |

### DeepSeek (Thinking + Search)

|  |  |  |
|---|---|---|
| Stock Ticker | Allocation (%) | Value Rationale |
| **BRK.B** | 25% | Highest conviction; acts as a diversified foundation for the portfolio. |
| **JPM** | 20% | Significant allocation to the financial sector and a high-conviction pick. |
| **JNJ** | 20% | Core defensive holding for stability and consistent income. |
| **GOOGL** | 20% | A "value-growth" hybrid; large allocation due to its immense competitive advantage and cash flow. |
| **ENB** | 15% | Income-oriented play; slightly smaller allocation due to sector-specific risks (regulation, pipelines). |

### Grok 4 

| Stock | Allocation (%) | Value Rationale |
|---|---|---|
| VZ | 20 | VZ (Verizon Communications): Telecom giant trading at a low forward P/E of around 9 with a high dividend yield of 6.5%; undervalued by up to 68% based on discounted cash flow models, supported by stable recurring revenue from wireless services despite competitive pressures. |
| MO | 15 | MO (Altria Group): Defensive tobacco stock with strong pricing power to offset declining cigarette volumes; trades at a P/E of 10.29 (below industry average of 13.53) and offers a high yield of 7.5%, making it undervalued despite long-term growth risks. |
| PFE | 20 | **PFE (Pfizer)**: Pharmaceutical leader with 14.7% revenue growth, robust free cash flow of $12.4B, and a 10.6% ROIC; trading below intrinsic value of $39.3, positioned for gains from healthcare innovation and demographic trends. |
| INTC | 15 | **INTC (Intel)**: Semiconductor firm in recovery mode with pivot to AI and advanced manufacturing; undervalued with intrinsic value of $74.5 against market cap implying moderate upside amid negative cash flows turning positive. |
| CMCSA | 15 | **CMCSA (Comcast)**: Media and communications company with the lowest trailing P/E of 4.46 among top undervalued S&P 500 stocks; discounted due to sector headwinds but backed by strong balance sheet and free cash flow. |
| DVN | 15 | **DVN (Devon Energy)**: Energy producer focused on oil and gas with a low trailing P/E of 7.27; undervalued relative to earnings potential in a recovering energy market with solid fundamentals. |

### Thinking Chains 

**ChatGPT-5 (extended thinking)**

**ChatGPT-5.1 (extended thinking)**

ChatGPT likes high divide, low PE or undervalued stocks (like BABA).  

**Thinking Chain of Claude 4.5 **

Claude 4.5 buy cheep stock, but also look into the future like GOOGLE

**Thinking Chain of Deepseek**

Refuse to do recommendation. When enforced, listed some stocks “like Berkshire, JPMorgan, and Johnson & Johnson that are typically analyzed by value investors. ”

**Thinking Chain of Qwen3-Max**

Focus on Low PE and high divide.

**Tinking Chain of Grok 4**

Focus on under-valued and browsed more websites.

### Similarity between LLMs and Human Investors 

|  |  |  |  |  |  |
|---|---|---|---|---|---|
| **LLM** | **Human** | **Overlap_%** | **ActiveShare_%** | **Cosine** | **Spearman** |
| **ChatGPT5** | Warren Buffett (BRK, 2025 Q2) | 1.11 | 98.89 | 0.005 | -0.883 |
| **ChatGPT5** | Duan Yongping (H&H, 2025 Q2) | 14.24 | 85.76 | 0.119 | -0.541 |
| **ChatGPT5** | Li Lu (Himalaya, 2025 Q3) | 13.97 | 86.03 | 0.188 | -0.646 |
| **ChatGPT5** | Mohnish Pabrai (Dalal, 2025 Q2) | 0.0 | 100.0 | 0.0 | -0.844 |
| **ChatGPT5** | Bill Ackman (Pershing, 2025 Q2) | 0.0 | 100.0 | 0.0 | -0.85 |
| **ChatGPT5** | Michael Burry (Scion, 2025 Q3) | 0.0 | 100.0 | 0.0 | -0.821 |
| **ChatGPT5** | Seth Klarman (Baupost, 2025 Q2) | 0.0 | 100.0 | 0.0 | -0.856 |
| **ChatGPT 5.1** | Warren Buffett (BRK, 2025 Q2) | 0.0 | 100.0 | 0.0 | -0.868 |
| **ChatGPT 5.1** | Duan Yongping (H&H, 2025 Q2) | 17.92 | 82.08 | 0.133 | -0.503 |
| **ChatGPT 5.1** | Li Lu (Himalaya, 2025 Q3) | 13.97 | 86.03 | 0.189 | -0.663 |
| **ChatGPT 5.1** | Mohnish Pabrai (Dalal, 2025 Q2) | 0.0 | 100.0 | 0.0 | -0.831 |
| **ChatGPT 5.1** | Bill Ackman (Pershing, 2025 Q2) | 0.0 | 100.0 | 0.0 | -0.865 |
| **ChatGPT 5.1** | Michael Burry (Scion, 2025 Q3) | 0.0 | 100.0 | 0.0 | -0.801 |
| **ChatGPT 5.1** | Seth Klarman (Baupost, 2025 Q2) | 0.0 | 100.0 | 0.0 | -0.867 |
| **Claude Sonnet 4.5** | Warren Buffett (BRK, 2025 Q2) | 14.52 | 85.48 | 0.137 | -0.628 |
| **Claude Sonnet 4.5** | Duan Yongping (H&H, 2025 Q2) | 17.92 | 82.08 | 0.138 | -0.42 |
| **Claude Sonnet 4.5** | Li Lu (Himalaya, 2025 Q3) | 43.97 | 56.03 | 0.564 | -0.067 |
| **Claude Sonnet 4.5** | Mohnish Pabrai (Dalal, 2025 Q2) | 0.0 | 100.0 | 0.0 | -0.83 |
| **Claude Sonnet 4.5** | Bill Ackman (Pershing, 2025 Q2) | 6.88 | 93.12 | 0.08 | -0.751 |
| **Claude Sonnet 4.5** | Michael Burry (Scion, 2025 Q3) | 0.0 | 100.0 | 0.0 | -0.802 |
| **Claude Sonnet 4.5** | Seth Klarman (Baupost, 2025 Q2) | 0.0 | 100.0 | 0.0 | -0.86 |
| **Qwen3-Max** | Warren Buffett (BRK, 2025 Q2) | 8.86 | 91.14 | 0.073 | -0.694 |
| **Qwen3-Max** | Duan Yongping (H&H, 2025 Q2) | 0.0 | 100.0 | 0.0 | -0.866 |
| **Qwen3-Max** | Li Lu (Himalaya, 2025 Q3) | 0.0 | 100.0 | 0.0 | -0.866 |
| **Qwen3-Max** | Mohnish Pabrai (Dalal, 2025 Q2) | 0.0 | 100.0 | 0.0 | -0.828 |
| **Qwen3-Max** | Bill Ackman (Pershing, 2025 Q2) | 0.0 | 100.0 | 0.0 | -0.864 |
| **Qwen3-Max** | Michael Burry (Scion, 2025 Q3) | 0.0 | 100.0 | 0.0 | -0.799 |
| **Qwen3-Max** | Seth Klarman (Baupost, 2025 Q2) | 0.0 | 100.0 | 0.0 | -0.866 |
| **DeepSeek** | Warren Buffett (BRK, 2025 Q2) | 0.0 | 100.0 | 0.0 | -0.831 |
| **DeepSeek** | Duan Yongping (H&H, 2025 Q2) | 14.24 | 85.76 | 0.121 | -0.419 |
| **DeepSeek** | Li Lu (Himalaya, 2025 Q3) | 33.11 | 66.89 | 0.401 | -0.214 |
| **DeepSeek** | Mohnish Pabrai (Dalal, 2025 Q2) | 0.0 | 100.0 | 0.0 | -0.874 |
| **DeepSeek** | Bill Ackman (Pershing, 2025 Q2) | 6.88 | 93.12 | 0.085 | -0.712 |
| **DeepSeek** | Michael Burry (Scion, 2025 Q3) | 0.0 | 100.0 | 0.0 | -0.874 |
| **DeepSeek** | Seth Klarman (Baupost, 2025 Q2) | 0.0 | 100.0 | 0.0 | -0.816 |
| **Grok 4** | Warren Buffett (BRK, 2025 Q2) | 0.0 | 100.0 | 0.0 | -0.854 |
| **Grok 4** | Duan Yongping (H&H, 2025 Q2) | 0.0 | 100.0 | 0.0 | -0.842 |
| **Grok 4** | Li Lu (Himalaya, 2025 Q3) | 0.0 | 100.0 | 0.0 | -0.853 |
| **Grok 4** | Mohnish Pabrai (Dalal, 2025 Q2) | 0.0 | 100.0 | 0.0 | -0.882 |
| **Grok 4** | Bill Ackman (Pershing, 2025 Q2) | 0.0 | 100.0 | 0.0 | -0.83 |
| **Grok 4** | Michael Burry (Scion, 2025 Q3) | 0.0 | 100.0 | 0.0 | -0.877 |
| **Grok 4** | Seth Klarman (Baupost, 2025 Q2) | 0.0 | 100.0 | 0.0 | -0.842 |

### Heat between LLMs with Web search and humans

![figure](images/llm-value-investing-9.png)
