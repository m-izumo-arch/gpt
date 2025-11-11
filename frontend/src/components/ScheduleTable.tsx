import { Fragment } from "react";
import { DailySchedule, EventCategory, ScheduleEvent } from "../types";

interface Props {
  loading: boolean;
  schedules: DailySchedule[];
  events: ScheduleEvent[];
  categoryColors: Record<EventCategory, string>;
}

const CATEGORY_LABELS: Record<EventCategory, string> = {
  surgery: "手術",
  outpatient: "外来",
  absence: "不在",
  meeting: "会議",
  other: "その他",
};

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
    weekday: "short",
  });
}

function ScheduleTable({ loading, schedules, events, categoryColors }: Props) {
  return (
    <section className="space-y-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                日付
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                開始
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                終了
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                カテゴリ
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                件名
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                詳細
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {loading ? (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                  読み込み中...
                </td>
              </tr>
            ) : schedules.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                  表示できる予定がありません。
                </td>
              </tr>
            ) : (
              schedules.map((schedule) => (
                <Fragment key={schedule.date}>
                  {schedule.events.length === 0 ? (
                    <tr>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {formatDate(schedule.date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400" colSpan={5}>
                        予定なし
                      </td>
                    </tr>
                  ) : (
                    schedule.events.map((event) => (
                      <tr key={event.id}>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {formatDate(schedule.date)}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {formatTime(event.start_time)}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {formatTime(event.end_time)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-white">
                          <span
                            className="rounded px-2 py-1"
                            style={{ backgroundColor: categoryColors[event.category] }}
                          >
                            {CATEGORY_LABELS[event.category]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {event.title}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">
                          {event.notes ??
                            event.operating_room ??
                            event.clinic_room ??
                            event.absence_reason ??
                            event.meeting_location ??
                            "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="rounded border border-slate-200 bg-slate-50 p-4">
        <h2 className="mb-2 text-sm font-semibold text-slate-600">検索結果 ({events.length} 件)</h2>
        <div className="flex flex-wrap gap-2 text-sm">
          {events.map((event) => (
            <div
              key={event.id}
              className="rounded border border-slate-200 bg-white px-3 py-2 shadow-sm"
            >
              <div className="font-medium text-slate-700">{event.title}</div>
              <div className="text-xs text-slate-500">
                {formatDate(event.start_time)} {formatTime(event.start_time)}-
                {formatTime(event.end_time)} ({CATEGORY_LABELS[event.category]})
              </div>
            </div>
          ))}
          {events.length === 0 ? (
            <span className="text-slate-500">条件に一致する予定はありません。</span>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default ScheduleTable;
