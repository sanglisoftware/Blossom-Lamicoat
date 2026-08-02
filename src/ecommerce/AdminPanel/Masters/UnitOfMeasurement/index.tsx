import { createRef, useEffect, useRef, useState } from "react";
import axios from "axios";
import { createIcons, icons } from "lucide";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import Lucide from "@/components/Base/Lucide";
import "@/assets/css/vendors/tabulator.css";
import { BASE_URL } from "@/ecommerce/config/config";

type UnitOfMeasurement = {
  id: number;
  name: string;
  isActive?: number | boolean | null;
};

const emptyForm = {
  id: 0,
  name: "",
  isActive: 1,
};

function Main() {
  const token = localStorage.getItem("token");
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator | null>(null);
  const deleteButtonRef = useRef(null);

  const [tableData, setTableData] = useState<UnitOfMeasurement[]>([]);
  const [filterValue, setFilterValue] = useState("");
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [deleteUnitId, setDeleteUnitId] = useState<number | null>(null);

  const isEditing = formData.id > 0;

  const fetchUnits = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/unitofmeasurement?page=1&size=1000`,
        { headers: { Authorization: token ? `Bearer ${token}` : "" } }
      );
      setTableData(response.data?.items ?? response.data?.Items ?? []);
    } catch (error) {
      console.error("Error fetching unit of measurement:", error);
    }
  };

  const openCreateModal = () => {
    setFormData(emptyForm);
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEditModal = (unit: UnitOfMeasurement) => {
    setFormData({
      id: unit.id,
      name: unit.name ?? "",
      isActive: Number(unit.isActive ?? 1),
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setIsFormOpen(false);
    setFormData(emptyForm);
    setFormErrors({});
  };

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Unit name is required";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload = {
      id: formData.id,
      name: formData.name.trim(),
      isActive: formData.isActive,
    };

    try {
      if (isEditing) {
        await axios.put(
          `${BASE_URL}/api/unitofmeasurement/${formData.id}`,
          payload,
          { headers: { Authorization: token ? `Bearer ${token}` : "" } }
        );
      } else {
        await axios.post(`${BASE_URL}/api/unitofmeasurement`, payload, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
      }

      closeFormModal();
      await fetchUnits();
    } catch (error: any) {
      console.error("Unit save error:", error);
      alert(error.response?.data?.detail || "Unable to save unit");
    }
  };

  const handleDelete = async () => {
    if (!deleteUnitId) return;

    try {
      await axios.delete(`${BASE_URL}/api/unitofmeasurement/${deleteUnitId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      setDeleteConfirmationModal(false);
      setDeleteUnitId(null);
      await fetchUnits();
    } catch (error: any) {
      console.error("Unit delete error:", error);
      alert(error.response?.data?.detail || "Unable to delete unit");
    }
  };

  useEffect(() => {
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
        {
          title: "Sr.No",
          formatter: "rownum",
          width: 80,
          hozAlign: "center",
          headerHozAlign: "center",
        },
        {
          title: "Unit Name",
          field: "name",
          minWidth: 220,
          hozAlign: "center",
          headerHozAlign: "center",
        },
        {
          title: "Actions",
          field: "actions",
          minWidth: 150,
          hozAlign: "center",
          headerHozAlign: "center",
          formatter: (cell) => {
            const container = document.createElement("div");
            container.className = "flex justify-center items-center gap-2";
            const rowData = cell.getRow().getData() as UnitOfMeasurement;

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className =
              "inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-green-100 hover:bg-green-200 text-green-800";
            editButton.innerHTML =
              '<i data-lucide="check-square" class="w-4 h-4 mr-1"></i> Edit';
            editButton.addEventListener("click", (event) => {
              event.stopPropagation();
              openEditModal(rowData);
            });

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className =
              "inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-red-100 hover:bg-red-200 text-red-800";
            deleteButton.innerHTML =
              '<i data-lucide="trash-2" class="w-4 h-4 mr-1"></i> Delete';
            deleteButton.addEventListener("click", (event) => {
              event.stopPropagation();
              setDeleteUnitId(rowData.id);
              setDeleteConfirmationModal(true);
            });

            container.appendChild(editButton);
            container.appendChild(deleteButton);
            return container;
          },
        },
      ],
    });

    tabulator.current.on("renderComplete", () => {
      createIcons({ icons, attrs: { "stroke-width": 1.5 }, nameAttr: "data-lucide" });
    });

    void fetchUnits();

    return () => {
      tabulator.current?.destroy();
      tabulator.current = null;
    };
  }, []);

  useEffect(() => {
    const term = filterValue.trim().toLowerCase();
    const filtered = term
      ? tableData.filter((unit) =>
          [unit.name].some((value) =>
            String(value ?? "").toLowerCase().includes(term)
          )
        )
      : tableData;

    tabulator.current?.setData(filtered);
  }, [tableData, filterValue]);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center mt-8 mb-4">
        <h2 className="mr-auto text-lg font-medium">Unit Of Measurement Table</h2>
        <Button variant="primary" onClick={openCreateModal}>
          Add Unit
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
            onChange={(e) => setFilterValue(e.target.value)}
          />
        </div>

        <div ref={tableRef}></div>
      </div>

      <Dialog open={isFormOpen} onClose={closeFormModal} staticBackdrop size="md">
        <Dialog.Panel>
          <Dialog.Title>
            <h2 className="text-base font-medium">
              {isEditing ? "Edit Unit" : "Create New Unit"}
            </h2>
          </Dialog.Title>

          <Dialog.Description className="space-y-4">
            <div>
              <FormLabel>Unit Name</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter unit name"
                value={formData.name}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData((prev) => ({ ...prev, name: value }));
                  if (value.trim()) {
                    setFormErrors((prev) => ({ ...prev, name: "" }));
                  }
                }}
              />
              {formErrors.name && (
                <p className="text-sm text-red-500">{formErrors.name}</p>
              )}
            </div>
          </Dialog.Description>

          <Dialog.Footer>
            <Button
              type="button"
              variant="secondary"
              className="w-24 mr-2"
              onClick={closeFormModal}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              className="w-24"
              onClick={handleSubmit}
            >
              {isEditing ? "Update" : "Add"}
            </Button>
          </Dialog.Footer>
        </Dialog.Panel>
      </Dialog>

      <Dialog
        open={deleteConfirmationModal}
        onClose={() => setDeleteConfirmationModal(false)}
        initialFocus={deleteButtonRef}
      >
        <Dialog.Panel>
          <div className="p-5 text-center">
            <Lucide icon="XCircle" className="w-16 h-16 mx-auto mt-3 text-danger" />
            <div className="mt-5 text-3xl">Are you sure?</div>
            <div className="mt-2 text-slate-500">
              Do you really want to delete this unit?
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
              onClick={handleDelete}
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
