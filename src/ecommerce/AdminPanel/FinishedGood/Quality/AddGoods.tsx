import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface CreateNewChemicalModalProps {
  open: boolean;
  onClose: () => void;
  onAddChemical: (data: {
    Name: string;
    Comments: string;
     GSM_GLM: string;
      Colour: string;
  }) => void;
}

const schema = yup.object({
  Name: yup
    .string()
    .required("Chemical name is required")
    .min(2, "Minimum 2 characters"),

  Comments: yup
    .string()
    .required("Comments are required")
    .min(10, "Minimum 2 characters"),

 GSM_GLM: yup
    .string()
    .required("required")
    .min(10, "Minimum 2characters"),
     Colour: yup
    .string()
    .required("Colour are required")
    .min(10, "Minimum 2 characters"),

});

const AddGoods: React.FC<CreateNewChemicalModalProps> = ({
  open,
  onClose,
  onAddChemical,
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
    onAddChemical(data);
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} staticBackdrop size="md">
      <Dialog.Panel>
        <Dialog.Title>
          <h2 className="text-base font-medium">Create New Chemical</h2>
        </Dialog.Title>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Dialog.Description className="space-y-4">
            {/* Chemical Name */}
            <div>
              <FormLabel> Name</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter Chemical Name"
                {...register("Name")}
              />
              {errors.Name && (
                <p className="mt-1 text-sm text-danger">
                  {errors.Name.message}
                </p>
              )}
            </div>
            {/* Comments */}
            <div>
              <FormLabel>Comments</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter Comments"
                {...register("Comments")}
              />
              {errors.Comments && (
                <p className="mt-1 text-sm text-danger">
                  {errors.Comments.message}
                </p>
              )}
            </div>

            {/* Type */}
            <div>
              <FormLabel>GSM/GRM</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter GSM/GRM"
                {...register("GSM_GLM")}
              />
              {errors.GSM_GLM && (
                <p className="mt-1 text-sm text-danger">
                  {errors.GSM_GLM.message}
                </p>
              )}
            </div>

            <div>
              <FormLabel>Colour</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter Colour"
                {...register("Colour")}
              />
              {errors.Colour && (
                <p className="mt-1 text-sm text-danger">
                  {errors.Colour.message}
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

             <Button variant="primary" className="w-24 mb-2 mr-1">
        Add
    </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Panel>
    </Dialog>
  );
};

export default AddGoods;
