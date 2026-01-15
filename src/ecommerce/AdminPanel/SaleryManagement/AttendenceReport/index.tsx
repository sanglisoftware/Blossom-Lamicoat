import { useMemo } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel, FormSelect } from "@/components/Base/Form";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

/* ================== Validation Schema ================== */
const schema = yup.object({
  staffName: yup.string().required("Staff name is required"),
  attendance: yup.number().typeError("Attendance is required").required(),
  extraHours: yup.number().typeError("Extra hours are required").required(),
  totalLate: yup.number().typeError("Total late is required").required(),
  halfDay: yup.number().typeError("Half day must be number").optional(),
  totalSalary: yup.number().typeError("Total salary is required").required(),
});

type FormValues = yup.InferType<typeof schema>;

const TOTAL_DAYS = 20;
const MONTHLY_SALARY = 12000;
const ONE_DAY_SALARY = 400;

const Main = () => {
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      staffName: "",
      halfDay: 0,
    },
  });

  /* ================== Calculations ================== */
  const attendance = watch("attendance") || 0;

  const totalPresentDays = useMemo(() => attendance, [attendance]);
  const totalAbsentDays = useMemo(
    () => TOTAL_DAYS - totalPresentDays,
    [totalPresentDays]
  );

  const onSubmit = (data: FormValues) => {
    console.log(data);
    alert("Salary Calculated");
    reset();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-medium mb-6">Salary</h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="box p-6 space-y-6 w-full max-w-4xl"
      >
        {/* ================== Staff Select ================== */}
        <div>
          <FormLabel>Staff</FormLabel>
          <Controller
            name="staffName"
            control={control}
            render={({ field }) => (
              <FormSelect {...field}>
                <option value="">Staff</option>
                <option value="Staff 1">Staff 1</option>
                <option value="Staff 2">Staff 2</option>
              </FormSelect>
            )}
          />
          {errors.staffName && (
            <p className="text-danger text-sm mt-1">
              {errors.staffName.message}
            </p>
          )}
        </div>

        {/* ================== Salary Info ================== */}
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
          <div className="flex gap-8">
            <span>
              <span className="font-medium">Salary</span> = {MONTHLY_SALARY}
            </span>
            <span>
              <span className="font-medium">One Day</span> = {ONE_DAY_SALARY}
            </span>
          </div>
        </div>

        {/* ================== Attendance Calendar Placeholder ================== */}
        <div className="border rounded-md p-4">
          <h3 className="font-medium mb-3">February 2022</h3>

          <div className="grid grid-cols-7 gap-2 text-center text-sm">
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
              <div key={d} className="font-medium text-primary">{d}</div>
            ))}

            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className="border rounded-md py-2 text-xs"
              >
                {i + 1}
                <div className="mt-1">
                  {i % 6 === 0 ? "A" : "P"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================== Summary ================== */}
        <div className="text-sm space-y-1">
          <div>Total days = {TOTAL_DAYS}</div>
          <div>Total Present days = {totalPresentDays}</div>
          <div>Total Absent days = {totalAbsentDays}</div>
        </div>

    
        
      </form>
    </div>
  );
};

export default Main;
