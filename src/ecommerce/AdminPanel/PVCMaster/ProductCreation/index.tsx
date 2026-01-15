import { useState } from "react";
import Button from "@/components/Base/Button";
import Table from "@/components/Base/Table";
import { FormInput } from "@/components/Base/Form";

import AddProduct from "./AddProduct";
import EditProduct from "./EditProduct";

function Main() {
  const [addNewPVCProductModal, setAddNewPVCProductModal] = useState(false);
  const [editPVCProductModal, setEditPVCProductModal] = useState(false);
  const [PVCProductToEdit, setPVCProductToEdit] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [PVCProductTableData, setPVCProductTableData] = useState([
    {
      id: 1,
      name: "Product A",
      grm: "200",
      pvcProduct: "20 inch",
      colour: "Red",
      comments: "Sample",
    },
    {
      id: 2,
      name: "Product B",
      grm: "300",
      pvcProduct: "25 inch",
      colour: "Blue",
      comments: "Test",
    },
  ]);

  // ADD
  const handleAddPVCProduct = (data: {
    name: string;
    grm: string;
    pvcProduct: string;
    colour: string;
    comments: string;
  }) => {
    setPVCProductTableData((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        ...data,
      },
    ]);
  };

  // UPDATE
  const handleUpdatePVCProduct = (data: {
    id: number;
    name: string;
    grm: string;
    pvcProduct: string;
    colour: string;
    comments: string;
  }) => {
    setPVCProductTableData((prev) =>
      prev.map((row) => (row.id === data.id ? data : row))
    );
  };

  // DELETE
  const handleDelete = (id: number) => {
    setPVCProductTableData((prev) =>
      prev.filter((row) => row.id !== id)
    );
  };

  // SEARCH
  const filteredData = PVCProductTableData.filter((row) =>
    row.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-medium">PVC Product Table</h2>
        <Button
          as="a"
          href="#"
          variant="primary"
          className="px-5 shadow-md"
          onClick={(e) => {
            e.preventDefault();
            setAddNewPVCProductModal(true);
          }}
        >
          Add Product
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
                <Table.Th>Gramage</Table.Th>
                <Table.Th>Width</Table.Th>
                <Table.Th>Colour</Table.Th>
                <Table.Th>Comments</Table.Th>
                <Table.Th className="text-center">Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {filteredData.map((row, index) => (
                <Table.Tr key={row.id}>
                  <Table.Td className="text-center">{index + 1}</Table.Td>
                  <Table.Td>{row.name}</Table.Td>
                  <Table.Td>{row.grm}</Table.Td>
                  <Table.Td>{row.pvcProduct}</Table.Td>
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
                          setPVCProductToEdit(row);
                          setEditPVCProductModal(true);
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

      <AddProduct
        open={addNewPVCProductModal}
        onClose={() => setAddNewPVCProductModal(false)}
        onAddPVCProduct={handleAddPVCProduct}
      />

      <EditProduct
        open={editPVCProductModal}
        onClose={() => setEditPVCProductModal(false)}
        PVCProductData={PVCProductToEdit}
        onUpdatePVCProduct={handleUpdatePVCProduct}
      />
    </>
  );
}

export default Main;
