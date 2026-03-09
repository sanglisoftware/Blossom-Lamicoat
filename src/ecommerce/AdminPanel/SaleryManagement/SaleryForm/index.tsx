import { useEffect, useMemo, useState } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import TomSelect from "@/components/Base/TomSelect";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config";
import { SuccessModalConfig } from "../../CommonModals/SuccessModal/SuccessModalConfig";
import SuccessModal from "../../CommonModals/SuccessModal/SuccessModal";

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  type: number | string | null;
}

interface EmployeeApiItem {
  id?: number;
  Id?: number;
  firstName?: string;
  FirstName?: string;
  lastName?: string;
  LastName?: string;
  type?: number | string | null;
  Type?: number | string | null;
}

type CreditRecord = {
  id: number;
  employeeId: number;
  creditAmount: number;
  recoveredAmount: number;
  outstandingAmount: number;
  status: string;
  createdAt: string;
};

const CREDIT_SALERY_STORAGE_KEYS = [
  "credit-salery-records",
  "credit-salary-records",
  "creditSalaryRecords",
];

const getNumberField = (item: any, keys: string[], defaultValue = 0) => {
  for (const key of keys) {
    const value = Number(item?.[key]);
    if (Number.isFinite(value)) return value;
  }
  return defaultValue;
};

const readStoredRecords = () => {
  for (const key of CREDIT_SALERY_STORAGE_KEYS) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      if (Array.isArray(parsed?.items)) return parsed.items;
      if (Array.isArray(parsed?.Items)) return parsed.Items;
      if (Array.isArray(parsed?.records)) return parsed.records;
      if (Array.isArray(parsed?.data)) return parsed.data;
    } catch (error) {
      console.error("Error parsing credit records from key:", key, error);
    }
  }

  return [];
};

const readCreditRecords = (): CreditRecord[] => {
  try {
    const parsed = readStoredRecords();
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => {
        const id = getNumberField(item, ["id", "Id"], 0);
        const employeeId = getNumberField(item, ["employeeId", "EmployeeId"], 0);
        const creditAmount = getNumberField(
          item,
          ["creditAmount", "CreditAmount", "totalSalary", "TotalSalary"],
          0
        );
        const recoveredAmount = getNumberField(
          item,
          ["recoveredAmount", "RecoveredAmount", "paidAmount", "PaidAmount"],
          0
        );
        const outstandingAmount = getNumberField(
          item,
          ["outstandingAmount", "OutstandingAmount"],
          Math.max(creditAmount - recoveredAmount, 0)
        );
        const status = String(item?.status ?? "Pending");
        const createdAt = String(item?.createdAt ?? "");

        if (
          !Number.isFinite(id) ||
          !Number.isFinite(employeeId) ||
          employeeId <= 0 ||
          !Number.isFinite(creditAmount)
        ) {
          return null;
        }

        return {
          id,
          employeeId,
          creditAmount: Math.max(creditAmount, 0),
          recoveredAmount: Math.max(recoveredAmount, 0),
          outstandingAmount: Math.max(outstandingAmount, 0),
          status,
          createdAt,
        };
      })
      .filter((record): record is CreditRecord => record !== null);
  } catch (error) {
    console.error("Error reading credit records:", error);
    return [];
  }
};

const saveCreditRecords = (records: CreditRecord[]) => {
  CREDIT_SALERY_STORAGE_KEYS.forEach((key) => {
    localStorage.setItem(key, JSON.stringify(records));
  });
};

const getOutstandingCreditByEmployee = (employeeId: number) => {
  const records = readCreditRecords();
  return records
    .filter((record) => record.employeeId === employeeId)
    .reduce((sum, record) => sum + Math.max(record.outstandingAmount, 0), 0);
};

const getCreditStatus = (creditAmount: number, outstandingAmount: number) => {
  if (outstandingAmount <= 0) return "Recovered";
  if (outstandingAmount < creditAmount) return "Partially Recovered";
  return "Pending";
};

const applyCreditDeduction = (employeeId: number, deductionAmount: number) => {
  if (deductionAmount <= 0) return;

  const records = readCreditRecords();
  const eligibleIndexes = records
    .map((record, index) => ({ record, index }))
    .filter(
      ({ record }) =>
        record.employeeId === employeeId && Number(record.outstandingAmount) > 0
    )
    .sort((a, b) => {
      const dateA = new Date(a.record.createdAt || 0).getTime();
      const dateB = new Date(b.record.createdAt || 0).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return a.record.id - b.record.id;
    });

  let remainingDeduction = deductionAmount;

  eligibleIndexes.forEach(({ index }) => {
    if (remainingDeduction <= 0) return;

    const current = records[index];
    const outstanding = Math.max(current.outstandingAmount, 0);
    if (outstanding <= 0) return;

    const deductedNow = Math.min(outstanding, remainingDeduction);
    const updatedOutstanding = Math.max(outstanding - deductedNow, 0);
    const updatedRecovered = Math.max(current.recoveredAmount, 0) + deductedNow;

    records[index] = {
      ...current,
      recoveredAmount: updatedRecovered,
      outstandingAmount: updatedOutstanding,
      status: getCreditStatus(current.creditAmount, updatedOutstanding),
    };

    remainingDeduction -= deductedNow;
  });

  saveCreditRecords(records);
};

const Main: React.FC = () => {
  const token = localStorage.getItem("token");

  const [employeeList, setEmployeeList] = useState<Employee[]>([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [employeeOutstandingCredit, setEmployeeOutstandingCredit] = useState(0);

  const [successModalConfig, setSuccessModalConfig] =
    useState<SuccessModalConfig>({
      title: "",
      subtitle: "",
      icon: "CheckCircle",
      buttonText: "OK",
      onButtonClick: () => {},
    });

  const [formData, setFormData] = useState({
    employeeId: "",
    type: "",
    attendance: "",
    extraHours: "",
    totalLate: "",
    halfDay: "",
    totalSalary: "",
  });
  const [manualCreditDeduction, setManualCreditDeduction] = useState("");

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const grossSalaryValue = Number(formData.totalSalary) || 0;
  const maxAllowedDeduction = useMemo(
    () => Math.min(grossSalaryValue, employeeOutstandingCredit),
    [grossSalaryValue, employeeOutstandingCredit]
  );
  const creditDeductionValue = useMemo(() => {
    const rawDeduction = Number(manualCreditDeduction) || 0;
    return Math.max(0, Math.min(rawDeduction, maxAllowedDeduction));
  }, [manualCreditDeduction, maxAllowedDeduction]);
  const netSalaryPayable = Math.max(grossSalaryValue - creditDeductionValue, 0);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/employees`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(response.data?.items)) {
          const normalizedEmployees = (response.data.items as EmployeeApiItem[])
            .map((emp) => ({
              id: Number(emp.id ?? emp.Id),
              firstName: emp.firstName ?? emp.FirstName ?? "",
              lastName: emp.lastName ?? emp.LastName ?? "",
              type: emp.type ?? emp.Type ?? null,
            }))
            .filter((emp) => Number.isFinite(emp.id) && emp.id > 0);

          setEmployeeList(normalizedEmployees);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, [token]);

  const updateOutstandingCredit = (employeeIdValue: string) => {
    const employeeIdNum = Number(employeeIdValue);
    if (!Number.isFinite(employeeIdNum) || employeeIdNum <= 0) {
      setEmployeeOutstandingCredit(0);
      return;
    }

    const outstanding = getOutstandingCreditByEmployee(employeeIdNum);
    setEmployeeOutstandingCredit(outstanding);
  };

  const handleEmployeeChange = async (
    e: string | number | { target?: { value?: string | number } }
  ) => {
    const value =
      typeof e === "string" || typeof e === "number"
        ? String(e)
        : String(e?.target?.value ?? "");

    if (!value) {
      setFormData((prev) => ({
        ...prev,
        employeeId: "",
        type: "",
      }));
      setEmployeeOutstandingCredit(0);
      setManualCreditDeduction("");
      return;
    }

    let normalizedType: number | null = null;

    try {
      const employeeResponse = await axios.get(`${BASE_URL}/api/employees/${value}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const apiType = employeeResponse.data?.type ?? employeeResponse.data?.Type ?? null;
      normalizedType = apiType === null || apiType === undefined ? null : Number(apiType);
    } catch (error) {
      const selectedEmployee = employeeList.find(
        (emp) => emp.id.toString() === value
      );
      normalizedType =
        selectedEmployee?.type === null || selectedEmployee?.type === undefined
          ? null
          : Number(selectedEmployee.type);
      console.error("Error fetching employee details:", error);
    }

    setFormData((prev) => ({
      ...prev,
      employeeId: value,
      type: normalizedType === 1 ? "Worker" : normalizedType === 0 ? "Staff" : "",
    }));
    setFormErrors((prev) => ({ ...prev, employeeId: "" }));
    updateOutstandingCredit(value);
    setManualCreditDeduction("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    const employeeIdNum = Number(formData.employeeId);

    if (!formData.employeeId) errors.employeeId = "Employee is required";
    if (!Number.isFinite(employeeIdNum) || employeeIdNum <= 0)
      errors.employeeId = "Please select a valid employee";
    if (!formData.attendance) errors.attendance = "Attendance is required";
    if (!formData.totalSalary) errors.totalSalary = "Gross salary is required";
    if (grossSalaryValue <= 0) errors.totalSalary = "Gross salary should be more than 0";
    if (creditDeductionValue >= grossSalaryValue && grossSalaryValue > 0) {
      errors.totalSalary = "Keep some salary payable to employee; reduce credit deduction.";
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload = {
      employeeId: employeeIdNum,
      attendance: Number(formData.attendance),
      extraHours: Number(formData.extraHours || 0),
      totalLate: Number(formData.totalLate || 0),
      halfDay: Number(formData.halfDay || 0),
      totalSalary: netSalaryPayable,
    };

    try {
      const response = await axios.post(`${BASE_URL}/api/salary`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 || response.status === 201) {
        applyCreditDeduction(employeeIdNum, creditDeductionValue);
        clearForm();

        setSuccessModalConfig({
          title: "Successfully Submitted",
          subtitle:
            creditDeductionValue > 0
              ? "Salary submitted and credit amount deducted."
              : "Salary form submitted successfully.",
          icon: "CheckCircle",
          buttonText: "OK",
          onButtonClick: () => setIsSuccessModalOpen(false),
        });

        setIsSuccessModalOpen(true);
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.title ||
        error?.message ||
        "Something went wrong";
      console.error("Salary save failed:", {
        status: error?.response?.status,
        data: error?.response?.data,
      });
      alert(message);
    }
  };

  const clearForm = () => {
    setFormData({
      employeeId: "",
      type: "",
      attendance: "",
      extraHours: "",
      totalLate: "",
      halfDay: "",
      totalSalary: "",
    });
    setEmployeeOutstandingCredit(0);
    setManualCreditDeduction("");
    setFormErrors({});
  };

  return (
    <>
      <div className="p-6">
        <h2 className="text-xl font-medium mb-6">Salary Form</h2>

        <form className="box p-5 space-y-4 w-full max-w-xl" onSubmit={handleSubmit}>
          <div>
            <FormLabel>Select Employee</FormLabel>
            <TomSelect
              value={formData.employeeId}
              onChange={handleEmployeeChange}
              options={{
                placeholder: "Select Employee",
                allowEmptyOption: true,
              }}
              className="w-full"
            >
              <option value="">Select Employee</option>
              {employeeList.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </TomSelect>

            {formErrors.employeeId && (
              <p className="text-red-500 text-sm mt-1">{formErrors.employeeId}</p>
            )}
          </div>

          <div>
            <FormLabel>Type</FormLabel>
            <div className="mt-2 flex gap-4">
              <label className="flex items-center gap-1">
                <input type="radio" checked={formData.type === "Staff"} readOnly />
                Staff
              </label>
              <label className="flex items-center gap-1">
                <input type="radio" checked={formData.type === "Worker"} readOnly />
                Worker
              </label>
            </div>
          </div>

          <div>
            <FormLabel>Attendance (Days)</FormLabel>
            <FormInput
              type="number"
              value={formData.attendance}
              onChange={(e) => setFormData({ ...formData, attendance: e.target.value })}
            />
            {formErrors.attendance && (
              <p className="text-red-500 text-sm mt-1">{formErrors.attendance}</p>
            )}
          </div>

          <div>
            <FormLabel>Extra Hours</FormLabel>
            <FormInput
              type="number"
              value={formData.extraHours}
              onChange={(e) => setFormData({ ...formData, extraHours: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormLabel>Total Late</FormLabel>
              <FormInput
                type="number"
                value={formData.totalLate}
                onChange={(e) => setFormData({ ...formData, totalLate: e.target.value })}
              />
            </div>

            <div>
              <FormLabel>Half Day</FormLabel>
              <FormInput
                type="number"
                value={formData.halfDay}
                onChange={(e) => setFormData({ ...formData, halfDay: e.target.value })}
              />
            </div>
          </div>

          <div>
            <FormLabel>Gross Salary</FormLabel>
            <FormInput
              type="number"
              value={formData.totalSalary}
              onChange={(e) => setFormData({ ...formData, totalSalary: e.target.value })}
            />
            {formErrors.totalSalary && (
              <p className="text-red-500 text-sm mt-1">{formErrors.totalSalary}</p>
            )}
          </div>

          <div>
            <FormLabel>Outstanding Credit</FormLabel>
            <FormInput type="number" value={employeeOutstandingCredit} readOnly />
          </div>

          <div>
            <FormLabel>Credit Deduction (Adjustable)</FormLabel>
            <FormInput
              type="number"
              min="0"
              max={maxAllowedDeduction}
              value={manualCreditDeduction}
              onChange={(e) => setManualCreditDeduction(e.target.value)}
              placeholder="Enter deduction amount"
            />
            <p className="text-slate-500 text-xs mt-1">
              Max allowed deduction: {maxAllowedDeduction}
            </p>
          </div>

          <div>
            <FormLabel>Net Salary Payable</FormLabel>
            <FormInput type="number" value={netSalaryPayable} readOnly />
          </div>

          <Button variant="primary" type="submit" className="w-24">
            Submit
          </Button>
        </form>
      </div>

      <SuccessModal
        open={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={successModalConfig.title}
        subtitle={successModalConfig.subtitle}
        icon={successModalConfig.icon}
        buttonText={successModalConfig.buttonText}
        onButtonClick={successModalConfig.onButtonClick}
      />
    </>
  );
};

export default Main;
