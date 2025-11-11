import { useEffect, useMemo, useState } from "react";
import Filters from "./components/Filters";
import ScheduleTable from "./components/ScheduleTable";
import { useSchedule } from "./hooks/useSchedule";
import { DailySchedule, EventCategory } from "./types";

const CATEGORY_COLORS: Record<EventCategory, string> = {
  surgery: "#f97316",
  outpatient: "#16a34a",
  absence: "#ef4444",
  meeting: "#3b82f6",
  other: "#6b7280",
};

type ViewMode = "day" | "week";

function App() {
  const {
    loading,
    doctors,
    events,
    daily,
    weekly,
    error,
    loadEvents,
    loadDaily,
    loadWeekly,
  } = useSchedule();

  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [doctorId, setDoctorId] = useState<string>();
  const [category, setCategory] = useState<EventCategory | "all">("all");
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    if (doctors.length && !doctorId) {
      setDoctorId(doctors[0].id);
    }
  }, [doctors, doctorId]);

  useEffect(() => {
    if (!doctorId) return;
    if (viewMode === "day") {
      loadDaily(doctorId, startDate);
    } else {
      loadWeekly(doctorId, startDate);
    }
  }, [doctorId, startDate, viewMode, loadDaily, loadWeekly]);

  useEffect(() => {
    loadEvents({ doctorId, category, startDate, endDate });
  }, [doctorId, category, startDate, endDate, loadEvents]);

  const schedule: DailySchedule[] = useMemo(() => {
    if (viewMode === "day" && daily) {
      return [daily];
    }
    if (viewMode === "week" && weekly) {
      return weekly;
    }
    return [];
  }, [viewMode, daily, weekly]);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-5xl space-y-6 rounded bg-white p-6 shadow">
        <header className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              医師スケジューラー
            </h1>
            <p className="text-sm text-slate-500">
              医師ごとの予定を日別・週別に確認し、カテゴリで色分け表示します。
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("day")}
              className={`rounded px-3 py-1 text-sm font-medium ${
                viewMode === "day"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              日別
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`rounded px-3 py-1 text-sm font-medium ${
                viewMode === "week"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              週別
            </button>
          </div>
        </header>

        <Filters
          doctors={doctors}
          doctorId={doctorId}
          onDoctorChange={setDoctorId}
          category={category}
          onCategoryChange={setCategory}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />

        {error ? (
          <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        ) : null}

        <ScheduleTable
          loading={loading}
          schedules={schedule}
          events={events}
          categoryColors={CATEGORY_COLORS}
        />
      </div>
    </div>
  );
}

export default App;
