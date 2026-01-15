import { useState } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel, FormSelect } from "@/components/Base/Form";
import { DatePicker } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Define form validation schema
const schema = yup.object().shape({
  chemical: yup.string().required("Chemical is required"),
  supplier: yup.string().required("Supplier is required"),
  qty: yup
    .string()
    .required("QTY is required")
    .matches(/^\d+$/, "QTY must be a number"),
  batchNo: yup.string().required("Batch No is required"),
});

type FormValues = {
  chemical: string;
  supplier: string;
  qty: string;
  batchNo: string;
  billDate: string;
  receivedDate: string;
};

const ChemicalInword = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      chemical: "",
      supplier: "",
      qty: "",
      batchNo: "",
      billDate: "",
      receivedDate: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log(data);
    alert("Chemical Inword Submitted");
  };

  const handleDateChange = (date: Date | null) => {
    if (!date) return;

    const formattedDate = date.toISOString().split("T")[0];
    setSelectedDate(date);
    setValue("billDate", formattedDate);
    setValue("receivedDate", formattedDate);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-medium mb-6">Chemical Inword</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-12 gap-6">
        {/* Left Form */}
        <div className="col-span-7 box p-5 space-y-4">
          <FormLabel>Add Chemical</FormLabel>
          <Controller
            name="chemical"
            control={control}
            render={({ field }) => (
              <FormSelect className="mt-2 sm:mr-2" {...field}>
                <option value="">Select Chemical</option>
                <option value="PVC">PVC</option>
                <option value="DOC">DOC</option>
                <option value="CPW">CPW</option>
              </FormSelect>
            )}
          />
          {errors.chemical && (
            <p className="text-red-500 text-sm">{errors.chemical.message}</p>
          )}

          <div>
            <FormLabel>Supplier</FormLabel>
            <Controller
              name="supplier"
              control={control}
              render={({ field }) => (
                <FormSelect className="mt-2 sm:mr-2" {...field}>
                  <option value="">Select Supplier</option>
                  <option value="Supplier 1">Supplier 1</option>
                  <option value="Supplier 2">Supplier 2</option>
                  <option value="Supplier 3">Supplier 3</option>
                </FormSelect>
              )}
            />
            {errors.supplier && (
              <p className="text-red-500 text-sm">{errors.supplier.message}</p>
            )}
          </div>

          <div>
            <FormLabel>QTY</FormLabel>
            <FormInput type="text" {...register("qty")} />
            {errors.qty && (
              <p className="text-red-500 text-sm">{errors.qty.message}</p>
            )}
          </div>

          <div>
            <FormLabel>Batch No</FormLabel>
            <FormInput type="text" {...register("batchNo")} />
            {errors.batchNo && (
              <p className="text-red-500 text-sm">{errors.batchNo.message}</p>
            )}
          </div>

          <Button type="submit" variant="primary" className="w-24 mb-2 mr-1">
            Submit
          </Button>
        </div>

        {/* Right Date Section */}
        <div className="col-span-5 box p-5 space-y-4">
          <div>
            <FormLabel>Bill Date</FormLabel>
            <FormInput type="date" {...register("billDate")} disabled />
          </div>

          <div>
            <DatePicker
              inline
              selected={selectedDate}
              onChange={handleDateChange}
            />
          </div>

          <div>
            <FormLabel>Received Date</FormLabel>
            <FormInput type="date" {...register("receivedDate")} disabled />
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChemicalInword;
