"""
Governance Guardrails and Security Layer for MetricMind.
Section 11: Implement safeguards against unknown metrics, invalid filters,
excessive rows, excessive agent steps, expensive queries, prompt injection, and arbitrary SQL execution.
"""

import re
from typing import List, Dict, Any, Optional

FORBIDDEN_SQL_PATTERNS = [
    r"\bDROP\s+TABLE\b",
    r"\bTRUNCATE\s+TABLE\b",
    r"\bDELETE\s+FROM\b",
    r"\bINSERT\s+INTO\b",
    r"\bUPDATE\s+.*\s+SET\b",
    r"\bALTER\s+TABLE\b",
    r"\bEXEC\b",
    r"\bEXECUTE\b",
    r";\s*SELECT",
    r";\s*DROP",
    r";\s*DELETE",
    r"--\s*",
    r"/\*.*\*/"
]

class PromptInjectionError(Exception):
    pass

class GovernanceGuardrails:

    @staticmethod
    def inspect_prompt_safety(prompt: str) -> None:
        """
        Detects adversarial prompt injection attempts or raw SQL commands in natural language prompt.
        """
        cleaned = prompt.upper()
        for pattern in FORBIDDEN_SQL_PATTERNS:
            if re.search(pattern, cleaned):
                raise PromptInjectionError(
                    "Security Safeguard Triggered: Direct SQL execution or DDL commands are prohibited. "
                    "MetricMind operates exclusively via governed semantic metrics."
                )

    @staticmethod
    def enforce_step_limit(current_step: int, max_steps: int = 5) -> None:
        if current_step > max_steps:
            raise Exception(f"Governance Limit Exceeded: Agent reasoning step count ({current_step}) exceeded max allowed threshold ({max_steps}).")
