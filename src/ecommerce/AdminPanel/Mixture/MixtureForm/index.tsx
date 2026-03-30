import { useEffect, useState } from "react";
import axios from "axios";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import TomSelect from "@/components/Base/TomSelect";
import { BASE_URL } from "@/ecommerce/config/config";
import { SuccessModalConfig } from "../../CommonModals/SuccessModal/SuccessModalConfig";
import SuccessModal from "../../CommonModals/SuccessModal/SuccessModal";

type FormulaListItem = {
  formulaMasterId?: number;
  FormulaMasterId?: number;
  finalProductName?: string;
  FinalProductName?: string;
  mixtureName?: string;
  MixtureName?: string;
};

type FormulaListResponse = {
  items?: FormulaListItem[];
  Items?: FormulaListItem[];
  totalCount?: number;
  TotalCount?: number;
};

type FinalProductOption = {
  formulaMasterId: number;
  finalProductName: string;
  mixtureName: string;
};

type ChemicalItem = {
  chemicalMasterId?: number;
  ChemicalMasterId?: number;
  chemicalName?: string;
  ChemicalName?: string;
  qty?: number;
  Qty?: number;
};

type FormulaDetailsResponse = {
  formulaMasterId?: number;
  FormulaMasterId?: number;
  mixtureName?: string;
  MixtureName?: string;
  chemicals?: ChemicalItem[];
  Chemicals?: ChemicalItem[];
};

type ChemicalRow = {
  chemicalName: string;
  qty: number;
};

const Main = () => {
  const token = localStorage.getItem("token");

  const [finalProducts, setFinalProducts] = useState<FinalProductOption[]>([]);
  const [chemicalRows, setChemicalRows] = useState<ChemicalRow[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoadingChemicals, setIsLoadingChemicals] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalConfig, setSuccessModalConfig] =
    useState<SuccessModalConfig>({
      title: "",
      subtitle: "",
      icon: "CheckCircle",
      buttonText: "OK",
      onButtonClick: () => {},
    });
  const [formData, setFormData] = useState({
    formulaMasterId: "",
    mixtureName: "",
    totalMixture: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const fetchFormulaProducts = async () => {
      try {
        const response = await axios.get<FormulaListResponse>(
          `${BASE_URL}/api/formulachemicaltransaction?page=1&size=1000`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const items = response.data?.items ?? response.data?.Items ?? [];
        const uniqueMap = new Map<number, FinalProductOption>();

        items.forEach((item) => {
          const formulaMasterId = Number(item.formulaMasterId ?? item.FormulaMasterId ?? 0);
          const finalProductName = String(
            item.finalProductName ?? item.FinalProductName ?? ""
          ).trim();
          const mixtureName = String(
            item.mixtureName ?? item.MixtureName ?? ""
          ).trim();

          if (!formulaMasterId || !finalProductName || uniqueMap.has(formulaMasterId)) {
            return;
          }

          uniqueMap.set(formulaMasterId, {
            formulaMasterId,
            finalProductName,
            mixtureName,
          });
        });

        setFinalProducts(Array.from(uniqueMap.values()));
      } catch (error) {
        console.error("Error fetching formula products:", error);
        setFinalProducts([]);
      }
    };

    fetchFormulaProducts();
  }, [token]);

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleFinalProductChange = async (value: string) => {
    const selectedProduct = finalProducts.find(
      (product) => String(product.formulaMasterId) === value
    );

    setFormData((prev) => ({
      ...prev,
      formulaMasterId: value,
      mixtureName: selectedProduct?.mixtureName ?? "",
    }));
    setFormErrors((prev) => ({ ...prev, formulaMasterId: "" }));
    setChemicalRows([]);

    if (!value) return;

    setIsLoadingChemicals(true);

    try {
      const response = await axios.get<FormulaDetailsResponse>(
        `${BASE_URL}/api/formulachemicaltransaction/${value}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const mixtureName = String(
        response.data?.mixtureName ?? response.data?.MixtureName ?? selectedProduct?.mixtureName ?? ""
      ).trim();
      const chemicals = response.data?.chemicals ?? response.data?.Chemicals ?? [];
      const mappedChemicals: ChemicalRow[] = chemicals.map((item) => ({
        chemicalName: String(item.chemicalName ?? item.ChemicalName ?? ""),
        qty: Number(item.qty ?? item.Qty ?? 0),
      }));

      setFormData((prev) => ({
        ...prev,
        mixtureName,
      }));
      setChemicalRows(mappedChemicals);
    } catch (error) {
      console.error("Error fetching formula chemicals:", error);
      setChemicalRows([]);
    } finally {
      setIsLoadingChemicals(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors: Record<string, string> = {};

    if (!formData.formulaMasterId) errors.formulaMasterId = "Select final product";
    if (chemicalRows.length === 0) errors.formulaMasterId = "No chemical list found";
    if (!formData.totalMixture) errors.totalMixture = "Enter total mixture";
    if (!formData.date) errors.date = "Select date";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/api/mixtureform`,
        {
          formulaMasterId: Number(formData.formulaMasterId),
          mixtureName: formData.mixtureName.trim(),
          totalMixture: Number(formData.totalMixture),
          createdDate: formData.date,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setFormData({
        formulaMasterId: "",
        mixtureName: "",
        totalMixture: "",
        date: new Date().toISOString().split("T")[0],
      });
      setChemicalRows([]);
      setFormErrors({});
      setSuccessModalConfig({
        title: "Mixture Form Submitted",
        subtitle: "The mixture form has been saved successfully.",
        icon: "CheckCircle",
        buttonText: "OK",
        onButtonClick: () => setIsSuccessModalOpen(false),
      });
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Error saving mixture form:", error);
      setFormErrors((prev) => ({
        ...prev,
        submit: "Failed to save mixture form",
      }));
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-medium mb-6">Mixture Form</h2>

      <form className="box p-5 space-y-4 w-full max-w-4xl" onSubmit={handleSubmit}>
        <div className="max-w-xl">
          <FormLabel>Select Final Product</FormLabel>
          <TomSelect
            value={formData.formulaMasterId}
            onChange={(event) => handleFinalProductChange(event.target.value)}
            options={{
              placeholder: "Select Final Product",
              allowEmptyOption: true,
            }}
            className="w-full"
          >
            <option value="">Select Final Product</option>
            {finalProducts.map((product) => (
              <option key={product.formulaMasterId} value={product.formulaMasterId}>
                {product.finalProductName}
              </option>
            ))}
          </TomSelect>
          {formErrors.formulaMasterId && (
            <p className="text-red-500 text-sm mt-1">{formErrors.formulaMasterId}</p>
          )}
        </div>

        <div className="max-w-xl">
          <FormLabel>Mixture Name</FormLabel>
          <FormInput
            type="text"
            placeholder="Mixture name will appear after selecting final product"
            value={formData.mixtureName}
            readOnly
          />
        </div>

        <div>
          <FormLabel>Formula Show (According Product)</FormLabel>
          <div className="overflow-x-auto border rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Sr.No</th>
                  <th className="px-4 py-3 text-left font-medium">Chemical Name</th>
                  <th className="px-4 py-3 text-left font-medium">Qty</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingChemicals ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-4 text-center text-slate-500">
                      Loading chemical list...
                    </td>
                  </tr>
                ) : chemicalRows.length > 0 ? (
                  chemicalRows.map((item, index) => (
                    <tr key={`${item.chemicalName}-${index}`} className="border-t">
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-4 py-3">{item.chemicalName}</td>
                      <td className="px-4 py-3">{item.qty}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-4 text-center text-slate-500">
                      Select final product to view chemical list.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="max-w-xl">
          <FormLabel>Total Mixture</FormLabel>
          <FormInput
            type="number"
            placeholder="Enter total mixture"
            value={formData.totalMixture}
            onChange={(event) => handleFieldChange("totalMixture", event.target.value)}
          />
          {formErrors.totalMixture && (
            <p className="text-red-500 text-sm mt-1">{formErrors.totalMixture}</p>
          )}
        </div>

        <div className="max-w-xl">
          <FormLabel>Date</FormLabel>
          <FormInput
            type="date"
            value={formData.date}
            onChange={(event) => handleFieldChange("date", event.target.value)}
          />
          {formErrors.date && (
            <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>
          )}
        </div>

        {formErrors.submit && (
          <div>
            <p className="text-red-500 text-sm">{formErrors.submit}</p>
          </div>
        )}

        <Button variant="primary" type="submit" className="w-24">
          Submit
        </Button>
      </form>

      <SuccessModal
        open={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={successModalConfig.title}
        subtitle={successModalConfig.subtitle}
        icon={successModalConfig.icon}
        buttonText={successModalConfig.buttonText}
        onButtonClick={successModalConfig.onButtonClick}
      />
    </div>
  );
};

export default Main;
