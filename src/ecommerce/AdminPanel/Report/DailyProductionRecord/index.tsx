import { useState, useEffect, useRef, createRef } from "react";
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
      PVCKG: "1",
      RollNo: "1",
      Type: "",
      GRM: "",
      Fabric: "",
      LOTNO: "",
      BatchNo: "",
      TotalBatchMTR: "",
      LOTwiseMTR: "",
      ProdMTR: "",
      AVG: "",
      first: "",
      second: "",
      BIT: "",
      CUT: "",
      Avg: "",
    },
  ];

  useEffect(() => {
    if (tableRef.current) {
      tabulator.current = new Tabulator(tableRef.current, {
        data: tableData,
        layout: "fitDataFill",     
        responsiveLayout: false,
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
          { title: "Date", field: "Date", width: 120 },
          { title: "Particular", field: "Particular", width: 140 },
          { title: "PVC KG", field: "PVCKG", width: 110 },
          { title: "Roll No", field: "RollNo", width: 110 },
          { title: "Type (PVC Name)", field: "Type", width: 180 },
          { title: "GRM", field: "GRM", width: 100 },
          { title: "Fabric", field: "Fabric", width: 140 },
          { title: "LOT No", field: "LOTNO", width: 120 },
          { title: "Batch MTR", field: "BatchNo", width: 130 },
          { title: "Total Batch MTR", field: "TotalBatchMTR", width: 160 },
          { title: "LOT wise PROD MTR", field: "LOTwiseMTR", width: 190 },
          { title: "PROD MTR", field: "ProdMTR", width: 130 },
          { title: "AVG", field: "AVG", width: 100 },
          { title: "1st", field: "first", width: 90 },
          { title: "2nd", field: "second", width: 90 },
          { title: "BIT", field: "BIT", width: 90 },
          { title: "Cut", field: "CUT", width: 90 },
          { title: "AVG", field: "Avg", width: 100 },
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
        <h2 className="text-lg font-medium">Daily Production Record</h2>
      </div>

      <div className="p-5 box">
        <div className="flex items-center mb-3">
          <span className="mr-2 font-medium">Search:</span>
          <FormInput
            type="text"
            placeholder="Search by Date"
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
