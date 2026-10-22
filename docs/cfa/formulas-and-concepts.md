# CFA Level I & II — Consolidated Formula Sheet and Core Concepts

> **As of:** 2026-10-22. These are standard textbook formulas aligned to the 2026/2027 CFA Level I and Level II learning outcomes (see `level-1.md` and `level-2.md`).
> **Tags:**
> - `[L1]` = Level I
> - `[L2]` = Level II
> - `[L1-26]` = Level I 2026 only (dropped or not explicit in 2027)
> - `[L1-27]` = new emphasis in 2027
>
> CFA Institute does not supply a formula sheet in the exam. Candidates must memorize these. Notation follows CFA curriculum conventions where possible.
> **Common variables:**
> - r = discount rate / required return
> - Rf = risk-free rate
> - g = growth rate
> - t = tax rate (or time, per context)
> - T = time to maturity or expiry (years)
> - N/n = number of periods or observations
> - PV/FV = present/future value
> - σ = standard deviation
> - ρ = correlation
> - β = beta
> - w = weight

---

## 1. Quantitative Methods

### 1.1 Rates, returns and time value `[L1]`

| Concept | Formula | Variables |
|---|---|---|
| Interest-rate build-up | r = real rf + inflation premium + default premium + liquidity premium + maturity premium | — |
| Holding-period return | HPR = (P1 − P0 + D1)/P0 | P = price, D = income |
| Multi-period HPR | R = (1 + R1)(1 + R2)…(1 + Rn) − 1 | — |
| Arithmetic mean | R̄ = ΣRt/T | — |
| Geometric mean | R_G = [Π(1 + Rt)]^(1/T) − 1 | Always ≤ arithmetic mean |
| Harmonic mean | X̄_H = n/Σ(1/Xi) | Used in cost averaging and for averaging multiples (L2) |
| Trimmed/winsorized mean | Exclude/replace x% of extreme obs. | — |
| Money-weighted return | IRR: Σ CF_t/(1 + MWR)^t = 0 | CF incl. contributions (−) and withdrawals (+) |
| Time-weighted return | TWR = [Π(1 + HPR_i)]^(1/n) − 1 (annualized) | Sub-periods split at each external cash flow |
| Annualized return | R_annual = (1 + R_period)^c − 1 | c = periods per year |
| Continuously compounded | r_cc = ln(1 + HPR) = ln(P1/P0); HPR = e^(r_cc) − 1 | Additive over time |
| Real return | (1 + R_nominal) = (1 + R_real)(1 + π) | π = inflation |
| After-tax return | R_AT = R_pre × (1 − t) | — |
| Leveraged return | R_L = R_p + (V_B/V_E)(R_p − r_D) | V_B = borrowed, V_E = equity, r_D = cost of borrowing |
| FV / PV (discrete) | FV_N = PV(1 + r/m)^(mN) | m = compounding periods per year |
| FV (continuous) | FV = PV·e^(rN) | — |
| Effective annual rate | EAR = (1 + r_s/m)^m − 1; continuous EAR = e^(r) − 1 | r_s = stated annual rate |
| Ordinary annuity | PV = A[1 − (1 + r)^−N]/r; FV = A[(1 + r)^N − 1]/r | Annuity due = ordinary × (1 + r) |
| Perpetuity | PV = A/r | — |
| Growing perpetuity | PV0 = CF1/(r − g) | r > g |
| Implied return / growth (equity) | r = D1/P0 + g; g = r − D1/P0 | — |
| Implied forward rate | (1 + z_B)^B = (1 + z_A)^A × (1 + IFR_{A,B−A})^(B−A) | z = spot rates |
| Forward FX via no-arbitrage | F = S × (1 + r_price)^T/(1 + r_base)^T | Quote convention price/base |

### 1.2 Statistics `[L1]`

| Concept | Formula |
|---|---|
| Sample variance | s² = Σ(Xi − X̄)²/(n − 1) |
| Population variance | σ² = Σ(Xi − μ)²/N |
| Mean absolute deviation | MAD = Σ\|Xi − X̄\|/n |
| Coefficient of variation | CV = s/X̄ |
| Target semideviation | s_target = √[Σ_{Xi ≤ B}(Xi − B)²/(n − 1)] |
| Percentile location | L_y = (n + 1)(y/100) |
| Sample skewness (approx.) | S_k ≈ (1/n)Σ(Xi − X̄)³/s³ |
| Excess kurtosis | K_E = (1/n)Σ(Xi − X̄)⁴/s⁴ − 3 |
| Sample covariance | s_XY = Σ(Xi − X̄)(Yi − Ȳ)/(n − 1) |
| Correlation | r_XY = s_XY/(s_X s_Y), −1 ≤ r ≤ 1 |

**Skew interpretation:** positive skew means mean > median > mode; negative skew means mean < median < mode.

### 1.3 Probability `[L1]`

| Concept | Formula |
|---|---|
| Expected value | E(X) = Σ P(Xi)Xi |
| Variance | σ²(X) = Σ P(Xi)[Xi − E(X)]² |
| Total probability rule (expectations) | E(X) = Σ E(X\|Si)P(Si) |
| Joint probability | P(AB) = P(A\|B)P(B); if independent, P(AB) = P(A)P(B) |
| Addition rule | P(A or B) = P(A) + P(B) − P(AB) |
| Bayes' formula | P(Event\|Info) = P(Info\|Event) × P(Event)/P(Info) |
| Covariance (from a joint probability table) | Cov(RA, RB) = Σ P(s)[RA,s − E(RA)][RB,s − E(RB)] |
| Combinations | nCr = n!/[(n − r)! r!] |
| Permutations | nPr = n!/(n − r)! |
| Multinomial | n!/(n1! n2! … nk!) |
| Binomial | P(X = x) = nCx·p^x(1 − p)^(n − x); E = np; Var = np(1 − p) |
| Normal z | z = (X − μ)/σ |

**Normal-distribution coverage:**
- ±1σ ≈ 68%
- ±1.65σ ≈ 90%
- ±1.96σ ≈ 95%
- ±2.58σ ≈ 99%

### 1.4 Portfolio mathematics `[L1]`

| Concept | Formula |
|---|---|
| Portfolio expected return | E(Rp) = Σ wi E(Ri) |
| Portfolio variance (N assets) | σp² = Σi Σj wi wj Cov(Ri, Rj) |
| Portfolio variance (2 assets) | σp² = w1²σ1² + w2²σ2² + 2w1w2ρ12σ1σ2 |
| Global minimum-variance weight (2 assets) `[L1-27]` | w1* = (σ2² − Cov12)/(σ1² + σ2² − 2Cov12) |
| Roy's safety-first ratio `[L1-26]` | SFRatio = [E(Rp) − R_L]/σp; choose the max. Shortfall probability = N(−SFRatio) |

### 1.5 Sampling, estimation and hypothesis testing `[L1]`

| Concept | Formula |
|---|---|
| Standard error of the mean | σ_X̄ = σ/√n (or s/√n) |
| Confidence interval | X̄ ± z_(α/2)·σ/√n, or X̄ ± t_(α/2, n−1)·s/√n |
| z-test (mean) | z = (X̄ − μ0)/(σ/√n) |
| t-test (mean) | t = (X̄ − μ0)/(s/√n), df = n − 1 |
| Difference in means (pooled, equal variances) | t = [(X̄1 − X̄2) − (μ1 − μ2)]/√(s_p²/n1 + s_p²/n2); s_p² = [(n1 − 1)s1² + (n2 − 1)s2²]/(n1 + n2 − 2), df = n1 + n2 − 2 |
| Paired comparisons | t = (d̄ − μ_d0)/s_d̄; s_d̄ = s_d/√n; df = n − 1 |
| Single variance (χ²) | χ² = (n − 1)s²/σ0², df = n − 1 |
| Equality of two variances | F = s1²/s2² (larger on top), df = (n1 − 1, n2 − 1) |
| Correlation test | t = r√(n − 2)/√(1 − r²), df = n − 2 |
| Spearman rank correlation | r_s = 1 − 6Σd_i²/[n(n² − 1)] |
| χ² test of independence `[L1-26]` | χ² = Σ(O_ij − E_ij)²/E_ij; E_ij = (row_i total × col_j total)/N; df = (r − 1)(c − 1) |

**Errors and power:**
- Type I error = rejecting a true H0 (probability α).
- Type II error = failing to reject a false H0 (probability β).
- Power = 1 − β.

### 1.6 Simple linear regression `[L1]`

| Concept | Formula |
|---|---|
| Model | Yi = b0 + b1Xi + εi |
| Slope | b̂1 = Cov(X, Y)/Var(X) = Σ(Xi − X̄)(Yi − Ȳ)/Σ(Xi − X̄)² |
| Intercept | b̂0 = Ȳ − b̂1X̄ |
| Sum of squares | SST = Σ(Yi − Ȳ)² = SSR + SSE |
| Coefficient of determination | R² = SSR/SST (= r² in simple regression) |
| Mean squares | MSR = SSR/k (k = 1); MSE = SSE/(n − 2) |
| F-statistic | F = MSR/MSE |
| Standard error of estimate | SEE = √MSE |
| Coefficient t-test | t = (b̂1 − B1)/s_b̂1, df = n − 2; s_b̂1 = SEE/√Σ(Xi − X̄)² |
| Forecast standard error | s_f² = SEE²[1 + 1/n + (X_f − X̄)²/((n − 1)s_X²)] |
| Prediction interval | Ŷ_f ± t_c·s_f |

**Functional forms:**

| Form | Equation |
|---|---|
| Log-lin | ln Y = b0 + b1X |
| Lin-log | Y = b0 + b1 ln X |
| Log-log | ln Y = b0 + b1 ln X (b1 = elasticity) |

**CAPM regression `[L1-27]`:** Ri − Rf = αi + βi(Rm − Rf) + εi.

### 1.7 Multiple regression `[L2]`

| Concept | Formula |
|---|---|
| Model | Yi = b0 + b1X1i + … + bkXki + εi |
| Adjusted R² | R̄² = 1 − [(n − 1)/(n − k − 1)](1 − R²) |
| Global F-test | F = (SSR/k)/[SSE/(n − k − 1)], df = (k, n − k − 1) |
| Joint (nested) F-test | F = [(SSE_R − SSE_U)/q]/[SSE_U/(n − k − 1)], q = # restrictions |
| AIC (prediction) | AIC = n·ln(SSE/n) + 2(k + 1) |
| BIC (goodness of fit; penalizes more) | BIC = n·ln(SSE/n) + ln(n)·(k + 1) |
| Breusch–Pagan (heteroskedasticity) | BP = n × R²_(resid² on X) ~ χ²(k) |
| Durbin–Watson (serial correlation) | DW ≈ 2(1 − r) |
| Variance inflation factor | VIF_j = 1/(1 − R²_j); > 5 concerning, > 10 serious multicollinearity |
| High leverage | h_ii > 3(k + 1)/n |
| Cook's distance | D_i > 2√(k/n) (or > 1) → influential |
| Logistic regression | ln[p/(1 − p)] = b0 + Σ bjXj; p = 1/[1 + e^−(b0 + Σ bjXj)]; odds = e^(log-odds) |
| Likelihood-ratio test | LR = −2(lnL_restricted − lnL_unrestricted) ~ χ² |

**Misspecification: consequences and fixes**

| Problem | Effect on coefficients | Effect on SEs | Fix |
|---|---|---|---|
| Conditional heteroskedasticity | Unbiased | SEs too small, so t-stats inflated (Type I errors) | Robust (White) SEs |
| Positive serial correlation | Consistent (unless lagged DV) | SEs too small | Newey–West SEs |
| Multicollinearity | Unbiased | SEs inflated, so Type II errors | Drop or combine variables |
| Omitted variable | Biased, inconsistent | — | Respecify the model |

### 1.8 Time series `[L2]`

| Concept | Formula |
|---|---|
| Linear trend | y_t = b0 + b1t + ε |
| Log-linear trend | ln y_t = b0 + b1t + ε (constant growth rate) |
| AR(1) | x_t = b0 + b1x_{t−1} + ε_t |
| Mean-reverting level | b0/(1 − b1) (requires \|b1\| < 1) |
| Residual autocorrelation t-test | t = ρ̂_k/(1/√T) |
| Root mean squared error | RMSE = √[Σ(actual − forecast)²/n] (lower is better, out of sample) |
| Random walk | x_t = x_{t−1} + ε (b0 = 0, b1 = 1); with drift: b0 ≠ 0. First difference y_t = x_t − x_{t−1} |
| Dickey–Fuller | x_t − x_{t−1} = b0 + (b1 − 1)x_{t−1} + ε; H0: g1 = b1 − 1 = 0 (unit root) |
| Seasonal AR | x_t = b0 + b1x_{t−1} + b2x_{t−4} + ε (quarterly) |
| ARCH(1) | ε̂²_t = a0 + a1ε̂²_{t−1} + u_t; σ̂²_{t+1} = â0 + â1ε̂²_t |

**Cointegration (two series):**
- Both stationary: OK to regress.
- Only one has a unit root: invalid.
- Both have unit roots and are cointegrated (Engle–Granger DF test on the residuals): OK.
- Both have unit roots and are not cointegrated: invalid.

### 1.9 Machine learning and big data `[L1 concepts / L2]`

| Metric | Formula |
|---|---|
| Precision | TP/(TP + FP) |
| Recall (sensitivity, TPR) | TP/(TP + FN) |
| Accuracy | (TP + TN)/(TP + FP + TN + FN) |
| F1 score | 2 × P × R/(P + R) |
| False positive rate | FP/(FP + TN) |
| Error rate | 1 − accuracy |
| Normalization | (X − X_min)/(X_max − X_min) |
| Standardization | (X − μ)/σ |
| Term frequency | TF = term count/total tokens in the document |
| Inverse document frequency | IDF = ln(total docs/docs containing the term) |
| TF-IDF | TF × IDF |
| LASSO objective | min SSE + λΣ\|b_k\| |
| Bias–variance decomposition | Total error = bias² + variance + irreducible error |

**Algorithm map:**
- Supervised: penalized regression/LASSO, SVM, KNN, CART, ensembles (bagging, random forest, boosting), neural nets.
- Unsupervised: PCA, k-means, hierarchical clustering (agglomerative or divisive).
- 2026 L2 removed the LO on neural nets, deep learning and reinforcement learning.

---

## 2. Economics

### 2.1 Microeconomics and market structure `[L1]`

| Concept | Formula |
|---|---|
| Profit maximization | MR = MC (any structure) |
| Perfect competition | P = MR = MC |
| Short-run shutdown | P < AVC (min AVC = shutdown point) |
| Long-run exit | P < ATC (min ATC = breakeven point) |
| Monopoly markup | MR = P(1 − 1/\|E_P\|) |
| N-firm concentration ratio | CR_N = Σ_{i=1}^{N} market share_i |
| Herfindahl–Hirschman Index | HHI = Σ s_i² (1/HHI = equivalent number of equal-sized firms) |
| Price elasticity | E_P = %ΔQ/%ΔP |

**Oligopoly models:**
- Cournot: firms choose quantity; P_Cournot lies between competitive and monopoly prices.
- Stackelberg: first-mover advantage.
- Kinked demand: price rigidity.
- Dominant firm.
- Nash equilibrium.

### 2.2 Macro policy `[L1]`

| Concept | Formula |
|---|---|
| Fiscal multiplier | 1/[1 − c(1 − t)] (c = MPC, t = tax rate) |
| Balanced-budget multiplier | 1 |
| Money multiplier | 1/reserve requirement |
| Quantity theory of money | MV = PY |
| Fisher effect | i_nominal ≈ r_real + π^e |
| Neutral policy rate | real trend growth + inflation target |

### 2.3 Foreign exchange `[L1] [L2]`

| Concept | Formula |
|---|---|
| Quote convention | S(P/B) = units of the **price** currency per 1 unit of the **base** currency |
| % change of the base currency | S1/S0 − 1 |
| % change of the price currency | S0/S1 − 1 |
| Cross rate | (A/C) = (A/B) × (B/C) |
| Cross rate with bid/offer `[L2]` | bid(A/C) = bid(A/B) × bid(B/C); offer(A/C) = offer(A/B) × offer(B/C). To invert: bid(B/A) = 1/offer(A/B) |
| Real exchange rate | q(d/f) = S(d/f) × (P_f/P_d) |
| Covered interest parity (forward) | F(P/B) = S(P/B) × (1 + i_P·τ)/(1 + i_B·τ), τ = days/360 |
| Forward premium/discount | F − S = S × [(i_P − i_B)τ]/(1 + i_B·τ) |
| Forward points | (F − S) × 10⁴ (scale varies by pair) |
| Mark-to-market of a forward `[L2]` | V_t = (F_t − F_0) × notional (price ccy)/(1 + i_P × days_remaining/360). Use the offsetting bid/offer forward rate |
| Uncovered interest parity `[L2]` | E[%ΔS(P/B)] ≈ i_P − i_B |
| Relative PPP `[L2]` | %ΔS(P/B) ≈ π_P − π_B |
| International Fisher effect `[L2]` | i_P − i_B ≈ π^e_P − π^e_B (real rates equal) |
| Forward rate parity `[L2]` | F = E(S_T) if CIP and UIP both hold |
| Carry trade `[L2]` | Return ≈ i_high − i_low − %depreciation of the high-yield currency |
| Triangular arbitrage `[L2]` | Compare the implied cross bid/offer with the dealer quote |

**Mundell–Fleming effects on the domestic currency:**

| Capital mobility | Monetary policy | Fiscal policy | Currency effect |
|---|---|---|---|
| High | Expansionary | Expansionary | Ambiguous |
| High | Restrictive | Expansionary | Appreciation |
| High | Expansionary | Restrictive | Depreciation |
| Low | — | — | Trade-flow effects dominate; fiscal expansion depreciates the currency |

### 2.4 Economic growth `[L2]`

| Concept | Formula |
|---|---|
| Cobb–Douglas production function | Y = A·K^α·L^(1−α) (α = capital's share of income) |
| Growth accounting | %ΔY = %ΔA + α·%ΔK + (1 − α)·%ΔL |
| Labour-productivity approach | Potential GDP growth = long-term labour-force growth + long-term labour-productivity growth |
| Labour productivity | Y/L = A(K/L)^α (capital deepening has diminishing returns) |
| Solow steady state | Per-capita growth g* = θ/(1 − α); total output growth G* = θ/(1 − α) + n (θ = TFP growth, n = labour growth) |
| Equity market and GDP | %ΔP ≈ %ΔGDP + %Δ(E/GDP) + %Δ(P/E); in the long run only GDP growth persists |

---

## 3. Financial Statement Analysis

### 3.1 Income statement, EPS and cash flow `[L1]`

| Concept | Formula |
|---|---|
| Basic EPS | (NI − preferred dividends)/weighted-average shares |
| Diluted EPS | [NI − pref div + convertible pref div + convertible debt interest × (1 − t)]/[WASO + shares from conversions + shares from options/warrants (TSM)] |
| Treasury stock method (new shares) | n − (n × X)/P̄; only dilutive if P̄ > X |
| Antidilution check | Exclude any security whose per-incremental-share EPS > basic EPS |
| Comprehensive income | NI + OCI |
| Indirect CFO | NI + D&A + other non-cash charges − gains + losses − Δ(operating current assets) + Δ(operating current liabilities) |
| Direct CFO: cash from customers | Revenue − ΔAR + Δunearned revenue |
| Direct CFO: cash to suppliers | COGS + Δinventory − ΔAP |
| Direct CFO: cash to employees | Salary expense − Δsalaries payable |
| Direct CFO: cash interest | Interest expense − Δinterest payable (+ bond discount amortization adj.) |
| Direct CFO: cash taxes | Tax expense − Δtaxes payable + ΔDTA − ΔDTL |
| PP&E cash from sale | Proceeds = BV sold + gain (− loss); BV sold = beg PP&E + purchases − end PP&E − depreciation |
| FCFF | CFO + Int(1 − t) − FCInv |
| FCFE | CFO − FCInv + net borrowing |

**IFRS vs US GAAP cash-flow classification:**

| Item | US GAAP | IFRS |
|---|---|---|
| Interest and dividends received | CFO | CFO or CFI |
| Interest paid | CFO | CFO or CFF |
| Dividends paid | CFF | CFO or CFF |
| Taxes | CFO | CFO, unless specifically identified with investing or financing |

### 3.2 Inventory, long-lived assets, taxes, leases `[L1]`

| Concept | Formula |
|---|---|
| Inventory identity | BI + purchases − COGS = EI |
| LIFO to FIFO adjustment | Inv_FIFO = Inv_LIFO + LIFO reserve; COGS_FIFO = COGS_LIFO − ΔLIFO reserve |
| LIFO to FIFO retained earnings | RE_FIFO = RE_LIFO + LIFO reserve × (1 − t) |
| Straight-line depreciation | (cost − salvage)/useful life |
| Double-declining balance | 2/useful life × beginning BV (stop at salvage) |
| Units of production | (cost − salvage)/total units × units used |
| Average age of PP&E | accumulated depreciation/depreciation expense |
| Average total useful life | gross PP&E/depreciation expense |
| Remaining useful life | net PP&E/depreciation expense |
| Impairment (IFRS) | Carrying amount > recoverable amount [= max(FV − costs to sell, value in use)]; loss may reverse |
| Impairment (US GAAP) | Recoverability test (undiscounted CF < carrying amount), then loss = carrying amount − FV; no reversal |
| Income tax expense | Taxes payable + ΔDTL − ΔDTA |
| Deferred tax liability (asset) | (carrying amount − tax base) × tax rate. For an asset, a positive difference creates a DTL. For a liability, a carrying amount above the tax base creates a DTA |
| Effective tax rate | income tax expense/pretax income |
| Cash tax rate | cash taxes paid/pretax income |
| Lease liability at inception | PV of lease payments (rate implicit in the lease or incremental borrowing rate) |
| Lessee finance lease expense | Depreciation of ROU asset + interest on lease liability (interest = r × opening liability) |

**Effect of LIFO vs FIFO in rising prices:** LIFO gives higher COGS, lower NI, lower inventory, lower taxes, and higher CFO.

**Lease accounting (lessee):** IFRS 16 uses a single finance-lease model. ASC 842 operating leases use a single straight-line lease cost.

### 3.3 Ratio analysis `[L1]`

| Category | Ratios |
|---|---|
| Activity | Inventory turnover = COGS/avg inventory; DOH = 365/inv. turnover; receivables turnover = revenue/avg AR; DSO = 365/rec. turnover; payables turnover = purchases/avg AP; DPO = 365/payables turnover; WC turnover = revenue/avg WC; fixed asset turnover = revenue/avg net fixed assets; total asset turnover = revenue/avg TA |
| Liquidity | Current = CA/CL; quick = (cash + ST mkt securities + receivables)/CL; cash = (cash + ST mkt sec.)/CL; defensive interval = (cash + ST mkt sec. + receivables)/daily cash expenditures; CCC = DOH + DSO − DPO |
| Solvency | D/A; D/capital = D/(D + E); D/E; financial leverage = avg TA/avg TE; interest coverage = EBIT/interest; fixed charge coverage = (EBIT + lease pmts)/(interest + lease pmts) |
| Profitability | Gross, operating, pretax and net margin; ROA = NI/avg TA (or [NI + int(1 − t)]/avg TA); operating ROA = EBIT/avg TA; ROTC = EBIT/(D + E); ROE = NI/avg TE |
| Valuation | P/E, P/CF, P/S, P/BV; dividend payout = div/NI; retention b = 1 − payout; sustainable g = b × ROE |
| DuPont (3-step) | ROE = (NI/Rev)(Rev/TA)(TA/E) |
| DuPont (5-step) | ROE = (NI/EBT)(EBT/EBIT)(EBIT/Rev)(Rev/TA)(TA/E) = tax burden × interest burden × EBIT margin × asset turnover × leverage |
| Credit (FI) | EBITDA/interest; debt/EBITDA; FFO/debt; RCF/net debt; (FCF after div)/debt |
| Cash-flow ratios | CFO/revenue; CFO/avg TA; CFO/avg equity; CFO/operating income; cash coverage = (CFO + interest paid + taxes paid)/interest paid; reinvestment = CFO/cash paid for LT assets; debt payment = CFO/cash LT debt repayment; investing & financing = CFO/cash outflows for investing & financing |

### 3.4 Intercorporate investments, pensions, FX translation `[L2]`

| Concept | Formula / rule |
|---|---|
| Equity method (20–50%; significant influence) | Investment_end = beginning + share of investee NI − dividends received − amortization of excess (FV − BV) on depreciable assets ± impairment. Unrealized upstream/downstream profits are eliminated in proportion to ownership |
| Acquisition method: full goodwill | Goodwill = FV of entire acquiree − FV of identifiable net assets; NCI = % NCI × FV of entire acquiree (required under US GAAP; IFRS option) |
| Acquisition method: partial goodwill (IFRS option) | Goodwill = purchase price − % acquired × FV of identifiable net assets; NCI = % NCI × FV of identifiable net assets |
| Bargain purchase | Gain in P&L |
| Pension funded status | FV of plan assets − PBO (negative = underfunded liability) |
| PBO roll-forward | PBO_end = PBO_beg + current service cost + interest cost (discount rate × PBO_beg) + past service cost ± actuarial losses/(gains) − benefits paid |
| Plan assets roll-forward | Assets_end = assets_beg + actual return + employer contributions − benefits paid |
| IFRS pension | P&L = service cost (current + past) + net interest expense/income (discount rate × beginning net DB liability/asset). OCI = remeasurements (actuarial G/L + actual return − interest income on plan assets), not recycled |
| US GAAP pension | P&L = current service cost + interest cost − **expected** return on plan assets + amortization of past service cost + amortization of actuarial losses (corridor). Past service cost and actuarial G/L go to OCI first |
| Total periodic pension cost (TPPC) | Employer contributions − (ending funded status − beginning funded status) |
| Economic pension expense | TPPC; reclassify the CFO/CFF difference between TPPC and contributions (after tax) |
| Current rate method (functional ≠ parent's currency) | Assets and liabilities at the current rate; common stock at historical; revenue and expenses at average (or transaction) rate; CTA in OCI/equity. Exposure = net assets |
| Temporal method (functional = parent's currency, or hyperinflationary under US GAAP) | Monetary items at the current rate; non-monetary items (inventory at cost, PP&E) at historical; COGS and depreciation at historical; remeasurement G/L in NI. Exposure = net monetary assets/liabilities |
| Hyperinflation | US GAAP uses the temporal method when cumulative 3-yr inflation > 100%. IFRS restates for inflation (IAS 29), then translates at the current rate; the net monetary position gain/loss goes to NI |
| Sales growth decomposition | Total growth ≈ organic (volume + price) + FX effect + acquisitions/divestitures |

**Ratio effects:**
- Current rate method: pure BS and IS ratios are preserved.
- Temporal method: ratios mixing historical and current rates are distorted.

### 3.5 Financial institutions and reporting quality `[L2]`

| Concept | Formula / rule |
|---|---|
| Basel III minimum capital | CET1/RWA ≥ 4.5%; Tier 1/RWA ≥ 6%; total capital/RWA ≥ 8%; + capital conservation buffer 2.5% (+ countercyclical/G-SIB buffers) |
| Liquidity coverage ratio | LCR = HQLA/30-day stressed net cash outflows ≥ 100% |
| Net stable funding ratio | NSFR = available stable funding/required stable funding ≥ 100% |
| Net interest margin | NIM = net interest income/avg interest-earning assets |
| Efficiency ratio | Non-interest expense/revenue |
| Combined ratio (P&C insurer) | Loss & LAE ratio + underwriting expense ratio (> 100% = underwriting loss) |
| Accruals | Accruals = NI − CFO (≈ ΔNOA) |
| Balance-sheet accruals ratio | (NOA_end − NOA_beg)/[(NOA_end + NOA_beg)/2], with NOA = (TA − cash) − (TL − total debt) |
| Cash-flow accruals ratio | [NI − (CFO + CFI)]/avg NOA |
| Beneish M-score | M = −4.84 + 0.920 DSRI + 0.528 GMI + 0.404 AQI + 0.892 SGI + 0.115 DEPI − 0.172 SGAI + 4.679 Accruals − 0.327 LEVI. M > −1.78 means likely manipulator (8-variable model) |
| Altman Z-score | Z = 1.2(WC/TA) + 1.4(RE/TA) + 3.3(EBIT/TA) + 0.6(MV equity/BV liabilities) + 1.0(Sales/TA); < 1.81 means distress zone |
| Earnings persistence | E_{t+1} = α + β1·cash component + β2·accrual component + ε; typically β2 < β1, so high-accrual earnings revert faster |

**CAMELS:** Capital adequacy, Asset quality, Management, Earnings, Liquidity, Sensitivity to market risk.

---

## 4. Corporate Issuers / Corporate Finance

### 4.1 Level I

| Concept | Formula |
|---|---|
| Net present value | NPV = Σ_{t=0}^{N} CF_t/(1 + r)^t |
| Internal rate of return | Σ CF_t/(1 + IRR)^t = 0 |
| Return on invested capital | ROIC = after-tax operating profit/average invested capital (debt + equity) |
| NPV with a real option | Project NPV = NPV(without option) − cost of option + value of option |
| Weighted average cost of capital | WACC = w_d·r_d(1 − t) + w_p·r_p + w_e·r_e (target market-value weights) |
| MM Prop I (no taxes) | V_L = V_U |
| MM Prop II (no taxes) | r_e = r_0 + (r_0 − r_d)(D/E); WACC constant |
| MM Prop I (with taxes) | V_L = V_U + t·D |
| MM Prop II (with taxes) | r_e = r_0 + (r_0 − r_d)(1 − t)(D/E); WACC falls with D |
| Static trade-off | V_L = V_U + tD − PV(costs of financial distress) |
| Cash conversion cycle | CCC = DIO + DSO − DPO |
| Cost of trade credit (forgone discount) | (1 + discount/(1 − discount))^(365/days beyond discount period) − 1 |
| Operating leverage (legacy L1; still useful) | DOL = %ΔEBIT/%ΔSales = Q(P − V)/[Q(P − V) − F] |
| Financial leverage (legacy L1; still useful) | DFL = %ΔNI/%ΔEBIT = EBIT/(EBIT − I) |
| Total leverage (legacy L1; still useful) | DTL = DOL × DFL |

**Capital structure theories:** pecking order (internal funds → debt → equity), signalling, and agency costs (of equity and of debt).

### 4.2 Level II

| Concept | Formula |
|---|---|
| Effective tax rate on dividends: double taxation | ETR = CT + (1 − CT)·TD |
| Effective tax rate on dividends: split-rate | ETR = CT_D + (1 − CT_D)·TD (CT_D = corporate rate on distributed earnings) |
| Effective tax rate on dividends: imputation | ETR = shareholder's marginal tax rate |
| Target payout adjustment (Lintner) | Expected Δdiv = (EPS_new × target payout − D_prev) × adjustment factor (1/years to adjust) |
| Share repurchase with surplus cash | EPS_after = (NI − forgone after-tax interest on cash)/(shares − repurchased) |
| Share repurchase with debt | EPS_after = [NI − after-tax interest on new debt]/(shares − repurchased); EPS rises if earnings yield (E/P) > after-tax cost of debt |
| Repurchased shares | Amount/price |
| BVPS after repurchase | (BV_equity − repurchase amount)/remaining shares; falls if repurchase price > BVPS |
| Dividend coverage ratio | NI/dividends |
| FCFE coverage ratio | FCFE/(dividends + share repurchases) |
| ERP: GGM approach | ERP = D1/P0 + g − r_LT gov |
| ERP: macro (Ibbotson–Chen) | ERP = {[1 + E(Inf)][1 + E(rEg)][1 + E(PEg)] − 1 + E(Y)} − E(RF) (Inf = inflation, rEg = real EPS growth, PEg = P/E change, Y = yield income) |
| Bond yield plus risk premium | r_e = YTM on LT debt + risk premium (≈3–5%) |
| Build-up method | r_e = Rf + ERP + size premium + specific-company premium (± industry premium) |
| Expanded CAPM | r_e = Rf + β·ERP + size premium + specific-company premium |
| Country risk premium | CRP = sovereign yield spread × (σ_equity index/σ_sovereign bond) |
| Unlevered (asset) beta | β_A = β_E/[1 + (1 − t)(D/E)] |
| Relevered beta | β_E = β_A[1 + (1 − t)(D/E)] |
| Blume adjusted beta | β_adj = (2/3)β_raw + (1/3)(1.0) |
| Pre-tax cost of debt | YTM, or (for unrated debt) synthetic rating from coverage ratios |
| Restructuring: pro forma EPS | (NI_acq + NI_target + synergies × (1 − t) − after-tax financing cost)/(acquirer shares + new shares issued) |
| Restructuring: acquisition premium | (offer price − unaffected price)/unaffected price |
| Restructuring: leverage | Net debt/EBITDA |

**Restructuring:** compare with the pre-deal EPS to judge accretion or dilution.

---

## 5. Equity

### 5.1 Markets and indexes `[L1]`

| Concept | Formula |
|---|---|
| Leverage ratio | 1/initial margin |
| Return on a margin transaction | [(P1 − P0) × shares + dividends − interest − commissions]/initial equity |
| Margin-call price (long) `[L1-26]` | P0 × (1 − IM)/(1 − MM) |
| Margin-call price (short) `[L1-26]` | P0 × (1 + IM)/(1 + MM) |
| Price-weighted index | V = ΣP_i/divisor (divisor adjusted for splits) |
| Market-cap weighted index | w_i = (Q_i·P_i)/Σ(Q_j·P_j); float-adjusted uses float shares |
| Equal-weighted index return | (1/N)ΣR_i |
| Price return of an index | Σ w_i·PR_i = (V_1 − V_0)/V_0 |
| Total return of an index | Σ w_i·TR_i = (V_1 − V_0 + income)/V_0 |
| Float `[L1-27]` | Shares outstanding − closely held/restricted shares |
| Average daily volume `[L1-27]` | ADV = Σ volume/days |

### 5.2 Valuation models `[L1 basic → L2 advanced]`

| Concept | Formula |
|---|---|
| Preferred stock | V0 = D_p/r_p |
| Gordon growth model | V0 = D1/(r − g) = D0(1 + g)/(r − g) |
| Implied required return | r = D1/P0 + g |
| Sustainable growth | g = b × ROE = (1 − payout) × ROE |
| Multistage DDM | V0 = Σ_{t=1}^{n} D_t/(1 + r)^t + V_n/(1 + r)^n, where V_n = D_{n+1}/(r − g_L) |
| H-model `[L2]` | V0 = D0(1 + g_L)/(r − g_L) + D0·H·(g_S − g_L)/(r − g_L); H = half the length of the high-growth period |
| H-model required return `[L2]` | r = (D0/P0)[(1 + g_L) + H(g_S − g_L)] + g_L |
| PVGO `[L2]` | V0 = E1/r + PVGO |
| No-growth value | E1/r (with b = 0) |
| Justified leading P/E | P0/E1 = (1 − b)/(r − g) = 1/r + PVGO/E1 |
| Justified trailing P/E | P0/E0 = (1 − b)(1 + g)/(r − g) |
| Justified P/B | P0/B0 = (ROE − g)/(r − g) |
| Justified P/S | P0/S0 = (E0/S0)(1 − b)(1 + g)/(r − g) |
| Justified dividend yield | D0/P0 = (r − g)/(1 + g) |
| PEG ratio `[L2]` | (P/E)/g, with g in percentage points |
| Normalized EPS (historical average) `[L2]` | Average EPS over the cycle |
| Normalized EPS (average ROE) `[L2]` | Average ROE × current BVPS |
| Terminal value via a multiple `[L2]` | V_n = justified (or comparables) multiple × E_n (or E_{n+1}) |
| Harmonic mean of multiples `[L2]` | X̄_H = n/Σ(1/X_i); weighted: 1/Σ(w_i/X_i) |
| Earnings surprise `[L2]` | Unexpected EPS = actual − expected; SUE = (actual − expected)/σ(surprises) |
| Enterprise value | EV = MV common + MV preferred + MV debt + NCI − cash & ST investments |
| EV multiples | EV/EBITDA, EV/sales, EV/EBIT |

### 5.3 Free cash flow `[L2]` (introduced at `[L1]`)

| Concept | Formula |
|---|---|
| FCFF from NI | FCFF = NI + NCC + Int(1 − t) − FCInv − WCInv |
| FCFF from CFO | FCFF = CFO + Int(1 − t) − FCInv |
| FCFF from EBIT | FCFF = EBIT(1 − t) + Dep − FCInv − WCInv |
| FCFF from EBITDA | FCFF = EBITDA(1 − t) + Dep·t − FCInv − WCInv |
| FCFE from FCFF | FCFE = FCFF − Int(1 − t) + net borrowing |
| FCFE from NI | FCFE = NI + NCC − FCInv − WCInv + net borrowing |
| FCFE from CFO | FCFE = CFO − FCInv + net borrowing |
| FCFE with a target debt ratio DR | FCFE = NI − (1 − DR)(FCInv − Dep) − (1 − DR)WCInv |
| Firm value (single stage) | V_firm = FCFF1/(WACC − g) |
| Equity value from firm value | V_firm − MV debt (− preferred) |
| Equity value (single stage) | V_equity = FCFE1/(r − g) |
| Multistage | Σ PV of explicit FCF + PV of terminal value |

**Variable definitions:**
- NCC = non-cash charges (D&A, impairments, restructuring charges; subtract non-cash gains).
- FCInv = capex − proceeds from asset sales.
- WCInv = increase in working capital, excluding cash and short-term debt.

### 5.4 Residual income `[L2]`

| Concept | Formula |
|---|---|
| Residual income | RI_t = E_t − r·B_{t−1} = (ROE_t − r)·B_{t−1} |
| Economic value added | EVA = NOPAT − (WACC × total capital) = EBIT(1 − t) − $WACC |
| Market value added | MVA = MV of the company − total book capital |
| RI valuation | V0 = B0 + Σ_{t=1}^{∞} RI_t/(1 + r)^t |
| Single-stage RI | V0 = B0 + (ROE − r)·B0/(r − g) |
| Implied growth in RI | g = r − [B0(ROE − r)]/(V0 − B0) |
| Multistage RI with persistence ω | V0 = B0 + Σ_{t=1}^{T−1} RI_t/(1 + r)^t + RI_T/[(1 + r − ω)(1 + r)^{T−1}], 0 ≤ ω ≤ 1 |
| Terminal premium over book | PT − BT at horizon, discounted |
| Clean-surplus relation | B_t = B_{t−1} + E_t − D_t |
| Tobin's q | (MV debt + MV equity)/replacement cost of assets |

### 5.5 Private company valuation `[L2]`

| Concept | Formula |
|---|---|
| Discount for lack of control | DLOC = 1 − 1/(1 + control premium) |
| Total combined discount | 1 − (1 − DLOC)(1 − DLOM) (multiplicative) |
| Capitalized cash flow method | V = FCFF1/(WACC − g) or FCFE1/(r − g) |
| Excess earnings method | Excess earnings = normalized earnings − required returns on working capital and fixed assets; V_intangibles = excess earnings × (1 + g)/(r_intangibles − g); V = WC + fixed assets + intangibles |
| Guideline public company / transaction methods | Value = adjusted multiple × private-company metric (± control premium) |

### 5.6 Cost of equity and factor models `[L1] [L2]`

| Concept | Formula |
|---|---|
| CAPM | E(R_i) = R_f + β_i[E(R_m) − R_f] |
| Market model | R_i = α_i + β_i·R_m + ε_i |
| APT / multifactor | E(R_i) = R_f + Σ β_ik·λ_k (λ_k = factor risk premium) |
| Fama–French 3-factor | R_i − R_f = α + b_m(R_m − R_f) + b_s·SMB + b_v·HML (+ momentum WML in Carhart) |
| Pastor–Stambaugh | Adds a liquidity factor |

---

## 6. Fixed Income

### 6.1 Prices and yields `[L1]`

| Concept | Formula |
|---|---|
| Bond price | P = Σ_{t=1}^{N} PMT/(1 + r)^t + FV/(1 + r)^N (r = yield per period) |
| Full (dirty) price | PV_full = PV_flat + AI = PV_coupon-date × (1 + r)^(t/T) |
| Accrued interest | AI = (t/T) × PMT (t = days since last coupon; T = days in period; act/act or 30/360) |
| Periodicity conversion | (1 + APR_m/m)^m = (1 + APR_n/n)^n |
| Current yield | Annual coupon/flat price |
| Yield to worst | min(YTM, YTC at each call date) |
| G-spread | YTM_bond − YTM_gov (interpolated, same maturity) |
| I-spread | YTM_bond − swap rate |
| Z-spread | Constant spread over the spot curve: P = Σ PMT/(1 + z_t + Z)^t |
| Option-adjusted spread | OAS = Z-spread − option cost (callable: OAS < Z; putable: OAS > Z) |
| FRN pricing | PV = Σ [(MRR + QM) × FV/m]/(1 + (MRR + DM)/m)^t + FV/(1 + (MRR + DM)/m)^N; QM = quoted margin, DM = discount margin |
| Money market: discount basis | PV = FV × (1 − (Days/Year) × DR); DR = (Year/Days)(FV − PV)/FV |
| Money market: add-on basis | PV = FV/(1 + (Days/Year) × AOR); AOR = (Year/Days)(FV − PV)/PV |
| Bond-equivalent yield (MM) | Add-on rate on a 365-day year |
| Spot-rate pricing | P = Σ PMT/(1 + z_t)^t + FV/(1 + z_N)^N |
| Par rate | Coupon c such that Σ c·DF_t + DF_N = 1 |
| Forward from spots | (1 + z_B)^B = (1 + z_A)^A(1 + f_{A,B−A})^(B−A) |
| Discount factor | DF_t = 1/(1 + z_t)^t |
| Repo interest | Loan amount × repo rate × days/360 |
| Repo haircut | (collateral value − loan)/collateral value |

**Matrix pricing:** interpolate yields of comparable liquid bonds by maturity and credit rating.

### 6.2 Interest-rate risk `[L1]`

| Concept | Formula |
|---|---|
| Macaulay duration | MacDur = Σ t × [PV(CF_t)/P] (in periods; divide by periodicity to get years) |
| Macaulay duration (closed form) | MacDur = (1 + r)/r − [1 + r + N(c − r)]/{c[(1 + r)^N − 1] + r} − t/T |
| Modified duration | ModDur = MacDur/(1 + r) |
| Approximate modified duration | ApproxModDur = (PV₋ − PV₊)/(2 × ΔYield × PV₀) |
| Approximate convexity | ApproxCon = (PV₋ + PV₊ − 2PV₀)/[(ΔYield)² × PV₀] |
| Price change | %ΔPV_full ≈ −AnnModDur × ΔYield + ½ × AnnConvexity × (ΔYield)² |
| Money duration | MoneyDur = AnnModDur × PV_full |
| Money convexity | AnnConvexity × PV_full |
| Price value of a basis point | PVBP = (PV₋ − PV₊)/2 (for ±1 bp) |
| Effective duration (bonds with options; curve shifts) | EffDur = (PV₋ − PV₊)/(2 × ΔCurve × PV₀) |
| Effective convexity | EffCon = (PV₋ + PV₊ − 2PV₀)/[(ΔCurve)² × PV₀] |
| Key-rate durations | KeyRateDur_k = −(1/PV)(ΔPV/Δr_k); Σ KRD = EffDur |
| Portfolio duration | ≈ Σ w_i × D_i (MV weights) |
| Duration gap | MacDur − investment horizon (> 0: price risk dominates; < 0: reinvestment risk dominates) |
| Perpetuity MacDur | (1 + r)/r |
| Zero-coupon MacDur | = maturity |

**Duration properties:** duration ↑ with longer maturity (usually), ↓ with higher coupon, ↓ with higher yield.

### 6.3 Credit `[L1] [L2]`

| Concept | Formula |
|---|---|
| Expected loss | EL = PD × LGD; LGD = EAD × (1 − recovery rate) |
| Credit spread approximation | Spread ≈ PD × LGD (annualized) |
| Spread-change return | %ΔP ≈ −(SpreadDur × ΔSpread) + ½ × Convexity × (ΔSpread)² |
| Credit valuation adjustment `[L2]` | CVA = Σ_t [LGD_t × POD_t × DF_t], with POD_t = hazard × POS_{t−1} and POS_t = (1 − hazard)^t |
| Value of a risky bond `[L2]` | VND − CVA |
| Credit spread from CVA `[L2]` | Solve for the YTM of the risky bond minus the YTM of the risk-free bond |
| Expected return with rating migration `[L2]` | E[%ΔP] = Σ p_i × (−ModDur × ΔSpread_i) |
| Merton structural model `[L2]` | Equity = call on firm assets: E = A·N(d1) − K·e^{−rT}·N(d2); debt = K·e^{−rT} − put on assets |
| Reduced-form model `[L2]` | Default is an exogenous Poisson event with hazard rate λ; value ≈ Σ CF·DF·(1 − λ)^t + recovery |

### 6.4 Term structure and binomial trees `[L2]`

| Concept | Formula |
|---|---|
| Forward pricing model | P(T* + T) = P(T*) × F(T*, T) |
| Forward rate model | [1 + r(T* + T)]^(T* + T) = [1 + r(T*)]^(T*) × [1 + f(T*, T)]^T |
| Swap spread | Swap rate − government yield (same tenor) |
| TED spread | MRR (3m) − T-bill yield |
| MRR–OIS spread | MRR − OIS rate |
| Binomial tree (lognormal) | r_{t,H} = r_{t,L} × e^{2σ√Δt} |
| Node value (no option) | V = ½[(V_H + C) + (V_L + C)]/(1 + r_node) |
| Callable bond node | V = min(call price, node value) |
| Putable bond node | V = max(put price, node value) |
| Bond with embedded options | V_callable = V_straight − V_call; V_putable = V_straight + V_put |
| Capped floater | Straight floater − cap |
| Floored floater | Straight floater + floor |
| Pathwise valuation | Average of PVs over all possible rate paths (2^(n−1) paths) |
| Cox–Ingersoll–Ross (CIR) | dr = k(θ − r)dt + σ√r·dz |
| Vasicek | dr = k(θ − r)dt + σ·dz |
| Ho–Lee | dr = θ_t dt + σ·dz |
| Kalotay–Williams–Fabozzi (KWF) | d ln r = θ_t dt + σ·dz |

**Effect of volatility:** higher σ lowers callable bond value and raises putable bond value. For a callable bond priced at market, higher assumed σ means a lower OAS.

**Term-structure models:** equilibrium models (CIR, Vasicek) vs arbitrage-free models (Ho–Lee, KWF).

**Yield-curve trades:** riding/rolling down the yield curve works with an upward-sloping, stable curve when expected forward rates exceed realized rates.

### 6.5 Convertible bonds `[L2]`

| Concept | Formula |
|---|---|
| Conversion value | Conversion ratio × share price |
| Conversion price | Issue price/conversion ratio |
| Market conversion price | Convertible price/conversion ratio |
| Market conversion premium per share | Market conversion price − share price |
| Market conversion premium ratio | Premium per share/share price |
| Premium over straight value | Convertible price/straight value − 1 |
| Minimum value | max(straight value, conversion value) |
| Convertible value (callable and putable) | Straight value + value of call on stock − value of issuer call + value of investor put |

### 6.6 Credit default swaps `[L2]`

| Concept | Formula |
|---|---|
| Upfront payment (paid by protection buyer if > 0) | PV(protection leg) − PV(premium leg) |
| Upfront payment (approximation) | ≈ (credit spread − fixed coupon) × EffSpreadDur_CDS × notional |
| CDS price | Per 100 notional = 100 − upfront % |
| Value change (protection buyer gains if spread widens) | ΔValue ≈ ΔSpread × EffSpreadDur × notional |
| Hazard-rate approximation | Spread ≈ hazard × (1 − RR) |
| Index CDS | Notional split equally across names; a defaulted name is removed |
| CDS–bond basis | Bond credit spread (e.g., Z-spread or asset swap spread) − CDS spread; basis trades exploit the difference |

**Standard coupons:** 1% (investment grade) or 5% (high yield).

### 6.7 Securitization `[L1]`

| Concept | Formula |
|---|---|
| Single monthly mortality ↔ conditional prepayment rate | CPR = 1 − (1 − SMM)^12 |
| PSA benchmark | 100 PSA: CPR rises 0.2% per month to 6% at month 30, then stays flat |
| Weighted average life | WAL = Σ (t × principal_t)/Σ principal_t |
| Loan-to-value | LTV = loan/property value |
| Debt service coverage | DSCR = NOI/debt service |

**Prepayment risk:** contraction risk when rates fall; extension risk when rates rise.

---

## 7. Derivatives

### 7.1 Payoffs and parity `[L1]`

| Concept | Formula |
|---|---|
| Call payoff | c_T = max(0, S_T − X); profit = c_T − c_0 |
| Put payoff | p_T = max(0, X − S_T); profit = p_T − p_0 |
| Long forward payoff | S_T − F_0(T) |
| Breakeven (long call) | X + c_0 |
| Breakeven (long put) | X − p_0 |
| Maximum loss (long option) | Premium |
| Maximum gain (short option) | Premium |
| Put–call parity | S_0 + p_0 = c_0 + X/(1 + r)^T (protective put = fiduciary call) |
| Put–call–forward parity | F_0(T)/(1 + r)^T + p_0 = c_0 + X/(1 + r)^T |
| Call lower bound | c_0 ≥ max(0, S_0 − X/(1 + r)^T) |
| Put lower bound (European) | p_0 ≥ max(0, X/(1 + r)^T − S_0) |
| Option value | Intrinsic (exercise) value + time value |

**Synthetic positions (from put–call parity):**
- Synthetic call = S + p − PV(X).
- Synthetic put = c − S + PV(X).

### 7.2 Forward commitments `[L1] [L2]`

| Concept | Formula |
|---|---|
| Forward price (no carry) | F_0(T) = S_0(1 + r)^T |
| Forward price with costs (C) and benefits (I) | F_0(T) = [S_0 − PV(I) + PV(C)](1 + r)^T |
| Forward price (continuous) | F_0 = S_0·e^{(r + c − i)T}; equity index with dividend yield δ: F_0 = S_0·e^{(r − δ)T} |
| Forward value at initiation | V_0 = 0 |
| Long forward value during life | V_t = [S_t − PV_t(I) + PV_t(C)] − F_0(T)/(1 + r)^(T − t), or PV[F_t − F_0] |
| Forward value at expiry | V_T = S_T − F_0(T) |
| FRA settlement (pay-fixed/long FRA receives) | Payment = (MRR − FRA rate) × τ × NA/(1 + MRR × τ) |
| FRA value before expiry `[L2]` | V = [(new FRA rate − old FRA rate) × τ × NA] discounted |
| Interest-rate futures | Price = 100 − (100 × MRR); BPV = NA × 0.0001 × (days/360) |
| Bond futures `[L2]` | Quoted futures price QFP = {[(S_0 + AI_0)(1 + r)^T] − AI_T − FVCI}/CF; CF = conversion factor; CTD = cheapest-to-deliver |
| Currency forward (discrete) `[L2]` | F_0(P/B) = S_0 × (1 + r_P)^T/(1 + r_B)^T |
| Currency forward (continuous) `[L2]` | S_0·e^{(r_P − r_B)T} |
| Fixed swap rate `[L1] [L2]` | r_FIX = (1 − DF_N)/Σ_{i=1}^{N} DF_i |
| Value to the receive-fixed party `[L2]` | V = NA × (FS_0 − FS_t) × Σ DF_i (remaining periods); pay-fixed is the opposite sign |
| Currency swap `[L2]` | Fixed rate in each currency from that currency's DFs; value = PV(receive leg) − S × PV(pay leg) |
| Equity swap (receive equity, pay fixed) `[L2]` | V = (S_t/S_{t−1}) × NA − [r_FIX × Σ DF + DF_N] × NA (from the last reset) |

**Forwards vs futures:** if the underlying is positively correlated with rates, the futures price is above the forward price.

### 7.3 Contingent claims `[L1 one-period] [L2 multi-period + BSM]`

| Concept | Formula |
|---|---|
| Binomial up/down factors | u = S^+/S_0; d = S^−/S_0 |
| Risk-neutral probability | π = [(1 + r) − d]/(u − d) |
| One-period call | c_0 = [π·c^+ + (1 − π)·c^−]/(1 + r) |
| Hedge ratio | h = (c^+ − c^−)/(S^+ − S^−); replicate the call with h shares and borrowing |
| Two-period call `[L2]` | c_0 = [π²c^{++} + 2π(1 − π)c^{+−} + (1 − π)²c^{−−}]/(1 + r)² |
| American options `[L2]` | At each node, value = max(exercise value, continuation value) |
| Black–Scholes–Merton (BSM) `[L2]` | c_0 = S_0e^{−δT}N(d1) − Xe^{−rT}N(d2); p_0 = Xe^{−rT}N(−d2) − S_0e^{−δT}N(−d1); d1 = [ln(S_0/X) + (r − δ + σ²/2)T]/(σ√T); d2 = d1 − σ√T. δ = continuous dividend yield (or the foreign rate for currency options) |
| BSM interpretation `[L2]` | Call = long N(d1) shares (delta) financed by borrowing Xe^{−rT}N(d2) |
| Black model (futures options) `[L2]` | c = e^{−rT}[F_0N(d1) − XN(d2)]; p = e^{−rT}[XN(−d2) − F_0N(−d1)]; d1 = [ln(F_0/X) + (σ²/2)T]/(σ√T) |
| Caplet (Black) `[L2]` | (NA × τ) × e^{−r(T+τ)}[F·N(d1) − X·N(d2)] (paid in arrears) |
| Cap / floor `[L2]` | Cap = Σ caplets; floor = Σ floorlets |
| Payer swaption (Black) `[L2]` | NA × AP × [FS·N(d1) − X·N(d2)]; AP = Σ DFs × accrual |
| Receiver swaption `[L2]` | NA × AP × [X·N(−d2) − FS·N(−d1)] |
| Swaption parity `[L2]` | Payer − receiver = value of a forward pay-fixed swap |
| Call delta `[L2]` | e^{−δT}N(d1) |
| Put delta `[L2]` | −e^{−δT}N(−d1) = call delta − e^{−δT} |
| Gamma `[L2]` | Same for calls and puts; highest at-the-money near expiry |
| Delta-neutral hedge `[L2]` | Number of hedging units N_H = −portfolio delta/delta_H |
| Option value change `[L2]` | Δc ≈ delta × ΔS + ½ × gamma × (ΔS)² |
| Other Greeks `[L2]` | Theta: time decay, usually negative for long options. Vega: positive for both calls and puts. Rho: calls +, puts − |

**Implied volatility:** the σ that equates the model price to the market price. Used for volatility smiles/skews and term structure.

---

## 8. Alternative Investments

| Concept | Formula / rule | Level |
|---|---|---|
| Management fee | Rate × committed capital (PE, investment period) or × AUM/NAV (hedge funds) | L1 |
| Incentive fee | Rate × max(0, return above hurdle, net of HWM). Hard hurdle: fee only on the excess. Soft hurdle with catch-up: GP gets 100% (or a %) of the profits above the hurdle until it reaches its share | L1 |
| High-water mark | Incentive fee only on NAV above the previous peak (after fees) | L1 |
| Net return | (end NAV − beg NAV − mgmt fee − incentive fee)/beg NAV | L1 |
| Waterfall types | European (whole-of-fund: LPs get capital + pref first) vs American (deal-by-deal); clawback | L1 |
| Multiple of invested capital | MOIC = (realized + unrealized value)/paid-in capital | L1 |
| PE paid-in multiples | DPI = distributions/paid-in; RVPI = NAV/paid-in; TVPI = DPI + RVPI (L1 concept; PE fund metrics) | L1 |
| Leveraged real estate return | [r × (V_E + V_B) − r_B × V_B]/V_E | L1 |
| Cap rate | NOI/value; value = NOI₁/cap rate | L1/L2 |
| Net operating income | Rental income (gross potential − vacancy & collection loss) + other income − operating expenses (excl. depreciation, interest, income taxes) | L1/L2 |
| Cap rate ≈ discount rate − growth | | L2 |
| DCF real estate | V = Σ NOI_t/(1 + r)^t + [NOI_{n+1}/terminal cap rate]/(1 + r)^n | L2 |
| Real estate debt metrics | DSCR = NOI/debt service; LTV = loan/value; equity dividend rate = first-year cash flow/equity | L2 |
| REIT NAVPS | [NOI_next/cap rate + cash & other tangible assets − liabilities]/shares | L2 |
| Funds from operations | FFO = NI + depreciation & amortization (RE) − gains on property sales + losses on property sales (± impairments) | L2 |
| Adjusted FFO | AFFO = FFO − non-cash rent (straight-line) − recurring capex/leasing costs | L2 |
| REIT valuation | P/FFO × FFO; P/AFFO × AFFO; DDM on REIT dividends | L2 |
| Commodity futures total return | Price (spot) return + roll return + collateral return | L1/L2 |
| Roll return | ≈ (F_near − F_far)/F_near: positive in backwardation, negative in contango | L2 |
| Commodity cost of carry | F_0 = S_0(1 + r) + storage − convenience yield | L1/L2 |
| Commodity theories | Insurance (normal backwardation; Keynes), hedging pressure, theory of storage | L2 |
| Hedge fund factor model | R_HF = α + Σ β_k F_k + ε (conditional models: exposures differ in crisis vs normal regimes) | L2 |

---

## 9. Portfolio Management / Construction

### 9.1 Level I

| Concept | Formula |
|---|---|
| Utility | U = E(r) − ½Aσ² (A = risk-aversion coefficient; A > 0 risk-averse) |
| Capital allocation line | E(R_p) = R_f + [(E(R_i) − R_f)/σ_i] × σ_p |
| Optimal risky weight (single risky asset) | y* = [E(R_i) − R_f]/(A·σ_i²) |
| Capital market line | E(R_p) = R_f + [(E(R_m) − R_f)/σ_m] × σ_p |
| Beta | β_i = Cov(R_i, R_m)/σ_m² = ρ_{i,m}σ_i/σ_m |
| CAPM / SML | E(R_i) = R_f + β_i[E(R_m) − R_f] |
| Total risk decomposition | σ_i² = β_i²σ_m² + σ_ε² (systematic + nonsystematic) |
| Equally weighted portfolio variance | σ_p² = σ̄²/N + [(N − 1)/N] × Cov̄ |
| Sharpe ratio | (R_p − R_f)/σ_p |
| Treynor ratio | (R_p − R_f)/β_p |
| M² | (R_p − R_f)(σ_m/σ_p) − (R_m − R_f), the excess over the market (or as a level: R_f + (R_p − R_f)σ_m/σ_p) |
| Jensen's alpha | α_p = R_p − [R_f + β_p(R_m − R_f)] |

**Behavioural biases:**
- Cognitive, belief perseverance: conservatism, confirmation, representativeness, illusion of control, hindsight.
- Cognitive, information processing: anchoring and adjustment, mental accounting, framing, availability.
- Emotional: loss aversion, overconfidence, self-control, status quo, endowment, regret aversion.

### 9.2 Level II

| Concept | Formula |
|---|---|
| Fundamental pricing equation | P_0 = Σ E(CF_t)/(1 + l_t + θ_t + ρ_t)^t (l = real rf, θ = expected inflation, ρ = risk premium) |
| Breakeven inflation | Nominal yield − real (ILB) yield = expected inflation + inflation risk premium |
| Inter-temporal rate of substitution | m_t = u′(c_t)/u′(c_0) (ratio of marginal utilities); default-free bond P_0 = E(m_t) × payoff |
| Active return | R_A = R_P − R_B = Σ Δw_i·R_i (Δw = active weights) |
| Active risk (tracking error) | σ(R_A) = σ(R_P − R_B) |
| Information ratio | IR = (R_P − R_B)/σ(R_P − R_B) |
| Sharpe of an optimally combined portfolio | SR_P² = SR_B² + IR² |
| Optimal active risk | σ_A* = (IR/SR_B) × σ_B |
| Total portfolio risk | σ_P² = σ_B² + σ_A² |
| Fundamental law of active management | E(R_A) = TC × IC × √BR × σ_RA |
| Information ratio from the fundamental law | IR ≈ TC × IC × √BR (unconstrained TC = 1) |
| Market-timing IC | IC = 2 × (proportion correct) − 1 |
| APT | E(R_p) = R_F + λ_1β_{p,1} + … + λ_Kβ_{p,K} |
| Macro factor model | R_i = a_i + b_{i1}F_1 + … + ε_i (F = factor surprises) |
| Fundamental factor model | Standardized sensitivities b_{ik} = (X_ik − X̄_k)/σ_{X_k} |
| Active return attribution | Factor return Σ(β_{p,k} − β_{b,k})λ_k + security-selection return |
| Active risk squared | Active factor risk + active specific risk; active specific risk = Σ(w_i^a)²σ²_{ε_i} |
| Parametric VaR | VaR = [z × σ_p − E(R_p)] × V_p (as a positive loss); z_95% ≈ 1.65, z_99% ≈ 2.33 |
| Scaling (i.i.d.) | σ_T = σ_1√T; μ_T = μ_1·T |
| Historical simulation VaR | Loss at the chosen percentile of historical P&L |
| Monte Carlo VaR | Percentile of the simulated P&L distribution |
| Conditional VaR (expected shortfall) | Average loss beyond the VaR |
| Incremental VaR | ΔVaR from adding or changing a position |
| Marginal VaR | ∂VaR/∂w_i |
| Relative VaR | VaR of active return vs the benchmark |
| Sensitivity measures | Equity β; bond %ΔP ≈ −D·Δy + ½C·Δy²; option ΔV ≈ delta·ΔS + ½·gamma·ΔS² + vega·Δσ |
| ETF tracking difference | R_ETF − R_index |
| ETF tracking error | σ(R_ETF − R_index) |
| ETF premium/discount | (P_ETF − NAV)/NAV |
| ETF total cost of ownership | Expense ratio × holding period + round-trip trading costs (½ spread + commissions + market impact) × 2 |
| Sortino ratio | (R_p − MAR)/downside deviation |
| Maximum drawdown | max over t of (peak − trough)/peak |
| Rank IC | Spearman correlation of factor scores with subsequent returns |

**Sources of ETF tracking error:** fees, sampling/optimization, index changes, regulatory and tax requirements, fund accounting, securities lending, cash drag/dividend timing.

**Backtesting biases:** survivorship bias, look-ahead bias, data-snooping/overfitting, ignoring transaction costs and shorting constraints, and regime changes. Use rolling-window, point-in-time data.

---

## 10. Quick reference: "what changed" flags for the question bank

| Formula area | 2026 L1 | 2027 L1 |
|---|---|---|
| Margin call / leverage (Market Organization) | Yes | Not in LOs (flag) |
| Roy's SF ratio | Yes (Portfolio Mathematics) | Not explicit |
| χ² independence / contingency table | Yes | Not explicit (non-parametric tests remain) |
| Index weighting and returns | Equity | Moved to Quant (Benchmarking Returns) |
| CAPM regression estimation | — | New (Quant LM10 + Equities LM12) |
| RI and FCFF inputs at L1 | FCFF/FCFE in FSA | RI and FCFF/FCFE explicitly in Equities DCF LM |
| Float and ADV | — | New (Equities LM3) |
| GMV/efficient frontier calcs | Conceptual (PM) | Calculation in Quant LM8 |
| GIPS | Yes | Removed |

Level II formulas are identical for 2026 and 2027.

---

## Sources (accessed 2026-10-22)

- CFA Institute 2026 and 2027 Level I and Level II Topic Outlines (LO alignment):
  - https://www.cfainstitute.org/sites/default/files/docs/programs/cfa-program/2026-l1-topics-combined.pdf
  - https://www.cfainstitute.org/sites/default/files/2027levelitopicoutline_online.pdf
  - https://www.cfainstitute.org/sites/default/files/docs/programs/cfa-program/2026-l2-topics-combined.pdf
  - https://www.cfainstitute.org/sites/default/files/docs/programs/cfa-program/2027-cfa_l2_topic_outline.pdf
- Formulas are standard CFA-curriculum/textbook results (CFA Institute Investment Series texts; Kaplan Schweser, AnalystPrep and Mark Meldrum formula sheets follow the same notation). **Validate each formula against the official curriculum text before publishing questions.** Notation (e.g., M² definition, VaR sign, CDS basis sign) differs slightly across providers; where a choice was made, it is noted inline.
