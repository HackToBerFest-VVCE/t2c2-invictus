"""CLI entrypoint for running Invariant verification locally or inside CI."""

import argparse
import sys
import os
from packages.spec_engine.parser import SpecParser
from .runner import IsolatedRunner
from .models import VerificationStatus


def main() -> None:
    parser = argparse.ArgumentParser(description="Invariant Continuous Verifier CLI")
    parser.add_argument(
        "--spec",
        default="INVARIANT.md",
        help="Path to INVARIANT.md specification file",
    )
    parser.add_argument(
        "--workspace",
        default=".",
        help="Path to repository workspace root",
    )
    parser.add_argument(
        "--fail-on-violation",
        default="true",
        help="Whether to exit with code 1 if a verified failure occurs",
    )
    parser.add_argument(
        "--format",
        default="markdown",
        choices=["markdown", "json"],
        help="Output format",
    )
    args = parser.parse_args()

    print(f"[*] Invariant Verifier starting on workspace: {args.workspace}")
    spec_path = os.path.join(args.workspace, args.spec)

    if os.path.exists(spec_path):
        print(f"[*] Parsing specification: {spec_path}")
        spec_parser = SpecParser()
        spec = spec_parser.parse_file(spec_path)
        print(
            f"[+] Loaded {len(spec.invariants)} invariant(s), {len(spec.contracts)} contract(s)"
        )
    else:
        print(f"[!] Warning: Specification file not found at '{spec_path}'")

    runner = IsolatedRunner(workspace_root=args.workspace)
    print("[*] Running verification harnesses...")
    result = runner.auto_verify()

    print("\n================ VERIFICATION RESULT ================")
    print(f"Status:       {result.status.value}")
    print(f"Adapter:      {result.adapter_name}")
    print(f"Passed Tests: {result.passed_count}")
    print(f"Failed Tests: {result.failed_count}")
    print(f"Duration:     {result.evidence.duration_ms}ms")
    print("=====================================================\n")

    if result.status == VerificationStatus.VERIFIED_FAILURE:
        print("[!] Invariant verification FAILED with reproduced errors.")
        if args.fail_on_violation.lower() in ("true", "1", "yes"):
            sys.exit(1)
    elif result.status == VerificationStatus.CHECK_ERROR:
        print("[!] Invariant check encountered an execution error.")
        if args.fail_on_violation.lower() in ("true", "1", "yes"):
            sys.exit(2)
    else:
        print("[+] Invariant verification PASSED.")
        sys.exit(0)


if __name__ == "__main__":
    main()
