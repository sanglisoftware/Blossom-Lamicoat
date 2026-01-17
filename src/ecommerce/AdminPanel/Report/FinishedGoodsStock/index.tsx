import { useState, useRef, useEffect, createRef } from "react";
import { FormInput } from "@/components/Base/Form";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "@/assets/css/vendors/tabulator.css";
import Button from "@/components/Base/Button";
import View from "./View";

function Main() {
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [detailData, setDetailData] = useState<any[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [tableData, setTableData] = useState([
    { id: 1, Particular: "PVC RESIN PAWDER", MTR: "" },
    { id: 2, Particular: "PVC RESIN PAWDER", MTR: "" },
    { id: 3, Particular: "PVC RESIN PAWDER", MTR: "" },
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
        { title: "Sr.No", formatter: "rownum", },
        { title: "Particular", field: "Particular"},
        { title: "MTR", field: "MTR"},
        {
          title: "Action",
          hozAlign: "center",
          formatter: (cell) => {
            const button = document.createElement("button");
            button.innerText = "View";
            button.className =
              "bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm";
            button.onclick = () => {
              // Example: replace with real data fetching if needed
              setDetailData([
                { date: "2026-01-14", prod: "PVC Resin", firstSale: 100, bal1: 50 },
                { date: "2026-01-15", prod: "PVC Resin", firstSale: 120, bal1: 60 },
              ]);
              setIsViewModalOpen(true);
            };
            return button;
          },
          width: 100,
        },
      ],
    });

    return () => {
      tabulator.current?.destroy();
      tabulator.current = null;
    };
  }, [tableData]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    tabulator.current?.setFilter("Particular", "like", value);
  };

  return (
    <>
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-medium">Finished Goods Stock</h2>
      </div>

      <div className="p-5 box">
        <div className="flex items-center mb-3">
          <span className="mr-2 font-medium">Search:</span>
          <FormInput
            type="text"
            placeholder="Search by Particular..."
            className="w-64"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div
          ref={tableRef}
          style={{ overflowX: "auto", overflowY: "auto" }}
        ></div>
      </div>

      <View
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        data={detailData}
      />
    </>
  );
}

export default Main;