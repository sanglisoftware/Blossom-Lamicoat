import Button from "@/components/Base/Button";
import { FormInput, FormLabel, FormSelect } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface CreateNewFormulaModalProps {
  open: boolean;
  onClose: () => void;
  onAddFormula: (data: {
    FinalProduct: string;
    Chemical1: string;
    Chemical2: string;
    Chemical3: string;
    Chemical4: string;
  }) => void;
}

const schema = yup.object({
  FinalProduct: yup.string().required("name is required"),
  Chemical1: yup.string().required("Chemical1 is required"),
  Chemical2: yup.string().required("Chemical2 required"),
  Chemical3: yup.string().required("Chemical3 is required"),
  Chemical4: yup.string().required("Chemical4 No is required"),
});

const AddFormula: React.FC<CreateNewFormulaModalProps> = ({
  open,
  onClose,
  onAddFormula,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    control, // ✅ IMPORTANT
    formState: { errors },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(schema),
    defaultValues: {
      FinalProduct: "",
      Chemical1: "",
      Chemical2: "",
      Chemical3: "",
      Chemical4: "",
    },
  });

  const onSubmit = (data: any) => {
    onAddFormula(data);
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} staticBackdrop size="md">
      <Dialog.Panel>
        <Dialog.Title>
          <h2 className="text-base font-medium">Create New Formula</h2>
        </Dialog.Title>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Dialog.Description className="space-y-4">

            {/* Final Product Dropdown */}
            <div>
              <FormLabel>Final Product</FormLabel>

              <Controller
                name="FinalProduct"
                control={control}
                render={({ field }) => (
                  <FormSelect {...field}>
                    <option value="">Select Final Product</option>
                    <option value="Product A">Product A</option>
                    <option value="Product B">Product B</option>
                    <option value="Product C">Product C</option>
                  </FormSelect>
                )}
              />

              {errors.FinalProduct && (
                <p className="mt-1 text-sm text-danger">
                  {errors.FinalProduct.message}
                </p>
              )}
            </div>

            {/* Chemical1 */}
            <div>
              <FormLabel>Chemical1</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter QTY"
                {...register("Chemical1")}
              />
              {errors.Chemical1 && (
                <p className="mt-1 text-sm text-danger">
                  {errors.Chemical1.message}
                </p>
              )}
            </div>

            {/* Chemical2 */}
            <div>
              <FormLabel>Chemical2</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter QTY"
                {...register("Chemical2")}
              />
              {errors.Chemical2 && (
                <p className="mt-1 text-sm text-danger">
                  {errors.Chemical2.message}
                </p>
              )}
            </div>

            {/* Chemical3 */}
            <div>
              <FormLabel>Chemical3</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter QTY"
                {...register("Chemical3")}
              />
              {errors.Chemical3 && (
                <p className="mt-1 text-sm text-danger">
                  {errors.Chemical3.message}
                </p>
              )}
            </div>

            {/* Chemical4 */}
            <div>
              <FormLabel>Chemical4</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter QTY"
                {...register("Chemical4")}
              />
              {errors.Chemical4 && (
                <p className="mt-1 text-sm text-danger">
                  {errors.Chemical4.message}
                </p>
              )}
            </div>

          </Dialog.Description>

          <Dialog.Footer>
            <Button
              type="button"
              variant="secondary"
              className="w-24 mb-2 mr-1"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
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

export default AddFormula;
