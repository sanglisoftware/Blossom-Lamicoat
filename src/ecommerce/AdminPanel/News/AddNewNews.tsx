import _, { set } from "lodash";
import clsx from "clsx";
import { useState, useRef } from "react";
import fakerData from "@/utils/faker";
import Button from "@/components/Base/Button";
import {
  FormInput,
  FormLabel,
  FormSelect,
  FormSwitch,
  FormTextarea,
} from "@/components/Base/Form";
import Lucide from "@/components/Base/Lucide";
import { Dialog, Menu } from "@/components/Base/Headless";
import "@/assets/css/vendors/tabulator.css";
import Dropzone, { DropzoneElement } from "@/components/Base/Dropzone";
import axios from "axios";
import { SuccessModalConfig } from "../CommonModals/SuccessModal/SuccessModalConfig";
import SuccessModal from "../CommonModals/SuccessModal/SuccessModal";
import { BASE_URL } from "@/ecommerce/config/config";
import Litepicker from "@/components/Base/Litepicker";

interface AddNewsModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddNewsModal: React.FC<AddNewsModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const token = localStorage.getItem("token");

  //Success Modal config
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalConfig, setSuccessModalConfig] =
    useState<SuccessModalConfig>({
      title: "",
      subtitle: "",
      icon: "CheckCircle",
      buttonText: "OK",
      onButtonClick: () => {},
    });

  //Image/file Upload control reference
  const dropzoneRef = useRef<DropzoneElement | null>(null);

  //Collection Modal (useState)
  const [formData, setFormData] = useState({
    href: "",
    card: "",
    card2: "",
    title: "",
    para: "",
    views: "",
    comment: "",
    date: "",
    d: "",
    video: "",
    isActive: true,
  });

  //Validation Errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  //Form Submission: Save button click
  const handleSubmit = async () => {
    const errors: Record<string, string> = {};

    if (!formData.href) errors.href = "value required.";
    if (!formData.card) errors.card = "value required.";
    if (!formData.card2) errors.card2 = "value required.";
    if (!formData.title) errors.title = "value required.";
    if (!formData.para) errors.para = "value required.";
    if (!formData.video) errors.video = "value required.";
    // Validate Views
    if (!formData.views) {
      errors.views = "Views is required.";
    } else if (!/^\d+$/.test(formData.views)) {
      errors.views = "Views must be a numeric value.";
    }
    // Validate Comment
    if (!formData.comment) {
      errors.comment = "Comment is required.";
    } else if (!/^\d+$/.test(formData.comment)) {
      errors.comment = "Comment must be a numeric value.";
    }

    if (!formData.date) {
      errors.date = "Date is required.";
    }

    const dzFiles = dropzoneRef.current?.dropzone?.getAcceptedFiles() || [];
    if (!dzFiles.length) {
      errors.images = "At least one image is required.";
    }

    //setting errors
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // Proceed with submission
    const data = new FormData();
    dzFiles.forEach((file) => {
      data.append("Images", file);
    });
    //data.append("images", acceptedFiles[0]);
    data.append("href", formData.href);
    data.append("card", formData.card);
    data.append("card2", formData.card2);
    data.append("title", formData.title);
    data.append("para", formData.para);
    data.append("views", formData.views);
    data.append("comment", formData.comment);
    data.append("date", formData.date);
    data.append("video", formData.video);
    data.append("isActive", formData.isActive ? "1" : "0");

    try {
      const response = await axios.post(
        `${BASE_URL}/api/inventory/news/upload`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 200 || response.status === 201) {
        //clear form data after submission
        //clearFormData();
        setFormErrors({});
        dropzoneRef.current?.dropzone?.removeAllFiles(true);
        onClose(); // close form modal

        //success modal
        setSuccessModalConfig({
          title: "News Successfully",
          subtitle: "The News has been saved to the system.",
          icon: "CheckCircle",
          buttonText: "Ok",
          onButtonClick: () => {
            setIsSuccessModalOpen(false);
          },
        });
        setIsSuccessModalOpen(true);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      alert(error.response?.data?.message || "Something went wrong.");
    }
  };

  function convertDate(input: string): string {
    const months: { [key: string]: string } = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dec: "12",
    };

    // Split the input: e.g., "07 Aug, 2025"
    const parts = input.trim().split(" ");
    if (parts.length !== 3) throw new Error("Invalid date format");

    const day = parts[0].padStart(2, "0");
    const month = months[parts[1].replace(",", "")];
    const year = parts[2];

    if (!month) throw new Error("Invalid month");

    return `${year}-${month}-${day}`;
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} staticBackdrop size="xl">
        <Dialog.Panel>
          <Dialog.Title>
            <h2 className="mr-auto text-base font-medium">Add News</h2>
            <Menu className="sm:hidden">
              <Menu.Button className="block w-5 h-5">
                <Lucide
                  icon="MoreHorizontal"
                  className="w-5 h-5 text-slate-500"
                />
              </Menu.Button>
            </Menu>
          </Dialog.Title>
          <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-3">
            <div className="col-span-12 sm:col-span-12">
              <FormLabel htmlFor="href">Href</FormLabel>
              <FormInput
                id="href"
                type="text"
                placeholder="Href"
                value={formData.href}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, href: e.target.value });
                  if (value.trim()) {
                    setFormErrors((prev) => ({ ...prev, href: "" }));
                  }
                }}
              />
              {formErrors.href && (
                <p className="text-red-500 text-sm">{formErrors.href}</p>
              )}
            </div>
            <div className="col-span-12 sm:col-span-12">
              <FormLabel htmlFor="modal-form-2">Image</FormLabel>
              <Dropzone
                getRef={(el) => {
                  dropzoneRef.current = el;
                }}
                options={{
                  url: "https://httpbin.org/post",
                  autoProcessQueue: false,
                  thumbnailWidth: 150,
                  maxFilesize: 1,
                  maxFiles: 1,
                  acceptedFiles: "image/*",
                  addRemoveLinks: true,
                  previewTemplate: `
                                <div class="dz-preview dz-file-preview">
                                <div class="dz-image"><img data-dz-thumbnail /></div>
                                <div class="dz-details">
                                    <div class="dz-filename"><span data-dz-name></span></div>
                                    <div class="dz-size" data-dz-size></div>
                                </div>
                                </div>`,
                  init: function () {
                    this.on("addedfile", function () {
                      setFormErrors((prev) => ({ ...prev, images: "" }));
                    });

                    this.on("error", function (file, message) {
                      setFormErrors((prev) => ({
                        ...prev,
                        images: message as string,
                      }));
                    });
                  },
                }}
                className="dropzone"
              >
                <div className="text-center text-gray-600 text-sm">
                  Drop images here or click to upload
                </div>
              </Dropzone>
              {formErrors.images && (
                <p className="text-red-500 text-sm mt-2">{formErrors.images}</p>
              )}
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="card">Card 1</FormLabel>
              <FormInput
                id="card"
                type="text"
                placeholder="Card 1"
                value={formData.card}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, card: e.target.value });
                  if (value.trim()) {
                    setFormErrors((prev) => ({ ...prev, card: "" }));
                  }
                }}
              />
              {formErrors.card && (
                <p className="text-red-500 text-sm">{formErrors.card}</p>
              )}
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="card2">Card 2</FormLabel>
              <FormInput
                id="card2"
                type="text"
                placeholder="Card 2"
                value={formData.card2}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, card2: e.target.value });
                  if (value.trim()) {
                    setFormErrors((prev) => ({ ...prev, card2: "" }));
                  }
                }}
              />
              {formErrors.card2 && (
                <p className="text-red-500 text-sm">{formErrors.card2}</p>
              )}
            </div>
            <div className="col-span-12 sm:col-span-12">
              <FormLabel htmlFor="title">Title</FormLabel>
              <FormInput
                id="title"
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, title: e.target.value });
                  if (value.trim()) {
                    setFormErrors((prev) => ({ ...prev, title: "" }));
                  }
                }}
              />
              {formErrors.title && (
                <p className="text-red-500 text-sm">{formErrors.title}</p>
              )}
            </div>
            <div className="col-span-12 sm:col-span-12">
              <FormLabel htmlFor="para">Paragraph</FormLabel>
              <FormTextarea
                id="prara"
                placeholder="Paragraph"
                rows={4}
                value={formData.para}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, para: e.target.value });
                  if (value.trim()) {
                    setFormErrors((prev) => ({ ...prev, para: "" }));
                  }
                }}
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-primary focus:outline-none"
              ></FormTextarea>
              {formErrors.para && (
                <p className="text-red-500 text-sm">{formErrors.para}</p>
              )}
            </div>
            <div className="col-span-12 sm:col-span-4">
              <FormLabel htmlFor="views">Views</FormLabel>
              <FormInput
                id="views"
                type="text"
                placeholder="Views"
                value={formData.views}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, views: e.target.value });
                  if (value.trim()) {
                    setFormErrors((prev) => ({ ...prev, views: "" }));
                  }
                }}
              />
              {formErrors.views && (
                <p className="text-red-500 text-sm">{formErrors.views}</p>
              )}
            </div>
            <div className="col-span-12 sm:col-span-4">
              <FormLabel htmlFor="comment">Comment</FormLabel>
              <FormInput
                id="comment"
                type="text"
                placeholder="comment"
                value={formData.comment}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, comment: e.target.value });
                  if (value.trim()) {
                    setFormErrors((prev) => ({ ...prev, comment: "" }));
                  }
                }}
              />
              {formErrors.comment && (
                <p className="text-red-500 text-sm">{formErrors.comment}</p>
              )}
            </div>
            <div className="col-span-12 sm:col-span-4">
              <FormLabel htmlFor="date">Date</FormLabel>
              <div className="relative w-full">
                <div className="absolute flex items-center justify-center w-10 h-full border rounded-l bg-slate-100 text-slate-500 dark:bg-darkmode-700 dark:border-darkmode-800 dark:text-slate-400">
                  <Lucide icon="Calendar" className="w-4 h-4" />
                </div>
                <Litepicker
                  value={formData.d}
                  onChange={(date) => {
                    const formattedDate = convertDate(date.target.value);
                    setFormData((prev) => ({
                      ...prev,
                      d: date.target.value,
                      date: formattedDate,
                    }));
                    setFormErrors((prev) => ({ ...prev, d: "" }));
                  }}
                  options={{
                    autoApply: false,
                    showWeekNumbers: true,
                    dropdowns: {
                      minYear: 1990,
                      maxYear: null,
                      months: true,
                      years: true,
                    },
                  }}
                  className="pl-12"
                />
              </div>
              {formErrors.d && (
                <p className="text-red-500 text-sm mt-1">{formErrors.d}</p>
              )}
            </div>
            <div className="col-span-12 sm:col-span-12">
              <FormLabel htmlFor="video">Video</FormLabel>
              <FormInput
                id="video"
                type="text"
                placeholder="video"
                value={formData.video}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, video: e.target.value });
                  if (value.trim()) {
                    setFormErrors((prev) => ({ ...prev, video: "" }));
                  }
                }}
              />
              {formErrors.video && (
                <p className="text-red-500 text-sm">{formErrors.video}</p>
              )}
            </div>
            <div className="col-span-12 sm:col-span-12">
              <FormLabel htmlFor="status">Active Status</FormLabel>
              <div className="mt-2">
                <FormSwitch>
                  <FormSwitch.Input
                    id="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => {
                      setFormData({ ...formData, isActive: e.target.checked });
                    }}
                    // disabled={isLoading}
                  />
                </FormSwitch>
              </div>
            </div>
          </Dialog.Description>
          <Dialog.Footer>
            <Button
              type="button"
              variant="outline-secondary"
              onClick={onClose}
              className="w-20 mr-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="button"
              className="w-20"
              onClick={handleSubmit}
            >
              Save
            </Button>
          </Dialog.Footer>
        </Dialog.Panel>
      </Dialog>
      <SuccessModal
        open={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        {...successModalConfig}
      />
      {/* Success Modal : END*/}
    </>
  );
};

export default AddNewsModal;
