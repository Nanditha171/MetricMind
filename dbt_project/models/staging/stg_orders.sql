-- Staging model for raw orders
with raw_orders as (
    select
        id as order_id,
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
        shipping_cost
    from fct_sales
)

select * from raw_orders
