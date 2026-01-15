import { useEffect, useState } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";

interface PVCInward {
  id: number;
  fabric: string;
  qty: string;
  batchNo: string;
  comments: string;
}

interface EditInwardReportProps {
  open: boolean;
  onClose: () => void;
  PVCProductData: PVCInward | null;
  onUpdatePVCProduct: (data: PVCInward) => void;
}

const EditInwardReport = ({
  open,
  onClose,
  PVCProductData,
  onUpdatePVCProduct,
}: EditInwardReportProps) => {
  const [formData, setFormData] = useState<PVCInward>({
    id: 0,
    fabric: "",
    qty: "",
    batchNo: "",
    comments: "",
  });

  // Load data when modal opens
  useEffect(() => {
    if (PVCProductData) {
      setFormData(PVCProductData);
    }
  }, [PVCProductData]);

  const handleChange = (field: keyof PVCInward, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdate = () => {
    if (!formData.fabric || !formData.qty || !formData.batchNo) return;

    onUpdatePVCProduct(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} staticBackdrop size="md">
      <Dialog.Panel>
        <Dialog.Title>
          <h2 className="text-base font-medium">Edit PVC Inward</h2>
        </Dialog.Title>

        <Dialog.Description className="space-y-4">
          <div>
            <FormLabel>Fabric</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter fabric"
              value={formData.fabric}
              onChange={(e) =>
                handleChange("fabric", e.target.value)
              }
            />
          </div>

          <div>
            <FormLabel>Quantity</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter quantity"
              value={formData.qty}
              onChange={(e) =>
                handleChange("qty", e.target.value)
              }
            />
          </div>

          <div>
            <FormLabel>Batch No</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter batch number"
              value={formData.batchNo}
              onChange={(e) =>
                handleChange("batchNo", e.target.value)
              }
            />
          </div>

          <div>
            <FormLabel>Comments</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter comments"
              value={formData.comments}
              onChange={(e) =>
                handleChange("comments", e.target.value)
              }
            />
          </div>
        </Dialog.Description>

        <Dialog.Footer>
          <Button
            variant="outline-secondary"
            className="w-24 mr-2"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            className="w-24"
            onClick={handleUpdate}
          >
            Update
          </Button>
        </Dialog.Footer>
      </Dialog.Panel>
    </Dialog>
  );
};

export default EditInwardReport;
