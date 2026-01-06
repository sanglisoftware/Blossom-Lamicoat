import { useState, useRef, useEffect, createRef } from "react";
import Button from "@/components/Base/Button";
import { FormInput } from "@/components/Base/Form";
import Lucide from "@/components/Base/Lucide";
import { Dialog } from "@/components/Base/Headless";
import "@/assets/css/vendors/tabulator.css";
import { createIcons, icons } from "lucide";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { BASE_URL } from "@/ecommerce/config/config";
import axios from "axios";
import { log } from "console";

function EnquiryList() {
    const token = localStorage.getItem("token");

    const [statusConfirmationModal, setStatusConfirmationModal] = useState(false);
    const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
    const [statusLabel, setStatusLabel] = useState("");
    const [activeStatusRowId, setActiveStatusRowId] = useState("0");
    const [isActiveEnquiry, setIsActiveEnquiry] = useState("0");
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [filterValue, setFilterValue] = useState("");

    const tableRef = createRef<HTMLDivElement>();
    const tabulator = useRef<Tabulator>();
    const filterValueRef = useRef(filterValue);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        filterValueRef.current = filterValue;
    }, [filterValue]);

    const initTabulator = () => {
        if (!tableRef.current) return;

        tabulator.current = new Tabulator(tableRef.current, {
            ajaxURL: `${BASE_URL}/api/enquiry/tabulator`,
            ajaxConfig: {
                method: "GET",
                headers: { Authorization: token ? `Bearer ${token}` : "" },
            },
            ajaxParams: () => {
                // fallback defaults
                const params: any = {
                    page: 1,
                    size: 10,
                };

                if (filterValueRef.current) {
                    params["filter[0][type]"] = "like";
                    params["filter[0][value]"] = filterValueRef.current;
                }

                return params;
            },
            ajaxResponse: (url, params, response) => {
                console.log("Tabulator AJAX Response:", response); // ✅ log
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
            placeholder: "No matching records found",
            responsiveLayoutCollapseFormatter: (data) => {
                const wrapper = document.createElement("div");
                for (let key in data) {
                    if (key !== "id") {
                        const rowDiv = document.createElement("div");
                        rowDiv.innerHTML = `<strong>${key}:</strong> ${data[key] ?? ""}`;
                        wrapper.appendChild(rowDiv);
                    }
                }
                return wrapper;
            },
            columns: [
                { title: "ID", field: "id", widthShrink: 1, minWidth: 60, responsive: 0 },
                { title: "Name", field: "name", widthShrink: 1, minWidth: 120, responsive: 0 },
                { title: "Number", field: "mobileNumber", widthShrink: 1, minWidth: 130, responsive: 1 },
                { title: "Product", field: "product", widthShrink: 1, minWidth: 130, responsive: 1 },
                { title: "Discussion", field: "primaryDiscussion", widthShrink: 1, minWidth: 180, responsive: 2 },
                { title: "FeedBack", field: "feedBack", widthShrink: 1, minWidth: 150, responsive: 2 },
                { title: "Followup Date", field: "followupDate", widthShrink: 1, minWidth: 140, responsive: 2 },
                { title: "Taken", field: "enquiryTakenBy",  responsive: 0 },
            ],
        });

        // render icons after table is built
        tabulator.current.on("renderComplete", () => {
            createIcons({ icons, attrs: { "stroke-width": 1.5 }, nameAttr: "data-lucide" });
        });
    };

    const refreshData = () => {
        tabulator.current?.setPage(1).then(() => tabulator.current?.replaceData());
    };

    const handleFilterChange = (value: string) => {
        setFilterValue(value);
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => refreshData(), 300);
    };

    useEffect(() => {
        initTabulator();
        return () => {
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        };
    }, []);

    const handleStatus = async () => {
        try {
            await axios.patch(`${BASE_URL}/api/enquiry/${activeStatusRowId}`, { isActive: Number(isActiveEnquiry) }, {
                headers: { Authorization: token ? `Bearer ${token}` : "" },
            });
            setNotification({ message: "Status updated successfully", type: "success" });
            refreshData();
        } catch {
            setNotification({ message: "Failed to update status", type: "error" });
        } finally {
            setStatusConfirmationModal(false);
        }
    };

    const handleDeleteEnquiry = () => {
        setNotification({ message: "Enquiry deleted successfully", type: "success" });
        setDeleteConfirmationModal(false);
        refreshData();
    };

    return (
        <>
            {notification && (
                <div className={`fixed top-5 right-5 px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse ${notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    {notification.message}
                </div>
            )}

            {/* <div className="flex flex-col items-center mt-8 intro-y sm:flex-row">
                <h2 className="mr-auto text-lg font-medium">Enquiry List</h2>
            </div> */}

            <div className="p-5 mt-5 intro-y box">
                <div className="xl:flex sm:mr-auto">
                    <div className="items-center mt-2 sm:flex sm:mr-4 xl:mt-0">
                        <label className="flex-none w-12 mr-2 xl:w-auto xl:flex-initial">Search</label>
                        <FormInput
                            value={filterValue}
                            onChange={(e) => handleFilterChange(e.target.value)}
                            type="text"
                            className="mt-2 sm:w-40 2xl:w-full sm:mt-0"
                            placeholder="Search globally..."
                        />
                    </div>
                </div>
                <div className="overflow-x-auto scrollbar-hidden">
                    <div id="tabulator" ref={tableRef} className="mt-5"></div>
                </div>
            </div>

            {/* Status Confirmation Modal */}
            <Dialog open={statusConfirmationModal} onClose={() => setStatusConfirmationModal(false)}>
                <Dialog.Panel>
                    <div className="p-5 text-center">
                        <Lucide icon="EyeOff" className="w-16 h-16 mx-auto mt-3 text-danger" />
                        <div className="mt-5 text-3xl">Are you sure?</div>
                        <div className="mt-2 text-slate-500">
                            Do you really want to <strong>{statusLabel}</strong> this enquiry?
                        </div>
                    </div>
                    <div className="px-5 pb-8 text-center">
                        <Button variant="outline-secondary" type="button" onClick={() => setStatusConfirmationModal(false)} className="w-24 mr-1">Cancel</Button>
                        <Button variant={statusLabel === "Show" ? "success" : "danger"} type="button" className="w-24" onClick={handleStatus}>{statusLabel}</Button>
                    </div>
                </Dialog.Panel>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={deleteConfirmationModal} onClose={() => setDeleteConfirmationModal(false)}>
                <Dialog.Panel>
                    <div className="p-5 text-center">
                        <Lucide icon="Trash" className="w-16 h-16 mx-auto mt-3 text-danger" />
                        <div className="mt-5 text-3xl">Are you sure?</div>
                        <div className="mt-2 text-slate-500">
                            Do you really want to <strong className="text-danger">Delete</strong> this enquiry?
                        </div>
                    </div>
                    <div className="px-5 pb-8 text-center">
                        <Button variant="outline-secondary" type="button" onClick={() => setDeleteConfirmationModal(false)} className="w-24 mr-1">Cancel</Button>
                        <Button variant="danger" type="button" className="w-24" onClick={handleDeleteEnquiry}>Delete</Button>
                    </div>
                </Dialog.Panel>
            </Dialog>
        </>
    );
}

export default EnquiryList;
