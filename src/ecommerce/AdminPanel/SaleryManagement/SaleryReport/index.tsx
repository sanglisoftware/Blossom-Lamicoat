import { useState, useRef, useEffect, createRef } from "react";
import axios from "axios";
import { FormInput } from "@/components/Base/Form";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "@/assets/css/vendors/tabulator.css";
import { BASE_URL } from "@/ecommerce/config/config";

type SalaryApiItem = {
  id?: number;
  Id?: number;
  employeeName?: string;
  EmployeeName?: string;
  type?: number | string | null;
  Type?: number | string | null;
  createdDate?: string;
  CreatedDate?: string;
  attendance?: number;
  Attendance?: number;
  extraHours?: number;
  ExtraHours?: number;
  totalLate?: number;
  TotalLate?: number;
  halfDay?: number;
  HalfDay?: number;
  totalSalary?: number;
  TotalSalary?: number;
};

type SalaryPagedResponse = {
  items?: SalaryApiItem[];
  Items?: SalaryApiItem[];
};

type SalaryRow = {
  id: number;
  Name: string;
  Type: string;
  Date: string;
  SaleryPerDay: string;
  Attendence: number;
  ExtraHours: number;
  LateDay: number;
  HalfDay: number;
  Salery: number;
};

function Main() {
  const token = localStorage.getItem("token");
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [tableData, setTableData] = useState<SalaryRow[]>([]);

  useEffect(() => {
    const fetchSalaryReport = async () => {
      try {
        const response = await axios.get<SalaryPagedResponse>(
          `${BASE_URL}/api/salary?page=1&size=1000`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const items = response.data?.items ?? response.data?.Items ?? [];

        const mappedRows: SalaryRow[] = items.map((item, index) => {
          const rawType = item.type ?? item.Type;
          const normalizedType =
            rawType === null || rawType === undefined ? null : Number(rawType);

          const totalSalary = Number(item.totalSalary ?? item.TotalSalary ?? 0);
          const attendance = Number(item.attendance ?? item.Attendance ?? 0);
          const salaryPerDay =
            attendance > 0 ? (totalSalary / attendance).toFixed(2) : "0";

          const rawDate = item.createdDate ?? item.CreatedDate;
          const displayDate = rawDate
            ? new Date(rawDate).toISOString().split("T")[0]
            : "";

          return {
            id: Number(item.id ?? item.Id ?? index + 1),
            Name: String(item.employeeName ?? item.EmployeeName ?? ""),
            Type:
              normalizedType === 1
                ? "Worker"
                : normalizedType === 0
                ? "Staff"
                : "",
            Date: displayDate,
            SaleryPerDay: salaryPerDay,
            Attendence: attendance,
            ExtraHours: Number(item.extraHours ?? item.ExtraHours ?? 0),
            LateDay: Number(item.totalLate ?? item.TotalLate ?? 0),
            HalfDay: Number(item.halfDay ?? item.HalfDay ?? 0),
            Salery: totalSalary,
          };
        });

        setTableData(mappedRows);
      } catch (error) {
        console.error("Error fetching salary report:", error);
      }
    };

    fetchSalaryReport();
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
        { title: "Salery / Day", field: "SaleryPerDay" },
        { title: "Attendence", field: "Attendence" },
        { title: "Extra Hours", field: "ExtraHours" },
        { title: "Late Day", field: "LateDay" },
        { title: "Half Day", field: "HalfDay" },
        { title: "Salery", field: "Salery" },
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
        <h2 className="text-lg font-medium">Salary Report</h2>
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
