import _, { set } from "lodash";
import clsx from "clsx";
import { useState, useRef } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel, FormSelect, FormSwitch, } from "@/components/Base/Form";
import Lucide from "@/components/Base/Lucide";
import { Dialog, Menu } from "@/components/Base/Headless";
import "@/assets/css/vendors/tabulator.css";
import * as xlsx from "xlsx";
import { useEffect, createRef } from "react";
import { createIcons, icons } from "lucide";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import axios from "axios";
import SuccessModal from "../CommonModals/SuccessModal/SuccessModal";
import { SuccessModalConfig } from "../CommonModals/SuccessModal/SuccessModalConfig";
import { BASE_URL } from "@/ecommerce/config/config";



function Main() {

  const token = localStorage.getItem("token");

  const dummySize = ["M", "S", "XL", "L", "XXL", "XS"];
  const [addNewSizeModalPreview, setAddNewSizeModalPreview] = useState(false);
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const deleteButtonRef = useRef(null);

  //Success Modal config
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalConfig, setSuccessModalConfig] = useState<SuccessModalConfig>({
    title: "",
    subtitle: "",
    icon: "CheckCircle",
    buttonText: "OK",
    onButtonClick: () => { }
  });

  //Add New Size Modal (useState)
  const [formData, setFormData] = useState({
    productSize: ""
  })

  //Validation Errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  //Form Submission: Save button click
  const handleSubmit = async () => {
    const errors: Record<string, string> = {};
    if (!formData.productSize) errors.productSize = "Product Size required.";
    //setting errors
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    //API CALL
    try {
      const payload = { sizeValue: formData.productSize };
      const response = await axios.post(
        `${BASE_URL}/api/sizes`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 200 || response.status === 201) {
        setFormData({ productSize: "" });
        setAddNewSizeModalPreview(false);
        //success modal
        setSuccessModalConfig({
          title: "Size Added Successfully",
          subtitle: "The new product size has been saved to the system.",
          icon: "CheckCircle",
          buttonText: "Ok",
          onButtonClick: () => {
            setIsSuccessModalOpen(false);
          }
        });
        setIsSuccessModalOpen(true);
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      alert(error.response?.data?.message || "Something went wrong.");
    }
  }

  //Delete Size Handler
  const handleDeleteSize = () => {
    alert("Size Deletd Sucessfully!");
    setDeleteConfirmationModal(false);
  }


  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator>();
  const [filter, setFilter] = useState({
    field: "name",
    type: "like",
    value: "",
  });

  const initTabulator = () => {
    if (tableRef.current) {
      tabulator.current = new Tabulator(tableRef.current, {
        ajaxURL: "https://midone-api.vercel.app/",
        paginationMode: "remote",
        filterMode: "remote",
        sortMode: "remote",
        printAsHtml: true,
        printStyled: true,
        pagination: true,
        //paginationSize: 10,
        paginationSize: 5,
        paginationSizeSelector: [5, 10, 20, 30, 40],
        layout: "fitColumns",
        responsiveLayout: "collapse",
        placeholder: "No matching records found",
        columns: [
          {
            title: "",
            formatter: "responsiveCollapse",
            width: 40,
            minWidth: 30,
            hozAlign: "center",
            resizable: false,
            headerSort: false,
          },
          {
            title: "ID",
            minWidth: 200,
            responsive: 0,
            field: "ID",
            vertAlign: "middle",
            print: false,
            download: false,
            formatter(cell) {
              const response: any = cell.getData();
              return `<div>
                  <div class="font-medium whitespace-nowrap">${response.id}</div>
                </div>`;
            },
          },
          {
            title: "SIZE",
            minWidth: 200,
            responsive: 0,
            field: "name",
            vertAlign: "middle",
            print: false,
            download: false,
            formatter(cell) {
              const response: any = cell.getData();
              return `<div>
                  <div class="font-medium whitespace-nowrap">${dummySize[0]}</div>
                </div>`;
            },
          },
          {
            title: "STATUS",
            minWidth: 200,
            field: "status",
            hozAlign: "center",
            headerHozAlign: "center",
            vertAlign: "middle",
            print: false,
            download: false,
            formatter(cell) {
              const response: any = cell.getData();
              return `<input ${response.id % 2 == 0 ? "checked" : ""
                } onchange='document.querySelector("#ihVal").value="${response.name
                }";document.querySelector("#btn").click();' id="checkbox-switch-7" type="checkbox" class="transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&amp;[type='radio']]:checked:bg-primary [&amp;[type='radio']]:checked:border-primary [&amp;[type='radio']]:checked:border-opacity-10 [&amp;[type='checkbox']]:checked:bg-primary [&amp;[type='checkbox']]:checked:border-primary [&amp;[type='checkbox']]:checked:border-opacity-10 [&amp;:disabled:not(:checked)]:bg-slate-100 [&amp;:disabled:not(:checked)]:cursor-not-allowed [&amp;:disabled:not(:checked)]:dark:bg-darkmode-800/50 [&amp;:disabled:checked]:opacity-70 [&amp;:disabled:checked]:cursor-not-allowed [&amp;:disabled:checked]:dark:bg-darkmode-800/50 w-[38px] h-[24px] p-px rounded-full relative before:w-[20px] before:h-[20px] before:shadow-[1px_1px_3px_rgba(0,0,0,0.25)] before:transition-[margin-left] before:duration-200 before:ease-in-out before:absolute before:inset-y-0 before:my-auto before:rounded-full before:dark:bg-darkmode-600 checked:bg-primary checked:border-primary checked:bg-none before:checked:ml-[14px] before:checked:bg-white">`;
            },
          },
          {
            title: "ACTIONS",
            minWidth: 200,
            field: "actions",
            responsive: 1,
            hozAlign: "center",
            headerHozAlign: "center",
            vertAlign: "middle",
            print: false,
            download: false,
            formatter(cell) {
              const container = document.createElement("div");
              container.className = "flex lg:justify-center items-center gap-2";

              const actions = [
                {
                  label: "Edit",
                  icon: "check-square",
                  action: "edit",
                  classes: "bg-green-100 hover:bg-green-200 text-green-800",
                  onClick: () => {
                    const rowData = cell.getRow().getData();
                    console.log("Edit clicked:", rowData);
                    alert("Update Collection Modal Form");
                  },
                },
                {
                  label: "Delete",
                  icon: "trash-2",
                  action: "delete",
                  classes: "bg-red-100 hover:bg-red-200 text-red-800",
                  onClick: () => {
                    const rowData = cell.getRow().getData();
                    console.log("Delete clicked:", rowData);
                    setDeleteConfirmationModal(true);
                  },
                },
              ];

              actions.forEach(({ label, icon, classes, onClick }) => {
                const button = document.createElement("a");
                button.href = "javascript:;";
                button.className = `action-btn inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${classes} transition-colors`;
                button.innerHTML = `<i data-lucide="${icon}" class="w-4 h-4 mr-1"></i> ${label}`;
                button.addEventListener("click", (e) => {
                  e.stopPropagation();
                  onClick();
                });
                container.appendChild(button);
              });
              return container;
            }
          },

          // For print format
          {
            title: "CATEGORY NAME",
            field: "name",
            visible: false,
            print: true,
            download: true,
          },
          {
            title: "CATEGORY",
            field: "category",
            visible: false,
            print: true,
            download: true,
          },
          {
            title: "REMAINING STOCK",
            field: "remaining_stock",
            visible: false,
            print: true,
            download: true,
          },
          {
            title: "STATUS",
            field: "status",
            visible: false,
            print: true,
            download: true,
            formatterPrint(cell) {
              return cell.getValue() ? "Active" : "Inactive";
            },
          },
          {
            title: "IMAGE 1",
            field: "images",
            visible: false,
            print: true,
            download: true,
            formatterPrint(cell) {
              return cell.getValue()[0];
            },
          },
          {
            title: "IMAGE 2",
            field: "images",
            visible: false,
            print: true,
            download: true,
            formatterPrint(cell) {
              return cell.getValue()[1];
            },
          },
          {
            title: "IMAGE 3",
            field: "images",
            visible: false,
            print: true,
            download: true,
            formatterPrint(cell) {
              return cell.getValue()[2];
            },
          },
        ],
      });
    }

    tabulator.current?.on("renderComplete", () => {
      createIcons({
        icons,
        attrs: {
          "stroke-width": 1.5,
        },
        nameAttr: "data-lucide",
      });
    });
  };

  // Redraw table onresize
  const reInitOnResizeWindow = () => {
    window.addEventListener("resize", () => {
      if (tabulator.current) {
        tabulator.current.redraw();
        createIcons({
          icons,
          attrs: {
            "stroke-width": 1.5,
          },
          nameAttr: "data-lucide",
        });
      }
    });
  };

  // Filter function
  const onFilter = () => {
    if (tabulator.current) {
      tabulator.current.setFilter(filter.field, filter.type, filter.value);
    }
  };

  // On reset filter
  const onResetFilter = () => {
    setFilter({
      ...filter,
      field: "name",
      type: "like",
      value: "",
    });
    onFilter();
  };

  // Export
  const onExportCsv = () => {
    if (tabulator.current) {
      tabulator.current.download("csv", "data.csv");
    }
  };

  const onExportJson = () => {
    if (tabulator.current) {
      tabulator.current.download("json", "data.json");
    }
  };

  const onExportXlsx = () => {
    if (tabulator.current) {
      (window as any).XLSX = xlsx;
      tabulator.current.download("xlsx", "data.xlsx", {
        sheetName: "Products",
      });
    }
  };

  const onExportHtml = () => {
    if (tabulator.current) {
      tabulator.current.download("html", "data.html", {
        style: true,
      });
    }
  };

  // Print
  const onPrint = () => {
    if (tabulator.current) {
      tabulator.current.print();
    }
  };

  useEffect(() => {
    initTabulator();
    reInitOnResizeWindow();
  }, []);

  return (
    <>
      {/* Toggle switch functionality on/off start*/}
      <input id="ihVal" type="hidden" value="0" />
      <Button
        className="hidden"
        id="btn"
        onClick={() => {
          {
            /* API CALL FOR TOGGLE SWITCH TO HIDE AND SHOW CATEGORY*/
            console.log("Hide/Show");
          }
        }}
      >
        Toggle switch functionality on/off
      </Button>
      {/* Toggle switch functionality on/off end */}
      <div className="flex flex-col items-center mt-8 intro-y sm:flex-row">
        <h2 className="mr-auto text-lg font-medium">Product Size Master</h2>
        <div className="flex w-full mt-4 sm:w-auto sm:mt-0">
          <Button
            variant="primary"
            className="mr-2 shadow-md"
            onClick={() => {
              setFormData({ productSize: "" });
              setAddNewSizeModalPreview(true);
            }}
          >
            Add New Product Size
          </Button>
        </div>
      </div>
      {/* BEGIN: HTML Table Data */}
      <div className="p-5 mt-5 intro-y box">
        <div className="flex flex-col sm:flex-row sm:items-end xl:items-start">
          <form
            id="tabulator-html-filter-form"
            className="xl:flex sm:mr-auto"
            onSubmit={(e) => {
              e.preventDefault();
              onFilter();
            }}
          >
            <div className="items-center sm:flex sm:mr-4">
              <label className="flex-none w-12 mr-2 xl:w-auto xl:flex-initial">
                Field
              </label>
              <FormSelect
                id="tabulator-html-filter-field"
                value={filter.field}
                onChange={(e) => {
                  setFilter({
                    ...filter,
                    field: e.target.value,
                  });
                }}
                className="w-full mt-2 2xl:w-full sm:mt-0 sm:w-auto"
              >
                <option value="name">Size</option>
                {/* <option value="category">Category</option>*/}
              </FormSelect>
            </div>
            <div className="items-center mt-2 sm:flex sm:mr-4 xl:mt-0">
              <label className="flex-none w-12 mr-2 xl:w-auto xl:flex-initial">
                Type
              </label>
              <FormSelect
                id="tabulator-html-filter-type"
                value={filter.type}
                onChange={(e) => {
                  setFilter({
                    ...filter,
                    type: e.target.value,
                  });
                }}
                className="w-full mt-2 sm:mt-0 sm:w-auto"
              >
                <option value="like">like</option>
                <option value="=">=</option>
                <option value="<">&lt;</option>
                <option value="<=">&lt;=</option>
                <option value=">">&gt;</option>
                <option value=">=">&gt;=</option>
                <option value="!=">!=</option>
              </FormSelect>
            </div>
            <div className="items-center mt-2 sm:flex sm:mr-4 xl:mt-0">
              <label className="flex-none w-12 mr-2 xl:w-auto xl:flex-initial">
                Value
              </label>
              <FormInput
                id="tabulator-html-filter-value"
                value={filter.value}
                onChange={(e) => {
                  setFilter({
                    ...filter,
                    value: e.target.value,
                  });
                }}
                type="text"
                className="mt-2 sm:w-40 2xl:w-full sm:mt-0"
                placeholder="Search..."
              />
            </div>
            <div className="mt-2 xl:mt-0">
              <Button
                id="tabulator-html-filter-go"
                variant="primary"
                type="button"
                className="w-full sm:w-16"
                onClick={onFilter}
              >
                Go
              </Button>
              <Button
                id="tabulator-html-filter-reset"
                variant="secondary"
                type="button"
                className="w-full mt-2 sm:w-16 sm:mt-0 sm:ml-1"
                onClick={onResetFilter}
              >
                Reset
              </Button>
            </div>
          </form>
          <div className="flex mt-5 sm:mt-0">
            <Button
              id="tabulator-print"
              variant="outline-secondary"
              className="w-1/2 mr-2 sm:w-auto"
              onClick={onPrint}
            >
              <Lucide icon="Printer" className="w-4 h-4 mr-2" /> Print
            </Button>
            <Menu className="w-1/2 sm:w-auto">
              <Menu.Button
                as={Button}
                variant="outline-secondary"
                className="w-full sm:w-auto"
              >
                <Lucide icon="FileText" className="w-4 h-4 mr-2" /> Export
                <Lucide
                  icon="ChevronDown"
                  className="w-4 h-4 ml-auto sm:ml-2"
                />
              </Menu.Button>
              <Menu.Items className="w-40">
                <Menu.Item onClick={onExportCsv}>
                  <Lucide icon="FileText" className="w-4 h-4 mr-2" /> Export CSV
                </Menu.Item>
                <Menu.Item onClick={onExportJson}>
                  <Lucide icon="FileText" className="w-4 h-4 mr-2" /> Export
                  JSON
                </Menu.Item>
                <Menu.Item onClick={onExportXlsx}>
                  <Lucide icon="FileText" className="w-4 h-4 mr-2" /> Export
                  XLSX
                </Menu.Item>
                <Menu.Item onClick={onExportHtml}>
                  <Lucide icon="FileText" className="w-4 h-4 mr-2" /> Export
                  HTML
                </Menu.Item>
              </Menu.Items>
            </Menu>
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-hidden">
          <div id="tabulator" ref={tableRef} className="mt-5"></div>
        </div>
      </div>
      {/* END: HTML Table Data */}
      {/* BEGIN: Add New Size Modal Content */}
      <Dialog
        open={addNewSizeModalPreview}
        onClose={() => {
          setAddNewSizeModalPreview(false);
        }}
        staticBackdrop
      >
        <Dialog.Panel>
          <Dialog.Title>
            <h2 className="mr-auto text-base font-medium">
              Add New Product Size
            </h2>
            <Menu className="sm:hidden">
              <Menu.Button className="block w-5 h-5">
                <Lucide
                  icon="MoreHorizontal"
                  className="w-5 h-5 text-slate-500"
                />
              </Menu.Button>
            </Menu>
          </Dialog.Title>
          <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-3">
            <div className="col-span-12 sm:col-span-12">
              <FormLabel htmlFor="size">Size</FormLabel>
              <FormInput
                id="size"
                type="text"
                placeholder="size"
                value={formData.productSize}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, productSize: e.target.value })
                  if (value.trim()) {
                    setFormErrors((prev) => ({ ...prev, productSize: "" }));
                  }
                }}
              />
              {formErrors.productSize && <p className="text-red-500 text-sm">{formErrors.productSize}</p>}
            </div>
          </Dialog.Description>
          <Dialog.Footer>
            <Button
              type="button"
              variant="outline-secondary"
              onClick={() => {
                setAddNewSizeModalPreview(false);
              }}
              className="w-20 mr-1"
            >
              Cancel
            </Button>
            <Button variant="primary" type="button" className="w-20" onClick={handleSubmit}>
              Save
            </Button>
          </Dialog.Footer>
        </Dialog.Panel>
      </Dialog>
      {/* END: Add New Size Modal Content */}
      {/* BEGIN: Delete Confirmation Modal */}
      <Dialog
        open={deleteConfirmationModal}
        onClose={() => {
          setDeleteConfirmationModal(false);
        }}
        initialFocus={deleteButtonRef}
      >
        <Dialog.Panel>
          <div className="p-5 text-center">
            <Lucide
              icon="Trash"
              className="w-16 h-16 mx-auto mt-3 text-danger"
            />
            <div className="mt-5 text-3xl">Are you sure?</div>
            <div className="mt-2 text-slate-500">
              Do you really want to <strong className="text-danger">Delete</strong> this Size? <br />
            </div>
          </div>
          <div className="px-5 pb-8 text-center">
            <Button
              variant="outline-secondary"
              type="button"
              onClick={() => {
                setDeleteConfirmationModal(false);
              }}
              className="w-24 mr-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              type="button"
              className="w-24"
              ref={deleteButtonRef}
              onClick={handleDeleteSize}
            >
              Delete
            </Button>
          </div>
        </Dialog.Panel>
      </Dialog>
      {/* END: Delete Confirmation Modal */}
      {/* Success Modal : START*/}
      <SuccessModal
        open={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        {...successModalConfig}
      />
      {/* Success Modal : END*/}
    </>
  );
}

export default Main;
