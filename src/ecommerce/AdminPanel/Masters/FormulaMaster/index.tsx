import { useState } from "react";
import Button from "@/components/Base/Button";
import Table from "@/components/Base/Table";
import { FormInput } from "@/components/Base/Form";
import AddFormula from "./AddFormula";
import EditFormula from "./EditFormula";


function Main() {
  const [addNewFormulaModal, setAddNewFormulaModal] = useState(false);
  const [editFormulaModal, setEditFormulaModal] = useState(false);
  const [FormulaToEdit, setFormulaToEdit] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [tableData, setTableData] = useState([
    { id: 1, FinalProduct: "p1", Chemical1: "", Chemical2: "", Chemical3:"", Chemical4:"" },
    { id: 2, FinalProduct: "p2", Chemical1: "", Chemical2: "", Chemical3:"", Chemical4:""},
    { id: 3, FinalProduct: "p3", Chemical1: "", Chemical2: "", Chemical3:"", Chemical4:"" },
  ]);

  const handleAddFormula = (data: {
    FinalProduct: string;
    Chemical1: string;
    Chemical2: string;
    Chemical3: string;
    Chemical4: string;
  }) => {
    setTableData((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        FinalProduct: data.FinalProduct,
        Chemical1: data.Chemical1,
        Chemical2: data.Chemical2,
        Chemical3: data.Chemical3,
        Chemical4: data.Chemical4,
      },
    ]);
  };

  const handleUpdateFormula = (data: {
    id: number;
   FinalProduct: string;
    Chemical1: string;
    Chemical2: string;
    Chemical3: string;
    Chemical4: string;
  }) => {
    setTableData((prev) =>
      prev.map((row) => (row.id === data.id ? data : row))
    );
  };

  const handleDelete = (id: number) => {
    setTableData((prev) => prev.filter((row) => row.id !== id));
  };

  const filteredData = tableData.filter((row) =>
    row.FinalProduct.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-medium">Formula List</h2>
        <Button
          as="a"
          variant="primary"
          href="#"
          className="inline-block px-5 shadow-md"
          onClick={(e) => {
            e.preventDefault();
            setAddNewFormulaModal(true);
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
                <Table.Th className="whitespace-nowrap">FinalProduct</Table.Th>
                <Table.Th className="whitespace-nowrap">Chemical1</Table.Th>
                <Table.Th className="whitespace-nowrap">Chemical2</Table.Th>
                <Table.Th className="whitespace-nowrap">Chemical3</Table.Th>
                <Table.Th className="whitespace-nowrap">Chemical4</Table.Th>

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
                  <Table.Td>{row.FinalProduct}</Table.Td>
                  <Table.Td>{row.Chemical1}</Table.Td>
                  <Table.Td>{row.Chemical2}</Table.Td>
                  <Table.Td>{row.Chemical3}</Table.Td>
                  <Table.Td>{row.Chemical4}</Table.Td>

                  <Table.Td className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        as="a"
                        variant="primary"
                        href="#"
                        className="inline-block w-24 mb-2 mr-1"
                        onClick={(e) => {
                          e.preventDefault();
                          setFormulaToEdit(row);
                          setEditFormulaModal(true);
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
      <AddFormula
        open={addNewFormulaModal}
        onClose={() => setAddNewFormulaModal(false)}
        onAddFormula={handleAddFormula}
      />

      <EditFormula
        open={editFormulaModal}
        onClose={() => setEditFormulaModal(false)}
        FormulaData={FormulaToEdit}
        onUpdateFormula={handleUpdateFormula}
      />
    </>
  );
}


export default Main;


