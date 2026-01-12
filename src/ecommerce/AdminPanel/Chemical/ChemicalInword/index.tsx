import { useState } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel, FormSelect } from "@/components/Base/Form";
import { DatePicker } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup"

const Main = () => {
 const [selectedDate, setSelectedDate] = useState<Date | null>(null);


  const [formData, setFormData] = useState({
    chemical: "",
    supplier: "",
    qty: "",
    batchNo: "",
    billDate: "",
    receivedDate: "",
  });


  const schema = yup.object({
    Supplier: yup
      .string()
      .required("Chemical name is required")
      .min(2, "Minimum 2 characters"),
  
    QTY: yup
      .string()
      .required("Type is required")
      .min(2, "Minimum 2 characters"),
  
    Batch_No: yup
      .string()
      .required("Comments are required")
      .min(10, "Minimum 10 characters"),
  });
  
  const handleDateChange = (date: Date | null) => {
  if (!date) return;

  const formattedDate = date.toISOString().split("T")[0];

  setSelectedDate(date);
  setFormData((prev) => ({
    ...prev,
    billDate: formattedDate,
    receivedDate: formattedDate,
  }));
};


  const handleSubmit = () => {
    console.log(formData);
    alert("Chemical Inword Submitted");
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-medium mb-6">Chemical Inword</h2>

      <div className="grid grid-cols-12 gap-6">
        
        <div className="col-span-7 box p-5 space-y-4">
             <FormLabel htmlFor="regular-form-1">Add Chemical</FormLabel>
         <FormSelect className="mt-2 sm:mr-2" aria-label="Default select example">
        <option>PVC</option>
        <option>DOC</option>
        <option>CPW</option>
    </FormSelect>
       <div>
        
  <FormLabel htmlFor="supplier">Supplier</FormLabel>
   <FormSelect className="mt-2 sm:mr-2" aria-label="Default select example">
        <option>select supplier</option>
        <option>1</option>
        <option>2</option>
    </FormSelect>
</div>


<div>
    <FormLabel htmlFor="regular-form-1">QTY</FormLabel>
    <FormInput id="regular-form-1" type="text"/>
</div>

     <div>
    <FormLabel htmlFor="regular-form-1">Batch No</FormLabel>
    <FormInput id="regular-form-1" type="text"/>
</div>

          <Button
  variant="primary"
  className="w-24 mb-2 mr-1"
  onClick={handleSubmit}
>
  Submit
</Button>

        </div>

       
        <div className="col-span-5 box p-5 space-y-4">
          <div>
            <FormLabel>Bill Date</FormLabel>
            <FormInput type="date" value={formData.billDate} disabled />
          </div>

          <div>
           <DatePicker
  inline
  selected={selectedDate}
  onChange={(date: Date | null) => {
    if (!date) return;

    const formattedDate = date.toISOString().split("T")[0];

    setSelectedDate(date);
    setFormData((prev) => ({
      ...prev,
      billDate: formattedDate,
      receivedDate: formattedDate,
    }));
  }}
/>

</div>

          <div>
            <FormLabel>Received Date</FormLabel>
            <FormInput type="date" value={formData.receivedDate} disabled />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
