import { useState, useEffect } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config";

interface EditProductProps {
  open: boolean;
  onClose: () => void;
  fproductId: number | null;
  initialData?: {
    id: number;
    name?: string;
    comments?: string;
  } | null;
  onSuccess?: () => void;
}

type FabricProductDetails = {
  id?: number;
  Id?: number;
  name?: string;
  Name?: string;
  comments?: string;
  Comments?: string;
  isActive?: number;
  IsActive?: number;
};

const EditProduct: React.FC<EditProductProps> = ({
  open,
  onClose,
  fproductId,
  initialData,
  onSuccess,
}) => {
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    comments: "",
    isActive: 1,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) {
      setFormData({
        id: 0,
        name: "",
        comments: "",
        isActive: 1,
      });
      setFormErrors({});
    }
  }, [open]);

  useEffect(() => {
    if (!open || !initialData?.id) return;

    setFormData({
      id: initialData.id,
      name: initialData.name ?? "",
      comments: initialData.comments ?? "",
      isActive: 1,
    });
    setFormErrors({});
  }, [open, initialData]);

  useEffect(() => {
    if (!open || !fproductId || initialData?.id === fproductId) return;

    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/fproductlist/${fproductId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const product = res.data as FabricProductDetails;
        setFormData((prev) => ({
          id: Number(product.id ?? product.Id ?? 0),
          name: product.name ?? product.Name ?? "",
          comments: product.comments ?? product.Comments ?? "",
          isActive: Number(product.isActive ?? product.IsActive ?? prev.isActive ?? 1),
        }));
        setFormErrors({});
      } catch (error: any) {
        console.error("Error fetching product:", error.response?.data || error);
      }
    };

    fetchProduct();
  }, [open, fproductId, initialData, token]);

  const handleUpdate = async () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Product name is required";
    if (!formData.comments.trim()) errors.comments = "Comments are required";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        Id: formData.id,
        Name: formData.name.trim(),
        Comments: formData.comments.trim(),
        IsActive: formData.isActive,
      };

      await axios.put(
        `${BASE_URL}/api/fproductlist/${formData.id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Update failed:", error.response?.data || error);
      alert(
        error.response?.data?.detail ||
        error.response?.data?.title ||
        error.response?.data?.message ||
        "Failed to update product"
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} staticBackdrop size="md">
      <Dialog.Panel>
        <Dialog.Title>
          <h2 className="text-base font-medium">Edit Product</h2>
        </Dialog.Title>

        <Dialog.Description className="space-y-4">

          {/* Product Name */}
          <div>
            <FormLabel>Product Name</FormLabel>
            <FormInput
              type="text"
              maxLength={200}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            {formErrors.name && (
              <p className="text-red-500 text-sm">{formErrors.name}</p>
            )}
          </div>

          {/* Comments */}
          <div>
            <FormLabel>Comments</FormLabel>
            <FormInput
              type="text"
              maxLength={15}
              value={formData.comments}
              onChange={(e) =>
                setFormData({ ...formData, comments: e.target.value })
              }
            />
            {formErrors.comments && (
              <p className="text-red-500 text-sm">{formErrors.comments}</p>
            )}
          </div>

        </Dialog.Description>

        <Dialog.Footer>
          <Button variant="outline-secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Update
          </Button>
        </Dialog.Footer>
      </Dialog.Panel>
    </Dialog>
  );
};

export default EditProduct;
