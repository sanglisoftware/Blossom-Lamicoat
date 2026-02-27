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

interface PVC {
  id: number;
  name: string;
  isActive: number;
}

interface Supplier {
  id: number;
  name: string;
  isActive: number;
}

const EditPVCInward: React.FC<EditInwardListProps> = ({
  open,
  onClose,
  InwardId,
  onSuccess,
}) => {
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    id: 0,
    supplierId: "",
    supplierName: "",
    pvcId: "",
    PVCName: "",
    new_RollNo:"",
    batchNo: "",
    qty_kg: "",
    qty_Mtr:"",
    comments: "",
    BillDate: "",
    ReceivedDate: "",
    isActive: 1,
  });

  const [pvcOptions, setPVCOptions] = useState<PVC[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [pvcOptionsLoaded, setPVCOptionsLoaded] = useState(false);
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
        setPVCOptionsLoaded(false);
        setSuppliersLoaded(false);
        const [pvcRes, suppRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/pvcproductlist`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${BASE_URL}/api/supplier`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setPVCOptions((pvcRes.data.items || []).filter((p: PVC) => p.isActive === 1));
        setSuppliers((suppRes.data.items || []).filter((s: Supplier) => s.isActive === 1));
        setPVCOptionsLoaded(true);
        setSuppliersLoaded(true);
      } catch (error) {
        console.error("Error fetching pvc or suppliers:", error);
      }
    };

    fetchLists();
  }, [token]);

  // Fetch inward details
  useEffect(() => {
    if (!open || !InwardId) return;

    const fetchInward = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/pvcinward/${InwardId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const pvcName = pvcOptions.find(c => c.id === res.data.pvcMasterId)?.name || "";
        const supplierName = suppliers.find(s => s.id === res.data.supplierMasterId)?.name || "";

        setFormData({
          id: res.data.id,
            supplierId: res.data.supplierMasterId?.toString() || "",
          supplierName: supplierName,
          pvcId: res.data.pvcMasterId?.toString() || "",
          PVCName: pvcName,
          new_RollNo: res.data.new_RollNo || "",
          batchNo: res.data.batchNo?.toString() || "",
          qty_kg: res.data.qty_kg?.toString() || "",
          qty_Mtr: res.data.qty_Mtr?.toString() || "",
          comments: res.data.comments || "",
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
  }, [open, InwardId, pvcOptions, suppliers, token]);

  const activePVCs = useMemo(() => pvcOptions.filter((c) => c.isActive === 1), [pvcOptions]);
  const activeSuppliers = useMemo(() => suppliers.filter((s) => s.isActive === 1), [suppliers]);

  const handlePVCChange = (value: string | number) => {
    setFormData((prev) => ({ ...prev, pvcId: String(value) }));
    setFormErrors((prev) => ({ ...prev, PVCName: "" }));
  };

  const handleSupplierChange = (value: string | number) => {
    setFormData((prev) => ({ ...prev, supplierId: String(value) }));
    setFormErrors((prev) => ({ ...prev, Supplier: "" }));
  };

  const handleUpdate = async () => {
    const errors: Record<string, string> = {};
    if (!formData.supplierId) errors.Supplier = "Supplier is required";
    if (!formData.pvcId) errors.PVCName = "PVC is required";
    if (!formData.new_RollNo) errors.NewRollNo = "New Roll No is required";
    if (!formData.batchNo) errors.batchNo = "Batch No is required";
    if (!formData.qty_kg) errors.qty_kg = "QTY (Kg) is required";
    if (!formData.qty_Mtr) errors.qty_Mtr = "QTY (MTR) is required";
    if (!formData.comments) errors.comments = "Comments is required";
    if (!formData.BillDate) errors.BillDate = "Bill Date is required";
    if (!formData.ReceivedDate) errors.ReceivedDate = "Received Date is required";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        id: formData.id,
        supplierMasterId: Number(formData.supplierId),
        pvcMasterId: Number(formData.pvcId),
        new_RollNo: formData.new_RollNo,
        batchNo: formData.batchNo,
        qty_kg: Number(formData.qty_kg),
        qty_Mtr: Number(formData.qty_Mtr),
        comments: formData.comments,
        billDate: formData.BillDate,
        receivedDate: formData.ReceivedDate,
        isActive: formData.isActive,
      };

      const res = await axios.put(`${BASE_URL}/api/pvcinward/${formData.id}`, payload, {
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
              <FormLabel>Supplier</FormLabel>
              {suppliersLoaded ? (
                <TomSelect
                  value={formData.supplierId}
                  onChange={(e) => handleSupplierChange(e.target.value)}
                  options={{ placeholder: "Select Supplier", allowEmptyOption: true }}
                  className="w-full"
                >
                  <option value="">Select Supplier</option>
                  {activeSuppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </TomSelect>
              ) : (
                <p className="text-gray-500 text-sm">Loading suppliers...</p>
              )}
              {formErrors.supplierId && <p className="text-red-500 text-sm">{formErrors.supplierId}</p>}
            </div>
  {/* Supplier Dropdown */}

            <div>
              <FormLabel>PVC</FormLabel>
              {suppliersLoaded ? (
                <TomSelect
                  value={formData.pvcId}
                  onChange={(e) => handlePVCChange(e.target.value)}
                  options={{ placeholder: "Select PVC", allowEmptyOption: true }}
                  className="w-full"
                >
                  <option value="">Select PVC</option>
                  {activePVCs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </TomSelect>
              ) : (
                <p className="text-gray-500 text-sm">Loading PVCs...</p>
              )}
              {formErrors.PVCId && <p className="text-red-500 text-sm">{formErrors.PVCId}</p>}
              </div>
                  <div>
                          <FormLabel>New Roll No</FormLabel>
                          <FormInput
                            type="text"
                            value={formData.new_RollNo}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                new_RollNo: e.target.value,
                              })
                            }
                          />
                          {formErrors.new_RollNo && (
                            <p className="text-red-500 text-sm">
                              {formErrors.new_RollNo}
                            </p>
                          )}
                         </div>
            {/* BatchNo */}
            <div>
              <FormLabel>Batch No</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter Batch No"
                value={formData.batchNo}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, batchNo: value });
                  if (value.trim()) setFormErrors((prev) => ({ ...prev, batchNo: "" }));
                }}
              />
              {formErrors.batchNo && <p className="text-red-500 text-sm">{formErrors.batchNo}</p>}
            </div>

            {/* QTY */}
            <div>
              <FormLabel>QTY (kg)</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter QTY"
                value={formData.qty_kg}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, qty_kg: value });
                  if (value.trim()) setFormErrors((prev) => ({ ...prev, qty_kg: "" }));
                }}
              />
              {formErrors.qty_kg && <p className="text-red-500 text-sm">{formErrors.qty_kg}</p>}
            </div>

       
   <div>
              <FormLabel>QTY (MTR)</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter QTY"
                value={formData.qty_Mtr}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, qty_Mtr: value });
                  if (value.trim()) setFormErrors((prev) => ({ ...prev, qty_Mtr: "" }));
                }}
              />
              {formErrors.qty_Mtr && <p className="text-red-500 text-sm">{formErrors.qty_Mtr}</p>}
            </div>

               <div>
              <FormLabel>Comments</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter Comments"
                value={formData.comments}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, comments: value });
                  if (value.trim()) setFormErrors((prev) => ({ ...prev, comments: "" }));
                }}
              />
              {formErrors.comments && <p className="text-red-500 text-sm">{formErrors.comments}</p>}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <FormLabel>Bill Date</FormLabel>
                <FormInput
                  type="date"
                  value={formData.BillDate}
                  onChange={(e) => setFormData({ ...formData, BillDate: e.target.value })}
                />
                {formErrors.BillDate && <p className="text-red-500 text-sm">{formErrors.BillDate}</p>}
              </div>
              <div>
                <FormLabel>Received Date</FormLabel>
                <FormInput
                  type="date"
                  value={formData.ReceivedDate}
                  onChange={(e) => setFormData({ ...formData, ReceivedDate: e.target.value })}
                />
                {formErrors.ReceivedDate && <p className="text-red-500 text-sm">{formErrors.ReceivedDate}</p>}
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

export default EditPVCInward;
