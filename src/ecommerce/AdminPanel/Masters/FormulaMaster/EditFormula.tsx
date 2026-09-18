import _ from "lodash";
import { useEffect, useState } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel, FormSwitch, FormSelect, } from "@/components/Base/Form";
import Lucide from "@/components/Base/Lucide";
import { Dialog, Menu } from "@/components/Base/Headless";
import "@/assets/css/vendors/tabulator.css";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config";
import { SuccessModalConfig } from "../../CommonModals/SuccessModal/SuccessModalConfig";
import SuccessModal from "../../CommonModals/SuccessModal/SuccessModal";


interface EditFormulaProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    formulaMasterId: number | null;
}

//for role dropdown
interface finaProduct {
    id: number;
    finalProduct: string;
    quality: string;
    colour: string;
}

interface Chemical {
    id: number;
    name: string;
    isActive: number;
}

interface SelectedChemicals {
    chemicalMasterId: number;
    chemicalName: string;
    qty: string;
}

const EditFormula: React.FC<EditFormulaProps> = ({ open, onClose, onSuccess, formulaMasterId }) => {
    const [selectedChemicals, setSelectedChemicals] = useState<SelectedChemicals[]>([]);
    const [chemicals, setChemicals] = useState<Chemical[]>([]);
    const [chemicalToAdd, setChemicalToAdd] = useState("");
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

    // useEffect(() => {
    //     const fetchChemicals = async () => {
    //         try {
    //             const response = await axios.get(`${BASE_URL}/api/chemical`, {
    //                 headers: { Authorization: `Bearer ${token}` },
    //             });

    //             const activeChemicals = (response.data.items || []).filter(
    //                 (c: Chemical) => c.isActive === 1
    //             );

    //             setChemicals(activeChemicals);

    //             setSelectedChemicals((prev) =>
    //                 activeChemicals.map((c: Chemical) => {
    //                     const existing = prev.find(
    //                         (p) => p.chemicalMasterId === c.id
    //                     );

    //                     return {
    //                         chemicalMasterId: c.id,
    //                         chemicalName: c.name,
    //                         qty: existing ? existing.qty : "", // preserve old qty
    //                     };
    //                 })
    //             );

    //         } catch (error) {
    //             console.error("Error fetching chemicals:", error);
    //         }
    //     };

    //     fetchChemicals();
    // }, [token]);

    // Load employee data when modal opens or collectionId changes
    // useEffect(() => {
    //     const fetchfinalproductData = async () => {
    //         if (open && formulaMasterId) {
    //             try {
    //                 const response = await axios.get(
    //                     `${BASE_URL}/api/formulachemicaltransaction/${formulaMasterId}`,
    //                     {
    //                         headers: {
    //                             Authorization: `Bearer ${token}`
    //                         }
    //                     }
    //                 );
    //                 const data = response.data;

    //                 setFormData(prev => ({
    //                     ...prev,
    //                     formulaMasterId: String(data.formulaMasterId),
    //                 }));

    //                 setSelectedChemicals(prev =>
    //                     prev.map(c => {
    //                         const existing = data.chemicals.find(
    //                             (x: any) => x.chemicalMasterId === c.chemicalMasterId
    //                         );

    //                         return existing
    //                             ? { ...c, qty: String(existing.qty) }
    //                             : c;
    //                     })
    //                 );

    //             } catch (error) {
    //                 console.error("Error fetching formula:", error);
    //             }
    //         }
    //     };

    //     fetchfinalproductData();
    // }, [open, formulaMasterId, token]);
useEffect(() => {
    const fetchFormulaWithChemicals = async () => {
        if (!open || !formulaMasterId) return;

        try {
            // 1️⃣ Fetch formula data
            const formulaRes = await axios.get(
                `${BASE_URL}/api/formulachemicaltransaction/${formulaMasterId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const formulaData = formulaRes.data;

            // 2️⃣ Fetch chemicals
            const chemicalRes = await axios.get(
                `${BASE_URL}/api/chemical`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const activeChemicals = (chemicalRes.data.items || []).filter(
                (c: Chemical) => c.isActive === 1
            );

            setChemicals(activeChemicals);

            // 3️⃣ Merge qty properly
            const updatedChemicals = (formulaData.chemicals || []).map((existing: any) => {
                const chemical = activeChemicals.find((c: Chemical) => Number(c.id) === Number(existing.chemicalMasterId));
                return {
                    chemicalMasterId: Number(existing.chemicalMasterId),
                    chemicalName: chemical?.name ?? existing.chemicalName ?? "Chemical",
                    qty: String(existing.qty ?? "")
                };
            });


            setSelectedChemicals(updatedChemicals);

            // 4️⃣ Set dropdown value
            setFormData(prev => ({
                ...prev,
                formulaMasterId: String(formulaData.formulaMasterId),
                finalProductId: String(formulaData.finalProductId ?? ""),
                mixtureName: String(formulaData.mixtureName ?? ""),
            }));

        } catch (error) {
            console.error("Error fetching formula:", error);
        }
    };

    fetchFormulaWithChemicals();
}, [open, formulaMasterId, token]);


    //set Roles to dropdown 
    const [rolesForTom, setRolesForTom] = useState<finaProduct[]>([]);
    //fetch all Roles for Tom selector
    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const response = await axios.get(
                    `${BASE_URL}/api/formulamaster/finished-goods`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setRolesForTom(response.data || []);

            } catch (error) {
                console.error('Error fetching roles:', error);
                setRolesForTom([]); // safety
            }
        };

        fetchCollections();
    }, [token]);


    //Collection Modal (useState)
    const [formData, setFormData] = useState({
        formulaMasterId: "",
        finalProductId: "",
        mixtureName: "",
        chemicalMasterId: "",
        qty: "",
    })

    //Validation Errors
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    //Form Submission: Save button click
  

    const handleSubmit = async () => {
        const errors: Record<string, string> = {};

        if (!formData.mixtureName.trim()) {
            errors.mixtureName = "Mixture Name is required";
        }
        if (selectedChemicals.length === 0) errors.chemicals = "Add at least one chemical";
        selectedChemicals.forEach((chemical) => {
            if (!chemical.qty || Number(chemical.qty) <= 0) {
                errors[`chemical_${chemical.chemicalMasterId}`] = `${chemical.chemicalName} qty is required`;
            }
        });

        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;

        try {

            await axios.put(
                `${BASE_URL}/api/formulamaster/${formData.formulaMasterId}`,
                {
                    id: Number(formData.formulaMasterId),
                    finalProductId: Number(formData.finalProductId),
                    mixtureName: formData.mixtureName.trim(),
                    isActive: 1,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const payload = {
    formulaMasterId: Number(formData.formulaMasterId),
    mixtureName: formData.mixtureName.trim(),
    chemicals: selectedChemicals.map(c => ({
        chemicalMasterId: c.chemicalMasterId,
        qty: c.qty === "" ? 0 : Number(c.qty),
        mixtureName: formData.mixtureName.trim()
    }))
};

            const response = await axios.put(
                `${BASE_URL}/api/formulachemicaltransaction/`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


            if (response.status === 200) {
                onClose();

                setSuccessModalConfig({
                    title: "Formula Updated Successfully",
                    subtitle: "Formula has been updated.",
                    icon: "CheckCircle",
                    buttonText: "Ok",
                    onButtonClick: () => setIsSuccessModalOpen(false)
                });

                setIsSuccessModalOpen(true);

                if (onSuccess) onSuccess();
            }

        } catch (error: any) {
            console.error("Submission error:", error.response?.data || error);
            alert(error.response?.data?.message || "Something went wrong.");
        }
    };

    const handleQtyChange = (id: number, value: string) => {
        setSelectedChemicals((prev) =>
            prev.map((c) =>
                c.chemicalMasterId === id
                    ? { ...c, qty: value }
                    : c
            )
        );
    };

    const addChemical = () => {
        const chemical = chemicals.find((item) => item.id === Number(chemicalToAdd));
        if (!chemical || selectedChemicals.some((item) => item.chemicalMasterId === chemical.id)) return;
        setSelectedChemicals((current) => [...current, {
            chemicalMasterId: chemical.id,
            chemicalName: chemical.name,
            qty: "",
        }]);
        setChemicalToAdd("");
        setFormErrors((current) => ({ ...current, chemicals: "" }));
    };

    const removeChemical = (chemicalId: number) => {
        setSelectedChemicals((current) => current.filter((item) => item.chemicalMasterId !== chemicalId));
    };


    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                staticBackdrop
                size="md"
            >
                <Dialog.Panel>
                    <Dialog.Title>
                        <h2 className="text-base font-medium">
                            Edit Formula
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
                    <Dialog.Description className="space-y-4">

                        <div>
                            <FormLabel htmlFor="product">Select final product</FormLabel>
                            <FormSelect
                                id="finalproduct"
                                value={formData.finalProductId}
                                    disabled
                                onChange={(e: any) => {
                                    const value = e.target.value;

                                    setFormData(prev => ({
                                        ...prev,
                                        finalProductId: value,
                                    }));

                                    if (value !== "") {
                                        setFormErrors(prev => ({ ...prev, product: "" }));
                                    }
                                }}
                                className="w-full"
                            >
                                <option value="">Select final product</option>

                                {rolesForTom.map((product) => (
                                    <option key={product.id} value={String(product.id)}>
                                        {product.quality} - {product.colour}
                                    </option>
                                ))}
                            </FormSelect>

                            {formErrors.product && <p className="text-red-500 text-sm">{formErrors.product}</p>}
                        </div>

                        <div>
                            <FormLabel htmlFor="mixtureName">Mixture Name</FormLabel>
                            <FormInput
                                id="mixtureName"
                                type="text"
                                value={formData.mixtureName}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData((prev) => ({
                                        ...prev,
                                        mixtureName: value,
                                    }));

                                    if (value.trim() !== "") {
                                        setFormErrors((prev) => ({ ...prev, mixtureName: "" }));
                                    }
                                }}
                                placeholder="Enter Mixture Name"
                            />
                            {formErrors.mixtureName && <p className="text-red-500 text-sm">{formErrors.mixtureName}</p>}
                        </div>

                        <div>
                            <FormLabel>Add Chemical</FormLabel>
                            <div className="flex gap-2">
                                <FormSelect value={chemicalToAdd} onChange={(e) => setChemicalToAdd(e.target.value)} className="flex-1">
                                    <option value="">Select chemical</option>
                                    {chemicals.filter((chemical) => !selectedChemicals.some((selected) => selected.chemicalMasterId === chemical.id)).map((chemical) => (
                                        <option key={chemical.id} value={chemical.id}>{chemical.name}</option>
                                    ))}
                                </FormSelect>
                                <Button type="button" variant="outline-primary" onClick={addChemical}>Add</Button>
                            </div>
                            {formErrors.chemicals && <p className="text-sm text-red-500">{formErrors.chemicals}</p>}
                        </div>

                        {selectedChemicals.map((c) => (
                            <div key={c.chemicalMasterId}>
                                <FormLabel>{c.chemicalName}</FormLabel>
                                <div className="flex gap-2"><FormInput type="number" min="0" step="any" placeholder={`Enter ${c.chemicalName} qty`} value={c.qty} onChange={(e) => handleQtyChange(c.chemicalMasterId, e.target.value)} />
                                <Button type="button" variant="outline-danger" onClick={() => removeChemical(c.chemicalMasterId)}>Remove</Button></div>
                                {formErrors[`chemical_${c.chemicalMasterId}`] && (
                                    <p className="text-sm text-red-500">
                                        {formErrors[`chemical_${c.chemicalMasterId}`]}
                                    </p>
                                )}
                            </div>
                        ))}

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
                        <Button variant="primary" type="button" className="w-24" onClick={handleSubmit}>
                            Update
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

export default EditFormula;
