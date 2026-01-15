import { useState, useEffect } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";

interface EditGramProps {
  open: boolean;
  onClose: () => void;
  GramData: {
    id: number;
    grm: string;
  } | null;
  onUpdateGram: (data: {
    id: number;
   grm: string;
  }) => void;
}

const EditGamage: React.FC<EditGramProps> = ({
  open,
  onClose,
  GramData,
  onUpdateGram,
}) => {
  const [formData, setFormData] = useState({
    id: 0,
    grm: "",
  });

  
  useEffect(() => {
    if (GramData) {
      setFormData(GramData);
    }
  }, [GramData]);

  const handleUpdate = () => {
    if (!formData.grm) return;
    onUpdateGram(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} staticBackdrop size="md">
      <Dialog.Panel>
        <Dialog.Title>
          <h2 className="text-base font-medium">Edit Name</h2>
        </Dialog.Title>

        <Dialog.Description className="space-y-4">
          <div>
            <FormLabel>Chemical Name</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter Gram"
              value={formData.grm}
              onChange={(e) =>
                setFormData({ ...formData, grm: e.target.value })
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

export default EditGamage;
