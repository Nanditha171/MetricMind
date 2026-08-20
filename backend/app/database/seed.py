"""
Dataset Seed Generator for MetricMind.
Generates synthetic enterprise sales, cost, material cost, shipping cost, and regional analytics data
stored directly in SQLite / DuckDB for governed Semantic Layer testing and multi-step reasoning.
"""

import os
import sqlite3
import random
from datetime import datetime, timedelta

def get_db_path():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    data_dir = os.path.join(base_dir, "data")
    os.makedirs(data_dir, exist_ok=True)
    return os.path.join(data_dir, "metricmind.db")

def seed_database():
    db_path = get_db_path()
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Drop existing tables if re-seeding
    cursor.execute("DROP TABLE IF EXISTS fct_sales")
    cursor.execute("DROP TABLE IF EXISTS stg_orders")
    cursor.execute("DROP TABLE IF EXISTS dim_products")
    cursor.execute("DROP TABLE IF EXISTS dim_regions")

    # Create raw staging and mart tables
    cursor.execute("""
        CREATE TABLE fct_sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_date DATE NOT NULL,
            year INTEGER NOT NULL,
            quarter TEXT NOT NULL,
            month TEXT NOT NULL,
            region TEXT NOT NULL,
            country TEXT NOT NULL,
            product TEXT NOT NULL,
            category TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            revenue REAL NOT NULL,
            cost REAL NOT NULL,
            material_cost REAL NOT NULL,
            shipping_cost REAL NOT NULL,
            margin REAL NOT NULL,
            margin_pct REAL NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE dim_products (
            product_id INTEGER PRIMARY KEY,
            product_name TEXT NOT NULL,
            category TEXT NOT NULL,
            unit_price REAL NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE dim_regions (
            country TEXT PRIMARY KEY,
            region TEXT NOT NULL
        )
    """)

    # Seed Dimensions
    regions_map = {
        "Germany": "Europe",
        "France": "Europe",
        "UK": "Europe",
        "USA": "North America",
        "Canada": "North America",
        "Japan": "Asia-Pacific",
        "China": "Asia-Pacific",
        "Brazil": "Latin America"
    }

    for country, region in regions_map.items():
        cursor.execute("INSERT INTO dim_regions (country, region) VALUES (?, ?)", (country, region))

    products = [
        ("Enterprise Server X1", "Hardware", 12000.0),
        ("Cloud SaaS License", "Software", 2500.0),
        ("AI Accelerator Hub", "Hardware", 18000.0),
        ("Edge Sensor Pro", "Hardware", 850.0),
        ("Managed Security Operations", "Services", 5000.0)
    ]

    for idx, (p_name, p_cat, p_price) in enumerate(products, 1):
        cursor.execute("INSERT INTO dim_products (product_id, product_name, category, unit_price) VALUES (?, ?, ?, ?)",
                       (idx, p_name, p_cat, p_price))

    # Generate Fact Sales Data
    # 5 Quarters: Q1 2025, Q2 2025, Q3 2025, Q4 2025, Q1 2026
    quarters_config = [
        ("2025-01-15", 2025, "Q1 2025", "2025-01"),
        ("2025-04-15", 2025, "Q2 2025", "2025-04"),
        ("2025-07-15", 2025, "Q3 2025", "2025-07"),
        ("2025-10-15", 2025, "Q4 2025", "2025-10"),
        ("2026-01-15", 2026, "Q1 2026", "2026-01")
    ]

    rows = []
    random.seed(42)  # Deterministic seed for reproducible analytical tests

    for date_str, yr, qtr, mth in quarters_config:
        base_dt = datetime.strptime(date_str, "%Y-%m-%d")

        for country, region in regions_map.items():
            # Generate 30 orders per region/country combination per quarter
            for _ in range(30):
                offset_days = random.randint(0, 75)
                order_dt = base_dt + timedelta(days=offset_days)
                dt_str = order_dt.strftime("%Y-%m-%d")
                month_str = order_dt.strftime("%Y-%m")

                prod_name, category, unit_price = random.choice(products)
                quantity = random.randint(2, 25)
                revenue = round(quantity * unit_price * random.uniform(0.95, 1.05), 2)

                # Base cost components
                material_cost = round(revenue * random.uniform(0.42, 0.48), 2)

                # Special Seeded Multi-Step Scenario Logic:
                # In Q4 2025 for Europe (Germany, France, UK), shipping costs spike massively (+280%)
                # due to transatlantic container freight disruptions.
                if region == "Europe" and qtr == "Q4 2025":
                    shipping_cost = round(revenue * random.uniform(0.24, 0.32), 2)  # Massive spike!
                elif region == "Europe" and qtr == "Q3 2025":
                    shipping_cost = round(revenue * random.uniform(0.05, 0.08), 2)  # Normal low shipping
                else:
                    shipping_cost = round(revenue * random.uniform(0.06, 0.10), 2)  # Baseline shipping

                cost = round(material_cost + shipping_cost, 2)
                margin = round(revenue - cost, 2)
                margin_pct = round((margin / revenue) * 100.0, 2) if revenue > 0 else 0.0

                rows.append((
                    dt_str, yr, qtr, month_str, region, country, prod_name, category,
                    quantity, revenue, cost, material_cost, shipping_cost, margin, margin_pct
                ))

    cursor.executemany("""
        INSERT INTO fct_sales (
            order_date, year, quarter, month, region, country, product, category,
            quantity, revenue, cost, material_cost, shipping_cost, margin, margin_pct
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, rows)

    conn.commit()
    cursor.close()
    conn.close()
    print(f"[SUCCESS] MetricMind database seeded with {len(rows)} records at: {db_path}")

if __name__ == "__main__":
    seed_database()
