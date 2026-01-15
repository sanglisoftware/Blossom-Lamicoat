import Button from "@/components/Base/Button";
import { FormInput, FormLabel, FormSelect } from "@/components/Base/Form";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

/* ================== Validation Schema ================== */
const schema = yup.object({
  supplier: yup.string().required("Supplier is required"),
  fabric: yup.string().required("Fabric is required"),
  batchNo: yup.string().required("Batch No is required"),
  qtyMtr: yup
    .number()
    .typeError("Quantity must be a number")
    .required("Quantity is required"),
  comments: yup.string().required("Comments are required"),
});

type FormValues = yup.InferType<typeof schema>;

const Main = () => {
  const {
    register,
    handleSubmit,
    setValue, // ✅ IMPORTANT
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: FormValues) => {
    console.log(data);
    alert("PVC Inward Submitted");
    reset();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-medium mb-6">Fabric Inward</h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="box p-5 space-y-4 w-full max-w-xl"
      >
        {/* Select Supplier */}
        <div>
          <FormLabel>Select Supplier</FormLabel>
          <FormSelect
            onChange={(e) =>
              setValue("supplier", e.target.value, { shouldValidate: true })
            }
          >
            <option value="">Select Supplier</option>
            <option value="Supplier 1">Supplier 1</option>
            <option value="Supplier 2">Supplier 2</option>
          </FormSelect>

          {errors.supplier && (
            <p className="text-danger mt-1 text-sm">
              {errors.supplier.message}
            </p>
          )}
        </div>

        {/* Select Fabric */}
        <div>
          <FormLabel>Select Fabric</FormLabel>
          <FormSelect
            onChange={(e) =>
              setValue("fabric", e.target.value, { shouldValidate: true })
            }
          >
            <option value="">Select Fabric</option>
            <option value="PVC">PVC</option>
            <option value="DOC">DOC</option>
            <option value="CPW">CPW</option>
          </FormSelect>

          {errors.fabric && (
            <p className="text-danger mt-1 text-sm">
              {errors.fabric.message}
            </p>
          )}
        </div>

        {/* Batch No */}
        <div>
          <FormLabel>Batch No</FormLabel>
          <FormInput {...register("batchNo")} />
          {errors.batchNo && (
            <p className="text-danger mt-1 text-sm">
              {errors.batchNo.message}
            </p>
          )}
        </div>

        {/* QTY IN MTR */}
        <div>
          <FormLabel>QTY IN MTR</FormLabel>
          <FormInput {...register("qtyMtr")} />
          {errors.qtyMtr && (
            <p className="text-danger mt-1 text-sm">
              {errors.qtyMtr.message}
            </p>
          )}
        </div>

        {/* Comments */}
        <div>
          <FormLabel>Comments</FormLabel>
          <FormInput {...register("comments")} />
          {errors.comments && (
            <p className="text-danger mt-1 text-sm">
              {errors.comments.message}
            </p>
          )}
        </div>

        <Button variant="primary" type="submit" className="w-24">
          Submit
        </Button>
      </form>
    </div>
  );
};

export default Main;
