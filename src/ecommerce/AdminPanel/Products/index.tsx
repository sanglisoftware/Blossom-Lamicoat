import _ from "lodash";
import * as xlsx from "xlsx";
import { useState, useRef } from "react";
import Button from "@/components/Base/Button";
import { FormInput } from "@/components/Base/Form";
import Lucide from "@/components/Base/Lucide";
import { Dialog, Menu } from "@/components/Base/Headless";
import "@/assets/css/vendors/tabulator.css";
import { useEffect, createRef } from "react";
import { createIcons, icons } from "lucide";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { BASE_URL } from "@/ecommerce/config/config";
import EditProductModal from "./EditProductModal";
import AddProductModal from "./AddNewProducts";
import NutritionFacts from "./NutritionalInfo";
import AddNewProducts from "./AddNewProducts";


interface ProductImageModalData {
  title: string;
  src: string;
}

function Main() {
  const token = localStorage.getItem("token");
  const [addNewProductModalPreview, setaddNewProductModalPreview] =
    useState(false);
  const [statusConfirmationModal, setStatusConfirmationModal] = useState(false);
  const [nutritionInfoModal, setNutritionInfoModal] = useState(false);
  const [productName, setProductName] = useState("");
  const [statusLabel, setStatusLabel] = useState("");
  const [activeStatusRowId, setActiveStatusRowId] = useState("0");
  const [isActiveProduct, setIsActiveProduct] = useState("0");

  const statusButtonRef = useRef(null);
  const deleteButtonRef = useRef(null);
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator>();
  const [filterValue, setFilterValue] = useState("");
  const filterValueRef = useRef(filterValue);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [nutriProductId, setNutriProductId] = useState<string | null>(null);

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Update ref when filter changes
  useEffect(() => {
    filterValueRef.current = filterValue;
  }, [filterValue]);

  //Handle Image Click and open popup modal Tabulator
  const [ProductImageModalPreview, setProductImageModalPreview] =
    useState<boolean>(false);
  const [selectedProductImageData, setSelectedProductImageData] =
    useState<ProductImageModalData | null>(null);

  const handleImageClick = (imageData: ProductImageModalData) => {
    setSelectedProductImageData(imageData);
    setProductImageModalPreview(true);
  };

  //Handle Status toggle Hide/Show Product
  const handleStatus = () => {
    // Set new timer for API call
    let debounceTimer: NodeJS.Timeout | null = null;

    debounceTimer = setTimeout(async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/api/inventory/products/${activeStatusRowId}/status`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(Number(isActiveProduct)),
          }
        );

        if (response.ok) {
          // Show success notification
          setNotification({
            message: `🔐 Product ${
              isActiveProduct === "0" ? "Hide " : "Show"
            } successfully`,
            type: "success",
          });
          setTimeout(() => setNotification(null), 2000);

          // Refresh the table data
          refreshTableData();
        }
      } catch (error) {
        console.error("Error updating Status:", error);
        alert("Failed to update Status. Please try again.");
      }
    }, 500);
    setStatusConfirmationModal(false);
  };

  //Delete Product Handler
  const handleDeleteProduct = () => {
    alert("Product Deletd Sucessfully!");
    setNutritionInfoModal(false);
  };

  const initTabulator = () => {
    if (tableRef.current) {
      tabulator.current = new Tabulator(tableRef.current, {
        ajaxURL: `${BASE_URL}/api/inventory/products/`,
        ajaxConfig: {
          method: "GET",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
        ajaxParams: function () {
          // Get current page and size from the Tabulator instance
          const currentPage = tabulator.current?.getPage() || 1;
          const pageSize = tabulator.current?.getPageSize() || 10;

          const params: any = {
            page: currentPage,
            size: pageSize,
          };
          // Use ref value to get current filter
          if (filterValueRef.current) {
            params["filter[0][type]"] = "like";
            params["filter[0][value]"] = filterValueRef.current;
          }

          return params;
        },
        ajaxResponse: function (url, params, response) {
          return {
            last_page: Math.ceil(response.totalCount / response.size),
            data: response.items,
          };
        },
        ajaxContentType: "json",
        paginationMode: "remote",
        filterMode: "remote",
        sortMode: "remote",
        printAsHtml: true,
        printStyled: true,
        pagination: true,
        paginationSize: 10,
        paginationSizeSelector: [10, 20, 30, 40],
        layout: "fitDataTable",
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
            title: "SEQUENCE",
            minWidth: 150,
            field: "sequenceNo",
            formatter: (cell) => {
              const value = cell.getValue();
              // Create input element manually
              const input = document.createElement("input");
              input.type = "text";
              input.placeholder = "Enter...";
              input.className = "always-visible-input w-20";
              input.value = value;

              // Store original value
              let originalValue = value;
              let debounceTimer: NodeJS.Timeout | null = null;

              // Clear input on focus but remember original value
              input.addEventListener("focus", (e) => {
                originalValue = input.value;
                input.value = "";
              });

              // Handle input changes
              input.addEventListener("input", (e) => {
                const target = e.target as HTMLInputElement;
                const newValue = target.value;

                // Clear previous timer
                if (debounceTimer) clearTimeout(debounceTimer);

                // Only proceed if we have a value
                if (newValue !== "") {
                  // Validate is number
                  if (isNaN(Number(newValue))) {
                    target.value = originalValue; // revert if not number
                    return;
                  }

                  // Set new timer for API call
                  debounceTimer = setTimeout(async () => {
                    const rowData = cell.getRow().getData();
                    try {
                      const response = await fetch(
                        `${BASE_URL}/api/inventory/products/${rowData.id}/sequence`,
                        {
                          method: "PATCH",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify(Number(newValue)),
                        }
                      );

                      if (response.ok) {
                        // Update local data and original value
                        cell.getRow().update({ sequenceNo: Number(newValue) });
                        originalValue = newValue;

                        // Show success notification
                        setNotification({
                          message: "🔐 Sequence updated successfully",
                          type: "success",
                        });
                        setTimeout(() => setNotification(null), 1000);

                        // Refresh the table data
                        refreshTableData();
                      } else {
                        // Revert on failure
                        target.value = originalValue;
                        const errorData = await response.json();
                        console.error("Update failed:", errorData);
                        alert(
                          `Failed to update sequence: ${
                            errorData.message || response.statusText
                          }`
                        );
                      }
                    } catch (error) {
                      console.error("Error updating sequence:", error);
                      target.value = originalValue;
                      alert("Failed to update sequence. Please try again.");
                    }
                  }, 500);
                }
              });

              // Restore original if empty on blur
              input.addEventListener("blur", (e) => {
                if (input.value === "") {
                  input.value = originalValue;
                }
              });

              return input;
            },
            editable: true,
          },
          {
            title: "SKU CODE",
            minWidth: 200,
            responsive: 0,
            field: "productCode",
            vertAlign: "middle",
            print: false,
            download: false,
            formatter(cell) {
              const response: any = cell.getData();
              return `<div>
                  <div class="font-medium whitespace-nowrap">${response.hsnCode}</div>
                </div>`;
            },
          },
          {
            title: "PRODUCT NAME",
            minWidth: 200,
            responsive: 0,
            field: "name",
            vertAlign: "middle",
            print: false,
            download: false,
            formatter(cell) {
              const response: any = cell.getData();
              return `<div>
                  <div class="font-medium whitespace-nowrap">${response.name}</div>
                  <div class="text-slate-500 text-xs whitespace-nowrap">${response.name}</div>
                </div>`;
            },
          },
          {
            title: "CATEGORY NAME",
            minWidth: 200,
            responsive: 0,
            field: "categoryName",
            vertAlign: "middle",
            print: false,
            download: false,
            formatter(cell) {
              const response: any = cell.getData();
              return `<div>
                  <div class="font-medium whitespace-nowrap">${response.categoryName}</div>
                  <div class="text-slate-500 text-xs whitespace-nowrap">${response.categoryName}</div>
                </div>`;
            },
          },
          // {
          //   title: "COLOUR",
          //   minWidth: 200,
          //   responsive: 0,
          //   field: "color",
          //   vertAlign: "middle",
          //   print: false,
          //   download: false,
          //   formatter(cell) {
          //     const response: any = cell.getData();
          //     const c = "#FF69B4"
          //     return `<div class="intro-x w-10 h-10">
          //            <div class="w-10 h-10 rounded-full" style="background-color: ${response.color}"></div>
          //            </div>`;
          //   },
          // },
          {
            title: "IMAGES",
            minWidth: 100,
            field: "imagePaths", // Changed to match API response
            hozAlign: "center",
            headerHozAlign: "center",
            vertAlign: "middle",
            print: false,
            download: false,
            formatter(cell) {
              const imagePaths = cell.getValue();
              // Split comma-separated URLs into array
              const images = imagePaths ? imagePaths.split(",") : [];

              return images
                .map(
                  (img: any, index: number) => `
            <div class="intro-x w-10 h-10 image-fit ${
              index > 0 ? "-ml-5" : ""
            }">
              <img 
                alt="Image ${index + 1}" 
                class="clickable-image rounded-full shadow-[0px_0px_0px_2px_#fff,_1px_1px_5px_rgba(0,0,0,0.32)] dark:shadow-[0px_0px_0px_2px_#3f4865,_1px_1px_5px_rgba(0,0,0,0.32)]"
                src="${BASE_URL}${img}"
                data-image-index="${index}"
              >
            </div>`
                )
                .join("");
            },
            cellClick: function (e: any, cell) {
              if (e.target && e.target.classList.contains("clickable-image")) {
                const imageIndex = parseInt(
                  e.target.getAttribute("data-image-index")
                );
                const imagePaths = cell.getValue();
                // Split comma-separated URLs into array
                const images = imagePaths ? imagePaths.split(",") : [];
                const selectedImage = BASE_URL + images[imageIndex];

                if (selectedImage) {
                  handleImageClick({
                    src: selectedImage,
                    title: cell.getRow().getData().name || "Product Image",
                  });
                }
              }
            },
          },
          {
            title: "PRICE",
            minWidth: 150,
            field: "price",
            hozAlign: "center",
            headerHozAlign: "center",
            vertAlign: "middle",
            print: false,
            download: false,
          },
          {
            title: "STATUS",
            minWidth: 30,
            field: "isActive", // Changed to match API response
            hozAlign: "center",
            headerHozAlign: "center",
            vertAlign: "middle",
            print: false,
            download: false,
            formatter(cell) {
              const response: any = cell.getData();
              const isChecked = response.isActive === 0 ? "" : "checked";
              return `<input 
                     ${isChecked}
                      onchange='
                        const val = this.checked ? "1" : "0";
                        document.querySelector("#ihVal").value = val;
                        document.querySelector("#ihVal2").value = ${response.id};
                        document.querySelector("#btn").click();
                      '
                      type="checkbox"
                      class="transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&amp;[type='radio']]:checked:bg-primary [&amp;[type='radio']]:checked:border-primary [&amp;[type='radio']]:checked:border-opacity-10 [&amp;[type='checkbox']]:checked:bg-primary [&amp;[type='checkbox']]:checked:border-primary [&amp;[type='checkbox']]:checked:border-opacity-10 [&amp;:disabled:not(:checked)]:bg-slate-100 [&amp;:disabled:not(:checked)]:cursor-not-allowed [&amp;:disabled:not(:checked)]:dark:bg-darkmode-800/50 [&amp;:disabled:checked]:opacity-70 [&amp;:disabled:checked]:cursor-not-allowed [&amp;:disabled:checked]:dark:bg-darkmode-800/50 w-[38px] h-[24px] p-px rounded-full relative before:w-[20px] before:h-[20px] before:shadow-[1px_1px_3px_rgba(0,0,0,0.25)] before:transition-[margin-left] before:duration-200 before:ease-in-out before:absolute before:inset-y-0 before:my-auto before:rounded-full before:dark:bg-darkmode-600 checked:bg-primary checked:border-primary checked:bg-none before:checked:ml-[14px] before:checked:bg-white"
                    >`;
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
                    setEditingProductId(rowData.id);
                    setIsEditModalOpen(true);
                  },
                },

                {
                  label: "Nutritional Info",
                  icon: "info",
                  action: "info",
                  classes: "bg-blue-100 hover:bg-blue-200 text-blue-800",
                  onClick: () => {
                    const rowData = cell.getRow().getData();
                    setNutriProductId(rowData.id);
                    setNutritionInfoModal(true);
                    setProductName(rowData.name);
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
            },
          },

          // For print format
          {
            title: "PRODUCT NAME",
            field: "name",
            visible: false,
            print: true,
            download: true,
          },
          {
            title: "CATEGORY",
            field: "categoryId",
            visible: false,
            print: true,
            download: true,
          },
          {
            title: "REMAINING STOCK",
            field: "stock",
            visible: false,
            print: true,
            download: true,
          },
          {
            title: "STATUS",
            field: "isActive",
            visible: false,
            print: true,
            download: true,
            formatterPrint(cell) {
              return cell.getValue() ? "Active" : "Inactive";
            },
          },
          {
            title: "IMAGE 1",
            field: "imagePaths",
            visible: false,
            print: true,
            download: true,
            formatterPrint(cell) {
              const images = cell.getValue().split(",");
              return images[0] || "";
            },
          },
          {
            title: "IMAGE 2",
            field: "imagePaths",
            visible: false,
            print: true,
            download: true,
            formatterPrint(cell) {
              const images = cell.getValue().split(",");
              return images[1] || "";
            },
          },
          {
            title: "IMAGE 3",
            field: "imagePaths",
            visible: false,
            print: true,
            download: true,
            formatterPrint(cell) {
              const images = cell.getValue().split(",");
              return images[2] || "";
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

  const handleProductUpdated = () => {
    if (tabulator.current) {
      // Reset to first page and reload data
      tabulator.current.setPage(1).then(() => {
        tabulator.current?.replaceData();
      });
    }
  };

  // Filter function - now properly triggers data reload
  const refreshData = () => {
    if (tabulator.current) {
      // Reset to first page and reload data
      tabulator.current.setPage(1).then(() => {
        tabulator.current?.replaceData();
      });
    }
  };

  // Handle filter change with debounce
  const handleFilterChange = (value: string) => {
    setFilterValue(value);

    // Clear existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set new timeout to trigger search
    debounceTimeout.current = setTimeout(() => {
      refreshData();
    }, 300); // 300ms debounce
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

    // Cleanup debounce timeout
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  const refreshTableData = () => {
    refreshData();
  };

  return (
    <>
      {notification && (
        <div
          className={`fixed top-5 right-15 px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse ${
            notification.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}
      {/* Status Toggle switch functionality on/off start*/}
      <input id="ihVal" type="hidden" value="0" />
      <input id="ihVal2" type="hidden" value="0" />
      <Button
        className="hidden"
        id="btn"
        onClick={() => {
          const productVisibility = (
            document.querySelector("#ihVal") as HTMLInputElement
          ).value;
          const rowId = (document.querySelector("#ihVal2") as HTMLInputElement)
            .value;

          setStatusLabel(productVisibility === "1" ? "Show" : "Hide");
          setActiveStatusRowId(rowId);
          setIsActiveProduct(productVisibility);
          setStatusConfirmationModal(true);
        }}
      >
        Status Toggle switch functionality on/off
      </Button>
      {/* Toggle switch functionality on/off end */}
      <div className="flex flex-col items-center mt-8 intro-y sm:flex-row">
        <h2 className="mr-auto text-lg font-medium">Products</h2>
        <div className="flex w-full mt-4 sm:w-auto sm:mt-0">
          <Button
            variant="primary"
            className="mr-2 shadow-md"
            onClick={() => {
              setaddNewProductModalPreview(true);
            }}
          >
            Add New Product
          </Button>
        </div>
      </div>
      {/* BEGIN: HTML Table Data */}
      <div className="p-5 mt-5 intro-y box">
        <div className="flex flex-col sm:flex-row sm:items-end xl:items-start">
          <div className="xl:flex sm:mr-auto">
            <div className="items-center mt-2 sm:flex sm:mr-4 xl:mt-0">
              <label className="flex-none w-12 mr-2 xl:w-auto xl:flex-initial">
                Search
              </label>
              <FormInput
                value={filterValue}
                onChange={(e) => handleFilterChange(e.target.value)}
                type="text"
                className="mt-2 sm:w-40 2xl:w-full sm:mt-0"
                placeholder="Search globally..."
              />
            </div>
          </div>
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
      {/* BEGIN: Status Confirmation Modal */}
      <Dialog
        open={statusConfirmationModal}
        onClose={() => {
          setStatusConfirmationModal(false);
        }}
        initialFocus={statusButtonRef}
      >
        <Dialog.Panel>
          <div className="p-5 text-center">
            <Lucide
              icon="EyeOff"
              className="w-16 h-16 mx-auto mt-3 text-danger"
            />
            <div className="mt-5 text-3xl">Are you sure?</div>
            <div className="mt-2 text-slate-500">
              Do you really want to <strong>{statusLabel}</strong> this Product?{" "}
              <br />
            </div>
          </div>
          <div className="px-5 pb-8 text-center">
            <Button
              variant="outline-secondary"
              type="button"
              onClick={() => {
                setStatusConfirmationModal(false);
                refreshTableData();
              }}
              className="w-24 mr-1"
            >
              Cancel
            </Button>
            <Button
              variant={statusLabel === "Show" ? "success" : "danger"}
              type="button"
              className="w-24"
              ref={statusButtonRef}
              onClick={handleStatus}
            >
              {statusLabel}
            </Button>
          </div>
        </Dialog.Panel>
      </Dialog>
      {/* END: Status Confirmation Modal */}
      {/* BEGIN: Delete Confirmation Modal */}

      <NutritionFacts
        open={nutritionInfoModal}
        onClose={() => setNutritionInfoModal(false)}
        productId={nutriProductId}
        productName={productName}
        onProductUpdated={handleProductUpdated}
      />
      {/* END: Delete Confirmation Modal */}
      {/* BEGIN: Add New Product*/}
      <AddProductModal
        open={addNewProductModalPreview}
        onClose={() => setaddNewProductModalPreview(false)}
        onSuccess={refreshTableData}
      />
      <EditProductModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        productId={editingProductId}
        onProductUpdated={handleProductUpdated}
      />
      {/* END: Add New Product */}
      {/* Start: Product Image Modal */}
      <Dialog
        open={ProductImageModalPreview}
        onClose={() => setProductImageModalPreview(false)}
      >
        <Dialog.Panel className="relative">
          {/* Close Button */}
          <button
            onClick={() => setProductImageModalPreview(false)}
            className="absolute top-0 right-0 mt-3 mr-3 text-slate-400 hover:text-slate-600"
          >
            <Lucide icon="X" className="w-8 h-8" />
          </button>

          {/* Modal Content */}
          <div className="p-5 text-center">
            <div className="mt-5 text-xl">
              {selectedProductImageData?.title}
            </div>
            {selectedProductImageData?.src && (
              <div className="mt-5">
                <img
                  src={selectedProductImageData.src}
                  alt={selectedProductImageData.title}
                  className="mx-auto rounded-lg shadow-lg max-w-full h-auto"
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 pb-8 text-center">
            <Button
              type="button"
              variant="primary"
              onClick={() => setProductImageModalPreview(false)}
              className="w-24"
            >
              Close
            </Button>
          </div>
        </Dialog.Panel>
      </Dialog>
      {/* End: Product Image Modal */}
    </>
  );
}

export default Main;
