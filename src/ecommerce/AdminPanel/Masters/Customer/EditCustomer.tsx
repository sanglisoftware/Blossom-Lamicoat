import { useState, useEffect } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";

interface EditCustomerProps {
  open: boolean;
  onClose: () => void;
  CustomerData: {
    id: number;
    Name: string;
    Address: string;
    MobileNo: string;
     Email: string;
    GSTNo: string;
  } | null;
  onUpdateCustomer: (data: {
    id: number;
    Name: string;
    Address: string;
    MobileNo: string;
     Email: string;
    GSTNo: string;
  }) => void;
}

const EditCustomer: React.FC<EditCustomerProps> = ({
  open,
  onClose,
  CustomerData,
  onUpdateCustomer,
}) => {
  const [formData, setFormData] = useState({
    id: 0,
    Name: "",
    Address: "",
    MobileNo: "",
    Email:"",
    GSTNo:""
  });

  
  useEffect(() => {
    if (CustomerData) {
      setFormData(CustomerData);
    }
  }, [CustomerData]);

  const handleUpdate = () => {
    if (!formData.Name) return;
    onUpdateCustomer(formData);
    onClose();
  };

  return (
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
              placeholder="Enter Customer Name"
              value={formData.Name}
              onChange={(e) =>
                setFormData({ ...formData, Name: e.target.value })
              }
            />
          </div>

          <div>
            <FormLabel>Address</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter Address"
              value={formData.Address}
              onChange={(e) =>
                setFormData({ ...formData, Address: e.target.value })
              }
            />
          </div>

          <div>
            <FormLabel>Mobile No</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter number"
              value={formData.MobileNo}
              onChange={(e) =>
                setFormData({ ...formData, MobileNo: e.target.value })
              }
            />
          </div>

           <div>
            <FormLabel>Email</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter Email"
              value={formData.Email}
              onChange={(e) =>
                setFormData({ ...formData, Email: e.target.value })
              }
            />
          </div>

           <div>
            <FormLabel>GST No</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter number"
              value={formData.GSTNo}
              onChange={(e) =>
                setFormData({ ...formData, GSTNo: e.target.value })
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

export default EditCustomer;
