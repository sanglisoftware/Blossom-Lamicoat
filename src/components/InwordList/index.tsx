import { useState, useRef, useEffect, createRef } from "react";
import "@/assets/css/vendors/tabulator.css";
import { createIcons, icons } from "lucide";
import { TabulatorFull as Tabulator } from "tabulator-tables";


function Main() {
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator | null>(null);

  const [editChemicalModal, setEditChemicalModal] = useState(false);
  const [chemicalToEdit, setChemicalToEdit] = useState<any>(null);

  const [tableData, setTableData] = useState([
    { id: 1, Chemical_Name: "PVC RESIN PAWDER", QTY: "", Supplier: "", Batch_No:"" },
    { id: 2, Chemical_Name: "DOP P 80", QTY: "", Supplier: "", Batch_No:"" },
    { id: 3, Chemical_Name: "CPW 52 AD", QTY: "", Supplier: "", Batch_No:""},
  ]);

  useEffect(() => {
    if (!tableRef.current) return;

    tabulator.current = new Tabulator(tableRef.current, {
      data: tableData,
      layout: "fitColumns",
      responsiveLayout: false,
      columnDefaults: {
          headerSort: false,
          hozAlign: "center",
          headerHozAlign: "center",
          title: ""
      },
      columns: [
        {
          title: "Sr No.",
          width: 120,
          formatter(cell) {
            const rowIndex = cell.getRow().getPosition(true);
            return `
              <div class="flex items-center justify-center gap-2">
                <input type="checkbox" />
                <span>${rowIndex}</span>
              </div>
            `;
          },
        },
        { title: "Chemical Name", field: "Chemical Name" },
        { title: "QTY", field: "QTY" },
        { title: "Supplier", field: "Supplier" },
        { title: "Batch No", field: "Batch No" },

        {
          title: "Actions",
          width: 200,
          formatter: (cell) => {
            const container = document.createElement("div");
            container.className = "flex justify-center gap-2";

            const editBtn = document.createElement("button");
            editBtn.innerText = "Edit";
            editBtn.className =
              "px-3 py-1 text-sm rounded bg-blue-600 text-white";
            editBtn.onclick = () => {
              setChemicalToEdit(cell.getRow().getData());
              setEditChemicalModal(true);
            };

            const deleteBtn = document.createElement("button");
            deleteBtn.innerText = "Delete";
            deleteBtn.className =
              "px-3 py-1 text-sm rounded bg-red-600 text-white";
            deleteBtn.onclick = () => {
              const rowId = cell.getRow().getData().id;
              setTableData((prev) => prev.filter((row) => row.id !== rowId));
            };

            container.appendChild(editBtn);
            container.appendChild(deleteBtn);
            return container;
          },
        },
      ],
    });

    tabulator.current.on("renderComplete", () => {
      createIcons({ icons });
    });

    return () => tabulator.current?.destroy();
  }, []);

  useEffect(() => {
    tabulator.current?.setData(tableData);
  }, [tableData]);

  
  
  return (
    <>
      <div className="flex items-center mt-8">
        <h2 className="mr-auto text-lg font-medium">Chemical Table</h2>
       
      </div>

      <div className="p-5 mt-5 box">
        <div className="overflow-x-auto">
          <div ref={tableRef} className="mt-5"></div>
        </div>
      </div>

    
     
    </>
  );
}

export default Main;