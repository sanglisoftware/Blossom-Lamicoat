import { createRef, useEffect, useRef, useState } from "react";
import axios from "axios";
import { FormInput } from "@/components/Base/Form";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "@/assets/css/vendors/tabulator.css";
import { BASE_URL } from "@/ecommerce/config/config";

type InspectionApiItem = {
  id?: number;
  Id?: number;
  manufacturedFabricProductName?: string;
  ManufacturedFabricProductName?: string;
  gradeName?: string;
  GradeName?: string;
  mtr?: number;
  Mtr?: number;
  wastageMtr?: number;
  WastageMtr?: number;
};

type InspectionPagedResponse = {
  items?: InspectionApiItem[];
  Items?: InspectionApiItem[];
};

type InspectionRow = {
  id: number;
  FinalProductNo: string;
  Grade: string;
  Mtr: number;
  Wastage: number;
};

function Main() {
  const token = localStorage.getItem("token");
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [tableData, setTableData] = useState<InspectionRow[]>([]);

  useEffect(() => {
    const fetchInspectionReport = async () => {
      try {
        const response = await axios.get<InspectionPagedResponse>(
          `${BASE_URL}/api/inspectionform?page=1&size=1000`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const items = response.data?.items ?? response.data?.Items ?? [];
        const mappedRows: InspectionRow[] = items.map((item, index) => ({
          id: Number(item.id ?? item.Id ?? index + 1),
          FinalProductNo: String(item.manufacturedFabricProductName ?? item.ManufacturedFabricProductName ?? ""),
          Grade: String(item.gradeName ?? item.GradeName ?? ""),
          Mtr: Number(item.mtr ?? item.Mtr ?? 0),
          Wastage: Number(item.wastageMtr ?? item.WastageMtr ?? 0),
        }));

        setTableData(mappedRows);
      } catch (error) {
        console.error("Error fetching inspection report:", error);
        setTableData([]);
      }
    };

    fetchInspectionReport();
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
        { title: "Final Product No", field: "FinalProductNo" },
        { title: "Grade", field: "Grade" },
        { title: "Mtr", field: "Mtr" },
        { title: "Wastage", field: "Wastage" },
      ],
    });

    return () => {
      tabulator.current?.destroy();
      tabulator.current = null;
    };
  }, [tableData]);

  const handleSearch = (value: string) => {
    const term = value.trim().toLowerCase();
    setSearchTerm(value);

    if (!term) {
      tabulator.current?.clearFilter(true);
      return;
    }

    tabulator.current?.setFilter((row: InspectionRow) =>
      [
        row.FinalProductNo,
        row.Grade,
        row.Mtr,
        row.Wastage,
      ].some((fieldValue) => String(fieldValue).toLowerCase().includes(term))
    );
  };

  return (
    <>
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-medium">Inspection Report</h2>
      </div>

      <div className="p-5 box">
        <div className="flex items-center mb-3">
          <span className="mr-2 font-medium">Search:</span>
          <FormInput
            type="text"
            placeholder="Search all fields..."
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
