import React from "react";
import { Dialog } from "@headlessui/react";
import Lucide from "@/components/Base/Lucide";
import Button from "@/components/Base/Button";


interface SuccessModalProps {
    open: boolean;
    onClose: () => void;
    icon: any;
    title: string;
    subtitle: string;
    buttonText: string;
    onButtonClick?: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
    open,
    onClose,
    icon,
    title,
    subtitle,
    buttonText,
    onButtonClick,
}) => {
    const handleButtonClick = () => {
        onClose(); // close the modal first
        if (onButtonClick) {
            onButtonClick(); // then trigger custom action
        }
    };

    return (
        <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
                <Dialog.Panel className="relative max-w-md mx-auto bg-white rounded shadow p-6 w-full">
                    {/* Close Button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onClose();
                        }}
                        className="absolute top-0 right-0 mt-3 mr-3"
                    >
                        <Lucide icon="X" className="w-6 h-6 text-slate-400" />
                    </button>

                    {/* Icon, Title & Subtitle */}
                    <div className="p-5 text-center">
                        <Lucide icon={icon} className="w-16 h-16 mx-auto text-success mt-3" />
                        <Dialog.Title className="mt-5 text-2xl font-semibold">
                            {title}
                        </Dialog.Title>
                        <Dialog.Description className="mt-2 text-slate-500">
                            {subtitle}
                        </Dialog.Description>
                    </div>

                    {/* Button */}
                    <div className="px-5 pb-4 text-center">
                        <Button type="button" variant="primary" onClick={handleButtonClick} className="w-24">
                            {buttonText}
                        </Button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default SuccessModal;
