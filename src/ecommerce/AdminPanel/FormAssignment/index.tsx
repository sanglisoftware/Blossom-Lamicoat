import { useEffect, useState } from "react";
import { FormCheck, FormLabel, FormSelect, FormSwitch } from "@/components/Base/Form";
import Lucide from "@/components/Base/Lucide";
import Button from "@/components/Base/Button";
import { permission } from "process";
import { stringify } from "querystring";
import { BASE_URL } from "../../config/config";

interface Permission {
    create: boolean;
    update: boolean;
    delete: boolean;
}

interface Menu {
    id?: number;
    icon: string;
    pathname?: string;
    selected?: boolean;
    title: string;
    subMenu?: Menu[];
    permission?: Permission;
}

export default function Main() {
    const token = localStorage.getItem("token");
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

    const [roles, setRoles] = useState<any[]>([]);
    const [navMenu, setNavMenu] = useState<Array<Menu | "divider">>([]);
    const [allPermissionsChecked, setAllPermissionsChecked] = useState({
        create: false,
        update: false,
        delete: false,
    });

    useEffect(() => {
        fetchRoles();
    }, []);

    useEffect(() => {
        const savePermissions = async () => {
            const selectedLeafItems = getSelectedLeafItems(navMenu as Menu[]);
            const permissions = selectedLeafItems.map(item => ({
                menuid: item.id!,
                create: item.permission?.create ?? false,
                update: item.permission?.update ?? false,
                delete: item.permission?.delete ?? false,
            }));

            const res = { roleId: selectedRoleId, permissions };

            try {
                const response = await fetch(`${BASE_URL}/api/menu/permissions`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify(res),
                });

                if (!response.ok) {
                    throw new Error("Failed to save menu permissions");
                }

                console.log("Menu permissions saved successfully!");
                // You can use toast instead of alert here
            } catch (error) {
                console.error("Error saving menu permissions:", error);
                // You can use toast instead of alert here
            }
        };
        updateAllPermissionCheckboxState(navMenu);
        // Call the async function
        if (navMenu.length > 0) {
            savePermissions();
        }
    }, [navMenu]);


    const fetchRoles = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/roles`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    // Add token if auth is required
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch roles");
            }

            const roles = await response.json();
            setRoles(roles);
        } catch (error) {
            console.error("Error fetching roles:", error);
            alert("Unable to fetch roles.");
        }
    };

    const loadNavAccess = async (roleId: string) => {
        const token = localStorage.getItem("token"); // or however you store it

        try {
            const response = await fetch(`${BASE_URL}/api/menu/all-with-selection/${roleId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch menu");
            }

            const menuData = await response.json();
            markParentSelections(menuData);
            setNavMenu(menuData); // assuming it's an array of menu items
        } catch (error) {
            console.error("Error loading navigation access:", error);
            setNavMenu([]); // fallback
        }
    };

    const markParentSelections = (items: Menu[]): void => {
        const update = (node: Menu): boolean => {
            if (!node.subMenu || node.subMenu.length === 0) {
                return !!node.selected;
            }

            const allChildrenSelected = node.subMenu.map(update).every(Boolean);
            node.selected = allChildrenSelected;
            return allChildrenSelected;
        };

        items.forEach(update);
    };

    const filterSelectedLeafIds = (arr: Menu[]): number[] => {
        const selectedLeafIds: number[] = [];

        const traverse = (items: Menu[]) => {
            items.forEach(item => {
                const isLeaf = !item.subMenu || item.subMenu.length === 0;

                if (isLeaf && item.selected) {
                    selectedLeafIds.push(item.id!);
                }

                if (item.subMenu && item.subMenu.length > 0) {
                    traverse(item.subMenu);
                }
            });
        };

        traverse(arr);
        return selectedLeafIds;
    };


    const getSelectedLeafItems = (arr: Menu[]): Menu[] => {
        const selectedLeafItems: Menu[] = [];

        const traverse = (items: Menu[]) => {
            items.forEach(item => {
                const isLeaf = !item.subMenu || item.subMenu.length === 0;

                if (isLeaf && item.selected) {
                    selectedLeafItems.push(item);
                }

                if (item.subMenu && item.subMenu.length > 0) {
                    traverse(item.subMenu);
                }
            });
        };

        traverse(arr);
        return selectedLeafItems;
    };

    // ✅ Modified: only checks leaf nodes
    const updateAllPermissionCheckboxState = (menu: Array<Menu | "divider">) => {
        const types: (keyof Permission)[] = ["create", "update", "delete"];
        const result = { create: true, update: true, delete: true };

        types.forEach(type => {
            let foundAny = false;

            const check = (items: Menu[]): boolean => {
                for (const item of items) {
                    const isLeaf = !item.subMenu || item.subMenu.length === 0;

                    if (isLeaf && item.selected && item.permission) {
                        foundAny = true;
                        if (!item.permission[type]) return false;
                    }

                    if (item.subMenu && item.subMenu.length) {
                        if (!check(item.subMenu)) return false;
                    }
                }
                return true;
            };

            const allChecked = check(menu as Menu[]);
            result[type] = foundAny ? allChecked : false;
        });

        setAllPermissionsChecked(result);
    };


    // ✅ Modified: apply toggle only to leaf nodes
    const toggleAllPermissions = (type: keyof Permission, value: boolean) => {
        const updated = structuredClone(navMenu) as Array<Menu | "divider">;

        const apply = (items: Menu[]) => {
            items.forEach(item => {
                const isLeaf = !item.subMenu || item.subMenu.length === 0;

                if (isLeaf && item.selected && item.permission) {
                    item.permission[type] = value;
                }

                if (item.subMenu) apply(item.subMenu);
            });
        };

        apply(updated as Menu[]);
        setNavMenu(updated);
        setAllPermissionsChecked(prev => ({ ...prev, [type]: value }));
        console.log("testing")
    };

    const handlePermissionChange = (id: number, type: keyof Permission, value: boolean) => {
        const updated = structuredClone(navMenu) as Array<Menu | "divider">;
        const apply = (items: Menu[]) => {
            items.forEach(item => {
                if (item.id === id && item.permission) {
                    item.permission[type] = value;
                }
                if (item.subMenu) apply(item.subMenu);
            });
        };
        apply(updated as Menu[]);
        setNavMenu(updated);
    };

    const setSelectedRecursive = (item: Menu, checked: boolean) => {
        item.selected = checked;
        // Initialize permissions when selecting leaf nodes
        if (checked && (!item.subMenu || item.subMenu.length === 0) && !item.permission) {
            item.permission = { create: false, update: false, delete: false };
        }
        if (item.subMenu) item.subMenu.forEach(ch => setSelectedRecursive(ch, checked));
    };

    const updateAncestors = (items: Menu[], targetId: number): boolean => {
        return items.some(item => {
            const found = item.subMenu && updateAncestors(item.subMenu, targetId);
            if (found) {
                if (item.subMenu) {
                    item.selected = item.subMenu.every(ch => ch.selected);
                }
                return true;
            }
            return item.id === targetId;
        });
    };

    const handleChange = (id: number, checked: boolean) => {
        const updated = structuredClone(navMenu) as Array<Menu | "divider">;
        const apply = (items: Menu[]): boolean => {
            for (const item of items) {
                if (item.id === id) {
                    setSelectedRecursive(item, checked);
                    return true;
                }
                if (item.subMenu && apply(item.subMenu)) return true;
            }
            return false;
        };
        apply(updated as Menu[]);
        updateAncestors(updated as Menu[], id);
        setNavMenu(updated);
    };

    return (
        <>
            <h2 className="text-lg font-medium">Nav Menu</h2>
            <div className="mt-5 p-5 box">
                <div className="flex items-center">
                    <FormLabel className="mb-0 mr-3">Role:</FormLabel>
                    <FormSelect id="users" onChange={e => {
                        const roleId = parseInt(e.target.value);
                        setSelectedRoleId(roleId);
                        loadNavAccess(roleId.toString());
                    }}>
                        <option>Select Role</option>
                        {roles.map(r => (
                            <option key={r.id} value={r.id}>{r.roleValue}</option>
                        ))}
                    </FormSelect>
                </div>

                {/* Global All checkboxes */}
                <div className="flex justify-end my-5">
                    <div className="flex space-x-6">
                        {(["create", "update", "delete"] as (keyof Permission)[]).map(type => (
                            <FormCheck key={type}>
                                <FormCheck.Input
                                    id={`all-${type}`}
                                    type="checkbox"
                                    checked={allPermissionsChecked[type]}
                                    onChange={e => toggleAllPermissions(type, e.target.checked)}
                                />
                                <FormCheck.Label htmlFor={`all-${type}`}>
                                    {`All ${type.toUpperCase()}`}
                                </FormCheck.Label>
                            </FormCheck>
                        ))}

                    </div>
                </div>

                {navMenu.map((x, idx) =>
                    x === "divider" ? (
                        <hr key={idx} />
                    ) : (
                        <MenuItem
                            key={idx}
                            item={x}
                            level={0}
                            onChange={handleChange}
                            onPermissionChange={handlePermissionChange}
                        />
                    )
                )}
            </div>
        </>
    );
}

function MenuItem({
    item,
    level,
    onChange,
    onPermissionChange,
}: {
    item: Menu;
    level: number;
    onChange: (id: number, checked: boolean) => void;
    onPermissionChange: (id: number, type: keyof Permission, checked: boolean) => void;
}) {
    const [isOpen, setIsOpen] = useState(true);
    const hasChildren = item.subMenu && item.subMenu.length > 0;

    return (
        <ul style={{ marginLeft: level * 16 }} className="border-l pl-2">
            <li className="flex items-center py-1 hover:bg-gray-100">
                {hasChildren ? (
                    <Lucide
                        icon="ChevronDown"
                        onClick={() => setIsOpen(!isOpen)}
                        className={`cursor-pointer mr-1 transition-transform ${isOpen ? "" : "-rotate-90"}`}
                    />
                ) : (
                    <span className="inline-block w-5" />
                )}
                <FormSwitch>
                    <FormSwitch.Input
                        type="checkbox"
                        checked={!!item.selected}
                        onChange={e => onChange(item.id!, e.target.checked)}
                    />
                    <FormSwitch.Label>{item.title}</FormSwitch.Label>
                </FormSwitch>

                {/* ✅ Permissions only for leaf & selected */}
                {!hasChildren && item.selected && item.permission && (
                    <div className="ml-auto flex space-x-3">
                        {(["create", "update", "delete"] as const).map((type) => (
                            <FormCheck key={type} className="mr-2">
                                <FormCheck.Input
                                    id={`perm-${item.id}-${type}`}
                                    type="checkbox"
                                    checked={item.permission?.[type] ?? false}
                                    onChange={(e) => onPermissionChange(item.id!, type, e.target.checked)}
                                />
                                <FormCheck.Label htmlFor={`perm-${item.id}-${type}`}>
                                    {type.toUpperCase()}
                                </FormCheck.Label>
                            </FormCheck>
                        ))}
                    </div>
                )}
            </li>

            {hasChildren && isOpen && (
                <li>
                    {item.subMenu!.map(child => (
                        <MenuItem
                            key={child.id}
                            item={child}
                            level={level + 1}
                            onChange={onChange}
                            onPermissionChange={onPermissionChange}
                        />
                    ))}
                </li>
            )}
        </ul>
    );
}
