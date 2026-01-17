import { useState, useRef, useEffect, createRef } from "react";
import Button from "@/components/Base/Button";
import { FormInput } from "@/components/Base/Form";
import { createIcons, icons } from "lucide";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "@/assets/css/vendors/tabulator.css";

import AddSupplier from "./AddSupplier";
import EditSupplier from "./EditSupplier";

function Main() {
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator>();

  const [filterValue, setFilterValue] = useState("");
  const filterValueRef = useRef(filterValue);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const [addNewSupplierModal, setAddNewSupplierModal] = useState(false);
  const [editSupplierModal, setEditSupplierModal] = useState(false);
  const [SupplierToEdit, setSupplierToEdit] = useState<any>(null);

  const [tableData, setTableData] = useState([
    { id: 1, Name: "username", Address: "", MobileNo: "", PAN: "", GSTNo: "" },
    { id: 2, Name: "username", Address: "", MobileNo: "", PAN: "", GSTNo: "" },
    { id: 3, Name: "username", Address: "", MobileNo: "", PAN: "", GSTNo: "" },
  ]);

  useEffect(() => {
    filterValueRef.current = filterValue;
  }, [filterValue]);

  /* ================= TABULATOR INIT ================= */
  useEffect(() => {
    if (!tableRef.current) return;

    tabulator.current = new Tabulator(tableRef.current, {
      data: tableData,
      layout: "fitColumns",
      responsiveLayout: "collapse",
      placeholder: "No matching records found",

      pagination: true,
      paginationSize: 10,
      paginationSizeSelector: [10, 20, 30, 40],

      columns: [
        { title: "Sr.No", formatter: "rownum", hozAlign: "center", width: 80 },
        { title: "Name", field: "Name", minWidth: 180 },
        { title: "Address", field: "Address", minWidth: 200 },
        { title: "Mobile No", field: "MobileNo", minWidth: 150 },
        { title: "PAN", field: "PAN", minWidth: 150 },
        { title: "GST No", field: "GSTNo", minWidth: 150 },

        {
          title: "ACTIONS",
          hozAlign: "center",
          headerHozAlign: "center",
          minWidth: 180,
          formatter(cell) {
            const container = document.createElement("div");
            container.className = "flex justify-center items-center gap-2";

            const rowData = cell.getRow().getData() as any;

            const actions = [
              {
                label: "Edit",
                icon: "check-square",
                classes:
                  "bg-green-100 hover:bg-green-200 text-green-800",
                onClick: () => {
                  setSupplierToEdit(rowData);
                  setEditSupplierModal(true);
                },
              },
              {
                label: "Delete",
                icon: "trash-2",
                classes:
                  "bg-red-100 hover:bg-red-200 text-red-800",
                onClick: () => {
                  if (confirm("Are you sure you want to delete this supplier?")) {
                    setTableData((prev) =>
                      prev.filter((r) => r.id !== rowData.id)
                    );
                  }
                },
              },
            ];

            actions.forEach(({ label, icon, classes, onClick }) => {
              const btn = document.createElement("a");
              btn.href = "javascript:;";
              btn.className = `inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${classes}`;
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
      createIcons({
        icons,
        attrs: { "stroke-width": 1.5 },
        nameAttr: "data-lucide",
      });
    });

    return () => {
      tabulator.current?.destroy();
    };
  }, []);

  /* ================= DATA REFRESH ================= */
  useEffect(() => {
    tabulator.current?.replaceData(tableData);
  }, [tableData]);

  /* ================= SEARCH ================= */
  const handleFilterChange = (value: string) => {
    setFilterValue(value);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      const filtered = tableData.filter((row) =>
        row.Name.toLowerCase().includes(filterValueRef.current.toLowerCase())
      );
      tabulator.current?.replaceData(filtered);
    }, 300);
  };

  return (
    <>
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-medium">Supplier List</h2>
        <Button variant="primary" onClick={() => setAddNewSupplierModal(true)}>
          Add Supplier
        </Button>
      </div>

      <div className="p-5 box">
       
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


        <div ref={tableRef} />
      </div>

      {/* MODALS */}
      <AddSupplier
        open={addNewSupplierModal}
        onClose={() => setAddNewSupplierModal(false)}
        onAddSupplier={(data: any) =>
          setTableData((prev) => [...prev, { id: prev.length + 1, ...data }])
        }
      />

      <EditSupplier
        open={editSupplierModal}
        onClose={() => setEditSupplierModal(false)}
        SupplierData={SupplierToEdit}
        onUpdateSupplier={(updated: any) =>
          setTableData((prev) =>
            prev.map((r) => (r.id === updated.id ? updated : r))
          )
        }
      />
    </>
  );
}

export default Main;