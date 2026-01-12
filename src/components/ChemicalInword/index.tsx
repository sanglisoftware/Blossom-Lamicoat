import { useState } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { DatePicker } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
          <div>
            <FormLabel>Chemical</FormLabel>
            <select
              className="form-select w-full"
              value={formData.chemical}
              onChange={(e) =>
                setFormData({ ...formData, chemical: e.target.value })
              }
            >
              <option value="">Select Chemical</option>
              <option value="PVC">PVC</option>
              <option value="DOP">DOP</option>
              <option value="CPW">CPW</option>
            </select>
          </div>

          <div>
            <FormLabel>Supplier</FormLabel>
            <FormInput
              type="text"
              placeholder="Supplier name"
              value={formData.supplier}
              onChange={(e) =>
                setFormData({ ...formData, supplier: e.target.value })
              }
            />
          </div>

          <div>
            <FormLabel>QTY</FormLabel>
            <FormInput
              type="number"
              placeholder="Quantity"
              value={formData.qty}
              onChange={(e) =>
                setFormData({ ...formData, qty: e.target.value })
              }
            />
          </div>

          <div>
            <FormLabel>Batch No</FormLabel>
            <FormInput
              type="text"
              placeholder="Batch Number"
              value={formData.batchNo}
              onChange={(e) =>
                setFormData({ ...formData, batchNo: e.target.value })
              }
            />
          </div>

          <Button
            variant="primary"
            className="bg-blue-600 hover:bg-blue-700 w-fit"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>

        {/* RIGHT SIDE DATE SECTION */}
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
