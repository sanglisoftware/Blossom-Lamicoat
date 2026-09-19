import { useEffect, useState } from "react";
import axios from "axios";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import TomSelect from "@/components/Base/TomSelect";
import { SuccessModalConfig } from "../../CommonModals/SuccessModal/SuccessModalConfig";
import SuccessModal from "../../CommonModals/SuccessModal/SuccessModal";
import { BASE_URL } from "@/ecommerce/config/config";
import { useNavigate, useSearchParams } from "react-router-dom";

const boundingOptions: Option[] = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

type FinalProductApiItem = {
  id?: number;
  Id?: number;
  finalProduct?: string;
  FinalProduct?: string;
};

type ClothRollingApiItem = {
  id?: number;
  Id?: number;
  rollNo?: string;
  RollNo?: string;
  productName?: string;
  ProductName?: string;
  gramage?: string;
  Gramage?: string;
  colour?: string;
  Colour?: string;
  rollMtr?: number;
  RollMtr?: number;
  isActive?: number;
  IsActive?: number;
};

type PVCInwardApiItem = {
  id?: number;
  Id?: number;
  pvcMasterId?: number;
  PVCMasterId?: number;
  pvcMasterName?: string;
  PVCMasterName?: string;
  batchNo?: string | number;
  BatchNo?: string | number;
  gramageName?: string;
  GramageName?: string;
  colourName?: string;
  ColourName?: string;
  qty_kg?: number;
  Qty_kg?: number;
};

type StockApiItem = {
  masterId?: number;
  MasterId?: number;
  chemicalMasterId?: number;
  ChemicalMasterId?: number;
  name?: string;
  Name?: string;
  chemicalName?: string;
  ChemicalName?: string;
  balance?: number;
  Balance?: number;
};

type StockResponse = {
  chemicals?: StockApiItem[];
  Chemicals?: StockApiItem[];
  mixtures?: StockApiItem[];
  Mixtures?: StockApiItem[];
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = Number(searchParams.get("edit") || 0);
  const [formData, setFormData] = useState({
    finalProduct: "",
    finalProductQtyMtr: "",
    clothRollCode: "",
    pvc: "",
    pvcBatchNo: "",
    pvcQty: "",
    mixture: "",
    mixtureQty: "",
    chemical: "",
    chemicalQty: "",
    bounding: "",
    workerName: "",
    temperature: "",
    processHours: "",
    processMinutes: "",
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
  const [pvcOptions, setPvcOptions] = useState<Option[]>([]);
  const [pvcInwardMap, setPvcInwardMap] = useState<Record<string, { batchNo: string; qty: number }>>({});
  const [mixtureOptions, setMixtureOptions] = useState<Option[]>([]);
  const [chemicalOptions, setChemicalOptions] = useState<Option[]>([]);
  const [workerOptions, setWorkerOptions] = useState<Option[]>([]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      const getDropdownData = async <T,>(url: string, fallback: T) => {
        try {
          return await axios.get<T>(url, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (error) {
          console.error(`Error loading lamination selector data from ${url}:`, error);
          return { data: fallback };
        }
      };

        const [
          finalProductResponse,
          clothRollingResponse,
          pvcInwardResponse,
          stockResponse,
          employeeResponse,
        ] = await Promise.all([
          getDropdownData<PagedResponse<FinalProductApiItem> | FinalProductApiItem[]>(
            `${BASE_URL}/api/formulamaster/finished-goods`,
            []
          ),
          getDropdownData<PagedResponse<ClothRollingApiItem>>(
            `${BASE_URL}/api/clothrollingform?page=1&size=1000`,
            { items: [] }
          ),
          getDropdownData<PagedResponse<PVCInwardApiItem>>(
            `${BASE_URL}/api/pvcinward?page=1&size=1000`,
            { items: [] }
          ),
          getDropdownData<StockResponse>(
            `${BASE_URL}/api/stock-management`,
            { chemicals: [], mixtures: [] }
          ),
          getDropdownData<PagedResponse<EmployeeApiItem>>(
            `${BASE_URL}/api/employees?page=1&size=1000`,
            { items: [] }
          ),
        ]);

        const finalProducts = Array.isArray(finalProductResponse.data)
          ? finalProductResponse.data
          : finalProductResponse.data?.items ?? finalProductResponse.data?.Items ?? [];
        setFinalProductOptions(
          finalProducts.map((item) => ({
            value: String(item.id ?? item.Id ?? ""),
            label: String(item.finalProduct ?? item.FinalProduct ?? ""),
          }))
        );

        const clothRollingForms =
          clothRollingResponse.data?.items ?? clothRollingResponse.data?.Items ?? [];
        setClothRollCodeOptions(
          clothRollingForms
            .filter((item) => Number(item.isActive ?? item.IsActive ?? 1) === 1)
            .map((item) => {
              const rollNo = String(item.rollNo ?? item.RollNo ?? "").trim();
              const productName = String(item.productName ?? item.ProductName ?? "").trim();
              const gramage = String(item.gramage ?? item.Gramage ?? "").trim();
              const colour = String(item.colour ?? item.Colour ?? "").trim();
              const rollMtr = Number(item.rollMtr ?? item.RollMtr ?? 0);
              return {
                value: String(item.id ?? item.Id ?? ""),
                label: [rollNo, productName, gramage, colour, `${rollMtr} MTR`]
                  .filter(Boolean)
                  .join(" - "),
              };
            })
            .filter((option) => option.value && option.label)
        );

        const pvcInwards = pvcInwardResponse.data?.items ?? pvcInwardResponse.data?.Items ?? [];
        const nextPvcInwardMap: Record<string, { batchNo: string; qty: number }> = {};
        pvcInwards.forEach((item) => {
          const inwardId = String(item.id ?? item.Id ?? "");
          const pvcMasterId = Number(item.pvcMasterId ?? item.PVCMasterId ?? 0);
          const name = String(item.pvcMasterName ?? item.PVCMasterName ?? "").trim();
          const gramage = String(item.gramageName ?? item.GramageName ?? "").trim();
          const colour = String(item.colourName ?? item.ColourName ?? "").trim();
          const batchNo = String(item.batchNo ?? item.BatchNo ?? "").trim();
          const qty = Number(item.qty_kg ?? item.Qty_kg ?? 0);
          if (!inwardId || !pvcMasterId || !name) return;
          nextPvcInwardMap[inwardId] = { batchNo, qty };
        });
        setPvcInwardMap(nextPvcInwardMap);
        setPvcOptions(pvcInwards.map((item) => {
          const inwardId = String(item.id ?? item.Id ?? "");
          const name = String(item.pvcMasterName ?? item.PVCMasterName ?? "").trim();
          const gramage = String(item.gramageName ?? item.GramageName ?? "").trim();
          const colour = String(item.colourName ?? item.ColourName ?? "").trim();
          const qty = Number(item.qty_kg ?? item.Qty_kg ?? 0);
          return { value: inwardId, label: [name, gramage, colour, `${qty} KG`].filter(Boolean).join(" - ") };
        }).filter((option) => option.value && option.label));

        const chemicals = stockResponse.data.chemicals ?? stockResponse.data.Chemicals ?? [];
        setChemicalOptions(
          chemicals.map((item) => ({
            value: String(item.chemicalMasterId ?? item.ChemicalMasterId ?? ""),
            label: `${String(item.chemicalName ?? item.ChemicalName ?? "")} (${Number(item.balance ?? item.Balance ?? 0).toFixed(2)} available)`,
          }))
        );
        const mixtures = stockResponse.data.mixtures ?? stockResponse.data.Mixtures ?? [];
        setMixtureOptions(mixtures.map((item) => ({
          value: String(item.masterId ?? item.MasterId ?? ""),
          label: `${String(item.name ?? item.Name ?? "")} (${Number(item.balance ?? item.Balance ?? 0).toFixed(2)} KG available)`,
        })));

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
    };

    fetchDropdownData();
  }, [token]);

  useEffect(() => {
    if (!editId) return;
    axios.get(`${BASE_URL}/api/laminationform/${editId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(({ data }) => {
      const time = String(data.processTime ?? data.ProcessTime ?? "");
      const hours = time.match(/(\d+(?:\.\d+)?)\s*hr/i)?.[1] ?? "";
      const minutes = time.match(/(\d+(?:\.\d+)?)\s*min/i)?.[1] ?? "";
      setFormData({
        finalProduct: String(data.finalProductId ?? data.FinalProductId ?? ""),
        finalProductQtyMtr: String(data.finalProductQtyMtr ?? data.FinalProductQtyMtr ?? ""),
        clothRollCode: String(data.clothRollingFormId ?? data.ClothRollingFormId ?? ""),
        pvc: String(data.pvcInwardId ?? data.PVCInwardId ?? ""),
        pvcBatchNo: String(data.pvcBatchNo ?? data.PVCBatchNo ?? ""),
        pvcQty: String(data.pvcQty ?? data.PVCQty ?? ""),
        mixture: String(data.mixtureFormulaMasterId ?? data.MixtureFormulaMasterId ?? ""),
        mixtureQty: String(data.mixtureQty ?? data.MixtureQty ?? ""),
        chemical: String(data.chemicalId ?? data.ChemicalId ?? ""),
        chemicalQty: String(data.chemicalQty ?? data.ChemicalQty ?? ""),
        bounding: String(data.bounding ?? data.Bounding ?? "No"),
        workerName: String(data.workerId ?? data.WorkerId ?? ""),
        temperature: String(data.temperature ?? data.Temperature ?? ""),
        processHours: hours,
        processMinutes: minutes,
      });
    }).catch((error) => setFormErrors({ submit: error.response?.data?.detail ?? "Failed to load lamination record" }));
  }, [editId, token]);

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => field === "pvc"
      ? { ...prev, pvc: value, pvcBatchNo: pvcInwardMap[value]?.batchNo ?? "", pvcQty: "" }
      : field === "bounding" && value === "No"
        ? { ...prev, bounding: value, chemical: "", chemicalQty: "" }
        : { ...prev, [field]: value });
    setFormErrors((prev) => ({
      ...prev,
      [field]: "",
      ...((field === "processHours" || field === "processMinutes") ? { processTime: "" } : {}),
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors: Record<string, string> = {};

    if (!formData.finalProduct) errors.finalProduct = "Select final product";
    if (!formData.finalProductQtyMtr || Number(formData.finalProductQtyMtr) <= 0)
      errors.finalProductQtyMtr = "Enter final product quantity in MTR";
    if (!formData.clothRollCode) errors.clothRollCode = "Select a rolled fabric";
    if (!formData.pvc) errors.pvc = "Select pvc";
    if (!formData.pvcQty) errors.pvcQty = "Enter pvc qty";
    if (!formData.mixture) errors.mixture = "Select chemical mixture";
    if (!formData.mixtureQty) errors.mixtureQty = "Enter mixture qty";
    if (!formData.bounding) errors.bounding = "Select whether bonding chemical is used";
    if (formData.bounding === "Yes" && !formData.chemical) errors.chemical = "Select bonding chemical";
    if (formData.bounding === "Yes" && !formData.chemicalQty) errors.chemicalQty = "Enter bonding chemical qty";
    if (!formData.workerName) errors.workerName = "Select worker name";
    if (!formData.temperature) errors.temperature = "Enter temperature";
    const processHours = Number(formData.processHours || 0);
    const processMinutes = Number(formData.processMinutes || 0);
    if (processHours < 0 || processMinutes < 0 || processMinutes > 59)
      errors.processTime = "Enter valid hours and minutes (0 to 59)";
    else if (processHours === 0 && processMinutes === 0)
      errors.processTime = "Enter time for process";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await axios.request({
        method: editId ? "put" : "post",
        url: editId ? `${BASE_URL}/api/laminationform/${editId}` : `${BASE_URL}/api/laminationform`,
        data:
        {
          finalProductId: Number(formData.finalProduct),
          finalProductQtyMtr: Number(formData.finalProductQtyMtr),
          clothRollingFormId: Number(formData.clothRollCode),
          pvcInwardId: Number(formData.pvc),
          pvcQty: Number(formData.pvcQty),
          mixtureFormulaMasterId: Number(formData.mixture),
          mixtureQty: Number(formData.mixtureQty),
          chemicalId: formData.bounding === "Yes" ? Number(formData.chemical) : null,
          chemicalQty: formData.bounding === "Yes" ? Number(formData.chemicalQty) : 0,
          bounding: formData.bounding,
          workerId: Number(formData.workerName),
          temperature: Number(formData.temperature),
          processTime: `${processHours} hr ${processMinutes} min`,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
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
      finalProductQtyMtr: "",
      clothRollCode: "",
      pvc: "",
      pvcBatchNo: "",
      pvcQty: "",
      mixture: "",
      mixtureQty: "",
      chemical: "",
      chemicalQty: "",
      bounding: "",
      workerName: "",
      temperature: "",
      processHours: "",
      processMinutes: "",
    });

    setSuccessModalConfig({
      title: editId ? "Lamination Updated" : "Lamination Form Submitted",
      subtitle: editId ? "The lamination record has been updated successfully." : "The lamination process form has been saved successfully.",
      icon: "CheckCircle",
      buttonText: "OK",
      onButtonClick: () => {
        setIsSuccessModalOpen(false);
        if (editId) navigate("/lamination-report");
      },
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
      <h2 className="text-xl font-medium mb-6">{editId ? "Edit Lamination Process" : "Lamination Process"}</h2>

      <form
        className="box grid w-full grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-4"
        onSubmit={handleSubmit}
      >
        <div>
          <FormLabel>Select Final Product</FormLabel>
          <TomSelect
            key={`final-products-${finalProductOptions.map((option) => option.value).join("-")}`}
            value={formData.finalProduct}
            onChange={(event) => handleFieldChange("finalProduct", event.target.value)}
            options={{ placeholder: "Search final product", allowEmptyOption: true }}
          >
            <option value="">Select Final Product</option>
            {renderOptions(finalProductOptions)}
          </TomSelect>
          {formErrors.finalProduct && (
            <p className="text-red-500 text-sm mt-1">{formErrors.finalProduct}</p>
          )}
        </div>

        <div>
          <FormLabel>Final Product Qty (MTR)</FormLabel>
          <FormInput
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Enter finished product MTR"
            value={formData.finalProductQtyMtr}
            onChange={(event) => handleFieldChange("finalProductQtyMtr", event.target.value)}
          />
          {formErrors.finalProductQtyMtr && (
            <p className="text-red-500 text-sm mt-1">{formErrors.finalProductQtyMtr}</p>
          )}
        </div>

        <div>
          <FormLabel>Select Rolled Fabric</FormLabel>
          <TomSelect
            key={`cloth-rolls-${clothRollCodeOptions.map((option) => option.value).join("-")}`}
            value={formData.clothRollCode}
            onChange={(event) => handleFieldChange("clothRollCode", event.target.value)}
            options={{ placeholder: "Search roll no, fabric, GRM or colour", allowEmptyOption: true }}
          >
            <option value="">Select Cloth Roll</option>
            {renderOptions(clothRollCodeOptions)}
          </TomSelect>
          {formErrors.clothRollCode && (
            <p className="text-red-500 text-sm mt-1">{formErrors.clothRollCode}</p>
          )}
        </div>

        <div>
          <FormLabel>Select PVC</FormLabel>
          <TomSelect
            key={`pvc-inwards-${pvcOptions.map((option) => option.value).join("-")}`}
            value={formData.pvc}
            onChange={(event) => handleFieldChange("pvc", event.target.value)}
            options={{ placeholder: "Search PVC, GRM or colour", allowEmptyOption: true }}
          >
            <option value="">Select PVC</option>
            {renderOptions(pvcOptions)}
          </TomSelect>
          {formErrors.pvc && <p className="text-red-500 text-sm mt-1">{formErrors.pvc}</p>}
        </div>

        <div>
          <FormLabel>PVC Batch No</FormLabel>
          <FormInput
            type="text"
            value={formData.pvcBatchNo}
            placeholder="Selected automatically from PVC inward"
            readOnly
          />
        </div>

        <div>
          <FormLabel>PVC Qty</FormLabel>
          <FormInput
            type="number"
            min="0.01"
            step="0.01"
            max={formData.pvc ? pvcInwardMap[formData.pvc]?.qty : undefined}
            placeholder="Enter PVC Qty in KG"
            value={formData.pvcQty}
            onChange={(event) => handleFieldChange("pvcQty", event.target.value)}
          />
          {formErrors.pvcQty && (
            <p className="text-red-500 text-sm mt-1">{formErrors.pvcQty}</p>
          )}
        </div>

        <div>
          <FormLabel>Select Chemical Mixture</FormLabel>
          <TomSelect
            key={`mixtures-${mixtureOptions.map((option) => option.value).join("-")}`}
            value={formData.mixture}
            onChange={(event) => handleFieldChange("mixture", event.target.value)}
            options={{ placeholder: "Search chemical mixture", allowEmptyOption: true }}
          >
            <option value="">Select Chemical Mixture</option>
            {renderOptions(mixtureOptions)}
          </TomSelect>
          {formErrors.mixture && (
            <p className="text-red-500 text-sm mt-1">{formErrors.mixture}</p>
          )}
        </div>

        <div>
          <FormLabel>Mixture Qty (KG)</FormLabel>
          <FormInput
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Enter Mixture Qty"
            value={formData.mixtureQty}
            onChange={(event) => handleFieldChange("mixtureQty", event.target.value)}
          />
          {formErrors.mixtureQty && (
            <p className="text-red-500 text-sm mt-1">{formErrors.mixtureQty}</p>
          )}
        </div>

        <div>
          <FormLabel>Is Bonding Chemical Used?</FormLabel>
          <TomSelect
            value={formData.bounding}
            onChange={(event) => handleFieldChange("bounding", event.target.value)}
            options={{ placeholder: "Search Yes or No", allowEmptyOption: true }}
          >
            <option value="">Select Yes or No</option>
            {renderOptions(boundingOptions)}
          </TomSelect>
          {formErrors.bounding && (
            <p className="text-red-500 text-sm mt-1">{formErrors.bounding}</p>
          )}
        </div>

        {formData.bounding === "Yes" && (
          <>
            <div>
              <FormLabel>Select Bonding Chemical</FormLabel>
              <TomSelect
                key={`bonding-chemicals-${chemicalOptions.map((option) => option.value).join("-")}`}
                value={formData.chemical}
                onChange={(event) => handleFieldChange("chemical", event.target.value)}
                options={{ placeholder: "Search bonding chemical", allowEmptyOption: true }}
              >
                <option value="">Select Bonding Chemical</option>
                {renderOptions(chemicalOptions)}
              </TomSelect>
              {formErrors.chemical && (
                <p className="text-red-500 text-sm mt-1">{formErrors.chemical}</p>
              )}
            </div>

            <div>
              <FormLabel>Bonding Chemical Qty</FormLabel>
              <FormInput
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Enter Bonding Chemical Qty"
                value={formData.chemicalQty}
                onChange={(event) => handleFieldChange("chemicalQty", event.target.value)}
              />
              {formErrors.chemicalQty && (
                <p className="text-red-500 text-sm mt-1">{formErrors.chemicalQty}</p>
              )}
            </div>
          </>
        )}

        <div>
          <FormLabel>Select Worker Name</FormLabel>
          <TomSelect
            key={`workers-${workerOptions.map((option) => option.value).join("-")}`}
            value={formData.workerName}
            onChange={(event) => handleFieldChange("workerName", event.target.value)}
            options={{ placeholder: "Search worker name", allowEmptyOption: true }}
          >
            <option value="">Select Worker Name</option>
            {renderOptions(workerOptions)}
          </TomSelect>
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
          <div className="grid grid-cols-2 gap-2">
            <FormInput
              type="number"
              min="0"
              step="1"
              placeholder="Hours"
              value={formData.processHours}
              onChange={(event) => handleFieldChange("processHours", event.target.value)}
            />
            <FormInput
              type="number"
              min="0"
              max="59"
              step="1"
              placeholder="Minutes"
              value={formData.processMinutes}
              onChange={(event) => handleFieldChange("processMinutes", event.target.value)}
            />
          </div>
          {formErrors.processTime && (
            <p className="text-red-500 text-sm mt-1">{formErrors.processTime}</p>
          )}
        </div>

        {formErrors.submit && (
          <p className="text-red-500 text-sm md:col-span-2 xl:col-span-4">{formErrors.submit}</p>
        )}

        <div className="flex justify-end md:col-span-2 xl:col-span-4">
          <Button variant="primary" type="submit" className="w-32">
            {editId ? "Update" : "Submit"}
          </Button>
        </div>
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
