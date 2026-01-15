import { useEffect, useState } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";

interface EditProductProps {
  open: boolean;
  onClose: () => void;
  PVCProductData: {
    id: number;
    name: string;
    grm: string;
    pvcProduct: string;
    colour: string;
    comments: string;
  } | null;
  onUpdatePVCProduct: (data: {
    id: number;
    name: string;
    grm: string;
    pvcProduct: string;
    colour: string;
    comments: string;
  }) => void;
}

const EditProduct: React.FC<EditProductProps> = ({
  open,
  onClose,
  PVCProductData,
  onUpdatePVCProduct,
}) => {
  const [formData, setFormData] = useState<any>({
    id: 0,
    name: "",
    grm: "",
    pvcProduct: "",
    colour: "",
    comments: "",
  });

  useEffect(() => {
    if (PVCProductData) {
      setFormData(PVCProductData);
    }
  }, [PVCProductData]);

  const handleUpdate = () => {
    onUpdatePVCProduct(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} staticBackdrop size="md">
      <Dialog.Panel>
        <Dialog.Title>
          <h2 className="text-base font-medium">Edit PVC Product</h2>
        </Dialog.Title>

        <Dialog.Description className="space-y-4">
          <div>
            <FormLabel>Name</FormLabel>
            <FormInput
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div>
            <FormLabel>Gramage</FormLabel>
            <FormInput
              value={formData.grm}
              onChange={(e) =>
                setFormData({ ...formData, grm: e.target.value })
              }
            />
          </div>

          <div>
            <FormLabel>Width</FormLabel>
            <FormInput
              value={formData.pvcProduct}
              onChange={(e) =>
                setFormData({ ...formData, pvcProduct: e.target.value })
              }
            />
          </div>

          <div>
            <FormLabel>Colour</FormLabel>
            <FormInput
              value={formData.colour}
              onChange={(e) =>
                setFormData({ ...formData, colour: e.target.value })
              }
            />
          </div>

          <div>
            <FormLabel>Comments</FormLabel>
            <FormInput
              value={formData.comments}
              onChange={(e) =>
                setFormData({ ...formData, comments: e.target.value })
              }
            />
          </div>
        </Dialog.Description>

        <Dialog.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button variant="primary" onClick={handleUpdate}>
            Update
          </Button>
        </Dialog.Footer>
      </Dialog.Panel>
    </Dialog>
  );
};

export default EditProduct;
