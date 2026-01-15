import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface CreateNewColourModalProps {
  open: boolean;
  onClose: () => void;
  onAddColour: (data: {
    Name: string;
  }) => void;
}

const schema = yup.object({
  Name: yup
    .string()
    .required("Name is required")
    .min(2, "Minimum 2 characters"),
});

const AddColour: React.FC<CreateNewColourModalProps> = ({
  open,
  onClose,
  onAddColour,
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

  const onSubmit = (data: { Name: string }) => {
    onAddColour(data);   
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} staticBackdrop size="md">
      <Dialog.Panel>
        <Dialog.Title>
          <h2 className="text-base font-medium">Create New Grade</h2>
        </Dialog.Title>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Dialog.Description className="space-y-4">
            <div>
              <FormLabel>Colour</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter colour"
                {...register("Name")}
              />
              {errors.Name && (
                <p className="mt-1 text-sm text-danger">
                  {errors.Name.message}
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

export default AddColour;
