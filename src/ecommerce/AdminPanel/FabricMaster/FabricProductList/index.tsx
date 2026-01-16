import { useState, useRef, useEffect, createRef } from "react";
import Button from "@/components/Base/Button";
import "@/assets/css/vendors/tabulator.css";
import { createIcons, icons } from "lucide";
import { TabulatorFull as Tabulator } from "tabulator-tables";

import AddProductList from "./AddProductList";
import EditProductList from "./EditProductList";
import { FormInput } from "@/components/Base/Form";

function Main() {
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator | null>(null);


  const [filterValue, setFilterValue] = useState("");
  const filterValueRef = useRef(filterValue);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const [addNewFabricModal, setAddNewFabricModal] = useState(false);
  const [editFabricModal, setEditFabricModal] = useState(false);
  const [fabricToEdit, setFabricToEdit] = useState<any>(null);

  const [fabricTableData, setFabricTableData] = useState([
    {
      id: 1,
      name: "Fabric A",
      grm: "200",
      colour: "Red",
      comments: "Sample",
    },
    {
      id: 2,
      name: "Fabric B",
      grm: "300",
      colour: "Blue",
      comments: "Test",
    },
  ]);

  useEffect(() => {
    if (!tableRef.current) return;

    tabulator.current = new Tabulator(tableRef.current, {
      data: fabricTableData,
      layout: "fitColumns",
      responsiveLayout: false,
      pagination: true,
      paginationSize: 10,
      paginationSizeSelector: [10, 20, 30, 40],
      columns: [
        { title: "Sr.No", formatter: "rownum", width: 80 },
        { title: "Name", field: "name" },
        { title: "GRM", field: "grm" },
        { title: "Colour", field: "colour" },
        { title: "Comment", field: "comments" },
        {
          title: "Action",
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
                  setFabricToEdit(rowData);
                  setEditFabricModal(true);
                },
              },
              {
                label: "Delete",
                icon: "trash-2",
                classes:
                  "bg-red-100 hover:bg-red-200 text-red-800",
                onClick: () => {
                  if (
                    confirm("Are you sure you want to delete this fabric?")
                  ) {
                    setFabricTableData((prev) =>
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
    tabulator.current?.replaceData(fabricTableData);
  }, [fabricTableData]);

  const handleAddFabric = (data: {
    name: string;
    grm: string;
    colour: string;
    comments: string;
  }) => {
    setFabricTableData((prev) => [...prev, { id: prev.length + 1, ...data }]);
  };


  const handleUpdateFabric = (data: {
    id: number;
    name: string;
    grm: string;
    colour: string;
    comments: string;
  }) => {
    setFabricTableData((prev) =>
      prev.map((row) => (row.id === data.id ? data : row))
    );
  };
const handleFilterChange = (value: string) => {
    setFilterValue(value);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      if (tabulator.current) {
        const filtered = fabricTableData.filter((row) =>
          row.name.toLowerCase().includes(filterValueRef.current.toLowerCase())
        );
        tabulator.current.replaceData(filtered);
      }
    }, 300);
  };

  return (
    <>
      <div className="flex items-center mt-8">
        <h2 className="mr-auto text-lg font-medium">Fabric Product List</h2>
        <Button
          variant="primary"
          className="shadow-md"
          onClick={() => setAddNewFabricModal(true)}
        >
          Add Unit
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

      <AddProductList
        open={addNewFabricModal}
        onClose={() => setAddNewFabricModal(false)}
        onAddPVCProduct={handleAddFabric}
      />

      <EditProductList
        open={editFabricModal}
        onClose={() => setEditFabricModal(false)}
        PVCProductData={fabricToEdit}
        onUpdatePVCProduct={handleUpdateFabric}
      />
    </>
  );
}

export default Main;