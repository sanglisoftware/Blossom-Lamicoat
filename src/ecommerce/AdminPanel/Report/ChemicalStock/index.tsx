import { useState, useRef, useEffect, createRef } from "react";
import axios from "axios";
import { FormInput } from "@/components/Base/Form";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "@/assets/css/vendors/tabulator.css";
import { BASE_URL } from "@/ecommerce/config/config";
import ViewChemicalStock from "./ViewChemicalStock";

type ChemicalInwardApiItem = {
  id?: number;
  Id?: number;
  chemicalMasterId?: number;
  ChemicalMasterId?: number;
  chemicalMasterName?: string;
  ChemicalMasterName?: string;
  qty?: number;
  Qty?: number;
  unitOfMeasurementId?: number | null;
  UnitOfMeasurementId?: number | null;
  unitOfMeasurementName?: string | null;
  UnitOfMeasurementName?: string | null;
  supplierMasterName?: string;
  SupplierMasterName?: string;
  billDate?: string;
  BillDate?: string;
  receivedDate?: string;
  ReceivedDate?: string;
  batchNo?: number | string;
  BatchNo?: number | string;
};

type ChemicalInwardResponse = {
  items?: ChemicalInwardApiItem[];
  Items?: ChemicalInwardApiItem[];
};

type ChemicalMasterApiItem = {
  id?: number;
  Id?: number;
  name?: string;
  Name?: string;
  isActive?: number | boolean | null;
  IsActive?: number | boolean | null;
};

type ChemicalMasterResponse = {
  items?: ChemicalMasterApiItem[];
  Items?: ChemicalMasterApiItem[];
};

type ChemicalStockRow = {
  id: string;
  chemicalMasterId: number;
  unitOfMeasurementId: number | null;
  Chemical: string;
  Unit: string;
  Received: number;
  Used: number;
  Balance: number;
};

type ChemicalStockDetailRow = {
  Date: string;
  Supplier: string;
  InvoiceNo: string;
  OP_BAL: number;
  Received: number;
  Used: number;
  Balance: number;
  Unit: string;
};

const formatDateValue = (value?: string) => {
  if (!value) return "";
  return String(value).split("T")[0];
};

const getNumberValue = (...values: Array<number | string | null | undefined>) => {
  for (const value of values) {
    const numberValue = Number(value);
    if (Number.isFinite(numberValue)) return numberValue;
  }

  return 0;
};

const isActiveItem = (value: number | boolean | null | undefined) =>
  value === undefined || value === null || value === 1 || value === true;

function Main() {
  const token = localStorage.getItem("token");
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [detailData, setDetailData] = useState<ChemicalStockDetailRow[]>([]);
  const [detailTitle, setDetailTitle] = useState("Detail View");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [inwardRows, setInwardRows] = useState<ChemicalInwardApiItem[]>([]);
  const [tableData, setTableData] = useState<ChemicalStockRow[]>([]);

  const fetchChemicalStock = async () => {
    const headers = { Authorization: token ? `Bearer ${token}` : "" };
    let chemicalItems: ChemicalMasterApiItem[] = [];
    let items: ChemicalInwardApiItem[] = [];

    try {
      const chemicalResponse = await axios.get<ChemicalMasterResponse>(
          `${BASE_URL}/api/chemical?page=1&size=10000`,
          { headers }
      );
      chemicalItems =
        chemicalResponse.data?.items ?? chemicalResponse.data?.Items ?? [];
    } catch (error) {
      console.error("Error fetching chemical master:", error);
    }

    try {
      const inwardResponse = await axios.get<ChemicalInwardResponse>(
          `${BASE_URL}/api/chemicalinward?page=1&size=10000`,
          { headers }
      );
      items = inwardResponse.data?.items ?? inwardResponse.data?.Items ?? [];
    } catch (error) {
      console.error("Error fetching chemical inward stock:", error);
    }

    try {
      const chemicalMap = new Map<number, string>();

      chemicalItems.forEach((chemical) => {
        const id = getNumberValue(chemical.id, chemical.Id);
        const name = String(chemical.name ?? chemical.Name ?? "").trim();
        const activeStatus = chemical.isActive ?? chemical.IsActive;

        if (!id || !name || !isActiveItem(activeStatus)) return;
        chemicalMap.set(id, name);
      });

      setInwardRows(items);

      const stockMap = new Map<string, ChemicalStockRow>();

      items.forEach((item) => {
        const chemicalMasterId = getNumberValue(
          item.chemicalMasterId,
          item.ChemicalMasterId
        );
        const chemicalName = String(
          item.chemicalMasterName ??
            item.ChemicalMasterName ??
            chemicalMap.get(chemicalMasterId) ??
            ""
        ).trim();
        const unitIdRaw = item.unitOfMeasurementId ?? item.UnitOfMeasurementId ?? null;
        const unitOfMeasurementId =
          unitIdRaw === null || unitIdRaw === undefined ? null : Number(unitIdRaw);
        const unitName = String(
          item.unitOfMeasurementName ?? item.UnitOfMeasurementName ?? ""
        ).trim();
        const qty = getNumberValue(item.qty, item.Qty);

        if (!chemicalMasterId || !chemicalName || qty <= 0) return;

        const key = `${chemicalMasterId}-${unitOfMeasurementId ?? "no-unit"}-${unitName || "No Unit"}`;
        const existing = stockMap.get(key);

        if (existing) {
          existing.Received += qty;
          existing.Balance = existing.Received - existing.Used;
          return;
        }

        stockMap.set(key, {
          id: key,
          chemicalMasterId,
          unitOfMeasurementId: Number.isFinite(unitOfMeasurementId)
            ? unitOfMeasurementId
            : null,
          Chemical: chemicalName,
          Unit: unitName || "-",
          Received: qty,
          Used: 0,
          Balance: qty,
        });
      });

      chemicalMap.forEach((chemicalName, chemicalMasterId) => {
        const hasStockRow = Array.from(stockMap.values()).some(
          (row) => row.chemicalMasterId === chemicalMasterId
        );
        if (hasStockRow) return;

        stockMap.set(`${chemicalMasterId}-no-unit-empty`, {
          id: `${chemicalMasterId}-no-unit-empty`,
          chemicalMasterId,
          unitOfMeasurementId: null,
          Chemical: chemicalName,
          Unit: "-",
          Received: 0,
          Used: 0,
          Balance: 0,
        });
      });

      setTableData(Array.from(stockMap.values()));
    } catch (error) {
      console.error("Error fetching chemical stock:", error);
      setInwardRows([]);
      setTableData([]);
    }
  };

  useEffect(() => {
    if (!tableRef.current) return;

    tabulator.current = new Tabulator(tableRef.current, {
      data: [],
      layout: "fitColumns",
      responsiveLayout: "collapse",
      placeholder: "No matching records found",
      pagination: true,
      paginationSize: 5,
      paginationSizeSelector: [5, 10, 20],

      columns: [
        { title: "Sr.No", formatter: "rownum", hozAlign: "center", width: 70 },
        { title: "Chemical", field: "Chemical" },
        { title: "Unit", field: "Unit", hozAlign: "center", headerHozAlign: "center" },
        { title: "Received", field: "Received", hozAlign: "center", headerHozAlign: "center" },
        { title: "Used", field: "Used", hozAlign: "center", headerHozAlign: "center" },
        { title: "Balance", field: "Balance", hozAlign: "center", headerHozAlign: "center" },
        {
          title: "Action",
          hozAlign: "center",
          formatter: (cell) => {
            const button = document.createElement("button");
            button.innerText = "View";
            button.className =
              "bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm";
            button.onclick = () => {
              const row = cell.getRow().getData() as ChemicalStockRow;
              const detailRows = inwardRows
                .filter((item) => {
                  const chemicalId = getNumberValue(
                    item.chemicalMasterId,
                    item.ChemicalMasterId
                  );
                  const unitIdRaw =
                    item.unitOfMeasurementId ?? item.UnitOfMeasurementId ?? null;
                  const unitId =
                    unitIdRaw === null || unitIdRaw === undefined
                      ? null
                      : Number(unitIdRaw);
                  const unitName = String(
                    item.unitOfMeasurementName ?? item.UnitOfMeasurementName ?? ""
                  ).trim() || "-";

                  return (
                    chemicalId === row.chemicalMasterId &&
                    (Number.isFinite(unitId) ? unitId : null) === row.unitOfMeasurementId &&
                    unitName === row.Unit
                  );
                })
                .sort((a, b) =>
                  formatDateValue(a.receivedDate ?? a.ReceivedDate).localeCompare(
                    formatDateValue(b.receivedDate ?? b.ReceivedDate)
                  )
                )
                .reduce<ChemicalStockDetailRow[]>((rows, item) => {
                  const received = getNumberValue(item.qty, item.Qty);
                  const previousBalance =
                    rows.length > 0 ? rows[rows.length - 1].Balance : 0;

                  rows.push({
                    Date: formatDateValue(item.receivedDate ?? item.ReceivedDate),
                    Supplier: String(
                      item.supplierMasterName ?? item.SupplierMasterName ?? ""
                    ),
                    InvoiceNo: String(item.batchNo ?? item.BatchNo ?? ""),
                    OP_BAL: previousBalance,
                    Received: received,
                    Used: 0,
                    Balance: previousBalance + received,
                    Unit: row.Unit,
                  });

                  return rows;
                }, []);

              setDetailTitle(`${row.Chemical} (${row.Unit})`);
              setDetailData(detailRows);
              setIsViewModalOpen(true);
            };
            return button;
          },
          width: 100,
        },
      ],
    });

    return () => {
      tabulator.current?.destroy();
      tabulator.current = null;
    };
  }, [inwardRows]);

  useEffect(() => {
    void fetchChemicalStock();
  }, [token]);

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    const filteredRows = term
      ? tableData.filter((row) =>
          [row.Chemical, row.Unit, row.Received, row.Used, row.Balance].some(
            (value) => String(value).toLowerCase().includes(term)
          )
        )
      : tableData;

    tabulator.current?.setData(filteredRows);
  }, [tableData, searchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <>
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-medium">Chemical Stock</h2>
      </div>

      <div className="p-5 box">
        <div className="flex items-center mb-3 gap-2">
          <span className="font-medium">Search:</span>
          <FormInput
            type="text"
            placeholder="Search by Chemical..."
            className="w-64"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div
          ref={tableRef}
          style={{ overflowX: "auto", overflowY: "auto" }}
        ></div>
      </div>

      <ViewChemicalStock
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={detailTitle}
        data={detailData}
      />
    </>
  );
}

export default Main;
