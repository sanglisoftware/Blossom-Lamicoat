import { useState, useRef, useEffect } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import Lucide from "@/components/Base/Lucide";
import { Dialog, Menu } from "@/components/Base/Headless";
import "@/assets/css/vendors/tabulator.css";
import * as xlsx from "xlsx";
import { createRef } from "react";
import { createIcons, icons } from "lucide";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { BASE_URL } from "@/ecommerce/config/config";
import AddNewsModal from "./AddNewNews";
import EditNewsModal from "./EditNewsModal";

interface NewsImageModalData {
  title: string;
  src: string;
}

function Main() {
  const token = localStorage.getItem("token");
  const [addNewsModalPreview, setAddNewsModalPreview] = useState(false);
  const [editNewsModalPreview, setEditNewsModalPreview] = useState(false);
  const [statusConfirmationModal, setStatusConfirmationModal] = useState(false);
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [statusLabel, setStatusLabel] = useState("");
  const deleteButtonRef = useRef(null);
  const hideButtonRef = useRef(null);
  const [activeStatusRowId, setActiveStatusRowId] = useState("0");
  const [isActiveNews, setIsActiveNews] = useState("0");

  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator>();
  const [filterValue, setFilterValue] = useState("");
  const filterValueRef = useRef(filterValue);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [editingNewsId, setEditingNewsId] = useState<number | null>(null);
  const HideButtonRef = useRef(null);

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Handle image preview modal
  const [newsImageModalPreview, setNewsImageModalPreview] =
    useState<boolean>(false);
  const [selectedNewsImageData, setSelectedNewsImageData] =
    useState<NewsImageModalData | null>(null);

  const handleImageClick = (response: any) => {
    setSelectedNewsImageData({
      src: BASE_URL + response.img,
      title: response.title || "News Image",
    });
    setNewsImageModalPreview(true);
  };

  //Handle Status toggle Hide/Show Collection
  const handleStatus = () => {
    // Set new timer for API call
    let debounceTimer: NodeJS.Timeout | null = null;

    debounceTimer = setTimeout(async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/api/inventory/news/${activeStatusRowId}/status`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(Number(isActiveNews)),
          }
        );

        if (response.ok) {
          // Show success notification
          setNotification({
            message: `🔐 Status ${
              isActiveNews === "0" ? "Hide " : "Show"
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

  // Handle delete news
  const handleDeleteNews = () => {
    setTimeout(async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/api/inventory/news/${activeStatusRowId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          setNotification({
            message: "🗑️ News deleted successfully",
            type: "success",
          });
          setTimeout(() => setNotification(null), 2000);
          refreshTableData();
        } else {
          setNotification({
            message: "Failed to delete news",
            type: "error",
          });
        }
      } catch (error) {
        console.error("Error deleting news:", error);
        setNotification({
          message: "Error deleting news",
          type: "error",
        });
      }
      setDeleteConfirmationModal(false);
    }, 500);
  };

  // Initialize Tabulator
  const initTabulator = () => {
    if (tableRef.current) {
      tabulator.current = new Tabulator(tableRef.current, {
        ajaxURL: `${BASE_URL}/api/inventory/news`,
        ajaxConfig: {
          method: "GET",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
        ajaxParams: function () {
          const currentPage = tabulator.current?.getPage() || 1;
          const pageSize = tabulator.current?.getPageSize() || 10;

          const params: any = {
            page: currentPage,
            size: pageSize,
          };

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
        layout: "fitColumns",
        responsiveLayout: "collapse",
        placeholder: "No news found",
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
            title: "TITLE",
            minWidth: 200,
            responsive: 0,
            field: "title",
            vertAlign: "middle",
            formatter: (cell) => {
              const rowData: any = cell.getData();
              return `<div class="font-medium whitespace-nowrap">${rowData.title}</div>`;
            },
          },
          {
            title: "DATE",
            minWidth: 120,
            field: "date",
            vertAlign: "middle",
          },
          {
            title: "VIEWS",
            minWidth: 100,
            field: "views",
            hozAlign: "center",
            vertAlign: "middle",
            formatter: (cell) => cell.getValue() || "0",
          },
          {
            title: "IMAGE",
            minWidth: 120,
            field: "img",
            hozAlign: "center",
            headerHozAlign: "center",
            vertAlign: "middle",
            formatter: (cell) => {
              const img = cell.getValue();
              if (!img) return "No image";

              const firstImage = img.split(",")[0];
              const fullUrl = `${BASE_URL}${
                firstImage.startsWith("/") ? firstImage : `/${firstImage}`
              }`;

              return `<img src="${fullUrl}" height="50px" width="50px" 
                      class="clickable-image" style="object-fit: cover; border-radius: 4px;" />`;
            },
            cellClick: function (e: any, cell) {
              if (e.target && e.target.classList.contains("clickable-image")) {
                handleImageClick(cell.getData());
              }
            },
          },
          {
            title: "STATUS",
            minWidth: 100,
            field: "isActive",
            hozAlign: "center",
            headerHozAlign: "center",
            vertAlign: "middle",
            formatter: (cell) => {
              const rowData: any = cell.getData();
              const isChecked = rowData.isActive ? "checked" : "";
              return `<input 
                ${isChecked}
                onchange='
                  const val = this.checked ? "1" : "0";
                  document.querySelector("#ihVal").value = val;
                  document.querySelector("#ihVal2").value = ${rowData.id};
                  document.querySelector("#btn").click();
                '
                type="checkbox"
                class="transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&amp;[type='radio']]:checked:bg-primary [&amp;[type='radio']]:checked:border-primary [&amp;[type='radio']]:checked:border-opacity-10 [&amp;[type='checkbox']]:checked:bg-primary [&amp;[type='checkbox']]:checked:border-primary [&amp;[type='checkbox']]:checked:border-opacity-10 [&amp;:disabled:not(:checked)]:bg-slate-100 [&amp;:disabled:not(:checked)]:cursor-not-allowed [&amp;:disabled:not(:checked)]:dark:bg-darkmode-800/50 [&amp;:disabled:checked]:opacity-70 [&amp;:disabled:checked]:cursor-not-allowed [&amp;:disabled:checked]:dark:bg-darkmode-800/50 w-[38px] h-[24px] p-px rounded-full relative before:w-[20px] before:h-[20px] before:shadow-[1px_1px_3px_rgba(0,0,0,0.25)] before:transition-[margin-left] before:duration-200 before:ease-in-out before:absolute before:inset-y-0 before:my-auto before:rounded-full before:dark:bg-darkmode-600 checked:bg-primary checked:border-primary checked:bg-none before:checked:ml-[14px] before:checked:bg-white"
              >`;
            },
          },
          {
            title: "ACTIONS",
            minWidth: 180,
            field: "actions",
            responsive: 1,
            hozAlign: "center",
            headerHozAlign: "center",
            vertAlign: "middle",
            formatter: (cell) => {
              const container = document.createElement("div");
              container.className = "flex lg:justify-center items-center gap-2";

              const actions = [
                {
                  label: "Edit",
                  icon: "edit",
                  classes: "bg-blue-100 hover:bg-blue-200 text-blue-800",
                  onClick: () => {
                    const rowData = cell.getRow().getData();
                    setEditingNewsId(rowData.id);
                    setEditNewsModalPreview(true);
                  },
                },
                {
                  label: "Delete",
                  icon: "trash-2",
                  classes: "bg-red-100 hover:bg-red-200 text-red-800",
                  onClick: () => {
                    const rowData = cell.getRow().getData();
                    setActiveStatusRowId(rowData.id);
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
            },
          },
        ],
      });

      tabulator.current?.on("renderComplete", () => {
        createIcons({
          icons,
          attrs: {
            "stroke-width": 1.5,
          },
          nameAttr: "data-lucide",
        });
      });
    }
  };

  // Redraw table on resize
  const reInitOnResizeWindow = () => {
    window.addEventListener("resize", () => {
      tabulator.current?.redraw();
      createIcons({
        icons,
        attrs: {
          "stroke-width": 1.5,
        },
        nameAttr: "data-lucide",
      });
    });
  };

  // Refresh table data
  const refreshData = () => {
    tabulator.current?.setPage(1).then(() => {
      tabulator.current?.replaceData();
    });
  };

  // Handle filter change with debounce
  const handleFilterChange = (value: string) => {
    setFilterValue(value);
    filterValueRef.current = value;

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      refreshData();
    }, 300);
  };

  // Export functions
  const onExportCsv = () => tabulator.current?.download("csv", "news.csv");
  const onExportJson = () => tabulator.current?.download("json", "news.json");
  const onExportXlsx = () => {
    (window as any).XLSX = xlsx;
    tabulator.current?.download("xlsx", "news.xlsx", { sheetName: "News" });
  };
  const onExportHtml = () =>
    tabulator.current?.download("html", "news.html", { style: true });
  const onPrint = () => tabulator.current?.print();

  useEffect(() => {
    initTabulator();
    reInitOnResizeWindow();

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  const refreshTableData = () => refreshData();

  return (
    <>
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 px-4 py-2 rounded-lg shadow-lg z-50 ${
            notification.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Status toggle hidden controls */}
      <input id="ihVal" type="hidden" value="0" />
      <input id="ihVal2" type="hidden" value="0" />
      <Button
        className="hidden"
        id="btn"
        onClick={() => {
          const statusValue = (
            document.querySelector("#ihVal") as HTMLInputElement
          ).value;
          const rowId = (document.querySelector("#ihVal2") as HTMLInputElement)
            .value;

          setStatusLabel(statusValue === "1" ? "Activate" : "Deactivate");
          setActiveStatusRowId(rowId);
          setIsActiveNews(statusValue);
          setStatusConfirmationModal(true);
        }}
      >
        Status Toggle
      </Button>

      {/* Header */}
      <div className="flex flex-col items-center mt-8 intro-y sm:flex-row">
        <h2 className="mr-auto text-lg font-medium">News Management</h2>
        <div className="flex w-full mt-4 sm:w-auto sm:mt-0">
          <Button
            variant="primary"
            className="mr-2 shadow-md"
            onClick={() => setAddNewsModalPreview(true)}
          >
            <Lucide icon="Plus" className="w-4 h-4 mr-2" /> Add New News
          </Button>
        </div>
      </div>

      {/* Table */}
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
                placeholder="Search news..."
              />
            </div>
          </div>
          <div className="flex mt-5 sm:mt-0">
            <Button
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

      {/* Status Confirmation Modal */}
      <Dialog
        open={statusConfirmationModal}
        onClose={() => {
          setStatusConfirmationModal(false);
        }}
        initialFocus={HideButtonRef}
      >
        <Dialog.Panel>
          <div className="p-5 text-center">
            <Lucide
              icon="EyeOff"
              className="w-16 h-16 mx-auto mt-3 text-danger"
            />
            <div className="mt-5 text-3xl">Are you sure?</div>
            <div className="mt-2 text-slate-500">
              Do you really want to <strong>{statusLabel}</strong> this
              collection? <br />
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
              ref={HideButtonRef}
              onClick={handleStatus}
            >
              {statusLabel}
            </Button>
          </div>
        </Dialog.Panel>
      </Dialog>
      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteConfirmationModal}
        onClose={() => setDeleteConfirmationModal(false)}
        initialFocus={deleteButtonRef}
      >
        <Dialog.Panel>
          <div className="p-5 text-center">
            <Lucide
              icon="Trash"
              className="w-16 h-16 mx-auto mt-3 text-danger"
            />
            <div className="mt-5 text-3xl">Confirm Deletion</div>
            <div className="mt-2 text-slate-500">
              Are you sure you want to delete this news item? This action cannot
              be undone.
            </div>
          </div>
          <div className="px-5 pb-8 text-center">
            <Button
              variant="outline-secondary"
              className="w-24 mr-1"
              onClick={() => setDeleteConfirmationModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="w-24"
              ref={deleteButtonRef}
              onClick={handleDeleteNews}
            >
              Delete
            </Button>
          </div>
        </Dialog.Panel>
      </Dialog>

      {/* Image Preview Modal */}
      <Dialog
        open={newsImageModalPreview}
        onClose={() => setNewsImageModalPreview(false)}
      >
        <Dialog.Panel className="relative max-w-4xl">
          <button
            onClick={() => setNewsImageModalPreview(false)}
            className="absolute top-0 right-0 mt-3 mr-3 text-slate-400 hover:text-slate-600"
          >
            <Lucide icon="X" className="w-8 h-8" />
          </button>

          <div className="p-5 text-center">
            <div className="mt-5 text-xl">{selectedNewsImageData?.title}</div>
            {selectedNewsImageData?.src &&
              selectedNewsImageData.src.length > 0 && (
                <div className="grid-cols-12">
                  <img
                    src={selectedNewsImageData.src}
                    className="rounded-lg shadow-lg w-full h-auto"
                  />
                </div>
              )}
          </div>
          <div className="px-5 pb-8 text-center">
            <Button
              variant="primary"
              onClick={() => setNewsImageModalPreview(false)}
              className="w-24"
            >
              Close
            </Button>
          </div>
        </Dialog.Panel>
      </Dialog>

      {/* Modals */}
      <AddNewsModal
        open={addNewsModalPreview}
        onClose={() => setAddNewsModalPreview(false)}
        onSuccess={refreshTableData}
      />

      <EditNewsModal
        open={editNewsModalPreview}
        onClose={() => setEditNewsModalPreview(false)}
        onSuccess={refreshTableData}
        newsId={editingNewsId}
      />
    </>
  );
}

export default Main;
