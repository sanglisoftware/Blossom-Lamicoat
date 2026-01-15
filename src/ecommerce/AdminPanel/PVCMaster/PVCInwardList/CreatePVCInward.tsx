import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface Props {
  open: boolean;
  onClose: () => void;
  onAddPVCProduct: (data: any) => void;
}

const schema = yup.object({
  supplier: yup.string().required("Supplier is required").min(2, "Minimum 2 characters"),
  pvc: yup.string().required("PVC is required").min(2, "Minimum 2 characters"),
  newRollNo: yup.string().required("New Roll No is required").min(1, "Minimum 1 character"),
  batchNo: yup.string().required("Batch No is required").min(1, "Minimum 1 character"),
  qtyKG: yup.string().required("QTY KG is required"),
  qtyMTR: yup.string().required("QTY MTR is required"),
  comments: yup.string(),
});

const CreatePVCInward: React.FC<Props> = ({ open, onClose, onAddPVCProduct }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: any) => {
    onAddPVCProduct(data);
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} staticBackdrop size="md">
      <Dialog.Panel>
        <Dialog.Title>
          <h2 className="text-base font-medium">Add PVC Inward</h2>
        </Dialog.Title>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Dialog.Description className="space-y-3">
            <div>
              <FormLabel>Supplier</FormLabel>
              <FormInput {...register("supplier")} />
              {errors.supplier && <p className="text-danger text-sm">{errors.supplier.message}</p>}
            </div>

            <div>
              <FormLabel>PVC</FormLabel>
              <FormInput {...register("pvc")} />
              {errors.pvc && <p className="text-danger text-sm">{errors.pvc.message}</p>}
            </div>

            <div>
              <FormLabel>New Roll No</FormLabel>
              <FormInput {...register("newRollNo")} />
              {errors.newRollNo && <p className="text-danger text-sm">{errors.newRollNo.message}</p>}
            </div>

            <div>
              <FormLabel>Batch No</FormLabel>
              <FormInput {...register("batchNo")} />
              {errors.batchNo && <p className="text-danger text-sm">{errors.batchNo.message}</p>}
            </div>

            <div>
              <FormLabel>QTY KG</FormLabel>
              <FormInput {...register("qtyKG")} />
              {errors.qtyKG && <p className="text-danger text-sm">{errors.qtyKG.message}</p>}
            </div>

            <div>
              <FormLabel>QTY MTR</FormLabel>
              <FormInput {...register("qtyMTR")} />
              {errors.qtyMTR && <p className="text-danger text-sm">{errors.qtyMTR.message}</p>}
            </div>

            <div>
              <FormLabel>Comments</FormLabel>
              <FormInput {...register("comments")} />
            </div>
          </Dialog.Description>

          <Dialog.Footer>

            <Button
                          as="button"
                          type="button"
                          variant="secondary"
                          className="w-24 mb-2 mr-1"
                          onClick={onClose}
                        >
                          Cancel
                        </Button>
            
                        <Button
                          as="button"          
                          type="submit"        
                          variant="primary"
                          className="w-24 mb-2 mr-1"
                        >
                          Add
                        </Button>
            
          </Dialog.Footer>
        </form>
      </Dialog.Panel>
    </Dialog>
  );
};

export default CreatePVCInward;
