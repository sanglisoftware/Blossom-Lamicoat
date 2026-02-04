import { useState, useEffect } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config";
import { SuccessModalConfig } from "../../CommonModals/SuccessModal/SuccessModalConfig";
import SuccessModal from "../../CommonModals/SuccessModal/SuccessModal";

interface EditQualityProps {
  open: boolean;
  onClose: () => void;
  QualityId: number | null;
  onSuccess?: () => void; 
}

const EditGoods: React.FC<EditQualityProps> = ({
  open,
  onClose,
  QualityId,
  onSuccess,
}) => {
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    comments:"",
    gsM_GLM: "",
    colour:"",
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
    if (!open || !QualityId) return;

    const fetchQuality = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/quality/${QualityId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFormData({
          id: res.data.id,
          name: res.data.name,
          comments: res.data.comments,
          gsM_GLM: res.data.gsM_GLM,
          colour: res.data.colour,
          isActive: res.data.isActive ?? 1,
        });
        setFormErrors({});
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchQuality();
  }, [open, QualityId, token]);

  const handleUpdate = async () => {
    const errors: Record<string, string> = {};
    if (!formData.name) errors.name = "Name is required.";
    if (!formData.comments) errors.comments = "comments is required.";
    if (!formData.gsM_GLM) errors.gsM_GLM = "gsm_glm is required.";
    if (!formData.colour) errors.colour = "colour is required.";


    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        id: formData.id,
        name: formData.name,
        comments: formData.comments,
        gsM_GLM: formData.gsM_GLM,
        colour: formData.colour,
        isActive: formData.isActive,
      };

      const res = await axios.put(`${BASE_URL}/api/quality/${formData.id}`, payload, {
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
          <div>
            <FormLabel>GSM/GLM</FormLabel>
            <FormInput
              type="text"
              value={formData.gsM_GLM}
              onChange={(e) =>
                setFormData({ ...formData, gsM_GLM: e.target.value })
              }
            />
        {formErrors.gsM_GLM && <p className="text-sm text-red-500">{formErrors.gsM_GLM}</p>}

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

export default EditGoods;
