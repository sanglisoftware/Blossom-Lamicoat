import { useState } from "react";
import Button from "@/components/Base/Button";
import Table from "@/components/Base/Table";
import { FormInput } from "@/components/Base/Form";
import ViewPVC from "./ViewPVC";

function Main() {
  const [searchTerm, setSearchTerm] = useState("");
const [detailData, setDetailData] = useState<any[]>([]);
const [isViewModalOpen, setIsViewModalOpen] = useState(false);



  const [tableData, setTableData] = useState([
    { id: 1, PVC: "PVC RESIN PAWDER", KG: "", MTR:""},
    { id: 2, PVC: "PVC RESIN PAWDER", KG: "", MTR:""},
     { id: 3, PVC: "PVC RESIN PAWDER", KG: "", MTR:""},

  ]);




  const handleDelete = (id: number) => {
    setTableData((prev) => prev.filter((row) => row.id !== id));
  };

  const filteredData = tableData.filter((row) =>
    row.PVC.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-medium">RM PVC Stock</h2>
      </div>


      <div className="p-5 box">

        <div className="flex items-center mb-3">
          <span className="mr-2 font-medium">Search:</span>
          <FormInput
            type="text"
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
                <Table.Th className="whitespace-nowrap">PVC</Table.Th>
                <Table.Th className="whitespace-nowrap">KG</Table.Th>
                <Table.Th className="whitespace-nowrap">MTR</Table.Th>

                <Table.Th className="whitespace-nowrap text-center">Action</Table.Th>
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
                  <Table.Td>{row.PVC}</Table.Td>
                  <Table.Td>{row.KG}</Table.Td>
                  <Table.Td>{row.MTR}</Table.Td>

                  <Table.Td className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
  as="a"
  variant="primary"
  href="#"
  className="inline-block w-24 mb-2 mr-1"
  onClick={(e) => {
    e.preventDefault();

    // Example data, replace with real fetched data if needed
    setDetailData([
      { Date:"",Supplier: "", OP_BAL: "", ReceivedKG: 100, Used: 50, Balence:"" },
      { Date:"",Supplier: "", OP_BAL: "", ReceivedKG: 100, Used: 50, Balence:"" },
    ]);

    setIsViewModalOpen(true);
  }}
>
  View
</Button>


                      
                    </div>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      </div>
<ViewPVC
  isOpen={isViewModalOpen}
  onClose={() => setIsViewModalOpen(false)}
  data={detailData}
/>

   
    </>
  );
}


export default Main;


