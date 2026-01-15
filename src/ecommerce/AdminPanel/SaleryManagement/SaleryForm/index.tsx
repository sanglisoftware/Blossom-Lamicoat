import Button from "@/components/Base/Button";
import { FormInput, FormLabel, FormSelect } from "@/components/Base/Form";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object({
  staffName: yup.string().required("Staff name is required"),
  attendance: yup
    .number()
    .typeError("Attendance is required")
    .required("Attendance is required"),
  extraHours: yup
    .number()
    .typeError("Extra hours are required")
    .required("Extra hours are required"),
  totalLate: yup
    .number()
    .typeError("Total late is required")
    .required("Total late is required"),
  halfDay: yup.string(),
  totalSalary: yup
    .number()
    .typeError("Total salary is required")
    .required("Total salary is required"),
});

type FormValues = yup.InferType<typeof schema>;

const Main = () => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      staffName: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log(data);
    alert("PVC Inward Submitted");
    reset();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-medium mb-6">Salary Form</h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="box p-5 space-y-4 w-full max-w-xl"
      >
        {/* Staff Name */}
        <div>
          <FormLabel>Staff Name</FormLabel>

          <Controller
            name="staffName"
            control={control}
            render={({ field }) => (
              <FormSelect {...field}>
                <option value="">Staff Name</option>
                <option value="Supplier 1">Supplier 1</option>
                <option value="Supplier 2">Supplier 2</option>
              </FormSelect>
            )}
          />

          {errors.staffName && (
            <p className="text-danger mt-1 text-sm">
              {errors.staffName.message}
            </p>
          )}
        </div>

        {/* Static Info */}
        <div className="text-sm space-y-1">
                 <div>
  <span className="font-medium">Type</span>
  <div className="mt-2 flex gap-4">
    <label className="flex items-center gap-1">
      <input
        type="radio"
        name="type"
        value="Staff"
        className="form-radio"
      />
      Staff
    </label>
    <label className="flex items-center gap-1">
      <input
        type="radio"
        name="type"
        value="Worker"
        className="form-radio"
      />
      Worker
    </label>
  </div>
</div>
<br/>
          <div className="flex gap-6">
            <span>
              <span className="font-medium">Salary</span> = 12,000
            </span>
            <span>
              <span className="font-medium">One Day</span> = 400
            </span>
          </div>
        </div>

        {/* Attendance */}
        <div>
          <FormLabel>Attendance</FormLabel>
          <FormInput
            type="text"
            placeholder="Enter attendance"
            {...register("attendance")}
          />
          {errors.attendance && (
            <p className="text-danger mt-1 text-sm">
              {errors.attendance.message}
            </p>
          )}
        </div>

        {/* Extra Hours */}
        <div>
          <FormLabel>Extra hours</FormLabel>
          <FormInput
            type="text"
            placeholder="Enter extra hours"
            {...register("extraHours")}
          />
          {errors.extraHours && (
            <p className="text-danger mt-1 text-sm">
              {errors.extraHours.message}
            </p>
          )}
        </div>

        {/* Total Late */}
       {/* Total Late & Half Day */}
<div className="grid grid-cols-2 gap-4">
  <div>
    <FormLabel>Total Late</FormLabel>
    <FormInput
      type="text"
      placeholder="Enter total late"
      {...register("totalLate")}
    />
    {errors.totalLate && (
      <p className="text-danger mt-1 text-sm">
        {errors.totalLate.message}
      </p>
    )}
  </div>

  <div>
    <FormLabel>Half Day</FormLabel>
    <FormInput
      type="text"
      placeholder="Enter half day"
      {...register("halfDay")}
    />
    {errors.halfDay && (
      <p className="text-danger mt-1 text-sm">
        {errors.halfDay.message}
      </p>
    )}
  </div>
</div>

        {/* Total Salary */}
        <div>
          <FormLabel>Total salary</FormLabel>
          <FormInput
            type="text"
            placeholder="Enter total salary"
            {...register("totalSalary")}
          />
          {errors.totalSalary && (
            <p className="text-danger mt-1 text-sm">
              {errors.totalSalary.message}
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
