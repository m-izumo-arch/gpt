from __future__ import annotations

from datetime import datetime

import pytest

try:
    from fastapi.testclient import TestClient
    from src.api.routes import create_app
    fastapi_available = True
except ModuleNotFoundError:
    fastapi_available = False

from src.scheduler.models import EventCategory


pytestmark = pytest.mark.skipif(
    not fastapi_available, reason="FastAPI is not available in the execution environment"
)


client = TestClient(create_app()) if fastapi_available else None


def register_doctor():
    assert client is not None
    response = client.post(
        "/api/doctors",
        json={"id": "d1", "name": "Dr. Turing", "department": "Oncology"},
    )
    assert response.status_code == 201


def test_full_event_lifecycle():
    assert client is not None
    register_doctor()

    create_payload = {
        "doctor_id": "d1",
        "category": EventCategory.SURGERY.value,
        "title": "Lung Transplant",
        "start_time": datetime(2024, 3, 10, 8, 0).isoformat(),
        "end_time": datetime(2024, 3, 10, 12, 0).isoformat(),
        "operating_room": "OR-3",
    }
    response = client.post("/api/events", json=create_payload)
    assert response.status_code == 201
    event = response.json()

    response = client.get(
        "/api/events",
        params={"doctor_id": "d1", "category": EventCategory.SURGERY.value},
    )
    assert response.status_code == 200
    events = response.json()
    assert len(events) == 1

    update_payload = {"notes": "Patient requires ICU bed"}
    response = client.put(f"/api/events/{event['id']}", json=update_payload)
    assert response.status_code == 200
    assert response.json()["notes"] == "Patient requires ICU bed"

    response = client.delete(f"/api/events/{event['id']}")
    assert response.status_code == 204

    response = client.get(f"/api/events/{event['id']}")
    assert response.status_code == 404
