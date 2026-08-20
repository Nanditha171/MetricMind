"""
Database Connection & Query Execution Handler for MetricMind.
Supports local SQLite/DuckDB execution and Snowflake cloud integration.
"""

import os
import sqlite3
from typing import List, Dict, Any, Tuple

def get_db_connection():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    db_path = os.path.join(base_dir, "data", "metricmind.db")
    if not os.path.exists(db_path):
        from backend.app.database.seed import seed_database
        seed_database()
    return sqlite3.connect(db_path)

def execute_raw_sql(sql_query: str, params: Tuple = ()) -> Tuple[List[Dict[str, Any]], List[str]]:
    """
    Executes governed SQL query against the underlying analytical engine.
    Returns (rows as list of dicts, column names).
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(sql_query, params)
    
    columns = [description[0] for description in cursor.description] if cursor.description else []
    raw_rows = cursor.fetchall()
    
    cursor.close()
    conn.close()

    dict_rows = [dict(zip(columns, row)) for row in raw_rows]
    return dict_rows, columns

def generate_snowflake_ddl() -> str:
    """
    Generates Snowflake Data Warehouse DDL and dbt integration schema.
    """
    return """
-- Snowflake MetricMind Enterprise Schema Definition
CREATE DATABASE IF NOT EXISTS METRICMIND_DB;
CREATE SCHEMA IF NOT EXISTS METRICMIND_DB.ANALYTICS;

USE DATABASE METRICMIND_DB;
USE SCHEMA ANALYTICS;

-- Governed Sales Fact Table
CREATE OR REPLACE TABLE FCT_SALES (
    ID INT AUTOINCREMENT,
    ORDER_DATE DATE NOT NULL,
    YEAR INT NOT NULL,
    QUARTER VARCHAR(10) NOT NULL,
    MONTH VARCHAR(7) NOT NULL,
    REGION VARCHAR(50) NOT NULL,
    COUNTRY VARCHAR(50) NOT NULL,
    PRODUCT VARCHAR(100) NOT NULL,
    CATEGORY VARCHAR(50) NOT NULL,
    QUANTITY INT NOT NULL,
    REVENUE NUMBER(18,2) NOT NULL,
    COST NUMBER(18,2) NOT NULL,
    MATERIAL_COST NUMBER(18,2) NOT NULL,
    SHIPPING_COST NUMBER(18,2) NOT NULL,
    MARGIN NUMBER(18,2) NOT NULL,
    MARGIN_PCT NUMBER(8,4) NOT NULL,
    CONSTRAINT PK_FCT_SALES PRIMARY KEY (ID)
);
"""
