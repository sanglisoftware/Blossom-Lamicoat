import { useState, useEffect } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";

interface EditChemicalProps {
  open: boolean;
  onClose: () => void;
  chemicalData: {
    id: number;
    Name: string;
    type: string;
    comments: string;
  } | null;
  onUpdateChemical: (data: {
    id: number;
    Name: string;
    type: string;
    comments: string;
  }) => void;
}

const EditChemical: React.FC<EditChemicalProps> = ({
  open,
  onClose,
  chemicalData,
  onUpdateChemical,
}) => {
  const [formData, setFormData] = useState({
    id: 0,
    Name: "",
    type: "",
    comments: "",
  });

  // populate form when chemicalData changes
  useEffect(() => {
    if (chemicalData) {
      setFormData(chemicalData);
    }
  }, [chemicalData]);

  const handleUpdate = () => {
    if (!formData.Name) return;
    onUpdateChemical(formData);
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
              value={formData.Name}
              onChange={(e) =>
                setFormData({ ...formData, Name: e.target.value })
              }
            />
          </div>

          <div>
            <FormLabel>Type</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter Type"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
            />
          </div>

          <div>
            <FormLabel>Comments</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter Comments"
              value={formData.comments}
              onChange={(e) =>
                setFormData({ ...formData, comments: e.target.value })
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

export default EditChemical;
