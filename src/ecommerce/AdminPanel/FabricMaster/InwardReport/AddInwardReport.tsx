
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config";
import { useEffect, useState, useMemo } from "react";
import SuccessModal from "../../CommonModals/SuccessModal/SuccessModal";
import { SuccessModalConfig } from "../../CommonModals/SuccessModal/SuccessModalConfig";
import TomSelect from "@/components/Base/TomSelect";

interface AddInwardReportProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface SupplierOptions {
  id: number;
  name: string;
  isActive: number;
}

interface FabricOptions {
  id: number;
  name: string;
  isActive: number;
}

interface ColourOptions {
  id: number;
  name: string;
  isActive: number;
}

interface FGramageOptions {
  id: number;
  grm: string;
  isActive: number;
}

const AddInwardReport: React.FC<AddInwardReportProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    supplierId: "",
    fabricId: "",
    fGramageId: "",
    colourId: "",
    BatchNo: "",
    QTYMTR: "",
   Comments:"",
  });
  const [suppliers, setSuppliers] = useState<SupplierOptions[]>([]);
  const [Fabric, setFabric] = useState<FabricOptions[]>([]);
  const [colours, setColours] = useState<ColourOptions[]>([]);
  const [fGramages, setFGramages] = useState<FGramageOptions[]>([]);

  const [suppliersLoaded, setSuppliersLoaded] = useState(false);
  const [fabricLoaded, setFabricLoaded] = useState(false);
  const [coloursLoaded, setColoursLoaded] = useState(false);
  const [fGramagesLoaded, setFGramagesLoaded] = useState(false);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalConfig, setSuccessModalConfig] =
    useState<SuccessModalConfig>({
      title: "",
      subtitle: "",
      icon: "CheckCircle",
      buttonText: "OK",
      onButtonClick: () => {},
    });


      // Fetch Suppliers
  useEffect(() => {
    if (!open) return;
    const fetchSuppliers = async () => {
      try {
        setSuppliersLoaded(false);
        const response = await axios.get(`${BASE_URL}/api/supplier`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuppliers(response.data.items || []);
        setSuppliersLoaded(true);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };
    fetchSuppliers();
  }, [open, token]);

  // Fetch Fabric
  useEffect(() => {
    if (!open) return;
    const fetchFabric = async () => {
      try {
        setFabricLoaded(false);
        const response = await axios.get(`${BASE_URL}/api/fproductlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFabric(response.data.items || []);
        setFabricLoaded(true);
      } catch (error) {
        console.error("Error fetching fabric:", error);
      }
    };
    fetchFabric();
  }, [open, token]);

  useEffect(() => {
    if (!open) return;
    const fetchColours = async () => {
      try {
        setColoursLoaded(false);
        const response = await axios.get(`${BASE_URL}/api/colour`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setColours(response.data.items || []);
        setColoursLoaded(true);
      } catch (error) {
        console.error("Error fetching colours:", error);
      }
    };
    fetchColours();
  }, [open, token]);

  useEffect(() => {
    if (!open) return;
    const fetchFGramages = async () => {
      try {
        setFGramagesLoaded(false);
        const response = await axios.get(`${BASE_URL}/api/fgramage`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFGramages(response.data.items || []);
        setFGramagesLoaded(true);
      } catch (error) {
        console.error("Error fetching fabric gramages:", error);
      }
    };
    fetchFGramages();
  }, [open, token]);

  useEffect(() => {
    if (!open) {
      clearFormData();
      setAttachedFile(null);
      setFormErrors({});
    }
  }, [open]);



  const clearFormData = () =>
    setFormData({
      supplierId: "",
      fabricId: "",
      fGramageId: "",
      colourId: "",
      BatchNo: "",
      QTYMTR: "",
      Comments:"",
    });

  // Memoized active chemicals/suppliers
  const activeFabric = useMemo(
    () => Fabric.filter((c) => c.isActive === 1),
    [Fabric]
  );
  const activeSuppliers = useMemo(
    () => suppliers.filter((s) => s.isActive === 1),
    [suppliers]
  );
  const activeColours = useMemo(
    () => colours.filter((c) => c.isActive === 1),
    [colours]
  );
  const activeFGramages = useMemo(
    () => fGramages.filter((g) => g.isActive === 1),
    [fGramages]
  );

  const handleFabricChange = (value: string | number) => {
    setFormData((prev) => ({ ...prev, fabricId: String(value) }));
  };

  const handleSupplierChange = (value: string | number) => {
    setFormData((prev) => ({ ...prev, supplierId: String(value) }));
  };

  const handleColourChange = (value: string | number) => {
    setFormData((prev) => ({ ...prev, colourId: String(value) }));
  };

  const handleFGramageChange = (value: string | number) => {
    setFormData((prev) => ({ ...prev, fGramageId: String(value) }));
  };

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};
    if (!formData.supplierId) errors.supplierId = "Supplier is required";
    if (!formData.fabricId) errors.fabricId = "Fabric is required";
    if (!formData.fGramageId) errors.fGramageId = "GRM is required";
    if (!formData.colourId) errors.colourId = "Colour is required";
    if (!formData.BatchNo) errors.BatchNo = "BatchNo is required";
    if (!formData.QTYMTR) errors.QTYMTR = "QTY is required";
    if (!formData.Comments) errors.Comments = "Comments is required";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const jsonPayload = {
        supplierMasterId: Number(formData.supplierId),
        fabricMasterId: Number(formData.fabricId),
        fGramageMasterId: Number(formData.fGramageId),
        colourMasterId: Number(formData.colourId),
        batchNo: Number(formData.BatchNo),
        qtyMTR: Number(formData.QTYMTR),
        comments: formData.Comments,
        attachedFile: "",
        isActive: 1,
      };

      const response = attachedFile
        ? await axios.post(
            `${BASE_URL}/api/fabricinward`,
            (() => {
              const payload = new FormData();
              payload.append("supplierMasterId", String(Number(formData.supplierId)));
              payload.append("fabricMasterId", String(Number(formData.fabricId)));
              payload.append("fGramageMasterId", String(Number(formData.fGramageId)));
              payload.append("colourMasterId", String(Number(formData.colourId)));
              payload.append("batchNo", formData.BatchNo);
              payload.append("qtyMTR", String(Number(formData.QTYMTR)));
              payload.append("comments", formData.Comments);
              payload.append("isActive", "1");
              payload.append("attachedFile", attachedFile);
              return payload;
            })(),
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
        : await axios.post(`${BASE_URL}/api/fabricinward`, jsonPayload, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

      if (response.status === 200 || response.status === 201) {
        clearFormData();
        setAttachedFile(null);
        setFormErrors({});
        onClose();

        setSuccessModalConfig({
          title: "Inward Created Successfully",
          subtitle: "The new Inward has been added to the system.",
          icon: "CheckCircle",
          buttonText: "OK",
          onButtonClick: () => setIsSuccessModalOpen(false),
        });

        setIsSuccessModalOpen(true);
        onSuccess();
      }
    } catch (error: any) {
      console.error("Inward submit error:", error);
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
            <h2 className="text-base font-medium">Create New Inward</h2>
          </Dialog.Title>

          <Dialog.Description className="space-y-4">


                {/* Supplier Dropdown */}
            <div>
              <FormLabel>Suppliers</FormLabel>
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

            {/* Chemical Dropdown */}
            <div>
              <FormLabel>Fabric</FormLabel>  
              {fabricLoaded ? (
                <TomSelect
                  value={formData.fabricId}
                  onChange={(e) => handleFabricChange(e.target.value)}
                  options={{ placeholder: "Select Fabric", allowEmptyOption: true }}
                  className="w-full"
                >
                  <option value="">Select Fabric</option>
                  {activeFabric.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </TomSelect>
              ) : (
                <p className="text-gray-500 text-sm">Loading fabrics...</p>
              )}
              {formErrors.fabricId && <p className="text-red-500 text-sm">{formErrors.fabricId}</p>}
            </div>

            <div>
              <FormLabel>GRM</FormLabel>
              {fGramagesLoaded ? (
                <TomSelect
                  value={formData.fGramageId}
                  onChange={(e) => handleFGramageChange(e.target.value)}
                  options={{ placeholder: "Select GRM", allowEmptyOption: true }}
                  className="w-full"
                >
                  <option value="">Select GRM</option>
                  {activeFGramages.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.grm}
                    </option>
                  ))}
                </TomSelect>
              ) : (
                <p className="text-gray-500 text-sm">Loading GRM...</p>
              )}
              {formErrors.fGramageId && <p className="text-red-500 text-sm">{formErrors.fGramageId}</p>}
            </div>

            <div>
              <FormLabel>Colour</FormLabel>
              {coloursLoaded ? (
                <TomSelect
                  value={formData.colourId}
                  onChange={(e) => handleColourChange(e.target.value)}
                  options={{ placeholder: "Select Colour", allowEmptyOption: true }}
                  className="w-full"
                >
                  <option value="">Select Colour</option>
                  {activeColours.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </TomSelect>
              ) : (
                <p className="text-gray-500 text-sm">Loading colours...</p>
              )}
              {formErrors.colourId && <p className="text-red-500 text-sm">{formErrors.colourId}</p>}
            </div>

            {/* QTY */}
            <div>
              <FormLabel>QTY in MTR</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter QTY"
                value={formData.QTYMTR}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, QTYMTR: value });
                  if (value.trim()) setFormErrors((prev) => ({ ...prev, QTYMTR: "" }));
                }}
              />
              {formErrors.QTYMTR && <p className="text-red-500 text-sm">{formErrors.QTYMTR}</p>}
            </div>

        

            {/* BatchNo */}
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
              {formErrors.BatchNo && <p className="text-red-500 text-sm">{formErrors.BatchNo}</p>}
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
              {formErrors.Comments && <p className="text-red-500 text-sm">{formErrors.Comments}</p>}
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
              {attachedFile && (
                <p className="mt-1 text-sm text-slate-600">
                  Selected file: {attachedFile.name}
                </p>
              )}
            </div>
          </Dialog.Description>

          <Dialog.Footer>
            <Button type="button" variant="secondary" className="w-24 mr-2" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" variant="primary" className="w-24" onClick={handleSubmit}>
              Add
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

export default AddInwardReport;
