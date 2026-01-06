import _ from "lodash";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { useState } from "react";
import { SuccessModalConfig } from "../CommonModals/SuccessModal/SuccessModalConfig";
import { BASE_URL } from "@/ecommerce/config/config";
import axios from "axios";
import SuccessModal from "../CommonModals/SuccessModal/SuccessModal";

function Main() {
    const token = localStorage.getItem("token");

    //Success Modal config
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successModalConfig, setSuccessModalConfig] = useState<SuccessModalConfig>({
        title: "",
        subtitle: "",
        icon: "CheckCircle",
        buttonText: "OK",
        onButtonClick: () => { }
    });

    //Collection Modal (useState)
    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    })

    //Validation Errors
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    //Form Submission: Save button click
    const handleSubmit = async () => {

        const errors: Record<string, string> = {};

        if (!formData.oldPassword) errors.oldPassword = "Old Password is required.";

        // Password validations
        const newPassword = formData.newPassword;
        const confirmNewPassword = formData.confirmNewPassword;

        if (!newPassword) {
            errors.newPassword = "Password is required.";
        } else {
            // Must contain at least one number and one special character
            const hasNumber = /\d/.test(newPassword);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

            if (!hasNumber || !hasSpecialChar) {
                errors.newPassword = "Password must include at least one number and one special character.";
            }
        }

        if (!confirmNewPassword) {
            errors.confirmNewPassword = "Password is required.";
        } else if (confirmNewPassword !== newPassword) {
            errors.confirmNewPassword = "Passwords do not match.";
        }

        //setting errors
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;

        try {
            const response = await axios.put(
                `${BASE_URL}/change-password?oldPassword=${formData.oldPassword}&newPassword=${formData.newPassword}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                //clear form data
                setFormData({
                    oldPassword: "",
                    newPassword: "",
                    confirmNewPassword: "",
                })
                //clear error
                setFormErrors({});
                //success modal
                setSuccessModalConfig({
                    title: "Password change Successfully",
                    subtitle: "Password change Successfully",
                    icon: "CheckCircle",
                    buttonText: "Ok",
                    onButtonClick: () => {
                        setIsSuccessModalOpen(false);
                    }
                });
                setIsSuccessModalOpen(true);
            } else {
                throw new Error("Unexpected response status");
            }
        } catch (error: any) {
            console.error("Submission error:", error);
            alert(error.response?.data?.detail || "Something went wrong");
        }
    }

    return (
        <>
            <div className="flex items-center mt-8 intro-y">
                <h2 className="mr-auto text-lg font-medium">Change Password</h2>
            </div>
            <div className="grid grid-cols-12 gap-6">
                {/* END: Profile Menu */}
                <div className="col-span-12 lg:col-span-8 2xl:col-span-9">
                    {/* BEGIN: Change Password */}
                    <div className="intro-y box lg:mt-5">
                        <div className="flex items-center p-5 border-b border-slate-200/60 dark:border-darkmode-400">
                            <h2 className="mr-auto text-base font-medium">Change Password</h2>
                        </div>
                        <div className="p-5">
                            <div>
                                <FormLabel htmlFor="change-password-form-1">
                                    Old Password
                                </FormLabel>
                                <FormInput
                                    id="change-password-form-1"
                                    type="password"
                                    placeholder="old password"
                                    value={formData.oldPassword}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFormData({ ...formData, oldPassword: e.target.value })
                                        if (value.trim()) {
                                            setFormErrors((prev) => ({ ...prev, oldPassword: "" }));
                                        }
                                    }}
                                />
                                {formErrors.oldPassword && <p className="text-red-500 text-sm">{formErrors.oldPassword}</p>}
                            </div>
                            <div className="mt-3">
                                <FormLabel htmlFor="change-password-form-2">
                                    New Password
                                </FormLabel>
                                <FormInput
                                    id="change-password-form-3"
                                    type="password"
                                    placeholder="new password"
                                    value={formData.newPassword}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFormData({ ...formData, newPassword: e.target.value })
                                        if (value.trim()) {
                                            setFormErrors((prev) => ({ ...prev, newPassword: "" }));
                                        }
                                    }}
                                />
                                {formErrors.newPassword && <p className="text-red-500 text-sm">{formErrors.newPassword}</p>}
                            </div>
                            <div className="mt-3">
                                <FormLabel htmlFor="change-password-form-3">
                                    Confirm New Password
                                </FormLabel>
                                <FormInput
                                    id="change-password-form-3"
                                    type="password"
                                    placeholder="confirm new password"
                                    value={formData.confirmNewPassword}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFormData({ ...formData, confirmNewPassword: e.target.value })
                                        if (value.trim()) {
                                            setFormErrors((prev) => ({ ...prev, confirmNewPassword: "" }));
                                        }
                                    }}
                                />
                                {formErrors.confirmNewPassword && <p className="text-red-500 text-sm">{formErrors.confirmNewPassword}</p>}
                            </div>
                            <Button variant="primary" type="button" className="mt-4" onClick={handleSubmit} >

                                Change Password
                            </Button>
                        </div>
                    </div>
                    {/* END: Change Password */}
                </div>
            </div>
            <SuccessModal
                open={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                {...successModalConfig}
            />
            {/* Success Modal : END*/}
        </>
    );
}

export default Main;
