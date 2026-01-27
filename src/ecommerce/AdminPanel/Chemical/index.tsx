import { useState, useRef, useEffect, createRef } from "react";
import Button from "@/components/Base/Button";
import { FormInput } from "@/components/Base/Form";
import { createIcons, icons } from "lucide";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import CreateNewChemical from "./CreateNewChemical";
import EditChemical from "./EditChemical";
import "@/assets/css/vendors/tabulator.css";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config";

function Main() {
  const token = localStorage.getItem("token");
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator>();

  const [filterValue, setFilterValue] = useState("");
  const filterValueRef = useRef(filterValue);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const [addNewChemicalModal, setAddNewChemicalModal] = useState(false);
  const [editChemicalModal, setEditChemicalModal] = useState(false);
  const [editingChemicalId, setEditingChemicalId] = useState<number | null>(null);

  useEffect(() => {
    filterValueRef.current = filterValue;
  }, [filterValue]);

  const initTabulator = () => {
    if (!tableRef.current) return;

    tabulator.current = new Tabulator(tableRef.current, {
      ajaxURL: `${BASE_URL}/api/chemical`, 
      ajaxConfig: {
        method: "GET",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      },
      ajaxParams: () => {
        const page = tabulator.current?.getPage() || 1;
        const size = tabulator.current?.getPageSize() || 10;

        const params: any = { page, size };
        if (filterValueRef.current) {
          params["filter[0][type]"] = "like";
          params["filter[0][value]"] = filterValueRef.current;
        }
        return params;
      },
      ajaxResponse: (url, params, response) => {
        return {
          last_page: Math.ceil(response.totalCount / (params.size || 10)),
          data: response.items,
        };
      },
      ajaxContentType: "json",
      pagination: true,
      paginationMode: "remote",
      filterMode: "remote",
      sortMode: "remote",
      layout: "fitColumns",
      responsiveLayout: "collapse",
      placeholder: "No matching records found",
      paginationSize: 10,
      paginationSizeSelector: [10, 20, 30, 50],
      columns: [
        { title: "Sr.No", hozAlign: "center", formatter: "rownum", width: 80 },
        { title: "Name", field: "name", minWidth: 200 },
        { title: "Type", field: "type", minWidth: 150 },
        { title: "Comment", field: "comment", minWidth: 200 },
        {
          title: "Is Active",
          field: "isActive",
          hozAlign: "left",
          minWidth: 100,
          formatter: (cell) => (cell.getValue() ? "Yes" : "No"),
        },
        {
          title: "Actions",
          field: "actions",
          hozAlign: "center",
          minWidth: 150,
          formatter: (cell) => {
            const container = document.createElement("div");
            container.className = "flex justify-end items-center gap-2";

            const rowData = cell.getRow().getData();
            const actions = [
              {
                label: "Edit",
                icon: "check-square",
                classes: "bg-green-100 hover:bg-green-200 text-green-800",
                onClick: () => {
                  setEditingChemicalId(rowData.id);
                  setEditChemicalModal(true);
                },
              },
              {
                label: "Delete",
                icon: "trash-2",
                classes: "bg-red-100 hover:bg-red-200 text-red-800",
                onClick: async () => {
                  if (!confirm("Are you sure you want to delete this chemical?")) return;
                  await axios.delete(`${BASE_URL}/api/chemical/${rowData.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  refreshTable();
                },
              },
            ];

            actions.forEach(({ label, icon, classes, onClick }) => {
              const btn = document.createElement("a");
              btn.href = "javascript:;";
              btn.className = `action-btn inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${classes}`;
              btn.innerHTML = `<i data-lucide="${icon}" class="w-4 h-4 mr-1"></i> ${label}`;
              btn.addEventListener("click", (e) => {
                e.stopPropagation();
                onClick();
              });
              container.appendChild(btn);
            });
            return container;
          },
        },
      ],
    });

    tabulator.current.on("renderComplete", () => {
      createIcons({ icons, attrs: { "stroke-width": 1.5 }, nameAttr: "data-lucide" });
    });
  };

  const refreshTable = () => {
    tabulator.current?.setPage(1).then(() => tabulator.current?.replaceData());
  };

  const handleFilterChange = (value: string) => {
    setFilterValue(value);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      refreshTable();
    }, 300);
  };

  useEffect(() => {
    initTabulator();
    const handleResize = () => {
      tabulator.current?.redraw();
      createIcons({ icons, attrs: { "stroke-width": 1.5 }, nameAttr: "data-lucide" });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

      <CreateNewChemical
        open={addNewChemicalModal}
        onClose={() => setAddNewChemicalModal(false)}
        onSuccess={refreshTable} 
      />

      <EditChemical
        open={editChemicalModal}
        chemicalId={editingChemicalId}
        onClose={() => setEditChemicalModal(false)}
        onSuccess={refreshTable} 
      />
    </>
  );
}

export default Main;
