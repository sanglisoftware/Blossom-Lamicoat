import { createRef, useEffect, useRef, useState } from "react";
import axios from "axios";
import { FormInput } from "@/components/Base/Form";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "@/assets/css/vendors/tabulator.css";
import { BASE_URL } from "@/ecommerce/config/config";

type ClothRollingApiItem = {
  id?: number;
  Id?: number;
  productName?: string;
  ProductName?: string;
  batchNo?: string | number;
  BatchNo?: string | number;
  rollMtr?: number;
  RollMtr?: number;
  defectMtr?: number;
  DefectMtr?: number;
  checkerName?: string;
  CheckerName?: string;
  createdDate?: string;
  CreatedDate?: string;
};

type ClothRollingPagedResponse = {
  items?: ClothRollingApiItem[];
  Items?: ClothRollingApiItem[];
};

type ClothRollingRow = {
  id: number;
  Date: string;
  Checker: string;
  Product: string;
  Batch: string;
  RollMtr: number;
  DefectMtr: number;
};

function Main() {
  const token = localStorage.getItem("token");
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [tableData, setTableData] = useState<ClothRollingRow[]>([]);

  useEffect(() => {
    const fetchClothRollingReport = async () => {
      try {
        const response = await axios.get<ClothRollingPagedResponse>(
          `${BASE_URL}/api/clothrollingform?page=1&size=1000`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const items = response.data?.items ?? response.data?.Items ?? [];

        const mappedRows: ClothRollingRow[] = items.map((item, index) => {
          const rawDate = item.createdDate ?? item.CreatedDate;
          const displayDate = rawDate
            ? new Date(rawDate).toISOString().split("T")[0]
            : "";

          return {
            id: Number(item.id ?? item.Id ?? index + 1),
            Date: displayDate,
            Checker: String(item.checkerName ?? item.CheckerName ?? ""),
            Product: String(item.productName ?? item.ProductName ?? ""),
            Batch: String(item.batchNo ?? item.BatchNo ?? ""),
            RollMtr: Number(item.rollMtr ?? item.RollMtr ?? 0),
            DefectMtr: Number(item.defectMtr ?? item.DefectMtr ?? 0),
          };
        });

        setTableData(mappedRows);
      } catch (error) {
        console.error("Error fetching cloth rolling report:", error);
        setTableData([]);
      }
    };

    fetchClothRollingReport();
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
        { title: "Date", field: "Date" },
        { title: "Checker", field: "Checker" },
        { title: "Product", field: "Product" },
        { title: "Batch", field: "Batch" },
        { title: "Roll Mtr", field: "RollMtr" },
        { title: "Defect Mtr", field: "DefectMtr" },
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

    tabulator.current?.setFilter((row: ClothRollingRow) =>
      [
        row.Date,
        row.Checker,
        row.Product,
        row.Batch,
        row.RollMtr,
        row.DefectMtr,
      ].some((fieldValue) => String(fieldValue).toLowerCase().includes(term))
    );
  };

  return (
    <>
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-medium">Cloth Rolling Report</h2>
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
