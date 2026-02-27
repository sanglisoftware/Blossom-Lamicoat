import { useState, useEffect, useMemo } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config";
import { SuccessModalConfig } from "../../CommonModals/SuccessModal/SuccessModalConfig";
import SuccessModal from "../../CommonModals/SuccessModal/SuccessModal";
import TomSelect from "@/components/Base/TomSelect";

interface EditInwardReportProps {
  open: boolean;
  onClose: () => void;
  InwardId: number | null;
  onSuccess?: () => void;
}

interface Supplier {
  id: number;
  name: string;
  isActive: number;
}

interface Fabric {
  id: number;
  name: string;
  isActive: number;
}



const EditInwardReport: React.FC<EditInwardReportProps> = ({
  open,
  onClose,
  InwardId,
  onSuccess,
}) => {
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    id: 0,
    supplierId: "",
    Supplier: "",
    fabricId: "",
    FabricName: "",
    BatchNo: "",
    qtyMTR: "",
    Comments: "",
    isActive: 1,
  });

  const [fabric, setFabric] = useState<Fabric[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [fabricLoaded, setFabricLoaded] = useState(false);
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
        setFabricLoaded(false);
        setSuppliersLoaded(false);
        const [fabricRes, suppRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/fproductlist`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${BASE_URL}/api/supplier`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setFabric((fabricRes.data.items || []).filter((c: Fabric) => c.isActive === 1));
        setSuppliers((suppRes.data.items || []).filter((s: Supplier) => s.isActive === 1));
        setFabricLoaded(true);
        setSuppliersLoaded(true);
      } catch (error) {
        console.error("Error fetching fabrics or suppliers:", error);
      }
    };

    fetchLists();
  }, [token]);

  // Fetch inward details
  useEffect(() => {
    if (!open || !InwardId) return;

    const fetchInward = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/fabricinward/${InwardId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const fabricName = fabric.find(c => c.id === res.data.fabricMasterId)?.name || "";
        const supplierName = suppliers.find(s => s.id === res.data.supplierMasterId)?.name || "";

        setFormData({
          id: res.data.id,
            supplierId: res.data.supplierMasterId?.toString() || "",
          Supplier: supplierName,
          fabricId: res.data.fabricMasterId?.toString() || "",
          FabricName: fabricName,
          BatchNo: res.data.batchNo?.toString() || "",
          qtyMTR: res.data.qtyMTR?.toString() || "",       
          Comments: res.data.comments || "",
          isActive: res.data.isActive ?? 1,
        });

        setFormErrors({});
      } catch (error) {
        console.error("Error fetching inward:", error);
      }
    };

    fetchInward();
  }, [open, InwardId, fabric, suppliers, token]);

  const activeFabrics = useMemo(() => fabric.filter((c) => c.isActive === 1), [fabric]);
  const activeSuppliers = useMemo(() => suppliers.filter((s) => s.isActive === 1), [suppliers]);

  const handleFabricChange = (value: string | number) => {
    setFormData((prev) => ({ ...prev, fabricId: String(value) }));
    setFormErrors((prev) => ({ ...prev, FabricName: "" }));
  };

  const handleSupplierChange = (value: string | number) => {
    setFormData((prev) => ({ ...prev, supplierId: String(value) }));
    setFormErrors((prev) => ({ ...prev, Supplier: "" }));
  };

  const handleUpdate = async () => {
    const errors: Record<string, string> = {};
    if (!formData.supplierId) errors.Supplier = "Supplier is required";
    if (!formData.fabricId) errors.FabricName = "Fabric is required";
    if (!formData.BatchNo) errors.BatchNo = "Batch No is required";
    if (!formData.qtyMTR) errors.qtyMTR = "QTY is required";
    if (!formData.Comments) errors.Comments = "Comments is required";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        id: formData.id,
        supplierMasterId: Number(formData.supplierId),
        fabricMasterId: Number(formData.fabricId),
        batchNo: formData.BatchNo,
        qtyMTR: Number(formData.qtyMTR),
        comments: formData.Comments,
        isActive: formData.isActive,
      };

      const res = await axios.put(`${BASE_URL}/api/fabricinward/${formData.id}`, payload, {
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

            {/* Fabric Name */}
            <div>
              <FormLabel>Fabric Name</FormLabel>
              {fabricLoaded ? (
                <TomSelect
                  value={formData.fabricId}
                  onChange={(e) => handleFabricChange(e.target.value)}
                  options={{ placeholder: "Select Fabric", allowEmptyOption: true }}
                  className="w-full"
                >
                  <option value="">Select Fabric</option>
                  {activeFabrics.map((fabric) => (
                    <option key={fabric.id} value={fabric.id}>
                      {fabric.name}
                    </option>
                  ))}
                </TomSelect>
              ) : (
                <p className="text-gray-500 text-sm">Loading fabrics...</p>
              )}
              {formErrors.ChemicalName && <p className="text-sm text-red-500">{formErrors.ChemicalName}</p>}
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

            {/* QTY */}
            <div>
              <FormLabel>QTY In MTR</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter QTY"
                value={formData.qtyMTR}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, qtyMTR: value });
                  if (value.trim()) setFormErrors((prev) => ({ ...prev, qtyMTR: "" }));
                }}
              />
              {formErrors.qtyMTR && <p className="text-sm text-red-500">{formErrors.qtyMTR}</p>}
            </div>

            {/* Comments */}
            <div>
              <FormLabel>Comments</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter Comments"
                value={formData.Comments}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, Comments: value });
                  if (value.trim()) setFormErrors((prev) => ({ ...prev, Comments: "" }));
                }}
              />
              {formErrors.Comments && <p className="text-sm text-red-500">{formErrors.Comments}</p>}
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

export default EditInwardReport;
