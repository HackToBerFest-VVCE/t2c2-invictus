"""Generic external AI API provider supporting OpenAI-compatible chat endpoints."""

import json
import urllib.request
import urllib.error
import uuid
from typing import List
from ..interfaces import BaseAIProvider, AIRequestPayload, AIHypothesis


class GenericAPIProvider(BaseAIProvider):
    """Communicates with external LLM APIs using standard OpenAI-compatible endpoints."""

    def __init__(
        self,
        api_key: str,
        base_url: str = "https://api.openai.com/v1",
        model_name: str = "gpt-4o-mini",
        timeout_seconds: int = 30,
    ) -> None:
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.model_name = model_name
        self.timeout_seconds = timeout_seconds

    def provider_name(self) -> str:
        return "api"

    def generate_hypotheses(self, payload: AIRequestPayload) -> List[AIHypothesis]:
        """Send structured prompt to LLM and parse JSON hypotheses array."""
        prompt = self._build_prompt(payload)
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
        }

        body = {
            "model": self.model_name,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are an expert software verification assistant. "
                        "Given an Invariant specification and git diff, suggest edge cases "
                        "and boundary hypotheses. Return valid JSON only containing a list "
                        "of objects with keys: invariant_id, title, description, "
                        "postulated_scenario, severity, suggested_test_input."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.2,
        }

        req = urllib.request.Request(
            f"{self.base_url}/chat/completions",
            data=json.dumps(body).encode("utf-8"),
            headers=headers,
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=self.timeout_seconds) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                content = data["choices"][0]["message"]["content"]
                return self._parse_json_response(content)
        except Exception:
            # Fall back to empty list on network or parse failure
            return []

    def _build_prompt(self, payload: AIRequestPayload) -> str:
        inv_text = json.dumps(payload.invariants, indent=2)
        return (
            f"Target System: {payload.target_system}\n\n"
            f"Invariants to verify:\n{inv_text}\n\n"
            f"Git Diff:\n{payload.diff_content or 'No diff provided.'}\n\n"
            "Generate edge cases in JSON format: "
            '[{"invariant_id": "...", "title": "...", "description": "...", '
            '"postulated_scenario": "...", "severity": "HIGH", "suggested_test_input": "..."}]'
        )

    def _parse_json_response(self, text: str) -> List[AIHypothesis]:
        cleaned = text.strip()
        if "```json" in cleaned:
            cleaned = cleaned.split("```json")[1].split("```")[0].strip()
        elif "```" in cleaned:
            cleaned = cleaned.split("```")[1].split("```")[0].strip()

        try:
            items = json.loads(cleaned)
            results: List[AIHypothesis] = []
            for item in items:
                results.append(
                    AIHypothesis(
                        id=f"HYP-{uuid.uuid4().hex[:6].upper()}",
                        invariant_id=item.get("invariant_id"),
                        title=item.get("title", "AI Edge Case"),
                        description=item.get("description", ""),
                        postulated_scenario=item.get("postulated_scenario", ""),
                        severity=item.get("severity", "MEDIUM").upper(),
                        suggested_test_input=item.get("suggested_test_input"),
                        raw_ai_response=text,
                    )
                )
            return results
        except Exception:
            return []

    def generate_fix(
        self,
        invariant_rule: str,
        failure_trace: str,
        code_context: str,
    ) -> dict:
        """Prompt OpenAI-compatible API to analyze failure and suggest a code patch."""
        prompt = (
            "You are an automated software repair engineer. "
            "An invariant verification test failed.\n\n"
            f"### Invariant Rule:\n{invariant_rule}\n\n"
            f"### Failure Trace:\n{failure_trace}\n\n"
            f"### Relevant Source Code:\n```python\n{code_context}\n```\n\n"
            "Analyze the root cause and provide a fix. Return a strict JSON object with:\n"
            '- "root_cause": Brief explanation of the violation\n'
            '- "suggested_fix": Markdown explanation of the change\n'
            '- "replacement_code": Exact replacement code block\n'
            '- "confidence": "HIGH" | "MEDIUM" | "LOW"\n'
        )
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
        }
        body = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": "Return valid JSON only."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.2,
        }
        req = urllib.request.Request(
            f"{self.base_url}/chat/completions",
            data=json.dumps(body).encode("utf-8"),
            headers=headers,
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=self.timeout_seconds) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                content = data["choices"][0]["message"]["content"]
                cleaned = content.strip()
                if "```json" in cleaned:
                    cleaned = cleaned.split("```json")[1].split("```")[0].strip()
                elif "```" in cleaned:
                    cleaned = cleaned.split("```")[1].split("```")[0].strip()
                return json.loads(cleaned)
        except Exception:
            return {
                "root_cause": "API request failed or unparseable.",
                "suggested_fix": "Inspect failure trace and reproduction command locally.",
                "replacement_code": "",
                "confidence": "LOW",
            }
