"""Integration tests for the Verifier Engine and isolated execution."""

import os
from packages.verifier.runner import IsolatedRunner
from packages.verifier.adapters.pytest_adapter import PytestAdapter
from packages.verifier.models import VerificationStatus


def test_pytest_adapter_detection() -> None:
    inv_dir = os.path.join("examples", "inventory-api")
    adapter = PytestAdapter(workspace_root=inv_dir)
    assert adapter.detect() is True


def test_isolated_runner_executes_inventory_tests() -> None:
    inv_dir = os.path.join("examples", "inventory-api")
    runner = IsolatedRunner(workspace_root=inv_dir, timeout_seconds=30)
    result = runner.auto_verify()

    assert result.status == VerificationStatus.VERIFIED_PASS
    assert result.passed_count >= 5
    assert result.failed_count == 0
    assert result.evidence.exit_code == 0
    assert result.evidence.duration_ms > 0


def test_isolated_runner_scrubs_secrets() -> None:
    runner = IsolatedRunner(workspace_root=".")
    scrubbed = runner.get_scrubbed_env()

    # Verify no sensitive environment variables leak
    for key in scrubbed.keys():
        for prefix in runner.SENSITIVE_ENV_PREFIXES:
            assert not key.upper().startswith(prefix)
