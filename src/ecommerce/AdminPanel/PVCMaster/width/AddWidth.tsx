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

interface CreateNewWidthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void; 
}

const AddWidth: React.FC<CreateNewWidthModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
 const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    GRM: "",
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
    setFormData({ GRM: ""});

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};
    if (!formData.GRM) errors.GRM = "grm is required";

     setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        grm: formData.GRM,
        isActive: 1,
      };

      const response = await axios.post(`${BASE_URL}/api/width`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 || response.status === 201) {
        clearFormData();
        setFormErrors({});
        onClose();

        setSuccessModalConfig({
          title: "Width Created Successfully",
          subtitle: "The new width has been added to the system.",
          icon: "CheckCircle",
          buttonText: "OK",
          onButtonClick: () => setIsSuccessModalOpen(false),
        });

        setIsSuccessModalOpen(true);
        onSuccess();
      }
    } catch (error: any) {
      console.error("Width submit error:", error);
      alert(error.response?.data?.detail || "Something went wrong");
    }
  };

  return (
    <>
     <Dialog open={open} onClose={onClose} staticBackdrop size="md">
      <Dialog.Panel>
        <Dialog.Title>
          <h2 className="text-base font-medium">Create New Width</h2>
        </Dialog.Title>

         <Dialog.Description className="space-y-4">
            <div>
              <FormLabel>Gramage </FormLabel>
              <FormInput
                type="text"
                placeholder="Enter grm"
                value={formData.GRM}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, GRM: value });
                  if (value.trim()) setFormErrors((prev) => ({ ...prev, GRM: "" }));
                }}
              />
              {formErrors.GRM && <p className="text-sm text-red-500">{formErrors.GRM}</p>}
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

export default AddWidth;
