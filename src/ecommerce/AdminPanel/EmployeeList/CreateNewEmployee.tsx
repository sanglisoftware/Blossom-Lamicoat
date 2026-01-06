import _ from "lodash";
import { useEffect, useState } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel, } from "@/components/Base/Form";
import Lucide from "@/components/Base/Lucide";
import { Dialog, Menu } from "@/components/Base/Headless";
import "@/assets/css/vendors/tabulator.css";
import TomSelect from "@/components/Base/TomSelect";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config";
import { SuccessModalConfig } from "../CommonModals/SuccessModal/SuccessModalConfig";
import SuccessModal from "../CommonModals/SuccessModal/SuccessModal";


interface CreateNewEmployeeModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

//for role dropdown
interface RoleOptions {
    id: string;
    roleValue: string;
}

const CreateNewEmpoyeeModal: React.FC<CreateNewEmployeeModalProps> = ({ open, onClose, onSuccess }) => {

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

    //after file submission
    const clearFormData = () => {
        setFormData({
            firstName: "",
            middleName: "",
            lastName: "",
            mobileNo: "",
            role: "",
            userName: "",
            password: "",
            confirmPassword: "",
        })
    }

    //set Roles to dropdown 
    const [rolesForTom, setRolesForTom] = useState<RoleOptions[]>([]);
    //fetch all Roles for Tom selector
    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const response = await axios.get<RoleOptions[]>(`${BASE_URL}/api/Roles`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setRolesForTom(response.data);
            } catch (error) {
                console.error('Error fetching roles:', error);
            }
        };
        fetchCollections();
    }, [token]);

    //Collection Modal (useState)
    const [formData, setFormData] = useState({
        firstName: "",
        middleName: "",
        lastName: "",
        mobileNo: "",
        role: "",
        userName: "",
        password: "",
        confirmPassword: "",
    })

    //Validation Errors
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    //Form Submission: Save button click
    const handleSubmit = async () => {
        const errors: Record<string, string> = {};

        if (!formData.firstName) errors.firstName = "First name is required.";
        if (!formData.middleName) errors.middleName = "Middle name is required.";
        if (!formData.lastName) errors.lastName = "Last name is required.";
        if (!formData.userName) errors.userName = "User Name is required.";
        if (!formData.role) errors.role = "Role is required.";

        //Mobile Number Validation
        const mobile = formData.mobileNo.trim();
        if (!mobile) {
            errors.mobileNo = "Mobile number is required.";
        } else if (!/^\d+$/.test(mobile)) {
            errors.mobileNo = "Mobile number must contain only digits.";
        } else if (mobile.length !== 10) {
            errors.mobileNo = "Mobile number must be exactly 10 digits.";
        }

        // Password validations
        const password = formData.password;
        const confirmPassword = formData.confirmPassword;

        if (!password) {
            errors.password = "Password is required.";
        } else {
            // Must contain at least one number and one special character
            const hasNumber = /\d/.test(password);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

            if (!hasNumber || !hasSpecialChar) {
                errors.password = "Password must include at least one number and one special character.";
            }
        }

        if (!confirmPassword) {
            errors.confirmPassword = "Password is required.";
        } else if (confirmPassword !== password) {
            errors.confirmPassword = "Passwords do not match.";
        }

        //setting errors
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;

        const payload =
        {
            firstName: formData.firstName,
            middleName: formData.middleName,
            lastName: formData.lastName,
            mobile: formData.mobileNo,
            roleId: formData.role,
            username: formData.userName,
            activeStatus: 1, //default 
            password: formData.password
        }

        //API CALL
        try {
            const response = await axios.post(
                `${BASE_URL}/api/employees`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                //clear form data
                clearFormData();
                setFormErrors({});
                onClose();

                //success modal
                setSuccessModalConfig({
                    title: "Employee Created Successfully",
                    subtitle: "The new Employee has been saved to the system.",
                    icon: "CheckCircle",
                    buttonText: "Ok",
                    onButtonClick: () => {
                        setIsSuccessModalOpen(false);
                    }
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
            alert(error.response?.data?.detail || "Something went wrong");
        }
    }


    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                staticBackdrop
                size="lg"
            >
                <Dialog.Panel>
                    <Dialog.Title>
                        <h2 className="mr-auto text-base font-medium">
                            Create New Employee
                        </h2>
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
                        <div className="col-span-12 sm:col-span-4">
                            <FormLabel htmlFor="fName">First Name</FormLabel>
                            <FormInput
                                id="firstName"
                                type="text"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData({ ...formData, firstName: e.target.value })
                                    if (value.trim()) {
                                        setFormErrors((prev) => ({ ...prev, firstName: "" }));
                                    }
                                }}
                            />
                            {formErrors.firstName && <p className="text-red-500 text-sm">{formErrors.firstName}</p>}
                        </div>
                        <div className="col-span-12 sm:col-span-4">
                            <FormLabel htmlFor="mName">Middle Name</FormLabel>
                            <FormInput
                                id="mName"
                                type="text"
                                placeholder="Middle Name"
                                value={formData.middleName}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData({ ...formData, middleName: e.target.value })
                                    if (value.trim()) {
                                        setFormErrors((prev) => ({ ...prev, middleName: "" }));
                                    }
                                }}
                            />
                            {formErrors.middleName && <p className="text-red-500 text-sm">{formErrors.middleName}</p>}
                        </div>
                        <div className="col-span-12 sm:col-span-4">
                            <FormLabel htmlFor="LName">Last Name</FormLabel>
                            <FormInput
                                id="LName"
                                type="text"
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData({ ...formData, lastName: e.target.value })
                                    if (value.trim()) {
                                        setFormErrors((prev) => ({ ...prev, lastName: "" }));
                                    }
                                }}
                            />
                            {formErrors.lastName && <p className="text-red-500 text-sm">{formErrors.lastName}</p>}
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                            <FormLabel htmlFor="mobileNo">Mobile No</FormLabel>
                            <FormInput
                                id="mobileNo"
                                type="text"
                                placeholder="Mobile Number"
                                value={formData.mobileNo}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData({ ...formData, mobileNo: e.target.value })
                                    if (value.trim()) {
                                        setFormErrors((prev) => ({ ...prev, mobileNo: "" }));
                                    }
                                }}
                            />
                            {formErrors.mobileNo && <p className="text-red-500 text-sm">{formErrors.mobileNo}</p>}
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                            <FormLabel htmlFor="role">Select Role</FormLabel>
                            <TomSelect
                                id="role"
                                value={formData.role}
                                onChange={(e) => {
                                    const value = e.target.value;

                                    setFormData(prev => ({
                                        ...prev,
                                        role: value,
                                    }));

                                    if (value !== "") {
                                        setFormErrors((prev) => ({ ...prev, role: "" }));
                                    }
                                }}
                                options={{ placeholder: "Select Role", allowEmptyOption: true }}
                                className="w-full"
                            >
                                <option value="">Select Role</option>
                                {rolesForTom.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.roleValue}
                                    </option>
                                ))}
                            </TomSelect>
                            {formErrors.role && <p className="text-red-500 text-sm">{formErrors.role}</p>}
                        </div>
                        <div className="col-span-12 sm:col-span-4">
                            <FormLabel htmlFor="userName">User Name</FormLabel>
                            <FormInput
                                id="userName"
                                type="text"
                                placeholder="User Name"
                                value={formData.userName}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData({ ...formData, userName: e.target.value })
                                    if (value.trim()) {
                                        setFormErrors((prev) => ({ ...prev, userName: "" }));
                                    }
                                }}
                            />
                            {formErrors.userName && <p className="text-red-500 text-sm">{formErrors.userName}</p>}
                        </div>
                        <div className="col-span-12 sm:col-span-4">
                            <FormLabel htmlFor="pwd">Password</FormLabel>
                            <FormInput
                                id="pwd"
                                type="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData({ ...formData, password: e.target.value })
                                    if (value.trim()) {
                                        setFormErrors((prev) => ({ ...prev, password: "" }));
                                    }
                                }}
                            />
                            {formErrors.password && <p className="text-red-500 text-sm">{formErrors.password}</p>}
                        </div>
                        <div className="col-span-12 sm:col-span-4">
                            <FormLabel htmlFor="cnfpwd">Confirm Password</FormLabel>
                            <FormInput
                                id="cnfpwd"
                                type="password"
                                placeholder="Re Enter Password"
                                value={formData.confirmPassword}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData({ ...formData, confirmPassword: e.target.value })
                                    if (value.trim()) {
                                        setFormErrors((prev) => ({ ...prev, confirmPassword: "" }));
                                    }
                                }}
                            />
                            {formErrors.confirmPassword && <p className="text-red-500 text-sm">{formErrors.confirmPassword}</p>}
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
                        <Button variant="primary" type="button" className="w-20" onClick={handleSubmit}>
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
    )
}

export default CreateNewEmpoyeeModal;