import { useState } from "react";
import Button from "@/components/Base/Button";
import Table from "@/components/Base/Table";
import { FormInput } from "@/components/Base/Form";
import AddColour from "./AddColour";
import EditColour from "./EditColour";





function Main() {
  const [addNewColourModal, setAddNewColourModal] = useState(false);
  const [editColourModal, setEditColourModal] = useState(false);
  const [ColourToEdit, setColourToEdit] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [ColourtableData, setColourTableData] = useState([
    { id: 1, Name: "xyz" },
    { id: 2, Name: "abc" },
    { id: 3, Name: "qwe" },
  ]);

   const handleColour = (data: { Name: string }) => {
  setColourTableData((prev) => [
    ...prev,
    {
      id: prev.length + 1,
      Name: data.Name,
    },
  ]);
};


  const handleUpdatColour = (data: {
    id: number;
    Name: string;
  
  }) => {
    setColourTableData((prev) =>
      prev.map((row) => (row.id === data.id ? data : row))
    );
  };


  const handleDelete = (id: number) => {
    setColourTableData((prev) => prev.filter((row) => row.id !== id));
  };

  const filteredData = ColourtableData.filter((row) =>
    row.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-medium">Colour Table</h2>
        <Button
          as="a"
          variant="primary"
          href="#"
          className="inline-block px-5 shadow-md"
          onClick={(e) => {
            e.preventDefault();
            setAddNewColourModal(true);
          }}
        >
          Add Colour
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
                          setColourToEdit(row);
                          setEditColourModal(true);
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
       <AddColour
        open={addNewColourModal}
        onClose={() => setAddNewColourModal(false)}
        onAddColour={handleColour}
      />

      <EditColour
        open={editColourModal}
        onClose={() => setEditColourModal(false)}
        ColourData={ColourToEdit}
        onUpdateColour={handleUpdatColour}
      />
    </>
  );
}

export default Main;
