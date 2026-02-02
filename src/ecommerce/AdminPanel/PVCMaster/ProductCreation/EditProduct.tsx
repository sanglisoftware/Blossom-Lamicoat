import { useState, useEffect } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config";
import { SuccessModalConfig } from "../../CommonModals/SuccessModal/SuccessModalConfig";
import SuccessModal from "../../CommonModals/SuccessModal/SuccessModal";

interface EditEditPvcproductProps {
  open: boolean;
  onClose: () => void;
  PVcproductId: number | null;
  onSuccess?: () => void; 
}

const EditPvcproduct: React.FC<EditEditPvcproductProps> = ({
  open,
  onClose,
  PVcproductId,
  onSuccess,
}) => {
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    gramage: "",
    width: "",
    colour:"",
    comments:"",
    isActive: 1,
  });

const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalConfig, setSuccessModalConfig] =
    useState<SuccessModalConfig>({
      title: "",
      subtitle: "",
      icon: "CheckCircle",
      buttonText: "OK",
      onButtonClick: () => {},
    });

  useEffect(() => {
    if (!open || !PVcproductId) return;

    const fetchCustomer = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/pvcproductlist/${PVcproductId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFormData({
          id: res.data.id,
          name: res.data.name,
          gramage: res.data.gramage,
          width: res.data.width,
          colour: res.data.colour,
          comments: res.data.comments,
          isActive: res.data.isActive ?? 1,
        });
        setFormErrors({});
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchCustomer();
  }, [open, PVcproductId, token]);

  const handleUpdate = async () => {
    const errors: Record<string, string> = {};
    if (!formData.name) errors.name = "Name is required.";
    if (!formData.gramage) errors.gramage = "gramage is required.";
    if (!formData.width) errors.width = "width is required.";
    if (!formData.colour) errors.colour = "colour is required.";
    if (!formData.comments) errors.comments = "comments is required.";


    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        id: formData.id,
        name: formData.name,
        gramage: formData.gramage,
        width: formData.width,
        colour: formData.colour,
        comments: formData.comments,
        isActive: formData.isActive,
      };

      const res = await axios.put(`${BASE_URL}/api/pvcproductlist/${formData.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200 || res.status === 201) {
        onClose();

        setSuccessModalConfig({
          title: "Product Updated Successfully",
          subtitle: "The product details have been updated.",
          icon: "CheckCircle",
          buttonText: "OK",
          onButtonClick: () => setIsSuccessModalOpen(false),
        });

        setIsSuccessModalOpen(true);

        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      console.error("Product update error:", error);
      alert(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          "Something went wrong"
      );
    }
  };


  return (
    <>
    <Dialog open={open} onClose={onClose} staticBackdrop size="md">
      <Dialog.Panel>
        <Dialog.Title>
          <h2 className="text-base font-medium">Edit Product</h2>
        </Dialog.Title>

        <Dialog.Description className="space-y-4">
          <div>
            <FormLabel> Name</FormLabel>
            <FormInput
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
        {formErrors.Name && <p className="text-sm text-red-500">{formErrors.name}</p>}
          </div>

          <div>
            <FormLabel>Gramage</FormLabel>
            <FormInput
              type="text"
              value={formData.gramage}
              onChange={(e) =>
                setFormData({ ...formData, gramage: e.target.value })
              }
            />
        {formErrors.gramage && <p className="text-sm text-red-500">{formErrors.gramage}</p>}

          </div>

          <div>
            <FormLabel>Width</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter Width"
              value={formData.width}
              onChange={(e) =>
                setFormData({ ...formData, width: e.target.value })
              }
            />
        {formErrors.width && <p className="text-sm text-red-500">{formErrors.width}</p>}

          </div>

           <div>
            <FormLabel>Colour</FormLabel>
            <FormInput
              type="text"
              value={formData.colour}
              onChange={(e) =>
                setFormData({ ...formData, colour: e.target.value })
              }
            />
        {formErrors.colour && <p className="text-sm text-red-500">{formErrors.colour}</p>}

          </div>

           <div>
            <FormLabel>Comments</FormLabel>
            <FormInput
              type="text"
              value={formData.comments}
              onChange={(e) =>
                setFormData({ ...formData, comments: e.target.value })
              }
            />
        {formErrors.comments && <p className="text-sm text-red-500">{formErrors.comments}</p>}

          </div>
        </Dialog.Description>

        <Dialog.Footer>
          <Button
            variant="outline-secondary"
            className="w-24 mr-2"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="w-24 bg-blue-600 hover:bg-blue-700"
            onClick={handleUpdate}
          >
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

export default EditPvcproduct;
