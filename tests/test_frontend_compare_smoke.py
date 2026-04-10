from __future__ import annotations

import re
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import urlparse

from playwright.sync_api import Route, expect, sync_playwright


FRONTEND_DIST = Path(__file__).resolve().parents[1] / "frontend" / "dist"


def _compare_payload() -> dict:
    return {
        "submitted_count": 2,
        "resolved_count": 2,
        "comparisons": [
            {
                "submitted_url": "https://www.sayweee.com/product/example-a",
                "supported": True,
                "store_key": "weee",
                "normalized_url": "https://www.sayweee.com/product/example-a",
                "fetch_succeeded": True,
                "candidate_key": "weee::example-a",
                "brand_hint": "Acme",
                "size_hint": "16 oz",
                "support_contract": {
                    "support_channel": "official",
                    "store_support_tier": "official_full",
                    "support_reason_codes": ["official_store_registry", "compare_intake"],
                    "next_step_codes": ["save_compare_evidence", "create_watch_task", "create_watch_group"],
                    "intake_status": "supported",
                    "summary": "This row is fully supported for compare, watch tasks, and compare-aware groups.",
                    "next_step": "Save proof first, then choose between a single watch task or a group.",
                    "can_save_compare_evidence": True,
                    "can_create_watch_task": True,
                    "can_create_watch_group": True,
                    "cashback_supported": True,
                    "notifications_supported": True,
                    "missing_capabilities": [],
                },
                "offer": {
                    "store_id": "weee",
                    "product_key": "example-a",
                    "deal_id": "deal-a",
                    "title": "Acme Jasmine Rice",
                    "url": "https://www.sayweee.com/product/example-a",
                    "price": 6.49,
                    "original_price": 7.29,
                    "fetch_at": "2026-04-10T08:30:00Z",
                    "context": {
                        "region": "Seattle",
                        "currency": "USD",
                        "is_member": False,
                    },
                    "unit_price_info": {
                        "unit": "oz",
                        "value": 16,
                    },
                },
            },
            {
                "submitted_url": "https://www.target.com/p/example-b",
                "supported": True,
                "store_key": "target",
                "normalized_url": "https://www.target.com/p/example-b",
                "fetch_succeeded": True,
                "candidate_key": "target::example-b",
                "brand_hint": "Acme",
                "size_hint": "16 oz",
                "support_contract": {
                    "support_channel": "official",
                    "store_support_tier": "official_full",
                    "support_reason_codes": ["official_store_registry", "compare_intake"],
                    "next_step_codes": ["save_compare_evidence", "create_watch_task", "create_watch_group"],
                    "intake_status": "supported",
                    "summary": "This row is also ready for compare, watch tasks, and group creation.",
                    "next_step": "Keep it in the same basket so the runtime can keep reranking.",
                    "can_save_compare_evidence": True,
                    "can_create_watch_task": True,
                    "can_create_watch_group": True,
                    "cashback_supported": True,
                    "notifications_supported": True,
                    "missing_capabilities": [],
                },
                "offer": {
                    "store_id": "target",
                    "product_key": "example-b",
                    "deal_id": "deal-b",
                    "title": "Acme Jasmine Rice",
                    "url": "https://www.target.com/p/example-b",
                    "price": 6.99,
                    "original_price": 7.49,
                    "fetch_at": "2026-04-10T08:31:00Z",
                    "context": {
                        "region": "Seattle",
                        "currency": "USD",
                        "is_member": True,
                    },
                    "unit_price_info": {
                        "unit": "oz",
                        "value": 16,
                    },
                },
            },
        ],
        "matches": [
            {
                "left_store_key": "weee",
                "left_product_key": "example-a",
                "right_store_key": "target",
                "right_product_key": "example-b",
                "score": 92.0,
                "title_similarity": 97.0,
                "brand_signal": "match",
                "size_signal": "match",
                "product_key_signal": "close_match",
                "left_candidate_key": "weee::example-a",
                "right_candidate_key": "target::example-b",
                "why_like": [
                    "Both rows carry the same Acme Jasmine Rice title.",
                    "Both sizes resolve to 16 oz.",
                ],
                "why_unlike": [
                    "Target is still priced slightly higher.",
                ],
            }
        ],
        "recommendation": {
            "contract_version": "compare_preview_public_v1",
            "surface": "compare_preview",
            "scope": "local_runtime_compare_flow",
            "visibility": "user_visible",
            "status": "issued",
            "verdict": "wait",
            "verdict_vocabulary": ["wait", "recheck_later", "insufficient_evidence"],
            "headline": "The basket is ready for a compare-aware watch group",
            "summary": "Weee currently looks like the clearest low-price row, but the stronger next move is to keep both rows in the basket and let the runtime keep reranking.",
            "basis": [
                "Two official-full rows resolved with live offers.",
                "The strongest pair score is above the group-ready threshold.",
            ],
            "uncertainty_notes": [
                "Target is slightly more expensive right now.",
            ],
            "abstention": {
                "active": False,
                "code": None,
                "reason": None,
            },
            "evidence_refs": [
                {
                    "code": "pair_score",
                    "label": "Strongest pair",
                    "anchor": "weee::example-a -> target::example-b",
                }
            ],
            "deterministic_primary_note": "Deterministic compare evidence stays primary.",
            "feedback_boundary": "Operator judgment still owns the final commit move.",
            "override_boundary": "The UI explains the proof but does not make the final buying decision for you.",
            "buy_now_blocked": True,
        },
        "recommended_next_step_hint": {
            "action": "create_watch_group",
            "reason_code": "group_ready",
            "summary": "Save proof first, then move this basket into a compare-aware watch group.",
            "successful_candidate_count": 2,
            "strongest_match_score": 92.0,
        },
        "risk_notes": [
            "Target is still slightly more expensive.",
        ],
        "risk_note_items": [
            {
                "code": "minor_price_gap",
                "message": "Target is still slightly more expensive.",
            }
        ],
        "ai_explain": {
            "status": "ok",
            "title": "AI-assisted explanation",
            "summary": "The deterministic board already has enough proof to keep both rows alive.",
            "detail": "Save the proof first, then let the runtime keep the basket honest over time.",
            "bullets": [
                "Weee is currently the lower listed row.",
                "Both rows are strong enough to stay together in a compare-aware group.",
            ],
        },
    }


def _notification_settings_payload() -> dict:
    return {
        "default_recipient_email": "owner@example.com",
        "cooldown_minutes": 240,
        "notifications_enabled": True,
    }


def _runtime_package_payload() -> dict:
    return {
        "id": "runtime-proof-1",
        "created_at": "2026-04-10T08:35:00Z",
        "html_url": "http://127.0.0.1:4173/runtime-proof-1.html",
        "summary_path": ".runtime-cache/evidence/runtime-proof-1.json",
    }


def _api_handler(route: Route) -> None:
    request = route.request
    path = urlparse(request.url).path

    if path == "/api/settings/notifications" and request.method == "GET":
        route.fulfill(status=200, json=_notification_settings_payload())
        return

    if path == "/api/compare/preview" and request.method == "POST":
        route.fulfill(status=200, json=_compare_payload())
        return

    if path == "/api/compare/evidence-packages" and request.method == "POST":
        route.fulfill(status=200, json=_runtime_package_payload())
        return

    route.fulfill(status=404, json={"detail": f"Unhandled smoke route: {path}"})


class _StaticHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, directory: str, **kwargs):
        super().__init__(*args, directory=directory, **kwargs)

    def log_message(self, format: str, *args) -> None:  # noqa: A003
        return


def _serve_frontend() -> tuple[ThreadingHTTPServer, str]:
    server = ThreadingHTTPServer(
        ("127.0.0.1", 0),
        partial(_StaticHandler, directory=str(FRONTEND_DIST)),
    )
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    host, port = server.server_address
    return server, f"http://{host}:{port}"


def test_compare_frontend_smoke_handles_proof_commit_and_locale_switch() -> None:
    assert FRONTEND_DIST.exists(), "frontend dist is missing; run the frontend build before this smoke."

    server, base_url = _serve_frontend()
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page()
            page.route("**/api/**", _api_handler)

            page.goto(f"{base_url}/index.html#compare", wait_until="networkidle")

            expect(page.get_by_role("heading", name="Inspect cross-store URL candidates before you create a task or group")).to_be_visible()
            page.get_by_role("button", name="Compare URLs").click()

            expect(page.get_by_role("button", name="Save review package")).to_be_visible()
            expect(page.get_by_text("The basket is ready for a compare-aware watch group")).to_be_visible()

            page.get_by_role("button", name="Save review package").click()
            expect(page.get_by_text("Saved this compare evidence package for local review on this machine.")).to_be_visible()

            page.get_by_role("button", name="Create runtime evidence package").click()
            expect(page.get_by_text("Runtime evidence package created. This stays local to the runtime and does not create a public link.")).to_be_visible()
            expect(page.get_by_text("runtime package ready")).to_be_visible()
            expect(page.get_by_role("link", name="Open runtime package view")).to_have_attribute("href", "http://127.0.0.1:4173/runtime-proof-1.html")

            page.get_by_role("link", name="Open commit lane").click()
            expect(page.locator("#group-builder-panel")).to_be_visible()
            expect(page.get_by_role("button", name="Create watch group from successful candidates")).to_be_visible()

            page.get_by_role("button", name="Create watch task from this row").first.click()
            expect(page).to_have_url(re.compile(r"#watch-new$"))
            expect(page.get_by_text("Compare handoff")).to_be_visible()
            expect(page.get_by_text("weee::example-a")).to_be_visible()

            page.get_by_role("button", name="简体中文").click()
            expect(page.get_by_text("语言")).to_be_visible()
            expect(page.get_by_role("button", name="单项监控")).to_be_visible()
            expect(page.get_by_text("当前重点")).to_be_visible()

            page.get_by_role("button", name="English").click()
            expect(page.get_by_text("Language")).to_be_visible()

            browser.close()
    finally:
        server.shutdown()
        server.server_close()
