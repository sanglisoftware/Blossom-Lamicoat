import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config";
import { useState } from "react";
import SuccessModal from "../../CommonModals/SuccessModal/SuccessModal";
import { SuccessModalConfig } from "../../CommonModals/SuccessModal/SuccessModalConfig";

interface AddproductListProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddproductList: React.FC<AddproductListProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    name: "",
    comments: "",
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

  const clearFormData = () =>
    setFormData({
      name: "",
      comments: "",
    });

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};

    if (!formData.name) errors.name = "Name is required";
    if (!formData.comments) errors.comments = "Comments are required";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        name: formData.name,
        comments: formData.comments,
        isActive: 1,
      };

      console.log("Submitting payload:", payload);

      const response = await axios.post(
        `${BASE_URL}/api/fproductlist`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200 || response.status === 201) {
        clearFormData();
        setFormErrors({});
        onClose();

        setSuccessModalConfig({
          title: "Product Created Successfully",
          subtitle: "The new product has been added to the system.",
          icon: "CheckCircle",
          buttonText: "OK",
          onButtonClick: () => setIsSuccessModalOpen(false),
        });

        setIsSuccessModalOpen(true);
        onSuccess();
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      alert(error.response?.data?.detail || "Something went wrong");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <>
      <Dialog open={open} onClose={onClose} staticBackdrop size="md">
        <Dialog.Panel>
          <Dialog.Title>
            <h2 className="text-base font-medium">Create New Product</h2>
          </Dialog.Title>

          <Dialog.Description className="space-y-4">
            {/* Name */}
            <div>
              <FormLabel>Name</FormLabel>
              <FormInput
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              {formErrors.name && (
                <p className="text-red-500 text-sm">{formErrors.name}</p>
              )}
            </div>

            {/* Comments */}
            <div>
              <FormLabel>Comments</FormLabel>
              <FormInput
                type="text"
                value={formData.comments}
                onChange={(e) =>
                  setFormData({ ...formData, comments: e.target.value })
                }
              />
              {formErrors.comments && (
                <p className="text-red-500 text-sm">
                  {formErrors.comments}
                </p>
              )}
            </div>
          </Dialog.Description>

          <Dialog.Footer>
            <Button variant="secondary"  className="min-w-[100px]" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary"  className="min-w-[100px]" onClick={handleSubmit}>
              Add
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

export default AddproductList;
