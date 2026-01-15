import { useState } from "react";
import Button from "@/components/Base/Button";
import Table from "@/components/Base/Table";
import { FormInput } from "@/components/Base/Form";
import ViewRM from "./ViewRM";

function Main() {
  const [searchTerm, setSearchTerm] = useState("");
const [detailData, setDetailData] = useState<any[]>([]);
const [isViewModalOpen, setIsViewModalOpen] = useState(false);



  const [tableData, setTableData] = useState([
    { id: 1, Fabric: "PVC RESIN PAWDER", MTR: "", Difference:""},
    { id: 2, Fabric: "PVC RESIN PAWDER", MTR: "", Difference:""},
    { id: 3, Fabric: "PVC RESIN PAWDER", MTR: "", Difference:"" },
  ]);




  const handleDelete = (id: number) => {
    setTableData((prev) => prev.filter((row) => row.id !== id));
  };

  const filteredData = tableData.filter((row) =>
    row.Fabric.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-medium">Fabric Difference</h2>
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
                <Table.Th className="whitespace-nowrap">Fabric</Table.Th>
                <Table.Th className="whitespace-nowrap">MTR</Table.Th>
                <Table.Th className="whitespace-nowrap">Difference</Table.Th>

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
                  <Table.Td>{row.Fabric}</Table.Td>
                  <Table.Td>{row.MTR}</Table.Td>
                  <Table.Td>{row.Difference}</Table.Td>

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
      { Supplier: "201", ReceivedMTR: "PVC Resin", BatchingMTR: 100, ProductionMTR: 50, Balence:"" },
         { Supplier: "201", ReceivedMTR: "PVC Resin", BatchingMTR: 100, ProductionMTR: 50, Balence:"" },


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
<ViewRM
  isOpen={isViewModalOpen}
  onClose={() => setIsViewModalOpen(false)}
  data={detailData}
/>

   
    </>
  );
}


export default Main;


