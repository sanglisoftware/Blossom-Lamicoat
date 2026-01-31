import { useState, useEffect } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config";
import { SuccessModalConfig } from "../../CommonModals/SuccessModal/SuccessModalConfig";
import SuccessModal from "../../CommonModals/SuccessModal/SuccessModal";

interface EditGradeProps {
  open: boolean;
  onClose: () => void;
gradeId: number | null;
  onSuccess?: () => void; 
}

const EditGrade: React.FC<EditGradeProps> = ({
  open,
  onClose,
  gradeId,
  onSuccess,
}) => {
   const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    id: 0,
    name: "",
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
    if (!open || !gradeId) return;

    const fetchGrade = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/grade/${gradeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFormData({
          id: res.data.id,
          name: res.data.name,
          isActive: res.data.isActive ?? 1,
        });
        setFormErrors({});
      } catch (error) {
        console.error("Error fetching Grade:", error);
      }
    };

    fetchGrade();
  }, [open, gradeId, token]);

  const handleUpdate = async () => {
    const errors: Record<string, string> = {};
    if (!formData.name) errors.name = "Grade name is required.";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        id: formData.id,
        name: formData.name,
        isActive: formData.isActive,
      };

      const res = await axios.put(`${BASE_URL}/api/grade/${formData.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200 || res.status === 201) {
        onClose();

        setSuccessModalConfig({
          title: "Grade Updated Successfully",
          subtitle: "The grade details have been updated.",
          icon: "CheckCircle",
          buttonText: "OK",
          onButtonClick: () => setIsSuccessModalOpen(false),
        });

        setIsSuccessModalOpen(true);

        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      console.error("Grade update error:", error);
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
          <h2 className="text-base font-medium">Edit Name</h2>
        </Dialog.Title>

        <Dialog.Description className="space-y-4">
            <div>
              <FormLabel>Grade Name</FormLabel>
              <FormInput
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
            </div>

          </Dialog.Description>

          <Dialog.Footer>
            <Button variant="outline-secondary" className="w-24 mr-2" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" className="w-24" onClick={handleUpdate}>
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

export default EditGrade;
