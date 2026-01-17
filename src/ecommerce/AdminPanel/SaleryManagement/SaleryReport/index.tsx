import { useState, useRef, useEffect, createRef } from "react";
import { FormInput } from "@/components/Base/Form";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "@/assets/css/vendors/tabulator.css";

function Main() {
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [tableData, setTableData] = useState([
    {
      id: 1,
      Name: "username",
      Type: "Worker",
      Date: "2026-01-01",
      SaleryPerDay: "500",
      Attendence: "22",
      ExtraHours: "5",
      LateDay: "1",
      HalfDay: "0",
      Salery: "11500",
    },
    {
      id: 2,
      Name: "username2",
      Type: "Staff",
      Date: "2026-01-01",
      SaleryPerDay: "600",
      Attendence: "20",
      ExtraHours: "2",
      LateDay: "0",
      HalfDay: "1",
      Salery: "12200",
    },
    {
      id: 3,
      Name: "username3",
      Type: "Worker",
      Date: "2026-01-01",
      SaleryPerDay: "450",
      Attendence: "25",
      ExtraHours: "0",
      LateDay: "0",
      HalfDay: "0",
      Salery: "11250",
    },
  ]);


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