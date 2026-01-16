import { useState } from "react";
import Button from "@/components/Base/Button";
import Table from "@/components/Base/Table";
import { FormInput, FormLabel } from "@/components/Base/Form";
import EditInwardList from "./EditInwardList";


interface ChemicalData {
  id: number;
  Name: string;
  QTY: string;
  Supplier: string;
  Batch_No: string;
}


interface ModalData {
  id: number;
  ChemicalName: string;
  QTY: string;
  Supplier: string;
  Batch_No: string;
}

function Main() {
  const [editInwardlistModal, setEditInwardListModal] = useState(false);
  const [InwardToEdit, setInwardToEdit] = useState<ModalData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [tableData, setTableData] = useState<ChemicalData[]>([
    { id: 1, Name: "PVC RESIN PAWDER", QTY: "", Supplier: "", Batch_No: "" },
    { id: 2, Name: "DOP P 80", QTY: "", Supplier: "", Batch_No: "" },
    { id: 3, Name: "CPW 52 AD", QTY: "", Supplier: "", Batch_No: "" },
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
        QTY: data.type,
        Supplier: data.comments,
        Batch_No: "",
      },
    ]);
  };

  const handleUpdateInward = (data: ModalData) => {
    const mappedData: ChemicalData = {
      id: data.id,
      Name: data.ChemicalName,
      QTY: data.QTY,
      Supplier: data.Supplier,
      Batch_No: data.Batch_No,
    };

    setTableData((prev) =>
      prev.map((row) => (row.id === mappedData.id ? mappedData : row))
    );
  };

  const handleDelete = (id: number) => {
    setTableData((prev) => prev.filter((row) => row.id !== id));
  };

  const openEditModal = (row: ChemicalData) => {
    const modalData: ModalData = {
      id: row.id,
      ChemicalName: row.Name,
      QTY: row.QTY,
      Supplier: row.Supplier,
      Batch_No: row.Batch_No,
    };
    setInwardToEdit(modalData);
    setEditInwardListModal(true);
  };



  const filteredData = tableData.filter((row) =>
    row.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
   
      <div className="flex items-center mt-8">
        <h2 className="mr-auto text-lg font-medium">Chemical Table</h2>
      </div>


      <div className="p-5 mt-5 box">

        <div className="flex items-center gap-2 mb-3">
          <FormLabel className="whitespace-nowrap">Search:</FormLabel>
          <FormInput
            type="text"
            placeholder="Enter chemical name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>

  
        <div className="overflow-x-auto">
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th className="whitespace-nowrap text-center">Sr.No</Table.Th>
                <Table.Th className="whitespace-nowrap">Chemical Name</Table.Th>
                <Table.Th className="whitespace-nowrap">QTY</Table.Th>
                <Table.Th className="whitespace-nowrap">Supplier</Table.Th>
                <Table.Th className="whitespace-nowrap">Batch No</Table.Th>
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
                  <Table.Td>{row.QTY}</Table.Td>
                  <Table.Td>{row.Supplier}</Table.Td>
                  <Table.Td>{row.Batch_No}</Table.Td>

                  <Table.Td className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        as="a"
                        variant="primary"
                        href="#"
                        className="inline-block w-24 mb-2 mr-1"
                        onClick={(e:any) => {
                          e.preventDefault();
                          openEditModal(row);
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        as="a"
                        variant="danger"
                        href="#"
                        className="inline-block w-24 mb-2 mr-1"
                        onClick={(e:any) => {
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

 
      <EditInwardList
        open={editInwardlistModal}
        onClose={() => setEditInwardListModal(false)}
        chemicalData={InwardToEdit}
        onUpdateInward={handleUpdateInward}
      />
    </>
  );
}

export default Main;
