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

const CreatePVCInwardList: React.FC<CreatePVCInwardListProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const token = localStorage.getItem("token");

  const initialState = {
    supplierId: "",
    PVCId: "",
    new_RollNo:"",
    batchNo: "",
    qty_kg: "",
    qty_Mtr: "",
    comments: "",
    billDate: "",
    receivedDate: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [suppliers, setSuppliers] = useState<SupplierOptions[]>([]);
  const [pvcOptions, setPVCOptions] = useState<PVCOptions[]>([]);

  const [suppliersLoaded, setSuppliersLoaded] = useState(false);
  const [pvcOptionsLoaded, setPVCOptionsLoaded] = useState(false);

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
        const response = await axios.get(
          `${BASE_URL}/api/pvcproductlist`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPVCOptions(response.data.items || []);
        setPVCOptionsLoaded(true);
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

  const clearForm = () => {
    setFormData(initialState);
    setFormErrors({});
  };

  // ================= HANDLE SUBMIT =================
  const handleSubmit = async () => {
    const errors: Record<string, string> = {};

    if (!formData.supplierId) errors.supplierId = "Supplier is required";
    if (!formData.PVCId) errors.PVCId = "PVC is required";
    if (!formData.new_RollNo) errors.new_RollNo = "New Roll No is required";
    if (!formData.batchNo) errors.batchNo = "Batch No is required";
    if (!formData.qty_kg) errors.qty_kg = "QTY (kg) is required";
    if (!formData.qty_Mtr) errors.qty_Mtr = "QTY (mtr) is required";
    if (!formData.comments) errors.comments = "Comments are required";
    if (!formData.billDate) errors.billDate = "Bill Date is required";
    if (!formData.receivedDate)
      errors.receivedDate = "Received Date is required";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        supplierMasterId: Number(formData.supplierId),
        PVCMasterId: Number(formData.PVCId),
        new_RollNo: formData.new_RollNo,
        batchNo: formData.batchNo,
        qty_kg: Number(formData.qty_kg),
        qty_Mtr: Number(formData.qty_Mtr),
        comments: formData.comments,
        billDate: formData.billDate,
        receivedDate: formData.receivedDate,
        isActive: 1,
      };

      // ⚠️ Ensure this endpoint matches your backend
      const response = await axios.post(
        `${BASE_URL}/api/pvcinward`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
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

            

            {/* Batch */}
            <div>
              <FormLabel>Batch No</FormLabel>
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

            {/* QTY KG */}
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

            {/* QTY MTR */}
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

            {/* Comments */}
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