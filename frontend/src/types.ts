export type EventCategory =
  | "surgery"
  | "outpatient"
  | "absence"
  | "meeting"
  | "other";

export interface Doctor {
  id: string;
  name: string;
  department?: string;
}

export interface ScheduleEvent {
  id: string;
  doctor_id: string;
  category: EventCategory;
  title: string;
  start_time: string;
  end_time: string;
  notes?: string;
  operating_room?: string | null;
  clinic_room?: string | null;
  absence_reason?: string | null;
  meeting_location?: string | null;
}

export interface DailySchedule {
  doctor: Doctor;
  date: string;
  events: ScheduleEvent[];
}
