import { useState, useEffect } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";

interface EditFormulaProps {
  open: boolean;
  onClose: () => void;
 FormulaData: {
    id: number;
   FinalProduct: string;
    Chemical1: string;
    Chemical2: string;
    Chemical3: string;
    Chemical4: string;
  } | null;
  onUpdateFormula: (data: {
    id: number;
    FinalProduct: string;
    Chemical1: string;
    Chemical2: string;
    Chemical3: string;
    Chemical4: string;
  }) => void;
}

const EditFormula: React.FC<EditFormulaProps> = ({
  open,
  onClose,
  FormulaData,
  onUpdateFormula,
}) => {
  const [formData, setFormData] = useState({
    id: 0,
    FinalProduct: "",
    Chemical1: "",
    Chemical2: "",
    Chemical3:"",
    Chemical4:""
  });

  
  useEffect(() => {
    if (FormulaData) {
      setFormData(FormulaData);
    }
  }, [FormulaData]);

  const handleUpdate = () => {
    if (!formData.FinalProduct) return;
    onUpdateFormula(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} staticBackdrop size="md">
      <Dialog.Panel>
        <Dialog.Title>
          <h2 className="text-base font-medium">Edit Formula</h2>
        </Dialog.Title>

        <Dialog.Description className="space-y-4">
          <div>
            <FormLabel> Name</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter  Name"
              value={formData.FinalProduct}
              onChange={(e) =>
                setFormData({ ...formData, FinalProduct: e.target.value })
              }
            />
          </div>

          <div>
            <FormLabel>Chemical1</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter Chemical1"
              value={formData.Chemical1}
              onChange={(e) =>
                setFormData({ ...formData, Chemical1: e.target.value })
              }
            />
          </div>

          <div>
            <FormLabel>Chemical2</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter Chemical2"
              value={formData.Chemical2}
              onChange={(e) =>
                setFormData({ ...formData, Chemical2: e.target.value })
              }
            />
          </div>

           <div>
            <FormLabel>Chemical3</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter Chemical3"
              value={formData.Chemical3}
              onChange={(e) =>
                setFormData({ ...formData, Chemical3: e.target.value })
              }
            />
          </div>

           <div>
            <FormLabel>Chemical4</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter Chemical4"
              value={formData.Chemical4}
              onChange={(e) =>
                setFormData({ ...formData, Chemical4: e.target.value })
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

export default EditFormula;
