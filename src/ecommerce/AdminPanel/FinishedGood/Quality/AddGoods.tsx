import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config"
import { useEffect, useMemo, useState } from "react";
import { SuccessModalConfig } from "../../CommonModals/SuccessModal/SuccessModalConfig";
import SuccessModal from "../../CommonModals/SuccessModal/SuccessModal";
import TomSelect from "@/components/Base/TomSelect";

interface CreateNewQualityModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void; 
}


interface GSMGLMOptions {
  id: number;
  name: string;
  isActive: number;
}


interface ColourOptions {
  id: number;
  name: string;
  isActive: number;
}

const AddGoods: React.FC<CreateNewQualityModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
   const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    name: "",
    comments: "",
    gsmglmMasterId: "",
    colourMasterId: "",
  });
  const [gsmglm, setGsmglm] = useState<GSMGLMOptions[]>([]);
  const [colours, setColours] = useState<ColourOptions[]>([]);

    const [gsmglmLoaded, setGsmglmLoaded] = useState(false);
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
    setFormData({ name: "",   gsmglmMasterId: "", colourMasterId: "", comments: "", });



  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    if (!open) return;

    const fetchAll = async () => {
      try {
        setGsmglmLoaded(false);
        setColourLoaded(false);

        const [gsmRes, cRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/gsm`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/api/colour`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setGsmglm(gsmRes.data.items || []);
        setColours(cRes.data.items || []);

        setGsmglmLoaded(true);
        setColourLoaded(true);
      } catch (error) {
        console.error("Dropdown fetch error:", error);
      }
    };

    fetchAll();
  }, [open, token]);

  /* ---------------- FILTER ACTIVE ---------------- */

  const activeGsmglm = useMemo(
    () => gsmglm.filter((g) => g.isActive === 1),
    [gsmglm]
  );

  const activeColours = useMemo(
    () => colours.filter((c) => c.isActive === 1),
    [colours]
  );

  /* ---------------- HANDLE CHANGE ---------------- */

  const handleGsmglmChange = (e: { target: { value: string } }) => {
  setFormData((prev) => ({
    ...prev,
    gsmglmMasterId: e.target.value,
  }));
};

const handleColourChange = (e: { target: { value: string } }) => {
  setFormData((prev) => ({
    ...prev,
    colourMasterId: e.target.value,
  }));
};

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};
    if (!formData.name) errors.name = "Name is required";
    if (!formData.gsmglmMasterId) errors.gsmglmMasterId = "GSM_GLM is required";
    if (!formData.colourMasterId) errors.colourMasterId = "Colour is required";
    if (!formData.comments) errors.comments = "Comments are required";


    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        name: formData.name,
        comments: formData.comments,
        gsmglmMasterId: formData.gsmglmMasterId,
        colourMasterId: formData.colourMasterId,
        isActive: 1,
      };

      const response = await axios.post(`${BASE_URL}/api/quality`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 || response.status === 201) {
        clearFormData();
        setFormErrors({});
        onClose();

        setSuccessModalConfig({
          title: " Product Created Successfully",
          subtitle: "The new  Product has been added to the system.",
          icon: "CheckCircle",
          buttonText: "OK",
          onButtonClick: () => setIsSuccessModalOpen(false),
        });

        setIsSuccessModalOpen(true);
        onSuccess();
      }
    } catch (error: any) {
      console.error("Product submit error:", error);
      alert(error.response?.data?.detail || "Something went wrong");
    }
  };

  return (
    <>
    <Dialog open={open} onClose={onClose} staticBackdrop size="md">
      <Dialog.Panel>
        <Dialog.Title>
          <h2 className="text-base font-medium">Create New Product</h2>
        </Dialog.Title>

          <Dialog.Description className="space-y-4">
            <div>
              <FormLabel> Name</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter  Name"
               value={formData.name}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, name: value });
                  if (value.trim()) setFormErrors((prev) => ({ ...prev, name: "" }));
                }}
              />
              {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
            </div>

         <div>
              <FormLabel>Comments</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter Comments"
               onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, comments: value });
                  if (value.trim()) setFormErrors((prev) => ({ ...prev, comments: "" }));
                }}
              />
              {formErrors.comments && <p className="text-sm text-red-500">{formErrors.comments}</p>}
            </div>

          <div>
              <FormLabel>GSM/SLM</FormLabel>
              {gsmglmLoaded ? (
                <TomSelect
                  value={formData.gsmglmMasterId}
                  onChange={handleGsmglmChange}
                  options={{ placeholder: "Select GSM/GLM" }}
                >
                  <option value="">Select GSM/GLM</option>
                  {activeGsmglm.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </TomSelect>
              ) : (
                <p>Loading...</p>
              )}
              {formErrors.gsmglmMasterId && (
                <p className="text-red-500 text-sm">
                  {formErrors.gsmglmMasterId}
                </p>
              )}
            </div>

           <div>
              <FormLabel>Colour</FormLabel>
              {colourLoaded ? (
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
              ) : (
                <p>Loading...</p>
              )}
              {formErrors.colourMasterId && (
                <p className="text-red-500 text-sm">
                  {formErrors.colourMasterId}
                </p>
              )}
            </div>

           
          </Dialog.Description>
 <Dialog.Footer>
            <Button type="button" variant="secondary" className="w-24 mr-2" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" variant="primary" className="w-24" onClick={handleSubmit}>
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

export default AddGoods;
