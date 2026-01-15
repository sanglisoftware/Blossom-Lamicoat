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
    { id: 1, Date: "", Particular: "1", PVCKG:"1",RollNo:"1", Type:"", GRM:"",Fabric:"",LOTNO:"",BatchNo:"",TotalBatchMTR:"", LOTwiseMTR:"",ProdMTR:"",AVG:"",
        first:"", second:"",BIT:"", CUT:"", Avg:""},
   
  ]);

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
        <h2 className="text-lg font-medium">Daily Production Record</h2>
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
                <Table.Th className="whitespace-nowrap">PVC KG</Table.Th>
                <Table.Th className="whitespace-nowrap">Roll No</Table.Th>
                <Table.Th className="whitespace-nowrap">Type(PVC Name)</Table.Th>
                <Table.Th className="whitespace-nowrap">GRM</Table.Th>
                <Table.Th className="whitespace-nowrap">Fabric</Table.Th>
                <Table.Th className="whitespace-nowrap">LOT No</Table.Th>
                <Table.Th className="whitespace-nowrap">Batch MTR</Table.Th>
                <Table.Th className="whitespace-nowrap">Total Batch MTR</Table.Th>
                <Table.Th className="whitespace-nowrap">LOT wise PROD MTR</Table.Th>
                <Table.Th className="whitespace-nowrap">PROD MTR</Table.Th>
                <Table.Th className="whitespace-nowrap">AVG</Table.Th>
                <Table.Th className="whitespace-nowrap">1st</Table.Th>
                <Table.Th className="whitespace-nowrap">2nd</Table.Th>
                <Table.Th className="whitespace-nowrap">BIT</Table.Th>
                <Table.Th className="whitespace-nowrap">Cut</Table.Th>
                <Table.Th className="whitespace-nowrap">AVG</Table.Th>
              
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
                  <Table.Td>{row.PVCKG}</Table.Td>
                  <Table.Td>{row.RollNo}</Table.Td>
                  <Table.Td>{row.Type}</Table.Td>
                  <Table.Td>{row.GRM}</Table.Td>
                  <Table.Td>{row.Fabric}</Table.Td>
                  <Table.Td>{row.LOTNO}</Table.Td>
                  <Table.Td>{row.BatchNo}</Table.Td>
                  <Table.Td>{row.TotalBatchMTR}</Table.Td>
                  <Table.Td>{row.LOTwiseMTR}</Table.Td>
                  <Table.Td>{row.ProdMTR}</Table.Td>
                  <Table.Td>{row.AVG}</Table.Td>
                  <Table.Td>{row.first}</Table.Td>
                  <Table.Td>{row.RollNo}</Table.Td>
                  <Table.Td>{row.second}</Table.Td>
                  <Table.Td>{row.BIT}</Table.Td>
                  <Table.Td>{row.CUT}</Table.Td>
                  <Table.Td>{row.Avg}</Table.Td>

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


