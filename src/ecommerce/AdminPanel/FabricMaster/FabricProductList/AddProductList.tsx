import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config";
import { useEffect, useState, useMemo } from "react";
import SuccessModal from "../../CommonModals/SuccessModal/SuccessModal";
import { SuccessModalConfig } from "../../CommonModals/SuccessModal/SuccessModalConfig";
import TomSelect from "@/components/Base/TomSelect";

interface AddproductListProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FGramageOptions {
  id: number;
  grm: string;
  isActive: number;
}

interface ColourOptions {
  id: number;
  name: string;
  isActive: number;
}

const AddproductList: React.FC<AddproductListProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    name: "",
    fGramageMasterId: "",
    colourMasterId: "",
    comments: "",
  });

  const [gramages, setGramages] = useState<FGramageOptions[]>([]);
  const [colours, setColours] = useState<ColourOptions[]>([]);

  const [gramageLoaded, setGramageLoaded] = useState(false);
  const [widthLoaded, setWidthLoaded] = useState(false);
  const [colourLoaded, setColourLoaded] = useState(false);

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
      fGramageMasterId: "",
      colourMasterId: "",
      comments: "",
    });

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    if (!open) return;

    const fetchAll = async () => {
      try {
        setGramageLoaded(false);
        setWidthLoaded(false);
        setColourLoaded(false);

        const [gRes, cRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/fgramage`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
       
          axios.get(`${BASE_URL}/api/colour`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setGramages(gRes.data.items || []);
        setColours(cRes.data.items || []);

        setGramageLoaded(true);
        setColourLoaded(true);
      } catch (error) {
        console.error("Dropdown fetch error:", error);
      }
    };

    fetchAll();
  }, [open, token]);

  /* ---------------- FILTER ACTIVE ---------------- */

  const activeGramages = useMemo(
    () => gramages.filter((g) => g.isActive === 1),
    [gramages]
  );

  const activeColours = useMemo(
    () => colours.filter((c) => c.isActive === 1),
    [colours]
  );

  /* ---------------- HANDLE CHANGE ---------------- */

const handleGramageChange = (e: { target: { value: string } }) => {
  setFormData((prev) => ({
    ...prev,
    fGramageMasterId: e.target.value,
  }));
};

const handleColourChange = (e: { target: { value: string } }) => {
  setFormData((prev) => ({
    ...prev,
    colourMasterId: e.target.value,
  }));
};

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};

    if (!formData.name) errors.name = "Name is required";
    if (!formData.fGramageMasterId)
      errors.fGramageMasterId = "Gramage is required";
    if (!formData.colourMasterId)
      errors.colourMasterId = "Colour is required";
    if (!formData.comments) errors.comments = "Comments are required";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        name: formData.name,
        fGramageMasterId: Number(formData.fGramageMasterId),
        colourMasterId: Number(formData.colourMasterId),
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

            {/* Gramage */}
          <div>
  <FormLabel>Gramage</FormLabel>

  <TomSelect
  value={formData.fGramageMasterId}
  onChange={handleGramageChange}
  options={{ placeholder: "Select Gramage" }}
>
  <option value="">Select Gramage</option>
  {activeGramages.map((g) => (
    <option key={g.id} value={g.id}>
      {g.grm}
    </option>
  ))}
</TomSelect>

  {formErrors.fGramageMasterId && (
    <p className="text-red-500 text-sm">
      {formErrors.fGramageMasterId}
    </p>
  )}
</div>
            {/* Colour */}
            <div>
  <FormLabel>Colour</FormLabel>

  <TomSelect
    value={formData.colourMasterId}
    onChange={handleColourChange}
    options={{ placeholder: "Select Colour" }}
    
  >
    <option value="">Select Colour</option>
    {activeColours.map((c) => (
      <option key={c.id} value={c.id}>
        {c.name}
      </option>
    ))}
  </TomSelect>

  {formErrors.colourMasterId && (
    <p className="text-red-500 text-sm">
      {formErrors.colourMasterId}
    </p>
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