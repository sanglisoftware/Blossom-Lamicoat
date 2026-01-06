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
import { BASE_URL } from "@/ecommerce/config/config";
import axios from "axios";
import { SuccessModalConfig } from "../CommonModals/SuccessModal/SuccessModalConfig";
import SuccessModal from "../CommonModals/SuccessModal/SuccessModal";
import EditRoleModal from "./EditRole";


function Main() {

    const token = localStorage.getItem("token");

    const [totPages, setTotPages] = useState(0);
    const dummyRoles = ["Manager", "Supevisor", "HR"];
    const [addNewRoleModalPreview, setAddRoleModalPreview] = useState(false);
    const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
    const deleteButtonRef = useRef(null);

    const [filterValue, setFilterValue] = useState("");
    const filterValueRef = useRef(filterValue);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
    //Success Modal config
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successModalConfig, setSuccessModalConfig] = useState<SuccessModalConfig>({
        title: "",
        subtitle: "",
        icon: "CheckCircle",
        buttonText: "OK",
        onButtonClick: () => { }
    });

    const [editRoleModalPreview, setEditRoleModalPreview] = useState(false);
    const [editingRoleId, setEditingRoleId] = useState<number | null>(null);

    // Update ref when filter changes
    useEffect(() => {
        filterValueRef.current = filterValue;
    }, [filterValue]);


    //Add New Size Modal (useState)
    const [formData, setFormData] = useState({
        roleName: ""
    })

    //Validation Errors
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    //Form Submission: Save button click
    const handleSubmit = async () => {
        const errors: Record<string, string> = {};
        if (!formData.roleName) errors.roleName = "Role is required.";
        //setting errors
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;

        try {
            const payload = { roleValue: formData.roleName };
            const response = await axios.post(
                `${BASE_URL}/api/Roles`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                setFormData({ roleName: "" });
                setAddRoleModalPreview(false);
                //success modal
                setSuccessModalConfig({
                    title: "Role Added Successfully",
                    subtitle: "The new Role has been saved to the system.",
                    icon: "CheckCircle",
                    buttonText: "Ok",
                    onButtonClick: () => {
                        setIsSuccessModalOpen(false);
                        refreshData();
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
    const handleDeleteRole = () => {
        alert("Role Deletd Sucessfully!");
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
                ajaxURL: `${BASE_URL}/api/Roles/tabulator`,
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
                layout: "fitColumns",
                responsiveLayout: "collapse",
                placeholder: "No matching records found",
                columns: [
                    {
                        title: "Role Id",
                        minWidth: 100,
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
                        title: "Role",
                        minWidth: 200,
                        responsive: 0,
                        field: "name",
                        vertAlign: "middle",
                        print: false,
                        download: false,
                        formatter(cell) {
                            const response: any = cell.getData();
                            return `<div>
                        <div class="font-medium whitespace-nowrap">${response.roleValue}</div> </div>`;
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
                                        setEditingRoleId(rowData.id)
                                        setEditRoleModalPreview(true)
                                    },
                                },
                                // {
                                //     label: "Delete",
                                //     icon: "trash-2",
                                //     action: "delete",
                                //     classes: "bg-red-100 hover:bg-red-200 text-red-800",
                                //     onClick: () => {
                                //         const rowData = cell.getRow().getData();
                                //         console.log("Delete clicked:", rowData);
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
                <h2 className="mr-auto text-lg font-medium">Employee Roles</h2>
                <div className="flex w-full mt-4 sm:w-auto sm:mt-0">
                    <Button
                        variant="primary"
                        className="mr-2 shadow-md"
                        onClick={() => {
                            setAddRoleModalPreview(true);
                        }}
                    >
                        Add New Role
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
            {/* BEGIN: Add New Role Modal Content */}
            <Dialog
                open={addNewRoleModalPreview}
                onClose={() => {
                    setAddRoleModalPreview(false);
                }}
                staticBackdrop
            >
                <Dialog.Panel>
                    <Dialog.Title>
                        <h2 className="mr-auto text-base font-medium">
                            Add New Role
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
                            <FormLabel htmlFor="size">Role</FormLabel>
                            <FormInput
                                id="size"
                                type="text"
                                placeholder="Role"
                                value={formData.roleName}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData({ ...formData, roleName: e.target.value })
                                    if (value.trim()) {
                                        setFormErrors((prev) => ({ ...prev, roleName: "" }));
                                    }
                                }}
                            />
                            {formErrors.roleName && <p className="text-red-500 text-sm">{formErrors.roleName}</p>}
                        </div>
                    </Dialog.Description>
                    <Dialog.Footer>
                        <Button
                            type="button"
                            variant="outline-secondary"
                            onClick={() => {
                                setAddRoleModalPreview(false);
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
            {/* END: Add New Role Modal Content */}

            {/* BEGIN: Edit Existing Role Modal Content */}
            <EditRoleModal onClose={() => { setEditRoleModalPreview(false) }} open={editRoleModalPreview} roleID={editingRoleId} onSuccess={refreshData} />
            {/* BEGIN: Edit Existing Role Modal Content */}

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
                            onClick={handleDeleteRole}
                        >
                            Delete
                        </Button>
                    </div>
                </Dialog.Panel>
            </Dialog>
            {/* END: Delete Confirmation Modal */}
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
