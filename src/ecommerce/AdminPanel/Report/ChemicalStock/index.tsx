import { useState, useRef, useEffect, createRef } from "react";
import { FormInput } from "@/components/Base/Form";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "@/assets/css/vendors/tabulator.css";
import ViewChemicalStock from "./ViewChemicalStock";

function Main() {
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [detailData, setDetailData] = useState<any[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [tableData, setTableData] = useState([
    { id: 1, Chemical: "Resin", QTY: "" },
    { id: 2, Chemical: "PVC RESIN PAWDER", QTY: "" },
    { id: 3, Chemical: "DOP", QTY: "" },
  ]);

  useEffect(() => {
    if (!tableRef.current) return;

    // Initialize Tabulator
    tabulator.current = new Tabulator(tableRef.current, {
      data: tableData,
      layout: "fitColumns",
      responsiveLayout: "collapse",
      placeholder: "No matching records found",
      pagination: true,
      paginationSize: 5,
      paginationSizeSelector: [5, 10, 20],

      columns: [
        { title: "Sr.No", formatter: "rownum", hozAlign: "center", width: 70 },
        { title: "Chemical", field: "Chemical" },
        { title: "QTY", field: "QTY" },
        {
          title: "Action",
          hozAlign: "center",
          formatter: (cell) => {
            const button = document.createElement("button");
            button.innerText = "View";
            button.className =
              "bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm";
            button.onclick = () => {
              // Replace with real fetched data if needed
              setDetailData([
                { Date: "", Supplier: "", OP_BAL: "", ReceivedKG: 100, Used: 50, Balance: "" },
                { Date: "", Supplier: "", OP_BAL: "", ReceivedKG: 120, Used: 60, Balance: "" },
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

  // Live search filter
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    tabulator.current?.setFilter("Chemical", "like", value);
  };

  return (
    <>
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-medium">Chemical Stock</h2>
      </div>

      <div className="p-5 box">
        <div className="flex items-center mb-3 gap-2">
          <span className="font-medium">Search:</span>
          <FormInput
            type="text"
            placeholder="Search by Chemical..."
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

      <ViewChemicalStock
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        data={detailData}
      />
    </>
  );
}

export default Main;
