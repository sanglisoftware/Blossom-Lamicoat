import { useState, useRef, useEffect } from "react";
import Button from "@/components/Base/Button";
import {
  FormInput,
  FormLabel,
  FormSwitch,
  FormTextarea,
} from "@/components/Base/Form";
import Lucide from "@/components/Base/Lucide";
import { Dialog } from "@/components/Base/Headless";
import Dropzone, { DropzoneElement } from "@/components/Base/Dropzone";
import axios from "axios";
import { SuccessModalConfig } from "../CommonModals/SuccessModal/SuccessModalConfig";
import SuccessModal from "../CommonModals/SuccessModal/SuccessModal";
import { BASE_URL } from "@/ecommerce/config/config";
import Litepicker from "@/components/Base/Litepicker";

interface EditNewsModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  newsId?: number | null;
}
interface NewsData {
  id: number;
  href: string;
  card: string;
  card2: string;
  title: string;
  para: string;
  views: number;
  comment: number;
  date: string;
  video: string;
  isActive: boolean;
  img: string; // comma separated paths
}

const IMAGE_FIELD_NAME = "image"; // use "images" if backend expects plural

const EditNewsModal: React.FC<EditNewsModalProps> = ({
  open,
  onClose,
  onSuccess,
  newsId,
}) => {
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]); // track user-removed existing images
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalConfig, setSuccessModalConfig] =
    useState<SuccessModalConfig>({
      title: "",
      subtitle: "",
      icon: "CheckCircle",
      buttonText: "OK",
      onButtonClick: () => {},
    });
  const dropzoneRef = useRef<DropzoneElement | null>(null);

  const [formData, setFormData] = useState({
    href: "",
    card: "",
    card2: "",
    title: "",
    para: "",
    views: "0",
    comment: "0",
    date: "",
    d: "",
    video: "",
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && newsId) {
      fetchNewsData();
    } else if (!open) {
      resetForm();
    }
  }, [open, newsId]);

  const resetForm = () => {
    setFormData({
      href: "",
      card: "",
      card2: "",
      title: "",
      para: "",
      views: "0",
      comment: "0",
      date: "",
      d: "",
      video: "",
      isActive: true,
    });
    setExistingImages([]);
    setRemovedImages([]);
    setFormErrors({});
    // clear dropzone files if any
    if (dropzoneRef.current) {
      dropzoneRef.current.dropzone?.removeAllFiles(true);
    }
  };

  const fetchNewsData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/inventory/news/${newsId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newsData: NewsData = res.data;
      const formattedDate = formatDateForPicker(newsData.date);
      setFormData({
        href: newsData.href || "",
        card: newsData.card || "",
        card2: newsData.card2 || "",
        title: newsData.title || "",
        para: newsData.para || "",
        views: newsData.views?.toString() || "0",
        comment: newsData.comment?.toString() || "0",
        date: newsData.date || "",
        d: formattedDate,
        video: newsData.video || "",
        isActive: newsData.isActive,
      });
      if (newsData.img) {
        const imgs = newsData.img
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        setExistingImages(imgs);
      } else {
        setExistingImages([]);
      }
      setRemovedImages([]);
      // ensure dropzone cleared
      dropzoneRef.current?.dropzone?.removeAllFiles(true);
    } catch (err) {
      console.error("Error fetching news data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  function formatDateForPicker(dateString: string): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  }
  function convertDate(input: string): string {
    const months: { [k: string]: string } = {
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
    const parts = input.trim().split(" ");
    if (parts.length !== 3) return "";
    const day = parts[0].padStart(2, "0");
    const month = months[parts[1].replace(",", "")];
    const year = parts[2];
    if (!month) return "";
    return `${year}-${month}-${day}`;
  }

  // Remove an existing image from the gallery (client-side)
  const handleRemoveExistingImage = (imgPath: string) => {
    setExistingImages((prev) => prev.filter((i) => i !== imgPath));
    setRemovedImages((prev) => [...prev, imgPath]);
  };

  const handleSubmit = async () => {
    // basic client validation (adjust as needed)
    const errors: Record<string, string> = {};
    if (!formData.title) errors.title = "Title required";
    if (!formData.para) errors.para = "Content required";
    if (!formData.href) errors.href = "Href required";
    if (!formData.date) errors.date = "Date required";
    if (!/^\d+$/.test(formData.views)) errors.views = "Views must be numeric";
    if (!/^\d+$/.test(formData.comment))
      errors.comment = "Comments must be numeric";

    const dzFiles = dropzoneRef.current?.dropzone?.getAcceptedFiles() || [];

    // require at least one image if none exist already
    if (existingImages.length === 0 && dzFiles.length === 0) {
      errors.images = "At least one image is required";
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const data = new FormData();

    // Append new files (use both 'images' (collection) and 'image' (single) for compatibility)
    dzFiles.forEach((f) => data.append("images", f)); // for IFormFileCollection images
    if (dzFiles.length === 1) {
      data.append("image", dzFiles[0]); // in case backend expects single 'image' key
    }

    // Append form fields (match server property names)
    data.append("href", formData.href);
    data.append("card", formData.card);
    data.append("card2", formData.card2);
    data.append("title", formData.title);
    data.append("para", formData.para);
    data.append("views", formData.views);
    data.append("comment", formData.comment);
    data.append("date", formData.date);
    data.append("video", formData.video);

    // Append isActive as numeric string (SMALLINT)
    const isActiveNumeric = formData.isActive ? "1" : "0";
    data.append("isActive", isActiveNumeric);

    // Optionally send removed images so server can delete them
    if (removedImages?.length) {
      data.append("removedImages", JSON.stringify(removedImages));
    }

    // DEBUG: inspect form data in console (files will show as File objects)
    // for (const pair of data.entries()) console.log(pair[0], pair[1]);

    try {
      setIsLoading(true);

      // include isActive in query string because your controller expects it from query
      const url = `${BASE_URL}/api/inventory/news/update-with-image/${newsId}?isActive=${encodeURIComponent(
        isActiveNumeric
      )}`;

      const resp = await axios.put(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          // DO NOT set Content-Type here — axios/browser will set it correctly for FormData
        },
      });

      if (resp.status === 200) {
        // success actions
        setFormErrors({});
        onClose && onClose();

        setSuccessModalConfig({
          title: "News Updated Successfully",
          subtitle: "The news has been updated in the system.",
          icon: "CheckCircle",
          buttonText: "OK",
          onButtonClick: () => {
            setIsSuccessModalOpen(false);
            onSuccess && onSuccess();
          },
        });
        setIsSuccessModalOpen(true);
      } else {
        throw new Error(`Unexpected status: ${resp.status}`);
      }
    } catch (err: any) {
      console.error("Update error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err.message ||
        "Update failed";
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} staticBackdrop size="xl">
        <Dialog.Panel>
          <Dialog.Title>
            <h2 className="mr-auto text-base font-medium">Edit News</h2>
          </Dialog.Title>

          <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-3">
            {/* Href */}
            <div className="col-span-12 sm:col-span-12">
              <FormLabel htmlFor="href">Href</FormLabel>
              <FormInput
                id="href"
                type="text"
                placeholder="Href"
                value={formData.href}
                onChange={(e) => {
                  const v = e.target.value;
                  setFormData((prev) => ({ ...prev, href: v }));
                  setFormErrors((prev) => ({ ...prev, href: "" }));
                }}
                disabled={isLoading}
              />
              {formErrors.href && (
                <p className="text-red-500 text-sm">{formErrors.href}</p>
              )}
            </div>

            {/* Existing images preview (above dropzone) */}
            <div className="col-span-12 sm:col-span-12">
              <FormLabel>Existing Images</FormLabel>
              {existingImages.length === 0 ? (
                <p className="text-sm text-slate-500">No existing images</p>
              ) : (
                <div className="flex flex-wrap gap-2 mb-2">
                  {existingImages.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={`${BASE_URL}${img}`}
                        alt={`existing-${idx}`}
                        className="w-24 h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(img)}
                        className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow"
                        title="Remove"
                      >
                        <Lucide icon="X" className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dropzone for new upload */}
            <div className="col-span-12 sm:col-span-12">
              <FormLabel>Upload New Image (optional)</FormLabel>
              <Dropzone
                getRef={(el) => {
                  dropzoneRef.current = el;
                }}
                options={{
                  url: "https://httpbin.org/post",
                  autoProcessQueue: false,
                  thumbnailWidth: 150,
                  maxFilesize: 2,
                  maxFiles: 1,
                  acceptedFiles: "image/*",
                  addRemoveLinks: true,
                  init: function () {
                    // do NOT emit mock files here; we render existing images above separately
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
                  Drop new image here or click to upload
                </div>
              </Dropzone>
              {formErrors.images && (
                <p className="text-red-500 text-sm mt-2">{formErrors.images}</p>
              )}
            </div>

            {/* Other fields (card, card2, title, para, views, comment, date, video, isActive) */}
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="card">Card 1</FormLabel>
              <FormInput
                id="card"
                type="text"
                placeholder="Card 1"
                value={formData.card}
                onChange={(e) => {
                  const v = e.target.value;
                  setFormData((prev) => ({ ...prev, card: v }));
                  setFormErrors((prev) => ({ ...prev, card: "" }));
                }}
                disabled={isLoading}
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
                  const v = e.target.value;
                  setFormData((prev) => ({ ...prev, card2: v }));
                  setFormErrors((prev) => ({ ...prev, card2: "" }));
                }}
                disabled={isLoading}
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
                  const v = e.target.value;
                  setFormData((prev) => ({ ...prev, title: v }));
                  setFormErrors((prev) => ({ ...prev, title: "" }));
                }}
                disabled={isLoading}
              />
              {formErrors.title && (
                <p className="text-red-500 text-sm">{formErrors.title}</p>
              )}
            </div>

            <div className="col-span-12 sm:col-span-12">
              <FormLabel htmlFor="para">Paragraph</FormLabel>
              <FormTextarea
                id="para"
                placeholder="Paragraph"
                rows={4}
                value={formData.para}
                onChange={(e) => {
                  const v = e.target.value;
                  setFormData((prev) => ({ ...prev, para: v }));
                  setFormErrors((prev) => ({ ...prev, para: "" }));
                }}
                disabled={isLoading}
              />
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
                  const v = e.target.value;
                  setFormData((prev) => ({ ...prev, views: v }));
                  setFormErrors((prev) => ({ ...prev, views: "" }));
                }}
                disabled={isLoading}
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
                placeholder="Comment"
                value={formData.comment}
                onChange={(e) => {
                  const v = e.target.value;
                  setFormData((prev) => ({ ...prev, comment: v }));
                  setFormErrors((prev) => ({ ...prev, comment: "" }));
                }}
                disabled={isLoading}
              />
              {formErrors.comment && (
                <p className="text-red-500 text-sm">{formErrors.comment}</p>
              )}
            </div>

            <div className="col-span-12 sm:col-span-4">
              <FormLabel htmlFor="date">Date</FormLabel>
              <div className="relative w-full">
                <div className="absolute flex items-center justify-center w-10 h-full border rounded-l bg-slate-100 text-slate-500">
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
                    //  dropdowns: { minYear: 1990, months: true, years: true },
                  }}
                  className="pl-12"
                  disabled={isLoading}
                />
              </div>
              {formErrors.date && (
                <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>
              )}
            </div>

            <div className="col-span-12 sm:col-span-12">
              <FormLabel htmlFor="video">Video</FormLabel>
              <FormInput
                id="video"
                type="text"
                placeholder="Video"
                value={formData.video}
                onChange={(e) => {
                  const v = e.target.value;
                  setFormData((prev) => ({ ...prev, video: v }));
                  setFormErrors((prev) => ({ ...prev, video: "" }));
                }}
                disabled={isLoading}
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
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                    disabled={isLoading}
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
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="button"
              className="w-20"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update"}
            </Button>
          </Dialog.Footer>
        </Dialog.Panel>
      </Dialog>

      <SuccessModal
        open={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        {...successModalConfig}
      />
    </>
  );
};

export default EditNewsModal;
