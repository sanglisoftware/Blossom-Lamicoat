import { useState } from "react";
import Button from "@/components/Base/Button";
import Table from "@/components/Base/Table";
import { FormInput } from "@/components/Base/Form";
import AddGSM from "./AddGSM";
import EditGSM from "./EditGSM";



function Main() {
  const [addNewGramModal, setAddNewGramModal] = useState(false);
  const [editGramModal, setEditGramModal] = useState(false);
  const [GramToEdit, setGramToEdit] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [GramtableData, setGramTableData] = useState([
    { id: 1, Name: "200" },
    { id: 2, Name: "300" },
    { id: 3, Name: "500" },
  ]);

  const handleGram = (data: { Name: string }) => {
  setGramTableData((prev) => [
    ...prev,
    {
      id: prev.length + 1,
      Name: data.Name,
    },
  ]);
};



  const handleUpdateGram = (data: {
    id: number;
    Name: string;
  
  }) => {
    setGramTableData((prev) =>
      prev.map((row) => (row.id === data.id ? data : row))
    );
  };


  const handleDelete = (id: number) => {
    setGramTableData((prev) => prev.filter((row) => row.id !== id));
  };

  const filteredData = GramtableData.filter((row) =>
    row.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-medium">GSM/GLM</h2>
        <Button
          as="a"
          variant="primary"
          href="#"
          className="inline-block px-5 shadow-md"
          onClick={(e) => {
            e.preventDefault();
            setAddNewGramModal(true);
          }}
        >
          Add GSM/GLM
        </Button>
      </div>

      <div className="p-5 box">
        <div className="flex items-center mb-3">
          <span className="mr-2 font-medium">Search:</span>
          <FormInput
            type="text"
            // placeholder="Enter grm..."
            className="w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th className="whitespace-nowrap text-center">
                  Sr.No
                </Table.Th>
                <Table.Th className="whitespace-nowrap">
                  Name
                </Table.Th>
                <Table.Th className="whitespace-nowrap text-center">
                  Actions
                </Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {filteredData.map((row, index) => (
                <Table.Tr key={row.id}>
                  <Table.Td className="text-center">
                    {index + 1}
                  </Table.Td>

                  <Table.Td>
                    {row.Name}
                  </Table.Td>

                  <Table.Td className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        as="a"
                        variant="primary"
                        href="#"
                        className="inline-block w-24 mb-2"
                        onClick={(e) => {
                          e.preventDefault();
                          setGramToEdit(row);
                          setEditGramModal(true);
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        as="a"
                        variant="danger"
                        href="#"
                        className="inline-block w-24 mb-2"
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
       <AddGSM
        open={addNewGramModal}
        onClose={() => setAddNewGramModal(false)}
        onAddGram={handleGram}
      />

      <EditGSM
        open={editGramModal}
        onClose={() => setEditGramModal(false)}
        GramData={GramToEdit}
        onUpdateGram={handleUpdateGram}
      />
    </>
  );
}

export default Main;
