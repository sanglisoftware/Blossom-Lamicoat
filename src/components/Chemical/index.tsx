
import { useState, useRef, useEffect, createRef } from "react";
import Button from "@/components/Base/Button";
import "@/assets/css/vendors/tabulator.css";
import { createIcons, icons } from "lucide";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import CreateNewChemical from "./CreateNewChemical";
import EditChemical from "./EditChemical";

function Main() {
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator | null>(null);

  const [addNewChemicalModal, setAddNewChemicalModal] = useState(false);
  const [editChemicalModal, setEditChemicalModal] = useState(false);
  const [chemicalToEdit, setChemicalToEdit] = useState<any>(null);

  const [tableData, setTableData] = useState([
    { id: 1, Name: "PVC RESIN PAWDER", type: "", comments: "" },
    { id: 2, Name: "DOP P 80", type: "", comments: "" },
    { id: 3, Name: "CPW 52 AD", type: "", comments: "" },
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
        { title: "Name", field: "Name" },
        { title: "Type", field: "type" },
        { title: "Comments", field: "comments" },
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

  const handleAddChemical = (data: {
    chemicalName: string;
    type: string;
    comments: string;
  }) => {
    setTableData((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        Name: data.chemicalName,
        type: data.type,
        comments: data.comments,
      },
    ]);
  };

  const handleUpdateChemical = (data: {
    id: number;
    Name: string;
    type: string;
    comments: string;
  }) => {
    setTableData((prev) =>
      prev.map((row) => (row.id === data.id ? data : row))
    );
  };

  return (
    <>
      <div className="flex items-center mt-8">
        <h2 className="mr-auto text-lg font-medium">Chemical Table</h2>
        <Button
          variant="primary"
          className="shadow-md"
          onClick={() => setAddNewChemicalModal(true)}
        >
          Add Chemical
        </Button>
      </div>

      <div className="p-5 mt-5 box">
        <div className="overflow-x-auto">
          <div ref={tableRef} className="mt-5"></div>
        </div>
      </div>

    
      <CreateNewChemical
        open={addNewChemicalModal}
        onClose={() => setAddNewChemicalModal(false)}
        onAddChemical={handleAddChemical}
      />

      <EditChemical
        open={editChemicalModal}
        onClose={() => setEditChemicalModal(false)}
        chemicalData={chemicalToEdit}
        onUpdateChemical={handleUpdateChemical}
      />
    </>
  );
}

export default Main;






