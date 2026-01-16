import { useState } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel, FormSelect } from "@/components/Base/Form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

/* ================= VALIDATION SCHEMA ================= */
const schema = yup.object({
  PVC: yup.string().required("PVC is required"),
  Batchno: yup.string().required("Batch No is required"),
  Suppliername: yup.string().required("Supplier Name is required"),
  qtykg: yup.string().required("QTY KG is required"),
  qtymtr: yup.string().required("QTY MTR is required"),
  comments: yup.string().required("Comments are required"),
  billDate:yup.string()
});

const Main = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  /* ================= SUBMIT ================= */
  const onSubmit = (data: any) => {
    console.log(data);
    alert("Chemical Inword Submitted");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6">
      <h2 className="text-xl font-medium mb-6">PVC Inword</h2>

      <div className="grid grid-cols-12 gap-6">

        {/* LEFT FORM */}
        <div className="col-span-7 box p-5 space-y-4">

          {/* PVC */}
          <div>
            <FormLabel>Select PVC</FormLabel>
            <FormSelect
              onChange={(e) =>
                setValue("PVC", e.target.value, { shouldValidate: true })
              }
            >
              <option value="">Select PVC</option>
              <option value="PVC">PVC</option>
              <option value="DOC">DOC</option>
              <option value="CPW">CPW</option>
            </FormSelect>
            {errors.PVC && (
              <p className="text-red-500 text-sm">{errors.PVC.message}</p>
            )}
          </div>

          {/* Batch */}
          <div>
            <FormLabel>Batch no: Date-Rollno</FormLabel>
            <FormInput {...register("Batchno")} />
            {errors.Batchno && (
              <p className="text-red-500 text-sm">{errors.Batchno.message}</p>
            )}
          </div>

          {/* Supplier */}
          <div>
            <FormLabel>Supplier Name</FormLabel>
            <FormSelect
              onChange={(e) =>
                setValue("Suppliername", e.target.value, { shouldValidate: true })
              }
            >
              <option value="">Select Supplier</option>
              <option value="1">Supplier 1</option>
              <option value="2">Supplier 2</option>
            </FormSelect>
            {errors.Suppliername && (
              <p className="text-red-500 text-sm">
                {errors.Suppliername.message}
              </p>
            )}
          </div>

          {/* QTY KG */}
          <div>
            <FormLabel>QTY in KG</FormLabel>
            <FormInput {...register("qtykg")} />
            {errors.qtykg && (
              <p className="text-red-500 text-sm">{errors.qtykg.message}</p>
            )}
          </div>

          {/* QTY MTR */}
          <div>
            <FormLabel>QTY in MTR</FormLabel>
            <FormInput {...register("qtymtr")} />
            {errors.qtymtr && (
              <p className="text-red-500 text-sm">{errors.qtymtr.message}</p>
            )}
          </div>

          {/* Comments */}
          <div>
            <FormLabel>Comments</FormLabel>
            <FormInput {...register("comments")} />
            {errors.comments && (
              <p className="text-red-500 text-sm">
                {errors.comments.message}
              </p>
            )}
          </div>

          <Button variant="primary" type="submit" className="w-24">
            Submit
          </Button>
        </div>

        {/* RIGHT DATE */}
        <div className="col-span-5 box p-5 space-y-4">
          <div>
            <FormLabel>Bill Date</FormLabel>
            <FormInput type="date"  />
          </div>
<br/>
          <DatePicker
            inline
            selected={selectedDate}
            onChange={(date) => {
              if (!date) return;
              setSelectedDate(date);
              setValue("billDate", date.toISOString().split("T")[0]);
            }}
          />
        </div>
      </div>
    </form>
  );
};

export default Main;
