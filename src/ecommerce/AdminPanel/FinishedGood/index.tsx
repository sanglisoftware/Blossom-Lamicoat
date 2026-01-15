import { useState } from "react";
import Button from "@/components/Base/Button";
import Table from "@/components/Base/Table";
import { FormInput } from "@/components/Base/Form";
import AddGoods from "./Quality/AddGoods";
import EditGoods from "./Quality/EditGoods";

function Main() {
  const [addNewChemicalModal, setAddNewChemicalModal] = useState(false);
  const [editChemicalModal, setEditChemicalModal] = useState(false);
  const [chemicalToEdit, setChemicalToEdit] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [tableData, setTableData] = useState([
    { id: 1, Name: "PVC RESIN PAWDER", Comments: "", GSM_GLM:"",Colour:"" },
    { id: 2, Name: "DOP P 80", Comments: "", GSM_GLM:"",Colour:"" },
    { id: 3, Name: "CPW 52 AD", Comments: "", GSM_GLM:"",Colour:"" },
  ]);

  const handleAddChemical = (data: {
    Name: string;
    Comments: string;
    GSM_GLM: string;
    Colour: string;
  }) => {
    setTableData((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        Name: data.Name,
        Comments: data.Comments,
        GSM_GLM: data.GSM_GLM,
        Colour: data.Colour,

      },
    ]);
  };

  const handleUpdateChemical = (data: {
  id: number;
  Name: string;
  Comments: string;
  GSM_GLM: string;
  Colour: string;
}) => {
  setTableData((prev) =>
    prev.map((row) =>
      row.id === data.id ? { ...row, ...data } : row
    )
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
        <h2 className="text-lg font-medium">Quality Table</h2>
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
          Add Product
        </Button>
      </div>


      <div className="p-5 box">

        <div className="flex items-center mb-3">
          <span className="mr-2 font-medium">Search:</span>
          <FormInput
            type="text"
            // placeholder="Enter chemical name..."
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
                <Table.Th className="whitespace-nowrap">Comments</Table.Th>
                <Table.Th className="whitespace-nowrap">GSM/GLM</Table.Th>
                <Table.Th className="whitespace-nowrap">Colour</Table.Th>
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
                  <Table.Td>{row.Comments}</Table.Td>
                  <Table.Td>{row.GSM_GLM}</Table.Td>
                  <Table.Td>{row.Colour}</Table.Td>
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
      <AddGoods
        open={addNewChemicalModal}
        onClose={() => setAddNewChemicalModal(false)}
        onAddChemical={handleAddChemical}
      />

      <EditGoods
        open={editChemicalModal}
        onClose={() => setEditChemicalModal(false)}
        chemicalData={chemicalToEdit}
        onUpdateChemical={handleUpdateChemical}
      />
    </>
  );
}


export default Main;


