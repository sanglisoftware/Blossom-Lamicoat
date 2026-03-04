// // import { useEffect, useState } from "react";
// // import Button from "@/components/Base/Button";
// // import { FormInput, FormLabel } from "@/components/Base/Form";
// // import TomSelect from "@/components/Base/TomSelect";
// // import axios from "axios";
// // import { BASE_URL } from "@/ecommerce/config/config";
// // import { SuccessModalConfig } from "../../CommonModals/SuccessModal/SuccessModalConfig";



// // interface RoleOptions {
// //   id: string;
// //   roleValue: string;
// //   type?: number; // 0 = Staff, 1 = Worker
// // }

// // const Main: React.FC = () => {
// //   const token = localStorage.getItem("token");

// //   const [rolesForTom, setRolesForTom] = useState<RoleOptions[]>([]);
// //   const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

// //   const [successModalConfig, setSuccessModalConfig] =
// //     useState<SuccessModalConfig>({
// //       title: "",
// //       subtitle: "",
// //       icon: "CheckCircle",
// //       buttonText: "OK",
// //       onButtonClick: () => { },
// //     });

// //   const [formData, setFormData] = useState({
// //     roleId: "",
// //     type: "",
// //     attendance: "",
// //     extraHours: "",
// //     totalLate: "",
// //     halfDay: "",
// //     totalSalary: "",
// //   });

// //   const [formErrors, setFormErrors] = useState<Record<string, string>>({});


// //   useEffect(() => {
// //     const fetchRoles = async () => {
// //       try {
// //         const response = await axios.get<RoleOptions[]>(
// //           `${BASE_URL}/api/Roles`,
// //           {
// //             headers: { Authorization: `Bearer ${token}` },
// //           }
// //         );

// //         if (Array.isArray(response.data)) {
// //           setRolesForTom(response.data);
// //         }
// //       } catch (error) {
// //         console.error("Error fetching roles:", error);
// //       }
// //     };

// //     fetchRoles();
// //   }, [token]);


// //   const handleRoleChange = (e: { target: { value: string } }) => {
// //     const value = e.target.value;
// //     const selectedRole = rolesForTom.find((r) => r.id === value);

// //     setFormData((prev) => ({
// //       ...prev,
// //       roleId: value,
// //       type:
// //         selectedRole?.type === 1
// //           ? "Worker"
// //           : selectedRole?.type === 0
// //             ? "Staff"
// //             : "",
// //     }));

// //     setFormErrors((prev) => ({ ...prev, roleId: "" }));
// //   };

// //   const handleSubmit = async () => {
// //     const errors: Record<string, string> = {};

// //     if (!formData.roleId) errors.roleId = "Role is required";
// //     if (!formData.attendance) errors.attendance = "Attendance is required";
// //     if (!formData.totalSalary)
// //       errors.totalSalary = "Total salary is required";

// //     setFormErrors(errors);
// //     if (Object.keys(errors).length > 0) return;

// //     const payload = {
// //       roleId: formData.roleId,
// //       attendance: Number(formData.attendance),
// //       extraHours: Number(formData.extraHours || 0),
// //       totalLate: Number(formData.totalLate || 0),
// //       halfDay: Number(formData.halfDay || 0),
// //       totalSalary: Number(formData.totalSalary),
// //     };

// //     try {
// //       const response = await axios.post(
// //         `${BASE_URL}/api/salary`,
// //         payload,
// //         {
// //           headers: { Authorization: `Bearer ${token}` },
// //         }
// //       );

// //       if (response.status === 200 || response.status === 201) {
// //         clearForm();

// //         setSuccessModalConfig({
// //           title: "Salary Saved Successfully",
// //           subtitle: "Salary record saved.",
// //           icon: "CheckCircle",
// //           buttonText: "OK",
// //           onButtonClick: () => setIsSuccessModalOpen(false),
// //         });

// //         setIsSuccessModalOpen(true);
// //       }
// //     } catch (error: any) {
// //       alert(error?.response?.data?.detail || "Something went wrong");
// //     }
// //   };

// //   const clearForm = () => {
// //     setFormData({
// //       roleId: "",
// //       type: "",
// //       attendance: "",
// //       extraHours: "",
// //       totalLate: "",
// //       halfDay: "",
// //       totalSalary: "",
// //     });
// //     setFormErrors({});
// //   };

// //   return (
// //     <div className="p-6">
// //       <h2 className="text-xl font-medium mb-6">Salary Form</h2>

// //       <form className="box p-5 space-y-4 w-full max-w-xl"
// //       >
// //         {/* Staff Name */}
// //         <div className="col-span-12 sm:col-span-6">
// //           <FormLabel>Select Role</FormLabel>
// //           <TomSelect
// //             value={formData.roleId}
// //             onChange={handleRoleChange}
// //             options={{
// //               placeholder: "Select Role",
// //               allowEmptyOption: true,
// //             }}
// //             className="w-full"
// //           >
// //             <option value="">Select Role</option>
// //             {rolesForTom.map((role) => (
// //               <option key={role.id} value={role.id}>
// //                 {role.roleValue}
// //               </option>
// //             ))}
// //           </TomSelect>
// //           {formErrors.roleId && (
// //             <p className="text-red-500 text-sm mt-1">
// //               {formErrors.roleId}
// //             </p>
// //           )}
// //         </div>
// //         {/* Static Info */}
// //         <div className="text-sm space-y-1">
// //           <div>
// //             <span className="font-medium">Type</span>
// //             <div className="mt-2 flex gap-4">
// //               <label className="flex items-center gap-1">
// //                 <input
// //                   type="radio"
// //                   name="type"
// //                   value="Staff"
// //                   className="form-radio"
// //                   checked={formData.type === "Staff"}
// //                   readOnly
// //                 />
// //                 Staff
// //               </label>
// //               <label className="flex items-center gap-1">
// //                 <input
// //                   type="radio"
// //                   name="type"
// //                   value="Worker"
// //                   className="form-radio"
// //                   checked={formData.type === "Worker"}
// //                   readOnly
// //                 />
// //                 Worker
// //               </label>
// //             </div>
// //           </div>
// //           <br />
// //           <div className="flex gap-6">
// //             <span>
// //               <span className="font-medium">Salary</span> = 12,000
// //             </span>
// //             <span>
// //               <span className="font-medium">One Day</span> = 400
// //             </span>
// //           </div>
// //         </div>

// //         {/* Attendance */}
// //         <div>
// //           <FormLabel>Attendance</FormLabel>
// //           <FormInput
// //             type="number"
// //             value={formData.attendance}
// //             onChange={(e) =>
// //               setFormData({ ...formData, attendance: e.target.value })
// //             }
// //           />
// //           {formErrors.attendance && (
// //             <p className="text-red-500 text-sm mt-1">
// //               {formErrors.attendance}
// //             </p>
// //           )}
// //         </div>

// //         {/* Extra Hours */}
// //         <div>
// //           <FormLabel>Extra Hours</FormLabel>
// //           <FormInput
// //             type="number"
// //             value={formData.extraHours}
// //             onChange={(e) =>
// //               setFormData({ ...formData, extraHours: e.target.value })
// //             }
// //           />
// //         </div>

// //         {/* Total Late */}
// //         {/* Total Late & Half Day */}
// //         <div className="grid grid-cols-2 gap-4">
// //           <div>
// //             <FormLabel>Total Late</FormLabel>
// //             <FormInput
// //               type="number"
// //               value={formData.totalLate}
// //               onChange={(e) =>
// //                 setFormData({ ...formData, totalLate: e.target.value })
// //               }
// //             />
// //           </div>

// //           <div>
// //             <FormLabel>Half Day</FormLabel>
// //             <FormInput
// //               type="number"
// //               value={formData.halfDay}
// //               onChange={(e) =>
// //                 setFormData({ ...formData, halfDay: e.target.value })
// //               }
// //             />
// //           </div>
// //         </div>

// //         {/* Total Salary */}
// //         <div>
// //           <FormLabel>Total Salary</FormLabel>
// //           <FormInput
// //             type="number"
// //             value={formData.totalSalary}
// //             onChange={(e) =>
// //               setFormData({ ...formData, totalSalary: e.target.value })
// //             }
// //           />
// //           {formErrors.totalSalary && (
// //             <p className="text-red-500 text-sm mt-1">
// //               {formErrors.totalSalary}
// //             </p>
// //           )}
// //         </div>

// //         <Button variant="primary" type="submit" className="w-24">
// //           Submit
// //         </Button>
// //       </form>
// //     </div>
// //   );
// // };

// // export default Main;



// import { useEffect, useState } from "react";
// import Button from "@/components/Base/Button";
// import { FormInput, FormLabel } from "@/components/Base/Form";
// import TomSelect from "@/components/Base/TomSelect";
// import axios from "axios";
// import { BASE_URL } from "@/ecommerce/config/config";

// interface Employee {
//   id: number;
//   firstName: string;
//   lastName: string;
//   type: number | string | null;
// }

// const Main: React.FC = () => {
//   const token = localStorage.getItem("token");

//   const [employeeList, setEmployeeList] = useState<Employee[]>([]);

//   const [formData, setFormData] = useState({
//     employeeId: "",
//     type: null as number | null,
//     attendance: "",
//     extraHours: "",
//     totalLate: "",
//     halfDay: "",
//     totalSalary: "",
//   });

//   const [formErrors, setFormErrors] = useState<Record<string, string>>({});

//   // ✅ Fetch Employees
//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         const response = await axios.get(
//           `${BASE_URL}/api/employees`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );

//         if (Array.isArray(response.data?.items)) {
//           setEmployeeList(response.data.items);
//         }
//       } catch (error) {
//         console.error("Error fetching employees:", error);
//       }
//     };

//     fetchEmployees();
//   }, [token]);

//   // ✅ Handle Employee Change (TomSelect compatible)
//   const handleEmployeeChange = (e: any) => {
//     const value = e.target.value;

//     const selectedEmployee = employeeList.find(
//       (emp: any) => emp.id.toString() === value
//     );

//     console.log("Selected Employee:", selectedEmployee);

//     if (!selectedEmployee) return;

//     setFormData((prev: any) => ({
//       ...prev,
//       employeeId: value,
//       type: selectedEmployee.type, // ✅ Direct assign (already number)
//     }));
//   };

//   // ✅ Submit
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const errors: Record<string, string> = {};

//     if (!formData.employeeId)
//       errors.employeeId = "Employee is required";
//     if (!formData.attendance)
//       errors.attendance = "Attendance is required";
//     if (!formData.totalSalary)
//       errors.totalSalary = "Total salary is required";

//     setFormErrors(errors);
//     if (Object.keys(errors).length > 0) return;

//     const payload = {
//       employeeId: Number(formData.employeeId),
//       attendance: Number(formData.attendance),
//       extraHours: Number(formData.extraHours || 0),
//       totalLate: Number(formData.totalLate || 0),
//       halfDay: Number(formData.halfDay || 0),
//       totalSalary: Number(formData.totalSalary),
//     };

//     try {
//       await axios.post(
//         `${BASE_URL}/api/salary`,
//         payload,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       alert("Salary Saved Successfully");
//       clearForm();
//     } catch (error: any) {
//       alert(error?.response?.data?.detail || "Something went wrong");
//     }
//   };

//   const clearForm = () => {
//     setFormData({
//       employeeId: "",
//       type: null,
//       attendance: "",
//       extraHours: "",
//       totalLate: "",
//       halfDay: "",
//       totalSalary: "",
//     });
//     setFormErrors({});
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-medium mb-6">
//         Salary Form
//       </h2>

//       <form
//         className="box p-5 space-y-4 w-full max-w-xl"
//         onSubmit={handleSubmit}
//       >
//         {/* Employee Dropdown */}
//         <div>
//           <FormLabel>Select Employee</FormLabel>

//           <TomSelect
//             value={formData.employeeId || ""}
//             onChange={handleEmployeeChange}
//             options={{
//               placeholder: "Select Employee",
//               allowEmptyOption: true,
//             }}
//             className="w-full"
//           >
//             <option value="">Select Employee</option>
//             {employeeList.map((emp) => (
//               <option key={emp.id} value={emp.id.toString()}>
//                 {emp.firstName} {emp.lastName}
//               </option>
//             ))}
//           </TomSelect>

//           {formErrors.employeeId && (
//             <p className="text-red-500 text-sm mt-1">
//               {formErrors.employeeId}
//             </p>
//           )}
//         </div>

//         {/* Type Auto Selected */}
//         <div>
//           <FormLabel>Type</FormLabel>
//           <div className="mt-2 flex gap-6">
//             <label>
//               <input
//                 type="radio"
//                 name="type"
//                 checked={formData.type === 0}
//                 readOnly
//               />
//               Staff
//             </label>

//             <label>
//               <input
//                 type="radio"
//                 name="type"
//                 checked={formData.type === 1}
//                 readOnly
//               />
//               Worker
//             </label>
//           </div>

//           {formData.employeeId && formData.type === null && (
//             <p className="text-red-500 text-sm mt-1">
//               Type not assigned to this employee
//             </p>
//           )}
//         </div>

//         {/* Attendance */}
//         <div>
//           <FormLabel>Attendance (Days)</FormLabel>
//           <FormInput
//             type="number"
//             value={formData.attendance}
//             onChange={(e) =>
//               setFormData({
//                 ...formData,
//                 attendance: e.target.value,
//               })
//             }
//           />
//         </div>

//         {/* Extra Hours */}
//         <div>
//           <FormLabel>Extra Hours</FormLabel>
//           <FormInput
//             type="number"
//             value={formData.extraHours}
//             onChange={(e) =>
//               setFormData({
//                 ...formData,
//                 extraHours: e.target.value,
//               })
//             }
//           />
//         </div>

//         {/* Late & Half Day */}
//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <FormLabel>Total Late</FormLabel>
//             <FormInput
//               type="number"
//               value={formData.totalLate}
//               onChange={(e) =>
//                 setFormData({
//                   ...formData,
//                   totalLate: e.target.value,
//                 })
//               }
//             />
//           </div>

//           <div>
//             <FormLabel>Half Day</FormLabel>
//             <FormInput
//               type="number"
//               value={formData.halfDay}
//               onChange={(e) =>
//                 setFormData({
//                   ...formData,
//                   halfDay: e.target.value,
//                 })
//               }
//             />
//           </div>
//         </div>

//         {/* Total Salary */}
//         <div>
//           <FormLabel>Total Salary</FormLabel>
//           <FormInput
//             type="number"
//             value={formData.totalSalary}
//             onChange={(e) =>
//               setFormData({
//                 ...formData,
//                 totalSalary: e.target.value,
//               })
//             }
//           />
//         </div>

//         <Button variant="primary" type="submit" className="w-24">
//           Submit
//         </Button>
//       </form>
//     </div>
//   );
// };

// export default Main;


import { useEffect, useState } from "react";
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

const Main: React.FC = () => {
  const token = localStorage.getItem("token");

  const [employeeList, setEmployeeList] = useState<Employee[]>([]);
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
    employeeId: "",
    type: "",
    attendance: "",
    extraHours: "",
    totalLate: "",
    halfDay: "",
    totalSalary: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  //  Fetch Employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/employees`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("Employee API:", response.data);

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

  // Employee Change → Auto Map Type
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
      return;
    }

    let normalizedType: number | null = null;

    try {
      const employeeResponse = await axios.get(
        `${BASE_URL}/api/employees/${value}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const apiType =
        employeeResponse.data?.type ?? employeeResponse.data?.Type ?? null;
      normalizedType =
        apiType === null || apiType === undefined ? null : Number(apiType);
    } catch (error) {
      // Fallback to already-loaded list if detail API fails
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
      type:
        normalizedType === 1
          ? "Worker"
          : normalizedType === 0
          ? "Staff"
          : "",
    }));

    setFormErrors((prev) => ({ ...prev, employeeId: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    const employeeIdNum = Number(formData.employeeId);

    if (!formData.employeeId)
      errors.employeeId = "Employee is required";
    if (!Number.isFinite(employeeIdNum) || employeeIdNum <= 0)
      errors.employeeId = "Please select a valid employee";
    if (!formData.attendance)
      errors.attendance = "Attendance is required";
    if (!formData.totalSalary)
      errors.totalSalary = "Total salary is required";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload = {
      employeeId: employeeIdNum,
      attendance: Number(formData.attendance),
      extraHours: Number(formData.extraHours || 0),
      totalLate: Number(formData.totalLate || 0),
      halfDay: Number(formData.halfDay || 0),
      totalSalary: Number(formData.totalSalary),
    };

    try {
      console.log("Salary payload:", payload);
      const response = await axios.post(
        `${BASE_URL}/api/salary`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200 || response.status === 201) {
        clearForm();

        setSuccessModalConfig({
          title: "Successfully Submitted",
          subtitle: "Salary form submitted successfully.",
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
    setFormErrors({});
  };

  return (
    <>
      <div className="p-6">
        <h2 className="text-xl font-medium mb-6">
          Salary Form
        </h2>

        <form
          className="box p-5 space-y-4 w-full max-w-xl"
          onSubmit={handleSubmit}
        >
        {/* Employee Dropdown */}
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
            <p className="text-red-500 text-sm mt-1">
              {formErrors.employeeId}
            </p>
          )}
        </div>

        {/* Auto Type */}
        <div>
          <FormLabel>Type</FormLabel>
          <div className="mt-2 flex gap-4">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={formData.type === "Staff"}
                readOnly
              />
              Staff
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={formData.type === "Worker"}
                readOnly
              />
              Worker
            </label>
          </div>
        </div>

        {/* Attendance */}
        <div>
          <FormLabel>Attendance (Days)</FormLabel>
          <FormInput
            type="number"
            value={formData.attendance}
            onChange={(e) =>
              setFormData({
                ...formData,
                attendance: e.target.value,
              })
            }
          />
        </div>

        {/* Extra Hours */}
        <div>
          <FormLabel>Extra Hours</FormLabel>
          <FormInput
            type="number"
            value={formData.extraHours}
            onChange={(e) =>
              setFormData({
                ...formData,
                extraHours: e.target.value,
              })
            }
          />
        </div>

        {/* Late & Half Day */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FormLabel>Total Late</FormLabel>
            <FormInput
              type="number"
              value={formData.totalLate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  totalLate: e.target.value,
                })
              }
            />
          </div>

          <div>
            <FormLabel>Half Day</FormLabel>
            <FormInput
              type="number"
              value={formData.halfDay}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  halfDay: e.target.value,
                })
              }
            />
          </div>
        </div>

        {/* Total Salary */}
        <div>
          <FormLabel>Total Salary</FormLabel>
          <FormInput
            type="number"
            value={formData.totalSalary}
            onChange={(e) =>
              setFormData({
                ...formData,
                totalSalary: e.target.value,
              })
            }
          />
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
