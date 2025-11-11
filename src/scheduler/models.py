from __future__ import annotations

from datetime import datetime, date
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, validator


class EventCategory(str, Enum):
    """Enum describing supported event categories."""

    SURGERY = "surgery"
    OUTPATIENT = "outpatient"
    ABSENCE = "absence"
    MEETING = "meeting"
    OTHER = "other"


class Doctor(BaseModel):
    """Representation of a doctor that can be scheduled."""

    id: str = Field(..., description="Unique identifier for the doctor")
    name: str = Field(..., description="Doctor's full name")
    department: Optional[str] = Field(
        default=None, description="Optional department name for the doctor"
    )


class ScheduleEventBase(BaseModel):
    """Common fields shared by multiple schedule event payloads."""

    doctor_id: str = Field(..., description="Identifier of the doctor for the event")
    category: EventCategory = Field(..., description="Category of the schedule event")
    title: str = Field(..., description="Short title for the event")
    start_time: datetime = Field(..., description="Start timestamp for the event")
    end_time: datetime = Field(..., description="End timestamp for the event")
    notes: Optional[str] = Field(
        default=None, description="Free-form notes that provide more context"
    )
    operating_room: Optional[str] = Field(
        default=None,
        description="Operating room identifier – required when category is surgery",
    )
    clinic_room: Optional[str] = Field(
        default=None,
        description="Clinic room identifier – required when category is outpatient",
    )
    absence_reason: Optional[str] = Field(
        default=None,
        description="Reason for absence – required when category is absence",
    )
    meeting_location: Optional[str] = Field(
        default=None,
        description="Meeting location – required when category is meeting",
    )

    @validator("end_time")
    def validate_time_range(cls, end_time: datetime, values: dict) -> datetime:
        start_time = values.get("start_time")
        if start_time and end_time <= start_time:
            raise ValueError("end_time must be after start_time")
        return end_time

    @validator("operating_room", always=True)
    def validate_operating_room(cls, value: Optional[str], values: dict) -> Optional[str]:
        if values.get("category") == EventCategory.SURGERY and not value:
            raise ValueError("operating_room is required for surgery events")
        return value

    @validator("clinic_room", always=True)
    def validate_clinic_room(cls, value: Optional[str], values: dict) -> Optional[str]:
        if values.get("category") == EventCategory.OUTPATIENT and not value:
            raise ValueError("clinic_room is required for outpatient events")
        return value

    @validator("absence_reason", always=True)
    def validate_absence_reason(cls, value: Optional[str], values: dict) -> Optional[str]:
        if values.get("category") == EventCategory.ABSENCE and not value:
            raise ValueError("absence_reason is required for absence events")
        return value

    @validator("meeting_location", always=True)
    def validate_meeting_location(cls, value: Optional[str], values: dict) -> Optional[str]:
        if values.get("category") == EventCategory.MEETING and not value:
            raise ValueError("meeting_location is required for meeting events")
        return value


class ScheduleEventCreate(ScheduleEventBase):
    """Payload for creating an event."""

    pass


class ScheduleEventUpdate(BaseModel):
    """Payload for updating an existing event."""

    doctor_id: Optional[str]
    category: Optional[EventCategory]
    title: Optional[str]
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    notes: Optional[str]
    operating_room: Optional[str]
    clinic_room: Optional[str]
    absence_reason: Optional[str]
    meeting_location: Optional[str]

    @validator("end_time")
    def validate_end_time(cls, end_time: datetime, values: dict) -> datetime:
        start_time = values.get("start_time")
        if start_time and end_time <= start_time:
            raise ValueError("end_time must be after start_time")
        return end_time


class ScheduleEvent(ScheduleEventBase):
    """Stored schedule event with identifier metadata."""

    id: str = Field(..., description="Unique identifier for the schedule event")


class DailySchedule(BaseModel):
    """Representation of a daily schedule for a doctor."""

    doctor: Doctor
    date: date
    events: list[ScheduleEvent]
