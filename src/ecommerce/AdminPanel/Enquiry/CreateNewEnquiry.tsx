import { useEffect, useState } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel, FormTextarea } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config";
import { SuccessModalConfig } from "../CommonModals/SuccessModal/SuccessModalConfig";
import SuccessModal from "../CommonModals/SuccessModal/SuccessModal";
import { useNavigate } from "react-router-dom";


interface CreateNewEnquiryModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const CreateNewEnquiryModal: React.FC<CreateNewEnquiryModalProps> = ({ open, onClose, onSuccess }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    console.log("token from localStorage:", token);

    const username = localStorage.getItem("username") || "";
    console.log("Username from localStorage:", username);
    // Success modal
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successModalConfig, setSuccessModalConfig] = useState<SuccessModalConfig>({
        title: "",
        subtitle: "",
        icon: "CheckCircle",
        buttonText: "OK",
        onButtonClick: () => { },
    });

    // Form data
    const [formData, setFormData] = useState({
        name: "",
        mobileNumber: "",
        product: "",
        primaryDiscussion: "",
        feedBack: "",
        followupDate: "",
        enquiryTakenBy: "",
    });

    useEffect(() => {
        const username = localStorage.getItem("username") || "";
        setFormData(prev => ({ ...prev, enquiryTakenBy: username }));
    }, []);

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Clear form
    const clearFormData = () => {
        setFormData({
            name: "",
            mobileNumber: "",
            product: "",
            primaryDiscussion: "",
            feedBack: "",
            followupDate: "",
            enquiryTakenBy: username,
        });
    };

    // Validation
    const validate = () => {
        const errors: Record<string, string> = {};
        if (!formData.name) errors.name = "Name is required.";
        if (!formData.mobileNumber) {
            errors.mobileNumber = "Mobile number is required.";
        } else if (!/^\d{10}$/.test(formData.mobileNumber.trim())) {
            errors.mobileNumber = "Mobile number must be exactly 10 digits.";
        }
        if (!formData.product) errors.product = "Product is required.";
        if (!formData.primaryDiscussion) errors.primaryDiscussion = "Primary Discussion is required.";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Submit
    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.post(`${BASE_URL}/api/enquiry`, formData, { headers });

            if (response.status === 200 || response.status === 201) {
                clearFormData();
                setFormErrors({});
                onClose();

                setSuccessModalConfig({
                    title: "Enquiry Created Successfully",
                    subtitle: "The new enquiry has been saved to the system.",
                    icon: "CheckCircle",
                    buttonText: "Ok",
                    onButtonClick: () => setIsSuccessModalOpen(false),
                });
                setIsSuccessModalOpen(true);

                onSuccess?.();

                // Redirect immediately after saving
                navigate("/Enquiry-List");  // <-- Move navigate here
            }
            else {
                throw new Error("Unexpected response");
            }
        } catch (error: any) {
            console.error("Submission error:", error);
            setSuccessModalConfig({
                title: "Error",
                subtitle: error.response?.data?.message || "Failed to create enquiry",
                icon: "XCircle",
                buttonText: "Ok",
                onButtonClick: () => setIsSuccessModalOpen(false),
            });
            setIsSuccessModalOpen(true);
        }
    };


    return (
        <>
            <Dialog open={open} 
             onClose={onClose}
             staticBackdrop 
             size="lg">
                <Dialog.Panel>
                    <Dialog.Title>
                        <h2 className="mr-auto text-base font-medium">Create New Enquiry</h2>
                    </Dialog.Title>

                    <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-3">
                        <div className="col-span-12 sm:col-span-6">
                            <FormLabel htmlFor="name">Name</FormLabel>
                            <FormInput
                                id="name"
                                type="text"
                                placeholder="Enter Name"
                                value={formData.name}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData({ ...formData, name: value });
                                    if (value.trim()) setFormErrors((prev) => ({ ...prev, name: "" }));
                                }}
                            />
                            {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
                        </div>

                        <div className="col-span-12 sm:col-span-6">
                            <FormLabel htmlFor="mobileNumber">Mobile Number</FormLabel>
                            <FormInput
                                id="mobileNumber"
                                type="text"
                                placeholder="Enter Mobile Number"
                                value={formData.mobileNumber}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData({ ...formData, mobileNumber: value });
                                    if (value.trim()) setFormErrors((prev) => ({ ...prev, mobileNumber: "" }));
                                }}
                            />
                            {formErrors.mobileNumber && <p className="text-red-500 text-sm">{formErrors.mobileNumber}</p>}
                        </div>

                        <div className="col-span-12 sm:col-span-6">
                            <FormLabel htmlFor="product">Product</FormLabel>
                            <FormInput
                                id="product"
                                type="text"
                                placeholder="Product Name"
                                value={formData.product}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData({ ...formData, product: value });
                                    if (value.trim()) setFormErrors((prev) => ({ ...prev, product: "" }));
                                }}
                            />
                            {formErrors.product && <p className="text-red-500 text-sm">{formErrors.product}</p>}
                        </div>

                        <div className="col-span-12 sm:col-span-6">
                            <FormLabel htmlFor="followupDate">Follow-up Date</FormLabel>
                            <FormInput
                                id="followupDate"
                                type="date"
                                value={formData.followupDate}
                                onChange={(e) => setFormData({ ...formData, followupDate: e.target.value })}
                            />
                        </div>

                        <div className="col-span-12">
                            <FormLabel htmlFor="primaryDiscussion">Primary Discussion</FormLabel>
                            <FormTextarea
                                id="primaryDiscussion"
                                placeholder="Primary Discussion"
                                value={formData.primaryDiscussion}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData({ ...formData, primaryDiscussion: value });
                                    if (value.trim()) setFormErrors((prev) => ({ ...prev, primaryDiscussion: "" }));
                                }}
                            />
                            {formErrors.primaryDiscussion && (
                                <p className="text-red-500 text-sm">{formErrors.primaryDiscussion}</p>
                            )}
                        </div>

                        <div className="col-span-12">
                            <FormLabel htmlFor="feedBack">Feedback</FormLabel>
                            <FormTextarea
                                id="feedBack"
                                placeholder="Feedback"
                                value={formData.feedBack}
                                onChange={(e) => setFormData({ ...formData, feedBack: e.target.value })}
                            />
                        </div>

                        <div className="col-span-12">
                            <FormLabel>Enquiry Taken By</FormLabel>
                            <FormInput type="text" value={formData.enquiryTakenBy} disabled />
                        </div>
                    </Dialog.Description>

                    <Dialog.Footer>
                        <Button type="button"
  variant="outline-secondary"
  onClick={onClose}
  className="w-20 mr-1">
                            Cancel
                        </Button>
                        <Button type="button" variant="primary" className="w-20" onClick={handleSubmit}>
                            Save
                        </Button>
                    </Dialog.Footer>
                </Dialog.Panel>
            </Dialog>

            <SuccessModal open={isSuccessModalOpen} 
            onClose={() => setIsSuccessModalOpen(false)} 
            {...successModalConfig} />
        </>
    )
}   

export default CreateNewEnquiryModal;
