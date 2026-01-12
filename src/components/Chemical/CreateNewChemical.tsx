import { useState } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";

interface CreateNewChemicalModalProps {
  open: boolean;
  onClose: () => void;
  onAddChemical: (data: {
    chemicalName: string;
    type: string;
    comments: string;
  }) => void;
}

const CreateNewChemical: React.FC<CreateNewChemicalModalProps> = ({
  open,
  onClose,
  onAddChemical,
}) => {
  const [formData, setFormData] = useState({
    chemicalName: "",
    type: "",
    comments: "",
  });

  const handleAdd = () => {
    if (!formData.chemicalName) return;

    // 🔥 send data to parent table
    onAddChemical(formData);

    // reset form
    setFormData({
      chemicalName: "",
      type: "",
      comments: "",
    });

    onClose();
  };

  return (
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
              onChange={(e) =>
                setFormData({ ...formData, chemicalName: e.target.value })
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
            onClick={handleAdd}
          >
            Add
          </Button>
        </Dialog.Footer>
      </Dialog.Panel>
    </Dialog>
  );
};

export default CreateNewChemical;
