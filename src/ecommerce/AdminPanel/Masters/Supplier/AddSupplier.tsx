import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface CreateNewSupplierModalProps {
  open: boolean;
  onClose: () => void;
  onAddSupplier: (data: {
    Name: string;
    Address: string;
    MobileNo: string;
     PAN: string;
    GSTNo: string;
  }) => void;
}

const schema = yup.object({
  Name: yup
    .string()
    .required(" name is required")
    .min(2, "Minimum 2 characters"),

  Address: yup
    .string()
    .required("Address is required")
    .min(2, "Minimum 2 characters"),

  MobileNo: yup
    .string()
    .required("Number required")
    .min(10, "Minimum 10 digits"),

    PAN: yup
    .string()
    .required("PAN is required")
    .min(2, "Minimum 2 characters"),

    GSTNo: yup
    .string()
    .required("GST No is required")
    .min(2, "Minimum 2 characters"),
});

const AddSupplier: React.FC<CreateNewSupplierModalProps> = ({
  open,
  onClose,
  onAddSupplier,
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
    onAddSupplier(data);
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} staticBackdrop size="md">
      <Dialog.Panel>
        <Dialog.Title>
          <h2 className="text-base font-medium">Create New Customer</h2>
        </Dialog.Title>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Dialog.Description className="space-y-4">
            {/* Chemical Name */}
            <div>
              <FormLabel>Customer Name</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter Customer Name"
                {...register("Name")}
              />
              {errors.Name && (
                <p className="mt-1 text-sm text-danger">
                  {errors.Name.message}
                </p>
              )}
            </div>

            {/* Type */}
            <div>
              <FormLabel>Address</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter Address"
                {...register("Address")}
              />
              {errors.Address && (
                <p className="mt-1 text-sm text-danger">
                  {errors.Address.message}
                </p>
              )}
            </div>

            {/* Comments */}
            <div>
              <FormLabel>Mobile No</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter number"
                {...register("MobileNo")}
              />
              {errors.MobileNo && (
                <p className="mt-1 text-sm text-danger">
                  {errors.MobileNo.message}
                </p>
              )}
            </div>

            <div>
              <FormLabel>PAN</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter Email"
                {...register("MobileNo")}
              />
              {errors.PAN && (
                <p className="mt-1 text-sm text-danger">
                  {errors.PAN.message}
                </p>
              )}
            </div>

            <div>
              <FormLabel>GST No</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter number"
                {...register("GSTNo")}
              />
              {errors.GSTNo && (
                <p className="mt-1 text-sm text-danger">
                  {errors.GSTNo.message}
                </p>
              )}
            </div>
          </Dialog.Description>

          <Dialog.Footer>
            {/* <Button
              type="button"
              variant="outline-secondary"
              className="w-24 mr-2"
              onClick={onClose}
            >
              Cancel
            </Button> */}
            <Button
  type="button"
  variant="secondary"
  className="w-24 mb-2 mr-1"
  onClick={onClose}
>
  Cancel
</Button>


            {/* <Button
              type="submit"
              variant="primary"
              className="w-24 bg-blue-600 hover:bg-blue-700"
            >
              Add
            </Button> */}
             <Button variant="primary" className="w-24 mb-2 mr-1">
        Add
    </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Panel>
    </Dialog>
  );
};

export default AddSupplier;
