import { createRef, useEffect, useRef, useState } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "@/assets/css/vendors/tabulator.css";
import { FormInput } from "@/components/Base/Form";


function Main() {
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
     const [filterValue, setFilterValue] = useState("");
  const filterValueRef = useRef(filterValue);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!tableRef.current) return;

    tabulator.current = new Tabulator(tableRef.current, {
      layout: "fitColumns",          // 👉 take full width
      height: "auto",                // 👉 no extra height
      responsiveLayout: false,
      pagination: true,
    paginationSize: 10,
    paginationSizeSelector: [10, 20, 30, 40],

      columns: [
        {
          title: "Sr.No",
          formatter: "rownum",
          width: 100,
          hozAlign: "center",
          headerSort: false,
          cssClass: "sr-no-col",
        },
        { title: "Code", field: "code", widthGrow: 1 },
        { title: "Bill Date", field: "billDate", widthGrow: 1 },
        { title: "Received Date", field: "receivedDate", widthGrow: 1 },
        { title: "Particular", field: "particular", widthGrow: 2 },
        { title: "MTR", field: "mtr", hozAlign: "right" },
        { title: "TAKA", field: "taka", hozAlign: "right" },
        { title: "Bill No", field: "billNo", widthGrow: 1 },
      ],

      data: [
        { code: "123" },
        { code: "P434" },
        { code: "123" },
      ],
    });

    return () => {
      tabulator.current?.destroy();
    };
  }, []);
const handleFilterChange = (value: string) => {
  setFilterValue(value);

  if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

  debounceTimeout.current = setTimeout(() => {
    tabulator.current?.setFilter("code", "like", value);
  }, 300);
};



  return (
 <>
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-medium">Purchase Details</h2>
      </div>

      <div className="p-5 box">
      <div className="flex items-center mb-3">
          <span className="mr-2 font-medium">Search:</span>
          <FormInput
            type="text"
            placeholder="Search ..."
            className="w-64"
            value={filterValue}
            onChange={(e) => handleFilterChange(e.target.value)}
          />
        </div>

        <div
          ref={tableRef}
          style={{ overflowX: "auto", overflowY: "auto" }}
        ></div>
      </div>

     
    </>

  );
}

export default Main;
