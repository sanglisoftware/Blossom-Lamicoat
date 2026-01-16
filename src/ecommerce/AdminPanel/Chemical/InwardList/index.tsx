import { useState, useRef, useEffect, createRef } from "react";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { createIcons, icons } from "lucide";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import EditInwardList from "./EditInwardList";
import "@/assets/css/vendors/tabulator.css";

function Main() {
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator>();

  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef(searchTerm);

  const [editInwardlistModal, setEditInwardListModal] = useState(false);
  const [InwardToEdit, setInwardToEdit] = useState<any>(null);

  const [tableData, setTableData] = useState([
    { id: 1, Name: "PVC RESIN PAWDER", QTY: "", Supplier: "", Batch_No: "" },
    { id: 2, Name: "DOP P 80", QTY: "", Supplier: "", Batch_No: "" },
    { id: 3, Name: "CPW 52 AD", QTY: "", Supplier: "", Batch_No: "" },
  ]);

  useEffect(() => {
    searchRef.current = searchTerm;
  }, [searchTerm]);

  useEffect(() => {
    if (!tableRef.current) return;

    tabulator.current = new Tabulator(tableRef.current, {
      data: tableData,
      layout: "fitColumns",
      responsiveLayout: "collapse",
      pagination: true,
    paginationSize: 10,
    paginationSizeSelector: [10, 20, 30, 40],
      placeholder: "No matching records found",

      columns: [
        {
          title: "Sr.No",
          formatter: "rownum",
          hozAlign: "center",
          width: 80,
        },
        {
          title: "Chemical Name",
          field: "Name",
          minWidth: 200,
        },
        {
          title: "QTY",
          field: "QTY",
          minWidth: 120,
        },
        {
          title: "Supplier",
          field: "Supplier",
          minWidth: 180,
        },
        {
          title: "Batch No",
          field: "Batch_No",
          minWidth: 150,
        },
        {
  title: "Actions",
  hozAlign: "center",
  headerHozAlign: "center",
  minWidth: 180,
  formatter(cell) {
    const container = document.createElement("div");
    container.className = "flex justify-center items-center gap-2";

    const rowData = cell.getRow().getData();

    const actions = [
      {
        label: "Edit",
        icon: "edit",
        classes: "bg-green-100 hover:bg-green-200 text-green-800",
        onClick: () => {
          setInwardToEdit({
            id: rowData.id,
            ChemicalName: rowData.Name,
            QTY: rowData.QTY,
            Supplier: rowData.Supplier,
            Batch_No: rowData.Batch_No,
          });
          setEditInwardListModal(true);
        },
      },
      {
        label: "Delete",
        icon: "trash-2",
        classes: "bg-red-100 hover:bg-red-200 text-red-800",
        onClick: () => {
          if (confirm("Are you sure you want to delete this record?")) {
            setTableData((prev) =>
              prev.filter((r) => r.id !== rowData.id)
            );
          }
        },
      },
    ];

    actions.forEach(({ label, icon, classes, onClick }) => {
      const button = document.createElement("a");
      button.href = "javascript:;";
      button.className = `inline-flex items-center px-3 py-1.5 text-sm rounded-md ${classes}`;
      button.innerHTML = `<i data-lucide="${icon}" class="w-4 h-4 mr-1"></i>${label}`;

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
      createIcons({ icons, attrs: { "stroke-width": 1.5 } });
    });
  }, [tableData]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (tabulator.current) {
      tabulator.current.setFilter("Name", "like", value);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center mt-8">
        <h2 className="mr-auto text-lg font-medium">Chemical Table</h2>
      </div>

      {/* Table Box */}
      <div className="p-5 mt-5 box">
        <div className="flex items-center gap-2 mb-3">
          <FormLabel>Search:</FormLabel>
          <FormInput
            type="text"
            placeholder="Enter chemical name..."
            className="w-64"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <div ref={tableRef}></div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditInwardList
        open={editInwardlistModal}
        onClose={() => setEditInwardListModal(false)}
        chemicalData={InwardToEdit}
        onUpdateInward={(updated) => {
          setTableData((prev) =>
            prev.map((row) =>
              row.id === updated.id
                ? {
                    id: updated.id,
                    Name: updated.ChemicalName,
                    QTY: updated.QTY,
                    Supplier: updated.Supplier,
                    Batch_No: updated.Batch_No,
                  }
                : row
            )
          );
        }}
      />
    </>
  );
}

export default Main;