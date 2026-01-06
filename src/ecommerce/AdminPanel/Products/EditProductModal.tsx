import _ from "lodash";
import { useState, useRef, useEffect } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel, FormSelect, FormSwitch } from "@/components/Base/Form";
import Lucide from "@/components/Base/Lucide";
import { Dialog } from "@/components/Base/Headless";
import "@/assets/css/vendors/tabulator.css";
import Dropzone, { DropzoneElement } from "@/components/Base/Dropzone";
import TomSelect from "@/components/Base/TomSelect";
import React from "react";
import { ClassicEditor } from "@/components/Base/Ckeditor";
import { colors, Color } from "@/ecommerce/AdminPanel/ProductColors/colors";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config";
import { SuccessModalConfig } from "../CommonModals/SuccessModal/SuccessModalConfig";
import SuccessModal from "../CommonModals/SuccessModal/SuccessModal";

interface EditProductModalProps {
    open: boolean;
    onClose: () => void;
    productId: string | null;
    onProductUpdated: () => void;
}

interface CollectionOptions {
    id: string;
    name: string;
}

interface SizeOptions {
    id: string;
    sizeValue: string;
}

interface ProductData {
    id: string;
    categoryId: string;
    name: string;
    productCode: string;
    color: string;
    sizeId: string;
    videoUrl: string;
    price: number;
    gst: number;
    hsnCode: string;
    shortDescription: string;
    detailDescription: string;
    isFavourite: boolean;
    isStandalone: boolean;
    imagePaths: any;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
    open,
    onClose,
    productId,
    onProductUpdated
}) => {
    const token = localStorage.getItem("token");
    const [isLoading, setIsLoading] = useState(true);
    const [editorData, setEditorData] = useState("");
    const [isStandAlone, setIsStandAlone] = useState(false);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
    const dropzoneRef = useRef<DropzoneElement | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [collectionsForTom, setCollectionsForTom] = useState<CollectionOptions[]>([]);
    const [sizeForTom, setSizeForTom] = useState<SizeOptions[]>([]);

    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successModalConfig, setSuccessModalConfig] = useState<SuccessModalConfig>({
        title: "",
        subtitle: "",
        icon: "CheckCircle",
        buttonText: "OK",
        onButtonClick: () => { }
    });

    const [formData, setFormData] = useState({
        collection: "",
        productName: "",
        productCode: "",
        selectedColor: "",
        size: "",
        videoLink: "",
        price: "",
        gst: "",
        shortDescription: "",
        detailedDescription: "",
        hsnCode: "",
        isFavourite: false,
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Fetch product data
    useEffect(() => {
        if (open && productId) {
            const fetchProduct = async () => {
                try {
                    const response = await axios.get(
                        `${BASE_URL}/api/inventory/products/${productId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    const product: ProductData = response.data;
                    console.log(response.data);
                    setFormData({
                        collection: product.categoryId || "",
                        productName: product.name || "",
                        productCode: product.productCode || "",
                        selectedColor: product.color || "",
                        size: product.sizeId || "",
                        videoLink: product.videoUrl || "",
                        price: product.price?.toString() ?? "",
                        gst: product.gst?.toString() ?? "",
                        shortDescription: product.shortDescription || "",
                        detailedDescription: product.detailDescription || "",
                        hsnCode: product.hsnCode || "",
                        isFavourite: !!product.isStandalone, //This is Featured Value
                    });
                    setEditorData(product.detailDescription);
                    setSelectedColor(product.color);
                    setIsStandAlone(product.isStandalone);
                    setExistingImages(product.imagePaths ? product.imagePaths.split(',') : []);
                    setIsLoading(false);
                } catch (error) {
                    console.error("Error fetching product:", error);
                    onClose();
                }
            };

            fetchProduct();
        }
    }, [open, productId, token]);

    // Fetch collections and sizes
    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/inventory/Categories`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCollectionsForTom(response.data.items);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        const fetchSize = async () => {
            try {
                const response = await axios.get<SizeOptions[]>(`${BASE_URL}/api/sizes`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSizeForTom(response.data);
            } catch (error) {
                console.error('Error fetching Size:', error);
            }
        };

        fetchCollections();
        fetchSize();
    }, [token]);

    const handleStandAloneProduct = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setIsStandAlone(isChecked);

        setFormData((prev) => ({
            ...prev,
            collection: isChecked ? "" : prev.collection,
        }));

        if (isChecked) {
            setFormErrors((prev) => ({ ...prev, collection: "" }));
        }
    };

    const handleColorSelect = (colorHex: string) => {
        setSelectedColor(colorHex);
        setFormData({ ...formData, selectedColor: colorHex });
        if (colorHex) {
            setFormErrors((prev) => ({ ...prev, selectedColor: "" }));
        }
    };

    const handleEditorChange = (data: string) => {
        setEditorData(data);
        setFormData((prev) => ({ ...prev, detailedDescription: data }));

        if (data && data.trim() !== "<p></p>") {
            setFormErrors((prev) => ({ ...prev, detailedDescription: "" }));
        }
    };

    const handleDeleteImage = (imageUrl: string) => {
        setImagesToDelete(prev => [...prev, imageUrl]);
        setExistingImages(prev => prev.filter(img => img !== imageUrl));
    };

    const handleUpdate = async () => {
        const errors: Record<string, string> = {};

        if (!isStandAlone && !formData.collection) {
            errors.collection = "Category is required.";
        }

        if (!formData.productName) errors.productName = "Product name is required.";
        //if (!formData.productCode) errors.productCode = "Product code is required.";
        //if (!formData.selectedColor) errors.selectedColor = "Select a color.";
        //if (!formData.size) errors.size = "Size is required.";
        if (!formData.videoLink) errors.videoLink = "Video link is required.";
        if (!formData.price || isNaN(Number(formData.price))) {
            errors.price = "Enter valid price.";
        }
        // if (!formData.gst || isNaN(Number(formData.gst))) {
        //     errors.gst = "Enter valid GST.";
        // }
        if (!formData.shortDescription) errors.shortDescription = "Short description required.";
        if (!editorData) errors.detailedDescription = "Detailed description required.";
        if (!formData.hsnCode) errors.hsnCode = "SKU code required.";

        const dzFiles = dropzoneRef.current?.dropzone?.getAcceptedFiles() || [];
        if (existingImages.length === 0 && dzFiles.length === 0) {
            setFormErrors(prev => ({ ...prev, images: "At least one image is required." }));
            return;
        }

        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;

        const data = new FormData();
        dzFiles.forEach((file) => {
            data.append("NewImages", file);
        });

        imagesToDelete.forEach(url => {
            data.append("ImagesToDelete", url);
        });


        data.append("Id", productId || "");
        data.append("Name", formData.productName);
        if (formData.collection) {
            data.append("CategoryId", formData.collection);
        }
        data.append("SequenceNo", "1");
        data.append("ProductCode", formData.productCode || "0");
        data.append("Color", formData.selectedColor);
        // data.append("SizeId", formData.size);
        data.append("VideoUrl", formData.videoLink);
        data.append("Price", formData.price);
        data.append("Gst", formData.gst || "0");
        data.append("HsnCode", formData.hsnCode);
        data.append("ShortDescription", formData.shortDescription);
        data.append("DetailDescription", formData.detailedDescription);
        // data.append("IsStandalone", isStandAlone ? "1" : "0");
        data.append("IsStandalone", formData.isFavourite ? "1" : "0");  //isFeatured value passed through 'IsStandalone'
        data.append("IsActive", "1");
        //data.append("IsFavourite", formData.isFavourite ? "1" : "0");


        try {
            const response = await axios.put(
                `${BASE_URL}/api/inventory/products/update-with-image/${productId}`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    }
                }
            );

            if (response.status === 200) {
                onProductUpdated();
                // Reset Dropzone after successful update
                if (dropzoneRef.current) {
                    dropzoneRef.current.dropzone?.removeAllFiles();
                }
                setSuccessModalConfig({
                    title: "Product Updated Successfully",
                    subtitle: "The product has been updated in the system.",
                    icon: "CheckCircle",
                    buttonText: "Ok",
                    onButtonClick: () => {
                        setIsSuccessModalOpen(false)
                    }
                });
                setIsSuccessModalOpen(true);
                onClose();
            }
        } catch (error: any) {
            console.error("Update error:", error);
            alert(error.response?.data?.message || "Something went wrong.");
        }
    };

    const selectedColorName = colors.find(c => c.hex === selectedColor)?.name;

    if (isLoading) {
        return (
            <Dialog open={open} onClose={onClose} size="xl" staticBackdrop>
                <Dialog.Panel>
                    <div className="p-10 text-center">
                        <Lucide icon="Loader" className="w-12 h-12 mx-auto animate-spin" />
                        <p className="mt-4">Loading product data...</p>
                    </div>
                </Dialog.Panel>
            </Dialog>
        );
    }

    return (
        <>
            <Dialog open={open} onClose={onClose} size="xl" staticBackdrop>
                <Dialog.Panel>
                    <Dialog.Title>
                        <h2 className="mr-auto text-base font-medium">Edit Product</h2>
                        <Button onClick={onClose} tabIndex={1}>Close</Button>
                    </Dialog.Title>

                    <Dialog.Description className="grid grid-cols-12 gap-5">
                        {/* Collection + Standalone */}
                        <div className="col-span-12 grid grid-cols-12 gap-5">
                            {!isStandAlone && (
                                <div className="col-span-12 lg:col-span-6">
                                    <FormLabel htmlFor="collection">Category</FormLabel>
                                    <TomSelect
                                        value={formData.collection.toString() || ""}
                                        onChange={(e) => {
                                            setFormData(prev => ({ ...prev, collection: e.target.value }));
                                            if (e.target.value) setFormErrors(prev => ({ ...prev, collection: "" }));
                                        }}
                                        options={{ placeholder: "Select Category" }}
                                        className="w-full"
                                    >
                                        <option value="">Select Category</option>
                                        {collectionsForTom.map((col) => (
                                            <option key={col.id} value={col.id}>
                                                {col.name}
                                            </option>
                                        ))}
                                    </TomSelect>
                                    {formErrors.collection && <p className="text-red-500 text-sm">{formErrors.collection}</p>}
                                </div>
                            )}
                            <div className="col-span-12 lg:col-span-6 hidden">
                                <FormLabel htmlFor="standAloneCheck">Stand alone product?</FormLabel>
                                <FormSwitch onChange={handleStandAloneProduct}>
                                    <FormSwitch.Input id="standAloneCheck" type="checkbox" checked={isStandAlone} />
                                    <FormSwitch.Label htmlFor="standAloneCheck" />
                                </FormSwitch>
                            </div>
                        </div>

                        {/* Product Name + Code */}
                        <div className="col-span-12 grid grid-cols-12 gap-3">
                            <div className="col-span-12 lg:col-span-8">
                                <FormLabel htmlFor="productname">Product Name</FormLabel>
                                <FormInput
                                    id="productname"
                                    type="text"
                                    placeholder="Product Name"
                                    value={formData.productName}
                                    onChange={(e) => {
                                        setFormData({ ...formData, productName: e.target.value });
                                        if (e.target.value.trim()) setFormErrors(prev => ({ ...prev, productName: "" }));
                                    }}
                                />
                                {formErrors.productName && <p className="text-red-500 text-sm">{formErrors.productName}</p>}
                            </div>
                            <div className="col-span-12 lg:col-span-4 hidden">
                                <FormLabel htmlFor="productcode">Product Code</FormLabel>
                                <FormInput
                                    id="productcode"
                                    type="text"
                                    placeholder="Product Code"
                                    value={formData.productCode}
                                    onChange={(e) => {
                                        setFormData({ ...formData, productCode: e.target.value });
                                        if (e.target.value.trim()) setFormErrors(prev => ({ ...prev, productCode: "" }));
                                    }}
                                />
                                {formErrors.productCode && <p className="text-red-500 text-sm">{formErrors.productCode}</p>}
                            </div>
                        </div>

                        {/* Color Picker */}
                        <div className="col-span-12 grid grid-cols-12 gap-3 hidden">
                            <div className="col-span-12 lg:col-span-8">
                                <label className="block font-medium mb-2">Select Color</label>
                                <div className="grid grid-cols-10 gap-4" style={{ maxWidth: "20rem" }}>
                                    {colors.map((color) => (
                                        <div
                                            key={color.name}
                                            onClick={() => handleColorSelect(color.hex)}
                                            className={`w-5 h-5 rounded-full cursor-pointer transition-all duration-300 ${selectedColor === color.hex ? "transform scale-110 border-2 border-black" : ""
                                                }`}
                                            style={{ backgroundColor: color.hex }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="col-span-12 lg:col-span-4">
                                <label>Selected Color: {selectedColorName || "None"}</label>
                                {selectedColor && (
                                    <div className="mt-3 w-24 h-24 border-2 border-gray-300 rounded-md" style={{ backgroundColor: selectedColor }} />
                                )}
                                {formErrors.selectedColor && (
                                    <p className="text-red-500 text-sm mt-2">{formErrors.selectedColor}</p>
                                )}
                            </div>
                        </div>

                        {/* Size */}
                        <div className="col-span-12 lg:col-span-6 hidden">
                            <FormLabel htmlFor="size">Size</FormLabel>
                            <TomSelect
                                id="size"
                                value={formData.size || ""}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, size: e.target.value }));
                                    if (e.target.value) setFormErrors(prev => ({ ...prev, size: "" }));
                                }}
                                options={{ placeholder: "Select Size" }}
                                className="w-full"
                            >
                                <option value="">Select Size</option>
                                {sizeForTom.map((size) => (
                                    <option key={size.id} value={size.id}>
                                        {size.sizeValue}
                                    </option>
                                ))}
                            </TomSelect>
                            {formErrors.size && <p className="text-red-500 text-sm">{formErrors.size}</p>}
                        </div>

                        {/* Existing Images */}

                        {existingImages.length > 0 && (
                            <div className="col-span-12">
                                <FormLabel>Existing Images</FormLabel>
                                <div className="grid grid-cols-3 gap-4 mt-2">
                                    {existingImages.map((img, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                // src={`${BASE_URL}/${img}`}   //uncomment this for localhost
                                                src={img}                       //this is for live server comment this for localhost
                                                alt={`Product ${index + 1}`}
                                                className="w-full h-32 object-cover rounded border"
                                            />
                                            <button
                                                onClick={() => handleDeleteImage(img)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <Lucide icon="X" className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* New Images Dropzone */}
                        <div className="col-span-12">
                            <FormLabel htmlFor="images">Add New Images</FormLabel>
                            <Dropzone
                                getRef={(el) => (dropzoneRef.current = el)}
                                options={{
                                    url: "https://httpbin.org/post",
                                    autoProcessQueue: false,
                                    thumbnailWidth: 150,
                                    maxFilesize: 5,
                                    acceptedFiles: "image/*",
                                    addRemoveLinks: true,
                                    init: function () {
                                        this.on("addedfile", () => {
                                            setFormErrors(prev => ({ ...prev, images: "" }));
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

                        {/* Video Link */}
                        <div className="col-span-12">
                            <FormLabel htmlFor="videolink">Video Link</FormLabel>
                            <FormInput
                                id="videolink"
                                type="text"
                                placeholder="Video Link URL"
                                value={formData.videoLink}
                                onChange={(e) => {
                                    setFormData({ ...formData, videoLink: e.target.value });
                                    if (e.target.value.trim()) setFormErrors(prev => ({ ...prev, videoLink: "" }));
                                }}
                            />
                            {formErrors.videoLink && <p className="text-red-500 text-sm">{formErrors.videoLink}</p>}
                        </div>

                        {/* Price + GST */}
                        <div className="col-span-12 grid grid-cols-12 gap-3">
                            <div className="col-span-12 lg:col-span-6">
                                <FormLabel htmlFor="price">Price</FormLabel>
                                <FormInput
                                    id="price"
                                    type="text"
                                    placeholder="Price"
                                    value={formData.price}
                                    onChange={(e) => {
                                        const input = e.target.value;
                                        if (/^\d*\.?\d*$/.test(input)) {
                                            setFormData({ ...formData, price: input });
                                            if (input.trim()) setFormErrors(prev => ({ ...prev, price: "" }));
                                        }
                                    }}
                                />
                                {formErrors.price && <p className="text-red-500 text-sm">{formErrors.price}</p>}
                            </div>

                            <div className="col-span-12 lg:col-span-6 hidden">
                                <FormLabel htmlFor="gst">GST%</FormLabel>
                                <FormInput
                                    id="gst"
                                    type="text"
                                    placeholder="GST%"
                                    value={formData.gst}
                                    onChange={(e) => {
                                        const input = e.target.value;
                                        if (/^\d*\.?\d*$/.test(input)) {
                                            setFormData({ ...formData, gst: input });
                                            if (input.trim()) setFormErrors(prev => ({ ...prev, gst: "" }));
                                        }
                                    }}
                                />
                                {formErrors.gst && <p className="text-red-500 text-sm">{formErrors.gst}</p>}
                            </div>
                        </div>

                        {/* Short Description */}
                        <div className="col-span-12">
                            <FormLabel htmlFor="shortdescription">Short Description</FormLabel>
                            <FormInput
                                id="shortdescription"
                                type="text"
                                placeholder="Short Description"
                                value={formData.shortDescription}
                                onChange={(e) => {
                                    setFormData({ ...formData, shortDescription: e.target.value });
                                    if (e.target.value.trim()) setFormErrors(prev => ({ ...prev, shortDescription: "" }));
                                }}
                            />
                            {formErrors.shortDescription && <p className="text-red-500 text-sm">{formErrors.shortDescription}</p>}
                        </div>

                        {/* Classic Editor */}
                        <div className="col-span-12">
                            <FormLabel htmlFor="detaileddescription">Detailed Description</FormLabel>
                            <ClassicEditor
                                value={editorData || ""}
                                onChange={handleEditorChange}
                            />
                            {formErrors.detailedDescription && (
                                <p className="text-red-500 text-sm mt-2">{formErrors.detailedDescription}</p>
                            )}
                        </div>

                        {/* HSN + Favourite */}
                        <div className="col-span-12 grid grid-cols-12 gap-3">
                            <div className="col-span-12 lg:col-span-6">
                                <FormLabel htmlFor="hsncode">SKU Code</FormLabel>
                                <FormInput
                                    id="hsncode"
                                    type="text"
                                    placeholder="SKU Code"
                                    value={formData.hsnCode}
                                    onChange={(e) => {
                                        setFormData({ ...formData, hsnCode: e.target.value });
                                        if (e.target.value.trim()) setFormErrors(prev => ({ ...prev, hsnCode: "" }));
                                    }}
                                />
                                {formErrors.hsnCode && <p className="text-red-500 text-sm">{formErrors.hsnCode}</p>}
                            </div>
                            <div className="col-span-12 lg:col-span-6">
                                <FormLabel htmlFor="isfavourite">Is Featured Product?</FormLabel>
                                <FormSwitch>
                                    <FormSwitch.Input
                                        id="isfavourite"
                                        type="checkbox"
                                        checked={formData.isFavourite}
                                        onChange={(e) => {
                                            setFormData(prev => ({ ...prev, isFavourite: e.target.checked }));
                                        }}
                                    />
                                    <FormSwitch.Label htmlFor="isfavourite" />
                                </FormSwitch>
                            </div>
                        </div>
                    </Dialog.Description>

                    <Dialog.Footer>
                        <Button type="button" variant="outline-secondary" onClick={onClose} className="w-20 mr-1">
                            Cancel
                        </Button>
                        <Button type="button" variant="primary" className="w-20" onClick={handleUpdate}>
                            Update
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

export default EditProductModal;