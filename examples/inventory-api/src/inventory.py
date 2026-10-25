"""Reference implementation of the Inventory Management Service."""

import threading
import uuid
from dataclasses import dataclass
from typing import Dict, Optional


class InventoryError(Exception):
    """Base exception for inventory operations."""
    pass


class InsufficientStockError(InventoryError):
    """Raised when an operation requests more stock than currently available."""
    pass


class InvalidQuantityError(InventoryError):
    """Raised when a non-positive or invalid quantity is supplied."""
    pass


class ItemNotFoundError(InventoryError):
    """Raised when the specified item does not exist."""
    pass


class ReservationNotFoundError(InventoryError):
    """Raised when the specified reservation does not exist."""
    pass


@dataclass
class InventoryItem:
    item_id: str
    available_stock: int
    reserved_stock: int = 0
    fulfilled_stock: int = 0

    @property
    def total_stock(self) -> int:
        return self.available_stock + self.reserved_stock + self.fulfilled_stock


@dataclass
class Reservation:
    reservation_id: str
    item_id: str
    quantity: int
    status: str = "PENDING"  # PENDING, FULFILLED, CANCELED


class InventoryService:
    """Thread-safe inventory service enforcing INV-01 and INV-02."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._items: Dict[str, InventoryItem] = {}
        self._reservations: Dict[str, Reservation] = {}

    def add_item(self, item_id: str, initial_stock: int) -> InventoryItem:
        if initial_stock < 0:
            raise InvalidQuantityError("Initial stock cannot be negative.")
        with self._lock:
            item = InventoryItem(item_id=item_id, available_stock=initial_stock)
            self._items[item_id] = item
            return item

    def get_item(self, item_id: str) -> InventoryItem:
        with self._lock:
            if item_id not in self._items:
                raise ItemNotFoundError(f"Item '{item_id}' not found.")
            return self._items[item_id]

    def reserve_stock(self, item_id: str, quantity: int) -> str:
        """Reserve stock units for an item, enforcing non-negative balance (INV-01)."""
        if quantity <= 0:
            raise InvalidQuantityError("Reservation quantity must be strictly positive.")

        with self._lock:
            if item_id not in self._items:
                raise ItemNotFoundError(f"Item '{item_id}' not found.")

            item = self._items[item_id]
            if item.available_stock < quantity:
                raise InsufficientStockError(
                    f"Insufficient stock for item {item_id}: "
                    f"requested {quantity}, available {item.available_stock}"
                )

            # Atomic state transition
            item.available_stock -= quantity
            item.reserved_stock += quantity

            # Invariant check: INV-01
            assert item.available_stock >= 0, "Invariant violation: stock dropped below zero!"

            res_id = f"res_{uuid.uuid4().hex[:8]}"
            self._reservations[res_id] = Reservation(
                reservation_id=res_id,
                item_id=item_id,
                quantity=quantity,
                status="PENDING",
            )
            return res_id

    def cancel_reservation(self, reservation_id: str) -> bool:
        """Cancel a pending reservation idempotently (INV-03)."""
        with self._lock:
            if reservation_id not in self._reservations:
                # Idempotent: return False without mutation
                return False

            res = self._reservations[reservation_id]
            if res.status == "CANCELED":
                # Idempotent no-op
                return False

            if res.status != "PENDING":
                raise InventoryError(f"Cannot cancel reservation in state {res.status}")

            item = self._items[res.item_id]
            item.reserved_stock -= res.quantity
            item.available_stock += res.quantity
            res.status = "CANCELED"
            return True

    def fulfill_reservation(self, reservation_id: str) -> bool:
        """Fulfill a reserved order."""
        with self._lock:
            if reservation_id not in self._reservations:
                raise ReservationNotFoundError(f"Reservation '{reservation_id}' not found.")

            res = self._reservations[reservation_id]
            if res.status != "PENDING":
                raise InventoryError(f"Cannot fulfill reservation in state {res.status}")

            item = self._items[res.item_id]
            item.reserved_stock -= res.quantity
            item.fulfilled_stock += res.quantity
            res.status = "FULFILLED"
            return True
