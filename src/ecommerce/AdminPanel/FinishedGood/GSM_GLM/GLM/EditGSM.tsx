import { useState, useEffect } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config";
import { SuccessModalConfig } from "@/ecommerce/AdminPanel/CommonModals/SuccessModal/SuccessModalConfig";


interface EditGSMProps {
  open: boolean;
  onClose: () => void;
  GSMId: number | null;
  onSuccess?: () => void;
}

const EditGSM: React.FC<EditGSMProps> = ({
  open,
  onClose,
  GSMId,
  onSuccess,
}) => {
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    id: 0,
    name: "",
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
    if (!open) {
      setFormData({ id: 0, name: "", isActive: 1 });
      setFormErrors({});
    }
  }, [open]);


  useEffect(() => {
    if (!open || !GSMId) return;

    const fetchGSM = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/gsm/${GSMId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        
        setFormData({
          id: res.data.id,
          name: res.data.name || "", 
          isActive: res.data.IsActive ?? 1,
        });
        setFormErrors({});
      } catch (error) {
        console.error("Error fetching gramage:", error);
      }
    };

    fetchGSM();
  }, [open, GSMId, token]);

  const handleUpdate = async () => {
    const errors: Record<string, string> = {};
    if (!formData.name) errors.name = "name is required.";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        id: formData.id,
        name: formData.name, // send in backend's expected format
        isActive: formData.isActive,
      };

      const res = await axios.put(`${BASE_URL}/api/gsm/${formData.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200 || res.status === 201) {
        onClose();

        setSuccessModalConfig({
          title: "GSM Updated Successfully",
          subtitle: "The gramage details have been updated.",
          icon: "CheckCircle",
          buttonText: "OK",
          onButtonClick: () => setIsSuccessModalOpen(false),
        });

        setIsSuccessModalOpen(true);

        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      console.error("GSM update error:", error);
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
          <h2 className="text-base font-medium">Edit GSM/GLM</h2>
        </Dialog.Title>

        <Dialog.Description className="space-y-4">
          <div>
            <FormLabel>Name</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            {formErrors.grm && (
              <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
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

export default EditGSM;
