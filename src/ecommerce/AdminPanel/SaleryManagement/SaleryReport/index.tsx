import { useState } from "react";
import Button from "@/components/Base/Button";
import Table from "@/components/Base/Table";
import { FormInput } from "@/components/Base/Form";


function Main() {
  const [addNewCustomerModal, setAddNewCustomerModal] = useState(false);
  const [editCustomerModal, setEditCustomerModal] = useState(false);
  const [CustomerToEdit, setCustomerToEdit] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [tableData, setTableData] = useState([
    { id: 1, Name: "username", Type: "", Date: "", SaleryPerDay:"", Attendence:"", ExtraHours:"", LateDay:"", HalfDay:"",Salery:"" },
    { id: 2, Name: "username", Type: "", Date: "", SaleryPerDay:"", Attendence:"", ExtraHours:"", LateDay:"", HalfDay:"",Salery:"" },
    { id: 3, Name: "username", Type: "", Date: "", SaleryPerDay:"", Attendence:"", ExtraHours:"", LateDay:"", HalfDay:"",Salery:""   },
  ]);

  const handleAddCustomer = (data: {
    Name: string;
    Type: string;
    Date: string;
    SaleryPerDay: string;
    Attendence: string;
    ExtraHours: string;
    LateDay: string;
    HalfDay: string;
    Salery: string;

  }) => {
    setTableData((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        Name: data.Name,
        Type: data.Type,
        Date: data.Date,
        SaleryPerDay: data.SaleryPerDay,
        Attendence: data.Attendence,
        ExtraHours: data.ExtraHours,
        LateDay: data.LateDay,
        HalfDay: data.HalfDay,
        Salery: data.Salery,

      },
    ]);
  };

//   const handleUpdateCustomer = (data: {
//     Name: string;
//     Type: string;
//     Date: string;
//     SaleryPerDay: string;
//     Attendence: string;
//     ExtraHours: string;
//     LateDay: string;
//     HalfDay: string;
//     Salery: string;
//   }) => {
//     setTableData((prev) =>
//       prev.map((row) => (row.id === data.id ? data : row))
//     );
//   };

  const handleDelete = (id: number) => {
    setTableData((prev) => prev.filter((row) => row.id !== id));
  };

  const filteredData = tableData.filter((row) =>
    row.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-medium">Salery Report</h2>
      </div>


      <div className="p-5 box">

        <div className="flex items-center mb-3">
          <span className="mr-2 font-medium">Search:</span>
          <FormInput
            type="text"
            placeholder="Enter name..."
            className="w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>


        <div className="overflow-x-auto">
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th className="whitespace-nowrap text-center">Sr.No</Table.Th>
                <Table.Th className="whitespace-nowrap">Name</Table.Th>
                <Table.Th className="whitespace-nowrap">Type</Table.Th>
                <Table.Th className="whitespace-nowrap">Date</Table.Th>
                <Table.Th className="whitespace-nowrap">Salery/day</Table.Th>
                <Table.Th className="whitespace-nowrap">Attendence</Table.Th>
                <Table.Th className="whitespace-nowrap">Extra Hours</Table.Th>
                <Table.Th className="whitespace-nowrap">Late Day</Table.Th>
                <Table.Th className="whitespace-nowrap">Half Day</Table.Th>
                <Table.Th className="whitespace-nowrap">Salery</Table.Th>


                {/* <Table.Th className="whitespace-nowrap text-center">Actions</Table.Th> */}
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {filteredData.map((row, index) => (
                <Table.Tr key={row.id}>
                  <Table.Td className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span>{index + 1}</span>
                    </div>
                  </Table.Td>
                  <Table.Td>{row.Name}</Table.Td>
                  <Table.Td>{row.Type}</Table.Td>
                  <Table.Td>{row.Date}</Table.Td>
                  <Table.Td>{row.SaleryPerDay}</Table.Td>
                  <Table.Td>{row.Attendence}</Table.Td>
                  <Table.Td>{row.ExtraHours}</Table.Td>
                  <Table.Td>{row.LateDay}</Table.Td>
                  <Table.Td>{row.HalfDay}</Table.Td>
                  <Table.Td>{row.Salery}</Table.Td>


                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      </div>
     
    </>
  );
}


export default Main;


