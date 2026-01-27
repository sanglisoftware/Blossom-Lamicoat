import { useEffect, useState } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config";
import SuccessModal from "../CommonModals/SuccessModal/SuccessModal";
import { SuccessModalConfig } from "../CommonModals/SuccessModal/SuccessModalConfig";

interface EditChemicalProps {
  open: boolean;
  onClose: () => void;
  chemicalId: number | null;
  onSuccess?: () => void; 
}

const EditChemical: React.FC<EditChemicalProps> = ({
  open,
  onClose,
  chemicalId,
  onSuccess,
}) => {
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    type: "",
    comment: "",
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
    if (!open || !chemicalId) return;

    const fetchChemical = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/chemical/${chemicalId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFormData({
          id: res.data.id,
          name: res.data.name,
          type: res.data.type,
          comment: res.data.comment,
          isActive: res.data.isActive ?? 1,
        });
        setFormErrors({});
      } catch (error) {
        console.error("Error fetching chemical:", error);
      }
    };

    fetchChemical();
  }, [open, chemicalId, token]);

  const handleUpdate = async () => {
    const errors: Record<string, string> = {};
    if (!formData.name) errors.name = "Chemical name is required.";
    if (!formData.type) errors.type = "Type is required.";
    if (!formData.comment) errors.comment = "Comment is required.";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        id: formData.id,
        name: formData.name,
        type: formData.type,
        comment: formData.comment,
        isActive: formData.isActive,
      };

      const res = await axios.put(`${BASE_URL}/api/chemical/${formData.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200 || res.status === 201) {
        onClose();

        setSuccessModalConfig({
          title: "Chemical Updated Successfully",
          subtitle: "The chemical details have been updated.",
          icon: "CheckCircle",
          buttonText: "OK",
          onButtonClick: () => setIsSuccessModalOpen(false),
        });

        setIsSuccessModalOpen(true);

        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      console.error("Chemical update error:", error);
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
            <h2 className="text-base font-medium">Edit Chemical</h2>
          </Dialog.Title>

          <Dialog.Description className="space-y-4">
            <div>
              <FormLabel>Chemical Name</FormLabel>
              <FormInput
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
            </div>

            <div>
              <FormLabel>Type</FormLabel>
              <FormInput
                type="text"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              />
              {formErrors.type && <p className="text-sm text-red-500">{formErrors.type}</p>}
            </div>

            <div>
              <FormLabel>Comment</FormLabel>
              <FormInput
                type="text"
                value={formData.comment}
                onChange={(e) =>
                  setFormData({ ...formData, comment: e.target.value })
                }
              />
              {formErrors.comment && (
                <p className="text-sm text-red-500">{formErrors.comment}</p>
              )}
            </div>
          </Dialog.Description>

          <Dialog.Footer>
            <Button variant="outline-secondary" className="w-24 mr-2" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" className="w-24" onClick={handleUpdate}>
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

export default EditChemical;
