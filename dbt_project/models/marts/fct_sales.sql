-- Mart model for governed sales metrics calculations
with stg_orders as (
    select * from {{ ref('stg_orders') }}
)

select
    order_id,
    order_date,
    year,
    quarter,
    month,
    region,
    country,
    product,
    category,
    quantity,
    revenue,
    cost,
    material_cost,
    shipping_cost,
    -- Governed metric formulas
    (revenue - cost) as margin,
    case
        when revenue > 0 then round(((revenue - cost) / revenue) * 100.0, 2)
        else 0.0
    end as margin_pct
from stg_orders
