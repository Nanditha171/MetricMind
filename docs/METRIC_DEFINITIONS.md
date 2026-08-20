# MetricMind — Governed Metric Definitions

Section 6 Rule: Metrics must have a single authoritative definition.
Never allow the LLM to invent a new definition for an existing metric.

| Metric Key | Label | SQL Formula Definition | Unit | Description |
| :--- | :--- | :--- | :--- | :--- |
| `revenue` | Revenue | `SUM(revenue)` | USD ($) | Total gross sales revenue |
| `cost` | Total Cost | `SUM(cost)` | USD ($) | Sum of material and shipping costs |
| `margin` | Operating Margin | `SUM(revenue - cost)` | USD ($) | Net operating margin dollars |
| `margin_pct` | Margin Percentage | `SUM(revenue - cost) / SUM(revenue) * 100` | Percentage (%) | Net operating margin percentage |
| `quantity` | Quantity Sold | `SUM(quantity)` | Units | Total physical units sold |
| `shipping_cost` | Shipping Cost | `SUM(shipping_cost)` | USD ($) | Freight & logistics shipping costs |
| `material_cost` | Material Cost | `SUM(material_cost)` | USD ($) | Component and raw material costs |

## Governed Dimensions
- `quarter` (e.g. 'Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026')
- `month` (e.g. '2025-07', '2025-10')
- `year` (e.g. 2025, 2026)
- `region` (e.g. 'Europe', 'North America', 'Asia-Pacific', 'Latin America')
- `country` (e.g. 'Germany', 'France', 'UK', 'USA', 'Canada', 'Japan', 'China', 'Brazil')
- `product` (e.g. 'Enterprise Server X1', 'Cloud SaaS License', 'AI Accelerator Hub')
- `category` (e.g. 'Hardware', 'Software', 'Services')
