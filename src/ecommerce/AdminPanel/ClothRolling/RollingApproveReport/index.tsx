import { createRef, useEffect, useRef, useState } from "react";
import axios from "axios";
import { FormInput } from "@/components/Base/Form";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "@/assets/css/vendors/tabulator.css";
import { BASE_URL } from "@/ecommerce/config/config";

type PagedResponse<T> = { items?: T[]; Items?: T[] };
type FabricInwardItem = {
  id?: number; Id?: number; fabricMasterName?: string; FabricMasterName?: string;
  fGramageMasterName?: string; FGramageMasterName?: string;
  colourMasterName?: string; ColourMasterName?: string;
  batchNo?: string; BatchNo?: string; qtyMTR?: number; QtyMTR?: number;
  isActive?: number; IsActive?: number;
};
type RollingItem = {
  fabricInwardId?: number; FabricInwardId?: number; rollNo?: string; RollNo?: string;
  rollMtr?: number; RollMtr?: number; defectMtr?: number; DefectMtr?: number;
  isActive?: number; IsActive?: number;
};
type ReconciliationRow = {
  id: number; Product: string; Gramage: string; Colour: string; Batch: string;
  InwardMtr: number; RollCount: number; RollDetails: string; TotalRollMtr: number;
  DefectMtr: number; ProcessedMtr: number; RemainingMtr: number;
};

function Main() {
  const token = localStorage.getItem("token");
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tableData, setTableData] = useState<ReconciliationRow[]>([]);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [inwardResponse, rollingResponse] = await Promise.all([
          axios.get<PagedResponse<FabricInwardItem>>(`${BASE_URL}/api/fabricinward?page=1&size=10000`, { headers }),
          axios.get<PagedResponse<RollingItem>>(`${BASE_URL}/api/clothrollingform?page=1&size=10000`, { headers }),
        ]);
        const inwards = inwardResponse.data?.items ?? inwardResponse.data?.Items ?? [];
        const rolls = rollingResponse.data?.items ?? rollingResponse.data?.Items ?? [];
        const rows = inwards.filter((inward) => (inward.isActive ?? inward.IsActive ?? 1) !== 0).map((inward) => {
          const inwardId = Number(inward.id ?? inward.Id ?? 0);
          const inwardMtr = Number(inward.qtyMTR ?? inward.QtyMTR ?? 0);
          const batchRolls = rolls.filter((roll) => Number(roll.fabricInwardId ?? roll.FabricInwardId ?? 0) === inwardId && (roll.isActive ?? roll.IsActive ?? 1) !== 0);
          const totalRollMtr = batchRolls.reduce((sum, roll) => sum + Number(roll.rollMtr ?? roll.RollMtr ?? 0), 0);
          const defectMtr = batchRolls.reduce((sum, roll) => sum + Number(roll.defectMtr ?? roll.DefectMtr ?? 0), 0);
          const processedMtr = totalRollMtr + defectMtr;
          return {
            id: inwardId,
            Product: String(inward.fabricMasterName ?? inward.FabricMasterName ?? ""),
            Gramage: String(inward.fGramageMasterName ?? inward.FGramageMasterName ?? ""),
            Colour: String(inward.colourMasterName ?? inward.ColourMasterName ?? ""),
            Batch: String(inward.batchNo ?? inward.BatchNo ?? ""), InwardMtr: inwardMtr,
            RollCount: batchRolls.length,
            RollDetails: batchRolls.map((roll) => `${roll.rollNo ?? roll.RollNo ?? "-"} (${Number(roll.rollMtr ?? roll.RollMtr ?? 0)} MTR)`).join(", "),
            TotalRollMtr: totalRollMtr, DefectMtr: defectMtr, ProcessedMtr: processedMtr,
            RemainingMtr: inwardMtr - processedMtr,
          };
        }).sort((a, b) => b.id - a.id);
        setTableData(rows);
      } catch (error) {
        console.error("Error fetching inward rolling report:", error);
        setTableData([]);
      }
    };
    fetchReport();
  }, [token]);

  useEffect(() => {
    if (!tableRef.current) return;
    tabulator.current = new Tabulator(tableRef.current, {
      data: tableData, layout: "fitDataStretch", responsiveLayout: "collapse",
      placeholder: "No inward records found", pagination: true, paginationSize: 10,
      paginationSizeSelector: [10, 20, 30, 50],
      columns: [
        { title: "Sr.No", formatter: "rownum", width: 75, hozAlign: "center" },
        { title: "Fabric", field: "Product", minWidth: 140 }, { title: "GRM", field: "Gramage", minWidth: 90 },
        { title: "Color", field: "Colour", minWidth: 100 }, { title: "Batch", field: "Batch", minWidth: 110 },
        { title: "Inward MTR", field: "InwardMtr", hozAlign: "right" },
        { title: "No. of Rolls", field: "RollCount", hozAlign: "center" },
        { title: "Roll No. & MTR", field: "RollDetails", minWidth: 260, formatter: "textarea" },
        { title: "Total Roll MTR", field: "TotalRollMtr", hozAlign: "right" },
        { title: "Defect MTR", field: "DefectMtr", hozAlign: "right" },
        { title: "Processed MTR", field: "ProcessedMtr", hozAlign: "right" },
        { title: "Remaining MTR", field: "RemainingMtr", hozAlign: "right" },
      ],
    });
    return () => { tabulator.current?.destroy(); tabulator.current = null; };
  }, [tableData]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const term = value.trim().toLowerCase();
    if (!term) { tabulator.current?.clearFilter(true); return; }
    tabulator.current?.setFilter((row: ReconciliationRow) => Object.values(row).some((field) => String(field).toLowerCase().includes(term)));
  };

  return <><div className="flex items-center justify-between mt-8 mb-4"><h2 className="text-lg font-medium">Fabric Inward & Rolling Report</h2></div>
    <div className="p-5 box"><div className="flex items-center mb-3"><span className="mr-2 font-medium">Search:</span>
      <FormInput type="text" placeholder="Search all fields..." className="w-64" value={searchTerm} onChange={(event) => handleSearch(event.target.value)} />
    </div><div ref={tableRef}></div></div></>;
}

export default Main;
