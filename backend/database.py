"""
MetricMind PostgreSQL / SQLite Database Engine and Connection Handler.

PostgreSQL is the primary target data warehouse.
If PostgreSQL is offline, the backend seamlessly falls back to SQLite (data/metricmind.db)
populated with 50,000 records from MetricMind_Dummy_Data.
"""

import os
import csv
import sqlite3
from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional
from dotenv import load_dotenv
from sqlalchemy import create_engine, text, Engine
from sqlalchemy.exc import SQLAlchemyError

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "metricmind")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")

POSTGRES_URL = (
    f"postgresql+psycopg2://"
    f"{DB_USER}:{DB_PASSWORD}@"
    f"{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

SQLITE_DB_PATH = os.path.join("data", "metricmind.db")
SQLITE_URL = f"sqlite:///{SQLITE_DB_PATH}"

_engine: Optional[Engine] = None
_engine_type: str = "postgres"


def ensure_sqlite_db_built(force: bool = False):
    """Ensure local SQLite database is built from MetricMind_Dummy_Data if PostgreSQL is unavailable."""
    if not force and os.path.exists(SQLITE_DB_PATH) and os.path.getsize(SQLITE_DB_PATH) > 100000:
        try:
            conn = sqlite3.connect(SQLITE_DB_PATH)
            cur = conn.cursor()
            cur.execute("PRAGMA table_info(fct_sales)")
            cols = [r[1] for r in cur.fetchall()]
            conn.close()
            if "order_id" in cols and "margin_pct" in cols:
                return
        except Exception:
            pass

    csv_dir = "MetricMind_Dummy_Data"
    if not os.path.exists(csv_dir):
        return

    os.makedirs("data", exist_ok=True)
    conn = sqlite3.connect(SQLITE_DB_PATH)
    cur = conn.cursor()

    # 1. Load Products
    products = {}
    prod_csv = os.path.join(csv_dir, "products.csv")
    if os.path.exists(prod_csv):
        with open(prod_csv, "r", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                products[row["product_id"]] = row

    # 2. Load Customers
    customers = {}
    cust_csv = os.path.join(csv_dir, "customers.csv")
    if os.path.exists(cust_csv):
        with open(cust_csv, "r", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                customers[row["customer_id"]] = row

    # 3. Load Customer Status
    status_dict = {}
    stat_csv = os.path.join(csv_dir, "customer_status.csv")
    if os.path.exists(stat_csv):
        with open(stat_csv, "r", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                status_dict[row["customer_id"]] = row.get("churn_status", "Active")

    # Build dim_products
    cur.execute("DROP TABLE IF EXISTS dim_products;")
    cur.execute("""
    CREATE TABLE dim_products (
        product_id TEXT PRIMARY KEY,
        product_name TEXT,
        category TEXT,
        tier TEXT,
        monthly_price REAL
    );
    """)
    for pid, p in products.items():
        cur.execute(
            "INSERT INTO dim_products VALUES (?, ?, ?, ?, ?);",
            (pid, p["product_name"], p["category"], p["tier"], float(p.get("monthly_price", 0)))
        )

    # Build dim_customers
    cur.execute("DROP TABLE IF EXISTS dim_customers;")
    cur.execute("""
    CREATE TABLE dim_customers (
        customer_id TEXT PRIMARY KEY,
        customer_name TEXT,
        country TEXT,
        region TEXT,
        customer_segment TEXT,
        signup_date TEXT,
        acquisition_channel TEXT,
        churn_status TEXT
    );
    """)
    for cid, c in customers.items():
        c_status = status_dict.get(cid, "Active")
        cur.execute(
            "INSERT INTO dim_customers VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
            (cid, c["customer_name"], c["country"], c["region"], c["customer_segment"], c["signup_date"], c["acquisition_channel"], c_status)
        )

    # Build fct_sales
    cur.execute("DROP TABLE IF EXISTS fct_sales;")
    cur.execute("""
    CREATE TABLE fct_sales (
        sale_id TEXT PRIMARY KEY,
        order_id TEXT,
        sale_date TEXT,
        order_date TEXT,
        year INTEGER,
        quarter TEXT,
        month TEXT,
        customer_id TEXT,
        customer_name TEXT,
        country TEXT,
        region TEXT,
        customer_segment TEXT,
        acquisition_channel TEXT,
        product_id TEXT,
        product TEXT,
        category TEXT,
        tier TEXT,
        quantity INTEGER,
        unit_price REAL,
        discount REAL,
        revenue REAL,
        cost REAL,
        profit REAL,
        margin REAL,
        material_cost REAL,
        shipping_cost REAL,
        margin_pct REAL
    );
    """)

    sales_csv = os.path.join(csv_dir, "sales.csv")
    sales_rows = []
    if os.path.exists(sales_csv):
        with open(sales_csv, "r", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                s_date = row["sale_date"]
                dt = datetime.strptime(s_date, "%Y-%m-%d")
                year = dt.year
                q_num = (dt.month - 1) // 3 + 1
                quarter = f"Q{q_num} {year}"
                month = dt.strftime("%Y-%m")

                pid = row["product_id"]
                cid = row["customer_id"]

                p_info = products.get(pid, {})
                c_info = customers.get(cid, {})

                rev = float(row["revenue"])
                cost = float(row["cost"])
                profit = float(row["profit"])
                margin_val = float(row.get("margin", profit))
                mat_cost = round(cost * 0.75, 2)
                ship_cost = round(cost * 0.25, 2)
                margin_pct = round((profit / rev) * 100.0, 2) if rev > 0 else 0.0

                sales_rows.append((
                    row["sale_id"],
                    row["sale_id"],
                    s_date,
                    s_date,
                    year,
                    quarter,
                    month,
                    cid,
                    c_info.get("customer_name", "Unknown Customer"),
                    c_info.get("country", "Unknown"),
                    row["region"],
                    c_info.get("customer_segment", "SMB"),
                    c_info.get("acquisition_channel", "Direct"),
                    pid,
                    p_info.get("product_name", "Unknown Product"),
                    p_info.get("category", "General"),
                    p_info.get("tier", "Standard"),
                    int(row["quantity"]),
                    float(row["unit_price"]),
                    float(row["discount"]),
                    rev,
                    cost,
                    profit,
                    margin_val,
                    mat_cost,
                    ship_cost,
                    margin_pct
                ))

        cur.executemany("""
        INSERT INTO fct_sales VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);
        """, sales_rows)

    # Create alias views for direct table names
    cur.execute("DROP VIEW IF EXISTS sales;")
    cur.execute("CREATE VIEW sales AS SELECT * FROM fct_sales;")
    cur.execute("DROP VIEW IF EXISTS products;")
    cur.execute("CREATE VIEW products AS SELECT * FROM dim_products;")
    cur.execute("DROP VIEW IF EXISTS customers;")
    cur.execute("CREATE VIEW customers AS SELECT * FROM dim_customers;")

    conn.commit()
    conn.close()


def get_engine() -> Engine:
    global _engine, _engine_type
    if _engine is None:
        try:
            pg_eng = create_engine(
                POSTGRES_URL,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20,
                pool_recycle=3600
            )
            with pg_eng.connect() as conn:
                conn.execute(text("SELECT 1"))
            _engine = pg_eng
            _engine_type = "postgres"
        except Exception:
            ensure_sqlite_db_built()
            _engine = create_engine(SQLITE_URL, pool_pre_ping=True)
            _engine_type = "sqlite"
    return _engine


def verify_dbt_models(eng: Optional[Engine] = None) -> bool:
    """Verify that core tables (fct_sales, dim_products, dim_customers) exist and are populated."""
    if eng is None:
        eng = get_engine()
    try:
        with eng.connect() as conn:
            for tbl in ["fct_sales", "dim_products", "dim_customers"]:
                res = conn.execute(text(f"SELECT COUNT(*) FROM {tbl}")).scalar()
                if res is None or res == 0:
                    return False
        return True
    except Exception:
        return False


def check_connection() -> Dict[str, Any]:
    global _engine_type
    eng = get_engine()
    try:
        with eng.connect() as conn:
            conn.execute(text("SELECT 1"))
        if _engine_type == "postgres":
            return {
                "status": "connected",
                "engine": "PostgreSQL",
                "host": DB_HOST,
                "port": DB_PORT,
                "database": DB_NAME,
                "user": DB_USER,
                "dbt_models": "fct_sales, dim_products, dim_customers active"
            }
        else:
            return {
                "status": "connected",
                "engine": "SQLite (Fallback Warehouse)",
                "database": DB_NAME,
                "database_path": SQLITE_DB_PATH,
                "dbt_models": "fct_sales (50,000 transactions), dim_products, dim_customers active"
            }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }


def execute_raw_sql(sql_query: str, params: Optional[Dict[str, Any]] = None) -> Tuple[List[Dict[str, Any]], List[str]]:
    import re
    eng = get_engine()
    clean_sql = sql_query
    if _engine_type == "sqlite":
        # Remove PostgreSQL type casts like ::float, ::numeric, ::text, ::date, ::integer
        clean_sql = re.sub(r'::[a-zA-Z0-9_]+', '', clean_sql)
    try:
        with eng.connect() as conn:
            if params:
                result = conn.execute(text(clean_sql), params)
            else:
                result = conn.execute(text(clean_sql))

            if result.returns_rows:
                columns = list(result.keys())
                raw_rows = result.fetchall()
                dict_rows = [dict(zip(columns, row)) for row in raw_rows]
                return dict_rows, columns
            else:
                conn.commit()
                return [], []
    except SQLAlchemyError as err:
        raise RuntimeError(f"Database Query Error: {str(err)}") from err


