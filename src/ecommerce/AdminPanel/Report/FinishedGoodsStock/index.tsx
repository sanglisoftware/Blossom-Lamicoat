import { createRef, useEffect, useRef, useState } from "react";
import axios from "axios";
import { FormInput } from "@/components/Base/Form";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "@/assets/css/vendors/tabulator.css";
import { BASE_URL } from "@/ecommerce/config/config";

type FinishedStock = { masterId: number; name: string; received: number; used: number; balance: number };

function Main() {
  const token = localStorage.getItem("token");
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tableData, setTableData] = useState<FinishedStock[]>([]);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/stock-management`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setTableData(data.finishedGoods ?? data.FinishedGoods ?? []))
      .catch((error) => { console.error("Failed to load finished goods stock", error); setTableData([]); });
  }, [token]);

  useEffect(() => {
    if (!tableRef.current) return;
    tabulator.current = new Tabulator(tableRef.current, {
      data: tableData,
      layout: "fitColumns",
      responsiveLayout: "collapse",
      placeholder: "No finished goods stock found",
      pagination: true,
      paginationSize: 10,
      paginationSizeSelector: [10, 20, 30, 40],
      columns: [
        { title: "Sr.No", formatter: "rownum", width: 80, hozAlign: "center" },
        { title: "Finished Product", field: "name" },
        { title: "Produced MTR", field: "received", hozAlign: "right" },
        { title: "Used MTR", field: "used", hozAlign: "right" },
        { title: "Balance MTR", field: "balance", hozAlign: "right" },
      ],
    });
    return () => { tabulator.current?.destroy(); tabulator.current = null; };
  }, [tableData]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    value.trim() ? tabulator.current?.setFilter("name", "like", value) : tabulator.current?.clearFilter(true);
  };

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-lg font-medium">Finished Goods Stock</h2>
      <div className="box p-5">
        <div className="mb-3 flex items-center">
          <span className="mr-2 font-medium">Search:</span>
          <FormInput className="w-64" placeholder="Search finished product..." value={searchTerm} onChange={(event) => handleSearch(event.target.value)} />
        </div>
        <div ref={tableRef} className="overflow-auto" />
      </div>
    </div>
  );
}

export default Main;
