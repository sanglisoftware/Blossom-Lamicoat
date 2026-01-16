import { useState, useRef, useEffect, createRef } from "react";
import Button from "@/components/Base/Button";
import "@/assets/css/vendors/tabulator.css";
import { FormInput } from "@/components/Base/Form";
import { createIcons,  icons } from "lucide";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "@/assets/css/vendors/tabulator.css";
import CreateGramage from "./CreateGramage";
import EditGamage from "./EditGamage";

function Main() {
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator | null>(null);

   const [filterValue, setFilterValue] = useState("");
  const filterValueRef = useRef(filterValue);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const [addNewGramModal, setAddNewGramModal] = useState(false);
  const [editGramModal, setEditGramModal] = useState(false);
  const [GramToEdit, setGramToEdit] = useState<any>(null);

  const [tableData, setTableData] = useState([
    { id: 1, grm: "200" },
    { id: 2, grm: "300" },
    { id: 3, grm: "500" },
  ]);


 useEffect(() => {
    filterValueRef.current = filterValue;
  }, [filterValue]);


     const initTabulator = () => {
    if (tableRef.current) {
     tabulator.current = new Tabulator(tableRef.current, {
    data: tableData, 
    layout: "fitColumns",
    responsiveLayout: "collapse",
    placeholder: "No matching records found",
    pagination: true,
    paginationSize: 10,
    paginationSizeSelector: [10, 20, 30, 40],
      columns: [
         { title: "Sr.No", hozAlign: "center", formatter: "rownum", width: 80 },
          { title: "grm", field: "grm", minWidth: 200, hozAlign: "center", headerHozAlign: "center", },

        {
          title: "Actions",
          width: 200,
          field: "actions",
          hozAlign: "center",
          headerHozAlign: "center",
          formatter(cell) {
            const container = document.createElement("div");
            container.className =
              "flex lg:justify-center items-center gap-2";

            const rowData = cell.getRow().getData();

            const actions = [
              {
                label: "Edit",
                icon: "check-square",
                classes:
                  "bg-green-100 hover:bg-green-200 text-green-800",
                onClick: () => {
                  setGramToEdit(rowData);
                  setEditGramModal(true);
                },
              },
              {
                label: "Delete",
                icon: "trash-2",
                classes:
                  "bg-red-100 hover:bg-red-200 text-red-800",
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
      createIcons({ icons });
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
          row.grm.toLowerCase().includes(filterValueRef.current.toLowerCase())
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


  const handleAddGram = (data: { grm: string }) => {
    setTableData((prev) => [
      ...prev,
      { id: prev.length + 1, grm: data.grm },
    ]);
  };


  const handleUpdateGram = (data: { id: number; grm: string }) => {
    setTableData((prev) =>
      prev.map((row) => (row.id === data.id ? data : row))
    );
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center mt-8">
        <h2 className="mr-auto text-lg font-medium">Gramage Table</h2>
        <Button
          variant="primary"
          className="shadow-md"
          onClick={() => setAddNewGramModal(true)}
        >
          Add Name
        </Button>
      </div>


      {/* Table */}
      <div className="p-5 mt-5 box">
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
        <div className="overflow-x-auto">
          <div ref={tableRef} className="mt-5"></div>
        </div>
        
      </div>

      {/* Modals */}
      <CreateGramage
        open={addNewGramModal}
        onClose={() => setAddNewGramModal(false)}
        onAddGram={handleAddGram}
      />

      <EditGamage
        open={editGramModal}
        onClose={() => setEditGramModal(false)}
        GramData={GramToEdit}
        onUpdateGram={handleUpdateGram}
      />
    </>
  );
}

export default Main;