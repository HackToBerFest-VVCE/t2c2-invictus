"""Unit tests for cryptographic security and webhook signature verification."""

import hashlib
import hmac
from services.api.app.core.security import verify_github_signature, DeliveryDeduplicator


def test_valid_github_signature() -> None:
    secret = "test_webhook_secret_key_123"
    payload = b'{"action": "opened", "repository": {"name": "test-repo"}}'

    # Compute valid signature
    computed_hash = hmac.new(
        secret.encode("utf-8"), payload, hashlib.sha256
    ).hexdigest()
    valid_header = f"sha256={computed_hash}"

    assert verify_github_signature(payload, valid_header, secret) is True


def test_invalid_signature_rejected() -> None:
    secret = "correct_secret"
    payload = b'{"data": 123}'
    invalid_header = (
        "sha256=0000000000000000000000000000000000000000000000000000000000000000"
    )

    assert verify_github_signature(payload, invalid_header, secret) is False


def test_tampered_payload_rejected() -> None:
    secret = "test_secret"
    original_payload = b'{"admin": false}'
    tampered_payload = b'{"admin": true}'

    computed_hash = hmac.new(
        secret.encode("utf-8"), original_payload, hashlib.sha256
    ).hexdigest()
    sig_header = f"sha256={computed_hash}"

    # Verifying tampered payload against original signature must fail
    assert verify_github_signature(tampered_payload, sig_header, secret) is False


def test_missing_or_malformed_headers() -> None:
    secret = "secret"
    payload = b"{}"

    assert verify_github_signature(payload, "", secret) is False
    assert verify_github_signature(payload, "md5=12345", secret) is False
    assert verify_github_signature(payload, "invalid_format", secret) is False


def test_delivery_deduplication() -> None:
    dedup = DeliveryDeduplicator(ttl_seconds=60)
    guid = "delivery-guid-abc-123"

    # First attempt: not a duplicate
    assert dedup.is_duplicate(guid) is False

    # Second attempt: detected as duplicate
    assert dedup.is_duplicate(guid) is True
