
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config";
import { useEffect, useState, useMemo } from "react";
import SuccessModal from "../../CommonModals/SuccessModal/SuccessModal";
import { SuccessModalConfig } from "../../CommonModals/SuccessModal/SuccessModalConfig";
import TomSelect from "@/components/Base/TomSelect";

interface AddInwardListProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ChemicalOptions {
  id: number;
  name: string;
  isActive: number;
}

interface SupplierOptions {
  id: number;
  name: string;
  isActive: number;
}

const AddInwardList: React.FC<AddInwardListProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    chemicalId: "",
    QTY: "",
    supplierId: "",
    BatchNo: "",
    BillDate: "",
    ReceivedDate: "",
  });

  const [chemicals, setChemicals] = useState<ChemicalOptions[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOptions[]>([]);

  const [chemicalsLoaded, setChemicalsLoaded] = useState(false);
  const [suppliersLoaded, setSuppliersLoaded] = useState(false);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalConfig, setSuccessModalConfig] =
    useState<SuccessModalConfig>({
      title: "",
      subtitle: "",
      icon: "CheckCircle",
      buttonText: "OK",
      onButtonClick: () => {},
    });

  // Fetch Chemicals
  useEffect(() => {
    if (!open) return;
    const fetchChemicals = async () => {
      try {
        setChemicalsLoaded(false);
        const response = await axios.get(`${BASE_URL}/api/chemical`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChemicals(response.data.items || []);
        setChemicalsLoaded(true);
      } catch (error) {
        console.error("Error fetching chemicals:", error);
      }
    };
    fetchChemicals();
  }, [open, token]);

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

  const clearFormData = () =>
    setFormData({
      chemicalId: "",
      QTY: "",
      supplierId: "",
      BatchNo: "",
      BillDate: "",
      ReceivedDate: "",
    });

  // Memoized active chemicals/suppliers
  const activeChemicals = useMemo(
    () => chemicals.filter((c) => c.isActive === 1),
    [chemicals]
  );
  const activeSuppliers = useMemo(
    () => suppliers.filter((s) => s.isActive === 1),
    [suppliers]
  );

  const handleChemicalChange = (value: string | number) => {
    setFormData((prev) => ({ ...prev, chemicalId: String(value) }));
  };

  const handleSupplierChange = (value: string | number) => {
    setFormData((prev) => ({ ...prev, supplierId: String(value) }));
  };

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};
    if (!formData.chemicalId) errors.chemicalId = "Chemical is required";
    if (!formData.QTY) errors.QTY = "QTY is required";
    if (!formData.supplierId) errors.supplierId = "Supplier is required";
    if (!formData.BatchNo) errors.BatchNo = "BatchNo is required";
    if (!formData.BillDate) errors.BillDate = "Bill Date is required";
    if (!formData.ReceivedDate) errors.ReceivedDate = "Received Date is required";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        chemicalMasterId: Number(formData.chemicalId),
        qty: Number(formData.QTY),
        supplierMasterId: Number(formData.supplierId),
        batchNo: Number(formData.BatchNo),
        billDate: formData.BillDate,
        receivedDate: formData.ReceivedDate,
        isActive: 1,
      };

      const response = await axios.post(`${BASE_URL}/api/chemicalinward`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 || response.status === 201) {
        clearFormData();
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
      alert(error.response?.data?.detail || "Something went wrong");
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

            {/* Chemical Dropdown */}
            <div>
              <FormLabel>Chemicals</FormLabel>
              {chemicalsLoaded ? (
                <TomSelect
                  value={formData.chemicalId}
                  onChange={(e) => handleChemicalChange(e.target.value)}
                  options={{ placeholder: "Select Chemical", allowEmptyOption: true }}
                  className="w-full"
                >
                  <option value="">Select Chemical</option>
                  {activeChemicals.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </TomSelect>
              ) : (
                <p className="text-gray-500 text-sm">Loading chemicals...</p>
              )}
              {formErrors.chemicalId && <p className="text-red-500 text-sm">{formErrors.chemicalId}</p>}
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
              {formErrors.QTY && <p className="text-red-500 text-sm">{formErrors.QTY}</p>}
            </div>

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

export default AddInwardList;
