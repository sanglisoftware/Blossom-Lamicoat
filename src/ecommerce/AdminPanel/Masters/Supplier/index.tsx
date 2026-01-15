import { useState } from "react";
import Button from "@/components/Base/Button";
import Table from "@/components/Base/Table";
import { FormInput } from "@/components/Base/Form";
import AddSupplier from "./AddSupplier";
import EditSupplier from "./EditSupplier";



function Main() {
  const [addNewSupplierModal, setAddNewSupplierModal] = useState(false);
  const [editSupplierModal, setEditSupplierModal] = useState(false);
  const [SupplierToEdit, setSupplierToEdit] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [tableData, setTableData] = useState([
    { id: 1, Name: "username", Address: "", MobileNo: "", PAN:"", GSTNo:"" },
    { id: 2, Name: "username", Address: "", MobileNo: "" , PAN:"", GSTNo:"" },
    { id: 3,Name: "username", Address: "", MobileNo: "", PAN:"", GSTNo:""  },
  ]);

  const handleAddSupplier = (data: {
    Name: string;
    Address: string;
    MobileNo: string;
    PAN: string;
    GSTNo: string;
  }) => {
    setTableData((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        Name: data.Name,
        Address: data.Address,
        MobileNo: data.MobileNo,
        PAN: data.PAN,
        GSTNo: data.GSTNo,
      },
    ]);
  };

  const handleUpdateSupplier = (data: {
    id: number;
    Name: string;
    Address: string;
    MobileNo: string;
    PAN: string;
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
        <h2 className="text-lg font-medium">Supplier List</h2>
        <Button
          as="a"
          variant="primary"
          href="#"
          className="inline-block px-5 shadow-md"
          onClick={(e) => {
            e.preventDefault();
            setAddNewSupplierModal(true);
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
                <Table.Th className="whitespace-nowrap">Address</Table.Th>
                <Table.Th className="whitespace-nowrap">Mobile No</Table.Th>
                <Table.Th className="whitespace-nowrap">PAN</Table.Th>
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
                  <Table.Td>{row.PAN}</Table.Td>
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
                          setSupplierToEdit(row);
                          setEditSupplierModal(true);
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
      <AddSupplier
        open={addNewSupplierModal}
        onClose={() => setAddNewSupplierModal(false)}
        onAddSupplier={handleAddSupplier}
      />

      <EditSupplier
        open={editSupplierModal}
        onClose={() => setEditSupplierModal(false)}
        SupplierData={SupplierToEdit}
        onUpdateSupplier={handleUpdateSupplier}
      />
    </>
  );
}


export default Main;


