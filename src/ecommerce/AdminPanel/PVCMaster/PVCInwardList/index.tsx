import { useState, useRef, useEffect, createRef } from "react";
import Button from "@/components/Base/Button";
import "@/assets/css/vendors/tabulator.css";
import { createIcons, icons } from "lucide";
import { TabulatorFull as Tabulator } from "tabulator-tables";

import CreatePVCInward from "./CreatePVCInward";
import EditPVCInward from "./EditPVCInward";
import { FormInput } from "@/components/Base/Form";

function Main() {
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator | null>(null);

    const [filterValue, setFilterValue] = useState("");
  const filterValueRef = useRef(filterValue);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [PVCToEdit, setPVCToEdit] = useState<any>(null);

  const [PVCData, setPVCData] = useState([
    {
      id: 1,
      supplier: "Supplier A",
      pvc: "PVC-20",
      newRollNo: "R001",
      batchNo: "B001",
      qtyKG: "200",
      qtyMTR: "50",
      comments: "Sample",
    },
    {
      id: 2,
      supplier: "Supplier B",
      pvc: "PVC-25",
      newRollNo: "R002",
      batchNo: "B002",
      qtyKG: "300",
      qtyMTR: "60",
      comments: "Test",
    },
  ]);

  useEffect(() => {
    if (!tableRef.current) return;

    tabulator.current = new Tabulator(tableRef.current, {
      data: PVCData,
      layout: "fitColumns",
      responsiveLayout: false,
      pagination: true,
      paginationSize: 10,
      paginationSizeSelector: [10, 20, 30, 40],
     
      columns: [
        { title: "Sr.No", formatter: "rownum", width: 80 },
        { title: "Supplier", field: "supplier" },
        { title: "PVC", field: "pvc" },
        { title: "New Roll No", field: "newRollNo" },
        { title: "Batch No", field: "batchNo" },
        { title: "QTY KG", field: "qtyKG" },
        { title: "QTY MTR", field: "qtyMTR" },
        { title: "Comments", field: "comments" },
        {
          title: "Actions",
          width: 200,
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
                  setPVCToEdit(rowData);
                  setEditModal(true);
                },
              },
              {
                label: "Delete",
                icon: "trash-2",
                classes:
                  "bg-red-100 hover:bg-red-200 text-red-800",
                onClick: () => {
                  if (
                    confirm("Are you sure you want to delete this PVC?")
                  ) {
                    setPVCData((prev) =>
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

    return () => tabulator.current?.destroy();
  }, []);

 
  useEffect(() => {
    tabulator.current?.replaceData(PVCData);
  }, [PVCData]);

 
  const handleAdd = (data: any) => {
    setPVCData((prev) => [...prev, { id: prev.length + 1, ...data }]);
  };

  const handleUpdate = (data: any) => {
    setPVCData((prev) =>
      prev.map((row) => (row.id === data.id ? data : row))
    );
  };


  useEffect(() => {
    tabulator.current?.replaceData(PVCData);
  }, [PVCData]);


  const handleFilterChange = (value: string) => {
    setFilterValue(value);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      if (tabulator.current) {
        const filtered = PVCData.filter((row) =>
          row.supplier.toLowerCase().includes(filterValueRef.current.toLowerCase())
        );
        tabulator.current.replaceData(filtered);
      }
    }, 300);
  };

  return (
    <>
      <div className="flex items-center mt-8">
        <h2 className="mr-auto text-lg font-medium">PVC Inward Table</h2>
        <Button
          variant="primary"
          className="shadow-md"
          onClick={() => setAddModal(true)}
        >
          Add PVC
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

      <CreatePVCInward
        open={addModal}
        onClose={() => setAddModal(false)}
        onAddPVCProduct={handleAdd}
      />

      <EditPVCInward
        open={editModal}
        onClose={() => setEditModal(false)}
        data={PVCToEdit}
        onUpdate={handleUpdate}
      />
    </>
  );
}

export default Main;