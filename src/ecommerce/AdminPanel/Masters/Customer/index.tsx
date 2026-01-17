import { useState, useRef, useEffect, createRef } from "react";
import Button from "@/components/Base/Button";
import { FormInput } from "@/components/Base/Form";
import { createIcons, icons } from "lucide";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import AddCustomer from "./AddCustomer";
import EditCustomer from "./EditCustomer";
import "@/assets/css/vendors/tabulator.css";

function Main() {
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator>();

  const [filterValue, setFilterValue] = useState("");
  const filterValueRef = useRef(filterValue);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const [addCustomerModal, setAddCustomerModal] = useState(false);
  const [editCustomerModal, setEditCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);

  const [tableData, setTableData] = useState([
    { id: 1, Name: "username", Address: "", MobileNo: "", Email: "", GSTNo: "" },
    { id: 2, Name: "username", Address: "", MobileNo: "", Email: "", GSTNo: "" },
    { id: 3, Name: "username", Address: "", MobileNo: "", Email: "", GSTNo: "" },
  ]);

  useEffect(() => {
    filterValueRef.current = filterValue;
  }, [filterValue]);

  const initTabulator = () => {
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
        {
          title: "Sr.No",
          hozAlign: "center",
          formatter: "rownum",
          width: 80,
        },
        { title: "Name", field: "Name", minWidth: 180 },
        { title: "Address", field: "Address", minWidth: 200 },
        { title: "Mobile No", field: "MobileNo", minWidth: 150 },
        { title: "Email", field: "Email", minWidth: 200 },
        { title: "GST No", field: "GSTNo", minWidth: 150 },

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
            container.className = "flex justify-center gap-2";

            const rowData = cell.getRow().getData();

            const actions = [
              {
                label: "Edit",
                icon: "check-square",
                classes:
                  "bg-green-100 hover:bg-green-200 text-green-800",
                onClick: () => {
                  setEditingCustomer(rowData);
                  setEditCustomerModal(true);
                },
              },
              {
                label: "Delete",
                icon: "trash-2",
                classes:
                  "bg-red-100 hover:bg-red-200 text-red-800",
                onClick: () => {
                  if (confirm("Are you sure you want to delete this customer?")) {
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
      createIcons({
        icons,
        attrs: { "stroke-width": 1.5 },
        nameAttr: "data-lucide",
      });
    });
  };

  const refreshTable = () => {
    tabulator.current?.replaceData(tableData);
  };

  const handleFilterChange = (value: string) => {
    setFilterValue(value);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      if (!tabulator.current) return;

      const filtered = tableData.filter((row) =>
        row.Name.toLowerCase().includes(
          filterValueRef.current.toLowerCase()
        )
      );

      tabulator.current.replaceData(filtered);
    }, 300);
  };

  useEffect(() => {
    initTabulator();

    return () => {
      debounceTimeout.current &&
        clearTimeout(debounceTimeout.current);
    };
  }, [tableData]);

  return (
    <>
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-medium">Customer List</h2>
        <Button variant="primary" onClick={() => setAddCustomerModal(true)}>
          Add Customer
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


        <div className="overflow-x-auto">
          <div ref={tableRef}></div>
        </div>
      </div>

      <AddCustomer
        open={addCustomerModal}
        onClose={() => setAddCustomerModal(false)}
        onAddCustomer={(data: any) => {
          setTableData((prev) => [
            ...prev,
            { id: prev.length + 1, ...data },
          ]);
          refreshTable();
        }}
      />

      <EditCustomer
        open={editCustomerModal}
        onClose={() => setEditCustomerModal(false)}
        CustomerData={editingCustomer}
        onUpdateCustomer={(updated: any) => {
          setTableData((prev) =>
            prev.map((r) => (r.id === updated.id ? updated : r))
          );
          refreshTable();
        }}
      />
    </>
  );
}

export default Main;