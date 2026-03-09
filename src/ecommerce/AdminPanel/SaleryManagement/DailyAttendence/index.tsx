import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import Button from "@/components/Base/Button";
import Table from "@/components/Base/Table";
import {
  FormInput,
  FormLabel,
  FormSelect,
  FormTextarea,
} from "@/components/Base/Form";
import { BASE_URL } from "@/ecommerce/config/config";
import "react-datepicker/dist/react-datepicker.css";

type AttendanceStatus = "Present" | "Absent" | "Half Day";

type AttendanceRow = {
  id: number;
  name: string;
  department: string;
  status: AttendanceStatus;
  inTime: string;
  outTime: string;
};

type EmployeeApiItem = {
  id?: number;
  Id?: number;
  firstName?: string;
  FirstName?: string;
  middleName?: string;
  MiddleName?: string;
  lastName?: string;
  LastName?: string;
  departmentName?: string;
  DepartmentName?: string;
  roleName?: string;
  RoleName?: string;
};

type EmployeePagedResponse = {
  items?: EmployeeApiItem[];
  Items?: EmployeeApiItem[];
};

type SavedAttendanceDay = {
  note: string;
  rows: Array<{
    id: number;
    status: AttendanceStatus;
    inTime: string;
    outTime: string;
  }>;
};

type SavedAttendanceMap = Record<string, SavedAttendanceDay>;

const DAILY_ATTENDANCE_STORAGE_KEY = "daily-attendence-records";

const getSavedAttendanceMap = (): SavedAttendanceMap => {
  try {
    const raw = localStorage.getItem(DAILY_ATTENDANCE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const saveAttendanceMap = (map: SavedAttendanceMap) => {
  localStorage.setItem(DAILY_ATTENDANCE_STORAGE_KEY, JSON.stringify(map));
};

const applySavedRows = (baseRows: AttendanceRow[], day?: SavedAttendanceDay) => {
  if (!day) return baseRows;

  const dayMap = new Map(day.rows.map((row) => [row.id, row]));
  return baseRows.map((row) => {
    const saved = dayMap.get(row.id);
    if (!saved) return row;
    return {
      ...row,
      status: saved.status,
      inTime: saved.inTime,
      outTime: saved.outTime,
    };
  });
};

const isValidAmPmTime = (value: string) =>
  /^(0[1-9]|1[0-2]):[0-5][0-9]\s(am|pm)$/i.test(value.trim());

const formatTimeAmPm = (date: Date) =>
  date
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();

const parseTimeAmPm = (value: string): Date | null => {
  const match = value.trim().match(/^(0[1-9]|1[0-2]):([0-5][0-9])\s(am|pm)$/i);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3].toLowerCase();

  if (meridiem === "pm" && hour !== 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;

  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
};

const Main = () => {
  const token = localStorage.getItem("token");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [search, setSearch] = useState("");
  const [baseAttendance, setBaseAttendance] = useState<AttendanceRow[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [note, setNote] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!token) return;

      setIsLoadingEmployees(true);
      try {
        const response = await axios.get<EmployeePagedResponse>(
          `${BASE_URL}/api/employees?page=1&size=1000`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const items = response.data?.items ?? response.data?.Items ?? [];
        const mappedRows: AttendanceRow[] = items
          .map((item) => {
            const id = Number(item.id ?? item.Id);
            if (!Number.isFinite(id) || id <= 0) return null;

            const first = item.firstName ?? item.FirstName ?? "";
            const middle = item.middleName ?? item.MiddleName ?? "";
            const last = item.lastName ?? item.LastName ?? "";
            const name = [first, middle, last]
              .filter((value) => value && value.trim().length > 0)
              .join(" ")
              .trim();

            const department =
              item.departmentName ??
              item.DepartmentName ??
              item.roleName ??
              item.RoleName ??
              "-";

            return {
              id,
              name: name || `Employee ${id}`,
              department,
              status: "Absent" as AttendanceStatus,
              inTime: "",
              outTime: "",
            };
          })
          .filter((row): row is AttendanceRow => row !== null);

        setBaseAttendance(mappedRows);
      } catch (error) {
        console.error("Error fetching employees:", error);
        setBaseAttendance([]);
        setAttendance([]);
      } finally {
        setIsLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, [token]);

  useEffect(() => {
    const savedMap = getSavedAttendanceMap();
    const savedDay = savedMap[selectedDate];
    setAttendance(applySavedRows(baseAttendance, savedDay));
    setNote(savedDay?.note ?? "");
    setSaveMessage("");
  }, [baseAttendance, selectedDate]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return attendance;

    return attendance.filter(
      (row) =>
        row.name.toLowerCase().includes(term) ||
        row.department.toLowerCase().includes(term)
    );
  }, [attendance, search]);

  const summary = useMemo(() => {
    const present = attendance.filter((row) => row.status === "Present").length;
    const absent = attendance.filter((row) => row.status === "Absent").length;
    const halfDay = attendance.filter((row) => row.status === "Half Day").length;
    return { total: attendance.length, present, absent, halfDay };
  }, [attendance]);

  const updateRow = (
    id: number,
    field: "status" | "inTime" | "outTime",
    value: string
  ) => {
    setAttendance((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]:
                field === "status"
                  ? (value as AttendanceStatus)
                  : value,
            }
          : row
      )
    );
    setSaveMessage("");
  };

  const resetToday = () => {
    setAttendance((prev) =>
      prev.map((row) => ({
        ...row,
        status: "Absent",
        inTime: "",
        outTime: "",
      }))
    );
    setSearch("");
    setNote("");
  };

  const markAllPresent = () => {
    setAttendance((prev) =>
      prev.map((row) => ({
        ...row,
        status: "Present",
        inTime: row.inTime || "09:00 am",
        outTime: row.outTime || "06:00 pm",
      }))
    );
    setSaveMessage("");
  };

  const handleSaveAttendence = () => {
    const invalidRow = attendance.find(
      (row) =>
        row.status !== "Absent" &&
        (!isValidAmPmTime(row.inTime) || !isValidAmPmTime(row.outTime))
    );

    if (invalidRow) {
      alert(
        `Please enter valid time for ${invalidRow.name} in format hh:mm am/pm`
      );
      return;
    }

    const savedMap = getSavedAttendanceMap();
    savedMap[selectedDate] = {
      note,
      rows: attendance.map((row) => ({
        id: row.id,
        status: row.status,
        inTime: row.inTime,
        outTime: row.outTime,
      })),
    };
    saveAttendanceMap(savedMap);
    setSaveMessage("Attendance saved");
  };

  return (
    <div className="p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-xl font-medium">Daily Attendence</h2>
          <p className="text-slate-500 mt-1">
            Manage daily employee mark-in and mark-out entries.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveMessage ? (
            <span className="text-success text-sm font-medium">{saveMessage}</span>
          ) : null}
          <Button variant="primary" onClick={handleSaveAttendence}>
            Save Attendence
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 mb-6">
        <div className="col-span-12 sm:col-span-6 xl:col-span-3 box p-4">
          <p className="text-slate-500 text-sm">Total Employees</p>
          <p className="text-2xl font-semibold mt-1">{summary.total}</p>
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3 box p-4">
          <p className="text-slate-500 text-sm">Present</p>
          <p className="text-2xl font-semibold mt-1 text-success">
            {summary.present}
          </p>
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3 box p-4">
          <p className="text-slate-500 text-sm">Absent</p>
          <p className="text-2xl font-semibold mt-1 text-danger">
            {summary.absent}
          </p>
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3 box p-4">
          <p className="text-slate-500 text-sm">Half Day</p>
          <p className="text-2xl font-semibold mt-1 text-warning">
            {summary.halfDay}
          </p>
        </div>
      </div>

      <div className="box p-5 mb-6">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-3">
            <FormLabel>Date</FormLabel>
            <FormInput
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="col-span-12 md:col-span-5">
            <FormLabel>Search Employee</FormLabel>
            <FormInput
              type="text"
              placeholder="Search by name or department"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-span-12 md:col-span-4">
            <FormLabel>Supervisor Note</FormLabel>
            <FormTextarea
              rows={1}
              placeholder="Add note for this day"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <Button variant="outline-secondary" onClick={resetToday}>
            Reset
          </Button>
          <Button variant="primary" onClick={markAllPresent}>
            Mark All Present
          </Button>
        </div>
      </div>

      <div className="box p-5">
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th className="text-center">Sr.No</Table.Th>
              <Table.Th>Employee</Table.Th>
              <Table.Th>Department</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>In Time</Table.Th>
              <Table.Th>Out Time</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoadingEmployees ? (
              <Table.Tr>
                <Table.Td className="text-center" colSpan={6}>
                  Loading employees...
                </Table.Td>
              </Table.Tr>
            ) : filteredRows.length === 0 ? (
              <Table.Tr>
                <Table.Td className="text-center" colSpan={6}>
                  No employee records found
                </Table.Td>
              </Table.Tr>
            ) : (
              filteredRows.map((row, index) => (
                <Table.Tr key={row.id}>
                  <Table.Td className="text-center">{index + 1}</Table.Td>
                  <Table.Td>{row.name}</Table.Td>
                  <Table.Td>{row.department}</Table.Td>
                  <Table.Td>
                    <FormSelect
                      value={row.status}
                      onChange={(e) => updateRow(row.id, "status", e.target.value)}
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Half Day">Half Day</option>
                    </FormSelect>
                  </Table.Td>
                  <Table.Td>
                    <DatePicker
                      selected={parseTimeAmPm(row.inTime)}
                      onChange={(date) =>
                        updateRow(
                          row.id,
                          "inTime",
                          date ? formatTimeAmPm(date) : ""
                        )
                      }
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={1}
                      dateFormat="hh:mm aa"
                      placeholderText="Select in time"
                      customInput={<FormInput readOnly />}
                      isClearable
                      disabled={row.status === "Absent"}
                    />
                  </Table.Td>
                  <Table.Td>
                    <DatePicker
                      selected={parseTimeAmPm(row.outTime)}
                      onChange={(date) =>
                        updateRow(
                          row.id,
                          "outTime",
                          date ? formatTimeAmPm(date) : ""
                        )
                      }
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={1}
                      dateFormat="hh:mm aa"
                      placeholderText="Select out time"
                      customInput={<FormInput readOnly />}
                      isClearable
                      disabled={row.status === "Absent"}
                    />
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </div>
    </div>
  );
};

export default Main;
