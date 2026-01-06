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

interface EditCollectionModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    collectionId: number | null;
}

const EditCollectionModal: React.FC<EditCollectionModalProps> = ({
    open,
    onClose,
    onSuccess,
    collectionId
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
    const dropzoneRef = useRef<DropzoneElement | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        sequenceNo: 0,
        isActive: true
    });
    const [existingImage, setExistingImage] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Load collection data when modal opens or collectionId changes
    useEffect(() => {
        const fetchCollectionData = async () => {
            if (open && collectionId) {
                setIsLoading(true);
                try {
                    const response = await axios.get(
                        `${BASE_URL}/api/inventory/Categories/${collectionId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );

                    const collection = response.data;
                    setFormData({
                        name: collection.name,
                        sequenceNo: collection.sequenceNo,
                        isActive: collection.isActive
                    });

                    if (collection.imagePath) {
                        setExistingImage(`${BASE_URL}${collection.imagePath}`);
                    }
                } catch (error) {
                    console.error("Error fetching collection:", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchCollectionData();
    }, [open, collectionId, token]);

    // Reset form when modal closes
    useEffect(() => {
        if (!open) {
            setFormData({
                name: "",
                sequenceNo: 0,
                isActive: true
            });
            setExistingImage(null);
            setFormErrors({});
            if (dropzoneRef.current) {
                dropzoneRef.current.dropzone?.removeAllFiles(true);
            }
        }
    }, [open]);

    const handleSubmit = async () => {
        const errors: Record<string, string> = {};
        if (!formData.name) {
            errors.name = "Category name is required.";
        }

        const dz = dropzoneRef.current?.dropzone;
        const acceptedFiles = dz?.getAcceptedFiles() || [];
        const rejectedFiles = dz?.getRejectedFiles() || [];

        // Only validate image if new file is selected
        if (acceptedFiles.length > 0 || rejectedFiles.length > 0) {
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
        }

        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;

        try {
            setIsLoading(true);

            // Create FormData for the image
            const imageFormData = new FormData();
            if (acceptedFiles.length > 0) {
                imageFormData.append("image", acceptedFiles[0]);
            }

            // Prepare query parameters
            const params = new URLSearchParams({
                name: formData.name,
                sequenceNo: formData.sequenceNo.toString(),
                isActive: formData.isActive ? "1" : "0"
            });

            // Make the API call
            const response = await axios.put(
                `${BASE_URL}/api/inventory/Categories/update-with-image/${collectionId}?${params}`,
                imageFormData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            if (response.status === 200) {
                // Close modal and show success message
                onClose();
                setSuccessModalConfig({
                    title: "Category Updated Successfully",
                    subtitle: "The Category has been updated in the system.",
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
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} staticBackdrop>
                <Dialog.Panel>
                    <Dialog.Title>
                        <h2 className="mr-auto text-base font-medium">
                            Edit Category
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
                            <FormLabel htmlFor="name">Category Name</FormLabel>
                            <FormInput
                                id="name"
                                type="text"
                                placeholder="Category name"
                                value={formData.name}
                                onChange={(e) => {
                                    setFormData({ ...formData, name: e.target.value });
                                    if (e.target.value.trim()) {
                                        setFormErrors(prev => ({
                                            ...prev,
                                            name: ""
                                        }));
                                    }
                                }}
                                disabled={isLoading}
                            />
                            {formErrors.name && (
                                <p className="text-red-500 text-sm">{formErrors.name}</p>
                            )}
                        </div>

                        <div className="col-span-12 sm:col-span-6">
                            <FormLabel htmlFor="sequenceNo">Sequence Number</FormLabel>
                            <FormInput
                                id="sequenceNo"
                                type="number"
                                placeholder="Sequence"
                                value={formData.sequenceNo}
                                onChange={(e) => {
                                    setFormData({ ...formData, sequenceNo: parseInt(e.target.value) || 0 });
                                }}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="col-span-12 sm:col-span-6">
                            <FormLabel htmlFor="isActive">Active Status</FormLabel>
                            <div className="mt-2">
                                <FormSwitch>
                                    <FormSwitch.Input
                                        id="isActive"
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => {
                                            setFormData({ ...formData, isActive: e.target.checked });
                                        }}
                                        disabled={isLoading}
                                    />
                                </FormSwitch>
                            </div>
                        </div>

                        <div className="col-span-12 sm:col-span-12">
                            {existingImage && (
                                <div className="mb-4">
                                    <FormLabel>Current Image</FormLabel>
                                    <div className="mt-2">
                                        <img
                                            src={existingImage}
                                            alt="Current category"
                                            className="w-32 h-32 object-contain border rounded"
                                        />
                                    </div>
                                </div>
                            )}

                            <FormLabel htmlFor="modal-form-2">New Image (Optional)</FormLabel>
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
                                            setFormErrors(prev => ({ ...prev, images: "" }));
                                        });
                                        this.on("error", function (file, message) {
                                            setFormErrors(prev => ({ ...prev, images: message as string }));
                                        });
                                    },
                                }}
                                className="dropzone"
                            // disabled={isLoading}
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
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            type="button"
                            className="w-20"
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? "Saving..." : "Save"}
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

export default EditCollectionModal;