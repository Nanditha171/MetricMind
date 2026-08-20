# MetricMind — Data Dictionary

## Fact Table: `fct_sales` (Governed Sales Data Mart)

Target Data Mart containing underlying transaction level sales, costs, material expenses, shipping fees, and derived metrics.

| Column Name | Data Type | Constraint | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY | Unique surrogate order identifier | `101` |
| `order_date` | DATE | NOT NULL | Transaction date (YYYY-MM-DD) | `2025-10-15` |
| `year` | INTEGER | NOT NULL | Transaction year | `2025` |
| `quarter` | VARCHAR(10) | NOT NULL | Financial quarter | `Q4 2025` |
| `month` | VARCHAR(7) | NOT NULL | Financial month | `2025-10` |
| `region` | VARCHAR(50) | NOT NULL | Sales region | `Europe` |
| `country` | VARCHAR(50) | NOT NULL | Destination country | `Germany` |
| `product` | VARCHAR(100) | NOT NULL | Product line name | `Enterprise Server X1` |
| `category` | VARCHAR(50) | NOT NULL | High-level product category | `Hardware` |
| `quantity` | INTEGER | NOT NULL | Volume of units sold | `12` |
| `revenue` | FLOAT | NOT NULL | Total gross sales revenue ($) | `144000.00` |
| `cost` | FLOAT | NOT NULL | Total cost ($) = `material_cost` + `shipping_cost` | `88000.00` |
| `material_cost` | FLOAT | NOT NULL | Raw material & component cost ($) | `64000.00` |
| `shipping_cost` | FLOAT | NOT NULL | Transatlantic & freight shipping cost ($) | `24000.00` |
| `margin` | FLOAT | NOT NULL | Operating margin ($) = `revenue` - `cost` | `56000.00` |
| `margin_pct` | FLOAT | NOT NULL | Margin percentage (%) = (`margin` / `revenue`) * 100 | `38.89` |

## Dimension Table: `dim_products`
- `product_id`: PRIMARY KEY INT
- `product_name`: VARCHAR(100)
- `category`: VARCHAR(50)
- `unit_price`: FLOAT

## Dimension Table: `dim_regions`
- `country`: PRIMARY KEY VARCHAR(50)
- `region`: VARCHAR(50)
