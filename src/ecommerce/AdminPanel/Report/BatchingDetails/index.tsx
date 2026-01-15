import { useState } from "react";
import Button from "@/components/Base/Button";
import Table from "@/components/Base/Table";
import { FormInput } from "@/components/Base/Form";


function Main() {
  const [addNewChemicalModal, setAddNewChemicalModal] = useState(false);
  const [editChemicalModal, setEditChemicalModal] = useState(false);
  const [chemicalToEdit, setChemicalToEdit] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [tableData, setTableData] = useState([
    { id: 1, Date: "", Particular: "1", LOTNO:"",BatchingMTR:"", ProductionMTR:"",RemainingFAB:"",ProdDate:"",RejectedQTY:""}]);

//   const handleAddChemical = (data: {
//     Name: string;
//     Comments: string;
//     GSM_GLM: string;
//     Colour: string;
//   }) => {
//     setTableData((prev) => [
//       ...prev,
//       {
//         id: prev.length + 1,
//         Name: data.Name,
//         Comments: data.Comments,
//         GSM_GLM: data.GSM_GLM,
//         Colour: data.Colour,

//       },
//     ]);
//   };

//   const handleUpdateChemical = (data: {
//   id: number;
//   Name: string;
//   Comments: string;
//   GSM_GLM: string;
//   Colour: string;
// }) => {
//   setTableData((prev) =>
//     prev.map((row) =>
//       row.id === data.id ? { ...row, ...data } : row
//     )
//   );
// };


//   const handleDelete = (id: number) => {
//     setTableData((prev) => prev.filter((row) => row.id !== id));
//   };

  const filteredData = tableData.filter((row) =>
    row.Date.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-medium">Batching Details With LOT No.</h2>
      </div>


      <div className="p-5 box">

        <div className="flex items-center mb-3">
          <span className="mr-2 font-medium">Search:</span>
          <FormInput
            type="text"
            placeholder="search"
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
                <Table.Th className="whitespace-nowrap">Date</Table.Th>
                <Table.Th className="whitespace-nowrap">Particular</Table.Th>
                <Table.Th className="whitespace-nowrap">LOT No</Table.Th>

                <Table.Th className="whitespace-nowrap">Batching MTR</Table.Th>
                <Table.Th className="whitespace-nowrap">Production MTR</Table.Th>
                <Table.Th className="whitespace-nowrap">Remaining FAB</Table.Th>
                <Table.Th className="whitespace-nowrap">Prod Date</Table.Th>
                <Table.Th className="whitespace-nowrap">Rejected QTY</Table.Th>
              
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
                

                  <Table.Td>{row.Date}</Table.Td>
                  <Table.Td>{row.Particular}</Table.Td>
                  <Table.Td>{row.LOTNO}</Table.Td>
                  <Table.Td>{row.BatchingMTR}</Table.Td>
                  <Table.Td>{row.ProductionMTR}</Table.Td>
                  <Table.Td>{row.RemainingFAB}</Table.Td>
                  <Table.Td>{row.ProdDate}</Table.Td>
                  <Table.Td>{row.RejectedQTY}</Table.Td>
                  

                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      </div>
    
    </>
  );
}


export default Main;


