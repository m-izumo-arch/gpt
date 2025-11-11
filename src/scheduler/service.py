from __future__ import annotations

import uuid
from datetime import date, timedelta
from typing import List, Optional

from .models import (
    DailySchedule,
    Doctor,
    EventCategory,
    ScheduleEvent,
    ScheduleEventCreate,
    ScheduleEventUpdate,
)
from .repository import InMemoryScheduleRepository


class ScheduleService:
    """Business logic layer for scheduling operations."""

    def __init__(self, repository: Optional[InMemoryScheduleRepository] = None) -> None:
        self.repository = repository or InMemoryScheduleRepository()

    # Doctor operations -------------------------------------------------
    def register_doctor(self, doctor: Doctor) -> Doctor:
        return self.repository.upsert_doctor(doctor)

    def list_doctors(self) -> List[Doctor]:
        return self.repository.list_doctors()

    # Event operations --------------------------------------------------
    def create_event(self, payload: ScheduleEventCreate) -> ScheduleEvent:
        self._ensure_doctor_exists(payload.doctor_id)
        event_id = str(uuid.uuid4())
        event = ScheduleEvent(id=event_id, **payload.dict())
        return self.repository.add_event(event)

    def get_event(self, event_id: str) -> ScheduleEvent:
        event = self.repository.get_event(event_id)
        if not event:
            raise KeyError(f"Event {event_id} does not exist")
        return event

    def update_event(self, event_id: str, payload: ScheduleEventUpdate) -> ScheduleEvent:
        stored_event = self.get_event(event_id)
        data = stored_event.dict()
        update_data = payload.dict(exclude_unset=True)

        data.update(update_data)
        updated_event = ScheduleEvent(**data)
        self._ensure_doctor_exists(updated_event.doctor_id)
        return self.repository.update_event(updated_event)

    def delete_event(self, event_id: str) -> None:
        self.repository.delete_event(event_id)

    def filter_events(
        self,
        *,
        doctor_id: Optional[str] = None,
        category: Optional[EventCategory] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> List[ScheduleEvent]:
        return self.repository.filter_events(
            doctor_id=doctor_id,
            category=category,
            start_date=start_date,
            end_date=end_date,
        )

    def daily_schedule(self, doctor_id: str, schedule_date: date) -> DailySchedule:
        return self.repository.daily_schedule(doctor_id, schedule_date)

    def weekly_schedule(self, doctor_id: str, start_date: date) -> List[DailySchedule]:
        return [
            self.daily_schedule(doctor_id, schedule_date=start_date + offset)
            for offset in _week_offsets()
        ]

    # Internal helpers --------------------------------------------------
    def _ensure_doctor_exists(self, doctor_id: str) -> None:
        if not self.repository.get_doctor(doctor_id):
            raise KeyError(f"Doctor {doctor_id} does not exist")


def _week_offsets() -> List[timedelta]:
    return [timedelta(days=offset) for offset in range(7)]
