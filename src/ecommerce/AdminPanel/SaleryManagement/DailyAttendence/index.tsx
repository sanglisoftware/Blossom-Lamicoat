import { useState } from "react";
import Button from "@/components/Base/Button";
import Table from "@/components/Base/Table";
import { DatePicker } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FormInput, FormLabel } from "@/components/Base/Form";

/* ================== Validation Schema ================== */
const schema = yup.object({
  Name: yup.string().required("required"),
  Status: yup.string().required("required"),
  InTime: yup.string().required("required"),
  OutTime: yup.string().required("required"),
  billDate: yup.string().required(),
});

type FormValues = {
  Name: string;
  Status: string;
  InTime: string;
  OutTime: string;
  billDate: string;
};

const Main = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const filteredData = [
    { id: 1, name: "Ravi", status: "Present", inTime: "09:30", outTime: "18:30" },
    { id: 2, name: "Amit", status: "Absent", inTime: "--", outTime: "--" },
  ];

  const { register, setValue } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      Name: "",
      Status: "",
      InTime: "",
      OutTime: "",
      billDate: "",
    },
  });

 const handleDateChange = (date: Date | null) => {
  if (!date) return;

  const formattedDate = date.toISOString().split("T")[0];
  setSelectedDate(date);

  setValue("billDate", formattedDate, {
    shouldDirty: true,
    shouldTouch: true,
    shouldValidate: true,
  });
};

  return (
    <div className="p-6">
      <h2 className="text-xl font-medium mb-6">Daily Attendance</h2>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT TABLE */}
        <div className="col-span-7 box p-5">
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th className="text-center">Sr.No</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>In Time</Table.Th>
                <Table.Th>Out Time</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredData.map((row, index) => (
                <Table.Tr key={row.id}>
                  <Table.Td className="text-center">{index + 1}</Table.Td>
                  <Table.Td>{row.name}</Table.Td>
                  <Table.Td>{row.status}</Table.Td>
                  <Table.Td>{row.inTime}</Table.Td>
                  <Table.Td>{row.outTime}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>

        {/* RIGHT CALENDAR */}
        <div className="col-span-5 box p-5 space-y-4">
          <div>
            <FormLabel>Select Date</FormLabel>
            <FormInput type="date" {...register("billDate")} />
          </div>

          {/* <DatePicker
            inline
            selected={selectedDate}
            onChange={handleDateChange}
          /> */}
        </div>
      </div>
    </div>
  );
};

export default Main;
