import { useState, useRef, useEffect, createRef } from "react";
import Button from "@/components/Base/Button";
import { FormInput } from "@/components/Base/Form";
import { createIcons, icons } from "lucide";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import CreateNewChemical from "./CreateNewChemical";
import EditChemical from "./EditChemical";
import "@/assets/css/vendors/tabulator.css";

function Main() {
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator>();

  const [filterValue, setFilterValue] = useState("");
  const filterValueRef = useRef(filterValue);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const [addNewChemicalModal, setAddNewChemicalModal] = useState(false);
  const [editChemicalModal, setEditChemicalModal] = useState(false);
  const [editingChemical, setEditingChemical] = useState<any>(null);

  // Static chemical data
  const [tableData, setTableData] = useState([
    { id: 1, Name: "PVC RESIN PAWDER", type: "Polymer", comments: "High grade" },
    { id: 2, Name: "DOP P 80", type: "Plasticizer", comments: "" },
    { id: 3, Name: "CPW 52 AD", type: "Additive", comments: "Use carefully" },
  ]);

  useEffect(() => {
    filterValueRef.current = filterValue;
  }, [filterValue]);

  const initTabulator = () => {
    if (tableRef.current) {
     tabulator.current = new Tabulator(tableRef.current, {
    data: tableData, // static data
    layout: "fitColumns",
    responsiveLayout: "collapse",
    placeholder: "No matching records found",
    pagination: true,
    paginationSize: 10,
    paginationSizeSelector: [10, 20, 30, 40],
    // paginationPosition: "bottom",
    // paginationCounter: "rows",
        columns: [
          { title: "Sr.No", hozAlign: "center", formatter: "rownum", width: 80 },
          { title: "Name", field: "Name", minWidth: 200 },
          { title: "Type", field: "type", minWidth: 150 },
          { title: "Comments", field: "comments", minWidth: 200 },
          
         {
    title: "ACTIONS",
    minWidth: 150,
    field: "actions",
    responsive: 1,
    hozAlign: "center",
    headerHozAlign: "center",
    vertAlign: "middle",
    print: false,
    download: false,
    formatter(cell) {
        const container = document.createElement("div");
        container.className = "flex justify-end items-center gap-2";

        const rowData = cell.getRow().getData();

        const actions = [
            {
                label: "Edit",
                icon: "check-square",
                classes: "bg-green-100 hover:bg-green-200 text-green-800",
                onClick: () => {
                    setEditingChemical(rowData);
                    setEditChemicalModal(true);
                },
            },
            {
                label: "Delete",
                icon: "trash-2",
                classes: "bg-red-100 hover:bg-red-200 text-red-800",
                onClick: () => {
                    if (confirm("Are you sure you want to delete this chemical?")) {
                        setTableData((prev) => prev.filter((r) => r.id !== rowData.id));
                    }
                },
            },
        ];

        actions.forEach(({ label, icon, classes, onClick }) => {
            const button = document.createElement("a");
            button.href = "javascript:;";
            button.className = `action-btn inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${classes} transition-colors`;
            button.innerHTML = `<i data-lucide="${icon}" class="w-4 h-4 mr-1"></i> ${label}`;
            button.addEventListener("click", (e) => {
                e.stopPropagation();
                onClick();
            });
            container.appendChild(button);
        });

        return container;
    },
},


        ],
      });

      tabulator.current.on("renderComplete", () => {
        createIcons({ icons, attrs: { "stroke-width": 1.5 }, nameAttr: "data-lucide" });
      });
    }
  };

  const refreshTable = () => {
    if (tabulator.current) {
      tabulator.current.replaceData(tableData);
    }
  };

  const handleFilterChange = (value: string) => {
    setFilterValue(value);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      if (tabulator.current) {
        const filtered = tableData.filter((row) =>
          row.Name.toLowerCase().includes(filterValueRef.current.toLowerCase())
        );
        tabulator.current.replaceData(filtered);
      }
    }, 300);
  };

  useEffect(() => {
    initTabulator();
    window.addEventListener("resize", () => {
      if (tabulator.current) {
        tabulator.current.redraw();
        createIcons({ icons, attrs: { "stroke-width": 1.5 }, nameAttr: "data-lucide" });
      }
    });

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [tableData]);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center mt-8 mb-4">
        <h2 className="mr-auto text-lg font-medium">Chemical Table</h2>
        <Button variant="primary" onClick={() => setAddNewChemicalModal(true)}>
          Add Chemical
        </Button>
      </div>

      <div className="p-5 box">
        <div className="flex items-center mb-3">
          <span className="mr-2 font-medium">Search:</span>
          <FormInput
            type="text"
            placeholder="Search chemicals..."
            className="w-64"
            value={filterValue}
            onChange={(e) => handleFilterChange(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <div id="tabulator" ref={tableRef}></div>
        </div>
      </div>

      {/* Modals */}
      <CreateNewChemical
        open={addNewChemicalModal}
        onClose={() => setAddNewChemicalModal(false)}
        onAddChemical={(newData: any) => {
          setTableData((prev) => [...prev, { id: prev.length + 1, ...newData }]);
          refreshTable();
        }}
      />

      <EditChemical
        open={editChemicalModal}
        onClose={() => setEditChemicalModal(false)}
        chemicalData={editingChemical}
        onUpdateChemical={(updated: any) => {
          setTableData((prev) =>
            prev.map((row) => (row.id === updated.id ? updated : row))
          );
          refreshTable();
        }}
      />
    </>
  );
}

export default Main;





