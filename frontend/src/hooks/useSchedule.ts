import { useCallback, useEffect, useState } from "react";
import { DailySchedule, Doctor, EventCategory, ScheduleEvent } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";

export interface ScheduleFilters {
  doctorId?: string;
  category?: EventCategory | "all";
  startDate?: string;
  endDate?: string;
}

export interface ScheduleState {
  loading: boolean;
  doctors: Doctor[];
  events: ScheduleEvent[];
  daily?: DailySchedule;
  weekly?: DailySchedule[];
  error?: string;
  refreshDoctors: () => void;
  loadEvents: (filters: ScheduleFilters) => void;
  loadDaily: (doctorId: string, date: string) => void;
  loadWeekly: (doctorId: string, weekStart: string) => void;
}

export function useSchedule(): ScheduleState {
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [daily, setDaily] = useState<DailySchedule>();
  const [weekly, setWeekly] = useState<DailySchedule[]>();
  const [error, setError] = useState<string>();

  const handleError = (err: unknown) => {
    console.error(err);
    setError(err instanceof Error ? err.message : "Failed to load data");
  };

  const refreshDoctors = useCallback(async () => {
    try {
      setError(undefined);
      const response = await fetch(`${API_BASE}/doctors`);
      if (!response.ok) {
        throw new Error("Failed to fetch doctors");
      }
      const data = (await response.json()) as Doctor[];
      setDoctors(data);
    } catch (err) {
      handleError(err);
    }
  }, []);

  const loadEvents = useCallback(async (filters: ScheduleFilters) => {
    setLoading(true);
    setError(undefined);
    try {
      const params = new URLSearchParams();
      if (filters.doctorId) params.set("doctor_id", filters.doctorId);
      if (filters.category && filters.category !== "all") {
        params.set("category", filters.category);
      }
      if (filters.startDate) params.set("start_date", filters.startDate);
      if (filters.endDate) params.set("end_date", filters.endDate);

      const response = await fetch(`${API_BASE}/events?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      const data = (await response.json()) as ScheduleEvent[];
      setEvents(data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDaily = useCallback(async (doctorId: string, date: string) => {
    setLoading(true);
    setError(undefined);
    try {
      const params = new URLSearchParams({ schedule_date: date });
      const response = await fetch(
        `${API_BASE}/doctors/${doctorId}/daily?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch daily schedule");
      }
      const data = (await response.json()) as DailySchedule;
      setDaily(data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadWeekly = useCallback(async (doctorId: string, weekStart: string) => {
    setLoading(true);
    setError(undefined);
    try {
      const params = new URLSearchParams({ week_start: weekStart });
      const response = await fetch(
        `${API_BASE}/doctors/${doctorId}/weekly?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch weekly schedule");
      }
      const data = (await response.json()) as DailySchedule[];
      setWeekly(data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDoctors();
  }, [refreshDoctors]);

  return {
    loading,
    doctors,
    events,
    daily,
    weekly,
    error,
    refreshDoctors,
    loadEvents,
    loadDaily,
    loadWeekly,
  };
}
