# CFA Program — Level II Curriculum Reference (2026 and 2027 cycles)

> **As of:** 2026-10-22
> **Primary sources:** CFA Institute *2026 Level II Topic Outlines* and *2027 Level II Topic Outlines* (official PDFs, from which the LM titles and LOs below are taken), plus the CFA Institute Level II exam page. See **Sources**.
> **Bottom line:** The 2027 Level II curriculum is **identical to 2026 except Ethics**, which is split into one LM per Standard. Three topics were also renamed. 2026 is itself unchanged from 2025 at the LM level; one Machine Learning LO was removed.

---

## 1. Exam structure (verified on the CFA Institute Level II page)

| Item | Detail |
|---|---|
| Format | **Item sets**: a vignette (case) followed by **4 MCQs**, each with 3 options (A/B/C) |
| Number | **22 item sets = 88 questions**. **20 sets are scored**; **2 are unscored trial sets** |
| Sessions | **2 sessions × 2h12m (132 min)**, **11 item sets per session**, optional break; 4h24m total |
| Pace | About 3 minutes per question, or 12 minutes per item set |
| Scoring | All questions equal weight; **no penalty for wrong answers** |
| Topic placement | Topics are placed randomly across both sessions. Each item set usually tests one topic, often several LMs within it. |
| Windows | Several windows per year. Historically May, Aug and Nov; confirm the current calendar on CFA Institute Dates & Fees. |
| PSM | One PSM must be completed at Level II to receive your result, and it must differ from the Level I PSM |
| Study time | 300+ hours (CFA Institute). Most candidates report 325–400h, since L2 is widely seen as the most technical level. |

---

## 2. Topic weights (unchanged 2023 → 2027)

| Topic (2026 name) | 2027 name | Weight |
|---|---|---|
| Ethical and Professional Standards | same | 10–15% |
| Quantitative Methods | same | 5–10% |
| Economics | same | 5–10% |
| Financial Statement Analysis | same | 10–15% |
| Corporate Issuers | **Corporate Finance** | 5–10% |
| Equity Valuation | **Equities** | 10–15% |
| Fixed Income | same | 10–15% |
| Derivatives | **Derivatives and Risk Management** (exam page name; the outline header says "Derivatives") | 5–10% |
| Alternative Investments | same | 5–10% |
| Portfolio Management | **Portfolio Construction** | 10–15% |

With 20 scored item sets, a 10–15% topic works out to about **2–3 item sets** and a 5–10% topic to about **1–2 item sets**.

### LM counts

| Topic | 2026 | 2027 |
|---|---|---|
| Quantitative Methods | 7 | 7 |
| Economics | 2 | 2 |
| FSA | 6 | 6 |
| Corporate Issuers/Finance | 4 | 4 |
| Equity Valuation/Equities | 6 | 6 |
| Fixed Income | 5 | 5 |
| Derivatives | 2 | 2 |
| Alternative Investments | 4 | 4 |
| Portfolio Mgmt/Construction | 6 | 6 |
| Ethics | 3 | **9** |
| **Total** | **45** | **51** |

---

## 3. Topic-by-topic LMs, LO themes and key formulas

### 3.1 Quantitative Methods (5–10%)

| # | LM | Key LO themes | Key formulas |
|---|---|---|---|
| 1 | Basics of Multiple Regression and Underlying Assumptions | Uses of multiple regression; formulating the model; interpreting partial slope coefficients; assumptions (linearity, homoskedasticity, independence of errors, normality, independence of X's); residual plots | Yi = b0 + b1X1i + … + bkXki + εi |
| 2 | Evaluating Regression Model Fit and Interpreting Model Results | ANOVA; R² vs adjusted R²; AIC/BIC; joint hypothesis tests (F-test, restricted vs unrestricted models); predicted values | Adj R² = 1 − [(n − 1)/(n − k − 1)](1 − R²); F = (SSR/k)/(SSE/(n − k − 1)); nested F = [(SSE_R − SSE_U)/q]/[SSE_U/(n − k − 1)]; AIC = n·ln(SSE/n) + 2(k + 1); BIC = n·ln(SSE/n) + ln(n)(k + 1); t = (b̂j − Bj)/s_b̂j, df = n − k − 1 |
| 3 | Model Misspecification | Functional form misspecification (omitted variables, inappropriate form, inappropriate scaling or pooling); **heteroskedasticity** (unconditional vs conditional; Breusch–Pagan; robust/White SEs); **serial correlation** (DW, Breusch–Godfrey; Newey–West SEs); **multicollinearity** (VIF) | BP = n·R²_resid ~ χ²(k); DW ≈ 2(1 − r); VIF_j = 1/(1 − R²_j) (VIF > 5 is a concern, > 10 serious) |
| 4 | Extensions of Multiple Regression | Influence analysis (leverage, studentized residuals, Cook's D); dummy variables (intercept and slope dummies); **logistic regression** (log-odds, MLE, likelihood-ratio test, pseudo-R²) | Leverage h_ii > 3(k + 1)/n is influential; \|studentized residual\| > t critical; Cook's D_i > 2√(k/n) (or > 1) is influential; ln[p/(1 − p)] = b0 + b1X1 + …; p = 1/(1 + e^−(b0 + Σ bX)); LR = −2(lnL_restricted − lnL_unrestricted) |
| 5 | Time-Series Analysis | Linear and log-linear trends; covariance stationarity; AR(p) models and forecasts; residual autocorrelation tests; mean reversion; in- vs out-of-sample RMSE; coefficient instability; random walks; unit roots (Dickey–Fuller); first-differencing; seasonality (seasonal lag); ARCH; cointegration (Engle–Granger) | Linear trend y_t = b0 + b1t; log-linear ln y_t = b0 + b1t; AR(1) x_t = b0 + b1x_{t−1} + ε; mean-reverting level = b0/(1 − b1); autocorrelation t = ρ̂_k/(1/√T); RMSE = √[Σ(actual − forecast)²/n]; random walk x_t = x_{t−1} + ε (b1 = 1, unit root); DF test: Δx_t = b0 + g1x_{t−1} + ε, H0: g1 = 0; ARCH(1): ε̂²_t = a0 + a1ε̂²_{t−1} + u_t |
| 6 | Machine Learning | Supervised vs unsupervised vs deep learning; overfitting (bias–variance, cross-validation, k-fold, regularization); supervised algorithms — penalized regression (LASSO), SVM, KNN, CART, ensembles (bagging, boosting), random forest; unsupervised — PCA, k-means, hierarchical clustering. (2026 removed the LO on neural nets, deep-learning nets and reinforcement learning.) | Total error = bias² + variance + noise; LASSO minimizes SSE + λΣ\|b_k\| |
| 7 | Big Data Projects | Steps (conceptualization, data collection, preparation/wrangling, exploration, model training); structured vs text data (tokenization, stemming/lemmatization, BOW, n-grams, TF-IDF); feature engineering and selection; evaluating fit (confusion matrix, precision, recall, accuracy, F1, ROC/AUC, RMSE); tuning | Precision = TP/(TP + FP); Recall = TP/(TP + FN); Accuracy = (TP + TN)/N; F1 = 2PR/(P + R); FPR = FP/(FP + TN); TF = term count/total terms; IDF = ln(N docs/docs containing term); normalization (X − X_min)/(X_max − X_min); standardization (X − μ)/σ |

**Typical difficulties:**
- Reading regression output tables (ANOVA, t-stats, F).
- Diagnosing which misspecification is present and its consequences.
- Unit-root logic.
- Choosing a time-series model.
- ML algorithm selection.
- Confusion-matrix metrics.

---

### 3.2 Economics (5–10%)

| # | LM | Key LO themes | Key formulas |
|---|---|---|---|
| 1 | Currency Exchange Rates: Understanding Equilibrium Value | Bid–offer spreads and dealer quotes; triangular arbitrage; forward premium/discount; **mark-to-market of forwards**; international parity conditions (covered/uncovered IRP, forward-rate parity, PPP — absolute and relative, international Fisher effect, real IRP) and how they connect; forecasting spot rates; long-run fair value (PPP, macro balance, external sustainability); **carry trade**; BoP flows; Mundell–Fleming and monetary/fiscal effects; intervention and capital controls; currency-crisis warning signs | Cross bid (A/C) = bid(A/B) × bid(B/C) (invert and swap bid/offer when needed); F(p/b) = S(p/b)·(1 + i_p·τ)/(1 + i_b·τ); forward points = F − S; MTM of forward = (F_t − F_0) × notional/(1 + i_p·τ_remaining) (sign depends on position, using the bid/offer to offset); UIP: E[%ΔS(p/b)] = i_p − i_b; relative PPP: %ΔS(p/b) ≈ π_p − π_b; Fisher: i = r + π^e; international Fisher: i_p − i_b = π^e_p − π^e_b; carry-trade return ≈ i_high − i_low − %Δ(high-yield currency depreciation) |
| 2 | Economic Growth | Growth factors in developed vs developing economies; equity appreciation vs GDP growth; potential GDP for investors; capital deepening vs technological progress; **growth accounting**; natural resources; demographics and labour; physical, human and technological capital; classical, neoclassical (Solow) and endogenous growth; convergence (absolute, conditional, club); government incentives for R&D; removing trade barriers | Cobb–Douglas Y = A·K^α·L^(1−α); growth accounting %ΔY = %ΔA + α%ΔK + (1 − α)%ΔL; labour-productivity approach: potential GDP growth = labour force growth + labour productivity growth; Solow steady state: g* = θ/(1 − α) (per capita), G* = θ/(1 − α) + n; equity: P = GDP × (E/GDP) × (P/E), so %ΔP ≈ %ΔGDP + %Δ(E/GDP) + %Δ(P/E) |

**Typical difficulties:**
- Bid/offer cross-rate mechanics.
- Forward MTM direction.
- Remembering which parity conditions hold in the short vs long run.
- Growth theory distinctions.

---

### 3.3 Financial Statement Analysis (10–15%)

| # | LM | Key LO themes | Key formulas and rules |
|---|---|---|---|
| 1 | Intercorporate Investments | IFRS 9 financial assets (amortized cost, FVOCI, FVPL); associates (equity method, 20–50%); joint ventures; business combinations (acquisition method; full vs partial goodwill; NCI); SPEs/VIEs and consolidation; IFRS vs US GAAP; ratio effects of each method | Equity method: Investment_t = Investment_{t−1} + share of NI − dividends received − amortization of excess purchase price; goodwill (full, IFRS/US GAAP) = FV of whole subsidiary − FV of identifiable net assets; partial goodwill (IFRS option) = purchase price − %acquired × FV of net assets; NCI = % × FV of sub (full) or % × FV of identifiable net assets (partial). Consolidation increases revenue and assets, so margins and ROA differ from the equity method; NI is the same. |
| 2 | Employee Compensation: Post-Employment and Share-Based | Compensation types; share-based comp (stock grants, options at grant-date FV, vesting, expense recognition); forecasting SBC expense and dilution; DB pension effects on statements (IFRS vs US GAAP); modelling and valuation for pensions (funded status as debt-like) | Funded status = FV plan assets − PBO; PBO_end = PBO_beg + service cost + interest cost + actuarial losses − benefits paid (± plan amendments); plan assets_end = beg + actual return + contributions − benefits paid; IFRS P&L = service cost + net interest (discount rate × net DB liability) with remeasurements in OCI; US GAAP P&L = service + interest − expected return + amortization of prior service cost and actuarial losses; total periodic pension cost = employer contributions − Δfunded status |
| 3 | Multinational Operations | Presentation, functional and local currency; transaction exposure gains/losses; **current rate method** (functional currency = foreign; CTA in equity) vs **temporal method** (functional = parent's; remeasurement G/L in P&L); choosing the method; translation effects on ratios; hyperinflation (IFRS restate for inflation; US GAAP temporal method when cumulative 3-yr inflation > 100%); multinational effective tax rate; organic vs FX-driven sales growth | Current rate: all assets and liabilities at the current rate; equity at historical; IS at average. Temporal: monetary items at the current rate; non-monetary at historical; COGS and depreciation at historical. Exposure under current rate = net assets; under temporal = net monetary assets (liabilities). Pure ratios (e.g., current ratio) are unchanged under the current rate method. |
| 4 | Analysis of Financial Institutions | Differences from non-financials (systemic importance, regulation, assets mostly financial); Basel III (capital, liquidity, leverage); **CAMELS**; bank analysis; other factors (government support, mission, corporate culture, competition, off-balance-sheet, segments, currency, risk factors, Basel disclosures); insurers (P&C vs life; combined ratio; investment returns; liquidity; capital) | Basel III: CET1 ≥ 4.5% RWA, Tier 1 ≥ 6%, Total capital ≥ 8% (+2.5% conservation buffer); LCR = HQLA/30-day net cash outflows ≥ 100%; NSFR = available stable funding/required stable funding ≥ 100%; NIM = net interest income/avg interest-earning assets; P&C combined ratio = loss & LAE ratio + underwriting expense ratio (> 100% means underwriting loss); loan-loss reserve/NPLs |
| 5 | Evaluating Quality of Financial Reports | Conceptual framework (GAAP-compliant? decision-useful? earnings sustainable? adequate level?); potential problems (revenue and expense recognition, BS items, CF classification); evaluation steps; earnings quality indicators; sustainable earnings; **mean reversion and accruals**; cash flow quality; BS quality; sources of risk information; bankruptcy prediction | **Beneish M-score** (8 variables: DSRI, GMI, AQI, SGI, DEPI, SGAI, LVGI, TATA; M > −1.78 suggests manipulation); Altman Z = 1.2A + 1.4B + 3.3C + 0.6D + 1.0E (A = WC/TA, B = RE/TA, C = EBIT/TA, D = MV equity/BV liabilities, E = sales/TA); earnings = cash component + accruals component; aggregate accruals = NOA_end − NOA_beg; balance-sheet accruals ratio = ΔNOA/avg NOA; cash-flow accruals ratio = [NI − (CFO + CFI)]/avg NOA |
| 6 | Integration of Financial Statement Analysis Techniques | Analysis framework for a purpose (e.g., valuing equity on comparables, critiquing a credit rating, leverage, MD&A); reporting choices and biases; adjustments for comparability (IFRS/GAAP, inventory, leases, pensions, goodwill); impact of changes in standards; BS modifications, earnings normalization, CFS modifications | Extended DuPont: ROE = (NI/EBT)(EBT/EBIT)(EBIT/Rev)(Rev/Assets)(Assets/Equity); separating equity-method income from ROE; accruals; segment ROA = segment EBIT/segment assets; capex/depreciation |

**Typical difficulties:**
- **Currency translation** (temporal vs current rate) item sets.
- Pension mechanics and IFRS vs GAAP placement (P&L vs OCI).
- Acquisition-method goodwill and NCI.
- Equity-method vs consolidation ratio effects.
- Long, data-heavy vignettes.

---

### 3.4 Corporate Issuers (2026) / Corporate Finance (2027) (5–10%)

| # | LM | Key LO themes | Key formulas |
|---|---|---|---|
| 1 | Analysis of Dividends and Share Repurchases | Effects of cash, extra, liquidating and stock dividends, splits and reverse splits; dividend theories (MM irrelevance, bird-in-hand, tax-preference); signalling; agency costs; factors affecting policy; tax systems (double, imputation, split-rate); stable dividend vs constant payout (Lintner); payout trends; repurchase methods (open market, fixed price tender, Dutch auction, direct negotiation); EPS and BVPS effects; dividends vs buybacks; dividend coverage; sustainability | Double taxation ETR = CT + (1 − CT)·TD; split-rate ETR = CT_D + (1 − CT_D)·TD; imputation ETR = shareholder's marginal rate; expected Δdividend = (target payout × E_new − D_prev) × adjustment factor; post-buyback EPS = (NI − after-tax cost of funds)/(shares after buyback); repurchase raises EPS if earnings yield E/P > after-tax cost of debt; BVPS after = (BV − buyback amount)/remaining shares (falls if P > BVPS); dividend coverage = NI/dividends; FCFE coverage = FCFE/(div + buybacks) |
| 2 | Environmental, Social, and Governance (ESG) Considerations in Investment Analysis | Global ownership structures (dispersed, concentrated, horizontal/vertical, dual-class) and governance effects; evaluating governance (board composition, independence, committees, compensation, shareholder rights); identifying and evaluating ESG risks and opportunities (materiality, SASB, adjusting forecasts or discount rates) | — |
| 3 | Cost of Capital: Advanced Topics | Top-down (macro, capital availability, market conditions, legal and tax) and bottom-up factors (revenue/earnings/cash flow volatility, asset nature, leverage, security features); cost of debt (YTM, debt rating, synthetic rating, bank debt); **ERP** (historical vs forward-looking: GGM, macro/supply-side, survey); required return on equity (CAPM, multifactor/FF, build-up, bond yield plus risk premium); public vs private companies; country risk; peer comparison | GGM ERP = D1/P0 + g − r_LT; macro (Ibbotson–Chen) ERP = {[1 + E(infl)][1 + E(rEg)][1 + E(PEg)] − 1 + E(Y)} − E(RF); CAPM; build-up: r = Rf + ERP + size premium + specific-company premium (± industry); bond yield plus RP: r_e = YTM_LT debt + RP; country risk premium = sovereign spread × σ_equity/σ_sovereign bond; unlevered β_A = β_E/[1 + (1 − t)D/E]; relevered β_E = β_A[1 + (1 − t)D/E]; Blume adjusted β = ⅔β_raw + ⅓(1.0) |
| 4 | Corporate Restructuring | Types (investment actions: equity investments, JVs, acquisitions; divestment: sales, spin-offs; restructuring: cost and balance-sheet) and motivations; initial evaluation; valuation (comparable companies, comparable transactions, DCF, premiums paid); effects on EPS, net debt/EBITDA and WACC; evaluating actions | Pro forma EPS = (NI_A + NI_T − after-tax financing cost + synergies)/new shares (accretive or dilutive); acquisition premium = (offer price − pre-deal price)/pre-deal price; net debt/EBITDA; takeover premium; synergies NPV |

---

### 3.5 Equity Valuation (2026) / Equities (2027) (10–15%)

| # | LM | Key LO themes | Key formulas |
|---|---|---|---|
| 1 | Equity Valuation: Applications and Processes | Valuation and intrinsic value; sources of mispricing (alpha = (V − P)/P components); going concern vs liquidation value; definitions of value (intrinsic, fair market, investment, fair value); applications; industry analysis questions; absolute vs relative models; **sum-of-the-parts**, conglomerate discount; choosing a model | IV − P = (IV − TV) + (TV − P) (mispricing = estimation error + true mispricing) |
| 2 | Discounted Dividend Valuation | Dividends vs FCF vs RI as inputs; DDM single and multi-period; **Gordon growth**; preferred; implied g; **PVGO**; justified P/E; required return from DDM; growth phases; **two-stage, H-model, three-stage**; terminal value; spreadsheet modelling; **sustainable growth** and DuPont | V0 = D1/(r − g); implied r = D1/P0 + g; V0 = E1/r + PVGO; leading P0/E1 = 1/r + PVGO/E1 (the first term is the no-growth P/E); justified leading P/E = (1 − b)/(r − g); trailing = (1 − b)(1 + g)/(r − g); **H-model**: V0 = D0(1 + g_L)/(r − g_L) + D0·H·(g_S − g_L)/(r − g_L), with H = half-life of high-growth period; H-model r = (D0/P0)[(1 + g_L) + H(g_S − g_L)] + g_L; SGR g = b × ROE; ROE = (NI/Sales)(Sales/TA)(TA/Equity) |
| 3 | Free Cash Flow Valuation | FCFF vs FCFE; ownership perspective of FCFE; computing FCFF and FCFE from NI, EBIT, EBITDA and CFO; forecasting; effect of dividends, buybacks, issuance and leverage changes; FCFE vs DDM; NI and EBITDA as poor proxies; sensitivity analysis; single-, two- and three-stage models; terminal value; under/overvaluation | FCFF = NI + NCC + Int(1 − t) − FCInv − WCInv; = CFO + Int(1 − t) − FCInv; = EBIT(1 − t) + Dep − FCInv − WCInv; = EBITDA(1 − t) + Dep·t − FCInv − WCInv; FCFE = FCFF − Int(1 − t) + net borrowing; = NI + NCC − FCInv − WCInv + net borrowing; with target debt ratio DR: FCFE = NI − (1 − DR)(FCInv − Dep) − (1 − DR)WCInv; firm value = FCFF1/(WACC − g); equity value = firm value − MV debt; equity value = FCFE1/(r − g); WACC = w_d·r_d(1 − t) + w_e·r_e |
| 4 | Market-Based Valuation: Price and Enterprise Value Multiples | Method of comparables vs forecasted fundamentals; justified multiples; rationales and drawbacks of P/E, P/B, P/S, P/CF, D/P; underlying and normalized EPS (historical average EPS, average ROE method); earnings yield; fundamental drivers; cross-sectional regression P/E; justified P/E, P/B, P/S; **PEG**; multiples in terminal value; comparables; cash-flow definitions (CF, adjusted CFO, FCFE, EBITDA); **EV/EBITDA**; cross-border differences; momentum indicators (earnings surprise, SUE); arithmetic, harmonic and weighted harmonic means and medians | Justified P/E = (1 − b)/(r − g) (leading); justified P/B = (ROE − g)/(r − g); justified P/S = (E0/S0)(1 − b)(1 + g)/(r − g); justified P/CF = V0/CF with V0 from DCF; justified D/P = (r − g)/(1 + g); PEG = (P/E)/g (g in %); terminal value TV_n = justified multiple × fundamental_n; normalized EPS (avg ROE) = avg ROE × current BVPS; EV = MV equity + MV pref + MV debt + NCI − cash & investments; SUE = (actual EPS − expected EPS)/σ(surprise); weighted harmonic mean = 1/Σ(w_i/X_i) |
| 5 | Residual Income Valuation | RI, EVA, MVA; uses; RI model valuation and value recognition (front-loaded vs DDM back-loaded); determinants; justified P/B link; single-stage and multistage RI; implied growth; continuing RI and persistence factor; RI vs DDM/FCF; strengths and weaknesses; accounting issues (clean surplus violations, OCI, intangibles, non-recurring items, aggressive accounting, international) | RI_t = E_t − r·B_{t−1} = (ROE_t − r)·B_{t−1}; EVA = NOPAT − WACC × invested capital = EBIT(1 − t) − $WACC; MVA = MV of company − accounting book value of capital; V0 = B0 + Σ RI_t/(1 + r)^t; single-stage V0 = B0 + (ROE − r)B0/(r − g); implied g = r − B0(ROE − r)/(V0 − B0); multistage with persistence ω: V0 = B0 + Σ_{t=1}^{T−1} RI_t/(1 + r)^t + RI_T/[(1 + r − ω)(1 + r)^{T−1}] (ω = 0: RI drops to 0 after T; ω = 1: persists indefinitely); clean surplus: B_t = B_{t−1} + E_t − D_t; Tobin's q = MV of debt + equity/replacement cost of assets |
| 6 | Private Company Valuation | Public vs private features (company-specific and stock-specific); uses (transaction, compliance, litigation); normalized earnings (owner compensation, related-party, non-recurring, discretionary); strategic vs financial buyers; discount-rate issues (size premium, access to capital, company-specific risk); CAPM, expanded CAPM, build-up; **DLOC and DLOM** (protective puts, restricted stock studies, pre-IPO); income (FCF, capitalized cash flow, excess earnings), market (guideline public company, guideline transactions, prior transaction) and asset approaches | Expanded CAPM: r = Rf + β(ERP) + size premium + specific-company premium; DLOC = 1 − 1/(1 + control premium); total discount = 1 − (1 − DLOC)(1 − DLOM); capitalized cash flow: V = FCFF1/(WACC − g) (or FCFE1/(r − g)); excess earnings method: excess earnings = normalized earnings − required return on working capital and fixed assets; intangible value = excess earnings × (1 + g)/(r_intangible − g) |

**Typical difficulties:**
- Choosing FCFF vs FCFE and the right adjustments (NCC, interest, WC).
- H-model and terminal value timing.
- RI persistence formula.
- Justified multiples algebra.
- Applying DLOC and DLOM multiplicatively.

---

### 3.6 Fixed Income (10–15%)

| # | LM | Key LO themes | Key formulas |
|---|---|---|---|
| 1 | The Term Structure and Interest Rate Dynamics | Spot, forward, YTM, expected vs realized returns; bootstrapping from the par curve; forward rates as unbiased predictors and active management; **riding/rolling down the yield curve**; swap curve and **swap spread**; short-term spreads (SOFR–T-bill, Libor–OIS, TED); term-structure theories (local expectations, unbiased expectations, liquidity preference, segmented markets, preferred habitat); yield curve factor exposures (level, steepness, curvature; key-rate durations); maturity structure of yield volatility; macro factors and views | Forward pricing model: P(T*+T) = P(T*)·F(T*, T); (1 + z_T)^T = (1 + z_1)(1 + f_{1,1})…; swap spread = swap rate − Treasury yield (same maturity); TED spread = MRR − T-bill yield; Libor–OIS = MRR − OIS rate; %ΔP ≈ −Σ KRD_i·Δr_i |
| 2 | The Arbitrage-Free Valuation Framework | Arbitrage-free meaning; valuing option-free bonds with spot rates; **binomial interest-rate tree** (lognormal: r_up = r_down·e^{2σ}); calibration to the par curve; backward induction; pricing vs zero curve; **pathwise valuation**; Monte Carlo forward-rate simulation; term-structure models (equilibrium: CIR, Vasicek; arbitrage-free: Ho–Lee, KWF) | Node value V = ½[(V_H + C) + (V_L + C)]/(1 + r_node); r_{1,H} = r_{1,L}·e^{2σ√t}; CIR dr = k(θ − r)dt + σ√r dz; Vasicek dr = k(θ − r)dt + σdz; Ho–Lee dr_t = θ_t dt + σ dz_t |
| 3 | Valuation and Analysis of Bonds with Embedded Options | Callable, putable, extendible bonds; option relationships; valuing in a tree (call at each node: min(V, call price); put: max(V, put price)); volatility and yield-curve effects; **OAS**; volatility and OAS; **effective duration and convexity**; one-sided and key-rate durations; capped and floored floaters; **convertible bonds** (conversion ratio, conversion price, conversion value, market conversion premium, premium per share, minimum value, downside risk, straight value); risk/return vs straight bond and stock | V_callable = V_straight − V_call; V_putable = V_straight + V_put; OAS: constant spread added to every tree rate so model value = market price; ↑σ lowers callable value and OAS, raises putable value; EffDur = (PV₋ − PV₊)/(2·ΔCurve·PV₀); EffCon = (PV₋ + PV₊ − 2PV₀)/[(ΔCurve)²·PV₀]; capped floater = straight floater − cap; floored floater = straight + floor; conversion value = conversion ratio × share price; conversion price = issue price/conversion ratio; market conversion price = bond price/conversion ratio; market conversion premium per share = market conversion price − share price; premium ratio = premium per share/share price; premium over straight value = bond price/straight value − 1; min value = max(straight value, conversion value); convertible value = straight bond + call on stock − issuer call + investor put |
| 4 | Credit Analysis Models | Expected exposure, LGD, PD, **CVA**; credit scores and ratings; expected return given rating transitions (transition matrices); **structural** (Merton: equity = call on assets) vs **reduced-form** models; valuing a risky bond and its spread from credit parameters (tree with default); interpreting spread changes; term structure of credit spreads; securitized debt credit analysis | EL = EE × LGD × POD (per period, with POD conditional on survival; POS_t = (1 − hazard)^t); CVA = Σ_t PV(EL_t) = Σ LGD_t × POD_t × DF_t; fair value of risky bond = VND − CVA; credit spread ≈ PD × LGD (annual, approx); %ΔP from rating migration ≈ −ModDur × ΔSpread (+ ½·Convexity·ΔSpread²); expected return change = Σ p_i × (%ΔP_i); Merton: E = A·N(d1) − K·e^{−rT}·N(d2) |
| 5 | Credit Default Swaps | Single-name, index (CDX, iTraxx) and tranche CDS; parameters (reference obligation, notional, standard coupon 1%/5%, upfront payment); credit events (bankruptcy, failure to pay, restructuring) and settlement (physical, cash, auction); pricing (hazard rate, protection vs premium leg, upfront); uses (manage exposure, curve trades, basis trades, long/short); valuation disparities (CDS–bond basis; LBO trades; equity vs credit) | Upfront payment (protection buyer pays) = PV(protection leg) − PV(premium leg); upfront % ≈ (credit spread − fixed coupon) × EffSpreadDur_CDS; CDS price = 100 − upfront% (per 100 notional); ΔCDS value for a protection buyer ≈ Δspread × duration × notional; hazard rate ≈ spread/(1 − RR); CDS–bond basis = bond spread − CDS spread (some texts reverse the sign) |

**Typical difficulties:**
- **Binomial tree** calculations under time pressure.
- Callable/putable value with OAS.
- Effective duration through the tree.
- Convertible definitions.
- CVA tables.
- CDS upfront sign conventions.

---

### 3.7 Derivatives (5–10%)

| # | LM | Key LO themes | Key formulas |
|---|---|---|---|
| 1 | Pricing and Valuation of Forward Commitments | Equity forwards and futures; carry arbitrage with and without underlying cash flows; interest-rate forwards (FRAs) and futures; fixed-income forwards and futures (conversion factor, CTD); **interest-rate swaps**; **currency swaps**; **equity swaps** — pricing at initiation and valuation during the life | Equity forward: F0 = (S0 − PV(D))(1 + r)^T or S0·e^{(r − δ)T}; long forward value V_t = PV_t[F_t − F_0] = [S_t − PV(D)] − F0/(1 + r)^{T − t}; FRA value (long = pay-fixed) at time g: V_g = [(FRA_g − FRA_0) × τ × NA] discounted from the FRA settlement date back to g at the current MRR (receive-fixed reverses the sign); bond futures: F0 = [(S0 + AI0)(1 + r)^T − AI_T − FVCI]·(1/CF) (quoted futures price); currency forward: F0(p/b) = S0·(1 + r_p)^T/(1 + r_b)^T, continuous S0·e^{(r_p − r_b)T}; IRS fixed rate r_FIX = (1 − PV_N)/Σ_{i=1}^{N} PV_i (PV_i = DFs); swap value (receive-fixed) = NA × (FS0 − FSt) × Σ PV_i (remaining); currency swap fixed rates from each currency's DFs; equity swap value (receive equity) = (S_t/S_{t−1})·NA − PV(fixed leg) |
| 2 | Valuation of Contingent Claims | Binomial model components; option as PV of expected payoff; options arbitrage; **two-period binomial** (European and American, early exercise); interest-rate options in a binomial tree; **BSM** assumptions and components (leveraged position in stock); BSM for equities (dividend yield) and currencies; **Black model** for futures options, interest-rate options (caplets/floorlets) and **swaptions**; **Greeks** (delta, gamma, theta, vega, rho); delta hedging; gamma risk; **implied volatility** | π = q = [(1 + r) − d]/(u − d); c0 = PV[q²c_uu + 2q(1 − q)c_ud + (1 − q)²c_dd]; American put: max(exercise, continuation) at each node; BSM: c0 = S0·e^{−δT}·N(d1) − X·e^{−rT}·N(d2); p0 = X·e^{−rT}·N(−d2) − S0·e^{−δT}·N(−d1); d1 = [ln(S0/X) + (r − δ + σ²/2)T]/(σ√T); d2 = d1 − σ√T; currency: δ = r_foreign; Black (futures): c = e^{−rT}[F0·N(d1) − X·N(d2)], d1 = [ln(F/X) + (σ²/2)T]/(σ√T); caplet = (NA × τ)·e^{−rT}[F·N(d1) − X·N(d2)] (paid in arrears); payer swaption = (AP)(NA)[FS·N(d1) − X·N(d2)], AP = Σ PV annuity factors; receiver swaption uses the put form; put–call parity for swaptions: payer − receiver = forward swap value; delta_call = e^{−δT}N(d1), delta_put = −e^{−δT}N(−d1); hedge: N_H = −portfolio delta/delta_H; Δc ≈ delta·ΔS + ½·gamma·ΔS² |

**Typical difficulties:**
- Value vs price for each forward-commitment type.
- Swap valuation from DF tables.
- Two-period trees with early exercise.
- Black vs BSM choice.
- Greeks intuition (signs, effect of moneyness and time).

---

### 3.8 Alternative Investments (5–10%)

| # | LM | Key LO themes | Key formulas |
|---|---|---|---|
| 1 | Introduction to Commodities and Commodity Derivatives | Sectors (energy, grains, industrial and precious metals, livestock, softs); life cycles; valuation vs equities and bonds (no cash flows; storage and transport costs); participants (hedgers, speculators, arbitrageurs, exchanges, analysts, regulators); **contango vs backwardation**; theories (insurance/normal backwardation, hedging pressure, theory of storage); **total return of a fully collateralized futures position**; roll return; commodity swaps (total return, excess return, basis, variance/volatility swaps); index construction (S&P GSCI, BCOM, etc.) | F0 = S0·(1 + r) + storage cost − convenience yield; total return = price (spot) return + roll return + collateral return; roll return ≈ (F_near − F_far)/F_near (positive in backwardation); excess return index = price + roll |
| 2 | Overview of Types of Real Estate Investment | Features (heterogeneity, high unit value, management intensity, illiquidity, high transaction costs, depreciation, debt capital, appraisal smoothing); economic value drivers and portfolio role; property types (office, industrial, retail, multifamily, lodging, healthcare, etc.) and lease structures; due diligence; valuation approaches (income — direct capitalization, DCF; cost; sales comparison); indexes (appraisal-based, transaction-based — repeat sales, hedonic; REIT-based) and their biases (lag, smoothing) | Value = NOI₁/cap rate; cap rate = discount rate − growth; NOI = rental income + other income − vacancy & collection loss − operating expenses; DSCR = NOI/debt service; LTV = loan/value; equity dividend rate (cash-on-cash) = first-year cash flow/equity; DCF value = Σ NOI_t/(1 + r)^t + [NOI_{n+1}/terminal cap]/(1 + r)^n |
| 3 | Investments in Real Estate through Publicly Traded Securities | Types (REITs, REOCs, MBS); REIT structure and tax; **NAVPS** (from capitalized NOI); **FFO and AFFO**; REIT valuation by NAV, P/FFO, P/AFFO and DCF; public vs private vehicles | NAVPS = (value of operating RE [= NOI_next/cap rate] + cash & other assets − total liabilities)/shares; FFO = accounting NI + depreciation (& amortization) of RE − gains on sales of property + losses on sales (± impairment); AFFO = FFO − non-cash (straight-line) rent adjustment − recurring capex (maintenance/leasing costs); value = P/FFO multiple × FFO/share; DDM for REIT dividends |
| 4 | Hedge Fund Strategies | Classification; **equity** (long/short, dedicated short, short-biased, equity market neutral); **event-driven** (merger arbitrage, distressed/restructuring, activist, special situations); **relative value** (FI arbitrage, convertible bond arbitrage, volatility trading); **opportunistic** (global macro, managed futures/CTA); **specialist** (volatility, reinsurance/life settlements); **multi-manager** (FoFs, multi-strategy); factor models for risk exposures (conditional factor models); portfolio allocation effects | Merger arb (stock deal): long target, short acquirer × exchange ratio; convertible arb: long convertible, short delta × shares; factor regression R_HF = α + Σβ_k F_k + ε; portfolio Sharpe/MDD before vs after a hedge-fund allocation |

> **Note:** Private equity valuation, and the standalone Private Equity and infrastructure LMs once in L2 Alternatives, are **not in the current (2026/2027) L2 Alternatives outline**. PE now sits at L1 (Investments in Private Capital) and in the Level III Private Markets pathway.

**Typical difficulties:**
- Roll return sign in contango vs backwardation.
- FFO/AFFO adjustments.
- NAVPS build-up.
- Matching hedge-fund strategy descriptions to categories and risk profiles.

---

### 3.9 Portfolio Management (2026) / Portfolio Construction (2027) (10–15%)

| # | LM | Key LO themes | Key formulas |
|---|---|---|---|
| 1 | Economics and Investment Markets | Market values reflect default-free rates, cash-flow timing/magnitude and risk premiums; expectations; long-run growth, growth volatility and real short-term rates; business cycle and policy rates, term-structure slope and bond performance; breakeven inflation; credit spreads over the cycle; product-market characteristics and credit quality; consumption-hedging property of equity and the ERP; cyclical earnings growth; cyclical valuation multiples; commercial real estate economics | Fundamental pricing: P0 = Σ E[CF_t]/(1 + l_t + θ_t + ρ_t)^t (l = real rf, θ = expected inflation, ρ = risk premium); breakeven inflation = nominal yield − real (ILB) yield = expected inflation + inflation risk premium; inter-temporal rate of substitution m_t = u(c_t)/u(c_0); ↑ consumption-hedging ability gives a ↓ risk premium |
| 2 | Analysis of Active Portfolio Management | Value added by active management; **information ratio** (ex post, ex ante) vs Sharpe; **fundamental law** (TC, IC, breadth, active risk); IR for manager selection and active-risk choice; market timing vs security selection; practical limits | Active return R_A = R_P − R_B = Σ Δw_i R_i; IR = R_A/σ(R_A); SR_P² = SR_B² + IR² (optimal); optimal active risk σ_A* = (IR/SR_B)·σ_B; E(R_A) = TC × IC × √BR × σ_RA; IR* ≈ TC × IC × √BR (unconstrained TC = 1); for market timing IC = 2 × (% correct) − 1; Sharpe of portfolio = (E(R_P) − R_f)/σ_P |
| 3 | Exchange-Traded Funds: Mechanics and Applications | Creation/redemption via **authorized participants** (in-kind); secondary-market trading; **tracking error** sources (fees, sampling, index changes, cash drag, securities lending, regulatory/tax); bid–ask spread drivers; premiums/discounts to NAV (stale prices, liquidity); costs (expense ratio, trading, tracking, tax); ETF risks (counterparty — ETNs; fund closures; expectation-related); portfolio uses (efficient exposure, tactical, rebalancing, portfolio completion, transition management, factor/smart beta) | Tracking difference = R_ETF − R_index; tracking error = σ(R_ETF − R_index); premium/discount = (P_ETF − NAV)/NAV; total cost of holding = round-trip trading cost + expense ratio × holding period; ETF spread ≈ f(creation/redemption fees + underlying spreads + hedging risk + market maker profit − competition) |
| 4 | Using Multifactor Models | **APT** assumptions; arbitrage opportunities; expected return given factor sensitivities; macroeconomic vs fundamental vs statistical factor models; uses (return attribution, risk attribution, portfolio construction, strategic decisions); multiple risk dimensions; sources of active risk; tracking risk; IR | APT: E(R_p) = R_F + λ1β_{p,1} + … + λKβ_{p,K}; macro model: R_i = a_i + b_{i1}F_{GDP} + b_{i2}F_{QS} + ε_i (F = surprises); fundamental model: R_i = a_j + b_{i1}F_1 + … (b standardized: (value_i − mean)/σ); active return = Σ(β_{p,k} − β_{b,k})λ_k + active specific return; active risk² = active factor risk + active specific risk; active specific risk = Σ(w_i^a)²σ²_{εi} |
| 5 | Measuring and Managing Market Risk | **VaR** (parametric/variance–covariance, historical simulation, Monte Carlo); advantages and limits; extensions (CVaR/expected shortfall, incremental VaR, marginal VaR, relative VaR); sensitivity measures (beta, duration, convexity, Greeks) and scenario measures (historical, hypothetical, stress tests, reverse stress tests); constraints (risk budgeting, position limits, scenario limits, stop-loss); risk-based capital allocation; risk measures for banks, asset managers, pension funds and insurers | Parametric VaR = [E(R_p) − z·σ_p] × V_p (as a loss: −(E(R) − zσ)V); z: 1.65 (95% one-tailed), 2.33 (99%); multi-period σ_T = σ_daily·√T; E(R_T) = μ_daily·T; historical-simulation VaR = the appropriate percentile of historical P&L; CVaR = average loss beyond the VaR; portfolio σ for 2 assets as in L1; %ΔP (bond) ≈ −D·Δy + ½C·Δy²; options: Δ ≈ delta·ΔS + ½·gamma·ΔS² + vega·Δσ |
| 6 | Backtesting and Simulation | Objectives; steps (strategy design, historical investment simulation, output analysis) and procedures (rolling-window backtesting); metrics and visuals (Sharpe, Sortino, max drawdown, IC, cumulative return, turnover, hit rate); **problems** (survivorship bias, look-ahead bias, data snooping, transaction costs, short-selling constraints, regime changes); historical scenario analysis; Monte Carlo vs historical simulation; simulation inputs and decisions; sensitivity analysis | Sortino = (R_p − MAR)/downside deviation; max drawdown = max peak-to-trough decline; IC = corr(predicted, realized) (rank IC = Spearman); multi-asset simulation via multivariate normal or multivariate t/copula |

**Typical difficulties:**
- Fundamental law algebra.
- Separating active factor risk from active specific risk.
- VaR scaling and the sign of loss.
- Matching VaR methods to their limitations.
- Backtesting bias vocabulary.
- Economics and Investment Markets is conceptual but subtle (it is often mixed up with L3 capital-market expectations).

---

### 3.10 Ethical and Professional Standards (10–15%)

**2026 (3 LMs):**

| # | LM | Key LO themes |
|---|---|---|
| 1 | Code of Ethics and Standards of Professional Conduct | Six Code components and seven Standards; ethical responsibilities of members and candidates |
| 2 | Guidance for Standards I–VII | Apply the Code and Standards to specific situations; recommend practices and procedures that prevent violations |
| 3 | Application of the Code and Standards: Level II | Evaluate practices, policies and conduct; explain whether they violate the Code and Standards (case-based) |

**2027 (9 LMs):**

1. Code of Ethics and Standards of Professional Conduct
2. Guidance for Standard I: Professionalism
3. Guidance for Standard II: Integrity of Capital Markets
4. Guidance for Standard III: Duties to Clients
5. Guidance for Standard IV: Duties to Employers
6. Guidance for Standard V: Investment Analysis, Recommendations, and Actions
7. Guidance for Standard VI: Conflicts of Interest
8. Guidance for Standard VII: Responsibilities as a CFA Institute Member or CFA Candidate
9. Application of the Code and Standards: Level II

2027 Ethics content reflects the *Standards of Practice Handbook* v12. **GIPS is not part of Level II Ethics** (in either year).

**Typical difficulties:**
- L2 Ethics item sets are long vignettes with several actors.
- Questions usually ask "which Standard did X violate" or "does action Y comply", and often involve research reports (V(A)), MNPI (II(A)), priority of transactions (VI(B)), and supervisor responsibilities (IV(C)).
- Ethics is often cited as the topic where candidates under-perform relative to their study time.

---

## 4. Taxonomy and product notes

- Level II questions are **vignette-dependent**. The question bank needs an `item_set` entity (vignette text, exhibits/tables) containing 4 child MCQs. Each child is tagged to LM → LO, and child items can span LMs within a topic.
- Every LM and LO for topics 3.1–3.9 is unchanged between 2026 and 2027. Only the Ethics LM structure and the topic names differ. Map the 2027 topic names as aliases.
- High-yield calculation areas for item-set generation:
  - Regression output tables
  - Time-series diagnostics
  - FX parity and forward MTM
  - Currency translation tables
  - Pension tables
  - FCFF/FCFE builds
  - RI models
  - Binomial interest-rate trees
  - CVA tables
  - Swap DF tables
  - BSM/Black models
  - REIT NAV/FFO
  - Fundamental law
  - VaR

---

## Sources (accessed 2026-10-22)

- CFA Institute — Level II exam page (structure: 22 item sets/88 Qs, 2 × 132 min, 20 scored + 2 trial sets; weights; PSM): https://www.cfainstitute.org/programs/cfa-program/candidate-resources/level-ii-exam
- CFA Institute — 2026 Level II Topic Outlines (official LMs and LOs): https://www.cfainstitute.org/sites/default/files/docs/programs/cfa-program/2026-l2-topics-combined.pdf
- CFA Institute — 2027 Level II Topic Outlines (official LMs and LOs): https://www.cfainstitute.org/sites/default/files/docs/programs/cfa-program/2027-cfa_l2_topic_outline.pdf
- CFA Institute — sample Level II item-set questions: https://www.cfainstitute.org/-/media/documents/support/programs/cfa/sample-level-II-itemset-questions.pdf
- CFA Institute — Practical Skills Modules: https://www.cfainstitute.org/programs/cfa-program/candidate-resources/practical-skills-modules
- 300Hours — CFA Curriculum Changes 2026 (45 LMs; one ML LO removed): https://300hours.com/cfa-curriculum-changes-2026/
- 300Hours — CFA Curriculum Changes 2027 (51 LMs; Ethics only): https://300hours.com/cfa-curriculum-changes-2027/
- AnalystPrep — 2027 CFA curriculum changes (L2 Ethics 3→9 LMs; other topic LM/LO counts unchanged): https://analystprep.com/blog/2027-cfa-curriculum-changes-levels-1-2-3/
