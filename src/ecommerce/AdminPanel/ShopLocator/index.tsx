import _, { set } from "lodash";
import clsx from "clsx";
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
import EditEmpoyeeModal from "../EmployeeList/EditEmployee";
import CreateNewShopModal from "./CreateNewShop";
import EditShopModal from "./EditShop";


// Collection Image Preview Modal Type
interface CategoryImageModalData {
    title: string;
    src: string;
}

function Main() {
    const token = localStorage.getItem("token");
    const [addNewShopModalPreview, setaddNewShopModalPreview] = useState(false);
    const [editShopModalPreview, setEditShopModalPreview] = useState(false);
    const [statusConfirmationModal, setStatusConfirmationModal] = useState(false);
    const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
    const [statusLabel, setStatusLabel] = useState("");
    const deleteButtonRef = useRef(null);
    const HideButtonRef = useRef(null);
    const [activeStatusRowId, setActiveStatusRowId] = useState("0");
    const [isActiveShop, setIsActiveShop] = useState("0");

    const tableRef = createRef<HTMLDivElement>();
    const tabulator = useRef<Tabulator>();
    const [filterValue, setFilterValue] = useState("");
    const filterValueRef = useRef(filterValue);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
    const [editingShopId, setEditingShopId] = useState<number | null>(null);

    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error';
    } | null>(null);

    // Update ref when filter changes
    useEffect(() => {
        filterValueRef.current = filterValue;
    }, [filterValue]);


    //Handle Status toggle Hide/Show Collection
    const handleStatus = () => {

        // Set new timer for API call
        let debounceTimer: NodeJS.Timeout | null = null;

        debounceTimer = setTimeout(async () => {
            try {
                const response = await fetch(
                    `${BASE_URL}/api/inventory/shops/${activeStatusRowId}/status`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(Number(isActiveShop)),
                    }
                );

                if (response.ok) {

                    // Show success notification
                    setNotification({
                        message: `🔐 Shop ${isActiveShop === "0" ? "Hide " : "Show"} successfully`,
                        type: "success"
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
    }

    //Delete Collection Handler
    const handleDeleteCollection = () => {
        alert("Collection Deletd Sucessfully!");
        setDeleteConfirmationModal(false);
    }

    const initTabulator = () => {
        if (tableRef.current) {
            tabulator.current = new Tabulator(tableRef.current, {
                ajaxURL: `${BASE_URL}/api/inventory/shops/tabulator`,
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
                        data: response.items
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
                        title: "Shop Id",
                        minWidth: 150,
                        responsive: 0,
                        field: "id",
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
                        title: "Title",
                        minWidth: 200,
                        responsive: 0,
                        field: "title",
                        vertAlign: "middle",
                        print: false,
                        download: false,
                        formatter(cell) {
                            const response: any = cell.getData();
                            return `<div>
                        <div class="font-medium whitespace-nowrap">${response.title}</div>
                        <div class="text-slate-500 text-xs whitespace-nowrap">${response.title}</div>
                        </div>`;
                        },
                    },
                    {
                        title: "Address",
                        minWidth: 200,
                        responsive: 0,
                        field: "address",
                        vertAlign: "middle",
                        print: false,
                        download: false,
                        formatter(cell) {
                            const response: any = cell.getData();
                            return `<div>
                        <div class="font-medium whitespace-nowrap">${response.address}</div>
                        </div>`;
                        },
                    },
                    {
                        title: "Latitude",
                        minWidth: 200,
                        responsive: 0,
                        field: "latitude",
                        vertAlign: "middle",
                        print: false,
                        download: false,
                        formatter(cell) {
                            const response: any = cell.getData();
                            return `<div>
                        <div class="font-medium whitespace-nowrap">${response.latitude}</div>
                        </div>`;
                        },
                    },
                    {
                        title: "Longitude",
                        minWidth: 200,
                        responsive: 0,
                        field: "longitude",
                        vertAlign: "middle",
                        print: false,
                        download: false,
                        formatter(cell) {
                            const response: any = cell.getData();
                            return `<div>
                        <div class="font-medium whitespace-nowrap">${response.longitude}</div>
                        </div>`;
                        },
                    },
                    {
                        title: "Mobile No",
                        minWidth: 100,
                        responsive: 1,
                        field: "mobile",
                        vertAlign: "middle",
                        print: false,
                        download: false,
                        formatter(cell) {
                            const response: any = cell.getData();
                            return `<div>
                        <div class="font-medium whitespace-nowrap">${response.mobile}</div>
                        </div>`;
                        },
                    },
                    {
                        title: "STATUS",
                        minWidth: 30,
                        field: "isActive",
                        hozAlign: "center",
                        headerHozAlign: "center",
                        vertAlign: "middle",
                        responsive: 1,
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
                        minWidth: 100,
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
                                        setEditingShopId(rowData.id);
                                        setEditShopModalPreview(true);

                                    },
                                },
                                // {
                                //     label: "Delete",
                                //     icon: "trash-2",
                                //     action: "delete",
                                //     classes: "bg-red-100 hover:bg-red-200 text-red-800",
                                //     onClick: () => {
                                //         const rowData = cell.getRow().getData();
                                //         setDeleteConfirmationModal(true);
                                //     },
                                // },
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
                <div className={`fixed top-5 right-15 px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse ${notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}>
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
                    {
                        const employeeVisiblity = (document.querySelector("#ihVal") as HTMLInputElement).value;
                        const rowId = (document.querySelector("#ihVal2") as HTMLInputElement).value;

                        setStatusLabel(employeeVisiblity === "1" ? "Show" : "Hide");
                        setActiveStatusRowId(rowId);
                        setIsActiveShop(employeeVisiblity);
                        setStatusConfirmationModal(true);
                    }
                }}
            >
                Status Toggle switch functionality on/off
            </Button>
            {/* Toggle switch functionality on/off end */}
            <div className="flex flex-col items-center mt-8 intro-y sm:flex-row">
                <h2 className="mr-auto text-lg font-medium">Shop List</h2>
                <div className="flex w-full mt-4 sm:w-auto sm:mt-0">
                    <Button
                        variant="primary"
                        className="mr-2 shadow-md"
                        onClick={() => {
                            setaddNewShopModalPreview(true);
                        }}
                    >
                        Add New Shop
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
                            Do you really want to <strong>{statusLabel}</strong> this collection? <br />
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
            {/* END: Status Confirmation Modal */}

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
                            Do you really want to <strong className="text-danger">Delete</strong> this Collection? <br />
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
                            onClick={handleDeleteCollection}
                        >
                            Delete
                        </Button>
                    </div>
                </Dialog.Panel>
            </Dialog>
            {/* END: Delete Confirmation Modal */}

            {/* BEGIN: Add new Collection Modal Content */}
            <CreateNewShopModal open={addNewShopModalPreview} onClose={() => setaddNewShopModalPreview(false)} onSuccess={refreshTableData} />
            {/* END:  Add new Collection Modal Content */}
            {/* BEGIN: Edit Collection Modal Content */}
            <EditShopModal open={editShopModalPreview} onClose={() => setEditShopModalPreview(false)} onSuccess={refreshTableData}
                shopID={editingShopId} />
            {/* END:  Edit Collection Modal Content */}
        </>
    );
}

export default Main;