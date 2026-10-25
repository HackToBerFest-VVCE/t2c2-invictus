"""Markdown parser for INVARIANT.md specification files."""

import re
from typing import List, Tuple, Dict, Any
from .models import (
    InvariantSpec,
    SpecMetadata,
    InvariantRule,
    APIContract,
    EdgeCase,
    FailureMode,
)


class SpecParser:
    """Parses markdown specifications according to the Invariant format specification."""

    def __init__(self) -> None:
        pass

    def parse_file(self, file_path: str) -> InvariantSpec:
        """Read and parse an INVARIANT.md file from disk."""
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        return self.parse_text(content)

    def parse_text(self, content: str) -> InvariantSpec:
        """Parse raw markdown content into an InvariantSpec instance."""
        warnings: List[str] = []
        frontmatter, body = self._extract_frontmatter(content)
        metadata = self._parse_metadata(frontmatter)

        overview = self._extract_overview(body)
        invariants = self._extract_invariants(body, warnings)
        contracts = self._extract_contracts(body, warnings)
        edge_cases = self._extract_edge_cases(body, warnings)
        failure_modes = self._extract_failure_modes(body)
        expectations = self._extract_expectations(body)

        if not invariants:
            warnings.append("No explicit [INVARIANT] clauses found in specification.")

        return InvariantSpec(
            metadata=metadata,
            project_overview=overview,
            invariants=invariants,
            contracts=contracts,
            edge_cases=edge_cases,
            failure_modes=failure_modes,
            verification_expectations=expectations,
            raw_content=content,
            warnings=warnings,
        )

    def _extract_frontmatter(self, text: str) -> Tuple[str, str]:
        """Extract YAML-style frontmatter enclosed in ---."""
        if text.startswith("---"):
            parts = text.split("---", 2)
            if len(parts) >= 3:
                return parts[1].strip(), parts[2].strip()
        return "", text.strip()

    def _parse_metadata(self, fm_text: str) -> SpecMetadata:
        """Parse simple key-value pairs from frontmatter."""
        meta = SpecMetadata()
        if not fm_text:
            return meta

        for line in fm_text.splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if ":" in line:
                key, val = line.split(":", 1)
                key = key.strip().lower()
                val = val.strip().strip('"').strip("'")
                if key == "spec_version":
                    meta.spec_version = val
                elif key == "target_system":
                    meta.target_system = val
                elif key == "status":
                    meta.status = val
                elif key == "verification_level":
                    meta.verification_level = val
                else:
                    meta.extra[key] = val
        return meta

    def _extract_overview(self, body: str) -> str:
        """Extract the project overview section."""
        match = re.search(
            r"##\s+(?:\d+\.\s*)?Project Overview\s*\n(.*?)(?=\n##|\Z)",
            body,
            re.DOTALL | re.IGNORECASE,
        )
        if match:
            return match.group(1).strip()
        return ""

    def _extract_invariants(self, body: str, warnings: List[str]) -> List[InvariantRule]:
        """Extract invariant rules matching ### INV-XX: <Title>."""
        rules: List[InvariantRule] = []
        inv_blocks = re.findall(
            r"###\s+(INV-[A-Za-z0-9_\-]+):\s*([^\n]+)\s*\n(.*?)(?=\n###|\n##|\Z)",
            body,
            re.DOTALL,
        )

        for inv_id, title, block in inv_blocks:
            rule_stmt = ""
            assertion = None
            applies = None
            severity = "HIGH"

            for line in block.splitlines():
                line = line.strip()
                if line.startswith("* **Rule**:") or line.startswith("- **Rule**:"):
                    rule_stmt = line.split(":", 1)[1].strip()
                elif line.startswith("* **Formal Assertion**:") or line.startswith("- **Formal Assertion**:"):
                    assertion = line.split(":", 1)[1].strip().strip("`")
                elif line.startswith("* **Applies To**:") or line.startswith("- **Applies To**:"):
                    applies = line.split(":", 1)[1].strip()
                elif line.startswith("* **Severity**:") or line.startswith("- **Severity**:"):
                    severity = line.split(":", 1)[1].strip().upper()

            if not rule_stmt:
                # Fallback to entire block first line
                first_lines = [l.strip("* -") for l in block.splitlines() if l.strip()]
                rule_stmt = first_lines[0] if first_lines else title

            clean_title = title.replace("[INVARIANT]", "").strip()
            rules.append(
                InvariantRule(
                    id=inv_id,
                    title=clean_title,
                    rule_statement=rule_stmt,
                    formal_assertion=assertion,
                    applies_to=applies,
                    severity=severity,
                    raw_text=block.strip(),
                )
            )

        return rules

    def _extract_contracts(self, body: str, warnings: List[str]) -> List[APIContract]:
        """Extract API contracts."""
        contracts: List[APIContract] = []
        contract_blocks = re.findall(
            r"###\s+Contract:\s*([^\n]+)\s*\n(.*?)(?=\n###|\n##|\Z)",
            body,
            re.DOTALL | re.IGNORECASE,
        )

        for name, block in contract_blocks:
            endpoint = None
            pre_conditions: List[str] = []
            post_conditions: List[str] = []
            failures: List[str] = []

            current_section = None
            for line in block.splitlines():
                sline = line.strip()
                if "Endpoint" in sline and ":" in sline:
                    endpoint = sline.split(":", 1)[1].strip().strip("`")
                elif "Pre-conditions" in sline:
                    current_section = "pre"
                elif "Post-conditions" in sline:
                    current_section = "post"
                elif "Failure Modes" in sline:
                    current_section = "fail"
                elif sline.startswith(("*", "-")) and current_section:
                    val = sline.lstrip("*- ").strip()
                    if current_section == "pre":
                        pre_conditions.append(val)
                    elif current_section == "post":
                        post_conditions.append(val)
                    elif current_section == "fail":
                        failures.append(val)

            clean_name = name.replace("[CONTRACT]", "").strip()
            contracts.append(
                APIContract(
                    name=clean_name,
                    endpoint=endpoint,
                    pre_conditions=pre_conditions,
                    post_conditions=post_conditions,
                    failure_modes=failures,
                )
            )
        return contracts

    def _extract_edge_cases(self, body: str, warnings: List[str]) -> List[EdgeCase]:
        """Extract edge cases matching ### EDGE-XX: <Title>."""
        edge_cases: List[EdgeCase] = []
        blocks = re.findall(
            r"###\s+(EDGE-[A-Za-z0-9_\-]+):\s*([^\n]+)\s*\n(.*?)(?=\n###|\n##|\Z)",
            body,
            re.DOTALL,
        )

        for edge_id, title, block in blocks:
            clean_title = title.replace("[EDGE-CASE]", "").strip()
            desc = " ".join([l.strip("* -") for l in block.splitlines() if l.strip()])
            edge_cases.append(
                EdgeCase(
                    id=edge_id,
                    title=clean_title,
                    description=desc,
                )
            )
        return edge_cases

    def _extract_failure_modes(self, body: str) -> List[FailureMode]:
        """Extract tabular failure modes if present."""
        failure_modes: List[FailureMode] = []
        table_match = re.search(
            r"##\s+(?:\d+\.\s*)?Expected Failure Behavior.*?\n\|(.*?)\n\|[-|\s]+\n(.*?)(?=\n##|\Z)",
            body,
            re.DOTALL | re.IGNORECASE,
        )
        if table_match:
            rows = table_match.group(2).strip().splitlines()
            for row in rows:
                cols = [c.strip() for c in row.split("|")[1:-1]]
                if len(cols) >= 3:
                    trigger = cols[0]
                    status = cols[1].strip("`")
                    error_code = cols[2].strip("`")
                    mutation = cols[3] if len(cols) > 3 else "None"
                    failure_modes.append(
                        FailureMode(
                            trigger=trigger,
                            expected_status=status,
                            error_code=error_code,
                            expected_mutation=mutation,
                        )
                    )
        return failure_modes

    def _extract_expectations(self, body: str) -> List[str]:
        """Extract verification expectations."""
        match = re.search(
            r"##\s+(?:\d+\.\s*)?Verification Expectations\s*\n(.*?)(?=\n##|\Z)",
            body,
            re.DOTALL | re.IGNORECASE,
        )
        if match:
            lines = [
                l.strip("* -")
                for l in match.group(1).splitlines()
                if l.strip().startswith(("*", "-"))
            ]
            return lines
        return []
