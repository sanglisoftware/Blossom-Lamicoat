
import Table from "@/components/Base/Table";
import Button from "@/components/Base/Button";
import Dialog from "@/components/Base/Headless/Dialog";

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
}

function View({ isOpen, onClose, data }: ViewModalProps) {
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
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Prod</Table.Th>
                  <Table.Th className="text-center">1st Sale</Table.Th>
                  <Table.Th className="text-center">Bal</Table.Th>
                  <Table.Th className="text-center">2nd Sale</Table.Th>
                  <Table.Th className="text-center">Bal</Table.Th>
                  <Table.Th className="text-center">Bit</Table.Th>
                  <Table.Th className="text-center">Sale Cut</Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {data.map((row, index) => (
                  <Table.Tr key={index}>
                    <Table.Td className="text-center">{index + 1}</Table.Td>
                    <Table.Td>{row.date}</Table.Td>
                    <Table.Td>{row.prod}</Table.Td>
                    <Table.Td className="text-center">{row.firstSale}</Table.Td>
                    <Table.Td className="text-center">{row.bal1}</Table.Td>
                    <Table.Td className="text-center">{row.secondSale}</Table.Td>
                    <Table.Td className="text-center">{row.bal2}</Table.Td>
                    <Table.Td className="text-center">{row.bit}</Table.Td>
                    <Table.Td className="text-center">{row.saleCut}</Table.Td>
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

export default View;
