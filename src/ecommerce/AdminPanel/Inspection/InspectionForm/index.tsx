import { useEffect, useState } from "react";
import axios from "axios";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel, FormSelect } from "@/components/Base/Form";
import { SuccessModalConfig } from "../../CommonModals/SuccessModal/SuccessModalConfig";
import SuccessModal from "../../CommonModals/SuccessModal/SuccessModal";
import { BASE_URL } from "@/ecommerce/config/config";

type FabricProductApiItem = {
  id?: number;
  Id?: number;
  name?: string;
  Name?: string;
};

type GradeApiItem = {
  id?: number;
  Id?: number;
  name?: string;
  Name?: string;
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
    manufacturedFabricProductCode: "",
    grade: "",
    mtr: "",
    wastageMtr: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [fabricProductOptions, setFabricProductOptions] = useState<Option[]>([]);
  const [gradeOptions, setGradeOptions] = useState<Option[]>([]);
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
    const fetchDropdownData = async () => {
      try {
        const [fabricProductResponse, gradeResponse] = await Promise.all([
          axios.get<PagedResponse<FabricProductApiItem>>(
            `${BASE_URL}/api/fproductlist?page=1&size=1000`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get<PagedResponse<GradeApiItem>>(
            `${BASE_URL}/api/grade?page=1&size=1000`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);

        const fabricProducts =
          fabricProductResponse.data?.items ?? fabricProductResponse.data?.Items ?? [];
        setFabricProductOptions(
          fabricProducts.map((item) => ({
            value: String(item.id ?? item.Id ?? ""),
            label: String(item.name ?? item.Name ?? ""),
          }))
        );

        const grades = gradeResponse.data?.items ?? gradeResponse.data?.Items ?? [];
        setGradeOptions(
          grades.map((item) => ({
            value: String(item.id ?? item.Id ?? ""),
            label: String(item.name ?? item.Name ?? ""),
          }))
        );
      } catch (error) {
        console.error("Error fetching inspection form dropdown data:", error);
        setFabricProductOptions([]);
        setGradeOptions([]);
      }
    };

    fetchDropdownData();
  }, [token]);

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors: Record<string, string> = {};

    if (!formData.manufacturedFabricProductCode) {
      errors.manufacturedFabricProductCode =
        "Select manufactured fabric product Name";
    }
    if (!formData.grade) errors.grade = "Select grade";
    if (!formData.mtr) errors.mtr = "Enter mtr";
    if (!formData.wastageMtr) errors.wastageMtr = "Enter wastage in mtr";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await axios.post(
        `${BASE_URL}/api/inspectionform`,
        {
          manufacturedFabricProductId: Number(formData.manufacturedFabricProductCode),
          gradeId: Number(formData.grade),
          mtr: Number(formData.mtr),
          wastageMtr: Number(formData.wastageMtr),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error saving inspection form:", axios.isAxiosError(error) ? error.response?.data ?? error : error);
      const submitMessage = axios.isAxiosError(error)
        ? error.response?.data?.detail ?? error.response?.data?.title ?? "Failed to save inspection form"
        : "Failed to save inspection form";
      setFormErrors((prev) => ({
        ...prev,
        submit: submitMessage,
      }));
      return;
    }

    setFormData({
      manufacturedFabricProductCode: "",
      grade: "",
      mtr: "",
      wastageMtr: "",
    });
    setFormErrors({});

    setSuccessModalConfig({
      title: "Inspection Form Submitted",
      subtitle: "The inspection form has been saved successfully.",
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
      <h2 className="text-xl font-medium mb-6">Inspection Form</h2>

      <form className="box p-5 space-y-4 w-full max-w-xl" onSubmit={handleSubmit}>
        <div>
          <FormLabel>Select Manufactured Fabric Product Name</FormLabel>
          <FormSelect
            value={formData.manufacturedFabricProductCode}
            onChange={(event) =>
              handleFieldChange("manufacturedFabricProductCode", event.target.value)
            }
          >
            <option value="">Select Manufactured Fabric Product Name</option>
            {renderOptions(fabricProductOptions)}
          </FormSelect>
          {formErrors.manufacturedFabricProductCode && (
            <p className="text-red-500 text-sm mt-1">
              {formErrors.manufacturedFabricProductCode}
            </p>
          )}
        </div>


        <div>
          <FormLabel>Grade</FormLabel>
          <FormSelect
            value={formData.grade}
            onChange={(event) => handleFieldChange("grade", event.target.value)}
          >
            <option value="">Select Grade</option>
            {renderOptions(gradeOptions)}
          </FormSelect>
          {formErrors.grade && (
            <p className="text-red-500 text-sm mt-1">{formErrors.grade}</p>
          )}
        </div>

        <div>
          <FormLabel>Mtr</FormLabel>
          <FormInput
            type="number"
            placeholder="Enter Mtr"
            value={formData.mtr}
            onChange={(event) => handleFieldChange("mtr", event.target.value)}
          />
          {formErrors.mtr && (
            <p className="text-red-500 text-sm mt-1">{formErrors.mtr}</p>
          )}
        </div>

        <div>
          <FormLabel>Westage In Mtr</FormLabel>
          <FormInput
            type="number"
            placeholder="Enter Westage In Mtr"
            value={formData.wastageMtr}
            onChange={(event) => handleFieldChange("wastageMtr", event.target.value)}
          />
          {formErrors.wastageMtr && (
            <p className="text-red-500 text-sm mt-1">{formErrors.wastageMtr}</p>
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
