import { useState, useEffect } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";

interface EditSupplierProps {
  open: boolean;
  onClose: () => void;
 SupplierData: {
    id: number;
    Name: string;
    Address: string;
    MobileNo: string;
     PAN: string;
    GSTNo: string;
  } | null;
  onUpdateSupplier: (data: {
    id: number;
    Name: string;
    Address: string;
    MobileNo: string;
     PAN: string;
    GSTNo: string;
  }) => void;
}

const EditSupplier: React.FC<EditSupplierProps> = ({
  open,
  onClose,
  SupplierData,
  onUpdateSupplier,
}) => {
  const [formData, setFormData] = useState({
    id: 0,
    Name: "",
    Address: "",
    MobileNo: "",
    PAN:"",
    GSTNo:""
  });

  
  useEffect(() => {
    if (SupplierData) {
      setFormData(SupplierData);
    }
  }, [SupplierData]);

  const handleUpdate = () => {
    if (!formData.Name) return;
    onUpdateSupplier(formData);
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
            <FormLabel>PAN</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter PAN"
              value={formData.PAN}
              onChange={(e) =>
                setFormData({ ...formData, PAN: e.target.value })
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

export default EditSupplier;
