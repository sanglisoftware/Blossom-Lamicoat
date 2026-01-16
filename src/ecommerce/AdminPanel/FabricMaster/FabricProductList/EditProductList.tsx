import { useEffect, useState } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";

/* ✅ Props */
interface EditProductListProps {
  open: boolean;
  onClose: () => void;
  PVCProductData: {
    id: number;
    name: string;
    grm: string;
    colour: string;
    comments: string;
  } | null;
  onUpdatePVCProduct: (data: {
    id: number;
    name: string;
    grm: string;
    colour: string;
    comments: string;
  }) => void;
}

const EditProductList: React.FC<EditProductListProps> = ({
  open,
  onClose,
  PVCProductData,
  onUpdatePVCProduct,
}) => {
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    grm: "",
    colour: "",
    comments: "",
  });

  /* ✅ Load selected row data */
  useEffect(() => {
    if (PVCProductData) {
      setFormData(PVCProductData);
    }
  }, [PVCProductData]);

  const handleUpdate = () => {
    if (!formData.name || !formData.grm || !formData.colour) return;
    onUpdatePVCProduct(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} staticBackdrop size="md">
      <Dialog.Panel>
        <Dialog.Title>
          <h2 className="text-base font-medium">Edit Fabric Product</h2>
        </Dialog.Title>

        <Dialog.Description className="mt-4 space-y-4">
          {/* Name */}
          <div>
            <FormLabel>Name</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          {/* GRM */}
          <div>
            <FormLabel>GRM</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter GRM"
              value={formData.grm}
              onChange={(e) =>
                setFormData({ ...formData, grm: e.target.value })
              }
            />
          </div>

          {/* Colour */}
          <div>
            <FormLabel>Colour</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter colour"
              value={formData.colour}
              onChange={(e) =>
                setFormData({ ...formData, colour: e.target.value })
              }
            />
          </div>

          {/* Comments */}
          <div>
            <FormLabel>Comments</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter comments"
              value={formData.comments}
              onChange={(e) =>
                setFormData({ ...formData, comments: e.target.value })
              }
            />
          </div>
        </Dialog.Description>

        <Dialog.Footer className="mt-5 text-right">
          <Button
            variant="secondary"
            className="w-24 mr-2"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            className="w-24"
            onClick={handleUpdate}
          >
            Update
          </Button>
        </Dialog.Footer>
      </Dialog.Panel>
    </Dialog>
  );
};

export default EditProductList;
