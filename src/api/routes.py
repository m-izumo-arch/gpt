from __future__ import annotations

from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, FastAPI, HTTPException, Query, Request

from ..scheduler.models import (
    DailySchedule,
    Doctor,
    EventCategory,
    ScheduleEvent,
    ScheduleEventCreate,
    ScheduleEventUpdate,
)
from ..scheduler.service import ScheduleService

router = APIRouter()


def get_service(request: Request) -> ScheduleService:
    return request.app.state.schedule_service


@router.post("/doctors", response_model=Doctor, status_code=201)
def register_doctor(doctor: Doctor, service: ScheduleService = Depends(get_service)) -> Doctor:
    return service.register_doctor(doctor)


@router.get("/doctors", response_model=List[Doctor])
def list_doctors(service: ScheduleService = Depends(get_service)) -> List[Doctor]:
    return service.list_doctors()


@router.post("/events", response_model=ScheduleEvent, status_code=201)
def create_event(
    payload: ScheduleEventCreate, service: ScheduleService = Depends(get_service)
) -> ScheduleEvent:
    try:
        return service.create_event(payload)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/events", response_model=List[ScheduleEvent])
def list_events(
    *,
    service: ScheduleService = Depends(get_service),
    doctor_id: Optional[str] = Query(None),
    category: Optional[EventCategory] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
) -> List[ScheduleEvent]:
    return service.filter_events(
        doctor_id=doctor_id,
        category=category,
        start_date=start_date,
        end_date=end_date,
    )


@router.get("/events/{event_id}", response_model=ScheduleEvent)
def get_event(
    event_id: str, service: ScheduleService = Depends(get_service)
) -> ScheduleEvent:
    try:
        return service.get_event(event_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.put("/events/{event_id}", response_model=ScheduleEvent)
def update_event(
    event_id: str,
    payload: ScheduleEventUpdate,
    service: ScheduleService = Depends(get_service),
) -> ScheduleEvent:
    try:
        return service.update_event(event_id, payload)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.delete("/events/{event_id}", status_code=204)
def delete_event(event_id: str, service: ScheduleService = Depends(get_service)) -> None:
    try:
        service.delete_event(event_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get(
    "/doctors/{doctor_id}/daily",
    response_model=DailySchedule,
)
def daily_schedule(
    doctor_id: str,
    schedule_date: date = Query(..., description="Target date for the schedule"),
    service: ScheduleService = Depends(get_service),
) -> DailySchedule:
    try:
        return service.daily_schedule(doctor_id, schedule_date)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get(
    "/doctors/{doctor_id}/weekly",
    response_model=List[DailySchedule],
)
def weekly_schedule(
    doctor_id: str,
    week_start: date = Query(..., description="First day of the week"),
    service: ScheduleService = Depends(get_service),
) -> List[DailySchedule]:
    try:
        return service.weekly_schedule(doctor_id, week_start)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


def create_app() -> FastAPI:
    app = FastAPI(title="Scheduling API")
    app.state.schedule_service = ScheduleService()
    app.include_router(router, prefix="/api")
    return app
