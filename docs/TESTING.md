# MetricMind — Testing & Verification Guide

Section 15 Requirement: Every major module must have tests.

## Running Backend Automated Test Suite
From the root project directory:
```bash
python -m pytest backend/tests/ -v
```

### Test Coverage Summary:
1. **`test_semantic_layer.py`**:
   - `test_valid_semantic_query`: Verifies that valid measure & dimension combinations generate clean parameterized SQL and return valid data rows.
   - `test_unknown_metric_rejection`: Ensures that attempts to query unapproved metrics (e.g. `arbitrary_fake_metric`) are blocked with explicit metric dictionary error messages.
   - `test_unknown_dimension_rejection`: Ensures unsupported dimensions are safely rejected.

2. **`test_governance.py`**:
   - `test_prompt_injection_blocking`: Verifies AST & regex blocking of malicious SQL DDL/DML statements (`DROP TABLE`, `DELETE FROM`, `TRUNCATE`).
   - `test_safe_prompt_pass`: Confirms valid business questions pass security inspection cleanly.

3. **`test_agent.py`**:
   - `test_european_margin_drop_multi_step_reasoning`: Validates Section 8 multi-step agent reasoning for *"Why did our European margins drop last quarter?"*. Checks multi-query execution sequence, margin calculation accuracy, cost breakdown detection (Shipping Cost spike), and transparency metadata generation.
