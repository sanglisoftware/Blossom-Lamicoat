import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config";
import { useEffect, useState, useMemo } from "react";
import SuccessModal from "../../CommonModals/SuccessModal/SuccessModal";
import { SuccessModalConfig } from "../../CommonModals/SuccessModal/SuccessModalConfig";
import TomSelect from "@/components/Base/TomSelect";

interface CreatePVCInwardListProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface SupplierOptions {
  id: number;
  name: string;
  isActive: number;
}

interface PVCOptions {
  id: number;
  name: string;
  isActive: number;
}

interface GramageOption {
  id: number;
  grm: string;
  isActive: number;
}

interface WidthOption {
  id: number;
  grm: string;
  isActive: number;
}

interface ColourOption {
  id: number;
  name: string;
  isActive: number;
}

const CreatePVCInwardList: React.FC<CreatePVCInwardListProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const token = localStorage.getItem("token");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const initialState = {
    supplierId: "",
    PVCId: "",
    new_RollNo:"",
    batchNo: "",
    qty_kg: "",
    qty_Mtr: "",
    comments: "",
    gramageMasterId: "",
    widthMasterId: "",
    colourMasterId: "",
    billDate: "",
    receivedDate: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [suppliers, setSuppliers] = useState<SupplierOptions[]>([]);
  const [pvcOptions, setPVCOptions] = useState<PVCOptions[]>([]);
  const [gramageOptions, setGramageOptions] = useState<GramageOption[]>([]);
  const [widthOptions, setWidthOptions] = useState<WidthOption[]>([]);
  const [colourOptions, setColourOptions] = useState<ColourOption[]>([]);

  const [suppliersLoaded, setSuppliersLoaded] = useState(false);
  const [pvcOptionsLoaded, setPVCOptionsLoaded] = useState(false);
  const [gramageLoaded, setGramageLoaded] = useState(false);
  const [widthLoaded, setWidthLoaded] = useState(false);
  const [colourLoaded, setColourLoaded] = useState(false);

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalConfig, setSuccessModalConfig] =
    useState<SuccessModalConfig>({
      title: "",
      subtitle: "",
      icon: "CheckCircle",
      buttonText: "OK",
      onButtonClick: () => {},
    });

  // ================= FETCH PVC PRODUCTS =================
  useEffect(() => {
    if (!open) return;

    const fetchPVC = async () => {
      try {
        setPVCOptionsLoaded(false);
        setGramageLoaded(false);
        setWidthLoaded(false);
        setColourLoaded(false);

        const [pvcResponse, gramageResponse, widthResponse, colourResponse] = await Promise.all([
          axios.get(`${BASE_URL}/api/pvcproductlist`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/api/gramage`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/api/width`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/api/colour`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setPVCOptions(pvcResponse.data.items || []);
        setGramageOptions(gramageResponse.data.items || []);
        setWidthOptions(widthResponse.data.items || []);
        setColourOptions(colourResponse.data.items || []);
        setPVCOptionsLoaded(true);
        setGramageLoaded(true);
        setWidthLoaded(true);
        setColourLoaded(true);
      } catch (error) {
        console.error("Error fetching PVC:", error);
      }
    };

    fetchPVC();
  }, [open, token]);

  // ================= FETCH SUPPLIERS =================
  useEffect(() => {
    if (!open) return;

    const fetchSuppliers = async () => {
      try {
        setSuppliersLoaded(false);
        const response = await axios.get(
          `${BASE_URL}/api/supplier`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSuppliers(response.data.items || []);
        setSuppliersLoaded(true);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };

    fetchSuppliers();
  }, [open, token]);

  const activeSuppliers = useMemo(
    () => suppliers.filter((s) => s.isActive === 1),
    [suppliers]
  );

  const activePVC = useMemo(
    () => pvcOptions.filter((p) => p.isActive === 1),
    [pvcOptions]
  );

  const activeGramages = useMemo(
    () => gramageOptions.filter((g) => g.isActive === 1),
    [gramageOptions]
  );

  const activeWidths = useMemo(
    () => widthOptions.filter((w) => w.isActive === 1),
    [widthOptions]
  );

  const activeColours = useMemo(
    () => colourOptions.filter((c) => c.isActive === 1),
    [colourOptions]
  );

  const clearForm = () => {
    setFormData(initialState);
    setFormErrors({});
    setAttachedFile(null);
  };

  // ================= HANDLE SUBMIT =================
  const handleSubmit = async () => {
    const errors: Record<string, string> = {};

    if (!formData.supplierId) errors.supplierId = "Supplier is required";
    if (!formData.PVCId) errors.PVCId = "PVC is required";
    if (!formData.new_RollNo) errors.new_RollNo = "New Roll No is required";
    if (!formData.batchNo) errors.batchNo = "Invoice No is required";
    if (!formData.qty_kg) errors.qty_kg = "QTY (kg) is required";
    if (!formData.qty_Mtr) errors.qty_Mtr = "QTY (mtr) is required";
    if (!formData.comments) errors.comments = "Comments are required";
    if (!formData.gramageMasterId) errors.gramageMasterId = "Gramage is required";
    if (!formData.widthMasterId) errors.widthMasterId = "Width is required";
    if (!formData.colourMasterId) errors.colourMasterId = "Colour is required";
    if (!formData.billDate) errors.billDate = "Bill Date is required";
    if (!formData.receivedDate)
      errors.receivedDate = "Received Date is required";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const selectedGramage = activeGramages.find((g) => String(g.id) === formData.gramageMasterId);
      const selectedWidth = activeWidths.find((w) => String(w.id) === formData.widthMasterId);
      const selectedColour = activeColours.find((c) => String(c.id) === formData.colourMasterId);

      const payload = new FormData();
      payload.append("supplierMasterId", String(Number(formData.supplierId)));
      payload.append("pvcMasterId", String(Number(formData.PVCId)));
      payload.append("new_RollNo", formData.new_RollNo);
      payload.append("batchNo", formData.batchNo);
      payload.append("qty_kg", String(Number(formData.qty_kg)));
      payload.append("qty_Mtr", String(Number(formData.qty_Mtr)));
      payload.append("comments", formData.comments);
      payload.append("gramageMasterId", String(Number(formData.gramageMasterId)));
      payload.append("gramageName", selectedGramage?.grm || "");
      payload.append("widthMasterId", String(Number(formData.widthMasterId)));
      payload.append("widthName", selectedWidth?.grm || "");
      payload.append("colourMasterId", String(Number(formData.colourMasterId)));
      payload.append("colourName", selectedColour?.name || "");
      payload.append("billDate", formData.billDate);
      payload.append("receivedDate", formData.receivedDate);
      payload.append("isActive", "1");

      if (attachedFile) {
        payload.append("attachedFile", attachedFile);
      }

      const response = await axios.post(
        `${BASE_URL}/api/pvcinward`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        clearForm();
        onClose();

        setSuccessModalConfig({
          title: "Inward Created Successfully",
          subtitle: "The new inward has been added to the system.",
          icon: "CheckCircle",
          buttonText: "OK",
          onButtonClick: () => setIsSuccessModalOpen(false),
        });

        setIsSuccessModalOpen(true);
        onSuccess();
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      alert(error.response?.data?.detail || "Something went wrong");
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} staticBackdrop size="md">
        <Dialog.Panel>
          <Dialog.Title>
            <h2 className="text-base font-medium">
              Create New PVC Inward
            </h2>
          </Dialog.Title>

          <Dialog.Description className="space-y-4">

            {/* Supplier */}
            <div>
              <FormLabel>Supplier</FormLabel>
              {suppliersLoaded ? (
                <TomSelect
                  value={formData.supplierId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      supplierId: e.target.value,
                    })
                  }
                  options={{
                    placeholder: "Select Supplier",
                    allowEmptyOption: true,
                  }}
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
                <p className="text-gray-500 text-sm">
                  Loading suppliers...
                </p>
              )}
              {formErrors.supplierId && (
                <p className="text-red-500 text-sm">
                  {formErrors.supplierId}
                </p>
              )}
            </div>

            {/* PVC */}
            <div>
              <FormLabel>PVC</FormLabel>
              {pvcOptionsLoaded ? (
                <TomSelect
                  value={formData.PVCId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      PVCId: e.target.value,
                    })
                  }
                  options={{
                    placeholder: "Select PVC",
                    allowEmptyOption: true,
                  }}
                  className="w-full"
                >
                  <option value="">Select PVC</option>
                  {activePVC.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </TomSelect>
              ) : (
                <p className="text-gray-500 text-sm">
                  Loading PVC...
                </p>
              )}
              {formErrors.PVCId && (
                <p className="text-red-500 text-sm">
                  {formErrors.PVCId}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

              <div>
                <FormLabel>Invoice No</FormLabel>
                <FormInput
                  type="text"
                  value={formData.batchNo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      batchNo: e.target.value,
                    })
                  }
                />
                {formErrors.batchNo && (
                  <p className="text-red-500 text-sm">
                    {formErrors.batchNo}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <FormLabel>QTY (kg)</FormLabel>
                <FormInput
                  type="number"
                  value={formData.qty_kg}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      qty_kg: e.target.value,
                    })
                  }
                />
                {formErrors.qty_kg && (
                  <p className="text-red-500 text-sm">
                    {formErrors.qty_kg}
                  </p>
                )}
              </div>

              <div>
                <FormLabel>QTY (MTR)</FormLabel>
                <FormInput
                  type="number"
                  value={formData.qty_Mtr}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      qty_Mtr: e.target.value,
                    })
                  }
                />
                {formErrors.qty_Mtr && (
                  <p className="text-red-500 text-sm">
                    {formErrors.qty_Mtr}
                  </p>
                )}
              </div>
            </div>

            {/* Comments */}
            <div>
              <FormLabel>Gramage</FormLabel>
              {gramageLoaded ? (
                <TomSelect
                  value={formData.gramageMasterId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gramageMasterId: e.target.value,
                    })
                  }
                  options={{ placeholder: "Select Gramage", allowEmptyOption: true }}
                  className="w-full"
                >
                  <option value="">Select Gramage</option>
                  {activeGramages.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.grm}
                    </option>
                  ))}
                </TomSelect>
              ) : (
                <p className="text-gray-500 text-sm">Loading gramage...</p>
              )}
              {formErrors.gramageMasterId && (
                <p className="text-red-500 text-sm">{formErrors.gramageMasterId}</p>
              )}
            </div>

            <div>
              <FormLabel>Width</FormLabel>
              {widthLoaded ? (
                <TomSelect
                  value={formData.widthMasterId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      widthMasterId: e.target.value,
                    })
                  }
                  options={{ placeholder: "Select Width", allowEmptyOption: true }}
                  className="w-full"
                >
                  <option value="">Select Width</option>
                  {activeWidths.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.grm}
                    </option>
                  ))}
                </TomSelect>
              ) : (
                <p className="text-gray-500 text-sm">Loading width...</p>
              )}
              {formErrors.widthMasterId && (
                <p className="text-red-500 text-sm">{formErrors.widthMasterId}</p>
              )}
            </div>

            <div>
              <FormLabel>Colour</FormLabel>
              {colourLoaded ? (
                <TomSelect
                  value={formData.colourMasterId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      colourMasterId: e.target.value,
                    })
                  }
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
                <p className="text-gray-500 text-sm">Loading colour...</p>
              )}
              {formErrors.colourMasterId && (
                <p className="text-red-500 text-sm">{formErrors.colourMasterId}</p>
              )}
            </div>

            <div>
              <FormLabel>Comments</FormLabel>
              <FormInput
                type="text"
                value={formData.comments}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    comments: e.target.value,
                  })
                }
              />
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

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormLabel>Bill Date</FormLabel>
                <FormInput
                  type="date"
                  value={formData.billDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      billDate: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <FormLabel>Received Date</FormLabel>
                <FormInput
                  type="date"
                  value={formData.receivedDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      receivedDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>

          </Dialog.Description>

          <Dialog.Footer>
            <Button
              type="button"
              variant="secondary"
              className="w-24 mr-2"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="primary"
              className="w-24"
              onClick={handleSubmit}
            >
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

export default CreatePVCInwardList;
