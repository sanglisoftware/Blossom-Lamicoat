import { createRef, useEffect, useRef, useState } from "react";
import axios from "axios";
import { FormInput } from "@/components/Base/Form";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "@/assets/css/vendors/tabulator.css";
import { BASE_URL } from "@/ecommerce/config/config";

type SalaryApiItem = {
  id?: number;
  Id?: number;
  employeeId?: number;
  EmployeeId?: number;
  employeeName?: string;
  EmployeeName?: string;
  type?: number | string | null;
  Type?: number | string | null;
  attendance?: number;
  Attendance?: number;
  extraHours?: number;
  ExtraHours?: number;
  totalLate?: number;
  TotalLate?: number;
  halfDay?: number;
  HalfDay?: number;
  createdDate?: string;
  CreatedDate?: string;
};

type SalaryPagedResponse = {
  items?: SalaryApiItem[];
  Items?: SalaryApiItem[];
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
  type?: number | string | null;
  Type?: number | string | null;
};

type EmployeePagedResponse = {
  items?: EmployeeApiItem[];
  Items?: EmployeeApiItem[];
};

type AttendanceRow = {
  id: number | string;
  EmployeeId: number;
  Name: string;
  Type: string;
  Date: string;
  Attendance: number;
  ExtraHours: number;
  TotalLate: number;
  HalfDay: number;
};

function Main() {
  const token = localStorage.getItem("token");
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [tableData, setTableData] = useState<AttendanceRow[]>([]);

  useEffect(() => {
    const fetchAttendanceReport = async () => {
      try {
        const [salaryResponse, employeeResponse] = await Promise.all([
          axios.get<SalaryPagedResponse>(`${BASE_URL}/api/salary?page=1&size=1000`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get<EmployeePagedResponse>(`${BASE_URL}/api/employees?page=1&size=1000`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const salaryItems =
          salaryResponse.data?.items ?? salaryResponse.data?.Items ?? [];
        const employeeItems =
          employeeResponse.data?.items ?? employeeResponse.data?.Items ?? [];

        const employeeMap = new Map<
          number,
          { name: string; type: number | string | null }
        >();

        employeeItems.forEach((emp) => {
          const employeeId = Number(emp.id ?? emp.Id);
          if (!Number.isFinite(employeeId) || employeeId <= 0) return;

          const first = emp.firstName ?? emp.FirstName ?? "";
          const middle = emp.middleName ?? emp.MiddleName ?? "";
          const last = emp.lastName ?? emp.LastName ?? "";
          const fullName = [first, middle, last]
            .filter((x) => x && x.trim().length > 0)
            .join(" ");

          employeeMap.set(employeeId, {
            name: fullName,
            type: emp.type ?? emp.Type ?? null,
          });
        });

        const toTypeLabel = (rawType: number | string | null | undefined) => {
          const normalizedType =
            rawType === null || rawType === undefined ? null : Number(rawType);

          return normalizedType === 1
            ? "Worker"
            : normalizedType === 0
            ? "Staff"
            : "";
        };

        const mappedRows: AttendanceRow[] = salaryItems.map((item, index) => {
          const employeeId = Number(item.employeeId ?? item.EmployeeId ?? 0);
          const employeeInfo = employeeMap.get(employeeId);

          const rawDate = item.createdDate ?? item.CreatedDate;
          const displayDate = rawDate
            ? new Date(rawDate).toISOString().split("T")[0]
            : "";

          return {
            id: Number(item.id ?? item.Id ?? index + 1),
            EmployeeId: employeeId,
            Name: String(
              item.employeeName ??
                item.EmployeeName ??
                employeeInfo?.name ??
                ""
            ),
            Type: toTypeLabel(item.type ?? item.Type ?? employeeInfo?.type),
            Date: displayDate,
            Attendance: Number(item.attendance ?? item.Attendance ?? 0),
            ExtraHours: Number(item.extraHours ?? item.ExtraHours ?? 0),
            TotalLate: Number(item.totalLate ?? item.TotalLate ?? 0),
            HalfDay: Number(item.halfDay ?? item.HalfDay ?? 0),
          };
        });

        // Also show employee names from backend even when salary row does not exist yet.
        const existingEmployeeIds = new Set(
          mappedRows.map((row) => row.EmployeeId).filter((id) => id > 0)
        );

        employeeMap.forEach((employeeInfo, employeeId) => {
          if (existingEmployeeIds.has(employeeId)) return;

          mappedRows.push({
            id: `emp-${employeeId}`,
            EmployeeId: employeeId,
            Name: employeeInfo.name,
            Type: toTypeLabel(employeeInfo.type),
            Date: "",
            Attendance: 0,
            ExtraHours: 0,
            TotalLate: 0,
            HalfDay: 0,
          });
        });

        setTableData(mappedRows);
      } catch (error) {
        console.error("Error fetching attendance report:", error);
      }
    };

    fetchAttendanceReport();
  }, [token]);

  useEffect(() => {
    if (!tableRef.current) return;

    tabulator.current = new Tabulator(tableRef.current, {
      data: tableData,
      layout: "fitColumns",
      responsiveLayout: "collapse",
      placeholder: "No matching records found",
      pagination: true,
      paginationSize: 10,
      paginationSizeSelector: [10, 20, 30, 40],
      columns: [
        { title: "Sr.No", formatter: "rownum", width: 80, hozAlign: "center" },
        { title: "Name", field: "Name" },
        { title: "Type", field: "Type" },
        { title: "Date", field: "Date" },
        { title: "Attendance", field: "Attendance" },
        { title: "Extra Hours", field: "ExtraHours" },
        { title: "Total Late", field: "TotalLate" },
        { title: "Half Day", field: "HalfDay" },
      ],
    });

    return () => {
      tabulator.current?.destroy();
      tabulator.current = null;
    };
  }, [tableData]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    tabulator.current?.setFilter("Name", "like", value);
  };

  return (
    <>
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-medium">Attendance Report</h2>
      </div>

      <div className="p-5 box">
        <div className="flex items-center mb-3">
          <span className="mr-2 font-medium">Search:</span>
          <FormInput
            type="text"
            placeholder="Enter name..."
            className="w-64"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div ref={tableRef}></div>
      </div>
    </>
  );
}

export default Main;
