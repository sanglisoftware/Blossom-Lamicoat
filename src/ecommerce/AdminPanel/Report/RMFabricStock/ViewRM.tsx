
import Table from "@/components/Base/Table";
import Button from "@/components/Base/Button";
import Dialog from "@/components/Base/Headless/Dialog";

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
}

function ViewDifference({ isOpen, onClose, data }: ViewModalProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      size="xl"
      staticBackdrop
    >
      <Dialog.Panel className="p-0">
        {/* Header */}
        <Dialog.Title className="px-5 py-3 border-b">
          <h2 className="font-medium text-base">Detail View</h2>
        </Dialog.Title>

        {/* Body */}
        <Dialog.Description className="px-5 py-4">
          <div className="overflow-x-auto max-h-[55vh] overflow-y-auto">
            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th className="text-center">Sr.No</Table.Th>
                  <Table.Th>Supplier</Table.Th>
                  <Table.Th>Received MTR</Table.Th>
                  <Table.Th className="text-center">Batching MTR</Table.Th>
                  <Table.Th className="text-center">Production MTR</Table.Th>
                  <Table.Th className="text-center">Balence</Table.Th>

                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {data.map((row, index) => (
                  <Table.Tr key={index}>
                    <Table.Td className="text-center">{index + 1}</Table.Td>

                    <Table.Td>{row.Supplier}</Table.Td>
                    <Table.Td>{row.ReceivedMTR}</Table.Td>
                    <Table.Td className="text-center">{row.BatchingMTR}</Table.Td>
                    <Table.Td className="text-center">{row.ProductionMTR}</Table.Td>
                    <Table.Td className="text-center">{row.Balence}</Table.Td>

                    
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </div>
        </Dialog.Description>

        {/* Footer */}
        <Dialog.Footer className="px-5 py-3 border-t text-right">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </Dialog.Footer>
      </Dialog.Panel>
    </Dialog>
  );
}

export default ViewDifference;
