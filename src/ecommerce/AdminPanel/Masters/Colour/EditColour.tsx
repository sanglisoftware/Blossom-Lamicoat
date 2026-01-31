import { useState, useEffect } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config";
import { SuccessModalConfig } from "../../CommonModals/SuccessModal/SuccessModalConfig";

interface EditColourProps {
  open: boolean;
  onClose: () => void;
  colourId: number | null;
  onSuccess?: () => void; 
}

const EditColour: React.FC<EditColourProps> = ({
 open,
  onClose,
  colourId,
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
    if (!open || !colourId) return;

    const fetchColour = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/colour/${colourId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFormData({
          id: res.data.id,
          name: res.data.name,
          isActive: res.data.isActive ?? 1,
        });
        setFormErrors({});
      } catch (error) {
        console.error("Error fetching Colour:", error);
      }
    };

    fetchColour();
  }, [open, colourId, token]);

  const handleUpdate = async () => {
    const errors: Record<string, string> = {};
    if (!formData.name) errors.name = "Colour name is required.";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        id: formData.id,
        name: formData.name,
        isActive: formData.isActive,
      };

      const res = await axios.put(`${BASE_URL}/api/colour/${formData.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200 || res.status === 201) {
        onClose();

        setSuccessModalConfig({
          title: "Colour Updated Successfully",
          subtitle: "The colour details have been updated.",
          icon: "CheckCircle",
          buttonText: "OK",
          onButtonClick: () => setIsSuccessModalOpen(false),
        });

        setIsSuccessModalOpen(true);

        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      console.error("colour update error:", error);
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
          <h2 className="text-base font-medium">Edit Name</h2>
        </Dialog.Title>

        <Dialog.Description className="space-y-4">
          <div>
            <FormLabel>Colour Name</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
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

export default EditColour;
