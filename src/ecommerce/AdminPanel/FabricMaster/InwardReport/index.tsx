import { useState, useRef, useEffect, createRef } from "react";
import { FormInput } from "@/components/Base/Form";
import { createIcons, icons } from "lucide";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import EditInwardReport from "./EditInwardReport";
import "@/assets/css/vendors/tabulator.css";

interface PVCInward {
  id: number;
  fabric: string;
  qty: string;
  batchNo: string;
  comments: string;
}

function Main() {
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator | null>(null);

  const [editPVCProductModal, setEditPVCProductModal] = useState(false);
  const [PVCProductToEdit, setPVCProductToEdit] = useState<PVCInward | null>(null);

  const [filterValue, setFilterValue] = useState("");
  const filterValueRef = useRef(filterValue);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const [PVCProductTableData, setPVCProductTableData] = useState<PVCInward[]>([
    { id: 1, fabric: "PVC", qty: "500", batchNo: "B-101", comments: "First inward" },
    { id: 2, fabric: "DOC", qty: "300", batchNo: "B-102", comments: "Second inward" },
  ]);


  useEffect(() => {
    filterValueRef.current = filterValue;
  }, [filterValue]);

 
  useEffect(() => {
    if (!tableRef.current) return;

    tabulator.current = new Tabulator(tableRef.current, {
      data: PVCProductTableData,
      layout: "fitColumns",
      responsiveLayout: false,
      placeholder: "No matching records found",
      pagination: true,
      paginationSize: 10,
      paginationSizeSelector: [10, 20, 30, 40],
      columns: [
        { title: "Sr.No", formatter: "rownum", width: 80, hozAlign: "center", headerHozAlign: "center" },
        { title: "Fabric", field: "fabric", hozAlign: "center", headerHozAlign: "center" },
        { title: "Qty", field: "qty", hozAlign: "center", headerHozAlign: "center" },
        { title: "Batch No", field: "batchNo", hozAlign: "center", headerHozAlign: "center" },
        { title: "Comments", field: "comments", hozAlign: "center", headerHozAlign: "center" },
        {
          title: "Action",
          width: 180,
          formatter(cell) {
            const container = document.createElement("div");
            container.className = "flex justify-center items-center gap-2";

            const rowData: PVCInward = cell.getRow().getData();

            const actions = [
              {
                label: "Edit",
                icon: "check-square",
                classes: "bg-green-100 hover:bg-green-200 text-green-800",
                onClick: () => {
                  setPVCProductToEdit(rowData);
                  setEditPVCProductModal(true);
                },
              },
              {
                label: "Delete",
                icon: "trash-2",
                classes: "bg-red-100 hover:bg-red-200 text-red-800",
                onClick: () => {
                  if (confirm("Are you sure you want to delete this record?")) {
                    setPVCProductTableData((prev) => prev.filter((r) => r.id !== rowData.id));
                  }
                },
              },
            ];

            actions.forEach(({ label, icon, classes, onClick }) => {
              const button = document.createElement("a");
              button.href = "javascript:;";
              button.className = `inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${classes}`;
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

    return () => tabulator.current?.destroy();
  }, []);


  useEffect(() => {
    tabulator.current?.replaceData(PVCProductTableData);
  }, [PVCProductTableData]);


  const handleFilterChange = (value: string) => {
    setFilterValue(value);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      if (tabulator.current) {
        const filtered = PVCProductTableData.filter((row) =>
          row.fabric.toLowerCase().includes(filterValueRef.current.toLowerCase())
        );
        tabulator.current.replaceData(filtered);
      }
    }, 300);
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center mt-8 mb-4">
        <h2 className="text-lg font-medium">Inward Report</h2>
      </div>

      <div className="p-5 box">
   
        <div className="flex items-center mb-3">
          <span className="mr-2 font-medium">Search:</span>
          <FormInput
            type="text"
            placeholder="Search fabric..."
            className="w-64"
            value={filterValue}
            onChange={(e) => handleFilterChange(e.target.value)}
          />
        </div>

       
        <div className="overflow-x-auto">
          <div ref={tableRef} className="mt-5"></div>
        </div>
      </div>

  
      <EditInwardReport
        open={editPVCProductModal}
        onClose={() => setEditPVCProductModal(false)}
        PVCProductData={PVCProductToEdit}
        onUpdatePVCProduct={(data: PVCInward) => {
          setPVCProductTableData((prev) =>
            prev.map((row) => (row.id === data.id ? data : row))
          );
        }}
      />
    </>
  );
}

export default Main;