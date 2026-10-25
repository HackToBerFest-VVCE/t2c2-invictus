"""Integration tests for the Specification Engine."""

import os
from packages.spec_engine.parser import SpecParser
from packages.spec_engine.validator import SpecValidator


def test_parse_inventory_spec() -> None:
    spec_path = os.path.join("examples", "inventory-api", "INVARIANT.md")
    assert os.path.exists(spec_path), f"Spec file not found at {spec_path}"

    parser = SpecParser()
    spec = parser.parse_file(spec_path)

    # Validate Metadata
    assert spec.metadata.target_system == "InventoryService"
    assert spec.metadata.spec_version == "1.0.0"
    assert spec.metadata.status == "Active"

    # Validate Overview
    assert "Inventory Management Service" in spec.project_overview

    # Validate Invariants
    assert len(spec.invariants) >= 3
    inv_ids = [inv.id for inv in spec.invariants]
    assert "INV-01" in inv_ids
    assert "INV-02" in inv_ids
    assert "INV-03" in inv_ids

    inv_01 = next(inv for inv in spec.invariants if inv.id == "INV-01")
    assert "never drop below zero" in inv_01.rule_statement
    assert inv_01.formal_assertion == "item.available_stock >= 0"
    assert inv_01.severity == "CRITICAL"

    # Validate Contracts
    assert len(spec.contracts) >= 1
    contract = spec.contracts[0]
    assert "Reserve Stock" in contract.name
    assert len(contract.pre_conditions) > 0
    assert len(contract.post_conditions) > 0

    # Validate Edge Cases
    assert len(spec.edge_cases) >= 2


def test_spec_validator_detects_empty_spec() -> None:
    validator = SpecValidator()
    parser = SpecParser()
    empty_spec = parser.parse_text("# Empty Spec\nNo rules here.")

    issues = validator.validate(empty_spec)
    assert any("zero invariant rules" in issue for issue in issues)
