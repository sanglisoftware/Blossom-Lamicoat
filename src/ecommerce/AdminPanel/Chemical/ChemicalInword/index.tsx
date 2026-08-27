import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import TomSelect from "@/components/Base/TomSelect";
import { BASE_URL } from "@/ecommerce/config/config";
import SuccessModal from "../../CommonModals/SuccessModal/SuccessModal";
import { SuccessModalConfig } from "../../CommonModals/SuccessModal/SuccessModalConfig";

type MasterOption = {
  id: number;
  name: string;
  isActive?: number | boolean | null;
};

type MasterResponse = {
  items?: MasterOption[];
  Items?: MasterOption[];
};

const isActiveItem = (value: number | boolean | null | undefined) =>
  value === undefined || value === null || value === 1 || value === true;

const getTodayDate = () => new Date().toISOString().split("T")[0];

const emptyForm = {
  chemicalId: "",
  supplierId: "",
  unitOfMeasurementId: "",
  qty: "",
  batchNo: "",
  billDate: getTodayDate(),
  receivedDate: getTodayDate(),
};

const ChemicalInword = () => {
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState(emptyForm);
  const [chemicals, setChemicals] = useState<MasterOption[]>([]);
  const [suppliers, setSuppliers] = useState<MasterOption[]>([]);
  const [unitOfMeasurements, setUnitOfMeasurements] = useState<MasterOption[]>([]);
  const [isLoadingMasters, setIsLoadingMasters] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const authHeaders = useMemo(
    () => ({ Authorization: token ? `Bearer ${token}` : "" }),
    [token]
  );

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        setIsLoadingMasters(true);

        const [chemicalRes, supplierRes, unitRes] = await Promise.all([
          axios.get<MasterResponse>(`${BASE_URL}/api/chemical?page=1&size=1000`, {
            headers: authHeaders,
          }),
          axios.get<MasterResponse>(`${BASE_URL}/api/supplier?page=1&size=1000`, {
            headers: authHeaders,
          }),
          axios.get<MasterResponse>(
            `${BASE_URL}/api/unitofmeasurement?page=1&size=1000`,
            {
              headers: authHeaders,
            }
          ),
        ]);

        setChemicals(chemicalRes.data?.items ?? chemicalRes.data?.Items ?? []);
        setSuppliers(supplierRes.data?.items ?? supplierRes.data?.Items ?? []);
        setUnitOfMeasurements(unitRes.data?.items ?? unitRes.data?.Items ?? []);
      } catch (error) {
        console.error("Error fetching chemical inward masters:", error);
        setFormErrors((prev) => ({
          ...prev,
          masters: "Unable to load chemicals, suppliers, or units",
        }));
      } finally {
        setIsLoadingMasters(false);
      }
    };

    void fetchMasters();
  }, [authHeaders]);

  const activeChemicals = useMemo(
    () => chemicals.filter((chemical) => isActiveItem(chemical.isActive)),
    [chemicals]
  );

  const activeSuppliers = useMemo(
    () => suppliers.filter((supplier) => isActiveItem(supplier.isActive)),
    [suppliers]
  );

  const activeUnitOfMeasurements = useMemo(
    () => unitOfMeasurements.filter((unit) => isActiveItem(unit.isActive)),
    [unitOfMeasurements]
  );

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: "", submit: "" }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.chemicalId) errors.chemicalId = "Chemical is required";
    if (!formData.supplierId) errors.supplierId = "Supplier is required";
    if (!formData.unitOfMeasurementId) {
      errors.unitOfMeasurementId = "UOM is required";
    }
    if (!formData.qty) {
      errors.qty = "QTY is required";
    } else if (Number(formData.qty) <= 0) {
      errors.qty = "QTY must be greater than 0";
    }
    if (!formData.batchNo.trim()) {
      errors.batchNo = "Invoice No is required";
    }
    if (!formData.billDate) errors.billDate = "Bill Date is required";
    if (!formData.receivedDate) {
      errors.receivedDate = "Received Date is required";
    }

    return errors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setIsSubmitting(true);

      await axios.post(
        `${BASE_URL}/api/chemicalinward`,
        {
          chemicalMasterId: Number(formData.chemicalId),
          qty: Number(formData.qty),
          unitOfMeasurementId: Number(formData.unitOfMeasurementId),
          supplierMasterId: Number(formData.supplierId),
          batchNo: formData.batchNo.trim(),
          billDate: formData.billDate,
          receivedDate: formData.receivedDate,
          isActive: 1,
        },
        {
          headers: authHeaders,
        }
      );

      setFormData({ ...emptyForm, billDate: getTodayDate(), receivedDate: getTodayDate() });
      setFormErrors({});
      setSuccessModalConfig({
        title: "Chemical Inward Submitted",
        subtitle: "The chemical inward entry has been saved successfully.",
        icon: "CheckCircle",
        buttonText: "OK",
        onButtonClick: () => setIsSuccessModalOpen(false),
      });
      setIsSuccessModalOpen(true);
    } catch (error: any) {
      console.error("Chemical inward submit error:", error);
      setFormErrors((prev) => ({
        ...prev,
        submit:
          error.response?.data?.detail ||
          error.response?.data?.message ||
          "Unable to save chemical inward",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="p-6">
        <h2 className="mb-6 text-xl font-medium">Chemical Inward</h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-12 gap-6"
        >
          <div className="col-span-12 box p-5 lg:col-span-7">
            <div className="space-y-4">
              {formErrors.masters && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                  {formErrors.masters}
                </p>
              )}

              <div>
                <FormLabel>Chemical Name</FormLabel>
                {isLoadingMasters ? (
                  <p className="text-sm text-slate-500">Loading chemicals...</p>
                ) : (
                  <TomSelect
                    value={formData.chemicalId}
                    onChange={(event) =>
                      handleFieldChange("chemicalId", event.target.value)
                    }
                    options={{
                      placeholder: "Select Chemical",
                      allowEmptyOption: true,
                    }}
                    className="w-full"
                  >
                    <option value="">Select Chemical</option>
                    {activeChemicals.map((chemical) => (
                      <option key={chemical.id} value={chemical.id}>
                        {chemical.name}
                      </option>
                    ))}
                  </TomSelect>
                )}
                {formErrors.chemicalId && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.chemicalId}
                  </p>
                )}
              </div>

              <div>
                <FormLabel>Supplier</FormLabel>
                {isLoadingMasters ? (
                  <p className="text-sm text-slate-500">Loading suppliers...</p>
                ) : (
                  <TomSelect
                    value={formData.supplierId}
                    onChange={(event) =>
                      handleFieldChange("supplierId", event.target.value)
                    }
                    options={{
                      placeholder: "Select Supplier",
                      allowEmptyOption: true,
                    }}
                    className="w-full"
                  >
                    <option value="">Select Supplier</option>
                    {activeSuppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </TomSelect>
                )}
                {formErrors.supplierId && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.supplierId}
                  </p>
                )}
              </div>

              <div>
                <FormLabel>UOM</FormLabel>
                {isLoadingMasters ? (
                  <p className="text-sm text-slate-500">Loading UOM...</p>
                ) : (
                  <TomSelect
                    value={formData.unitOfMeasurementId}
                    onChange={(event) =>
                      handleFieldChange("unitOfMeasurementId", event.target.value)
                    }
                    options={{
                      placeholder: "Select UOM",
                      allowEmptyOption: true,
                    }}
                    className="w-full"
                  >
                    <option value="">Select UOM</option>
                    {activeUnitOfMeasurements.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </TomSelect>
                )}
                {formErrors.unitOfMeasurementId && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.unitOfMeasurementId}
                  </p>
                )}
              </div>

              <div>
                <FormLabel>QTY</FormLabel>
                <FormInput
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter QTY"
                  value={formData.qty}
                  onChange={(event) => handleFieldChange("qty", event.target.value)}
                />
                {formErrors.qty && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.qty}</p>
                )}
              </div>

              <div>
                <FormLabel>Invoice No</FormLabel>
                <FormInput
                  type="text"
                  placeholder="Enter Invoice No"
                  value={formData.batchNo}
                  onChange={(event) =>
                    handleFieldChange("batchNo", event.target.value)
                  }
                />
                {formErrors.batchNo && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.batchNo}
                  </p>
                )}
              </div>

              {formErrors.submit && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                  {formErrors.submit}
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-28"
                disabled={isSubmitting || isLoadingMasters}
              >
                {isSubmitting ? "Saving..." : "Submit"}
              </Button>
            </div>
          </div>

          <div className="col-span-12 box p-5 lg:col-span-5">
            <div className="space-y-4">
              <div>
                <FormLabel>Bill Date</FormLabel>
                <FormInput
                  type="date"
                  value={formData.billDate}
                  onChange={(event) =>
                    handleFieldChange("billDate", event.target.value)
                  }
                />
                {formErrors.billDate && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.billDate}
                  </p>
                )}
              </div>

              <div>
                <FormLabel>Received Date</FormLabel>
                <FormInput
                  type="date"
                  value={formData.receivedDate}
                  onChange={(event) =>
                    handleFieldChange("receivedDate", event.target.value)
                  }
                />
                {formErrors.receivedDate && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.receivedDate}
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      <SuccessModal
        open={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        {...successModalConfig}
      />
    </>
  );
};

export default ChemicalInword;
