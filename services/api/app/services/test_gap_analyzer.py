"""Test Gap Analyzer service.

Cross-references declarative specifications against project test suites to detect
untested requirements and invariant verification gaps.
"""

import os
import re
from typing import List, Dict
from packages.spec_engine.models import InvariantSpec, InvariantRule
from ..schemas.schemas import SpecInvariantResponse, SpecAnalysisResponse


class TestGapAnalyzer:
    """Detects test coverage gaps for requirements declared in INVARIANT.md."""

    def __init__(self, workspace_path: str = ".") -> None:
        self.workspace_path = workspace_path

    def analyze(
        self, spec: InvariantSpec, spec_path: str = "INVARIANT.md"
    ) -> SpecAnalysisResponse:
        """Scan workspace test files and map them against invariants."""
        test_files_content = self._load_workspace_test_files()

        invariants_results: List[SpecInvariantResponse] = []
        tested_count = 0
        untested_count = 0
        recommendations: List[str] = []

        for rule in spec.invariants:
            associated_tests = self._find_matching_tests(rule, test_files_content)
            if associated_tests:
                status = "COVERED"
                tested_count += 1
                sketch = None
            else:
                status = "UNTESTED_GAP"
                untested_count += 1
                sketch = self._generate_test_sketch(rule)
                target_fn = self._suggested_function_name(rule)
                recommendations.append(
                    f"Requirement '{rule.id}: {rule.title}' has no matching tests. "
                    f"Consider implementing verification test '{target_fn}'."
                )

            invariants_results.append(
                SpecInvariantResponse(
                    id=rule.id,
                    title=rule.title,
                    rule_statement=rule.rule_statement,
                    formal_assertion=rule.formal_assertion,
                    severity=rule.severity,
                    test_coverage_status=status,
                    associated_tests=associated_tests,
                    suggested_test_sketch=sketch,
                )
            )

        total = len(spec.invariants)
        coverage_pct = round((tested_count / total * 100.0), 1) if total > 0 else 100.0

        if untested_count == 0:
            recommendations.append(
                "All declared invariants currently have associated verification coverage."
            )

        return SpecAnalysisResponse(
            spec_path=spec_path,
            spec_version=spec.metadata.spec_version,
            target_system=spec.metadata.target_system,
            total_invariants=total,
            tested_count=tested_count,
            untested_gap_count=untested_count,
            coverage_percentage=coverage_pct,
            invariants=invariants_results,
            recommendations=recommendations,
        )

    def _load_workspace_test_files(self) -> Dict[str, str]:
        """Find and read all test files in the workspace."""
        test_files: Dict[str, str] = {}
        ignore_dirs = {
            ".git",
            "node_modules",
            "venv",
            ".venv",
            "__pycache__",
            ".next",
            "dist",
            "build",
            ".pytest_cache",
        }

        for root, dirs, files in os.walk(self.workspace_path):
            dirs[:] = [d for d in dirs if d not in ignore_dirs]
            for file in files:
                if (
                    file.startswith("test_")
                    or file.endswith("_test.py")
                    or file.endswith(".test.ts")
                    or file.endswith(".test.js")
                    or file.endswith(".spec.ts")
                    or file.endswith(".spec.js")
                ):
                    full_path = os.path.join(root, file)
                    rel_path = os.path.relpath(full_path, self.workspace_path).replace(
                        "\\", "/"
                    )
                    try:
                        with open(
                            full_path, "r", encoding="utf-8", errors="ignore"
                        ) as f:
                            test_files[rel_path] = f.read()
                    except Exception:
                        continue

        return test_files

    def _find_matching_tests(
        self, rule: InvariantRule, test_files: Dict[str, str]
    ) -> List[str]:
        """Check if invariant ID or rule keywords appear in test files."""
        matches: List[str] = []
        rule_id_clean = rule.id.strip().upper()

        # 1. Search for exact invariant ID match (e.g. INV-01, inv_01, INV01)
        normalized_id = re.sub(r"[^A-Za-z0-9]", "", rule_id_clean)

        for file_path, content in test_files.items():
            if rule_id_clean in content.upper() or normalized_id in re.sub(
                r"[^A-Za-z0-9]", "", content.upper()
            ):
                # Extract specific test function names if possible
                func_names = self._extract_test_functions_mentioning(
                    content, rule_id_clean
                )
                if func_names:
                    for fn in func_names:
                        matches.append(f"{file_path}::{fn}")
                else:
                    matches.append(file_path)

        # 2. If no direct ID match, fallback to title/keyword check
        if not matches:
            keywords = [
                w.lower()
                for w in re.findall(r"\w{4,}", rule.title)
                if w.lower() not in {"test", "rule", "must", "never", "always"}
            ]
            if len(keywords) >= 2:
                for file_path, content in test_files.items():
                    content_lower = content.lower()
                    if all(k in content_lower for k in keywords[:2]):
                        func_names = self._extract_test_functions_mentioning(
                            content, keywords[0]
                        )
                        if func_names:
                            for fn in func_names:
                                matches.append(f"{file_path}::{fn}")
                        else:
                            matches.append(file_path)

        return list(dict.fromkeys(matches))  # deduplicate preserving order

    def _extract_test_functions_mentioning(self, content: str, query: str) -> List[str]:
        """Extract test function names that mention the query in name or docstring."""
        functions = []
        pattern = re.compile(
            r"def\s+(test_[a-zA-Z0-9_]+)\s*\((.*?)\):(?:\s*\"\"\"(.*?)\"\"\")?",
            re.DOTALL,
        )
        for match in pattern.finditer(content):
            fn_name = match.group(1)
            docstring = match.group(3) or ""
            if query.lower() in fn_name.lower() or query.lower() in docstring.lower():
                functions.append(fn_name)
        return functions

    def _suggested_function_name(self, rule: InvariantRule) -> str:
        """Create a clean python test function name from an invariant rule."""
        clean_id = re.sub(r"[^a-zA-Z0-9]", "_", rule.id.lower()).strip("_")
        clean_title = re.sub(r"[^a-zA-Z0-9]", "_", rule.title.lower()).strip("_")
        truncated_title = "_".join([w for w in clean_title.split("_") if w][:4])
        return f"test_{clean_id}_{truncated_title}"

    def _generate_test_sketch(self, rule: InvariantRule) -> str:
        """Generate a starter pytest verification sketch for an uncovered invariant."""
        fn_name = self._suggested_function_name(rule)
        assertion = rule.formal_assertion or "# assert condition == True"

        return f'''def {fn_name}():
    """Verify {rule.id}: {rule.title}

    Rule: {rule.rule_statement}
    """
    # 1. Arrange & Set up target state

    # 2. Act: Execute boundary operation

    # 3. Assert invariant holds
    {assertion}
'''
