import { useState, useRef, useEffect, createRef } from "react";
import Button from "@/components/Base/Button";
import { createIcons, icons } from "lucide";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import AddGrade from "./AddGrade";
import EditGrade from "./EditGrade";
import "@/assets/css/vendors/tabulator.css";
import { FormInput } from "@/components/Base/Form";

interface Grade {
  id: number;
  Name: string;
}

function Main() {
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator | null>(null);

  const [addNewGradeModal, setAddNewGradeModal] = useState(false);
  const [editGradeModal, setEditGradeModal] = useState(false);
  const [GradeToEdit, setGradeToEdit] = useState<Grade | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef(searchTerm);
  const [filterValue, setFilterValue] = useState("");
  const filterValueRef = useRef(filterValue);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const [GradetableData, setGradeTableData] = useState<Grade[]>([
    { id: 1, Name: "xyz" },
    { id: 2, Name: "abc" },
    { id: 3, Name: "qwe" },
  ]);

  useEffect(() => {
    searchRef.current = searchTerm;
  }, [searchTerm]);

  /* ================= TABULATOR INIT ================= */
  useEffect(() => {
    if (!tableRef.current) return;

    tabulator.current = new Tabulator(tableRef.current, {
      data: GradetableData,
      layout: "fitColumns",
      responsiveLayout: "collapse",
      placeholder: "No matching records found",
      pagination: true,
      paginationSize: 10,
      paginationSizeSelector: [10, 20, 30, 40],

      columns: [
        {
          title: "Sr.No",
          formatter: "rownum",
          width: 80,
          hozAlign: "center",
        },
        {
          title: "Name",
          field: "Name",
         minWidth: 200, hozAlign: "center", headerHozAlign: "center",
        },
        {
          title: "Actions",
          width: 180,
          hozAlign: "center",
          headerHozAlign: "center",
          formatter(cell) {
            const container = document.createElement("div");
            container.className = "flex justify-center items-center gap-2";

            const rowData: Grade = cell.getRow().getData();

            const actions = [
              {
                label: "Edit",
                icon: "check-square",
                classes: "bg-green-100 hover:bg-green-200 text-green-800",
                onClick: () => {
                  setGradeToEdit(rowData);
                  setEditGradeModal(true);
                },
              },
              {
                label: "Delete",
                icon: "trash-2",
                classes: "bg-red-100 hover:bg-red-200 text-red-800",
                onClick: () => {
                  if (confirm("Are you sure you want to delete this record?")) {
                    setGradeTableData((prev) =>
                      prev.filter((r) => r.id !== rowData.id)
                    );
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
      createIcons({
        icons,
        attrs: { "stroke-width": 1.5 },
        nameAttr: "data-lucide",
      });
    });

    return () => tabulator.current?.destroy();
  }, []);

  /* ================= SYNC DATA ================= */
  useEffect(() => {
    tabulator.current?.replaceData(GradetableData);
  }, [GradetableData]);

  /* ================= SEARCH ================= */
  const handleFilterChange = (value: string) => {
    setFilterValue(value);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      if (tabulator.current) {
        const filtered = GradetableData.filter((row) =>
          row.Name.toLowerCase().includes(filterValueRef.current.toLowerCase())
        );
        tabulator.current.replaceData(filtered);
      }
    }, 300);
  };


  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-medium">Grade Table</h2>
        <Button variant="primary" onClick={() => setAddNewGradeModal(true)}>
          Add Grade
        </Button>
      </div>

      {/* Search + Table */}
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

      {/* Modals */}
      <AddGrade
        open={addNewGradeModal}
        onClose={() => setAddNewGradeModal(false)}
        onAddGrade={(data) =>
          setGradeTableData((prev) => [
            ...prev,
            { id: prev.length + 1, ...data },
          ])
        }
      />

      <EditGrade
        open={editGradeModal}
        onClose={() => setEditGradeModal(false)}
        GradeData={GradeToEdit}
        onUpdateGrade={(data) =>
          setGradeTableData((prev) =>
            prev.map((row) => (row.id === data.id ? data : row))
          )
        }
      />
    </>
  );
}

export default Main;