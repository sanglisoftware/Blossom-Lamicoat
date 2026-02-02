import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config"
import { useState } from "react";
import { SuccessModalConfig } from "../../CommonModals/SuccessModal/SuccessModalConfig";
import SuccessModal from "../../CommonModals/SuccessModal/SuccessModal";

interface CreateNewPVcproductModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void; 
}


const AddPVcproduct: React.FC<CreateNewPVcproductModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
   const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    Name: "",
    Gramage: "",
    Width: "",
    Colour: "",
    Comments: "",

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
    setFormData({ Name: "",  Gramage: "",Width: "", Colour: "", Comments: "", });

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};
    if (!formData.Name) errors.Name = "Name is required";
    if (!formData.Gramage) errors.Gramage = "Gramage required";
    if (!formData.Width) errors.Width = "Width  required";
    if (!formData.Colour) errors.Colour = "Colour are required";
    if (!formData.Comments) errors.Comments = "Comments are required";


    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        Name: formData.Name,
        Gramage: formData.Gramage,
        Width: formData.Width,
        Colour: formData.Colour,
        Comments: formData.Comments,
        isActive: 1,
      };

      const response = await axios.post(`${BASE_URL}/api/pvcproductlist`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 || response.status === 201) {
        clearFormData();
        setFormErrors({});
        onClose();

        setSuccessModalConfig({
          title: "PVC Product Created Successfully",
          subtitle: "The new PVC Product has been added to the system.",
          icon: "CheckCircle",
          buttonText: "OK",
          onButtonClick: () => setIsSuccessModalOpen(false),
        });

        setIsSuccessModalOpen(true);
        onSuccess();
      }
    } catch (error: any) {
      console.error("Product submit error:", error);
      alert(error.response?.data?.detail || "Something went wrong");
    }
  };

  return (
    <>
    <Dialog open={open} onClose={onClose} staticBackdrop size="md">
      <Dialog.Panel>
        <Dialog.Title>
          <h2 className="text-base font-medium">Create New Product</h2>
        </Dialog.Title>

          <Dialog.Description className="space-y-4">
            <div>
              <FormLabel> Name</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter  Name"
               value={formData.Name}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, Name: value });
                  if (value.trim()) setFormErrors((prev) => ({ ...prev, Name: "" }));
                }}
              />
              {formErrors.Name && <p className="text-sm text-red-500">{formErrors.Name}</p>}
            </div>

            {/* Type */}
            <div>
              <FormLabel>Gramage</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter Gramage"
               onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, Gramage: value });
                  if (value.trim()) setFormErrors((prev) => ({ ...prev, Gramage: "" }));
                }}
              />
              {formErrors.Gramage && <p className="text-sm text-red-500">{formErrors.Gramage}</p>}
            </div>

     
            <div>
              <FormLabel>Width</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter number"
               onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, Width: value });
                  if (value.trim()) setFormErrors((prev) => ({ ...prev, Width: "" }));
                }}
              />
              {formErrors.Width && <p className="text-sm text-red-500">{formErrors.Width}</p>}
            </div>

            <div>
              <FormLabel>Colour</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter Colour"
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, Colour: value });
                  if (value.trim()) setFormErrors((prev) => ({ ...prev, Colour: "" }));
                }}
              />
              {formErrors.Colour && <p className="text-sm text-red-500">{formErrors.Colour}</p>}
            </div>

            <div>
              <FormLabel>Comments</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter Comments"
               onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, Comments: value });
                  if (value.trim()) setFormErrors((prev) => ({ ...prev, Comments: "" }));
                }}
              />
              {formErrors.Comments && <p className="text-sm text-red-500">{formErrors.Comments}</p>}
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

export default AddPVcproduct;
