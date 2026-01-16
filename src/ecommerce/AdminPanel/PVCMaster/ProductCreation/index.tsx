import { useState, useRef, useEffect, createRef } from "react";
import Button from "@/components/Base/Button";
import "@/assets/css/vendors/tabulator.css";
import { createIcons, icons } from "lucide";
import { TabulatorFull as Tabulator } from "tabulator-tables";

import AddProduct from "./AddProduct";
import EditProduct from "./EditProduct";
import { FormInput } from "@/components/Base/Form";

function Main() {
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator | null>(null);

   const [filterValue, setFilterValue] = useState("");
  const filterValueRef = useRef(filterValue);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const [addNewPVCProductModal, setAddNewPVCProductModal] = useState(false);
  const [editPVCProductModal, setEditPVCProductModal] = useState(false);
  const [PVCProductToEdit, setPVCProductToEdit] = useState<any>(null);

  const [PVCProductTableData, setPVCProductTableData] = useState([
    {
      id: 1,
      name: "Product A",
      grm: "200",
      pvcProduct: "20 inch",
      colour: "Red",
      comments: "Sample",
    },
    {
      id: 2,
      name: "Product B",
      grm: "300",
      pvcProduct: "25 inch",
      colour: "Blue",
      comments: "Test",
    },
  ]);

  useEffect(() => {
    if (!tableRef.current) return;

    tabulator.current = new Tabulator(tableRef.current, {
      data: PVCProductTableData,
      layout: "fitColumns",
      responsiveLayout: false,
      pagination: true,
      paginationSize: 10,
      paginationSizeSelector: [10, 20, 30, 40],
     
      columns: [
        {
          title: "Sr.No",
          formatter: "rownum",
          width: 80,
        },
        { title: "Name", field: "name" },
        { title: "Gramage", field: "grm" },
        { title: "Width", field: "pvcProduct" },
        { title: "Colour", field: "colour" },
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
                  setPVCProductToEdit(rowData);
                  setEditPVCProductModal(true);
                },
              },
              {
                label: "Delete",
                icon: "trash-2",
                classes:
                  "bg-red-100 hover:bg-red-200 text-red-800",
                onClick: () => {
                  if (
                    confirm(
                      "Are you sure you want to delete this product?"
                    )
                  ) {
                    setPVCProductTableData((prev) =>
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
    tabulator.current?.replaceData(PVCProductTableData);
  }, [PVCProductTableData]);

  const handleAddPVCProduct = (data: {
    name: string;
    grm: string;
    pvcProduct: string;
    colour: string;
    comments: string;
  }) => {
    setPVCProductTableData((prev) => [
      ...prev,
      { id: prev.length + 1, ...data },
    ]);
  };

  const handleUpdatePVCProduct = (data: {
    id: number;
    name: string;
    grm: string;
    pvcProduct: string;
    colour: string;
    comments: string;
  }) => {
    setPVCProductTableData((prev) =>
      prev.map((row) => (row.id === data.id ? data : row))
    );
  };


  const handleFilterChange = (value: string) => {
    setFilterValue(value);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      if (tabulator.current) {
        const filtered = PVCProductTableData.filter((row) =>
          row.name.toLowerCase().includes(filterValueRef.current.toLowerCase())
        );
        tabulator.current.replaceData(filtered);
      }
    }, 300);
  };
  return (
    <>
      <div className="flex items-center mt-8">
        <h2 className="mr-auto text-lg font-medium">
          PVC Product Table
        </h2>
        <Button
          variant="primary"
          className="shadow-md"
          onClick={() => setAddNewPVCProductModal(true)}
        >
          Add Product
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

      <AddProduct
        open={addNewPVCProductModal}
        onClose={() => setAddNewPVCProductModal(false)}
        onAddPVCProduct={handleAddPVCProduct}
      />

      <EditProduct
        open={editPVCProductModal}
        onClose={() => setEditPVCProductModal(false)}
        PVCProductData={PVCProductToEdit}
        onUpdatePVCProduct={handleUpdatePVCProduct}
      />
    </>
  );
}

export default Main;