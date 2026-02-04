import { useState, useEffect } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config";
import { SuccessModalConfig } from "../../CommonModals/SuccessModal/SuccessModalConfig";

interface EditGramageProps {
  open: boolean;
  onClose: () => void;
  gramageId: number | null;
  onSuccess?: () => void;
}

const EditGram: React.FC<EditGramageProps> = ({
  open,
  onClose,
  gramageId,
  onSuccess,
}) => {
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    id: 0,
    grm: "",
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

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({ id: 0, grm: "", isActive: 1 });
      setFormErrors({});
    }
  }, [open]);

  // Fetch gramage details when modal opens
  useEffect(() => {
    if (!open || !gramageId) return;

    const fetchGramage = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/fgramage/${gramageId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Ensure lowercase key matches formData
        setFormData({
          id: res.data.id,
          grm: res.data.grm || "", // use backend key exactly
          isActive: res.data.IsActive ?? 1,
        });
        setFormErrors({});
      } catch (error) {
        console.error("Error fetching gramage:", error);
      }
    };

    fetchGramage();
  }, [open, gramageId, token]);

  const handleUpdate = async () => {
    const errors: Record<string, string> = {};
    if (!formData.grm) errors.grm = "GRM is required.";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        id: formData.id,
        GRM: formData.grm, // send in backend's expected format
        isActive: formData.isActive,
      };

      const res = await axios.put(`${BASE_URL}/api/fgramage/${formData.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200 || res.status === 201) {
        onClose();

        setSuccessModalConfig({
          title: "Gramage Updated Successfully",
          subtitle: "The gramage details have been updated.",
          icon: "CheckCircle",
          buttonText: "OK",
          onButtonClick: () => setIsSuccessModalOpen(false),
        });

        setIsSuccessModalOpen(true);

        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      console.error("Gramage update error:", error);
      alert(
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Something went wrong"
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} staticBackdrop size="md">
      <Dialog.Panel>
        <Dialog.Title>
          <h2 className="text-base font-medium">Edit Gramage</h2>
        </Dialog.Title>

        <Dialog.Description className="space-y-4">
          <div>
            <FormLabel>GRM</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter GRM"
              value={formData.grm}
              onChange={(e) =>
                setFormData({ ...formData, grm: e.target.value })
              }
            />
            {formErrors.grm && (
              <p className="text-red-500 text-sm mt-1">{formErrors.grm}</p>
            )}
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
  );
};

export default EditGram;
