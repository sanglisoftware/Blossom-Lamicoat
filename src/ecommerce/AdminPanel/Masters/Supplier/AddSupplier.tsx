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

interface CreateNewSupplierModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void; 
}


const AddSupplier: React.FC<CreateNewSupplierModalProps> = ({
  open,
  onClose,
onSuccess,
}) => {
   const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    Name: "",
    Address: "",
    mobile_No: "",
    PAN: "",
    gsT_No: "",

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
    setFormData({ Name: "",  Address: "",mobile_No: "", PAN: "", gsT_No: "", });

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};
    if (!formData.Name) errors.Name = "Name is required";
    if (!formData.Address) errors.Address = "Address is required";
    if (!formData.mobile_No) errors.mobile_No = "Mobile_No are required";
    if (!formData.PAN) errors.PAN = "PAN required";
    if (!formData.gsT_No) errors.gsT_No = "GST_No required";


    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        Name: formData.Name,
        Address: formData.Address,
        mobile_No: formData.mobile_No,
        PAN: formData.PAN,
        gsT_No: formData.gsT_No,
        isActive: 1,
      };

      const response = await axios.post(`${BASE_URL}/api/supplier`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 || response.status === 201) {
        clearFormData();
        setFormErrors({});
        onClose();

        setSuccessModalConfig({
          title: "Supplier Created Successfully",
          subtitle: "The new supplier has been added to the system.",
          icon: "CheckCircle",
          buttonText: "OK",
          onButtonClick: () => setIsSuccessModalOpen(false),
        });

        setIsSuccessModalOpen(true);
        onSuccess();
      }
    } catch (error: any) {
      console.error("supplier submit error:", error);
      alert(error.response?.data?.detail || "Something went wrong");
    }
  };


  return (
    <>
    <Dialog open={open} onClose={onClose} staticBackdrop size="md">
      <Dialog.Panel>
        <Dialog.Title>
          <h2 className="text-base font-medium">Create New Supplier</h2>
        </Dialog.Title>

    
          <Dialog.Description className="space-y-4">
            <div>
              <FormLabel>Supplier Name</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter Supplier Name"
                value={formData.Name}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, Name: value });
                  if (value.trim()) setFormErrors((prev) => ({ ...prev, Name: "" }));
                }}
              />
              {formErrors.Name && <p className="text-sm text-red-500">{formErrors.Name}</p>}
            </div>

            <div>
              <FormLabel>Address</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter Address"
               onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, Address: value });
                  if (value.trim()) setFormErrors((prev) => ({ ...prev, Address: "" }));
                }}
              />
              {formErrors.Address && <p className="text-sm text-red-500">{formErrors.Address}</p>}
            </div>

            <div>
              <FormLabel>Mobile No</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter number"
               onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, mobile_No: value });
                  if (value.trim()) setFormErrors((prev) => ({ ...prev, mobile_No: "" }));
                }}
              />
              {formErrors.mobile_No && <p className="text-sm text-red-500">{formErrors.mobile_No}</p>}
            </div>

            <div>
              <FormLabel>PAN</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter PAN"
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, PAN: value });
                  if (value.trim()) setFormErrors((prev) => ({ ...prev, PAN: "" }));
                }}
              />
              {formErrors.PAN && <p className="text-sm text-red-500">{formErrors.PAN}</p>}
            </div>

            <div>
              <FormLabel>GST No</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter number"
               onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, gsT_No: value });
                  if (value.trim()) setFormErrors((prev) => ({ ...prev, gsT_No: "" }));
                }}
              />
              {formErrors.gsT_No && <p className="text-sm text-red-500">{formErrors.gsT_No}</p>}
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

export default AddSupplier;
