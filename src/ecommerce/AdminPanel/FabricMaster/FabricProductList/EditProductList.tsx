import { useState, useEffect, useMemo } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import TomSelect from "@/components/Base/TomSelect";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config";

interface EditProductProps {
  open: boolean;
  onClose: () => void;
  fproductId: number | null;
  onSuccess?: () => void;
}

interface FGramageOptions {
  id: number;
  grm: string;
  isActive: number;
}

interface ColourOptions {
  id: number;
  name: string;
  isActive: number;
}

const EditProduct: React.FC<EditProductProps> = ({
  open,
  onClose,
  fproductId,
  onSuccess,
}) => {
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    fGramageMasterId: "",
    colourMasterId: "",
    comments: "",
    isActive: 1,
  });

  const [gramages, setGramages] = useState<FGramageOptions[]>([]);
  const [colours, setColours] = useState<ColourOptions[]>([]);

  // ✅ Fetch master lists
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [gRes, cRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/fgramage`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        
          axios.get(`${BASE_URL}/api/colour`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setGramages(gRes.data.items || []);
        setColours(cRes.data.items || []);
      } catch (error) {
        console.error("Error loading masters:", error);
      }
    };

    fetchMasters();
  }, [token]);

  // ✅ Fetch product details
  useEffect(() => {
    if (!open || !fproductId) return;

    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/fproductlist/${fproductId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setFormData({
          id: res.data.id,
          name: res.data.name || "",
          fGramageMasterId: res.data.fGramageMasterId?.toString() || "",
          colourMasterId: res.data.colourMasterId?.toString() || "",
          comments: res.data.comments || "",
          isActive: res.data.isActive ?? 1,
        });
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [open, fproductId, token]);

  // ✅ Active only
  const activeGramages = useMemo(
    () => gramages.filter((g) => g.isActive === 1),
    [gramages]
  );


  const activeColours = useMemo(
    () => colours.filter((c) => c.isActive === 1),
    [colours]
  );

  // ✅ Dropdown change handler
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ✅ Update API
  const handleUpdate = async () => {
    try {
      const payload = {
        id: formData.id,
        name: formData.name,
        fGramageMasterId: Number(formData.fGramageMasterId),
        colourMasterId: Number(formData.colourMasterId),
        comments: formData.comments,
        isActive: formData.isActive,
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
          </div>

          {/* Gramage */}
          <div>
            <FormLabel>Gramage</FormLabel>
            <TomSelect
              value={formData.fGramageMasterId}
              onChange={(e) =>
                handleChange("fGramageMasterId", e.target.value)
              }
              options={{ placeholder: "Select Gramage" }}
              className="w-full"
            >
              <option value="">Select Gramage</option>
              {activeGramages.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.grm}
                </option>
              ))}
            </TomSelect>
          </div>
          {/* Colour */}
          <div>
            <FormLabel>Colour</FormLabel>
            <TomSelect
              value={formData.colourMasterId}
              onChange={(e) =>
                handleChange("colourMasterId", e.target.value)
              }
              options={{ placeholder: "Select Colour" }}
              className="w-full"
            >
              <option value="">Select Colour</option>
              {activeColours.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </TomSelect>
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