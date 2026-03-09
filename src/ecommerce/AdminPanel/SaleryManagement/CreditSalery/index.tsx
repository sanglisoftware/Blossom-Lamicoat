import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Button from "@/components/Base/Button";
import Table from "@/components/Base/Table";
import { FormInput, FormLabel, FormSelect } from "@/components/Base/Form";
import { BASE_URL } from "@/ecommerce/config/config";

type CreditRecord = {
  id: number;
  employeeId: number;
  employeeName: string;
  month: string;
  paymentType: string;
  creditAmount: number;
  recoveredAmount: number;
  outstandingAmount: number;
  status: string;
  createdAt: string;
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

type EmployeePagedResponse = {
  items?: EmployeeApiItem[];
  Items?: EmployeeApiItem[];
};

type EmployeeOption = {
  id: number;
  name: string;
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

const getStringField = (item: any, keys: string[], defaultValue = "") => {
  for (const key of keys) {
    const value = item?.[key];
    if (typeof value === "string" && value.trim().length > 0) return value;
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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const getStatus = (record: Pick<CreditRecord, "creditAmount" | "outstandingAmount">) => {
  if (record.outstandingAmount <= 0) return "Recovered";
  if (record.outstandingAmount < record.creditAmount) return "Partially Recovered";
  return "Pending";
};

const Main = () => {
  const token = localStorage.getItem("token");
  const [records, setRecords] = useState<CreditRecord[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([]);
  const [isEmployeesLoading, setIsEmployeesLoading] = useState(false);
  const [month, setMonth] = useState("");
  const [paymentType, setPaymentType] = useState("Cash");
  const [creditAmount, setCreditAmount] = useState("");

  const creditAmountValue = Number(creditAmount) || 0;

  const totals = useMemo(() => {
    const credited = records.reduce((sum, row) => sum + row.creditAmount, 0);
    const recovered = records.reduce((sum, row) => sum + row.recoveredAmount, 0);
    const outstanding = records.reduce((sum, row) => sum + row.outstandingAmount, 0);
    return { credited, recovered, outstanding };
  }, [records]);

  useEffect(() => {
    try {
      const parsed = readStoredRecords();
      if (!Array.isArray(parsed) || parsed.length === 0) {
        setRecords([]);
        return;
      }

      const sanitizedRecords = parsed
        .map((item, index) => {
          const id = getNumberField(item, ["id", "Id"], index + 1);
          const employeeId = getNumberField(item, ["employeeId", "EmployeeId"], 0);
          const employeeName = getStringField(
            item,
            ["employeeName", "EmployeeName", "name", "Name"],
            "Unknown"
          );
          const monthValue = getStringField(item, ["month", "Month"], "");
          const paymentTypeValue = getStringField(
            item,
            ["paymentType", "PaymentType"],
            "Cash"
          );

          // Backward compatibility:
          // Old shape had: totalSalary, paidAmount, creditAmount
          // New shape has: creditAmount, recoveredAmount, outstandingAmount
          const isLegacyRecord =
            item?.recoveredAmount === undefined &&
            item?.outstandingAmount === undefined &&
            item?.RecoveredAmount === undefined &&
            item?.OutstandingAmount === undefined;

          const legacyCredit = getNumberField(
            item,
            ["creditAmount", "CreditAmount", "totalSalary", "TotalSalary"],
            0
          );
          const credit = getNumberField(
            item,
            ["creditAmount", "CreditAmount", "totalSalary", "TotalSalary"],
            0
          );
          const recovered = getNumberField(
            item,
            ["recoveredAmount", "RecoveredAmount", "paidAmount", "PaidAmount"],
            0
          );
          const outstanding = getNumberField(
            item,
            ["outstandingAmount", "OutstandingAmount"],
            isLegacyRecord ? legacyCredit : Math.max(credit - recovered, 0)
          );
          const createdAt = getStringField(item, ["createdAt", "CreatedAt"], "");

          if (!Number.isFinite(credit)) {
            return null;
          }

          const normalizedRecord: CreditRecord = {
            id,
            employeeId,
            employeeName,
            month: monthValue,
            paymentType: paymentTypeValue,
            creditAmount: Math.max(credit, 0),
            recoveredAmount: Math.max(recovered, 0),
            outstandingAmount: Math.max(outstanding, 0),
            status: "Pending",
            createdAt: createdAt || new Date().toISOString().split("T")[0],
          };

          normalizedRecord.status = getStatus(normalizedRecord);
          return normalizedRecord;
        })
        .filter((item): item is CreditRecord => item !== null);

      setRecords(sanitizedRecords);
    } catch (error) {
      console.error("Error loading credit salary records:", error);
    }
  }, []);

  useEffect(() => {
    try {
      CREDIT_SALERY_STORAGE_KEYS.forEach((key) => {
        localStorage.setItem(key, JSON.stringify(records));
      });
    } catch (error) {
      console.error("Error saving credit salary records:", error);
    }
  }, [records]);

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!token) return;

      setIsEmployeesLoading(true);
      try {
        const response = await axios.get<EmployeePagedResponse>(
          `${BASE_URL}/api/employees?page=1&size=1000`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const items = response.data?.items ?? response.data?.Items ?? [];
        const mappedEmployees = items
          .map((employee) => {
            const id = Number(employee.id ?? employee.Id);
            if (!Number.isFinite(id) || id <= 0) return null;

            const firstName = employee.firstName ?? employee.FirstName ?? "";
            const middleName = employee.middleName ?? employee.MiddleName ?? "";
            const lastName = employee.lastName ?? employee.LastName ?? "";
            const name = [firstName, middleName, lastName]
              .filter((value) => value && value.trim().length > 0)
              .join(" ")
              .trim();

            return { id, name: name || `Employee ${id}` };
          })
          .filter((employee): employee is EmployeeOption => employee !== null);

        setEmployeeOptions(mappedEmployees);
      } catch (error) {
        console.error("Error fetching employees:", error);
        setEmployeeOptions([]);
      } finally {
        setIsEmployeesLoading(false);
      }
    };

    fetchEmployees();
  }, [token]);

  const handleSave = () => {
    if (!selectedEmployeeId || !month || creditAmountValue <= 0) return;

    const selectedEmployee = employeeOptions.find(
      (employee) => String(employee.id) === selectedEmployeeId
    );
    if (!selectedEmployee) return;

    setRecords((prev) => [
      {
        id: prev.length ? Math.max(...prev.map((row) => row.id)) + 1 : 1,
        employeeId: selectedEmployee.id,
        employeeName: selectedEmployee.name,
        month,
        paymentType,
        creditAmount: creditAmountValue,
        recoveredAmount: 0,
        outstandingAmount: creditAmountValue,
        status: "Pending",
        createdAt: new Date().toISOString().split("T")[0],
      },
      ...prev,
    ]);

    setSelectedEmployeeId("");
    setMonth("");
    setPaymentType("Cash");
    setCreditAmount("");
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium">Credit Salery</h2>
      </div>

      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-12 md:col-span-4 box p-5">
          <p className="text-slate-500 text-sm">Total Credited</p>
          <p className="text-2xl font-semibold mt-1">
            {formatCurrency(totals.credited)}
          </p>
        </div>
        <div className="col-span-12 md:col-span-4 box p-5">
          <p className="text-slate-500 text-sm">Recovered from Salary</p>
          <p className="text-2xl font-semibold mt-1 text-success">
            {formatCurrency(totals.recovered)}
          </p>
        </div>
        <div className="col-span-12 md:col-span-4 box p-5">
          <p className="text-slate-500 text-sm">Outstanding Credit</p>
          <p className="text-2xl font-semibold mt-1 text-danger">
            {formatCurrency(totals.outstanding)}
          </p>
        </div>
      </div>

      <div className="box p-5 mb-6">
        <h3 className="text-lg font-medium mb-4">Create Credit Entry</h3>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-4">
            <FormLabel>Employee Name</FormLabel>
            <FormSelect
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
            >
              <option value="">
                {isEmployeesLoading ? "Loading employees..." : "Select employee"}
              </option>
              {employeeOptions.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </FormSelect>
          </div>

          <div className="col-span-12 md:col-span-4">
            <FormLabel>Credit Month</FormLabel>
            <FormInput
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>

          <div className="col-span-12 md:col-span-4">
            <FormLabel>Payment Type</FormLabel>
            <FormSelect
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
            >
              <option value="Cash">Cash</option>
              <option value="Bank">Bank Transfer</option>
              <option value="UPI">UPI</option>
            </FormSelect>
          </div>

          <div className="col-span-12 md:col-span-4">
            <FormLabel>Credit Amount Given</FormLabel>
            <FormInput
              type="number"
              min="0"
              placeholder="0"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-5">
          <Button variant="primary" onClick={handleSave}>
            Save Credit Salery
          </Button>
        </div>
      </div>

      <div className="box p-5">
        <h3 className="text-lg font-medium mb-4">Credit Salery Report</h3>
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th className="text-center">Sr.No</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Credit Month</Table.Th>
              <Table.Th>Credited</Table.Th>
              <Table.Th>Recovered</Table.Th>
              <Table.Th>Outstanding</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Date</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {records.length === 0 ? (
              <Table.Tr>
                <Table.Td className="text-center" colSpan={8}>
                  No credit salary records found
                </Table.Td>
              </Table.Tr>
            ) : (
              records.map((row, index) => (
                <Table.Tr key={row.id}>
                  <Table.Td className="text-center">{index + 1}</Table.Td>
                  <Table.Td>{row.employeeName}</Table.Td>
                  <Table.Td>{row.month}</Table.Td>
                  <Table.Td>{formatCurrency(row.creditAmount)}</Table.Td>
                  <Table.Td className="text-success">
                    {formatCurrency(row.recoveredAmount)}
                  </Table.Td>
                  <Table.Td className="text-danger">
                    {formatCurrency(row.outstandingAmount)}
                  </Table.Td>
                  <Table.Td>{row.status}</Table.Td>
                  <Table.Td>{row.createdAt}</Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </div>
    </div>
  );
};

export default Main;
