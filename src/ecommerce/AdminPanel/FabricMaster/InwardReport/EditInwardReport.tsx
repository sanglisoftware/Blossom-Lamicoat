import { useState, useEffect, useMemo } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel, FormSelect } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config";
import { SuccessModalConfig } from "../../CommonModals/SuccessModal/SuccessModalConfig";
import SuccessModal from "../../CommonModals/SuccessModal/SuccessModal";

interface EditInwardReportProps {
  open: boolean;
  onClose: () => void;
  InwardId: number | null;
  initialData?: {
    id: number;
    supplierMasterId?: number;
    fabricMasterId?: number;
    fGramageMasterId?: number | null;
    colourMasterId?: number | null;
    supplierMasterName?: string;
    fabricMasterName?: string;
    fGramageMasterName?: string;
    colourMasterName?: string;
    batchNo?: number;
    qtyMTR?: number;
    comments?: string;
    attachedFile?: string;
    isActive?: number;
  } | null;
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

interface Colour {
  id: number;
  name: string;
  isActive: number;
}

interface FGramage {
  id: number;
  grm: string;
  isActive: number;
}

const initialFormData = {
  id: 0,
  supplierId: "",
  Supplier: "",
  fabricId: "",
  FabricName: "",
  fGramageId: "",
  fGramageName: "",
  colourId: "",
  colourName: "",
  BatchNo: "",
  qtyMTR: "",
  Comments: "",
  attachedFile: "",
  isActive: 1,
};

const EditInwardReport: React.FC<EditInwardReportProps> = ({
  open,
  onClose,
  InwardId,
  initialData,
  onSuccess,
}) => {
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState(initialFormData);

  const [fabric, setFabric] = useState<Fabric[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [colours, setColours] = useState<Colour[]>([]);
  const [fGramages, setFGramages] = useState<FGramage[]>([]);
  const [fabricLoaded, setFabricLoaded] = useState(false);
  const [suppliersLoaded, setSuppliersLoaded] = useState(false);
  const [coloursLoaded, setColoursLoaded] = useState(false);
  const [fGramagesLoaded, setFGramagesLoaded] = useState(false);
  const [inwardLoaded, setInwardLoaded] = useState(false);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalConfig, setSuccessModalConfig] = useState<SuccessModalConfig>({
    title: "",
    subtitle: "",
    icon: "CheckCircle",
    buttonText: "OK",
    onButtonClick: () => { },
  });

  useEffect(() => {
    const fetchLists = async () => {
      try {
        setFabricLoaded(false);
        setSuppliersLoaded(false);
        setColoursLoaded(false);
        setFGramagesLoaded(false);
        const [fabricRes, suppRes, colourRes, fGramageRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/fproductlist`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${BASE_URL}/api/supplier`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${BASE_URL}/api/colour`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${BASE_URL}/api/fgramage`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setFabric((fabricRes.data.items || []).filter((c: Fabric) => c.isActive === 1));
        setSuppliers((suppRes.data.items || []).filter((s: Supplier) => s.isActive === 1));
        setColours((colourRes.data.items || []).filter((c: Colour) => c.isActive === 1));
        setFGramages((fGramageRes.data.items || []).filter((g: FGramage) => g.isActive === 1));
        setFabricLoaded(true);
        setSuppliersLoaded(true);
        setColoursLoaded(true);
        setFGramagesLoaded(true);
      } catch (error) {
        console.error("Error fetching fabrics, suppliers, colours, or gramages:", error);
      }
    };

    fetchLists();
  }, [token]);

  // Fetch inward details once per edit open so dropdown list updates do not overwrite user edits.
  useEffect(() => {
    if (!open || !InwardId) return;

    if (initialData?.id === InwardId) {
      setFormData({
        id: initialData.id,
        supplierId: initialData.supplierMasterId?.toString() || "",
        Supplier: initialData.supplierMasterName || "",
        fabricId: initialData.fabricMasterId?.toString() || "",
        FabricName: initialData.fabricMasterName || "",
        fGramageId: initialData.fGramageMasterId?.toString() || "",
        fGramageName: initialData.fGramageMasterName || "",
        colourId: initialData.colourMasterId?.toString() || "",
        colourName: initialData.colourMasterName || "",
        BatchNo: initialData.batchNo?.toString() || "",
        qtyMTR: initialData.qtyMTR?.toString() || "",
        Comments: initialData.comments || "",
        attachedFile: initialData.attachedFile || "",
        isActive: initialData.isActive ?? 1,
      });
      setAttachedFile(null);
      setFormErrors({});
      setInwardLoaded(true);
      return;
    }

    const fetchInward = async () => {
      try {
        setInwardLoaded(false);
        const res = await axios.get(`${BASE_URL}/api/fabricinward/${InwardId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFormData({
          id: res.data.id,
          supplierId: res.data.supplierMasterId?.toString() || "",
          Supplier: "",
          fabricId: res.data.fabricMasterId?.toString() || "",
          FabricName: "",
          fGramageId: res.data.fGramageMasterId?.toString() || "",
          fGramageName: "",
          colourId: res.data.colourMasterId?.toString() || "",
          colourName: "",
          BatchNo: res.data.batchNo?.toString() || "",
          qtyMTR: res.data.qtyMTR?.toString() || "",       
          Comments: res.data.comments || "",
          attachedFile: res.data.attachedFile || "",
          isActive: res.data.isActive ?? 1,
        });

        setAttachedFile(null);
        setFormErrors({});
        setInwardLoaded(true);
      } catch (error) {
        console.error("Error fetching inward:", error);
        setInwardLoaded(false);
      }
    };

    fetchInward();
  }, [open, InwardId, initialData, token]);

  useEffect(() => {
    if (!open) {
      setFormData(initialFormData);
      setFormErrors({});
      setAttachedFile(null);
      setInwardLoaded(false);
    }
  }, [open]);

  const activeFabrics = useMemo(() => fabric.filter((c) => c.isActive === 1), [fabric]);
  const activeSuppliers = useMemo(() => suppliers.filter((s) => s.isActive === 1), [suppliers]);
  const activeColours = useMemo(() => colours.filter((c) => c.isActive === 1), [colours]);
  const activeFGramages = useMemo(() => fGramages.filter((g) => g.isActive === 1), [fGramages]);
  const isFormReady =
    inwardLoaded &&
    fabricLoaded &&
    suppliersLoaded &&
    coloursLoaded &&
    fGramagesLoaded;

  const handleFabricChange = (value: string | number) => {
    setFormData((prev) => ({ ...prev, fabricId: String(value) }));
    setFormErrors((prev) => ({ ...prev, FabricName: "" }));
  };

  const handleSupplierChange = (value: string | number) => {
    setFormData((prev) => ({ ...prev, supplierId: String(value) }));
    setFormErrors((prev) => ({ ...prev, Supplier: "" }));
  };

  const handleColourChange = (value: string | number) => {
    setFormData((prev) => ({ ...prev, colourId: String(value) }));
    setFormErrors((prev) => ({ ...prev, colourId: "" }));
  };

  const handleFGramageChange = (value: string | number) => {
    setFormData((prev) => ({ ...prev, fGramageId: String(value) }));
    setFormErrors((prev) => ({ ...prev, fGramageId: "" }));
  };

  const handleUpdate = async () => {
    const errors: Record<string, string> = {};
    if (!formData.supplierId) errors.Supplier = "Supplier is required";
    if (!formData.fabricId) errors.FabricName = "Fabric is required";
    if (!formData.fGramageId) errors.fGramageId = "GRM is required";
    if (!formData.colourId) errors.colourId = "Colour is required";
    if (!formData.BatchNo) errors.BatchNo = "Batch No is required";
    if (!formData.qtyMTR) errors.qtyMTR = "QTY is required";
    if (!formData.Comments) errors.Comments = "Comments is required";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const jsonPayload = {
        id: formData.id,
        supplierMasterId: Number(formData.supplierId),
        fabricMasterId: Number(formData.fabricId),
        fGramageMasterId: Number(formData.fGramageId),
        colourMasterId: Number(formData.colourId),
        batchNo: Number(formData.BatchNo),
        qtyMTR: Number(formData.qtyMTR),
        comments: formData.Comments,
        attachedFile: formData.attachedFile || "",
        isActive: formData.isActive,
      };

      const res = await axios.put(`${BASE_URL}/api/fabricinward/${formData.id}`, jsonPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      alert(
        error.response?.data?.detail ||
        error.response?.data?.title ||
        error.response?.data?.message ||
        "Something went wrong"
      );
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
            <>
              <div>
                <FormLabel>Supplier</FormLabel>
                <FormSelect
                  value={formData.supplierId}
                  onChange={(e) => handleSupplierChange(e.target.value)}
                  className="w-full"
                >
                  <option value="">Select Supplier</option>
                  {activeSuppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </FormSelect>
                {formErrors.Supplier && <p className="text-sm text-red-500">{formErrors.Supplier}</p>}
              </div>

              <div>
                <FormLabel>Fabric Name</FormLabel>
                <FormSelect
                  value={formData.fabricId}
                  onChange={(e) => handleFabricChange(e.target.value)}
                  className="w-full"
                >
                  <option value="">Select Fabric</option>
                  {activeFabrics.map((fabric) => (
                    <option key={fabric.id} value={fabric.id}>
                      {fabric.name}
                    </option>
                  ))}
                </FormSelect>
                {formErrors.ChemicalName && <p className="text-sm text-red-500">{formErrors.ChemicalName}</p>}
              </div>

              <div>
                <FormLabel>GRM</FormLabel>
                <FormSelect
                  value={formData.fGramageId}
                  onChange={(e) => handleFGramageChange(e.target.value)}
                  className="w-full"
                >
                  <option value="">Select GRM</option>
                  {activeFGramages.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.grm}
                    </option>
                  ))}
                </FormSelect>
                {formErrors.fGramageId && <p className="text-sm text-red-500">{formErrors.fGramageId}</p>}
              </div>

              <div>
                <FormLabel>Colour</FormLabel>
                <FormSelect
                  value={formData.colourId}
                  onChange={(e) => handleColourChange(e.target.value)}
                  className="w-full"
                >
                  <option value="">Select Colour</option>
                  {activeColours.map((colour) => (
                    <option key={colour.id} value={colour.id}>
                      {colour.name}
                    </option>
                  ))}
                </FormSelect>
                {formErrors.colourId && <p className="text-sm text-red-500">{formErrors.colourId}</p>}
              </div>

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

              <div>
                <FormLabel>Attached File</FormLabel>
                <FormInput
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setAttachedFile(file);
                  }}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Existing attachment will be kept. Replacing the file during edit is not enabled in this save flow.
                </p>
                {attachedFile ? (
                  <p className="mt-1 text-sm text-slate-600">
                    Selected file: {attachedFile.name}
                  </p>
                ) : formData.attachedFile ? (
                  <p className="mt-1 text-sm text-slate-600">
                    Current file: {formData.attachedFile.split("/").pop()}
                  </p>
                ) : null}
              </div>
            </>
          </Dialog.Description>

          <Dialog.Footer>
            <Button variant="outline-secondary" className="w-24 mr-2" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" className="w-24" onClick={handleUpdate} disabled={!isFormReady}>
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
