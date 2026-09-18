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
  actual: number;
  defective: number;
  variance: number;
  gramage: string;
  colour: string;
};

type FabricInward = { id: number; fabricMasterName: string; batchNo: string; qtyMTR: number };

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
  const [returnKind, setReturnKind] = useState<"chemical" | "fabric">("chemical");
  const [fabricInwards, setFabricInwards] = useState<FabricInward[]>([]);
  const [returnForm, setReturnForm] = useState({
    chemicalMasterId: "",
    qty: "",
    returnDate: new Date().toISOString().split("T")[0],
    remarks: "",
  });
  const [fabricReturnForm, setFabricReturnForm] = useState({
    fabricInwardId: "", qtyMtr: "", returnDate: new Date().toISOString().split("T")[0], remarks: "",
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
    axios.get(`${BASE_URL}/api/fabricinward?page=1&size=10000`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => setFabricInwards(response.data?.items ?? response.data?.Items ?? []))
      .catch(() => setFabricInwards([]));
  }, [token]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const source = activeTab === "chemical" ? stock.chemicals : activeTab === "fabric" ? stock.fabrics : stock.pvc;
    return source.filter((row) => {
      const name = "chemicalName" in row ? row.chemicalName : row.name;
      const details = "chemicalName" in row ? name : `${name} ${row.gramage || ""} ${row.colour || ""}`;
      return !term || details.toLowerCase().includes(term);
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

  const saveFabricReturn = async () => {
    setError("");
    if (!fabricReturnForm.fabricInwardId || Number(fabricReturnForm.qtyMtr) <= 0) {
      setError("Select an inward batch and enter return MTR greater than zero.");
      return;
    }
    try {
      await axios.post(`${BASE_URL}/api/stock-management/fabric-returns`, {
        fabricInwardId: Number(fabricReturnForm.fabricInwardId),
        qtyMtr: Number(fabricReturnForm.qtyMtr),
        returnDate: fabricReturnForm.returnDate,
        remarks: fabricReturnForm.remarks.trim(),
      }, { headers: { Authorization: `Bearer ${token}` } });
      setReturnOpen(false);
      setFabricReturnForm({ fabricInwardId: "", qtyMtr: "", returnDate: new Date().toISOString().split("T")[0], remarks: "" });
      await loadStock();
    } catch (requestError: any) {
      setError(requestError.response?.data || "Failed to save fabric return.");
    }
  };

  return (
    <>
      <div className="mt-8 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <h2 className="mr-auto text-lg font-medium">Stock Management</h2>
        {activeTab === "chemical" && (
          <Button variant="primary" onClick={() => { setError(""); setReturnKind("chemical"); setReturnOpen(true); }}>
            Add Chemical Return
          </Button>
        )}
        {activeTab === "fabric" && (
          <Button variant="primary" onClick={() => { setError(""); setReturnKind("fabric"); setReturnOpen(true); }}>
            Add Fabric Return
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
                {activeTab === "fabric" && <th className="px-4 py-3 text-left">GRM</th>}
                {activeTab === "fabric" && <th className="px-4 py-3 text-left">Color</th>}
                <th className="px-4 py-3 text-center">Unit</th>
                <th className="px-4 py-3 text-right">Received</th>
                {activeTab === "fabric" && <th className="px-4 py-3 text-right">Actual Rolled</th>}
                {activeTab === "fabric" && <th className="px-4 py-3 text-right">Defective</th>}
                {activeTab === "fabric" && <th className="px-4 py-3 text-right">Extra / Short</th>}
                <th className="px-4 py-3 text-right">{activeTab === "fabric" ? "Processed" : "Used"}</th>
                <th className="px-4 py-3 text-right">Returned</th>
                <th className="px-4 py-3 text-right">{activeTab === "fabric" ? "Inward Balance" : "Balance"}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={activeTab === "fabric" ? 12 : 7} className="px-4 py-8 text-center text-slate-500">Loading stock...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={activeTab === "fabric" ? 12 : 7} className="px-4 py-8 text-center text-slate-500">No stock records found.</td></tr>
              ) : rows.map((row, index) => {
                const chemical = "chemicalName" in row;
                return (
                  <tr key={chemical ? row.chemicalMasterId : `${row.masterId}-${row.gramage}-${row.colour}`} className="border-t">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3 font-medium">{chemical ? row.chemicalName : row.name}</td>
                    {!chemical && activeTab === "fabric" && <td className="px-4 py-3">{row.gramage || "-"}</td>}
                    {!chemical && activeTab === "fabric" && <td className="px-4 py-3">{row.colour || "-"}</td>}
                    <td className="px-4 py-3 text-center">{row.unit || "-"}</td>
                    <td className="px-4 py-3 text-right">{number(row.received)}</td>
                    {!chemical && activeTab === "fabric" && <td className="px-4 py-3 text-right">{number(row.actual)}</td>}
                    {!chemical && activeTab === "fabric" && <td className="px-4 py-3 text-right text-danger">{number(row.defective)}</td>}
                    {!chemical && activeTab === "fabric" && <td className={`px-4 py-3 text-right ${row.variance < 0 ? "text-danger" : "text-success"}`}>{number(row.variance)}</td>}
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
          <Dialog.Title><h2 className="text-base font-medium">{returnKind === "chemical" ? "Chemical Return" : "Fabric Return"}</h2></Dialog.Title>
          <Dialog.Description className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {returnKind === "chemical" ? <>
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
            </> : <>
              <div className="md:col-span-2">
                <FormLabel>Fabric Inward Batch</FormLabel>
                <TomSelect value={fabricReturnForm.fabricInwardId} onChange={(event) => setFabricReturnForm((value) => ({ ...value, fabricInwardId: event.target.value }))} options={{ placeholder: "Select inward batch", allowEmptyOption: true }}>
                  <option value="">Select inward batch</option>
                  {fabricInwards.map((inward) => <option key={inward.id} value={inward.id}>{inward.fabricMasterName} - {inward.batchNo} ({number(inward.qtyMTR)} MTR)</option>)}
                </TomSelect>
              </div>
              <div><FormLabel>Return MTR</FormLabel><FormInput type="number" min="0" step="any" value={fabricReturnForm.qtyMtr} onChange={(event) => setFabricReturnForm((value) => ({ ...value, qtyMtr: event.target.value }))} /></div>
              <div><FormLabel>Return Date</FormLabel><FormInput type="date" value={fabricReturnForm.returnDate} onChange={(event) => setFabricReturnForm((value) => ({ ...value, returnDate: event.target.value }))} /></div>
              <div className="md:col-span-2"><FormLabel>Remark</FormLabel><FormInput value={fabricReturnForm.remarks} onChange={(event) => setFabricReturnForm((value) => ({ ...value, remarks: event.target.value }))} /></div>
            </>}
            {error && <p className="text-sm text-danger md:col-span-2">{error}</p>}
          </Dialog.Description>
          <Dialog.Footer>
            <Button variant="outline-secondary" className="mr-2 w-24" onClick={() => setReturnOpen(false)}>Cancel</Button>
            <Button variant="primary" className="w-24" onClick={returnKind === "chemical" ? saveReturn : saveFabricReturn}>Save</Button>
          </Dialog.Footer>
        </Dialog.Panel>
      </Dialog>
    </>
  );
}

export default Main;
