from __future__ import annotations

from datetime import datetime

import pytest

from src.scheduler.models import Doctor, EventCategory, ScheduleEventCreate, ScheduleEventUpdate
from src.scheduler.service import ScheduleService


def sample_doctor() -> Doctor:
    return Doctor(id="d1", name="Dr. Ada Lovelace", department="Surgery")


def sample_payload(**overrides):
    base = {
        "doctor_id": "d1",
        "category": EventCategory.SURGERY,
        "title": "Appendectomy",
        "start_time": datetime(2024, 3, 1, 9, 0),
        "end_time": datetime(2024, 3, 1, 10, 0),
        "operating_room": "OR-1",
    }
    base.update(overrides)
    return ScheduleEventCreate(**base)


def test_create_event_requires_doctor():
    service = ScheduleService()
    payload = sample_payload()

    with pytest.raises(KeyError):
        service.create_event(payload)


def test_create_event_success():
    service = ScheduleService()
    service.register_doctor(sample_doctor())

    event = service.create_event(sample_payload())

    assert event.id
    assert event.title == "Appendectomy"
    assert event.category == EventCategory.SURGERY


def test_update_event_changes_category_with_validation():
    service = ScheduleService()
    service.register_doctor(sample_doctor())

    event = service.create_event(sample_payload())

    update = ScheduleEventUpdate(
        category=EventCategory.ABSENCE,
        absence_reason="Conference",
        operating_room=None,
    )

    updated = service.update_event(event.id, update)
    assert updated.category == EventCategory.ABSENCE
    assert updated.absence_reason == "Conference"


@pytest.mark.parametrize(
    "category,extra",
    [
        (EventCategory.SURGERY, {"operating_room": "OR-1"}),
        (EventCategory.OUTPATIENT, {"clinic_room": "C-1"}),
        (EventCategory.ABSENCE, {"absence_reason": "Vacation"}),
        (EventCategory.MEETING, {"meeting_location": "Conf Room"}),
    ],
)
def test_category_specific_validation(category, extra):
    service = ScheduleService()
    service.register_doctor(sample_doctor())

    payload_data = {
        "doctor_id": "d1",
        "category": category,
        "title": "Generic",
        "start_time": datetime(2024, 3, 1, 9, 0),
        "end_time": datetime(2024, 3, 1, 10, 0),
    }
    payload_data.update(extra)
    payload = ScheduleEventCreate(**payload_data)

    event = service.create_event(payload)
    assert event.category == category


def test_filter_events_by_doctor_and_category():
    service = ScheduleService()
    service.register_doctor(sample_doctor())

    service.create_event(sample_payload())
    service.create_event(
        sample_payload(
            category=EventCategory.OUTPATIENT,
            clinic_room="201",
            title="Clinic",
            start_time=datetime(2024, 3, 1, 11, 0),
            end_time=datetime(2024, 3, 1, 11, 30),
        )
    )

    events = service.filter_events(doctor_id="d1", category=EventCategory.OUTPATIENT)
    assert len(events) == 1
    assert events[0].title == "Clinic"


def test_weekly_schedule_returns_seven_days():
    service = ScheduleService()
    service.register_doctor(sample_doctor())
    service.create_event(sample_payload())

    week = service.weekly_schedule("d1", datetime(2024, 2, 26).date())
    assert len(week) == 7
