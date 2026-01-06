import _, { set } from "lodash";
import clsx from "clsx";
import { useState, useRef } from "react";
import fakerData from "@/utils/faker";
import Button from "@/components/Base/Button";
import Pagination from "@/components/Base/Pagination";
import {
    FormInput,
    FormLabel,
    FormSelect,
    FormSwitch,
} from "@/components/Base/Form";
import Lucide from "@/components/Base/Lucide";
import Tippy from "@/components/Base/Tippy";
import { Dialog, Menu } from "@/components/Base/Headless";
import "@/assets/css/vendors/tabulator.css";

import * as xlsx from "xlsx";
import { useEffect, createRef } from "react";
import { createIcons, icons } from "lucide";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { stringToHTML } from "@/utils/helper";
import { Input } from "postcss";
import Dropzone from "@/components/Base/Dropzone";

interface Response {
    name?: string;
    category?: string;
    images: string[];
    status?: string;
}

interface CategoryImageModalData {
    title: string;
    src: string;
}

function Main() {
    const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
    const deleteButtonRef = useRef(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    const dummySize = ["M", "S", "XL", "L", "XXL", "XS"];

    const [headerFooterModalPreview, setHeaderFooterModalPreview] =
        useState(false);

    const tableRef = createRef<HTMLDivElement>();
    const tabulator = useRef<Tabulator>();
    const [filter, setFilter] = useState({
        field: "name",
        type: "like",
        value: "",
    });

    //Handle Image Click and open popup modal
    const [categoryImageModalPreview, setCategoryImageModalPreview] =
        useState<boolean>(false);
    const [selectedCategoryImageData, setSelectedCategoryImageData] =
        useState<CategoryImageModalData | null>(null);
    const handleImageClick = (response: any) => {
        setSelectedCategoryImageData({
            src: response.images[0],
            title: response.name || "Category Image",
        });
        setCategoryImageModalPreview(true);
    };

    const imageAssets = import.meta.glob<{
        default: string;
    }>("/src/assets/images/fakers/*.{jpg,jpeg,png,svg}", { eager: true });

    const initTabulator = () => {
        if (tableRef.current) {
            tabulator.current = new Tabulator(tableRef.current, {
                //ajaxURL: "https://wrong-api/",
                paginationMode: "remote",
                filterMode: "remote",
                sortMode: "remote",
                printAsHtml: true,
                printStyled: true,
                pagination: true,
                //paginationSize: 10,
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
                        title: "ID",
                        minWidth: 150,
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
                        title: "Name",
                        minWidth: 200,
                        responsive: 0,
                        field: "name",
                        vertAlign: "middle",
                        print: false,
                        download: false,
                        formatter(cell) {
                            const response: any = cell.getData();
                            return `<div>
                    <div class="font-medium whitespace-nowrap">${"User"}</div>
                    </div>`;
                        },
                    },
                    {
                        title: "Mobile No",
                        minWidth: 150,
                        responsive: 0,
                        field: "mbileno",
                        vertAlign: "middle",
                        print: false,
                        download: false,
                        formatter(cell) {
                            const response: any = cell.getData();
                            return `<div>
                    <div class="font-medium whitespace-nowrap">${"5588667744"}</div>
                    </div>`;
                        },
                    },
                    {
                        title: "Total Price",
                        minWidth: 200,
                        responsive: 0,
                        field: "mbileno",
                        vertAlign: "middle",
                        print: false,
                        download: false,
                        formatter(cell) {
                            const response: any = cell.getData();
                            return `<div>
                                     <div class="font-medium whitespace-nowrap">${"1055"}</div>
                                    </div>`;
                        },
                    },
                    {
                        title: "Payment Status",
                        field: "paymentStatus", // this should match your API response key
                        minWidth: 200,
                        responsive: 0,
                        vertAlign: "middle",
                        print: false,
                        download: false,
                        formatter(cell) {
                            const status = cell.getValue(); // 0 or 1
                            const isPaid = Number(status) === 1;  // 0 or 1   from api

                            return `
                        <div class="text-sm font-medium ${isPaid ? "text-green-600" : "text-red-600"}">
                        ${isPaid ? "Paid" : "Unpaid"}
                        </div>`;
                        }
                    },

                    {
                        title: "Order Date",
                        field: "date",
                        minWidth: 100,
                        print: true,
                        hozAlign: "center",
                        headerHozAlign: "center",
                        editable: true,
                        editor: "input",
                        validator: "required",
                        headerSort: false,
                        formatter(cell) {
                            const response: any = cell.getData();
                            return `<div>
                                     <div class="font-medium whitespace-nowrap">${"18/07/2025"}</div>
                                    </div>`;
                        }
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
                            const rowData = cell.getData();
                            const buttonStatus = 2;  // Assign Value From API which you recived from API Btn color changes based on these nubmers
                            const buttonDefinitions = [
                                { label: "View", action: "view", icon: "eye" },
                                { label: "Packed", action: "packed", icon: "package" },
                                { label: "Assign To Delivery Boy", action: "assignToDboy", icon: "user-plus" },
                                { label: "Dispatched", action: "dispatched", icon: "truck" },
                                { label: "Delivered", action: "delivered", icon: "check" }
                            ];
                            const container = document.createElement("div");
                            container.className = "flex flex-wrap lg:justify-center items-center gap-2";

                            buttonDefinitions.forEach((btn, index) => {
                                const isCompleted = index < buttonStatus;
                                const button = document.createElement("a");
                                button.href = "javascript:;";
                                button.dataset.action = btn.action;
                                button.className = `
                                action-btn inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md
                                ${isCompleted
                                        ? "bg-green-100 hover:bg-green-200 text-green-800"
                                        : "bg-red-100 hover:bg-red-200 text-red-800"}
                                           transition-colors`;
                                button.innerHTML = `
                                <i data-lucide="${btn.icon}" class="w-4 h-4 mr-1"></i> ${btn.label}`;
                                container.appendChild(button);
                            });

                            // Add event delegation
                            container.addEventListener("click", function (event) {
                                const target = event.target as HTMLElement;
                                const actionEl = target.closest(".action-btn") as HTMLElement;
                                if (!actionEl) return;

                                const action = actionEl.dataset.action;

                                switch (action) {
                                    case "view":
                                        console.log("View clicked", rowData);
                                        break;
                                    case "packed":
                                        console.log("Packed clicked", rowData);
                                        break;
                                    case "assignToDboy":
                                        console.log("Assign To Delivery Boy clicked", rowData);
                                        break;
                                    case "dispatched":
                                        console.log("Dispatched clicked", rowData);
                                        break;
                                    case "delivered":
                                        console.log("Delivered clicked", rowData);
                                        break;
                                }
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
                <h2 className="mr-auto text-lg font-medium">Oder List</h2>
                <div className="flex w-full mt-4 sm:w-auto sm:mt-0">
                    {/* <Button
                        variant="primary"
                        className="mr-2 shadow-md"
                        onClick={() => {
                            setHeaderFooterModalPreview(true);
                        }}
                    >
                        Add New
                    </Button> */}
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
                            icon="XCircle"
                            className="w-16 h-16 mx-auto mt-3 text-danger"
                        />
                        <div className="mt-5 text-3xl">Are you sure?</div>
                        <div className="mt-2 text-slate-500">
                            Do you really want to delete these records? <br />
                            This process cannot be undone.
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
                        >
                            Delete
                        </Button>
                    </div>
                </Dialog.Panel>
            </Dialog>
            {/* END: Delete Confirmation Modal */}
            {/* BEGIN: Modal Content */}
            <Dialog
                open={headerFooterModalPreview}
                onClose={() => {
                    setHeaderFooterModalPreview(false);
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
                            <FormLabel htmlFor="modal-form-1">Size</FormLabel>
                            <FormInput id="modal-form-1" type="text" placeholder="size" />
                        </div>
                    </Dialog.Description>
                    <Dialog.Footer>
                        <Button
                            type="button"
                            variant="outline-secondary"
                            onClick={() => {
                                setHeaderFooterModalPreview(false);
                            }}
                            className="w-20 mr-1"
                        >
                            Cancel
                        </Button>
                        <Button variant="primary" type="button" className="w-20">
                            Save
                        </Button>
                    </Dialog.Footer>
                </Dialog.Panel>
            </Dialog>
            {/* END: Modal Content */}
            {/* Start: Category Image Modal */}
            <Dialog
                open={categoryImageModalPreview}
                onClose={() => setCategoryImageModalPreview(false)}
            >
                <Dialog.Panel className="relative">
                    {/* Close Button */}
                    <button
                        onClick={() => setCategoryImageModalPreview(false)}
                        className="absolute top-0 right-0 mt-3 mr-3 text-slate-400 hover:text-slate-600"
                    >
                        <Lucide icon="X" className="w-8 h-8" />
                    </button>

                    {/* Modal Content */}
                    <div className="p-5 text-center">
                        <div className="mt-5 text-xl">
                            {selectedCategoryImageData?.title}
                        </div>
                        {selectedCategoryImageData?.src && (
                            <div className="mt-5">
                                <img
                                    src={selectedCategoryImageData.src}
                                    alt={selectedCategoryImageData.title}
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
                            onClick={() => setCategoryImageModalPreview(false)}
                            className="w-24"
                        >
                            Close
                        </Button>
                    </div>
                </Dialog.Panel>
            </Dialog>
            {/* End: Category Image Modal */}
        </>
    );
}

export default Main;
