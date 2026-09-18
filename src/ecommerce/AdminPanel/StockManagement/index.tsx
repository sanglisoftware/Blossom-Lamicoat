import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import TomSelect from "@/components/Base/TomSelect";
import { BASE_URL } from "@/ecommerce/config/config";

type ChemicalStock = {
  chemicalMasterId: number;
  chemicalName: string;
  unit: string;
  received: number;
  used: number;
  returned: number;
  balance: number;
};

type MaterialStock = {
  masterId: number;
  name: string;
  unit: string;
  received: number;
  used: number;
  returned: number;
  balance: number;
};

type StockResponse = {
  chemicals: ChemicalStock[];
  fabrics: MaterialStock[];
  pvc: MaterialStock[];
};

type Tab = "chemical" | "fabric" | "pvc";

const number = (value: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 }).format(value || 0);

function Main() {
  const token = localStorage.getItem("token");
  const location = useLocation();
  const navigate = useNavigate();
  const queryTab = new URLSearchParams(location.search).get("tab");
  const activeTab: Tab = queryTab === "fabric" || queryTab === "pvc" ? queryTab : "chemical";

  const [stock, setStock] = useState<StockResponse>({ chemicals: [], fabrics: [], pvc: [] });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnForm, setReturnForm] = useState({
    chemicalMasterId: "",
    qty: "",
    returnDate: new Date().toISOString().split("T")[0],
    remarks: "",
  });
  const [error, setError] = useState("");

  const loadStock = async () => {
    setLoading(true);
    try {
      const response = await axios.get<StockResponse>(`${BASE_URL}/api/stock-management`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStock(response.data);
    } catch (requestError) {
      console.error("Failed to load stock", requestError);
      setError("Failed to load stock data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStock();
  }, [token]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const source = activeTab === "chemical" ? stock.chemicals : activeTab === "fabric" ? stock.fabrics : stock.pvc;
    return source.filter((row) => {
      const name = "chemicalName" in row ? row.chemicalName : row.name;
      return !term || name.toLowerCase().includes(term);
    });
  }, [activeTab, search, stock]);

  const selectTab = (tab: Tab) => {
    setSearch("");
    navigate(`/stock-management?tab=${tab}`);
  };

  const saveReturn = async () => {
    setError("");
    if (!returnForm.chemicalMasterId || Number(returnForm.qty) <= 0) {
      setError("Select a chemical and enter a return quantity greater than zero.");
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/api/stock-management/chemical-returns`,
        {
          chemicalMasterId: Number(returnForm.chemicalMasterId),
          qty: Number(returnForm.qty),
          returnDate: returnForm.returnDate,
          remarks: returnForm.remarks.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReturnOpen(false);
      setReturnForm({
        chemicalMasterId: "",
        qty: "",
        returnDate: new Date().toISOString().split("T")[0],
        remarks: "",
      });
      await loadStock();
    } catch (requestError: any) {
      setError(requestError.response?.data || "Failed to save chemical return.");
    }
  };

  return (
    <>
      <div className="mt-8 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <h2 className="mr-auto text-lg font-medium">Stock Management</h2>
        {activeTab === "chemical" && (
          <Button variant="primary" onClick={() => { setError(""); setReturnOpen(true); }}>
            Add Chemical Return
          </Button>
        )}
      </div>

      <div className="box p-5">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {(["chemical", "fabric", "pvc"] as Tab[]).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "primary" : "outline-secondary"}
              onClick={() => selectTab(tab)}
            >
              {tab === "pvc" ? "PVC Stock" : `${tab[0].toUpperCase()}${tab.slice(1)} Stock`}
            </Button>
          ))}
          <FormInput
            className="ml-auto w-64"
            placeholder="Search stock..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {error && <p className="mb-3 text-sm text-danger">{error}</p>}
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-darkmode-800">
              <tr>
                <th className="px-4 py-3 text-left">Sr.No</th>
                <th className="px-4 py-3 text-left">{activeTab === "chemical" ? "Chemical" : activeTab === "fabric" ? "Fabric" : "PVC"}</th>
                <th className="px-4 py-3 text-center">Unit</th>
                <th className="px-4 py-3 text-right">Received</th>
                <th className="px-4 py-3 text-right">Used</th>
                <th className="px-4 py-3 text-right">Returned</th>
                <th className="px-4 py-3 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Loading stock...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No stock records found.</td></tr>
              ) : rows.map((row, index) => {
                const chemical = "chemicalName" in row;
                return (
                  <tr key={chemical ? row.chemicalMasterId : row.masterId} className="border-t">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3 font-medium">{chemical ? row.chemicalName : row.name}</td>
                    <td className="px-4 py-3 text-center">{row.unit || "-"}</td>
                    <td className="px-4 py-3 text-right">{number(row.received)}</td>
                    <td className="px-4 py-3 text-right">{number(row.used)}</td>
                    <td className="px-4 py-3 text-right">{number(row.returned)}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${row.balance < 0 ? "text-danger" : "text-success"}`}>{number(row.balance)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={returnOpen} onClose={() => setReturnOpen(false)} staticBackdrop size="lg">
        <Dialog.Panel>
          <Dialog.Title><h2 className="text-base font-medium">Chemical Return</h2></Dialog.Title>
          <Dialog.Description className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <FormLabel>Chemical</FormLabel>
              <TomSelect
                value={returnForm.chemicalMasterId}
                onChange={(event) => setReturnForm((value) => ({ ...value, chemicalMasterId: event.target.value }))}
                options={{ placeholder: "Select Chemical", allowEmptyOption: true }}
              >
                <option value="">Select Chemical</option>
                {stock.chemicals.map((chemical) => (
                  <option key={chemical.chemicalMasterId} value={chemical.chemicalMasterId}>{chemical.chemicalName}</option>
                ))}
              </TomSelect>
            </div>
            <div>
              <FormLabel>Return Quantity</FormLabel>
              <FormInput type="number" min="0" step="any" value={returnForm.qty} onChange={(event) => setReturnForm((value) => ({ ...value, qty: event.target.value }))} />
            </div>
            <div>
              <FormLabel>Return Date</FormLabel>
              <FormInput type="date" value={returnForm.returnDate} onChange={(event) => setReturnForm((value) => ({ ...value, returnDate: event.target.value }))} />
            </div>
            <div>
              <FormLabel>Remark</FormLabel>
              <FormInput value={returnForm.remarks} onChange={(event) => setReturnForm((value) => ({ ...value, remarks: event.target.value }))} />
            </div>
            {error && <p className="text-sm text-danger md:col-span-2">{error}</p>}
          </Dialog.Description>
          <Dialog.Footer>
            <Button variant="outline-secondary" className="mr-2 w-24" onClick={() => setReturnOpen(false)}>Cancel</Button>
            <Button variant="primary" className="w-24" onClick={saveReturn}>Save</Button>
          </Dialog.Footer>
        </Dialog.Panel>
      </Dialog>
    </>
  );
}

export default Main;
