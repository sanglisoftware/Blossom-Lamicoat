import { useState, useEffect } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";

interface EditInwardListProps {
  open: boolean;
  onClose: () => void;
  chemicalData: {
    id: number;
    ChemicalName: string;
    QTY: string;
    Supplier: string;
    Batch_No: string;
  } | null;
  onUpdateInward: (data: {
    id: number;
    ChemicalName: string;
    QTY: string;
    Supplier: string;
      Batch_No: string;
  }) => void;
}

const EditInwardList: React.FC<EditInwardListProps> = ({
  open,
  onClose,
  chemicalData,
  onUpdateInward,
}) => {
  const [formData, setFormData] = useState({
    id: 0,
    ChemicalName: "",
    QTY: "",
    Supplier: "",
    Batch_No:"",
  });


  useEffect(() => {
    if (chemicalData) {
      setFormData(chemicalData);
    }
  }, [chemicalData]);

  const handleUpdate = () => {
    if (!formData.ChemicalName) return;
    onUpdateInward(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} staticBackdrop size="md">
      <Dialog.Panel>
        <Dialog.Title>
          <h2 className="text-base font-medium">Edit Chemical</h2>
        </Dialog.Title>

        <Dialog.Description className="space-y-4">
          <div>
            <FormLabel>Chemical Name</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter Chemical Name"
              value={formData.ChemicalName}
              onChange={(e) =>
                setFormData({ ...formData, ChemicalName: e.target.value })
              }
            />
          </div>

          <div>
            <FormLabel>QTY</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter Quantity"
              value={formData.QTY}
              onChange={(e) =>
                setFormData({ ...formData, QTY: e.target.value })
              }
            />
          </div>

          <div>
            <FormLabel>Supplier</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter Supplier"
              value={formData.Supplier}
              onChange={(e) =>
                setFormData({ ...formData, Supplier: e.target.value })
              }
            />
          </div>


          <div>
            <FormLabel>Batch No</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter Batch No"
              value={formData.Supplier}
              onChange={(e) =>
                setFormData({ ...formData, Supplier: e.target.value })
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

export default EditInwardList;
