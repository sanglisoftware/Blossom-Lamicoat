import { useState, useRef, useEffect, createRef } from "react";
import Button from "@/components/Base/Button";
import "@/assets/css/vendors/tabulator.css";
import { createIcons, icons } from "lucide";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import EditWidth from "./EditWidth";
import AddWidth from "./AddWidth";
import { FormInput } from "@/components/Base/Form";

function Main() {
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator | null>(null);

  const [filterValue, setFilterValue] = useState("");
  const filterValueRef = useRef(filterValue);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const [addNewWidthModal, setAddNewWidthModal] = useState(false);
  const [editWidthModal, setEditWidthModal] = useState(false);
  const [WidthToEdit, setWidthToEdit] = useState<any>(null);

  const [WidthtableData, setWidthTableData] = useState([
    { id: 1, grm: "200" },
    { id: 2, grm: "300" },
    { id: 3, grm: "500" },
  ]);

  useEffect(() => {
    filterValueRef.current = filterValue;
  }, [filterValue]);

  const initTabulator = () => {
    if (tableRef.current && !tabulator.current) {
      tabulator.current = new Tabulator(tableRef.current, {
        data: WidthtableData,
        layout: "fitColumns",
        responsiveLayout: "collapse",
        placeholder: "No matching records found",
        pagination: true,
        paginationSize: 10,
        paginationSizeSelector: [10, 20, 30, 40],
        columns: [
          {
            title: "Sr.No",
            hozAlign: "center",
            headerHozAlign: "center",
            formatter: "rownum",
            width: 80,
          },
          {
            title: "grm",
            field: "grm",
            minWidth: 200,
            hozAlign: "center",
            headerHozAlign: "center",
          },
          {
            title: "Actions",
            width: 200,
            hozAlign: "center",
            headerHozAlign: "center",
            formatter(cell) {
              const container = document.createElement("div");
              container.className =
                "flex lg:justify-center items-center gap-2";

              const rowData: any = cell.getRow().getData();

              const actions = [
                {
                  label: "Edit",
                  icon: "check-square",
                  classes:
                    "bg-green-100 hover:bg-green-200 text-green-800",
                  onClick: () => {
                    setWidthToEdit(rowData);
                    setEditWidthModal(true);
                  },
                },
                {
                  label: "Delete",
                  icon: "trash-2",
                  classes:
                    "bg-red-100 hover:bg-red-200 text-red-800",
                  onClick: () => {
                    if (
                      confirm(
                        "Are you sure you want to delete this chemical?"
                      )
                    ) {
                      setWidthTableData((prev) =>
                        prev.filter((r) => r.id !== rowData.id)
                      );
                    }
                  },
                },
              ];

              actions.forEach(({ label, icon, classes, onClick }) => {
                const button = document.createElement("a");
                button.href = "javascript:;";
                button.className = `action-btn inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${classes}`;
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
        createIcons({
          icons,
          attrs: { "stroke-width": 1.5 },
          nameAttr: "data-lucide",
        });
      });
    }
  };


  useEffect(() => {
    if (tabulator.current) {
      tabulator.current.replaceData(WidthtableData);
    }
  }, [WidthtableData]);


  useEffect(() => {
    initTabulator();

    window.addEventListener("resize", () => {
      if (tabulator.current) {
        tabulator.current.redraw();
        createIcons({
          icons,
          attrs: { "stroke-width": 1.5 },
          nameAttr: "data-lucide",
        });
      }
    });

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, []);

 
  const handleWidth = (data: { grm: string }) => {
    setWidthTableData((prev) => [
      ...prev,
      { id: prev.length + 1, grm: data.grm },
    ]);
  };


  const handleUpdateWidth = (data: { id: number; grm: string }) => {
    setWidthTableData((prev) =>
      prev.map((row) => (row.id === data.id ? data : row))
    );
  };
  const handleFilterChange = (value: string) => {
    setFilterValue(value);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      if (tabulator.current) {
        const filtered = WidthtableData.filter((row) =>
          row.grm.toLowerCase().includes(filterValueRef.current.toLowerCase())
        );
        tabulator.current.replaceData(filtered);
      }
    }, 300);
  };


  return (
    <>
      <div className="flex items-center mt-8">
        <h2 className="mr-auto text-lg font-medium">Width Table</h2>
        <Button
          variant="primary"
          className="shadow-md"
          onClick={() => setAddNewWidthModal(true)}
        >
          Add Name
        </Button>
      </div>

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

      <AddWidth
        open={addNewWidthModal}
        onClose={() => setAddNewWidthModal(false)}
        onAddWidth={handleWidth}
      />

      <EditWidth
        open={editWidthModal}
        onClose={() => setEditWidthModal(false)}
        WidthData={WidthToEdit}
        onUpdateGram={handleUpdateWidth}
      />
    </>
  );
}

export default Main;