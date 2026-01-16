import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

/* ✅ Props */
interface AddProductListProps {
  open: boolean;
  onClose: () => void;
  onAddPVCProduct: (data: {
    name: string;
    grm: string;
    colour: string;
    comments: string;
  }) => void;
}

/* ✅ Validation Schema */
const schema = yup.object({
  name: yup.string().required("Name is required"),
  grm: yup.string().required("GRM is required"),
  colour: yup.string().required("Colour is required"),
  comments: yup.string().optional(),
});

const AddProductList: React.FC<AddProductListProps> = ({
  open,
  onClose,
  onAddPVCProduct,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
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
          <h2 className="text-base font-medium">Add Fabric Product</h2>
        </Dialog.Title>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Dialog.Description className="mt-4 space-y-4">
            {/* Product Name */}
            <div>
              <FormLabel>Name</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter product name"
                {...register("name")}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-danger">
                  {String(errors.name.message)}
                </p>
              )}
            </div>

            {/* GRM */}
            <div>
              <FormLabel>GRM</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter GRM"
                {...register("grm")}
              />
              {errors.grm && (
                <p className="mt-1 text-sm text-danger">
                  {String(errors.grm.message)}
                </p>
              )}
            </div>

            {/* Colour */}
            <div>
              <FormLabel>Colour</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter colour"
                {...register("colour")}
              />
              {errors.colour && (
                <p className="mt-1 text-sm text-danger">
                  {String(errors.colour.message)}
                </p>
              )}
            </div>

            {/* Comments */}
            <div>
              <FormLabel>Comments</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter comments"
                {...register("comments")}
              />
            </div>
          </Dialog.Description>

          <Dialog.Footer className="mt-5 text-right">
            <Button
              type="button"
              variant="secondary"
              className="w-24 mr-2"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              className="w-24"
            >
              Add
            </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Panel>
    </Dialog>
  );
};

export default AddProductList;
