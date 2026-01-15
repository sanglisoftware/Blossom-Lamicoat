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
    chemicalName: string;
    type: string;
    comments: string;
  }) => void;
}

const schema = yup.object({
  chemicalName: yup
    .string()
    .required("Chemical name is required"),

  type: yup
    .string()
    .required("Type is required"),

  comments: yup
    .string()
    .required("Comments are required"),
});

const CreateNewChemical: React.FC<CreateNewChemicalModalProps> = ({
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
              <FormLabel>Chemical Name</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter Chemical Name"
                {...register("chemicalName")}
              />
              {errors.chemicalName && (
                <p className="mt-1 text-sm text-danger">
                  {errors.chemicalName.message}
                </p>
              )}
            </div>

            {/* Type */}
            <div>
              <FormLabel>Type</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter Type"
                {...register("type")}
              />
              {errors.type && (
                <p className="mt-1 text-sm text-danger">
                  {errors.type.message}
                </p>
              )}
            </div>

            {/* Comments */}
            <div>
              <FormLabel>Comments</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter Comments"
                {...register("comments")}
              />
              {errors.comments && (
                <p className="mt-1 text-sm text-danger">
                  {errors.comments.message}
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

export default CreateNewChemical;
