import { createRef, useEffect, useRef, useState } from "react";
import axios from "axios";
import { FormInput } from "@/components/Base/Form";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "@/assets/css/vendors/tabulator.css";
import { BASE_URL } from "@/ecommerce/config/config";

type MixtureApiItem = {
  id?: number;
  Id?: number;
  formulaMasterId?: number;
  FormulaMasterId?: number;
  totalMixture?: number;
  TotalMixture?: number;
  mixtureName?: string;
  MixtureName?: string;
  createdDate?: string;
  CreatedDate?: string;
  finalProductName?: string;
  FinalProductName?: string;
};

type MixturePagedResponse = {
  items?: MixtureApiItem[];
  Items?: MixtureApiItem[];
};

type ChemicalItem = {
  qty?: number;
  Qty?: number;
};

type FormulaDetailsResponse = {
  chemicals?: ChemicalItem[];
  Chemicals?: ChemicalItem[];
};

type MixtureRow = {
  id: number;
  Mixture: string;
  FinalProduct: string;
  Chem1Qty: number;
  Chem2Qty: number;
  Chem3Qty: number;
  TotalMixture: number;
};

function Main() {
  const token = localStorage.getItem("token");
  const tableRef = createRef<HTMLDivElement>();
  const tabulator = useRef<Tabulator | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [tableData, setTableData] = useState<MixtureRow[]>([]);

  useEffect(() => {
    const fetchMixtureReport = async () => {
      try {
        const response = await axios.get<MixturePagedResponse>(
          `${BASE_URL}/api/mixtureform?page=1&size=1000`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const items = response.data?.items ?? response.data?.Items ?? [];

        const mappedRows = await Promise.all(
          items.map(async (item, index) => {
            const formulaMasterId = Number(item.formulaMasterId ?? item.FormulaMasterId ?? 0);

            let formulaChemicals: ChemicalItem[] = [];
            if (formulaMasterId > 0) {
              try {
                const formulaResponse = await axios.get<FormulaDetailsResponse>(
                  `${BASE_URL}/api/formulachemicaltransaction/${formulaMasterId}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                formulaChemicals =
                  formulaResponse.data?.chemicals ?? formulaResponse.data?.Chemicals ?? [];
              } catch (error) {
                console.error("Error fetching mixture chemicals:", error);
              }
            }

            const chemQty = (position: number) =>
              Number(
                formulaChemicals[position]?.qty ?? formulaChemicals[position]?.Qty ?? 0
              );

            return {
              id: Number(item.id ?? item.Id ?? index + 1),
              Mixture: String(item.mixtureName ?? item.MixtureName ?? "").trim(),
              FinalProduct: String(
                item.finalProductName ?? item.FinalProductName ?? ""
              ),
              Chem1Qty: chemQty(0),
              Chem2Qty: chemQty(1),
              Chem3Qty: chemQty(2),
              TotalMixture: Number(item.totalMixture ?? item.TotalMixture ?? 0),
            };
          })
        );

        setTableData(mappedRows);
      } catch (error) {
        console.error("Error fetching mixture report:", error);
      }
    };

    fetchMixtureReport();
  }, [token]);

  useEffect(() => {
    if (!tableRef.current) return;

    tabulator.current = new Tabulator(tableRef.current, {
      data: tableData,
      layout: "fitColumns",
      responsiveLayout: "collapse",
      placeholder: "No matching records found",
      pagination: true,
      paginationSize: 10,
      paginationSizeSelector: [10, 20, 30, 40],
      columns: [
        { title: "Sr.No", formatter: "rownum", width: 80, hozAlign: "center" },
        { title: "Mixture", field: "Mixture" },
        { title: "Final Product", field: "FinalProduct" },
        { title: "Chem 1 Qty", field: "Chem1Qty" },
        { title: "Chem 2 Qty", field: "Chem2Qty" },
        { title: "Chem 3 Qty", field: "Chem3Qty" },
        { title: "Total Mixture", field: "TotalMixture" },
      ],
    });

    return () => {
      tabulator.current?.destroy();
      tabulator.current = null;
    };
  }, [tableData]);

  const handleSearch = (value: string) => {
    const term = value.trim().toLowerCase();
    setSearchTerm(value);

    if (!term) {
      tabulator.current?.clearFilter(true);
      return;
    }

    tabulator.current?.setFilter((row: MixtureRow) =>
      [
        row.Mixture,
        row.FinalProduct,
        row.Chem1Qty,
        row.Chem2Qty,
        row.Chem3Qty,
        row.TotalMixture,
      ].some((fieldValue) => String(fieldValue).toLowerCase().includes(term))
    );
  };

  return (
    <>
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-medium">Mixture Report</h2>
      </div>

      <div className="p-5 box">
        <div className="flex items-center mb-3">
          <span className="mr-2 font-medium">Search:</span>
          <FormInput
            type="text"
            placeholder="Search all fields..."
            className="w-64"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div ref={tableRef}></div>
      </div>
    </>
  );
}

export default Main;
