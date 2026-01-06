import _ from "lodash";
import { useEffect, useState } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel, FormTextarea, } from "@/components/Base/Form";
import Lucide from "@/components/Base/Lucide";
import { Dialog, Menu } from "@/components/Base/Headless";
import "@/assets/css/vendors/tabulator.css";
import TomSelect from "@/components/Base/TomSelect";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config";
import { SuccessModalConfig } from "../CommonModals/SuccessModal/SuccessModalConfig";
import SuccessModal from "../CommonModals/SuccessModal/SuccessModal";


interface CreateNewShopModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

//for role dropdown
interface RoleOptions {
    id: string;
    roleValue: string;
}

const CreateNewShopModal: React.FC<CreateNewShopModalProps> = ({ open, onClose, onSuccess }) => {

    const token = localStorage.getItem("token");

    //Success Modal config
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successModalConfig, setSuccessModalConfig] = useState<SuccessModalConfig>({
        title: "",
        subtitle: "",
        icon: "CheckCircle",
        buttonText: "OK",
        onButtonClick: () => { }
    });

    //after file submission
    const clearFormData = () => {
        setFormData({
            title: "",
            href: "",
            mobileNo: "",
            address: "",
            latitude: "",
            longitude: "",
            isActive: true
        })
    }

    //set Roles to dropdown 
    const [rolesForTom, setRolesForTom] = useState<RoleOptions[]>([]);
    //fetch all Roles for Tom selector
    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const response = await axios.get<RoleOptions[]>(`${BASE_URL}/api/Roles`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setRolesForTom(response.data);
            } catch (error) {
                console.error('Error fetching roles:', error);
            }
        };
        fetchCollections();
    }, [token]);

    //Shop Modal (useState)
    const [formData, setFormData] = useState({
        //id: number;
        title: "",
        href: "",
        mobileNo: "",
        address: "",
        latitude: "",
        longitude: "",
        isActive: true,
    })

    //Validation Errors
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    //Form Submission: Save button click
    const handleSubmit = async () => {
        const errors: Record<string, string> = {};

        if (!formData.title) errors.title = "Title is required.";
        if (!formData.href) errors.href = "Href is required.";
        if (!formData.address) errors.address = "Address is required.";

        const decimalRegex = /^-?\d+(\.\d+)?$/;

        if (!formData.latitude.trim()) {
            errors.latitude = "Latitude is required.";
        } else if (!decimalRegex.test(formData.latitude)) {
            errors.latitude = "Latitude must be a valid decimal number.";
        }

        if (!formData.longitude.trim()) {
            errors.longitude = "Longitude is required.";
        } else if (!decimalRegex.test(formData.longitude)) {
            errors.longitude = "Longitude must be a valid decimal number.";
        }


        //Mobile Number Validation
        const mobile = formData.mobileNo.trim();
        if (!mobile) {
            errors.mobileNo = "Mobile number is required.";
        } else if (!/^\d+$/.test(mobile)) {
            errors.mobileNo = "Mobile number must contain only digits.";
        } else if (mobile.length !== 10) {
            errors.mobileNo = "Mobile number must be exactly 10 digits.";
        }

        //setting errors
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;

        // ✅ Convert to float
        const latitude = parseFloat(formData.latitude);
        const longitude = parseFloat(formData.longitude);

        const payload = {
            title: formData.title,
            href: formData.href,
            address: formData.address,
            mobile: formData.mobileNo,
            latitude,
            longitude,
            isActive: formData.isActive ? 1 : 0
        };

        //API CALL
        try {
            const response = await axios.post(
                `${BASE_URL}/api/inventory/shops`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                //clear form data
                clearFormData();
                setFormErrors({});
                onClose();

                //success modal
                setSuccessModalConfig({
                    title: "Shop Added Successfully",
                    subtitle: "The Shop has been saved to the system.",
                    icon: "CheckCircle",
                    buttonText: "Ok",
                    onButtonClick: () => {
                        setIsSuccessModalOpen(false);
                    }
                });
                setIsSuccessModalOpen(true);
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                throw new Error("Unexpected response status");
            }
        } catch (error: any) {
            console.error("Submission error:", error);
            alert(error.response?.data?.detail || "Something went wrong");
        }
    }


    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                staticBackdrop
                size="lg"
            >
                <Dialog.Panel>
                    <Dialog.Title>
                        <h2 className="mr-auto text-base font-medium">
                            Shop Details
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
                            <FormLabel htmlFor="title">Title</FormLabel>
                            <FormInput
                                id="title"
                                type="text"
                                placeholder="Title"
                                value={formData.title}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData({ ...formData, title: e.target.value })
                                    if (value.trim()) {
                                        setFormErrors((prev) => ({ ...prev, title: "" }));
                                    }
                                }}
                            />
                            {formErrors.title && <p className="text-red-500 text-sm">{formErrors.title}</p>}
                        </div>
                        <div className="col-span-12 sm:col-span-12">
                            <FormLabel htmlFor="href">Href</FormLabel>
                            <FormInput
                                id="href"
                                type="text"
                                placeholder="Href"
                                value={formData.href}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData({ ...formData, href: e.target.value })
                                    if (value.trim()) {
                                        setFormErrors((prev) => ({ ...prev, href: "" }));
                                    }
                                }}
                            />
                            {formErrors.href && <p className="text-red-500 text-sm">{formErrors.href}</p>}
                        </div>
                        <div className="col-span-12 sm:col-span-12">
                            <FormLabel htmlFor="add">Address</FormLabel>
                            <FormTextarea
                                id="add"
                                placeholder="Address"
                                rows={4}
                                value={formData.address}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData({ ...formData, address: e.target.value });
                                    if (value.trim()) {
                                        setFormErrors((prev) => ({ ...prev, address: "" }));
                                    }
                                }}
                                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-primary focus:outline-none"
                            ></FormTextarea>
                            {formErrors.address && (
                                <p className="text-red-500 text-sm">{formErrors.address}</p>
                            )}
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                            <FormLabel htmlFor="lat">Latitude</FormLabel>
                            <FormInput
                                id="lat"
                                type="text"
                                placeholder="Latitude"
                                value={formData.latitude}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // Allow empty input or a valid decimal value
                                    if (value === '' || /^-?\d*(\.\d*)?$/.test(value)) {
                                        setFormData({ ...formData, latitude: value });
                                        if (value.trim()) {
                                            setFormErrors((prev) => ({ ...prev, latitude: "" }));
                                        }
                                    }
                                }}
                            />
                            {formErrors.latitude && <p className="text-red-500 text-sm">{formErrors.latitude}</p>}
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                            <FormLabel htmlFor="long">Longitude</FormLabel>
                            <FormInput
                                id="long"
                                type="text"
                                placeholder="Longitude"
                                value={formData.longitude}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // Allow empty input or a valid decimal value
                                    if (value === '' || /^-?\d*(\.\d*)?$/.test(value)) {
                                        setFormData({ ...formData, longitude: value });
                                        if (value.trim()) {
                                            setFormErrors((prev) => ({ ...prev, longitude: "" }));
                                        }
                                    }
                                }}
                            />
                            {formErrors.longitude && <p className="text-red-500 text-sm">{formErrors.longitude}</p>}
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                            <FormLabel htmlFor="mobileNo">Mobile No</FormLabel>
                            <FormInput
                                id="mobileNo"
                                type="text"
                                placeholder="Mobile Number"
                                value={formData.mobileNo}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData({ ...formData, mobileNo: e.target.value })
                                    if (value.trim()) {
                                        setFormErrors((prev) => ({ ...prev, mobileNo: "" }));
                                    }
                                }}
                            />
                            {formErrors.mobileNo && <p className="text-red-500 text-sm">{formErrors.mobileNo}</p>}
                        </div>
                    </Dialog.Description>
                    <Dialog.Footer>
                        <Button
                            type="button"
                            variant="outline-secondary"
                            onClick={onClose}
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
            <SuccessModal
                open={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                {...successModalConfig}
            />
            {/* Success Modal : END*/}
        </>
    )
}

export default CreateNewShopModal;