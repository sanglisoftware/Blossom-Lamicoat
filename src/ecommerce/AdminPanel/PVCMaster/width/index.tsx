import { useState } from "react";
import Button from "@/components/Base/Button";
import Table from "@/components/Base/Table";
import { FormInput } from "@/components/Base/Form";
import EditWidth from "./EditWidth";
import AddWidth from "./AddWidth";




function Main() {
  const [addNewWidthModal, setAddNewWidthModal] = useState(false);
  const [editWidthModal, setEditWidthModal] = useState(false);
  const [WidthToEdit, setWidthToEdit] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [WidthtableData, setWidthTableData] = useState([
    { id: 1, grm: "200" },
    { id: 2, grm: "300" },
    { id: 3, grm: "500" },
  ]);

   const handleWidth = (data: { grm: string }) => {
  setWidthTableData((prev) => [
    ...prev,
    {
      id: prev.length + 1,
      grm: data.grm,
    },
  ]);
};


  const handleUpdateWidth = (data: {
    id: number;
    grm: string;
  
  }) => {
    setWidthTableData((prev) =>
      prev.map((row) => (row.id === data.id ? data : row))
    );
  };


  const handleDelete = (id: number) => {
    setWidthTableData((prev) => prev.filter((row) => row.id !== id));
  };

  const filteredData = WidthtableData.filter((row) =>
    row.grm.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-medium">Width Table</h2>
        <Button
          as="a"
          variant="primary"
          href="#"
          className="inline-block px-5 shadow-md"
          onClick={(e) => {
            e.preventDefault();
            setAddNewWidthModal(true);
          }}
        >
          Add Name
        </Button>
      </div>

      <div className="p-5 box">
        <div className="flex items-center mb-3">
          <span className="mr-2 font-medium">Search:</span>
          <FormInput
            type="text"
            placeholder="Enter grm..."
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
                  Grm
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
                    {row.grm}
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
                          setWidthToEdit(row);
                          setEditWidthModal(true);
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
       <AddWidth
        open={addNewWidthModal}
        onClose={() => setAddNewWidthModal(false)}
        onAddWidth={handleWidth}
      />

      <EditWidth
        open={editWidthModal}
        onClose={() => setEditWidthModal(false)}
        WidthData={WidthToEdit}
        onUpdateGram={handleUpdateWidth}
      />
    </>
  );
}

export default Main;
