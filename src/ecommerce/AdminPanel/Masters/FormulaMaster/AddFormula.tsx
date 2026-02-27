import { useEffect, useState } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config";
import { SuccessModalConfig } from "../../CommonModals/SuccessModal/SuccessModalConfig";
import SuccessModal from "../../CommonModals/SuccessModal/SuccessModal";
import TomSelect from "@/components/Base/TomSelect";

interface AddFormulaMasterModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (payloadWithNames?: any) => void;
}

interface FinalProductOptions {
  id: number;
  final_Product: string;
}

interface Chemical {
  id: number;
  name: string;
  isActive: number;
}

interface SelectedChemical {
  chemicalMasterId: number;
  chemicalName: string;
  qty: string;
}

const AddFormula: React.FC<AddFormulaMasterModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const token = localStorage.getItem("token");

  const [finalProducts, setFinalProducts] = useState<FinalProductOptions[]>([]);
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [selectedChemicals, setSelectedChemicals] = useState<SelectedChemical[]>([]);
  const [formData, setFormData] = useState({ finalProductId: "" });
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

  // Fetch Final Products
  useEffect(() => {
    const fetchFinalProducts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/finalproduct`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFinalProducts(response.data.items || []);
      } catch (error) {
        console.error("Error fetching final products:", error);
      }
    };
    fetchFinalProducts();
  }, [token]);

  
  useEffect(() => {
    const fetchChemicals = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/chemical`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const activeChemicals = (response.data.items || []).filter(
          (c: Chemical) => c.isActive === 1
        );

        setChemicals(activeChemicals);

        setSelectedChemicals(
          activeChemicals.map((c: Chemical) => ({
            chemicalMasterId: c.id,
            chemicalName: c.name,
            qty: "",
          }))
        );
      } catch (error) {
        console.error("Error fetching chemicals:", error);
      }
    };

    fetchChemicals();
  }, [token]);

  const handleFinalProductChange = (value: string) => {
    setFormData({ finalProductId: value });
    setFormErrors((prev) => ({ ...prev, finalProductId: "" }));
  };

  const handleQtyChange = (chemicalId: number, qty: string) => {
    setSelectedChemicals((prev) =>
      prev.map((c) =>
        c.chemicalMasterId === chemicalId ? { ...c, qty } : c
      )
    );
  };

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};

    if (!formData.finalProductId) {
      errors.finalProductId = "Final Product is required";
    }

    selectedChemicals.forEach((c) => {
      if (!c.qty) {
        errors[`chemical_${c.chemicalMasterId}`] =
          `${c.chemicalName} qty is required`;
      }
    });

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
    
      const formulaMasterRes = await axios.post(
        `${BASE_URL}/api/formulamaster`,
        { finalProductId: Number(formData.finalProductId), isActive: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const formulaMasterId = formulaMasterRes.data.id;
      const chemicalsToSave = selectedChemicals
        .filter((c) => c.qty !== "")
        .reduce((acc: SelectedChemical[], current) => {
          if (!acc.find((item) => item.chemicalMasterId === current.chemicalMasterId)) {
            acc.push(current);
          }
          return acc;
        }, []);

      await Promise.all(
        chemicalsToSave.map((c) =>
          axios.post(
            `${BASE_URL}/api/formulachemicaltransaction`,
            {
              formulaMasterId,
              chemicalMasterId: c.chemicalMasterId,
              qty: Number(c.qty),
              isActive: 1,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );

      const finalProductMap: Record<number, string> = {};
      finalProducts.forEach(fp => {
        finalProductMap[fp.id] = fp.final_Product;
      });

      const chemicalMap: Record<number, string> = {};
      chemicals.forEach(c => {
        chemicalMap[c.id] = c.name;
      });

      const displayPayload = {
        finalProduct: finalProductMap[Number(formData.finalProductId)] || formData.finalProductId,
        chemicals: selectedChemicals
          .filter(c => c.qty !== "")
          .map(c => ({
            chemicalName: chemicalMap[c.chemicalMasterId] || c.chemicalMasterId,
            qty: c.qty,
          })),
      };

      console.log("Payload with names:", displayPayload);

      setFormData({ finalProductId: "" });
      setSelectedChemicals(
        chemicals.map((c) => ({
          chemicalMasterId: c.id,
          chemicalName: c.name,
          qty: "",
        }))
      );
      setFormErrors({});
      onClose();

      setSuccessModalConfig({
        title: "Formula Created Successfully",
        subtitle: "The formula and chemicals have been saved.",
        icon: "CheckCircle",
        buttonText: "OK",
        onButtonClick: () => setIsSuccessModalOpen(false),
      });
      setIsSuccessModalOpen(true);

      // Pass payload to parent
      onSuccess(displayPayload);

    } catch (error: any) {
      console.error("Submit error:", error);
      alert(error.response?.data?.detail || "Something went wrong");
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} staticBackdrop size="md">
        <Dialog.Panel>
          <Dialog.Title>
            <h2 className="text-base font-medium">Create New Formula</h2>
          </Dialog.Title>

          <Dialog.Description className="space-y-4">
            {/* Final Product Dropdown */}
            <div>
              <FormLabel>Final Product</FormLabel>
              <TomSelect
                value={formData.finalProductId}
                onChange={(e) => handleFinalProductChange(e.target.value)}
                options={{
                  placeholder: "Select Final Product",
                  allowEmptyOption: true,
                }}
                className="w-full"
              >
                <option value="">Select Final Product</option>
                {finalProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.final_Product}
                  </option>
                ))}
              </TomSelect>

              {formErrors.finalProductId && (
                <p className="text-red-500 text-sm">
                  {formErrors.finalProductId}
                </p>
              )}
            </div>

            {/* Chemicals */}
            {selectedChemicals.map((c) => (
              <div key={c.chemicalMasterId}>
                <FormLabel>{c.chemicalName}</FormLabel>
                <FormInput
                  type="number"
                  placeholder={`Enter ${c.chemicalName} qty`}
                  value={c.qty}
                  onChange={(e) =>
                    handleQtyChange(c.chemicalMasterId, e.target.value)
                  }
                />
                {formErrors[`chemical_${c.chemicalMasterId}`] && (
                  <p className="text-sm text-red-500">
                    {formErrors[`chemical_${c.chemicalMasterId}`]}
                  </p>
                )}
              </div>
            ))}
          </Dialog.Description>

          <Dialog.Footer>
            <Button
              type="button"
              variant="secondary"
              className="w-24 mr-2"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              className="w-24"
              onClick={handleSubmit}
            >
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

export default AddFormula;
