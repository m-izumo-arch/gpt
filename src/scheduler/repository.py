from __future__ import annotations

from collections import defaultdict
from datetime import date
from typing import Dict, Iterable, List, Optional

from .models import DailySchedule, Doctor, EventCategory, ScheduleEvent


class InMemoryScheduleRepository:
    """Simple in-memory repository used for prototyping and tests."""

    def __init__(self) -> None:
        self._events: Dict[str, ScheduleEvent] = {}
        self._events_by_doctor: Dict[str, set[str]] = defaultdict(set)
        self._doctors: Dict[str, Doctor] = {}

    # Doctor operations -------------------------------------------------
    def upsert_doctor(self, doctor: Doctor) -> Doctor:
        self._doctors[doctor.id] = doctor
        return doctor

    def get_doctor(self, doctor_id: str) -> Optional[Doctor]:
        return self._doctors.get(doctor_id)

    def list_doctors(self) -> List[Doctor]:
        return list(self._doctors.values())

    # Event operations --------------------------------------------------
    def add_event(self, event: ScheduleEvent) -> ScheduleEvent:
        self._events[event.id] = event
        self._events_by_doctor[event.doctor_id].add(event.id)
        return event

    def get_event(self, event_id: str) -> Optional[ScheduleEvent]:
        return self._events.get(event_id)

    def update_event(self, event: ScheduleEvent) -> ScheduleEvent:
        if event.id not in self._events:
            raise KeyError(f"Event {event.id} does not exist")
        self._events[event.id] = event
        self._events_by_doctor[event.doctor_id].add(event.id)
        return event

    def delete_event(self, event_id: str) -> None:
        event = self._events.pop(event_id, None)
        if not event:
            raise KeyError(f"Event {event_id} does not exist")
        event_ids = self._events_by_doctor.get(event.doctor_id)
        if event_ids and event_id in event_ids:
            event_ids.remove(event_id)
            if not event_ids:
                self._events_by_doctor.pop(event.doctor_id, None)

    def events_for_doctor(self, doctor_id: str) -> Iterable[ScheduleEvent]:
        for event_id in self._events_by_doctor.get(doctor_id, set()):
            yield self._events[event_id]

    def filter_events(
        self,
        *,
        doctor_id: Optional[str] = None,
        category: Optional[EventCategory] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> List[ScheduleEvent]:
        events: Iterable[ScheduleEvent]
        if doctor_id:
            events = self.events_for_doctor(doctor_id)
        else:
            events = self._events.values()

        filtered: List[ScheduleEvent] = []
        for event in events:
            if category and event.category != category:
                continue
            if start_date and event.start_time.date() < start_date:
                continue
            if end_date and event.end_time.date() > end_date:
                continue
            filtered.append(event)
        return sorted(filtered, key=lambda event: event.start_time)

    def daily_schedule(self, doctor_id: str, schedule_date: date) -> DailySchedule:
        doctor = self._doctors.get(doctor_id)
        if not doctor:
            raise KeyError(f"Doctor {doctor_id} does not exist")
        events = [
            event
            for event in self.events_for_doctor(doctor_id)
            if event.start_time.date() == schedule_date
        ]
        events.sort(key=lambda event: event.start_time)
        return DailySchedule(doctor=doctor, date=schedule_date, events=events)

    def clear(self) -> None:
        self._events.clear()
        self._events_by_doctor.clear()
        self._doctors.clear()
