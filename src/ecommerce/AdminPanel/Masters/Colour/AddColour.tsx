import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config";
import { useState } from "react";
import SuccessModal from "../../CommonModals/SuccessModal/SuccessModal";
import { SuccessModalConfig } from "../../CommonModals/SuccessModal/SuccessModalConfig";

interface CreateNewColourModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void; 
}

const AddColour: React.FC<CreateNewColourModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
 const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    Name: "",
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

    const clearFormData = () =>
    setFormData({ Name: ""});

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};
    if (!formData.Name) errors.Name = "name is required";

     setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        name: formData.Name,
        isActive: 1,
      };

      const response = await axios.post(`${BASE_URL}/api/colour`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 || response.status === 201) {
        clearFormData();
        setFormErrors({});
        onClose();

        setSuccessModalConfig({
          title: "Colour Created Successfully",
          subtitle: "The new colour has been added to the system.",
          icon: "CheckCircle",
          buttonText: "OK",
          onButtonClick: () => setIsSuccessModalOpen(false),
        });

        setIsSuccessModalOpen(true);
        onSuccess();
      }
    } catch (error: any) {
      console.error("Colour submit error:", error);
      alert(error.response?.data?.detail || "Something went wrong");
    }
  };

  return (
    <>
     <Dialog open={open} onClose={onClose} staticBackdrop size="md">
      <Dialog.Panel>
        <Dialog.Title>
          <h2 className="text-base font-medium">Create New Colour</h2>
        </Dialog.Title>

         <Dialog.Description className="space-y-4">
            <div>
              <FormLabel>Colour Name</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter Colour Name"
                value={formData.Name}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, Name: value });
                  if (value.trim()) setFormErrors((prev) => ({ ...prev, Name: "" }));
                }}
              />
              {formErrors.Name && <p className="text-sm text-red-500">{formErrors.Name}</p>}
            </div>

          </Dialog.Description>

          <Dialog.Footer>
            <Button type="button" variant="secondary" className="w-24 mr-2" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" variant="primary" className="w-24" onClick={handleSubmit}>
              Add
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

export default AddColour;
