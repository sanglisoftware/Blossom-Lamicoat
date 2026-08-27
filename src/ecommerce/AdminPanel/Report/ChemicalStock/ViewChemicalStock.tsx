
import Table from "@/components/Base/Table";
import Button from "@/components/Base/Button";
import Dialog from "@/components/Base/Headless/Dialog";

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: Array<{
    Date: string;
    Supplier: string;
    InvoiceNo: string;
    OP_BAL: number;
    Received: number;
    Used: number;
    Balance: number;
    Unit: string;
  }>;
}

function ViewChemicalStock({ isOpen, onClose, title, data }: ViewModalProps) {
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
          <h2 className="font-medium text-base">{title}</h2>
        </Dialog.Title>

        {/* Body */}
        <Dialog.Description className="px-5 py-4">
          <div className="overflow-x-auto max-h-[55vh] overflow-y-auto">
            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th className="text-center">Sr.No</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Supplier</Table.Th>
                  <Table.Th>Invoice No</Table.Th>
                  <Table.Th>OP/BAL</Table.Th>
                  <Table.Th className="text-center">Received</Table.Th>
                  <Table.Th className="text-center">Unit</Table.Th>
                  <Table.Th className="text-center">Used</Table.Th>
                  <Table.Th className="text-center">Balance</Table.Th>

                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {data.length === 0 ? (
                  <Table.Tr>
                    <Table.Td className="text-center" colSpan={9}>
                      No stock details found
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  data.map((row, index) => (
                    <Table.Tr key={`${row.Date}-${row.InvoiceNo}-${index}`}>
                      <Table.Td className="text-center">{index + 1}</Table.Td>
                      <Table.Td>{row.Date}</Table.Td>
                      <Table.Td>{row.Supplier}</Table.Td>
                      <Table.Td>{row.InvoiceNo}</Table.Td>
                      <Table.Td className="text-center">{row.OP_BAL}</Table.Td>
                      <Table.Td className="text-center">{row.Received}</Table.Td>
                      <Table.Td className="text-center">{row.Unit}</Table.Td>
                      <Table.Td className="text-center">{row.Used}</Table.Td>
                      <Table.Td className="text-center">{row.Balance}</Table.Td>
                    </Table.Tr>
                  ))
                )}
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

export default ViewChemicalStock;
