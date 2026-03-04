// import { useState, useEffect, useMemo } from "react";
// import Button from "@/components/Base/Button";
// import { FormInput, FormLabel } from "@/components/Base/Form";
// import { Dialog } from "@/components/Base/Headless";
// import axios from "axios";
// import { BASE_URL } from "@/ecommerce/config/config";
// import { SuccessModalConfig } from "../../CommonModals/SuccessModal/SuccessModalConfig";
// import SuccessModal from "../../CommonModals/SuccessModal/SuccessModal";
// import TomSelect from "@/components/Base/TomSelect";

// interface EditInwardListProps {
//   open: boolean;
//   onClose: () => void;
//   InwardId: number | null;
//   onSuccess?: () => void;
// }

// interface Chemical {
//   id: number;
//   name: string;
//   isActive: number;
// }

// interface Supplier {
//   id: number;
//   name: string;
//   isActive: number;
// }

// const EditInwardList: React.FC<EditInwardListProps> = ({
//   open,
//   onClose,
//   InwardId,
//   onSuccess,
// }) => {
//   const token = localStorage.getItem("token");

//   const [formData, setFormData] = useState({
//     id: 0,
//     chemicalId: "",
//     ChemicalName: "",
//     QTY: "",
//     supplierId: "",
//     Supplier: "",
//     BatchNo: "",
//     BillDate: "",
//     ReceivedDate: "",
//     isActive: 1,
//   });

//   const [chemicals, setChemicals] = useState<Chemical[]>([]);
//   const [suppliers, setSuppliers] = useState<Supplier[]>([]);
//   const [chemicalsLoaded, setChemicalsLoaded] = useState(false);
//   const [suppliersLoaded, setSuppliersLoaded] = useState(false);

//   const [formErrors, setFormErrors] = useState<Record<string, string>>({});
//   const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
//   const [successModalConfig, setSuccessModalConfig] = useState<SuccessModalConfig>({
//     title: "",
//     subtitle: "",
//     icon: "CheckCircle",
//     buttonText: "OK",
//     onButtonClick: () => {},
//   });

//   // Fetch chemicals and suppliers lists
//   useEffect(() => {
//     const fetchLists = async () => {
//       try {
//         setChemicalsLoaded(false);
//         setSuppliersLoaded(false);
//         const [chemRes, suppRes] = await Promise.all([
//           axios.get(`${BASE_URL}/api/chemical`, { headers: { Authorization: `Bearer ${token}` } }),
//           axios.get(`${BASE_URL}/api/supplier`, { headers: { Authorization: `Bearer ${token}` } }),
//         ]);

//         setChemicals((chemRes.data.items || []).filter((c: Chemical) => c.isActive === 1));
//         setSuppliers((suppRes.data.items || []).filter((s: Supplier) => s.isActive === 1));
//         setChemicalsLoaded(true);
//         setSuppliersLoaded(true);
//       } catch (error) {
//         console.error("Error fetching chemicals or suppliers:", error);
//       }
//     };

//     fetchLists();
//   }, [token]);

//   // Fetch inward details
//   useEffect(() => {
//     if (!open || !InwardId) return;

//     const fetchInward = async () => {
//       try {
//         const res = await axios.get(`${BASE_URL}/api/chemicalinward/${InwardId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         const chemicalName = chemicals.find(c => c.id === res.data.chemicalMasterId)?.name || "";
//         const supplierName = suppliers.find(s => s.id === res.data.supplierMasterId)?.name || "";

//         setFormData({
//           id: res.data.id,
//           chemicalId: res.data.chemicalMasterId?.toString() || "",
//           ChemicalName: chemicalName,
//           QTY: res.data.qty?.toString() || "",
//           supplierId: res.data.supplierMasterId?.toString() || "",
//           Supplier: supplierName,
//           BatchNo: res.data.batchNo?.toString() || "",
//           BillDate: res.data.billDate?.split("T")[0] || "",
//           ReceivedDate: res.data.receivedDate?.split("T")[0] || "",
//           isActive: res.data.isActive ?? 1,
//         });

//         setFormErrors({});
//       } catch (error) {
//         console.error("Error fetching inward:", error);
//       }
//     };

//     fetchInward();
//   }, [open, InwardId, chemicals, suppliers, token]);

//   const activeChemicals = useMemo(() => chemicals.filter((c) => c.isActive === 1), [chemicals]);
//   const activeSuppliers = useMemo(() => suppliers.filter((s) => s.isActive === 1), [suppliers]);

//   const handleChemicalChange = (value: string | number) => {
//     setFormData((prev) => ({ ...prev, chemicalId: String(value) }));
//     setFormErrors((prev) => ({ ...prev, ChemicalName: "" }));
//   };

//   const handleSupplierChange = (value: string | number) => {
//     setFormData((prev) => ({ ...prev, supplierId: String(value) }));
//     setFormErrors((prev) => ({ ...prev, Supplier: "" }));
//   };

//   const handleUpdate = async () => {
//     const errors: Record<string, string> = {};

//     if (!formData.chemicalId) errors.ChemicalName = "Chemical is required";
//     if (!formData.QTY) errors.QTY = "QTY is required";
//     if (!formData.supplierId) errors.Supplier = "Supplier is required";
//     if (!formData.BatchNo) errors.BatchNo = "Batch No is required";
//     if (!formData.BillDate) errors.BillDate = "Bill Date is required";
//     if (!formData.ReceivedDate) errors.ReceivedDate = "Received Date is required";

//     setFormErrors(errors);
//     if (Object.keys(errors).length > 0) return;

//     try {
//       const payload = {
//         id: formData.id,
//         chemicalMasterId: Number(formData.chemicalId),
//         qty: Number(formData.QTY),
//         supplierMasterId: Number(formData.supplierId),
//         batchNo: Number(formData.BatchNo),
//         billDate: formData.BillDate,
//         receivedDate: formData.ReceivedDate,
//         isActive: formData.isActive,
//       };

//       const res = await axios.put(`${BASE_URL}/api/chemicalinward/${formData.id}`, payload, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (res.status === 200 || res.status === 201) {
//         onClose();

//         setSuccessModalConfig({
//           title: "Inward Updated Successfully",
//           subtitle: "The inward details have been updated.",
//           icon: "CheckCircle",
//           buttonText: "OK",
//           onButtonClick: () => setIsSuccessModalOpen(false),
//         });

//         setIsSuccessModalOpen(true);

//         if (onSuccess) onSuccess();
//       }
//     } catch (error: any) {
//       console.error("Update error:", error);
//       alert(error.response?.data?.message || "Something went wrong");
//     }
//   };

//   return (
//     <>
//       <Dialog open={open} onClose={onClose} staticBackdrop size="md">
//         <Dialog.Panel>
//           <Dialog.Title>
//             <h2 className="text-base font-medium">Edit Inward</h2>
//           </Dialog.Title>

//           <Dialog.Description className="space-y-4">
//             {/* Chemical Name */}
//             <div>
//               <FormLabel>Chemical Name</FormLabel>
//               {chemicalsLoaded ? (
//                 <TomSelect
//                   value={formData.chemicalId}
//                   onChange={(e) => handleChemicalChange(e.target.value)}
//                   options={{ placeholder: "Select Chemical", allowEmptyOption: true }}
//                   className="w-full"
//                 >
//                   <option value="">Select Chemical</option>
//                   {activeChemicals.map((chemical) => (
//                     <option key={chemical.id} value={chemical.id}>
//                       {chemical.name}
//                     </option>
//                   ))}
//                 </TomSelect>
//               ) : (
//                 <p className="text-gray-500 text-sm">Loading chemicals...</p>
//               )}
//               {formErrors.ChemicalName && <p className="text-sm text-red-500">{formErrors.ChemicalName}</p>}
//             </div>

//             {/* QTY */}
//             <div>
//               <FormLabel>QTY</FormLabel>
//               <FormInput
//                 type="text"
//                 placeholder="Enter QTY"
//                 value={formData.QTY}
//                 onChange={(e) => {
//                   const value = e.target.value;
//                   setFormData({ ...formData, QTY: value });
//                   if (value.trim()) setFormErrors((prev) => ({ ...prev, QTY: "" }));
//                 }}
//               />
//               {formErrors.QTY && <p className="text-sm text-red-500">{formErrors.QTY}</p>}
//             </div>

//             {/* Supplier */}
//             <div>
//               <FormLabel>Supplier</FormLabel>
//               {suppliersLoaded ? (
//                 <TomSelect
//                   value={formData.supplierId}
//                   onChange={(e) => handleSupplierChange(e.target.value)}
//                   options={{ placeholder: "Select Supplier", allowEmptyOption: true }}
//                   className="w-full"
//                 >
//                   <option value="">Select Supplier</option>
//                   {activeSuppliers.map((supplier) => (
//                     <option key={supplier.id} value={supplier.id}>
//                       {supplier.name}
//                     </option>
//                   ))}
//                 </TomSelect>
//               ) : (
//                 <p className="text-gray-500 text-sm">Loading suppliers...</p>
//               )}
//               {formErrors.Supplier && <p className="text-sm text-red-500">{formErrors.Supplier}</p>}
//             </div>

//             {/* Batch No */}
//             <div>
//               <FormLabel>Batch No</FormLabel>
//               <FormInput
//                 type="text"
//                 placeholder="Enter Batch No"
//                 value={formData.BatchNo}
//                 onChange={(e) => {
//                   const value = e.target.value;
//                   setFormData({ ...formData, BatchNo: value });
//                   if (value.trim()) setFormErrors((prev) => ({ ...prev, BatchNo: "" }));
//                 }}
//               />
//               {formErrors.BatchNo && <p className="text-sm text-red-500">{formErrors.BatchNo}</p>}
//             </div>

//             {/* Bill Date & Received Date */}
//             <div className="grid grid-cols-2 gap-4 mt-4">
//               <div>
//                 <FormLabel>Bill Date</FormLabel>
//                 <FormInput
//                   type="date"
//                   value={formData.BillDate}
//                   onChange={(e) => {
//                     const value = e.target.value;
//                     setFormData({ ...formData, BillDate: value });
//                     if (value) setFormErrors((prev) => ({ ...prev, BillDate: "" }));
//                   }}
//                 />
//                 {formErrors.BillDate && <p className="text-sm text-red-500">{formErrors.BillDate}</p>}
//               </div>

//               <div>
//                 <FormLabel>Received Date</FormLabel>
//                 <FormInput
//                   type="date"
//                   value={formData.ReceivedDate}
//                   onChange={(e) => {
//                     const value = e.target.value;
//                     setFormData({ ...formData, ReceivedDate: value });
//                     if (value) setFormErrors((prev) => ({ ...prev, ReceivedDate: "" }));
//                   }}
//                 />
//                 {formErrors.ReceivedDate && <p className="text-sm text-red-500">{formErrors.ReceivedDate}</p>}
//               </div>
//             </div>
//           </Dialog.Description>

//           <Dialog.Footer>
//             <Button variant="outline-secondary" className="w-24 mr-2" onClick={onClose}>
//               Cancel
//             </Button>
//             <Button variant="primary" className="w-24" onClick={handleUpdate}>
//               Update
//             </Button>
//           </Dialog.Footer>
//         </Dialog.Panel>
//       </Dialog>

//       <SuccessModal
//         open={isSuccessModalOpen}
//         onClose={() => setIsSuccessModalOpen(false)}
//         {...successModalConfig}
//       />
//     </>
//   );
// };

// export default EditInwardList;



import { useState, useEffect, useMemo } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config";
import { SuccessModalConfig } from "../../CommonModals/SuccessModal/SuccessModalConfig";
import SuccessModal from "../../CommonModals/SuccessModal/SuccessModal";
import TomSelect from "@/components/Base/TomSelect";

interface EditInwardListProps {
  open: boolean;
  onClose: () => void;
  InwardId: number | null;
  onSuccess?: () => void;
}

interface Chemical {
  id: number;
  name: string;
  isActive: number;
}

interface Supplier {
  id: number;
  name: string;
  isActive: number;
}

const EditInwardList: React.FC<EditInwardListProps> = ({
  open,
  onClose,
  InwardId,
  onSuccess,
}) => {
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    id: 0,
    chemicalId: "",
    ChemicalName: "",
    QTY: "",
    supplierId: "",
    Supplier: "",
    BatchNo: "",
    BillDate: "",
    ReceivedDate: "",
    isActive: 1,
  });

  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [chemicalsLoaded, setChemicalsLoaded] = useState(false);
  const [suppliersLoaded, setSuppliersLoaded] = useState(false);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalConfig, setSuccessModalConfig] = useState<SuccessModalConfig>({
    title: "",
    subtitle: "",
    icon: "CheckCircle",
    buttonText: "OK",
    onButtonClick: () => { },
  });

  // Fetch chemicals and suppliers lists
  useEffect(() => {
    const fetchLists = async () => {
      try {
        setChemicalsLoaded(false);
        setSuppliersLoaded(false);
        const [chemicalRes, suppRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/chemical`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${BASE_URL}/api/supplier`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setChemicals((chemicalRes.data.items || []).filter((c: Chemical) => c.isActive === 1));
        setSuppliers((suppRes.data.items || []).filter((s: Supplier) => s.isActive === 1));
        setChemicalsLoaded(true);
        setSuppliersLoaded(true);
      } catch (error) {
        console.error("Error fetching chemicals or suppliers:", error);
      }
    };

    fetchLists();
  }, [token]);

  // Fetch inward details
  useEffect(() => {
    if (!open || !InwardId) return;

    const fetchInward = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/chemicalinward/${InwardId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const chemicalName = chemicals.find(c => c.id === res.data.chemicalMasterId)?.name || "";
        const supplierName = suppliers.find(s => s.id === res.data.supplierMasterId)?.name || "";

        setFormData({
          id: res.data.id,
          chemicalId: res.data.chemicalMasterId?.toString() || "",
          ChemicalName: chemicalName,
          QTY: res.data.qty?.toString() || "",
          supplierId: res.data.supplierMasterId?.toString() || "",
          Supplier: supplierName,
          BatchNo: res.data.batchNo?.toString() || "",
          BillDate: res.data.billDate?.split("T")[0] || "",
          ReceivedDate: res.data.receivedDate?.split("T")[0] || "",
          isActive: res.data.isActive ?? 1,
        });

        setFormErrors({});
      } catch (error) {
        console.error("Error fetching inward:", error);
      }
    };

    fetchInward();
  }, [open, InwardId, chemicals, suppliers, token]);

  const activeChemicals = useMemo(() => chemicals.filter((c) => c.isActive === 1), [chemicals]);
  const activeSuppliers = useMemo(() => suppliers.filter((s) => s.isActive === 1), [suppliers]);

  const handleChemicalChange = (value: string | number) => {
    setFormData((prev) => ({ ...prev, chemicalId: String(value) }));
    setFormErrors((prev) => ({ ...prev, ChemicalName: "" }));
  };


  const handleSupplierChange = (value: string | number) => {
    setFormData((prev) => ({ ...prev, supplierId: String(value) }));
    setFormErrors((prev) => ({ ...prev, Supplier: "" }));
  };

  const handleUpdate = async () => {
    const errors: Record<string, string> = {};
    if (!formData.chemicalId) errors.ChemicalName = "Chemical is required";
    if (!formData.QTY) errors.QTY = "QTY is required";
    if (!formData.supplierId) errors.Supplier = "Supplier is required";
    if (!formData.BatchNo) errors.BatchNo = "Batch No is required";
    if (!formData.BillDate) errors.BillDate = "Bill Date is required";
    if (!formData.ReceivedDate) errors.ReceivedDate = "Received Date is required";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        id: formData.id,
        chemicalMasterId: Number(formData.chemicalId),
        qty: Number(formData.QTY),
        supplierMasterId: Number(formData.supplierId),
        batchNo: Number(formData.BatchNo),
        billDate: formData.BillDate,
        receivedDate: formData.ReceivedDate,
        isActive: formData.isActive,
      };

      const res = await axios.put(`${BASE_URL}/api/chemicalinward/${formData.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200 || res.status === 201) {
        onClose();

        setSuccessModalConfig({
          title: "Inward Updated Successfully",
          subtitle: "The inward details have been updated.",
          icon: "CheckCircle",
          buttonText: "OK",
          onButtonClick: () => setIsSuccessModalOpen(false),
        });

        setIsSuccessModalOpen(true);

        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      console.error("Update error:", error);
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} staticBackdrop size="md">
        <Dialog.Panel>
          <Dialog.Title>
            <h2 className="text-base font-medium">Edit Inward</h2>
          </Dialog.Title>

          <Dialog.Description className="space-y-4">
            {/* Chemical Name */}
            <div>
              <FormLabel>Chemical Name</FormLabel>
              {chemicalsLoaded ? (
                <TomSelect
                  value={formData.chemicalId}
                  onChange={(e) => handleChemicalChange(e.target.value)}
                  options={{ placeholder: "Select Chemical", allowEmptyOption: true }}
                  className="w-full"
                >
                  <option value="">Select Chemical</option>
                  {activeChemicals.map((chemical) => (
                    <option key={chemical.id} value={chemical.id}>
                      {chemical.name}
                    </option>
                  ))}
                </TomSelect>
              ) : (
                <p className="text-gray-500 text-sm">Loading chemicals...</p>
              )}
              {formErrors.ChemicalName && <p className="text-sm text-red-500">{formErrors.ChemicalName}</p>}
            </div>

            {/* QTY */}
            <div>
              <FormLabel>QTY</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter QTY"
                value={formData.QTY}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, QTY: value });
                  if (value.trim()) setFormErrors((prev) => ({ ...prev, QTY: "" }));
                }}
              />
              {formErrors.QTY && <p className="text-sm text-red-500">{formErrors.QTY}</p>}
            </div>

            {/* Supplier */}
            <div>
              <FormLabel>Supplier</FormLabel>
              {suppliersLoaded ? (
                <TomSelect
                  value={formData.supplierId}
                  onChange={(e) => handleSupplierChange(e.target.value)}
                  options={{ placeholder: "Select Supplier", allowEmptyOption: true }}
                  className="w-full"
                >
                  <option value="">Select Supplier</option>
                  {activeSuppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </TomSelect>
              ) : (
                <p className="text-gray-500 text-sm">Loading suppliers...</p>
              )}
              {formErrors.Supplier && <p className="text-sm text-red-500">{formErrors.Supplier}</p>}
            </div>

            {/* Batch No */}
            <div>
              <FormLabel>Batch No</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter Batch No"
                value={formData.BatchNo}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, BatchNo: value });
                  if (value.trim()) setFormErrors((prev) => ({ ...prev, BatchNo: "" }));
                }}
              />
              {formErrors.BatchNo && <p className="text-sm text-red-500">{formErrors.BatchNo}</p>}
            </div>

            {/* Bill Date & Received Date */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <FormLabel>Bill Date</FormLabel>
                <FormInput
                  type="date"
                  value={formData.BillDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, BillDate: value });
                    if (value) setFormErrors((prev) => ({ ...prev, BillDate: "" }));
                  }}
                />
                {formErrors.BillDate && <p className="text-sm text-red-500">{formErrors.BillDate}</p>}
              </div>

              <div>
                <FormLabel>Received Date</FormLabel>
                <FormInput
                  type="date"
                  value={formData.ReceivedDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, ReceivedDate: value });
                    if (value) setFormErrors((prev) => ({ ...prev, ReceivedDate: "" }));
                  }}
                />
                {formErrors.ReceivedDate && <p className="text-sm text-red-500">{formErrors.ReceivedDate}</p>}
              </div>
            </div>
          </Dialog.Description>

          <Dialog.Footer>
            <Button variant="outline-secondary" className="w-24 mr-2" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" className="w-24" onClick={handleUpdate}>
              Update
            </Button>
          </Dialog.Footer>
        </Dialog.Panel>
      </Dialog>

      <SuccessModal
        open={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        {...successModalConfig}
      />
    </>
  );
};

export default EditInwardList;
