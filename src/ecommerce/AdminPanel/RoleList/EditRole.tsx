import { useState, useRef, useEffect } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel, FormSwitch } from "@/components/Base/Form";
import Lucide from "@/components/Base/Lucide";
import { Dialog, Menu } from "@/components/Base/Headless";
import Dropzone, { DropzoneElement } from "@/components/Base/Dropzone";
import axios from "axios";
import { SuccessModalConfig } from "../CommonModals/SuccessModal/SuccessModalConfig";
import SuccessModal from "../CommonModals/SuccessModal/SuccessModal";
import { BASE_URL } from "@/ecommerce/config/config";

interface EditRoleModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    roleID: number | null;
}

const EditRoleModal: React.FC<EditRoleModalProps> = ({
    open,
    onClose,
    onSuccess,
    roleID
}) => {
    const token = localStorage.getItem("token");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successModalConfig, setSuccessModalConfig] = useState<SuccessModalConfig>({
        title: "",
        subtitle: "",
        icon: "CheckCircle",
        buttonText: "OK",
        onButtonClick: () => { }
    });

    const [formData, setFormData] = useState({
        roleName: "",
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    //Form Submission: Save button click
    const handleSubmit = async () => {
        const errors: Record<string, string> = {};
        if (!formData.roleName) errors.roleName = "Role is required.";
        //setting errors
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;

        try {
            const payload = { id: roleID, roleValue: formData.roleName };
            const response = await axios.put(
                `${BASE_URL}/api/Roles/${roleID}`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                setFormData({ roleName: "" });
                onClose();
                //success modal
                setSuccessModalConfig({
                    title: "Role Updated Successfully",
                    subtitle: "The Role has been updated to the system.",
                    icon: "CheckCircle",
                    buttonText: "Ok",
                    onButtonClick: () => {
                        setIsSuccessModalOpen(false);
                        if (onSuccess) onSuccess();
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

    // Load collection data when modal opens or collectionId changes
    useEffect(() => {
        const fetchRoleData = async () => {
            if (open && roleID) {
                setIsLoading(true);
                try {
                    const response = await axios.get(
                        `${BASE_URL}/api/Roles/${roleID}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );
                    const role = response.data;
                    setFormData({
                        roleName: role.roleValue
                    });
                } catch (error) {
                    console.error("Error fetching collection:", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchRoleData();
    }, [open, roleID, token]);

    return (
        <>
            <Dialog open={open} onClose={onClose} staticBackdrop>
                <Dialog.Panel>
                    <Dialog.Title>
                        <h2 className="mr-auto text-base font-medium">
                            Edit Designation
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
                            <FormLabel htmlFor="size">Designation</FormLabel>
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
        </>
    );
};

export default EditRoleModal;