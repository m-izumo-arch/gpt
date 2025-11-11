import { Doctor, EventCategory } from "../types";

type Props = {
  doctors: Doctor[];
  doctorId?: string;
  onDoctorChange: (id: string) => void;
  category: EventCategory | "all";
  onCategoryChange: (category: EventCategory | "all") => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
};

const CATEGORIES: { value: EventCategory | "all"; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "surgery", label: "手術" },
  { value: "outpatient", label: "外来" },
  { value: "absence", label: "不在" },
  { value: "meeting", label: "会議" },
  { value: "other", label: "その他" },
];

function Filters({
  doctors,
  doctorId,
  onDoctorChange,
  category,
  onCategoryChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: Props) {
  return (
    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-600">医師</span>
        <select
          className="rounded border border-slate-300 px-3 py-2"
          value={doctorId ?? ""}
          onChange={(event) => onDoctorChange(event.target.value)}
        >
          <option value="" disabled>
            医師を選択
          </option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-600">カテゴリ</span>
        <select
          className="rounded border border-slate-300 px-3 py-2"
          value={category}
          onChange={(event) => onCategoryChange(event.target.value as EventCategory | "all")}
        >
          {CATEGORIES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-600">開始日</span>
        <input
          type="date"
          className="rounded border border-slate-300 px-3 py-2"
          value={startDate}
          onChange={(event) => onStartDateChange(event.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-600">終了日</span>
        <input
          type="date"
          className="rounded border border-slate-300 px-3 py-2"
          value={endDate}
          onChange={(event) => onEndDateChange(event.target.value)}
        />
      </label>
    </section>
  );
}

export default Filters;
