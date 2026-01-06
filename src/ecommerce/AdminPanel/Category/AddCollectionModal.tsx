import _, { set } from "lodash";
import clsx from "clsx";
import { useState, useRef } from "react";
import fakerData from "@/utils/faker";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel, FormSelect, FormSwitch, } from "@/components/Base/Form";
import Lucide from "@/components/Base/Lucide";
import { Dialog, Menu } from "@/components/Base/Headless";
import "@/assets/css/vendors/tabulator.css";
import Dropzone, { DropzoneElement } from "@/components/Base/Dropzone";
import axios from "axios";
import { SuccessModalConfig } from "../CommonModals/SuccessModal/SuccessModalConfig";
import SuccessModal from "../CommonModals/SuccessModal/SuccessModal";
import { BASE_URL } from "@/ecommerce/config/config";


interface AddCollectionModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const AddCollectionModal: React.FC<AddCollectionModalProps> = ({ open, onClose, onSuccess }) => {

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


    //Image/file Upload control reference
    const dropzoneRef = useRef<DropzoneElement | null>(null);

    //Collection Modal (useState)
    const [formData, setFormData] = useState({
        collectionName: ""
    })

    //Validation Errors
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    //Form Submission: Save button click
    const handleSubmit = async () => {
        const errors: Record<string, string> = {};

        if (!formData.collectionName) errors.collectionName = "Category name is required.";

        const dz = dropzoneRef.current?.dropzone;
        const acceptedFiles = dz?.getAcceptedFiles() || [];
        const rejectedFiles = dz?.getRejectedFiles() || [];

        // 🧠 Case: Rejected files present
        if (rejectedFiles.length > 0) {
            if (rejectedFiles.length > 1 || acceptedFiles.length > 0) {
                errors.images = "Please select only one image.";
            } else {
                const rejectedFile = rejectedFiles[0];
                if (rejectedFile.size > 1024 * 1024) {
                    errors.images = "Image size must be less than or equal to 1MB.";
                } else {
                    errors.images = "Invalid image file.";
                }
            }
        }

        // 🧠 Case: No valid files
        if (acceptedFiles.length === 0 && rejectedFiles.length === 0) {
            errors.images = "Please select an image.";
        }

        //setting errors
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;

        // Proceed with submission
        const data = new FormData();
        data.append("image", acceptedFiles[0]);

        try {
            const response = await axios.post(`${BASE_URL}/api/inventory/Categories/upload-image?name=${formData.collectionName}&sequenceNo=${0}&isActive=${1}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.status === 200 || response.status === 201) {
                //clear form data after submission
                setFormData({ collectionName: "" });
                setFormErrors({});
                dropzoneRef.current?.dropzone?.removeAllFiles(true);
                onClose();// close form modal

                //success modal
                setSuccessModalConfig({
                    title: "Category Added Successfully",
                    subtitle: "The new Category has been saved to the system.",
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
            alert(error.response?.data?.message || "Something went wrong.");
        }
    }


    return (<>
        <Dialog
            open={open}
            onClose={onClose}
            staticBackdrop
        >
            <Dialog.Panel>
                <Dialog.Title>
                    <h2 className="mr-auto text-base font-medium">
                        Add New Category
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
                        <FormLabel htmlFor="collectionName">Category Name</FormLabel>
                        <FormInput
                            id="collectionName"
                            type="text"
                            placeholder="category"
                            value={formData.collectionName}
                            onChange={(e) => {
                                const value = e.target.value;
                                setFormData({ ...formData, collectionName: e.target.value })
                                if (value.trim()) {
                                    setFormErrors((prev) => ({ ...prev, collectionName: "" }));
                                }
                            }}
                        />
                        {formErrors.collectionName && <p className="text-red-500 text-sm">{formErrors.collectionName}</p>}
                    </div>
                    <div className="col-span-12 sm:col-span-12">
                        <FormLabel htmlFor="modal-form-2">Image</FormLabel>
                        <Dropzone
                            getRef={(el) => {
                                dropzoneRef.current = el;
                            }}
                            options={{
                                url: "https://httpbin.org/post",
                                autoProcessQueue: false,
                                thumbnailWidth: 150,
                                maxFilesize: 1,
                                maxFiles: 1,
                                acceptedFiles: "image/*",
                                addRemoveLinks: true,
                                previewTemplate: `
                                <div class="dz-preview dz-file-preview">
                                <div class="dz-image"><img data-dz-thumbnail /></div>
                                <div class="dz-details">
                                    <div class="dz-filename"><span data-dz-name></span></div>
                                    <div class="dz-size" data-dz-size></div>
                                </div>
                                </div>`,
                                init: function () {
                                    this.on("addedfile", function () {
                                        setFormErrors((prev) => ({ ...prev, images: "" }));
                                    });

                                    this.on("error", function (file, message) {
                                        setFormErrors((prev) => ({ ...prev, images: message as string }));
                                    });
                                },
                            }}
                            className="dropzone"
                        >
                            <div className="text-center text-gray-600 text-sm">
                                Drop images here or click to upload
                            </div>
                        </Dropzone>
                        {formErrors.images && (
                            <p className="text-red-500 text-sm mt-2">{formErrors.images}</p>
                        )}
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

export default AddCollectionModal;