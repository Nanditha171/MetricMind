# MetricMind — Quick Start & Setup Guide

## System Requirements
- **Python**: 3.10+
- **Node.js**: 18+ / 22+
- **Database**: Built-in SQLite / DuckDB out-of-the-box (Snowflake configuration scripts included)

---

## 1. Local Environment Setup

### Clone Repository & Environment File
```bash
git clone https://github.com/your-org/MetricMind.git
cd MetricMind
cp .env.example .env
```

### 2. Backend Setup & Data Seeding
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Seed local analytical database with realistic corporate sales & shipping data
python app/database/seed.py

# Start FastAPI Backend Server
python -m uvicorn main:app --reload --port 8000
```
Backend server will start at: `http://localhost:8000`
Swagger API Documentation: `http://localhost:8000/docs`

---

## 3. Frontend Setup
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Next.js Development Server
npm run dev
```
Frontend web application will open at: `http://localhost:3000`

---

## 4. Snowflake Cloud Deployment (Optional)
To point MetricMind to a production Snowflake Data Warehouse:
1. Update credentials in `.env`:
   ```env
   DATABASE_TYPE=snowflake
   SNOWFLAKE_ACCOUNT=xy12345.us-east-1
   SNOWFLAKE_USER=metricmind_user
   SNOWFLAKE_PASSWORD=your_password
   SNOWFLAKE_DATABASE=METRICMIND_DB
   SNOWFLAKE_SCHEMA=ANALYTICS
   ```
2. Execute Snowflake DDL script:
   Run `python -c "from backend.app.database.db import generate_snowflake_ddl; print(generate_snowflake_ddl())"` and apply generated DDL in Snowflake Worksheets.
