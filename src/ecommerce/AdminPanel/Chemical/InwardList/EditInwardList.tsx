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

const isActiveItem = (value: number | boolean | null | undefined) =>
  value === 1 || value === true;

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
  const [isAddChemicalOpen, setIsAddChemicalOpen] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [quickChemicalData, setQuickChemicalData] = useState({
    chemicalName: "",
    type: "",
    comments: "",
  });
  const [quickSupplierData, setQuickSupplierData] = useState({
    Name: "",
    Address: "",
    mobile_No: "",
    PAN: "",
    gsT_No: "",
  });
  
  const [quickChemicalErrors, setQuickChemicalErrors] = useState<Record<string, string>>({});
  const [quickSupplierErrors, setQuickSupplierErrors] = useState<Record<string, string>>({});
  const [isSavingChemical, setIsSavingChemical] = useState(false);
  const [isSavingSupplier, setIsSavingSupplier] = useState(false);
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

  const fetchLists = async () => {
    try {
      setChemicalsLoaded(false);
      setSuppliersLoaded(false);
      const [chemicalRes, suppRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/chemical?page=1&size=1000`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${BASE_URL}/api/supplier?page=1&size=1000`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setChemicals((chemicalRes.data.items || []).filter((c: Chemical) => isActiveItem(c.isActive)));
      setSuppliers((suppRes.data.items || []).filter((s: Supplier) => isActiveItem(s.isActive)));
      setChemicalsLoaded(true);
      setSuppliersLoaded(true);
    } catch (error) {
      console.error("Error fetching chemicals or suppliers:", error);
    }
  };

  const fetchChemicals = async () => {
    try {
      setChemicalsLoaded(false);
      const response = await axios.get(`${BASE_URL}/api/chemical?page=1&size=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const items = (response.data.items || []).filter((c: Chemical) => isActiveItem(c.isActive));
      setChemicals(items);
      setChemicalsLoaded(true);
      return items as Chemical[];
    } catch (error) {
      console.error("Error fetching chemicals:", error);
      return [] as Chemical[];
    }
  };

  // Fetch chemicals and suppliers lists
  useEffect(() => {
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
        setAttachedFile(null);

        setFormErrors({});
      } catch (error) {
        console.error("Error fetching inward:", error);
      }
    };

    fetchInward();
  }, [open, InwardId, chemicals, suppliers, token]);

  const activeChemicals = useMemo(() => chemicals.filter((c) => isActiveItem(c.isActive)), [chemicals]);
  const activeSuppliers = useMemo(() => suppliers.filter((s) => isActiveItem(s.isActive)), [suppliers]);

  const handleChemicalChange = (value: string | number) => {
    setFormData((prev) => ({ ...prev, chemicalId: String(value) }));
    setFormErrors((prev) => ({ ...prev, ChemicalName: "" }));
  };

  const handleSupplierChange = (value: string | number) => {
    setFormData((prev) => ({ ...prev, supplierId: String(value) }));
    setFormErrors((prev) => ({ ...prev, Supplier: "" }));
  };

  const addChemicalToList = (chemical: Chemical) => {
    setChemicals((prev) => {
      const alreadyExists = prev.some(
        (item) =>
          item.id === chemical.id ||
          item.name.trim().toLowerCase() === chemical.name.trim().toLowerCase()
      );

      if (alreadyExists) return prev;
      return [...prev, chemical];
    });
    setChemicalsLoaded(true);
  };

  const addSupplierToList = (supplier: Supplier) => {
    setSuppliers((prev) => {
      const alreadyExists = prev.some(
        (item) =>
          item.id === supplier.id ||
          item.name.trim().toLowerCase() === supplier.name.trim().toLowerCase()
      );

      if (alreadyExists) return prev;
      return [...prev, supplier];
    });
    setSuppliersLoaded(true);
  };

  const handleQuickChemicalSave = async () => {
    const errors: Record<string, string> = {};
    if (!quickChemicalData.chemicalName.trim()) errors.chemicalName = "Chemical name is required";
    if (!quickChemicalData.type.trim()) errors.type = "Type is required";
    if (!quickChemicalData.comments.trim()) errors.comments = "Comments are required";

    setQuickChemicalErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setIsSavingChemical(true);

      const response = await axios.post(
        `${BASE_URL}/api/chemical`,
        {
          name: quickChemicalData.chemicalName.trim(),
          type: quickChemicalData.type.trim(),
          comment: quickChemicalData.comments.trim(),
          isActive: 1,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200 || response.status === 201) {
        const createdChemicalId = Number(
          response.data?.id ??
            response.data?.data?.id ??
            response.data?.chemicalId ??
            response.data?.chemicalMasterId
        );
        const createdChemicalName =
          response.data?.name ??
          response.data?.data?.name ??
          quickChemicalData.chemicalName.trim();

        if (createdChemicalId && createdChemicalName) {
          addChemicalToList({
            id: createdChemicalId,
            name: createdChemicalName,
            isActive: 1,
          });
        }

        void fetchChemicals();

        setQuickChemicalData({
          chemicalName: "",
          type: "",
          comments: "",
        });
        setQuickChemicalErrors({});
        setIsAddChemicalOpen(false);
      }
    } catch (error: any) {
      console.error("Chemical quick add error:", error);
      alert(error.response?.data?.detail || "Unable to create chemical");
    } finally {
      setIsSavingChemical(false);
    }
  };

  const handleQuickSupplierSave = async () => {
    const errors: Record<string, string> = {};
    if (!quickSupplierData.Name.trim()) errors.Name = "Supplier name is required";
    if (!quickSupplierData.Address.trim()) errors.Address = "Address is required";
    if (!quickSupplierData.mobile_No.trim()) errors.mobile_No = "Mobile No is required";
    if (!quickSupplierData.PAN.trim()) errors.PAN = "PAN is required";
    if (!quickSupplierData.gsT_No.trim()) errors.gsT_No = "GST No is required";

    setQuickSupplierErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setIsSavingSupplier(true);

      const response = await axios.post(
        `${BASE_URL}/api/supplier`,
        {
          Name: quickSupplierData.Name.trim(),
          Address: quickSupplierData.Address.trim(),
          mobile_No: quickSupplierData.mobile_No.trim(),
          PAN: quickSupplierData.PAN.trim(),
          gsT_No: quickSupplierData.gsT_No.trim(),
          isActive: 1,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200 || response.status === 201) {
        const createdSupplierId = Number(
          response.data?.id ??
            response.data?.data?.id ??
            response.data?.supplierId ??
            response.data?.supplierMasterId
        );
        const createdSupplierName =
          response.data?.name ??
          response.data?.Name ??
          response.data?.data?.name ??
          response.data?.data?.Name ??
          quickSupplierData.Name.trim();

        if (createdSupplierId && createdSupplierName) {
          addSupplierToList({
            id: createdSupplierId,
            name: createdSupplierName,
            isActive: 1,
          });
        }

        void fetchLists();

        setQuickSupplierData({
          Name: "",
          Address: "",
          mobile_No: "",
          PAN: "",
          gsT_No: "",
        });
        setQuickSupplierErrors({});
        setIsAddSupplierOpen(false);
      }
    } catch (error: any) {
      console.error("Supplier quick add error:", error);
      alert(error.response?.data?.detail || "Unable to create supplier");
    } finally {
      setIsSavingSupplier(false);
    }
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
              <div className="mb-1 flex items-center justify-between gap-2">
                <FormLabel>Chemical Name</FormLabel>
                <Button
                  type="button"
                  variant="outline-primary"
                  className="h-8 px-3"
                  onClick={() => setIsAddChemicalOpen((prev) => !prev)}
                >
                  +
                </Button>
              </div>
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

              {isAddChemicalOpen && (
                <div className="mt-4 rounded-md border border-slate-200 p-4">
                  <p className="mb-3 text-sm font-medium">Create New Chemical</p>

                  <div className="space-y-3">
                    <div>
                      <FormLabel>Chemical Name</FormLabel>
                      <FormInput
                        type="text"
                        placeholder="Enter Chemical Name"
                        value={quickChemicalData.chemicalName}
                        onChange={(e) => {
                          const value = e.target.value;
                          setQuickChemicalData((prev) => ({ ...prev, chemicalName: value }));
                          if (value.trim()) {
                            setQuickChemicalErrors((prev) => ({ ...prev, chemicalName: "" }));
                          }
                        }}
                      />
                      {quickChemicalErrors.chemicalName && (
                        <p className="text-sm text-red-500">{quickChemicalErrors.chemicalName}</p>
                      )}
                    </div>

                    <div>
                      <FormLabel>Type</FormLabel>
                      <FormInput
                        type="text"
                        placeholder="Enter Type"
                        value={quickChemicalData.type}
                        onChange={(e) => {
                          const value = e.target.value;
                          setQuickChemicalData((prev) => ({ ...prev, type: value }));
                          if (value.trim()) {
                            setQuickChemicalErrors((prev) => ({ ...prev, type: "" }));
                          }
                        }}
                      />
                      {quickChemicalErrors.type && (
                        <p className="text-sm text-red-500">{quickChemicalErrors.type}</p>
                      )}
                    </div>

                    <div>
                      <FormLabel>Comments</FormLabel>
                      <FormInput
                        type="text"
                        placeholder="Enter Comments"
                        value={quickChemicalData.comments}
                        onChange={(e) => {
                          const value = e.target.value;
                          setQuickChemicalData((prev) => ({ ...prev, comments: value }));
                          if (value.trim()) {
                            setQuickChemicalErrors((prev) => ({ ...prev, comments: "" }));
                          }
                        }}
                      />
                      {quickChemicalErrors.comments && (
                        <p className="text-sm text-red-500">{quickChemicalErrors.comments}</p>
                      )}
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline-secondary"
                        onClick={() => setIsAddChemicalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        onClick={handleQuickChemicalSave}
                        disabled={isSavingChemical}
                      >
                        {isSavingChemical ? "Saving..." : "Save Chemical"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
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
              <div className="mb-1 flex items-center justify-between gap-2">
                <FormLabel>Supplier</FormLabel>
                <Button
                  type="button"
                  variant="outline-primary"
                  className="h-8 px-3"
                  onClick={() => setIsAddSupplierOpen((prev) => !prev)}
                >
                  +
                </Button>
              </div>
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

              {isAddSupplierOpen && (
                <div className="mt-4 rounded-md border border-slate-200 p-4">
                  <p className="mb-3 text-sm font-medium">Create New Supplier</p>

                  <div className="space-y-3">
                    <div>
                      <FormLabel>Supplier Name</FormLabel>
                      <FormInput
                        type="text"
                        placeholder="Enter Supplier Name"
                        value={quickSupplierData.Name}
                        onChange={(e) => {
                          const value = e.target.value;
                          setQuickSupplierData((prev) => ({ ...prev, Name: value }));
                          if (value.trim()) {
                            setQuickSupplierErrors((prev) => ({ ...prev, Name: "" }));
                          }
                        }}
                      />
                      {quickSupplierErrors.Name && (
                        <p className="text-sm text-red-500">{quickSupplierErrors.Name}</p>
                      )}
                    </div>

                    <div>
                      <FormLabel>Address</FormLabel>
                      <FormInput
                        type="text"
                        placeholder="Enter Address"
                        value={quickSupplierData.Address}
                        onChange={(e) => {
                          const value = e.target.value;
                          setQuickSupplierData((prev) => ({ ...prev, Address: value }));
                          if (value.trim()) {
                            setQuickSupplierErrors((prev) => ({ ...prev, Address: "" }));
                          }
                        }}
                      />
                      {quickSupplierErrors.Address && (
                        <p className="text-sm text-red-500">{quickSupplierErrors.Address}</p>
                      )}
                    </div>

                    <div>
                      <FormLabel>Mobile No</FormLabel>
                      <FormInput
                        type="text"
                        placeholder="Enter Mobile No"
                        value={quickSupplierData.mobile_No}
                        onChange={(e) => {
                          const value = e.target.value;
                          setQuickSupplierData((prev) => ({ ...prev, mobile_No: value }));
                          if (value.trim()) {
                            setQuickSupplierErrors((prev) => ({ ...prev, mobile_No: "" }));
                          }
                        }}
                      />
                      {quickSupplierErrors.mobile_No && (
                        <p className="text-sm text-red-500">{quickSupplierErrors.mobile_No}</p>
                      )}
                    </div>

                    <div>
                      <FormLabel>PAN</FormLabel>
                      <FormInput
                        type="text"
                        placeholder="Enter PAN"
                        value={quickSupplierData.PAN}
                        onChange={(e) => {
                          const value = e.target.value;
                          setQuickSupplierData((prev) => ({ ...prev, PAN: value }));
                          if (value.trim()) {
                            setQuickSupplierErrors((prev) => ({ ...prev, PAN: "" }));
                          }
                        }}
                      />
                      {quickSupplierErrors.PAN && (
                        <p className="text-sm text-red-500">{quickSupplierErrors.PAN}</p>
                      )}
                    </div>

                    <div>
                      <FormLabel>GST No</FormLabel>
                      <FormInput
                        type="text"
                        placeholder="Enter GST No"
                        value={quickSupplierData.gsT_No}
                        onChange={(e) => {
                          const value = e.target.value;
                          setQuickSupplierData((prev) => ({ ...prev, gsT_No: value }));
                          if (value.trim()) {
                            setQuickSupplierErrors((prev) => ({ ...prev, gsT_No: "" }));
                          }
                        }}
                      />
                      {quickSupplierErrors.gsT_No && (
                        <p className="text-sm text-red-500">{quickSupplierErrors.gsT_No}</p>
                      )}
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline-secondary"
                        onClick={() => setIsAddSupplierOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        onClick={handleQuickSupplierSave}
                        disabled={isSavingSupplier}
                      >
                        {isSavingSupplier ? "Saving..." : "Save Supplier"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Batch No */}
            <div>
              <FormLabel>Invoice No</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter Invoice No"
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
                Optional field. You can update the form without selecting a file.
              </p>
              {attachedFile && (
                <p className="mt-1 text-sm text-slate-600">
                  Selected file: {attachedFile.name}
                </p>
              )}
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
