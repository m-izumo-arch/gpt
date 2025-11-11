const departmentColors = {
  内科: "#0f8c79",
  外科: "#d94f20",
  小児科: "#c03f7d",
  整形外科: "#5c6ac4",
  産婦人科: "#b25fcb",
  眼科: "#00a6ff",
};

const scheduleForm = document.querySelector("#scheduleForm");
const scheduleBody = document.querySelector("#scheduleBody");
const emptyState = document.querySelector("#emptyState");
const filterDepartment = document.querySelector("#filterDepartment");
const filterType = document.querySelector("#filterType");
const rowTemplate = document.querySelector("#rowTemplate");
const dateInput = document.querySelector("#date");
const timeInput = document.querySelector("#time");
const legendList = document.querySelector("#departmentLegend");

const schedules = [];

const initialSchedules = [
  {
    id: createId(),
    date: formatInputDate(new Date()),
    time: "09:30",
    doctor: "山田 太郎",
    department: "内科",
    type: "診察",
    notes: "外来担当",
  },
  {
    id: createId(),
    date: formatInputDate(addDays(new Date(), 1)),
    time: "13:00",
    doctor: "佐藤 花子",
    department: "外科",
    type: "手術",
    notes: "胆嚢摘出術",
  },
  {
    id: createId(),
    date: formatInputDate(addDays(new Date(), 2)),
    time: "11:00",
    doctor: "高橋 健",
    department: "整形外科",
    type: "IC",
    notes: "家族説明",
  },
];

// 初期化
(function init() {
  populateDepartmentFilter();
  renderDepartmentLegend();
  schedules.push(...initialSchedules);
  sortSchedules();
  render();
  setDefaultDateTime();

  scheduleForm.addEventListener("submit", handleSubmit);
  filterDepartment.addEventListener("change", render);
  filterType.addEventListener("change", render);
})();

function populateDepartmentFilter() {
  Object.entries(departmentColors).forEach(([department]) => {
    const option = document.createElement("option");
    option.value = department;
    option.textContent = department;
    filterDepartment.appendChild(option);
  });
}

function renderDepartmentLegend() {
  if (!legendList) return;
  legendList.innerHTML = "";

  Object.entries(departmentColors).forEach(([department, color]) => {
    const item = document.createElement("li");
    item.className = "legend-item";

    const swatch = document.createElement("span");
    swatch.className = "legend-swatch";
    swatch.style.backgroundColor = color;

    const label = document.createElement("span");
    label.textContent = department;

    item.append(swatch, label);
    legendList.appendChild(item);
  });
}

function handleSubmit(event) {
  event.preventDefault();
  const formData = new FormData(scheduleForm);
  const entry = {
    id: createId(),
    date: formData.get("date"),
    time: formData.get("time"),
    doctor: formData.get("doctor"),
    department: formData.get("department"),
    type: formData.get("type"),
    notes: formData.get("notes")?.trim() ?? "",
  };

  schedules.push(entry);
  sortSchedules();

  scheduleForm.reset();
  setDefaultDateTime();
  render();
}

function sortSchedules() {
  schedules.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });
}

function render() {
  scheduleBody.innerHTML = "";

  const filtered = schedules.filter((entry) => {
    const departmentSelected = filterDepartment.value;
    const typeSelected = filterType.value;
    const matchDepartment =
      departmentSelected === "all" || entry.department === departmentSelected;
    const matchType = typeSelected === "all" || entry.type === typeSelected;
    return matchDepartment && matchType;
  });

  if (filtered.length === 0) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  const fragment = document.createDocumentFragment();

  filtered.forEach((entry) => {
    const row = rowTemplate.content.firstElementChild.cloneNode(true);
    const cells = row.querySelectorAll("td");

    cells[0].textContent = formatDate(entry.date);
    cells[1].textContent = entry.time || "";
    cells[2].textContent = entry.doctor;

    const departmentPill = row.querySelector(".department-pill");
    departmentPill.textContent = entry.department;
    departmentPill.style.backgroundColor =
      departmentColors[entry.department] ?? "#6c7a89";

    cells[4].textContent = entry.type;
    cells[5].textContent = entry.notes;

    fragment.appendChild(row);
  });

  scheduleBody.appendChild(fragment);
}

function setDefaultDateTime() {
  if (dateInput) {
    dateInput.value = formatInputDate(new Date());
  }

  if (timeInput && !timeInput.value) {
    const now = new Date();
    const hours = `${now.getHours()}`.padStart(2, "0");
    const minutesValue = Math.floor(now.getMinutes() / 5) * 5;
    const minutes = `${minutesValue}`.padStart(2, "0");
    timeInput.value = `${hours}:${minutes}`;
  }
}

function formatDate(dateString) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${Number(year)}年${Number(month)}月${Number(day)}日`;
}

function formatInputDate(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
