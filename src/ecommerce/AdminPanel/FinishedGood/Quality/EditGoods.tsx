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
    Comments: string;
    GSM_GLM: string;
    Colour: string;

  } | null;
  onUpdateChemical: (data: {
    id: number;
    Name: string;
    Comments: string;
    GSM_GLM: string;
    Colour: string;
  }) => void;
}

const EditGoods: React.FC<EditChemicalProps> = ({
  open,
  onClose,
  chemicalData,
  onUpdateChemical,
}) => {
  const [formData, setFormData] = useState({
    id: 0,
    Name: "",
    Comments: "",
     GSM_GLM: "",
     Colour:""
  });

  
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
          <h2 className="text-base font-medium">Edit Prooduct</h2>
        </Dialog.Title>

        <Dialog.Description className="space-y-4">
          <div>
            
            <FormLabel>Name</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter  Name"
              value={formData.Name}
              onChange={(e) =>
                setFormData({ ...formData, Name: e.target.value })
              }
            />
          </div>

          <div>
            <FormLabel>Comments</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter Comments"
              value={formData.Comments}
              onChange={(e) =>
                setFormData({ ...formData, Comments: e.target.value })
              }
            />
          </div>

 <div>
            <FormLabel>GSM/GLM</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter GSM/GLM<"
              value={formData.GSM_GLM}
              onChange={(e) =>
                setFormData({ ...formData, GSM_GLM: e.target.value })
              }
            />
          </div>

<div>
            <FormLabel>Colour</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter colour<"
              value={formData.Colour}
              onChange={(e) =>
                setFormData({ ...formData, Colour: e.target.value })
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

export default EditGoods;
