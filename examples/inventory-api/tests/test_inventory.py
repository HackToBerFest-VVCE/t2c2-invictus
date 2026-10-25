"""Test suite for InventoryService asserting INVARIANT.md specifications."""

import concurrent.futures
import os
import sys
import pytest

# Ensure local src package is resolvable regardless of invocation cwd
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from src.inventory import (  # noqa: E402
    InventoryService,
    InsufficientStockError,
    InvalidQuantityError,
)


@pytest.fixture
def service() -> InventoryService:
    svc = InventoryService()
    svc.add_item("item-101", initial_stock=10)
    return svc


def test_inv_01_non_negative_stock(service: InventoryService) -> None:
    """Validate INV-01: Available stock must never drop below zero."""
    item = service.get_item("item-101")
    assert item.available_stock == 10

    # Reserve 6 units
    service.reserve_stock("item-101", 6)
    assert item.available_stock == 4
    assert item.available_stock >= 0

    # Attempting to reserve 5 more units when only 4 remain must fail
    with pytest.raises(InsufficientStockError):
        service.reserve_stock("item-101", 5)

    # Invariant assertion: Available stock must remain >= 0 and unmodified
    assert item.available_stock == 4
    assert item.available_stock >= 0


def test_inv_02_conservation_of_inventory(service: InventoryService) -> None:
    """Validate INV-02: Total stock == available + reserved + fulfilled."""
    item = service.get_item("item-101")
    initial_total = item.total_stock

    # 1. Reserve 4 units
    r1 = service.reserve_stock("item-101", 4)
    assert item.total_stock == initial_total
    assert item.total_stock == (
        item.available_stock + item.reserved_stock + item.fulfilled_stock
    )

    # 2. Fulfill 4 units
    service.fulfill_reservation(r1)
    assert item.total_stock == initial_total
    assert item.total_stock == (
        item.available_stock + item.reserved_stock + item.fulfilled_stock
    )

    # 3. Reserve 3 units and cancel
    r2 = service.reserve_stock("item-101", 3)
    service.cancel_reservation(r2)
    assert item.total_stock == initial_total
    assert item.total_stock == (
        item.available_stock + item.reserved_stock + item.fulfilled_stock
    )


def test_inv_03_idempotent_cancellation(service: InventoryService) -> None:
    """Validate INV-03: Multiple cancellations yield identical state."""
    r = service.reserve_stock("item-101", 3)
    item = service.get_item("item-101")
    assert item.available_stock == 7

    # First cancellation succeeds
    assert service.cancel_reservation(r) is True
    assert item.available_stock == 10

    # Second cancellation is an idempotent no-op
    assert service.cancel_reservation(r) is False
    assert item.available_stock == 10

    # Canceling non-existent reservation is a no-op
    assert service.cancel_reservation("res_non_existent") is False
    assert item.available_stock == 10


def test_edge_01_negative_or_zero_quantity(service: InventoryService) -> None:
    """Validate EDGE-01: Non-positive quantities are rejected."""
    with pytest.raises(InvalidQuantityError):
        service.reserve_stock("item-101", 0)

    with pytest.raises(InvalidQuantityError):
        service.reserve_stock("item-101", -5)


def test_edge_02_concurrent_reservations(service: InventoryService) -> None:
    """Validate EDGE-02: Concurrent requests never breach INV-01."""
    # 20 concurrent threads trying to reserve 1 unit each when stock is 10
    successes = 0
    failures = 0

    def attempt_reservation() -> bool:
        try:
            service.reserve_stock("item-101", 1)
            return True
        except InsufficientStockError:
            return False

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(attempt_reservation) for _ in range(20)]
        for fut in concurrent.futures.as_completed(futures):
            if fut.result():
                successes += 1
            else:
                failures += 1

    item = service.get_item("item-101")
    assert successes == 10
    assert failures == 10
    assert item.available_stock == 0
    assert item.available_stock >= 0  # Invariant INV-01 preserved!
