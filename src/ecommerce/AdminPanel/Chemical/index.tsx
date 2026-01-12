import { useState } from "react";
import Button from "@/components/Base/Button";
import Table from "@/components/Base/Table";
import { FormInput } from "@/components/Base/Form";
import CreateNewChemical from "./CreateNewChemical";
import EditChemical from "./EditChemical";

function Main() {
  const [addNewChemicalModal, setAddNewChemicalModal] = useState(false);
  const [editChemicalModal, setEditChemicalModal] = useState(false);
  const [chemicalToEdit, setChemicalToEdit] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [tableData, setTableData] = useState([
    { id: 1, Name: "PVC RESIN PAWDER", type: "", comments: "" },
    { id: 2, Name: "DOP P 80", type: "", comments: "" },
    { id: 3, Name: "CPW 52 AD", type: "", comments: "" },
  ]);

  const handleAddChemical = (data: {
    chemicalName: string;
    type: string;
    comments: string;
  }) => {
    setTableData((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        Name: data.chemicalName,
        type: data.type,
        comments: data.comments,
      },
    ]);
  };

  const handleUpdateChemical = (data: {
    id: number;
    Name: string;
    type: string;
    comments: string;
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
        <h2 className="text-lg font-medium">Chemical Table</h2>
        <Button
          as="a"
          variant="primary"
          href="#"
          className="inline-block px-5 shadow-md"
          onClick={(e) => {
            e.preventDefault();
            setAddNewChemicalModal(true);
          }}
        >
          Add Chemical
        </Button>
      </div>


      <div className="p-5 box">

        <div className="flex items-center mb-3">
          <span className="mr-2 font-medium">Search:</span>
          <FormInput
            type="text"
            placeholder="Enter chemical name..."
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
                <Table.Th className="whitespace-nowrap">Comments</Table.Th>
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
                  <Table.Td>{row.type}</Table.Td>
                  <Table.Td>{row.comments}</Table.Td>
                  <Table.Td className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        as="a"
                        variant="primary"
                        href="#"
                        className="inline-block w-24 mb-2 mr-1"
                        onClick={(e) => {
                          e.preventDefault();
                          setChemicalToEdit(row);
                          setEditChemicalModal(true);
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
      <CreateNewChemical
        open={addNewChemicalModal}
        onClose={() => setAddNewChemicalModal(false)}
        onAddChemical={handleAddChemical}
      />

      <EditChemical
        open={editChemicalModal}
        onClose={() => setEditChemicalModal(false)}
        chemicalData={chemicalToEdit}
        onUpdateChemical={handleUpdateChemical}
      />
    </>
  );
}


export default Main;


