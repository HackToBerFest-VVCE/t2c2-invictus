"""Cryptographic signature validation and replay defense."""

import hashlib
import hmac
import time
from typing import Set, Dict


class DeliveryDeduplicator:
    """In-memory deduplicator tracking recent delivery GUIDs with TTL expiry."""

    def __init__(self, ttl_seconds: int = 86400) -> None:
        self.ttl_seconds = ttl_seconds
        self._deliveries: Dict[str, float] = {}

    def is_duplicate(self, delivery_id: str) -> bool:
        """Check if delivery ID has been seen within TTL window; records it if not seen."""
        now = time.time()
        self._prune(now)

        if delivery_id in self._deliveries:
            return True

        self._deliveries[delivery_id] = now
        return False

    def _prune(self, now: float) -> None:
        expired = [
            d_id
            for d_id, seen_time in self._deliveries.items()
            if now - seen_time > self.ttl_seconds
        ]
        for d_id in expired:
            del self._deliveries[d_id]


deduplicator = DeliveryDeduplicator()


def verify_github_signature(
    payload_bytes: bytes, signature_header: str, secret: str
) -> bool:
    """Validate GitHub webhook HMAC-SHA256 signature using constant-time comparison.
    
    CRITICAL INVARIANT (INV-02):
    Validates request payload before executing any runner jobs or reading repo files.
    """
    if not signature_header or not secret:
        return False

    if not signature_header.startswith("sha256="):
        return False

    expected_hash = hmac.new(
        secret.encode("utf-8"),
        payload_bytes,
        hashlib.sha256,
    ).hexdigest()

    expected_signature = f"sha256={expected_hash}"

    # Use constant-time comparison to prevent timing side-channel attacks
    return hmac.compare_digest(expected_signature, signature_header)
