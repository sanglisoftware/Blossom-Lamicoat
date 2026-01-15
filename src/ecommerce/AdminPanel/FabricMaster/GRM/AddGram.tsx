import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface AddGramProps {
  open: boolean;
  onClose: () => void;
  onAddGram: (data: { grm: string }) => void; // ✅ FIXED
}

const schema = yup.object({
  grm: yup
    .string()
    .required("Gram is required")
    .min(2, "Minimum 2 characters"),
});

const AddGram: React.FC<AddGramProps> = ({
  open,
  onClose,
  onAddGram,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ grm: string }>({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const onSubmit = (data: { grm: string }) => {
    onAddGram(data);   // ✅ NOW MATCHES Main.tsx
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} staticBackdrop size="md">
      <Dialog.Panel>
        <Dialog.Title>
          <h2 className="text-base font-medium">Create New Gram</h2>
        </Dialog.Title>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Dialog.Description className="space-y-4">
            <div>
              <FormLabel>Gram</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter Gram"
                {...register("grm")}
              />
              {errors.grm && (
                <p className="mt-1 text-sm text-danger">
                  {errors.grm.message}
                </p>
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

export default AddGram;
