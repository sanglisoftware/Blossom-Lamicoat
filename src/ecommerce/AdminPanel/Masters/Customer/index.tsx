import { useState } from "react";
import Button from "@/components/Base/Button";
import Table from "@/components/Base/Table";
import { FormInput } from "@/components/Base/Form";
import AddCustomer from "./AddCustomer";
import EditCustomer from "./EditCustomer";


function Main() {
  const [addNewCustomerModal, setAddNewCustomerModal] = useState(false);
  const [editCustomerModal, setEditCustomerModal] = useState(false);
  const [CustomerToEdit, setCustomerToEdit] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [tableData, setTableData] = useState([
    { id: 1, Name: "username", Address: "", MobileNo: "", Email:"", GSTNo:"" },
    { id: 2, Name: "username", Address: "", MobileNo: "" , Email:"", GSTNo:"" },
    { id: 3,Name: "username", Address: "", MobileNo: "", Email:"", GSTNo:""  },
  ]);

  const handleAddCustomer = (data: {
    Name: string;
    Address: string;
    MobileNo: string;
    Email: string;
    GSTNo: string;
  }) => {
    setTableData((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        Name: data.Name,
        Address: data.Address,
        MobileNo: data.MobileNo,
        Email: data.Email,
        GSTNo: data.GSTNo,
      },
    ]);
  };

  const handleUpdateCustomer = (data: {
    id: number;
    Name: string;
    Address: string;
    MobileNo: string;
    Email: string;
    GSTNo: string;
  }) => {
    setTableData((prev) =>
      prev.map((row) => (row.id === data.id ? data : row))
    );
  };

  const handleDelete = (id: number) => {
    setTableData((prev) => prev.filter((row) => row.id !== id));
  };

  const filteredData = tableData.filter((row) =>
    row.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-medium">Customer List</h2>
        <Button
          as="a"
          variant="primary"
          href="#"
          className="inline-block px-5 shadow-md"
          onClick={(e) => {
            e.preventDefault();
            setAddNewCustomerModal(true);
          }}
        >
          Add Customer
        </Button>
      </div>


      <div className="p-5 box">

        <div className="flex items-center mb-3">
          <span className="mr-2 font-medium">Search:</span>
          <FormInput
            type="text"
            placeholder="Enter Customer name..."
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
                <Table.Th className="whitespace-nowrap">Address</Table.Th>
                <Table.Th className="whitespace-nowrap">Mobile No</Table.Th>
                <Table.Th className="whitespace-nowrap">Email</Table.Th>
                <Table.Th className="whitespace-nowrap">GST No</Table.Th>

                <Table.Th className="whitespace-nowrap text-center">Actions</Table.Th>
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
                  <Table.Td>{row.Address}</Table.Td>
                  <Table.Td>{row.MobileNo}</Table.Td>
                  <Table.Td>{row.Email}</Table.Td>
                  <Table.Td>{row.GSTNo}</Table.Td>

                  <Table.Td className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        as="a"
                        variant="primary"
                        href="#"
                        className="inline-block w-24 mb-2 mr-1"
                        onClick={(e) => {
                          e.preventDefault();
                          setCustomerToEdit(row);
                          setEditCustomerModal(true);
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        as="a"
                        variant="danger"
                        href="#"
                        className="inline-block w-24 mb-2 mr-1"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete(row.id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      </div>
      <AddCustomer
        open={addNewCustomerModal}
        onClose={() => setAddNewCustomerModal(false)}
        onAddCustomer={handleAddCustomer}
      />

      <EditCustomer
        open={editCustomerModal}
        onClose={() => setEditCustomerModal(false)}
        CustomerData={CustomerToEdit}
        onUpdateCustomer={handleUpdateCustomer}
      />
    </>
  );
}


export default Main;


