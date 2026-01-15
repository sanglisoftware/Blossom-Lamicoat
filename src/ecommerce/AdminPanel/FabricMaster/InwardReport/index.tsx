import { useState } from "react";
import Button from "@/components/Base/Button";
import Table from "@/components/Base/Table";
import { FormInput } from "@/components/Base/Form";
import EditInwardReport from "./EditInwardReport";

interface PVCInward {
  id: number;
  fabric: string;
  qty: string;
  batchNo: string;
  comments: string;
}

function Main() {
  const [editPVCProductModal, setEditPVCProductModal] = useState(false);
  const [PVCProductToEdit, setPVCProductToEdit] =
    useState<PVCInward | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [PVCProductTableData, setPVCProductTableData] = useState<PVCInward[]>([
    {
      id: 1,
      fabric: "PVC",
      qty: "500",
      batchNo: "B-101",
      comments: "First inward",
    },
    {
      id: 2,
      fabric: "DOC",
      qty: "300",
      batchNo: "B-102",
      comments: "Second inward",
    },
  ]);

  // UPDATE
  const handleUpdatePVCProduct = (data: PVCInward) => {
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

  // SEARCH (Fabric)
  const filteredData = PVCProductTableData.filter((row) =>
    row.fabric.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-medium">Inward Report</h2>
      </div>

      {/* Table Box */}
      <div className="p-5 box">
        {/* Search */}
        <div className="flex items-center mb-3">
          <span className="mr-2 font-medium">Search:</span>
          <FormInput
            type="text"
            placeholder="Search by fabric..."
            className="w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th className="text-center">Sr.No</Table.Th>
                <Table.Th>Fabric</Table.Th>
                <Table.Th>Qty</Table.Th>
                <Table.Th>Batch No</Table.Th>
                <Table.Th>Comments</Table.Th>
                <Table.Th className="text-center">Action</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {filteredData.map((row, index) => (
                <Table.Tr key={row.id}>
                  <Table.Td className="text-center">{index + 1}</Table.Td>
                  <Table.Td>{row.fabric}</Table.Td>
                  <Table.Td>{row.qty}</Table.Td>
                  <Table.Td>{row.batchNo}</Table.Td>
                  <Table.Td>{row.comments}</Table.Td>
                  <Table.Td className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="primary"
                        className="w-20"
                        onClick={() => {
                          setPVCProductToEdit(row);
                          setEditPVCProductModal(true);
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="danger"
                        className="w-20"
                        onClick={() => handleDelete(row.id)}
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

      {/* Edit Modal */}
      <EditInwardReport
        open={editPVCProductModal}
        onClose={() => setEditPVCProductModal(false)}
        PVCProductData={PVCProductToEdit}
        onUpdatePVCProduct={handleUpdatePVCProduct}
      />
    </>
  );
}

export default Main;
