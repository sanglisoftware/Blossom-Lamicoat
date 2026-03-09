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
import AddProductList from "./AddProductList";
import EditProductList from "./EditProductList";

type FabricProductRow = {
  id: number;
  name?: string;
  fGramageMasterName?: string;
  colourMasterName?: string;
  comments?: string;
};

function Main() {
  const token = localStorage.getItem("token");
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator>();

  const [filterValue, setFilterValue] = useState("");
  const filterValueRef = useRef(filterValue);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const [tableData, setTableData] = useState<FabricProductRow[]>([]);

  const [addFproductModal, setAddFproductModal] = useState(false);
  const [editFproductModal, setEditFproductModal] = useState(false);
  const [editingFproduct, setEditingFproduct] = useState<any>(null);
  const [editingFproductId, setEditingFproductId] = useState<number | null>(null);

const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [deleteFproductId, setDeleteFproductId] = useState<number | null>(null);
  const deleteButtonRef = useRef(null);

  useEffect(() => {
    filterValueRef.current = filterValue;
  }, [filterValue]);

  const applyGlobalFilter = (value: string) => {
    if (!tabulator.current) return;

    const term = value.trim().toLowerCase();
    if (!term) {
      tabulator.current.clearFilter(true);
      return;
    }

    tabulator.current.setFilter((row: FabricProductRow) =>
      [row.name, row.fGramageMasterName, row.colourMasterName, row.comments].some(
        (fieldValue) => String(fieldValue ?? "").toLowerCase().includes(term)
      )
    );
  };

  const fetchFProductData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/fproductlist?page=1&size=1000`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      const items = response?.data?.items ?? response?.data?.Items ?? [];
      setTableData(items);
    } catch (error) {
      console.error("Failed to fetch fabric product list:", error);
      setTableData([]);
    }
  };

  const initTabulator = () => {
    if (!tableRef.current) return;

    tabulator.current = new Tabulator(tableRef.current, {
      data: tableData,
      pagination: true,
      layout: "fitColumns",
      responsiveLayout: "collapse",
      placeholder: "No matching records found",
      paginationSize: 10,
      paginationSizeSelector: [10, 20, 30, 50],

      columns: [
        {
          title: "Sr.No",
          hozAlign: "center",
          headerHozAlign: "center",
          formatter: "rownum",
          width: 80,
        },
        { title: "Name", field: "name", hozAlign: "center",  headerHozAlign: "center",minWidth: 180 },
        { title: "GRM", field: "fGramageMasterName", hozAlign: "center",  headerHozAlign: "center",minWidth: 200 },
        { title: "Colour", field: "colourMasterName",hozAlign: "center",  headerHozAlign: "center", minWidth: 200 },
        { title: "Comments", field: "comments", hozAlign: "center",  headerHozAlign: "center",minWidth: 150 },

        {
          title: "ACTIONS",
          field: "actions",
          hozAlign: "center",
          headerHozAlign: "center",
          minWidth: 180,
          print: false,
          download: false,

          formatter(cell) {
            const container = document.createElement("div");
            container.className = "flex justify-center items-center space-x-2";

            const rowData = cell.getRow().getData();

            const actions = [
              {
                label: "Edit",
                icon: "check-square",
                classes:
                  "bg-green-100 hover:bg-green-200 text-green-800",
                onClick: () => {
                  setEditingFproductId(rowData.id);
                  setEditFproductModal(true);
                },
              },
              {
                label: "Delete",
                icon: "trash-2",
                classes:
                  "bg-red-100 hover:bg-red-200 text-red-800",
                onClick: () => {
                 setDeleteFproductId(rowData.id);
                  setDeleteConfirmationModal(true);
                },
              },
            ];

            actions.forEach(({ label, icon, classes, onClick }) => {
              const btn = document.createElement("a");
              btn.href = "javascript:;";
              btn.className = `inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${classes}`;
              btn.innerHTML = `<i data-lucide="${icon}" class="w-4 h-4 mr-1"></i>${label}`;

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
    fetchFProductData();
  };

const handleFilterChange = (value: string) => {
  setFilterValue(value);

  if (searchTimeout.current) clearTimeout(searchTimeout.current);

  searchTimeout.current = setTimeout(() => {
    applyGlobalFilter(value);
  }, 600);
};





  const handleDeleteFproduct = async () => {
    if (!deleteFproductId) return;

    try {
      await axios.delete(`${BASE_URL}/api/fproductlist/${deleteFproductId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      setDeleteConfirmationModal(false);
      setDeleteFproductId(null);
      refreshTable();
    } catch (error) {
      console.error(error);
      alert("Failed to delete product");
    }
  };

  useEffect(() => {
    initTabulator();
    fetchFProductData();
    const handleResize = () => {
      tabulator.current?.redraw();
      createIcons({ icons, attrs: { "stroke-width": 1.5 }, nameAttr: "data-lucide" });
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      tabulator.current?.destroy();
    };
  }, []);

  useEffect(() => {
    tabulator.current?.setData(tableData);
    applyGlobalFilter(filterValueRef.current);
  }, [tableData]);


  return (
    <>
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-medium"> Product Table</h2>
        <Button variant="primary" onClick={() => setAddFproductModal(true)}>
          Add Product
        </Button>
      </div>

      <div className="p-5 box">
          <div className="flex items-center mb-3">
          <span className="mr-2 font-medium">Search:</span>
          <FormInput
            type="text"
            placeholder="Search all fields..."
            className="w-64"
            value={filterValue}
            onChange={(e) => handleFilterChange(e.target.value)}
          />
        </div>


        <div className="overflow-x-auto">
          <div ref={tableRef}></div>
        </div>
      </div>

      <AddProductList
        open={addFproductModal}
        onClose={() => setAddFproductModal(false)}
        onSuccess={refreshTable}
      />

      <EditProductList
        open={editFproductModal}
      fproductId={editingFproductId}
        onClose={() => setEditFproductModal(false)}
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
              Do you really want to <span className="text-danger">delete</span> this product?
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
              onClick={handleDeleteFproduct}
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
