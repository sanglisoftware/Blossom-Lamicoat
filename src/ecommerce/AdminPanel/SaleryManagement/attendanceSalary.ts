export type AttendanceStatus = "Present" | "Absent" | "Half Day";

export type SavedAttendanceDay = {
  note?: string;
  rows?: Array<{
    id: number;
    status: AttendanceStatus;
    inTime?: string;
    outTime?: string;
  }>;
};

export type SavedAttendanceMap = Record<string, SavedAttendanceDay>;

export type AttendanceCalculation = {
  attendance: number;
  halfDay: number;
  totalLate: number;
  extraHours: number;
  extraSalaryDays: number;
  salaryDays: number;
};

export const DAILY_ATTENDANCE_STORAGE_KEY = "daily-attendence-records";

const STANDARD_WORK_MINUTES = 8 * 60 + 30;
const LATE_HALF_DAY_CUTOFF_MINUTES = 9 * 60 + 15;

export const getCurrentMonthKey = () => new Date().toISOString().slice(0, 7);

export const getSavedAttendanceMap = (): SavedAttendanceMap => {
  try {
    if (typeof window === "undefined") return {};

    const raw = localStorage.getItem(DAILY_ATTENDANCE_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const roundToTwo = (value: number) => Math.round(value * 100) / 100;

const parseTimeToMinutes = (value?: string): number | null => {
  if (!value) return null;

  const match = value
    .trim()
    .match(/^(0?[1-9]|1[0-2]):([0-5][0-9])\s(am|pm)$/i);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3].toLowerCase();

  if (meridiem === "pm" && hour !== 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;

  return hour * 60 + minute;
};

const getWorkedMinutes = (inTime?: string, outTime?: string) => {
  const inMinutes = parseTimeToMinutes(inTime);
  const outMinutes = parseTimeToMinutes(outTime);

  if (inMinutes === null || outMinutes === null) {
    return { inMinutes, workedMinutes: 0 };
  }

  let workedMinutes = outMinutes - inMinutes;
  if (workedMinutes < 0) workedMinutes += 24 * 60;

  return { inMinutes, workedMinutes };
};

export const calculateEmployeeMonthlyAttendance = (
  employeeId: number,
  monthKey: string,
  savedAttendanceMap: SavedAttendanceMap = getSavedAttendanceMap()
): AttendanceCalculation => {
  let attendance = 0;
  let halfDay = 0;
  let totalLate = 0;
  let totalExtraMinutes = 0;

  Object.entries(savedAttendanceMap).forEach(([dateKey, savedDay]) => {
    if (!dateKey.startsWith(`${monthKey}-`)) return;

    const entry = (savedDay.rows ?? []).find(
      (row) => Number(row.id) === employeeId
    );
    if (!entry || entry.status === "Absent") return;

    const { inMinutes, workedMinutes } = getWorkedMinutes(
      entry.inTime,
      entry.outTime
    );
    const lateHalfDay =
      inMinutes !== null && inMinutes > LATE_HALF_DAY_CUTOFF_MINUTES;
    const isHalfDay = entry.status === "Half Day" || lateHalfDay;

    if (isHalfDay) {
      halfDay += 1;
    } else {
      attendance += 1;
    }

    if (lateHalfDay) totalLate += 1;
    if (workedMinutes > STANDARD_WORK_MINUTES) {
      totalExtraMinutes += workedMinutes - STANDARD_WORK_MINUTES;
    }
  });

  const extraSalaryDays = Math.floor(totalExtraMinutes / STANDARD_WORK_MINUTES);
  const salaryDays = attendance + halfDay * 0.5 + extraSalaryDays;

  return {
    attendance,
    halfDay,
    totalLate,
    extraHours: roundToTwo(totalExtraMinutes / 60),
    extraSalaryDays,
    salaryDays,
  };
};
