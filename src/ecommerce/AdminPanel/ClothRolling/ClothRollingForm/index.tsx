import { useEffect, useState } from "react";
import axios from "axios";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel, FormSelect } from "@/components/Base/Form";
import { BASE_URL } from "@/ecommerce/config/config";
import { SuccessModalConfig } from "../../CommonModals/SuccessModal/SuccessModalConfig";
import SuccessModal from "../../CommonModals/SuccessModal/SuccessModal";

type FabricInwardApiItem = {
  id?: number;
  Id?: number;
  fabricMasterName?: string;
  FabricMasterName?: string;
  batchNo?: string;
  BatchNo?: string;
  qtyMTR?: number;
  QtyMTR?: number;
  fGramageMasterName?: string;
  FGramageMasterName?: string;
  colourMasterName?: string;
  ColourMasterName?: string;
};

type RollingApiItem = {
  fabricInwardId?: number;
  FabricInwardId?: number;
  rollMtr?: number;
  RollMtr?: number;
  defectMtr?: number;
  DefectMtr?: number;
  isActive?: number;
  IsActive?: number;
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
};

type PagedResponse<T> = {
  items?: T[];
  Items?: T[];
};

type Option = {
  value: string;
  label: string;
};

const fabricCombination = (item: FabricInwardApiItem) => {
  const name = String(item.fabricMasterName ?? item.FabricMasterName ?? "").trim();
  const grm = String(item.fGramageMasterName ?? item.FGramageMasterName ?? "").trim();
  const colour = String(item.colourMasterName ?? item.ColourMasterName ?? "").trim();
  return { key: `${name}|${grm}|${colour}`, name, grm, colour };
};

const Main = () => {
  const token = localStorage.getItem("token");
  const [productOptions, setProductOptions] = useState<Option[]>([]);
  const [fabricInwards, setFabricInwards] = useState<FabricInwardApiItem[]>([]);
  const [rolledByInward, setRolledByInward] = useState<Record<number, number>>({});
  const [checkerOptions, setCheckerOptions] = useState<Option[]>([]);
  const [formData, setFormData] = useState({
    productKey: "",
    productName: "",
    fabricInwardId: "",
    batchNo: "",
    rollMtr: "",
    defectMtr: "0",
    checkerName: "",
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
    const fetchFabricInward = async () => {
      try {
        const response = await axios.get<PagedResponse<FabricInwardApiItem>>(
          `${BASE_URL}/api/fabricinward?page=1&size=1000`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const items = response.data?.items ?? response.data?.Items ?? [];
        const uniqueProducts = new Map<string, Option>();
        setFabricInwards(items);

        items.forEach((item) => {
          const product = fabricCombination(item);

          if (product.name && !uniqueProducts.has(product.key)) {
            uniqueProducts.set(product.key, {
              value: product.key,
              label: `${product.name} - ${product.grm || "No GRM"} - ${product.colour || "No Color"}`,
            });
          }

        });

        setProductOptions(Array.from(uniqueProducts.values()));
      } catch (error) {
        console.error("Error fetching fabric inward data:", error);
        setProductOptions([]);
        setFabricInwards([]);
      }
    };

    fetchFabricInward();

    const fetchExistingRolls = async () => {
      try {
        const response = await axios.get<PagedResponse<RollingApiItem>>(
          `${BASE_URL}/api/clothrollingform?page=1&size=10000`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const totals: Record<number, number> = {};
        (response.data?.items ?? response.data?.Items ?? []).forEach((roll) => {
          const inwardId = Number(roll.fabricInwardId ?? roll.FabricInwardId ?? 0);
          const active = roll.isActive ?? roll.IsActive ?? 1;
          if (inwardId > 0 && active !== 0) {
            totals[inwardId] = (totals[inwardId] ?? 0)
              + Number(roll.rollMtr ?? roll.RollMtr ?? 0)
              + Number(roll.defectMtr ?? roll.DefectMtr ?? 0);
          }
        });
        setRolledByInward(totals);
      } catch (error) {
        console.error("Error fetching existing rolls:", error);
        setRolledByInward({});
      }
    };

    fetchExistingRolls();
  }, [token]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get<PagedResponse<EmployeeApiItem>>(
          `${BASE_URL}/api/employees?page=1&size=1000`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const items = response.data?.items ?? response.data?.Items ?? [];

        setCheckerOptions(
          items
            .map((item) => {
              const fullName = [
                item.firstName ?? item.FirstName ?? "",
                item.middleName ?? item.MiddleName ?? "",
                item.lastName ?? item.LastName ?? "",
              ]
                .filter(Boolean)
                .join(" ")
                .trim();

              return {
                value: fullName,
                label: fullName,
              };
            })
            .filter((item) => item.value)
        );
      } catch (error) {
        console.error("Error fetching employees:", error);
        setCheckerOptions([]);
      }
    };

    fetchEmployees();
  }, [token]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors: Record<string, string> = {};

    if (!formData.productKey) errors.productName = "Select product combination";
    if (!formData.fabricInwardId) errors.fabricInwardId = "Select inward batch";
    if (!formData.batchNo) errors.batchNo = "Select batch no / lot no";
    if (!formData.rollMtr) errors.rollMtr = "Enter roll mtr";
    if (Number(formData.defectMtr) < 0) errors.defectMtr = "Defect MTR cannot be negative";
    if (Number(formData.defectMtr) > Number(formData.rollMtr)) errors.defectMtr = "Defect MTR cannot exceed actual MTR";
    if (!formData.checkerName) errors.checkerName = "Select checker name";

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        productName: formData.productName,
        fabricInwardId: Number(formData.fabricInwardId),
        batchNo: formData.batchNo,
        rollMtr: Number(formData.rollMtr),
        defectMtr: Number(formData.defectMtr),
        checkerName: formData.checkerName,
        isActive: 1,
      };

      const response = await axios.post(
        `${BASE_URL}/api/clothrollingform`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200 || response.status === 201) {
        const completedInwardId = Number(formData.fabricInwardId);
        const completedRollMtr = Number(formData.rollMtr) + Number(formData.defectMtr);
        setRolledByInward((current) => ({
          ...current,
          [completedInwardId]: (current[completedInwardId] ?? 0) + completedRollMtr,
        }));
        setFormData({
          productKey: "",
          productName: "",
          fabricInwardId: "",
          batchNo: "",
          rollMtr: "",
          defectMtr: "0",
          checkerName: "",
        });
        setFormErrors({});

        setSuccessModalConfig({
          title: "Cloth Rolling Saved",
          subtitle: `Roll ${response.data.rollNo} has been saved successfully.`,
          icon: "CheckCircle",
          buttonText: "OK",
          onButtonClick: () => setIsSuccessModalOpen(false),
        });
        setIsSuccessModalOpen(true);
      }
    } catch (error: any) {
      console.error("Cloth rolling submit error:", error.response?.data || error);
      alert(error.response?.data?.detail || "Something went wrong");
    }
  };

  return (
    <>
      <div className="p-6">
        <h2 className="text-xl font-medium mb-6">Cloth Rolling and Checking Form</h2>

        <form className="box p-5 grid grid-cols-1 gap-4 md:grid-cols-2 w-full max-w-5xl" onSubmit={handleSubmit}>
          <div>
            <FormLabel>Select Product</FormLabel>
            <FormSelect
              value={formData.productKey}
              onChange={(event) => {
                const selected = fabricInwards.find((inward) => fabricCombination(inward).key === event.target.value);
                handleChange("productKey", event.target.value);
                handleChange("productName", selected ? fabricCombination(selected).name : "");
                handleChange("fabricInwardId", "");
                handleChange("batchNo", "");
              }}
            >
              <option value="">Select Product</option>
              {productOptions.filter((product) => fabricInwards.some((inward) => {
                const id = Number(inward.id ?? inward.Id ?? 0);
                const inwardMtr = Number(inward.qtyMTR ?? inward.QtyMTR ?? 0);
                return fabricCombination(inward).key === product.value && (rolledByInward[id] ?? 0) < inwardMtr;
              })).map((product) => (
                <option key={`${product.value}-${product.label}`} value={product.value}>
                  {product.label}
                </option>
              ))}
            </FormSelect>
            {formErrors.productName && (
              <p className="text-red-500 text-sm mt-1">{formErrors.productName}</p>
            )}
          </div>

          <div>
            <FormLabel>Select Inward Batch / Lot No</FormLabel>
            <FormSelect
              value={formData.fabricInwardId}
              onChange={(event) => {
                const inward = fabricInwards.find((item) => String(item.id ?? item.Id) === event.target.value);
                handleChange("fabricInwardId", event.target.value);
                handleChange("batchNo", String(inward?.batchNo ?? inward?.BatchNo ?? ""));
              }}
            >
              <option value="">Select Batch No / Lot No</option>
              {fabricInwards.filter((item) => {
                const id = Number(item.id ?? item.Id ?? 0);
                const inwardMtr = Number(item.qtyMTR ?? item.QtyMTR ?? 0);
                return fabricCombination(item).key === formData.productKey
                  && (rolledByInward[id] ?? 0) < inwardMtr;
              }).map((inward) => (
                <option key={inward.id ?? inward.Id} value={inward.id ?? inward.Id}>
                  {inward.batchNo ?? inward.BatchNo} ({Math.max(0, Number(inward.qtyMTR ?? inward.QtyMTR ?? 0) - (rolledByInward[Number(inward.id ?? inward.Id)] ?? 0))} MTR remaining)
                </option>
              ))}
            </FormSelect>
            {formErrors.fabricInwardId && (
              <p className="text-red-500 text-sm mt-1">{formErrors.fabricInwardId}</p>
            )}
          </div>

          <div>
            <FormLabel>Good Roll MTR</FormLabel>
            <FormInput
              type="number"
              placeholder="Roll Mtr"
              value={formData.rollMtr}
              onChange={(event) => handleChange("rollMtr", event.target.value)}
            />
            {formErrors.rollMtr && (
              <p className="text-red-500 text-sm mt-1">{formErrors.rollMtr}</p>
            )}
          </div>

          <div>
            <FormLabel>Defect MTR</FormLabel>
            <FormInput
              type="number"
              placeholder="Defect MTR"
              value={formData.defectMtr}
              onChange={(event) => handleChange("defectMtr", event.target.value)}
            />
            {formErrors.defectMtr && (
              <p className="text-red-500 text-sm mt-1">{formErrors.defectMtr}</p>
            )}
          </div>

          <div>
            <FormLabel>Select Checker Name</FormLabel>
            <FormSelect
              value={formData.checkerName}
              onChange={(event) => handleChange("checkerName", event.target.value)}
            >
              <option value="">Select Checker Name</option>
              {checkerOptions.map((checker) => (
                <option key={`${checker.value}-${checker.label}`} value={checker.value}>
                  {checker.label}
                </option>
              ))}
            </FormSelect>
            {formErrors.checkerName && (
              <p className="text-red-500 text-sm mt-1">{formErrors.checkerName}</p>
            )}
          </div>

          <div className="md:col-span-2"><Button variant="primary" type="submit" className="w-24">
            Submit
          </Button></div>
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

export default Main;
