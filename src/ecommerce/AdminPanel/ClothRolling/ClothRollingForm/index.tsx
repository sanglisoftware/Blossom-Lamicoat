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
  batchNo?: number;
  BatchNo?: number;
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

const Main = () => {
  const token = localStorage.getItem("token");
  const [productOptions, setProductOptions] = useState<Option[]>([]);
  const [batchOptions, setBatchOptions] = useState<Option[]>([]);
  const [checkerOptions, setCheckerOptions] = useState<Option[]>([]);
  const [formData, setFormData] = useState({
    productName: "",
    batchNo: "",
    rollMtr: "",
    defectMtr: "",
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
        const uniqueBatches = new Map<string, Option>();

        items.forEach((item) => {
          const product = String(
            item.fabricMasterName ?? item.FabricMasterName ?? ""
          ).trim();
          const batch = String(item.batchNo ?? item.BatchNo ?? "").trim();

          if (product && !uniqueProducts.has(product)) {
            uniqueProducts.set(product, { value: product, label: product });
          }

          if (batch && !uniqueBatches.has(batch)) {
            uniqueBatches.set(batch, { value: batch, label: batch });
          }
        });

        setProductOptions(Array.from(uniqueProducts.values()));
        setBatchOptions(Array.from(uniqueBatches.values()));
      } catch (error) {
        console.error("Error fetching fabric inward data:", error);
        setProductOptions([]);
        setBatchOptions([]);
      }
    };

    fetchFabricInward();
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

    if (!formData.productName) errors.productName = "Select product";
    if (!formData.batchNo) errors.batchNo = "Select batch no / lot no";
    if (!formData.rollMtr) errors.rollMtr = "Enter roll mtr";
    if (!formData.defectMtr) errors.defectMtr = "Enter defect mtr";
    if (!formData.checkerName) errors.checkerName = "Select checker name";

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        productName: formData.productName,
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
        setFormData({
          productName: "",
          batchNo: "",
          rollMtr: "",
          defectMtr: "",
          checkerName: "",
        });
        setFormErrors({});

        setSuccessModalConfig({
          title: "Cloth Rolling Saved",
          subtitle: "The cloth rolling form has been saved successfully.",
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

        <form className="box p-5 space-y-4 w-full max-w-xl" onSubmit={handleSubmit}>
          <div>
            <FormLabel>Select Product</FormLabel>
            <FormSelect
              value={formData.productName}
              onChange={(event) => handleChange("productName", event.target.value)}
            >
              <option value="">Select Product</option>
              {productOptions.map((product) => (
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
            <FormLabel>Select Batch No / Lot No</FormLabel>
            <FormSelect
              value={formData.batchNo}
              onChange={(event) => handleChange("batchNo", event.target.value)}
            >
              <option value="">Select Batch No / Lot No</option>
              {batchOptions.map((batch) => (
                <option key={`${batch.value}-${batch.label}`} value={batch.value}>
                  {batch.label}
                </option>
              ))}
            </FormSelect>
            {formErrors.batchNo && (
              <p className="text-red-500 text-sm mt-1">{formErrors.batchNo}</p>
            )}
          </div>

          <div>
            <FormLabel>Roll Mtr</FormLabel>
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

          <Button variant="primary" type="submit" className="w-24">
            Submit
          </Button>
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
