import { useState, useEffect, useRef, createRef } from "react";
import Button from "@/components/Base/Button";
import { FormInput } from "@/components/Base/Form";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "@/assets/css/vendors/tabulator.css";

function Main() {
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const tableData = [
    {
      id: 1,
      Date: "",
      Particular: "1",
      LOTNO: "",
      BatchingMTR: "",
      ProductionMTR: "",
      RemainingFAB: "",
      ProdDate: "",
      RejectedQTY: "",
    },
  ];

 
  useEffect(() => {
    if (tableRef.current) {
      tabulator.current = new Tabulator(tableRef.current, {
        data: tableData,
        layout: "fitColumns",
        responsiveLayout: "collapse",
        height: "auto",
        placeholder: "No Data Available",
         pagination: true,
    paginationSize: 10,
    paginationSizeSelector: [10, 20, 30, 40],
        columns: [
          {
            title: "Sr.No",
            formatter: "rownum",
            hozAlign: "center",
            width: 80,
          },
          { title: "Date", field: "Date" },
          { title: "Particular", field: "Particular" },
          { title: "LOT No", field: "LOTNO" },
          { title: "Batching MTR", field: "BatchingMTR" },
          { title: "Production MTR", field: "ProductionMTR" },
          { title: "Remaining FAB", field: "RemainingFAB" },
          { title: "Prod Date", field: "ProdDate" },
          { title: "Rejected QTY", field: "RejectedQTY" },
        ],
      });
    }

    return () => {
      tabulator.current?.destroy();
    };
  }, []);


  useEffect(() => {
    if (tabulator.current) {
      tabulator.current.setFilter("Date", "like", searchTerm);
    }
  }, [searchTerm]);

  return (
    <>
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-medium">
          Batching Details With LOT No.
        </h2>
      </div>

      <div className="p-5 box">
        <div className="flex items-center mb-3">
          <span className="mr-2 font-medium">Search:</span>
          <FormInput
            type="text"
            placeholder="Search "
            className="w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div ref={tableRef} />
      </div>
    </>
  );
}

export default Main;
