import React, { useEffect, useState } from "react";
import Button from "@/components/Base/Button";
import { Dialog } from "@/components/Base/Headless";
import axios from "axios";
import { BASE_URL } from "@/ecommerce/config/config";

interface NutritionRow {
  name: string;
  value: string;
  unit: string;
  dailyValue: string;
}

interface NutritionFactsProps {
  open: boolean;
  onClose: () => void;
  productId: string | null;
  productName: string;
  onProductUpdated: () => void;
}

const NutritionFacts: React.FC<NutritionFactsProps> = ({
  open,
  onClose,
  productId,
  productName,
  onProductUpdated,
}) => {
  const [title, setTitle] = useState("Nutritional Information per 100 ml");
  const [servingSize, setServingSize] = useState("100 ml");
  //   const token = localStorage.getItem("token");

  //   const [rows, setRows] = useState<NutritionRow[]>([
  //     { name: "Energy", value: "", unit: "kcal", dailyValue: "" },
  //     { name: "Total Fat", value: "", unit: "g", dailyValue: "" },
  //     { name: "Saturated Fat", value: "", unit: "g", dailyValue: "" },
  //     { name: "Total Carbohydrates", value: "", unit: "g", dailyValue: "" },
  //     { name: "Sugar (Added)", value: "", unit: "g", dailyValue: "" },
  //     { name: "Protein", value: "", unit: "g", dailyValue: "" },
  //     { name: "Vitamin A", value: "", unit: "IU", dailyValue: "" },
  //     { name: "Calcium", value: "", unit: "mg", dailyValue: "" },
  //     { name: "Phosphorous", value: "", unit: "mg", dailyValue: "" },
  //   ]);

  const [rows, setRows] = useState<NutritionRow[]>([]);

  const token = localStorage.getItem("token");

  // Fetch nutrition data when productId changes
  useEffect(() => {
    if (!productId) return;

    axios
      .get(`${BASE_URL}/api/products/nutrition/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log("nutri data ", res.data.nutrition);
        if (res.data?.nutrition) {
          setTitle(res.data.nutrition.title || "");
          setServingSize(res.data.nutrition.servingSize || "");
          setRows(res.data.nutrition.rows || []);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch nutrition data:", err);
      });
  }, [productId, token]);

  const handleRowChange = (
    index: number,
    field: keyof NutritionRow,
    value: string
  ) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setRows(newRows);
  };

  const handleAddRow = () => {
    setRows([...rows, { name: "", value: "", unit: "g", dailyValue: "" }]);
  };

  const handleRemoveRow = (index: number) => {
    if (rows.length <= 1) return;
    const newRows = [...rows];
    newRows.splice(index, 1);
    setRows(newRows);
  };

  const handleSave = async () => {
    try {
      await axios.post(
        `${BASE_URL}/api/products/nutrition`,
        {
          productId: productId,
          nutrition: {
            title: title,
            servingSize: servingSize,
            rows: rows,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Nutrition data saved");
      onProductUpdated();
      onClose();
    } catch (error) {
      alert("Failed to save nutrition data:");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} size="xl" staticBackdrop>
      <Dialog.Panel>
        <Dialog.Title className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-slate-800">{productName}</h3>
          <Button onClick={onClose} variant="outline-secondary">
            Close
          </Button>
        </Dialog.Title>

        <Dialog.Description className="p-5">
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Serving Size
            </label>
            <input
              type="text"
              value={servingSize}
              onChange={(e) => setServingSize(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md"
            />
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-slate-800">
                Nutrition Facts
              </h3>
              <Button
                onClick={handleAddRow}
                variant="primary"
                className="text-sm px-3 py-1"
              >
                Add Row
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-800">
                    <th className="text-left py-3 w-2/6 font-bold">Nutrient</th>
                    <th className="text-left py-3 w-2/6 font-bold">Value</th>
                    <th className="text-left py-3 w-1/6 font-bold">Unit</th>
                    <th className="text-right py-3 w-1/6 font-bold">
                      % Daily Value
                    </th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index} className="border-b border-slate-200">
                      <td className="py-3">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) =>
                            handleRowChange(index, "name", e.target.value)
                          }
                          placeholder="Nutrient name"
                          className="w-full p-1 border border-slate-300 rounded-md"
                        />
                      </td>
                      <td className="py-3">
                        <input
                          type="text"
                          value={row.value}
                          onChange={(e) =>
                            handleRowChange(index, "value", e.target.value)
                          }
                          placeholder="Value"
                          className="w-full p-1 border border-slate-300 rounded-md"
                        />
                      </td>
                      <td className="py-3">
                        <select
                          value={row.unit}
                          onChange={(e) =>
                            handleRowChange(index, "unit", e.target.value)
                          }
                          className="w-full p-1 border border-slate-300 rounded-md"
                        >
                          <option value="g">g</option>
                          <option value="mg">mg</option>
                          <option value="mcg">mcg</option>
                          <option value="kcal">kcal</option>
                          <option value="IU">IU</option>
                          <option value="ml">ml</option>
                        </select>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-end">
                          <input
                            type="text"
                            value={row.dailyValue}
                            onChange={(e) =>
                              handleRowChange(
                                index,
                                "dailyValue",
                                e.target.value
                              )
                            }
                            placeholder="%"
                            className="w-16 p-1 border border-slate-300 rounded-md text-right"
                          />
                          <span className="ml-1">%</span>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(index)}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50"
                          disabled={rows.length <= 1}
                          aria-label="Remove row"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Dialog.Description>
        <Dialog.Footer>
          <Button
            variant="outline-secondary"
            onClick={onClose}
            className="w-20 mr-1"
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} className="w-20">
            Save
          </Button>
        </Dialog.Footer>
      </Dialog.Panel>
    </Dialog>
  );
};

export default NutritionFacts;
