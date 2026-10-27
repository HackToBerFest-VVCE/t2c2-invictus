"""Google Gemini AI API provider supporting Gemini 1.5/2.0 models via direct REST API."""

import json
import urllib.request
import urllib.error
import uuid
from typing import List, Optional
from ..interfaces import BaseAIProvider, AIRequestPayload, AIHypothesis


class GeminiAIProvider(BaseAIProvider):
    """Communicates directly with Google Gemini API without external SDK dependencies."""

    def __init__(
        self,
        api_key: str,
        model_name: str = "gemini-1.5-flash",
        timeout_seconds: int = 30,
    ) -> None:
        self.api_key = api_key
        self.model_name = model_name
        self.timeout_seconds = timeout_seconds
        self.endpoint_url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{self.model_name}:generateContent?key={self.api_key}"
        )

    def provider_name(self) -> str:
        return "gemini"

    def generate_hypotheses(self, payload: AIRequestPayload) -> List[AIHypothesis]:
        """Send prompt to Gemini and parse structured JSON edge-case hypotheses."""
        prompt = self._build_hypothesis_prompt(payload)
        response_text = self._call_gemini_api(prompt)
        if not response_text:
            return []
        return self._parse_json_hypotheses(response_text)

    def generate_fix(
        self,
        invariant_rule: str,
        failure_trace: str,
        code_context: str,
    ) -> dict:
        """Prompt Gemini to analyze an invariant failure and suggest a code patch."""
        prompt = (
            "You are an automated software repair engineer. "
            "An invariant verification test failed.\n\n"
            f"### Invariant Rule:\n{invariant_rule}\n\n"
            f"### Failure Trace & Evidence:\n{failure_trace}\n\n"
            f"### Relevant Source Code:\n```python\n{code_context}\n```\n\n"
            "Analyze the root cause and provide a fix. Return a strict JSON object with:\n"
            '- "root_cause": Brief explanation of the violation\n'
            '- "suggested_fix": Markdown explanation of the change\n'
            '- "replacement_code": Exact replacement code block\n'
            '- "confidence": "HIGH" | "MEDIUM" | "LOW"\n'
        )
        response_text = self._call_gemini_api(prompt)
        if not response_text:
            return {
                "root_cause": "Unable to reach Gemini API.",
                "suggested_fix": "Inspect failure trace and reproduction command locally.",
                "replacement_code": "",
                "confidence": "LOW",
            }
        return self._parse_json_fix(response_text)

    def _call_gemini_api(self, prompt: str) -> Optional[str]:
        """Make HTTP POST request to Gemini generateContent endpoint."""
        body = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json",
            },
        }

        req = urllib.request.Request(
            self.endpoint_url,
            data=json.dumps(body).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=self.timeout_seconds) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                candidates = data.get("candidates", [])
                if not candidates:
                    return None
                parts = candidates[0].get("content", {}).get("parts", [])
                if not parts:
                    return None
                return parts[0].get("text", "")
        except Exception:
            return None

    def _build_hypothesis_prompt(self, payload: AIRequestPayload) -> str:
        inv_text = json.dumps(payload.invariants, indent=2)
        return (
            "You are an expert continuous verification assistant.\n"
            f"Target System: {payload.target_system}\n\n"
            f"Invariants to verify:\n{inv_text}\n\n"
            f"Git Diff:\n{payload.diff_content or 'No diff provided.'}\n\n"
            "Generate potential boundary violations and edge cases in a strict JSON array: "
            '[{"invariant_id": "...", "title": "...", "description": "...", '
            '"postulated_scenario": "...", "severity": "HIGH", "suggested_test_input": "..."}]'
        )

    def _parse_json_hypotheses(self, text: str) -> List[AIHypothesis]:
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
                        suggested_test_input=item.get("suggested_test_input", ""),
                    )
                )
            return results
        except Exception:
            return []

    def _parse_json_fix(self, text: str) -> dict:
        cleaned = text.strip()
        if "```json" in cleaned:
            cleaned = cleaned.split("```json")[1].split("```")[0].strip()
        elif "```" in cleaned:
            cleaned = cleaned.split("```")[1].split("```")[0].strip()

        try:
            return json.loads(cleaned)
        except Exception:
            return {
                "root_cause": "Automated parsing failed.",
                "suggested_fix": text,
                "replacement_code": "",
                "confidence": "LOW",
            }
