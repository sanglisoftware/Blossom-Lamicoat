import { useEffect, useState } from "react";
import axios from "axios";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel, FormSelect } from "@/components/Base/Form";
import { SuccessModalConfig } from "../../CommonModals/SuccessModal/SuccessModalConfig";
import SuccessModal from "../../CommonModals/SuccessModal/SuccessModal";
import { BASE_URL } from "@/ecommerce/config/config";

const boundingOptions: Option[] = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

type FinalProductApiItem = {
  id?: number;
  Id?: number;
  final_Product?: string;
  Final_Product?: string;
};

type ClothRollingApiItem = {
  id?: number;
  Id?: number;
  batchNo?: string | number;
  BatchNo?: string | number;
};

type PVCInwardApiItem = {
  id?: number;
  Id?: number;
  pvcMasterId?: number;
  PVCMasterId?: number;
  pvcMasterName?: string;
  PVCMasterName?: string;
  batchNo?: number;
  BatchNo?: number;
};

type ChemicalApiItem = {
  id?: number;
  Id?: number;
  name?: string;
  Name?: string;
};

type EmployeeApiItem = {
  id?: number;
  Id?: number;
  firstName?: string;
  FirstName?: string;
  middleName?: string;
  MiddleName?: string;
  lastName?: string;
  LastName?: string;
  type?: number | string | null;
  Type?: number | string | null;
};

type PagedResponse<T> = {
  items?: T[];
  Items?: T[];
};

type Option = {
  value: string;
  label: string;
};

const Main = () => {
  const token = localStorage.getItem("token");
  const [formData, setFormData] = useState({
    finalProduct: "",
    clothRollCode: "",
    clothRollBatchNo: "",
    pvc: "",
    pvcBatchNo: "",
    pvcQty: "",
    chemical: "",
    chemicalQty: "",
    bounding: "",
    workerName: "",
    temperature: "",
    processTime: "",
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
  const [finalProductOptions, setFinalProductOptions] = useState<Option[]>([]);
  const [clothRollCodeOptions, setClothRollCodeOptions] = useState<Option[]>([]);
  const [clothRollBatchOptions, setClothRollBatchOptions] = useState<Option[]>([]);
  const [clothRollingMap, setClothRollingMap] = useState<Record<string, string>>({});
  const [pvcOptions, setPvcOptions] = useState<Option[]>([]);
  const [pvcBatchOptions, setPvcBatchOptions] = useState<Option[]>([]);
  const [chemicalOptions, setChemicalOptions] = useState<Option[]>([]);
  const [workerOptions, setWorkerOptions] = useState<Option[]>([]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [
          finalProductResponse,
          clothRollingResponse,
          pvcInwardResponse,
          chemicalResponse,
          employeeResponse,
        ] = await Promise.all([
          axios.get<PagedResponse<FinalProductApiItem>>(
            `${BASE_URL}/api/finalproduct?page=1&size=1000`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get<PagedResponse<ClothRollingApiItem>>(
            `${BASE_URL}/api/clothrollingform?page=1&size=1000`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get<PagedResponse<PVCInwardApiItem>>(
            `${BASE_URL}/api/pvcinward?page=1&size=1000`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get<PagedResponse<ChemicalApiItem>>(
            `${BASE_URL}/api/chemical?page=1&size=1000`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get<PagedResponse<EmployeeApiItem>>(
            `${BASE_URL}/api/employees?page=1&size=1000`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);

        const finalProducts =
          finalProductResponse.data?.items ?? finalProductResponse.data?.Items ?? [];
        setFinalProductOptions(
          finalProducts.map((item) => ({
            value: String(item.id ?? item.Id ?? ""),
            label: String(item.final_Product ?? item.Final_Product ?? ""),
          }))
        );

        const clothRollingForms =
          clothRollingResponse.data?.items ?? clothRollingResponse.data?.Items ?? [];
        const nextClothRollingMap: Record<string, string> = {};
        setClothRollCodeOptions(
          clothRollingForms.map((item) => {
            const id = String(item.id ?? item.Id ?? "");
            const batchNo = String(item.batchNo ?? item.BatchNo ?? "");
            nextClothRollingMap[id] = batchNo;
            return {
              value: id,
              label: id,
            };
          })
        );
        setClothRollingMap(nextClothRollingMap);
        setClothRollBatchOptions(
          clothRollingForms.map((item) => ({
            value: String(item.batchNo ?? item.BatchNo ?? ""),
            label: String(item.batchNo ?? item.BatchNo ?? ""),
          }))
        );

        const pvcInwards = pvcInwardResponse.data?.items ?? pvcInwardResponse.data?.Items ?? [];
        const uniquePvcMap = new Map<number, Option>();
        pvcInwards.forEach((item) => {
          const pvcMasterId = Number(item.pvcMasterId ?? item.PVCMasterId ?? 0);
          const label = String(item.pvcMasterName ?? item.PVCMasterName ?? "").trim();
          if (!pvcMasterId || !label || uniquePvcMap.has(pvcMasterId)) return;
          uniquePvcMap.set(pvcMasterId, {
            value: String(pvcMasterId),
            label,
          });
        });
        setPvcOptions(Array.from(uniquePvcMap.values()));
        setPvcBatchOptions(
          pvcInwards.map((item) => ({
            value: String(item.batchNo ?? item.BatchNo ?? ""),
            label: String(item.batchNo ?? item.BatchNo ?? ""),
          }))
        );

        const chemicals = chemicalResponse.data?.items ?? chemicalResponse.data?.Items ?? [];
        setChemicalOptions(
          chemicals.map((item) => ({
            value: String(item.id ?? item.Id ?? ""),
            label: String(item.name ?? item.Name ?? ""),
          }))
        );

        const employees = employeeResponse.data?.items ?? employeeResponse.data?.Items ?? [];
        const workers = employees.filter((item) => {
          const rawType = item.type ?? item.Type;
          return Number(rawType) === 1;
        });
        setWorkerOptions(
          workers.map((item) => ({
            value: String(item.id ?? item.Id ?? ""),
            label: [item.firstName ?? item.FirstName, item.middleName ?? item.MiddleName, item.lastName ?? item.LastName]
              .filter(Boolean)
              .join(" "),
          }))
        );
      } catch (error) {
        console.error("Error fetching lamination dropdown data:", error);
        setFinalProductOptions([]);
        setClothRollCodeOptions([]);
        setClothRollBatchOptions([]);
        setPvcOptions([]);
        setPvcBatchOptions([]);
        setChemicalOptions([]);
        setWorkerOptions([]);
      }
    };

    fetchDropdownData();
  }, [token]);

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => {
      if (field === "clothRollCode") {
        return {
          ...prev,
          clothRollCode: value,
          clothRollBatchNo: clothRollingMap[value] ?? "",
        };
      }

      return { ...prev, [field]: value };
    });
    setFormErrors((prev) => ({ ...prev, [field]: "", ...(field === "clothRollCode" ? { clothRollBatchNo: "" } : {}) }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors: Record<string, string> = {};

    if (!formData.finalProduct) errors.finalProduct = "Select final product";
    if (!formData.clothRollCode) errors.clothRollCode = "Select available cloth roll code";
    if (!formData.clothRollBatchNo)
      errors.clothRollBatchNo = "Select available cloth roll batch no";
    if (!formData.pvc) errors.pvc = "Select pvc";
    if (!formData.pvcBatchNo) errors.pvcBatchNo = "Select pvc batch no";
    if (!formData.pvcQty) errors.pvcQty = "Enter pvc qty";
    if (!formData.chemical) errors.chemical = "Select chemical";
    if (!formData.chemicalQty) errors.chemicalQty = "Enter chemical qty";
    if (!formData.bounding) errors.bounding = "Select bounding";
    if (!formData.workerName) errors.workerName = "Select worker name";
    if (!formData.temperature) errors.temperature = "Enter temperature";
    if (!formData.processTime) errors.processTime = "Enter time for process";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await axios.post(
        `${BASE_URL}/api/laminationform`,
        {
          finalProductId: Number(formData.finalProduct),
          clothRollingFormId: Number(formData.clothRollCode),
          clothRollBatchNo: formData.clothRollBatchNo,
          pvcMasterId: formData.pvc ? Number(formData.pvc) : null,
          pvcBatchNo: formData.pvcBatchNo,
          pvcQty: Number(formData.pvcQty),
          chemicalId: Number(formData.chemical),
          chemicalQty: Number(formData.chemicalQty),
          bounding: formData.bounding,
          workerId: Number(formData.workerName),
          temperature: Number(formData.temperature),
          processTime: formData.processTime,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error saving lamination form:", axios.isAxiosError(error) ? error.response?.data ?? error : error);
      const submitMessage = axios.isAxiosError(error)
        ? error.response?.data?.detail ?? error.response?.data?.title ?? "Failed to save lamination form"
        : "Failed to save lamination form";
      setFormErrors((prev) => ({
        ...prev,
        submit: submitMessage,
      }));
      return;
    }

    setFormData({
      finalProduct: "",
      clothRollCode: "",
      clothRollBatchNo: "",
      pvc: "",
      pvcBatchNo: "",
      pvcQty: "",
      chemical: "",
      chemicalQty: "",
      bounding: "",
      workerName: "",
      temperature: "",
      processTime: "",
    });

    setSuccessModalConfig({
      title: "Lamination Form Submitted",
      subtitle: "The lamination process form has been saved successfully.",
      icon: "CheckCircle",
      buttonText: "OK",
      onButtonClick: () => setIsSuccessModalOpen(false),
    });
    setIsSuccessModalOpen(true);
  };

  const renderOptions = (options: Option[]) =>
    options.map((option) => (
      <option key={`${option.value}-${option.label}`} value={option.value}>
        {option.label}
      </option>
    ));

  return (
    <div className="p-6">
      <h2 className="text-xl font-medium mb-6">Lamination Process</h2>

      <form className="box p-5 space-y-4 w-full max-w-xl" onSubmit={handleSubmit}>
        <div>
          <FormLabel>Select Final Product</FormLabel>
          <FormSelect
            value={formData.finalProduct}
            onChange={(event) => handleFieldChange("finalProduct", event.target.value)}
          >
            <option value="">Select Final Product</option>
            {renderOptions(finalProductOptions)}
          </FormSelect>
          {formErrors.finalProduct && (
            <p className="text-red-500 text-sm mt-1">{formErrors.finalProduct}</p>
          )}
        </div>

        <div>
          <FormLabel>Select Available Cloth Roll Code</FormLabel>
          <FormSelect
            value={formData.clothRollCode}
            onChange={(event) => handleFieldChange("clothRollCode", event.target.value)}
          >
            <option value="">Select Available Cloth Roll Code</option>
            {renderOptions(clothRollCodeOptions)}
          </FormSelect>
          {formErrors.clothRollCode && (
            <p className="text-red-500 text-sm mt-1">{formErrors.clothRollCode}</p>
          )}
        </div>

        <div>
          <FormLabel>Select Available Cloth Roll Batch No</FormLabel>
          <FormSelect
            value={formData.clothRollBatchNo}
            onChange={(event) => handleFieldChange("clothRollBatchNo", event.target.value)}
          >
            <option value="">Select Available Cloth Roll Batch No</option>
            {renderOptions(clothRollBatchOptions)}
          </FormSelect>
          {formErrors.clothRollBatchNo && (
            <p className="text-red-500 text-sm mt-1">{formErrors.clothRollBatchNo}</p>
          )}
        </div>

        <div>
          <FormLabel>Select PVC</FormLabel>
          <FormSelect
            value={formData.pvc}
            onChange={(event) => handleFieldChange("pvc", event.target.value)}
          >
            <option value="">Select PVC</option>
            {renderOptions(pvcOptions)}
          </FormSelect>
          {formErrors.pvc && <p className="text-red-500 text-sm mt-1">{formErrors.pvc}</p>}
        </div>

        <div>
          <FormLabel>Select PVC Batch No</FormLabel>
          <FormSelect
            value={formData.pvcBatchNo}
            onChange={(event) => handleFieldChange("pvcBatchNo", event.target.value)}
          >
            <option value="">Select PVC Batch No</option>
            {renderOptions(pvcBatchOptions)}
          </FormSelect>
          {formErrors.pvcBatchNo && (
            <p className="text-red-500 text-sm mt-1">{formErrors.pvcBatchNo}</p>
          )}
        </div>

        <div>
          <FormLabel>PVC Qty</FormLabel>
          <FormInput
            type="number"
            placeholder="Enter PVC Qty"
            value={formData.pvcQty}
            onChange={(event) => handleFieldChange("pvcQty", event.target.value)}
          />
          {formErrors.pvcQty && (
            <p className="text-red-500 text-sm mt-1">{formErrors.pvcQty}</p>
          )}
        </div>

        <div>
          <FormLabel>Select Chemical</FormLabel>
          <FormSelect
            value={formData.chemical}
            onChange={(event) => handleFieldChange("chemical", event.target.value)}
          >
            <option value="">Select Chemical</option>
            {renderOptions(chemicalOptions)}
          </FormSelect>
          {formErrors.chemical && (
            <p className="text-red-500 text-sm mt-1">{formErrors.chemical}</p>
          )}
        </div>

        <div>
          <FormLabel>Chemical Qty</FormLabel>
          <FormInput
            type="number"
            placeholder="Enter Chemical Qty"
            value={formData.chemicalQty}
            onChange={(event) => handleFieldChange("chemicalQty", event.target.value)}
          />
          {formErrors.chemicalQty && (
            <p className="text-red-500 text-sm mt-1">{formErrors.chemicalQty}</p>
          )}
        </div>

        <div>
          <FormLabel>Bounding</FormLabel>
          <FormSelect
            value={formData.bounding}
            onChange={(event) => handleFieldChange("bounding", event.target.value)}
          >
            <option value="">Select Bounding</option>
            {renderOptions(boundingOptions)}
          </FormSelect>
          {formErrors.bounding && (
            <p className="text-red-500 text-sm mt-1">{formErrors.bounding}</p>
          )}
        </div>

        <div>
          <FormLabel>Select Worker Name</FormLabel>
          <FormSelect
            value={formData.workerName}
            onChange={(event) => handleFieldChange("workerName", event.target.value)}
          >
            <option value="">Select Worker Name</option>
            {renderOptions(workerOptions)}
          </FormSelect>
          {formErrors.workerName && (
            <p className="text-red-500 text-sm mt-1">{formErrors.workerName}</p>
          )}
        </div>

        <div>
          <FormLabel>Temperature</FormLabel>
          <FormInput
            type="number"
            placeholder="Enter Temperature"
            value={formData.temperature}
            onChange={(event) => handleFieldChange("temperature", event.target.value)}
          />
          {formErrors.temperature && (
            <p className="text-red-500 text-sm mt-1">{formErrors.temperature}</p>
          )}
        </div>

        <div>
          <FormLabel>Time For Process</FormLabel>
          <FormInput
            type="text"
            placeholder="Enter Time For Process"
            value={formData.processTime}
            onChange={(event) => handleFieldChange("processTime", event.target.value)}
          />
          {formErrors.processTime && (
            <p className="text-red-500 text-sm mt-1">{formErrors.processTime}</p>
          )}
        </div>

        {formErrors.submit && (
          <p className="text-red-500 text-sm">{formErrors.submit}</p>
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
