import { useState } from "react";
import Button from "@/components/Base/Button";
import Table from "@/components/Base/Table";
import { FormInput } from "@/components/Base/Form";

import CreatePVCInward from "./CreatePVCInward";
import EditPVCInward from "./EditPVCInward";

function Main() {
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [PVCToEdit, setPVCToEdit] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [PVCData, setPVCData] = useState([
    {
      id: 1,
      supplier: "Supplier A",
      pvc: "PVC-20",
      newRollNo: "R001",
      batchNo: "B001",
      qtyKG: "200",
      qtyMTR: "50",
      comments: "Sample",
    },
    {
      id: 2,
      supplier: "Supplier B",
      pvc: "PVC-25",
      newRollNo: "R002",
      batchNo: "B002",
      qtyKG: "300",
      qtyMTR: "60",
      comments: "Test",
    },
  ]);

  // ADD
  const handleAdd = (data: any) => {
    setPVCData((prev) => [...prev, { id: prev.length + 1, ...data }]);
  };

  // UPDATE
  const handleUpdate = (data: any) => {
    setPVCData((prev) =>
      prev.map((row) => (row.id === data.id ? data : row))
    );
  };

  // DELETE
  const handleDelete = (id: number) => {
    setPVCData((prev) => prev.filter((row) => row.id !== id));
  };

  // SEARCH
  const filteredData = PVCData.filter((row) =>
    row.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-medium">PVC Inward Table</h2>
        <Button
          as="a"
          href="#"
          variant="primary"
          className="px-5 shadow-md"
          onClick={(e) => {
            e.preventDefault();
            setAddModal(true);
          }}
        >
          Add PVC
        </Button>
      </div>

      <div className="p-5 box">
        <div className="flex items-center mb-3">
          <span className="mr-2 font-medium">Search:</span>
          <FormInput
            type="text"
            placeholder="Search by supplier..."
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
                <Table.Th>Supplier</Table.Th>
                <Table.Th>PVC</Table.Th>
                <Table.Th>New Roll No</Table.Th>
                <Table.Th>Batch No</Table.Th>
                <Table.Th>QTY KG</Table.Th>
                <Table.Th>QTY MTR</Table.Th>
                <Table.Th>Comments</Table.Th>
                <Table.Th className="text-center">Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {filteredData.map((row, idx) => (
                <Table.Tr key={row.id}>
                  <Table.Td className="text-center">{idx + 1}</Table.Td>
                  <Table.Td>{row.supplier}</Table.Td>
                  <Table.Td>{row.pvc}</Table.Td>
                  <Table.Td>{row.newRollNo}</Table.Td>
                  <Table.Td>{row.batchNo}</Table.Td>
                  <Table.Td>{row.qtyKG}</Table.Td>
                  <Table.Td>{row.qtyMTR}</Table.Td>
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
                          setPVCToEdit(row);
                          setEditModal(true);
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

      <CreatePVCInward
        open={addModal}
        onClose={() => setAddModal(false)}
        onAddPVCProduct={handleAdd}
      />

      <EditPVCInward
        open={editModal}
        onClose={() => setEditModal(false)}
        data={PVCToEdit}
        onUpdate={handleUpdate}
      />
    </>
  );
}

export default Main;
