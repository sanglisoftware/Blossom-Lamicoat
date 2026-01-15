import { useState } from "react";
import Button from "@/components/Base/Button";
import Table from "@/components/Base/Table";
import { FormInput } from "@/components/Base/Form";
import AddProductList from "./AddProductList";
import EditProductList from "./EditProductList";

function Main() {
  const [addNewFabricModal, setAddNewFabricModal] = useState(false);
  const [editFabricModal, setEditFabricModal] = useState(false);
  const [fabricToEdit, setFabricToEdit] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [fabricTableData, setFabricTableData] = useState([
    {
      id: 1,
      name: "Fabric A",
      grm: "200",
      colour: "Red",
      comments: "Sample",
    },
    {
      id: 2,
      name: "Fabric B",
      grm: "300",
      fabricProduct: "Polyester",
      colour: "Blue",
      comments: "Test",
    },
  ]);

  // ADD
  const handleAddFabric = (data: {
    name: string;
    grm: string;
    colour: string;
    comments: string;
  }) => {
    setFabricTableData((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        ...data,
      },
    ]);
  };

  // UPDATE
  const handleUpdateFabric = (data: {
    id: number;
    name: string;
    grm: string;
    colour: string;
    comments: string;
  }) => {
    setFabricTableData((prev) =>
      prev.map((row) => (row.id === data.id ? data : row))
    );
  };

  // DELETE
  const handleDelete = (id: number) => {
    setFabricTableData((prev) =>
      prev.filter((row) => row.id !== id)
    );
  };

  // SEARCH (by name)
  const filteredData = fabricTableData.filter((row) =>
    row.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-medium">Fabric Product List</h2>
        <Button
          as="a"
          href="#"
          variant="primary"
          className="px-5 shadow-md"
          onClick={(e) => {
            e.preventDefault();
            setAddNewFabricModal(true);
          }}
        >
          Add Unit
        </Button>
      </div>

      <div className="p-5 box">
        <div className="flex items-center mb-3">
          <span className="mr-2 font-medium">Search:</span>
          <FormInput
            type="text"
            placeholder="Search by name..."
            className="w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th className="text-center">Sr.No</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>GRM</Table.Th>
                <Table.Th>Colour</Table.Th>
                <Table.Th>Comment</Table.Th>
                <Table.Th className="text-center">Action</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {filteredData.map((row, index) => (
                <Table.Tr key={row.id}>
                  <Table.Td className="text-center">{index + 1}</Table.Td>
                  <Table.Td>{row.name}</Table.Td>
                  <Table.Td>{row.grm}</Table.Td>
                  <Table.Td>{row.colour}</Table.Td>
                  <Table.Td>{row.comments}</Table.Td>
                  <Table.Td className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        as="a"
                        href="#"
                        variant="primary"
                        className="w-24"
                        onClick={(e) => {
                          e.preventDefault();
                          setFabricToEdit(row);
                          setEditFabricModal(true);
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        as="a"
                        href="#"
                        variant="danger"
                        className="w-24"
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

      <AddProductList
        open={addNewFabricModal}
        onClose={() => setAddNewFabricModal(false)}
        onAddPVCProduct={handleAddFabric}
      />

      <EditProductList
        open={editFabricModal}
        onClose={() => setEditFabricModal(false)}
        PVCProductData={fabricToEdit}
        onUpdatePVCProduct={handleUpdateFabric}
      />
    </>
  );
}

export default Main;
