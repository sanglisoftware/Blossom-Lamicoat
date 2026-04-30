import { useState, useEffect } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config";

interface EditProductProps {
  open: boolean;
  onClose: () => void;
  productId: number | null;
  onSuccess?: () => void;
}

const EditProduct: React.FC<EditProductProps> = ({
  open,
  onClose,
  productId,
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

  // ✅ Fetch product details
  useEffect(() => {
    if (!open || !productId) return;

    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/pvcproductlist/${productId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setFormData({
          id: res.data.id,
          name: res.data.name || "",
          comments: res.data.comments || "",
          isActive: res.data.isActive ?? 1,
        });
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [open, productId, token]);

  // ✅ Update API
  const handleUpdate = async () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Name is required";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        id: formData.id,
        name: formData.name.trim(),
        comments: formData.comments,
        isActive: formData.isActive,
      };

      await axios.put(
        `${BASE_URL}/api/pvcproductlist/${formData.id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
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
              value={formData.comments}
              onChange={(e) =>
                setFormData({ ...formData, comments: e.target.value })
              }
            />
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
