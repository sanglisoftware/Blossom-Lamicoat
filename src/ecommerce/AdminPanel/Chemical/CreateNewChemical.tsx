import { useState } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config";
import SuccessModal from "../CommonModals/SuccessModal/SuccessModal";
import { SuccessModalConfig } from "../CommonModals/SuccessModal/SuccessModalConfig";

interface CreateNewChemicalModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void; 
}

const CreateNewChemical: React.FC<CreateNewChemicalModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    chemicalName: "",
    type: "",
    comments: "",
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
    setFormData({ chemicalName: "", type: "", comments: "" });

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};
    if (!formData.chemicalName) errors.chemicalName = "Chemical name is required";
    if (!formData.type) errors.type = "Type is required";
    if (!formData.comments) errors.comments = "Comments are required";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        name: formData.chemicalName,
        type: formData.type,
        comment: formData.comments,
        isActive: 1,
      };

      const response = await axios.post(`${BASE_URL}/api/chemical`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 || response.status === 201) {
        clearFormData();
        setFormErrors({});
        onClose();

        setSuccessModalConfig({
          title: "Chemical Created Successfully",
          subtitle: "The new chemical has been added to the system.",
          icon: "CheckCircle",
          buttonText: "OK",
          onButtonClick: () => setIsSuccessModalOpen(false),
        });

        setIsSuccessModalOpen(true);
        onSuccess();
      }
    } catch (error: any) {
      console.error("Chemical submit error:", error);
      alert(error.response?.data?.detail || "Something went wrong");
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} staticBackdrop size="md">
        <Dialog.Panel>
          <Dialog.Title>
            <h2 className="text-base font-medium">Create New Chemical</h2>
          </Dialog.Title>

          <Dialog.Description className="space-y-4">
            <div>
              <FormLabel>Chemical Name</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter Chemical Name"
                value={formData.chemicalName}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, chemicalName: value });
                  if (value.trim()) setFormErrors((prev) => ({ ...prev, chemicalName: "" }));
                }}
              />
              {formErrors.chemicalName && <p className="text-sm text-red-500">{formErrors.chemicalName}</p>}
            </div>

            <div>
              <FormLabel>Type</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter Type"
                value={formData.type}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, type: value });
                  if (value.trim()) setFormErrors((prev) => ({ ...prev, type: "" }));
                }}
              />
              {formErrors.type && <p className="text-sm text-red-500">{formErrors.type}</p>}
            </div>

            <div>
              <FormLabel>Comments</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter Comments"
                value={formData.comments}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, comments: value });
                  if (value.trim()) setFormErrors((prev) => ({ ...prev, comments: "" }));
                }}
              />
              {formErrors.comments && <p className="text-sm text-red-500">{formErrors.comments}</p>}
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

export default CreateNewChemical;
