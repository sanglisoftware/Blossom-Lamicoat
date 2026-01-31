import { useState, useEffect } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config";
import { SuccessModalConfig } from "../../CommonModals/SuccessModal/SuccessModalConfig";
import SuccessModal from "../../CommonModals/SuccessModal/SuccessModal";

interface EditCustomerProps {
  open: boolean;
  onClose: () => void;
  customerId: number | null;
  onSuccess?: () => void; 
}

const EditCustomer: React.FC<EditCustomerProps> = ({
  open,
  onClose,
  customerId,
  onSuccess,
}) => {
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    address: "",
    mobile_No: "",
    email:"",
    gsT_No:"",
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
    if (!open || !customerId) return;

    const fetchCustomer = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/customer/${customerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFormData({
          id: res.data.id,
          name: res.data.name,
          address: res.data.address,
          mobile_No: res.data.mobile_No,
          email: res.data.email,
          gsT_No: res.data.gsT_No,
          isActive: res.data.isActive ?? 1,
        });
        setFormErrors({});
      } catch (error) {
        console.error("Error fetching chemical:", error);
      }
    };

    fetchCustomer();
  }, [open, customerId, token]);

  const handleUpdate = async () => {
    const errors: Record<string, string> = {};
    if (!formData.name) errors.name = "Name is required.";
    if (!formData.address) errors.Address = "Address is required.";
    if (!formData.mobile_No) errors.Mobile_No = "Mobile_No is required.";
    if (!formData.email) errors.Email = "Email is required.";
    if (!formData.gsT_No) errors.GST_No = "GST_No is required.";


    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        id: formData.id,
        name: formData.name,
        address: formData.address,
        mobile_No: formData.mobile_No,
        email: formData.email,
        gsT_No: formData.gsT_No,
        isActive: formData.isActive,
      };

      const res = await axios.put(`${BASE_URL}/api/customer/${formData.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200 || res.status === 201) {
        onClose();

        setSuccessModalConfig({
          title: "Customer Updated Successfully",
          subtitle: "The customer details have been updated.",
          icon: "CheckCircle",
          buttonText: "OK",
          onButtonClick: () => setIsSuccessModalOpen(false),
        });

        setIsSuccessModalOpen(true);

        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      console.error("Customer update error:", error);
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
          <h2 className="text-base font-medium">Edit Customer</h2>
        </Dialog.Title>

        <Dialog.Description className="space-y-4">
          <div>
            <FormLabel>Customer Name</FormLabel>
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
            <FormLabel>Address</FormLabel>
            <FormInput
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
        {formErrors.Address && <p className="text-sm text-red-500">{formErrors.address}</p>}

          </div>

          <div>
            <FormLabel>Mobile No</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter number"
              value={formData.mobile_No}
              onChange={(e) =>
                setFormData({ ...formData, mobile_No: e.target.value })
              }
            />
        {formErrors.Mobile_No && <p className="text-sm text-red-500">{formErrors.mobile_no}</p>}

          </div>

           <div>
            <FormLabel>Email</FormLabel>
            <FormInput
              type="text"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
        {formErrors.Email && <p className="text-sm text-red-500">{formErrors.email}</p>}

          </div>

           <div>
            <FormLabel>GST No</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter number"
              value={formData.gsT_No}
              onChange={(e) =>
                setFormData({ ...formData, gsT_No: e.target.value })
              }
            />
        {formErrors.GST_No && <p className="text-sm text-red-500">{formErrors.gsT_No}</p>}

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

export default EditCustomer;
