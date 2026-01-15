import { useState } from "react";
import Button from "@/components/Base/Button";
import Table from "@/components/Base/Table";
import { FormInput } from "@/components/Base/Form";
import AddGrade from "./AddGrade";
import EditGrade from "./EditGrade";




function Main() {
  const [addNewGradeModal, setAddNewGradeModal] = useState(false);
  const [editGradeModal, setEditGradeModal] = useState(false);
  const [GradeToEdit, setGradeToEdit] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [GradetableData, setGradeTableData] = useState([
    { id: 1, Name: "xyz" },
    { id: 2, Name: "abc" },
    { id: 3, Name: "qwe" },
  ]);

   const handleGrade = (data: { Name: string }) => {
  setGradeTableData((prev) => [
    ...prev,
    {
      id: prev.length + 1,
      Name: data.Name,
    },
  ]);
};


  const handleUpdatGrade = (data: {
    id: number;
    Name: string;
  
  }) => {
    setGradeTableData((prev) =>
      prev.map((row) => (row.id === data.id ? data : row))
    );
  };


  const handleDelete = (id: number) => {
    setGradeTableData((prev) => prev.filter((row) => row.id !== id));
  };

  const filteredData = GradetableData.filter((row) =>
    row.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-medium">Grade Table</h2>
        <Button
          as="a"
          variant="primary"
          href="#"
          className="inline-block px-5 shadow-md"
          onClick={(e) => {
            e.preventDefault();
            setAddNewGradeModal(true);
          }}
        >
          Add Grade
        </Button>
      </div>

      <div className="p-5 box">
        <div className="flex items-center mb-3">
          <span className="mr-2 font-medium">Search:</span>
          <FormInput
            type="text"
            placeholder="Enter name..."
            className="w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th className="whitespace-nowrap text-center">
                  Sr.No
                </Table.Th>
                <Table.Th className="whitespace-nowrap">
                  Name
                </Table.Th>
                <Table.Th className="whitespace-nowrap text-center">
                  Actions
                </Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {filteredData.map((row, index) => (
                <Table.Tr key={row.id}>
                  <Table.Td className="text-center">
                    {index + 1}
                  </Table.Td>

                  <Table.Td>
                    {row.Name}
                  </Table.Td>

                  <Table.Td className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        as="a"
                        variant="primary"
                        href="#"
                        className="inline-block w-24 mb-2"
                        onClick={(e) => {
                          e.preventDefault();
                          setGradeToEdit(row);
                          setEditGradeModal(true);
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        as="a"
                        variant="danger"
                        href="#"
                        className="inline-block w-24 mb-2"
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
       <AddGrade
        open={addNewGradeModal}
        onClose={() => setAddNewGradeModal(false)}
        onAddGrade={handleGrade}
      />

      <EditGrade
        open={editGradeModal}
        onClose={() => setEditGradeModal(false)}
        GradeData={GradeToEdit}
        onUpdateGrade={handleUpdatGrade}
      />
    </>
  );
}

export default Main;
