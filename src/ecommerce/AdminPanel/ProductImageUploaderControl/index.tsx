import React, { useRef, useState, useEffect } from "react";
import Lucide from "@/components/Base/Lucide";
import Tippy from "@/components/Base/Tippy";
import "tippy.js/dist/tippy.css";
import { FormLabel } from "@/components/Base/Form";

type ImageItem = {
  id: string;
  url: string;
  file?: File; // optional, because old images might be from a server
};

const ImageUploader: React.FC<{ initialImages?: ImageItem[] }> = ({
  initialImages = [],
}) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages = Array.from(files).map((file) => ({
        id: `${file.name}-${Date.now()}`, // unique id
        url: URL.createObjectURL(file),
        file,
      }));
      setImages((prev) => [...prev, ...newImages]);

      // Reset the input value so selecting the same file works again
      e.target.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const droppedImages = Array.from(files).map((file) => ({
        id: `${file.name}-${Date.now()}`,
        url: URL.createObjectURL(file),
        file,
      }));
      setImages((prev) => [...prev, ...droppedImages]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRemove = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <>
      <div className="col-span-12 sm:col-span-12 font-medium">
        <FormLabel htmlFor="horizontal-form-1">Images</FormLabel>

        <div className="col-span-12 sm:col-span-12 border-2 border-dashed py-3 rounded-md xl:mt-0 dark:border-darkmode-400">
          <div className="grid grid-cols-10 gap-5 pl-4 pr-5">
            {images.map((img) => (
              <div
                key={img.id}
                className="relative col-span-5 cursor-pointer md:col-span-2 h-28 image-fit zoom-in"
              >
                <img
                  className="rounded-md object-cover h-full w-full"
                  src={img.url}
                  alt="Uploaded"
                />
                <Tippy content="Remove this image?">
                  <button
                    type="button"
                    onClick={() => handleRemove(img.id)}
                    className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 -mt-2 -mr-2 text-white rounded-full bg-danger"
                  >
                    <Lucide icon="X" className="w-4 h-4" />
                  </button>
                </Tippy>
              </div>
            ))}
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="relative flex items-center justify-center px-4 pb-4 mt-5 cursor-pointer border-2 border-dashed rounded-md"
            onClick={() => fileInputRef.current?.click()}
          >
            <Lucide icon="Image" className="w-4 h-4 mr-2" />
            <span className="mr-1 text-primary">Upload a file</span> or drag and
            drop
          </div>

          <input
            id="horizontal-form-1"
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden" // instead of absolute + opacity-0
          />
        </div>
      </div>
    </>
  );
};

export default ImageUploader;
