import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface AddProductProps {
  open: boolean;
  onClose: () => void;
  onAddPVCProduct: (data: FormValues) => void;
}

// ✅ Define form fields
interface FormValues {
  name: string;
  grm: string;
  pvcProduct: string;
  colour: string;
  comments: string;
}

// ✅ Validation schema
const schema = yup.object({
  name: yup.string().required("Name is required"),
  grm: yup.string().required("Gramage is required"),
  pvcProduct: yup.string().required("Width is required"),
  colour: yup.string().required("Colour is required"),
  comments: yup.string().required("Comments are required"),
});


const AddProduct: React.FC<AddProductProps> = ({
  open,
  onClose,
  onAddPVCProduct,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    onAddPVCProduct(data);
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} staticBackdrop size="md">
      <Dialog.Panel>
        <Dialog.Title>
          <h2 className="text-base font-medium">Add PVC Product</h2>
        </Dialog.Title>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Dialog.Description className="space-y-4">

            <div>
              <FormLabel>Name</FormLabel>
              <FormInput {...register("name")} />
              {errors.name && (
                <p className="text-danger text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <FormLabel>Gramage</FormLabel>
              <FormInput {...register("grm")} />
              {errors.grm && (
                <p className="text-danger text-sm mt-1">{errors.grm.message}</p>
              )}
            </div>

            <div>
              <FormLabel>Width</FormLabel>
              <FormInput {...register("pvcProduct")} />
              {errors.pvcProduct && (
                <p className="text-danger text-sm mt-1">{errors.pvcProduct.message}</p>
              )}
            </div>

            <div>
              <FormLabel>Colour</FormLabel>
              <FormInput {...register("colour")} />
              {errors.colour && (
                <p className="text-danger text-sm mt-1">{errors.colour.message}</p>
              )}
            </div>

            <div>
              <FormLabel>Comments</FormLabel>
              <FormInput {...register("comments")} />
              {errors.comments && (
                <p className="text-danger text-sm mt-1">{errors.comments.message}</p>
              )}
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

export default AddProduct;
