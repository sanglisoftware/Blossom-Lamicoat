import { useState, useEffect, useMemo } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config";
import { SuccessModalConfig } from "../../CommonModals/SuccessModal/SuccessModalConfig";
import SuccessModal from "../../CommonModals/SuccessModal/SuccessModal";
import TomSelect from "@/components/Base/TomSelect";

interface EditQualityProps {
  open: boolean;
  onClose: () => void;
  QualityId: number | null;
  onSuccess?: () => void;
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

const EditGoods: React.FC<EditQualityProps> = ({
  open,
  onClose,
  QualityId,
  onSuccess,
}) => {
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    comments: "",
    gsmglmMasterId: "",
    colourMasterId: "",
    isActive: 1,
  });

  const [gsmglm, setGsmglm] = useState<GSMGLMOptions[]>([]);
  const [colours, setColours] = useState<ColourOptions[]>([]);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalConfig, setSuccessModalConfig] =
    useState<SuccessModalConfig>({
      title: "",
      subtitle: "",
      icon: "CheckCircle",
      buttonText: "OK",
      onButtonClick: () => { },
    });


  // ✅ Fetch master lists
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [gRes, cRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/gsm`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/api/colour`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setGsmglm(gRes.data.items || []);
        setColours(cRes.data.items || []);
      } catch (error) {
        console.error("Error loading masters:", error);
      }
    };

    fetchMasters();
  }, [token]);


  useEffect(() => {
    if (!open || !QualityId) return;

    const fetchQuality = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/quality/${QualityId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFormData({
          id: res.data.id,
          name: res.data.name || "",
          comments: res.data.comments || "",
          gsmglmMasterId: res.data.gsmglmMasterId?.toString() || "",
          colourMasterId: res.data.colourMasterId?.toString() || "",
          isActive: res.data.isActive ?? 1,

        });
        setFormErrors({});
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchQuality();
  }, [open, QualityId, token]);


  // ✅ Active only
  const activeGsmglm = useMemo(
    () => gsmglm.filter((g) => g.isActive === 1),
    [gsmglm]
  );

  const activeColours = useMemo(
    () => colours.filter((c) => c.isActive === 1),
    [colours]
  );

  // ✅ Dropdown change handler
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdate = async () => {
    const errors: Record<string, string> = {};
    if (!formData.name) errors.name = "Name is required.";
    if (!formData.comments) errors.comments = "comments is required.";
    if (!formData.gsmglmMasterId) errors.gsmglmMasterId = "gsm_glm is required.";
    if (!formData.colourMasterId) errors.colourMasterId = "colour is required.";


    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        id: formData.id,
        name: formData.name,
        comments: formData.comments,
        gsmglmMasterId: formData.gsmglmMasterId,
        colourMasterId: formData.colourMasterId,
        isActive: formData.isActive,
      };

      const res = await axios.put(`${BASE_URL}/api/quality/${formData.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200 || res.status === 201) {
        onClose();

        setSuccessModalConfig({
          title: "Product Updated Successfully",
          subtitle: "The product details have been updated.",
          icon: "CheckCircle",
          buttonText: "OK",
          onButtonClick: () => setIsSuccessModalOpen(false),
        });

        setIsSuccessModalOpen(true);

        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      console.error("Product update error:", error);
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
            <h2 className="text-base font-medium">Edit Product</h2>
          </Dialog.Title>

          <Dialog.Description className="space-y-4">
            <div>
              <FormLabel> Name</FormLabel>
              <FormInput
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              {formErrors.Name && <p className="text-sm text-red-500">{formErrors.name}</p>}
            </div>
            <div>
              <FormLabel>Comments</FormLabel>
              <FormInput
                type="text"
                value={formData.comments}
                onChange={(e) =>
                  setFormData({ ...formData, comments: e.target.value })
                }
              />
              {formErrors.comments && <p className="text-sm text-red-500">{formErrors.comments}</p>}

            </div>
            <div>
              <FormLabel>GSM/SLM</FormLabel>

              <TomSelect
                value={formData.gsmglmMasterId}
                onChange={(e) => handleChange("gsmglmMasterId", e.target.value)}
                options={{ placeholder: "Select GSM/GLM" }}
              >
                <option value="">Select GSM/GLM</option>
                {activeGsmglm.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </TomSelect>
            </div>

            <div>
              <FormLabel>Colour</FormLabel>
              <TomSelect
                value={formData.colourMasterId}
                onChange={(e) =>
                  handleChange("colourMasterId", e.target.value)
                }
                options={{ placeholder: "Select Colour" }}
                className="w-full"
              >
                <option value="">Select Colour</option>
                {activeColours.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </TomSelect>
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
              variant="primary"              className="w-24"
              onClick={handleUpdate}
            >
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

export default EditGoods;
