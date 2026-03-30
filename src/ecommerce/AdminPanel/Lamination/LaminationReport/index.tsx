import { createRef, useEffect, useRef, useState } from "react";
import axios from "axios";
import { FormInput } from "@/components/Base/Form";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "@/assets/css/vendors/tabulator.css";
import { BASE_URL } from "@/ecommerce/config/config";

type LaminationApiItem = {
  id?: number;
  Id?: number;
  workerName?: string;
  WorkerName?: string;
  finalProductName?: string;
  FinalProductName?: string;
  clothRollCode?: string;
  ClothRollCode?: string;
  pvcBatchNo?: string;
  PVCBatchNo?: string;
  pvcQty?: number;
  PVCQty?: number;
  chemicalName?: string;
  ChemicalName?: string;
  chemicalQty?: number;
  ChemicalQty?: number;
  bounding?: string;
  Bounding?: string;
  temperature?: number;
  Temperature?: number;
  processTime?: string;
  ProcessTime?: string;
};

type LaminationPagedResponse = {
  items?: LaminationApiItem[];
  Items?: LaminationApiItem[];
};

type LaminationRow = {
  id: number;
  Worker: string;
  FinalProduct: string;
  FabricRollNo: string;
  PVCRollNo: string;
  PVCQty: number;
  ChemicalNo: string;
  ChemicalQty: number;
  Bounding: string;
  Temp: number;
  Time: string;
};

function Main() {
  const token = localStorage.getItem("token");
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [tableData, setTableData] = useState<LaminationRow[]>([]);

  useEffect(() => {
    const fetchLaminationReport = async () => {
      try {
        const response = await axios.get<LaminationPagedResponse>(
          `${BASE_URL}/api/laminationform?page=1&size=1000`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const items = response.data?.items ?? response.data?.Items ?? [];
        const mappedRows: LaminationRow[] = items.map((item, index) => ({
          id: Number(item.id ?? item.Id ?? index + 1),
          Worker: String(item.workerName ?? item.WorkerName ?? ""),
          FinalProduct: String(item.finalProductName ?? item.FinalProductName ?? ""),
          FabricRollNo: String(item.clothRollCode ?? item.ClothRollCode ?? ""),
          PVCRollNo: String(item.pvcBatchNo ?? item.PVCBatchNo ?? ""),
          PVCQty: Number(item.pvcQty ?? item.PVCQty ?? 0),
          ChemicalNo: String(item.chemicalName ?? item.ChemicalName ?? ""),
          ChemicalQty: Number(item.chemicalQty ?? item.ChemicalQty ?? 0),
          Bounding: String(item.bounding ?? item.Bounding ?? ""),
          Temp: Number(item.temperature ?? item.Temperature ?? 0),
          Time: String(item.processTime ?? item.ProcessTime ?? ""),
        }));

        setTableData(mappedRows);
      } catch (error) {
        console.error("Error fetching lamination report:", error);
        setTableData([]);
      }
    };

    fetchLaminationReport();
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
        { title: "Worker", field: "Worker" },
        { title: "Final Product", field: "FinalProduct" },
        { title: "Fabric Roll No", field: "FabricRollNo" },
        { title: "PVC Roll No", field: "PVCRollNo" },
        { title: "PVC Qty", field: "PVCQty" },
        { title: "Chemical No", field: "ChemicalNo" },
        { title: "Chemical Qty", field: "ChemicalQty" },
        { title: "Bounding", field: "Bounding" },
        { title: "Temp", field: "Temp" },
        { title: "Time", field: "Time" },
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

    tabulator.current?.setFilter((row: LaminationRow) =>
      [
        row.Worker,
        row.FinalProduct,
        row.FabricRollNo,
        row.PVCRollNo,
        row.PVCQty,
        row.ChemicalNo,
        row.ChemicalQty,
        row.Bounding,
        row.Temp,
        row.Time,
      ].some((fieldValue) => String(fieldValue).toLowerCase().includes(term))
    );
  };

  return (
    <>
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-medium">Lamination Report</h2>
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
