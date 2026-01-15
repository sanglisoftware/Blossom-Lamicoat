import { useState, useEffect } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";

interface EditGradeProps {
  open: boolean;
  onClose: () => void;
  GradeData: {
    id: number;
    Name: string;
  } | null;
  onUpdateGrade: (data: {
    id: number;
   Name: string;
  }) => void;
}

const EditGrade: React.FC<EditGradeProps> = ({
  open,
  onClose,
  GradeData,
  onUpdateGrade,
}) => {
  const [formData, setFormData] = useState({
    id: 0,
    Name: "",
  });

  
  useEffect(() => {
    if (GradeData) {
      setFormData(GradeData);
    }
  }, [GradeData]);

  const handleUpdate = () => {
    if (!formData.Name) return;
    onUpdateGrade(formData);
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
            <FormLabel>Grade Name</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter Name"
              value={formData.Name}
              onChange={(e) =>
                setFormData({ ...formData, Name: e.target.value })
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

export default EditGrade;
