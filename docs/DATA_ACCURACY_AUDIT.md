# MetricMind — Data Accuracy Audit Report

**Date of Audit**: August 18, 2026  
**Auditor**: Antigravity AI  
**Data Source**: `fct_sales` Data Mart in SQLite Database (`backend/data/metricmind.db`) via `GovernedSemanticEngine`

---

## 1. Data Source Used

All figures in this audit are calculated directly from the authoritative `fct_sales` table using the governed semantic layer SQL formula:
```sql
SELECT
    quarter,
    SUM(revenue) as revenue,
    SUM(cost) as cost,
    SUM(material_cost) as material_cost,
    SUM(shipping_cost) as shipping_cost,
    SUM(revenue - cost) as margin,
    ROUND((SUM(revenue - cost) / SUM(revenue)) * 100.0, 4) as margin_pct
FROM fct_sales
WHERE region = 'Europe' AND quarter IN ('Q3 2025', 'Q4 2025')
GROUP BY quarter;
```

---

## 2. Authoritative Period Results

### Europe — Q3 2025 (90 Orders)
- **Revenue**: `$9,187,819.18`
- **Total Cost**: `$4,766,938.91`
- **Material Cost**: `$4,174,697.37`
- **Shipping Cost**: `$592,241.54`
- **Operating Margin ($)**: `$4,420,880.27`
- **Margin Percentage (%)**: **`48.12%`** (`48.1168%`)

### Europe — Q4 2025 (90 Orders)
- **Revenue**: `$10,443,231.55`
- **Total Cost**: `$7,676,311.33`
- **Material Cost**: `$4,720,969.05`
- **Shipping Cost**: `$2,955,342.28`
- **Operating Margin ($)**: `$2,766,920.22`
- **Margin Percentage (%)**: **`26.49%`** (`26.4949%`)

---

## 3. Comparative Calculations & Terminology

### Margin Percentage-Point Difference
- **Formula**: `Q4 Margin % - Q3 Margin %`
- **Calculation**: `26.4949% - 48.1168% = -21.6219 percentage points`
- **Result**: **`-21.62 percentage points`** (or **`-21.63 percentage points`** based on rounded values)
- *Note*: Expressed strictly in **percentage points**.

### Relative Margin Percentage Change
- **Formula**: `((Q4 Margin % - Q3 Margin %) / Q3 Margin %) * 100`
- **Calculation**: `((-21.6219) / 48.1168) * 100 = -44.9363%`
- **Result**: **`-44.94%`** relative decrease
- *Note*: Expressed strictly in **percent change**.

### Material Cost Change
- **Dollar Change**: `$4,720,969.05 - $4,174,697.37 = +$546,271.68`
- **Percent Change**: `((+$546,271.68) / $4,174,697.37) * 100 = +13.09%` (`+13.0853%`)

### Shipping Cost Change
- **Dollar Change**: `$2,955,342.28 - $592,241.54 = +$2,363,100.74`
- **Percent Change**: `((+$2,363,100.74) / $592,241.54) * 100 = +399.01%` (`+399.0092%`)

---

## 4. Cost Increase Contribution Breakdown

- **Total Cost Increase**: `$7,676,311.33 - $4,766,938.91 = +$2,909,372.42` (`+61.03%`)
- **Shipping Cost Contribution to Increase**: `($2,363,100.74 / $2,909,372.42) * 100 = 81.22%`
- **Material Cost Contribution to Increase**: `($546,271.68 / $2,909,372.42) * 100 = 18.78%`

---

## 5. Root-Cause Conclusion

**Shipping Cost is undeniably the dominant contributor to the European margin decline.**

Between Q3 2025 and Q4 2025:
1. Shipping costs surged by **+399.01%** (from `$592,241.54` to `$2,955,342.28`), driving **81.22% of the total operating cost inflation**.
2. Material costs grew at a rate proportional to sales (+13.09% vs +13.66% revenue growth), accounting for only **18.78% of the cost increase**.
3. As a result, European margin percentage dropped by **21.62 percentage points** (a **44.94% relative decrease**).

---

## 6. Discrepancy Explanation

### Summary of Documented Values:
- **Early Design Placeholder Text**: `Q3 Margin = 46.7%`, `Q4 Margin = 28.3%`
- **Authoritative Executed Database Results**: `Q3 Margin = 48.12%`, `Q4 Margin = 26.49%`

### Root Cause of Discrepancy:
1. **Preliminary Mock Placeholders**: During initial project setup, prompt specification examples used simplified illustrative placeholders (assuming ~$4.5M revenue and ~$2.4M cost for Q3).
2. **Actual Seeded Data Mart Execution**: When `backend/app/database/seed.py` seeded the analytical database with `random.seed(42)`, it created 90 realistic orders per quarter for Europe across Germany, France, and UK.
3. **Ground Truth**: The exact aggregation of all 90 row items in `fct_sales` yields `$9.19M` revenue and `$4.42M` margin in Q3 (**48.12%**), and `$10.44M` revenue and `$2.77M` margin in Q4 (**26.49%**).
4. **Resolution**: **48.12% (Q3) and 26.49% (Q4)** represent the single authoritative, reproducible ground truth of MetricMind.
