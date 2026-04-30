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
import AddInwardList from "./AddInwardList";
import EditInwardList from "./EditInwardList";

interface ChemicalInward {
  id: number;
  chemicalMasterName?: string;
  qty?: number;
  supplierMasterName?: string;
  batchNo?: number;
  billDate?: string;
  receivedDate?: string;
}

const formatDateValue = (value?: string) => {
  if (!value) return "";
  return String(value).split("T")[0];
};

function Main() {
  const token = localStorage.getItem("token");
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator | null>(null);
  const [filterValue, setFilterValue] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tableData, setTableData] = useState<ChemicalInward[]>([]);

  const [addNewInwardModal, setAddNewInwardModal] = useState(false);
  const [editInwardModal, setEditInwardModal] = useState(false);
   const [editingInwardId, setEditingInwardId] = useState<number | null>(null);

 const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [deleteInwardId, setDeleteInwardId] = useState<number | null>(null);
  const deleteButtonRef = useRef(null);

  const initTabulator = () => {
    if (!tableRef.current) return;

    tabulator.current = new Tabulator(tableRef.current, {
      data: [],
      pagination: true,
      layout: "fitColumns",
      responsiveLayout: "collapse",
      placeholder: "No matching records found",
      paginationSize: 10,
      paginationSizeSelector: [10, 20, 30, 50],
      columns: [
        { title: "Sr.No", hozAlign: "center",headerHozAlign: "center",formatter: "rownum", width: 80 },
        { title: "Chemical", hozAlign: "center", headerHozAlign: "center", field: "chemicalMasterName", minWidth: 150 },
       { title: "QTY", hozAlign: "center", headerHozAlign: "center", field: "qty", minWidth: 200 },        
        { title: "Supplier", hozAlign: "center", headerHozAlign: "center", field: "supplierMasterName", minWidth: 150 },     
        { title: "Invoice No", hozAlign: "center", headerHozAlign: "center", field: "batchNo", minWidth: 100 },
        { title: "Bill Date", hozAlign: "center", headerHozAlign: "center", field: "billDate", minWidth: 130, formatter: (cell) => formatDateValue(cell.getValue()) },
        { title: "Received Date", hozAlign: "center", headerHozAlign: "center", field: "receivedDate", minWidth: 140, formatter: (cell) => formatDateValue(cell.getValue()) },
       
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
                  setEditingInwardId(rowData.id);
                  setEditInwardModal(true);
                },
                
              },
              {
                label: "Delete",
                icon: "trash-2",
                action: "delete",
                classes: "bg-red-100 hover:bg-red-200 text-red-800",
                onClick: () => {
                  setDeleteInwardId(rowData.id);
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

  const fetchInwardData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/chemicalinward?page=1&size=1000`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      setTableData(response.data?.items || []);
    } catch (error) {
      console.error("Error fetching chemical inward list:", error);
    }
  };

  const refreshTable = () => {
    void fetchInwardData();
  };

  const applyFilters = () => {
    if (!tabulator.current) return;

    const normalizedSearch = filterValue.trim().toLowerCase();

    tabulator.current.setData(
      tableData.filter((row) => {
        const searchableText = [
          row.chemicalMasterName,
          row.supplierMasterName,
          row.batchNo,
          row.qty,
          formatDateValue(row.billDate),
          formatDateValue(row.receivedDate),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !normalizedSearch || searchableText.includes(normalizedSearch);

        const billDateValue = formatDateValue(row.billDate);
        const matchesFromDate = !fromDate || (billDateValue && billDateValue >= fromDate);
        const matchesToDate = !toDate || (billDateValue && billDateValue <= toDate);

        return matchesSearch && matchesFromDate && matchesToDate;
      })
    );
  };

  const handleDeleteWidth = async () => {
    if (!deleteInwardId) return;

    try {
      await axios.delete(`${BASE_URL}/api/chemicalinward/${deleteInwardId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      setDeleteConfirmationModal(false);
      setDeleteInwardId(null);
      refreshTable();
    } catch (error) {
      console.error(error);
      alert("Failed to delete Inward");
    }
  };

  useEffect(() => {
    initTabulator();
    void fetchInwardData();
    const handleResize = () => {
      tabulator.current?.redraw();
      createIcons({ icons, attrs: { "stroke-width": 1.5 }, nameAttr: "data-lucide" });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tableData, filterValue, fromDate, toDate]);


  return (
    <>
      <div className="flex flex-col sm:flex-row items-center mt-8 mb-4">
        <h2 className="mr-auto text-lg font-medium">Inward List Table</h2>
        <Button variant="primary" onClick={() => setAddNewInwardModal(true)}>
          Add Inward
        </Button>
      </div>

      <div className="p-5 box">
        <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex items-center">
          <span className="mr-2 font-medium">Search:</span>
          <FormInput
            type="text"
            placeholder="Search ..."
            className="w-64"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div>
              <span className="mb-1 block font-medium">From Date</span>
              <FormInput
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div>
              <span className="mb-1 block font-medium">To Date</span>
              <FormInput
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => {
                  setFilterValue("");
                  setFromDate("");
                  setToDate("");
                }}
              >
                Clear Filter
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div ref={tableRef}></div>
        </div>
      </div>

      <AddInwardList
        open={addNewInwardModal}
        onClose={() => setAddNewInwardModal(false)}
        onSuccess={refreshTable}
      />

      <EditInwardList
        open={editInwardModal}
        onClose={() => setEditInwardModal(false)}
         InwardId={editingInwardId}
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
              Do you really want to <span className="text-danger">delete</span> this Inward?
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
