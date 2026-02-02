import { useState, useRef, useEffect, createRef } from "react";
import Button from "@/components/Base/Button";
import { FormInput } from "@/components/Base/Form";
import { createIcons, icons } from "lucide";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "@/assets/css/vendors/tabulator.css";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config";
import { Dialog } from "@/components/Base/Headless";
import Lucide from "@/components/Base/Lucide";
import AddWidth from "./AddWidth";
import EditWidth from "./EditWidth";

interface Width {
  id: number;
  GRM: string;
}

function Main() {
  const token = localStorage.getItem("token");
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator | null>(null);
  const searchValueRef = useRef("");
const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const [filterValue, setFilterValue] = useState("");
  const filterValueRef = useRef(filterValue);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [addNewWidthModal, setAddNewWidthModal] = useState(false);
  const [editWidthModal, setEditWidthModal] = useState(false);
   const [editingWidthId, setEditingWidthId] = useState<number | null>(null);
  
  const [WidthToEdit, setWidthToEdit] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef(searchTerm);
 

 const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [deleteWidthId, setDeleteWidthId] = useState<number | null>(null);
  const deleteButtonRef = useRef(null);

  useEffect(() => {
    filterValueRef.current = filterValue;
  }, [filterValue]);

  const initTabulator = () => {
    if (!tableRef.current) return;

    tabulator.current = new Tabulator(tableRef.current, {
      ajaxURL: `${BASE_URL}/api/width`,
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
        { title: "Sr.No", hozAlign: "center",headerHozAlign: "center",formatter: "rownum", width: 80 },
        { title: "GRM", hozAlign: "center", headerHozAlign: "center", field: "grm", minWidth: 200 },

        {
          title: "Actions",
          field: "actions",
          hozAlign: "center",
          headerHozAlign: "center",
          minWidth: 150,
          formatter: (cell) => {
            const container = document.createElement("div");
container.className = "flex justify-center items-center gap-2";

            const rowData = cell.getRow().getData();
            const actions = [
              {
                label: "Edit",
                icon: "check-square",
                classes: "bg-green-100 hover:bg-green-200 text-green-800",
                onClick: () => {
                  setEditingWidthId(rowData.id);
                  setEditWidthModal(true);
                },
                
              },
              {
                label: "Delete",
                icon: "trash-2",
                action: "delete",
                classes: "bg-red-100 hover:bg-red-200 text-red-800",
                onClick: () => {
                  setDeleteWidthId(rowData.id);
                  setDeleteConfirmationModal(true);
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

  if (searchTimeout.current) clearTimeout(searchTimeout.current);

  
  searchTimeout.current = setTimeout(() => {
    searchValueRef.current = value.trim();

    if (tabulator.current) {
      tabulator.current.setData(`${BASE_URL}/api/width`, {
        params: {
          page: 1,
          size: tabulator.current.getPageSize() || 10,
          ...(searchValueRef.current
            ? { "filter[0][type]": "like", "filter[0][value]": searchValueRef.current }
            : {}),
        },
      });
    }
  }, 600);
};





  const handleDeleteWidth = async () => {
    if (!deleteWidthId) return;

    try {
      await axios.delete(`${BASE_URL}/api/width/${deleteWidthId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      setDeleteConfirmationModal(false);
      setDeleteWidthId(null);
      refreshTable();
    } catch (error) {
      console.error(error);
      alert("Failed to delete width");
    }
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
        <h2 className="mr-auto text-lg font-medium">Width Table</h2>
        <Button variant="primary" onClick={() => setAddNewWidthModal(true)}>
          Add Width
        </Button>
      </div>

      <div className="p-5 box">
        <div className="flex items-center mb-3">
          <span className="mr-2 font-medium">Search:</span>
          <FormInput
            type="text"
            className="w-64"
            value={filterValue}
            onChange={(e) => handleFilterChange(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <div ref={tableRef}></div>
        </div>
      </div>

      <AddWidth
        open={addNewWidthModal}
        onClose={() => setAddNewWidthModal(false)}
        onSuccess={refreshTable}
      />

      <EditWidth
        open={editWidthModal}
        onClose={() => setEditWidthModal(false)}
         widthId={editingWidthId}
          onSuccess={refreshTable}
      />

      <Dialog
        open={deleteConfirmationModal}
        onClose={() => setDeleteConfirmationModal(false)}
        initialFocus={deleteButtonRef}
      >
        <Dialog.Panel>
          <div className="p-5 text-center">
            <Lucide icon="Trash" className="w-16 h-16 mx-auto mt-3 text-danger" />
            <div className="mt-5 text-3xl">Are you sure?</div>
            <div className="mt-2 text-slate-500">
              Do you really want to <span className="text-danger">delete</span> this Gramge?
            </div>
          </div>
          <div className="px-5 pb-8 text-center">
            <Button
              variant="outline-secondary"
              type="button"
              onClick={() => setDeleteConfirmationModal(false)}
              className="w-24 mr-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              type="button"
              className="w-24"
              ref={deleteButtonRef}
              onClick={handleDeleteWidth}
            >
              Delete
            </Button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </>
  );
}

export default Main;