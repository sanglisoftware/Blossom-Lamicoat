import { useState, useEffect } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";

interface Props {
  open: boolean;
  onClose: () => void;
  data: any;
  onUpdate: (data: any) => void;
}

const EditPVCInward: React.FC<Props> = ({ open, onClose, data, onUpdate }) => {
  const [form, setForm] = useState({
    id: 0,
    supplier: "",
    pvc: "",
    newRollNo: "",
    batchNo: "",
    qtyKG: "",
    qtyMTR: "",
    comments: "",
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleUpdate = () => {
    let tempErrors: any = {};
    if (!form.supplier) tempErrors.supplier = "Supplier is required";
    if (!form.pvc) tempErrors.pvc = "PVC is required";
    if (!form.newRollNo) tempErrors.newRollNo = "New Roll No is required";
    if (!form.batchNo) tempErrors.batchNo = "Batch No is required";
    if (!form.qtyKG) tempErrors.qtyKG = "QTY KG is required";
    if (!form.qtyMTR) tempErrors.qtyMTR = "QTY MTR is required";

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    onUpdate(form);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} staticBackdrop size="md">
      <Dialog.Panel>
        <Dialog.Title>
          <h2 className="text-base font-medium">Edit PVC Inward</h2>
        </Dialog.Title>

        <Dialog.Description className="space-y-3">
          <div>
            <FormLabel>Supplier</FormLabel>
            <FormInput
              name="supplier"
              value={form.supplier}
              onChange={handleChange}
              className={errors.supplier ? "border-danger" : ""}
            />
            {errors.supplier && <p className="text-danger text-sm">{errors.supplier}</p>}
          </div>

          <div>
            <FormLabel>PVC</FormLabel>
            <FormInput
              name="pvc"
              value={form.pvc}
              onChange={handleChange}
              className={errors.pvc ? "border-danger" : ""}
            />
            {errors.pvc && <p className="text-danger text-sm">{errors.pvc}</p>}
          </div>

          <div>
            <FormLabel>New Roll No</FormLabel>
            <FormInput
              name="newRollNo"
              value={form.newRollNo}
              onChange={handleChange}
              className={errors.newRollNo ? "border-danger" : ""}
            />
            {errors.newRollNo && <p className="text-danger text-sm">{errors.newRollNo}</p>}
          </div>

          <div>
            <FormLabel>Batch No</FormLabel>
            <FormInput
              name="batchNo"
              value={form.batchNo}
              onChange={handleChange}
              className={errors.batchNo ? "border-danger" : ""}
            />
            {errors.batchNo && <p className="text-danger text-sm">{errors.batchNo}</p>}
          </div>

          <div>
            <FormLabel>QTY KG</FormLabel>
            <FormInput
              name="qtyKG"
              value={form.qtyKG}
              onChange={handleChange}
              className={errors.qtyKG ? "border-danger" : ""}
            />
            {errors.qtyKG && <p className="text-danger text-sm">{errors.qtyKG}</p>}
          </div>

          <div>
            <FormLabel>QTY MTR</FormLabel>
            <FormInput
              name="qtyMTR"
              value={form.qtyMTR}
              onChange={handleChange}
              className={errors.qtyMTR ? "border-danger" : ""}
            />
            {errors.qtyMTR && <p className="text-danger text-sm">{errors.qtyMTR}</p>}
          </div>

          <div>
            <FormLabel>Comments</FormLabel>
            <FormInput name="comments" value={form.comments} onChange={handleChange} />
          </div>
        </Dialog.Description>

        <Dialog.Footer>
          <Button variant="secondary" className="w-24 mr-2" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" className="w-24" onClick={handleUpdate}>
            Update
          </Button>
        </Dialog.Footer>
      </Dialog.Panel>
    </Dialog>
  );
};

export default EditPVCInward;
