import Lucide from "@/components/Base/Lucide";

type MetricCard = {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  tone: string;
};

type StageCard = {
  step: string;
  title: string;
  status: string;
  description: string;
  signals: string[];
  icon: string;
  tone: string;
};

type ModuleCard = {
  title: string;
  description: string;
  count: string;
  icon: string;
  items: string[];
};

const metrics: MetricCard[] = [
  {
    title: "Operational Zones",
    value: "05",
    subtitle: "Masters, material prep, production, payroll and reporting",
    icon: "LayoutGrid",
    tone: "from-sky-500/20 via-cyan-500/10 to-transparent border-sky-200 text-sky-900",
  },
  {
    title: "Production Chain",
    value: "04",
    subtitle: "Rolling to inspection represented as one visual sequence",
    icon: "Workflow",
    tone: "from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-200 text-emerald-900",
  },
  {
    title: "Report Visibility",
    value: "08",
    subtitle: "Stock, purchase and process monitoring across the floor",
    icon: "ActivitySquare",
    tone: "from-amber-500/20 via-orange-500/10 to-transparent border-amber-200 text-amber-900",
  },
  {
    title: "Team Utility",
    value: "06",
    subtitle: "Attendance, salary and employee flows grouped separately",
    icon: "Users",
    tone: "from-rose-500/20 via-pink-500/10 to-transparent border-rose-200 text-rose-900",
  },
];

const productionStages: StageCard[] = [
  {
    step: "01",
    title: "Cloth Rolling",
    status: "Entry + Approval",
    description: "Raw fabric rolls are created, checked and approved before entering the next operation.",
    signals: ["Cloth Rolling Form", "Cloth Rolling Report", "Rolling Approve Report"],
    icon: "PackageOpen",
    tone: "border-sky-200 bg-sky-50 text-sky-800",
  },
  {
    step: "02",
    title: "Mixture",
    status: "Recipe Preparation",
    description: "Formula-driven mixture preparation aligns production batches with the correct chemical composition.",
    signals: ["Mixture Form", "Mixture Report", "Mixture Approve Report"],
    icon: "FlaskConical",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  {
    step: "03",
    title: "Lamination",
    status: "Process Execution",
    description: "Approved cloth rolls, PVC and chemicals come together in the main manufacturing stage.",
    signals: ["Lamination Form", "Lamination Report", "Batch Linked Entry"],
    icon: "Layers3",
    tone: "border-amber-200 bg-amber-50 text-amber-800",
  },
  {
    step: "04",
    title: "Inspection",
    status: "Quality Closure",
    description: "Manufactured fabric output is graded and wastage is captured for final quality visibility.",
    signals: ["Inspection Form", "Inspection Report", "Grade + Wastage Capture"],
    icon: "BadgeCheck",
    tone: "border-rose-200 bg-rose-50 text-rose-800",
  },
];

const moduleCards: ModuleCard[] = [
  {
    title: "Master Control",
    description: "Core definitions used across every downstream transaction.",
    count: "06",
    icon: "Database",
    items: ["Chemical", "Grade", "Colour", "Customer", "Supplier", "Formula Master"],
  },
  {
    title: "Material Preparation",
    description: "PVC, fabric and finished-good setup used before floor execution starts.",
    count: "09",
    icon: "Boxes",
    items: ["PVC Gramage", "PVC Width", "PVC Product List", "PVC Inward List", "Fabric GRM", "Fabric Product List", "Fabric Inward Report", "Finished Good", "GSM / GLM"],
  },
  {
    title: "People And Payroll",
    description: "Employee records, attendance flow and salary operations grouped together.",
    count: "06",
    icon: "IdCard",
    items: ["Employee List", "Salary Form", "Salary Report", "Daily Attendence", "Attendence Report", "Credit Salary"],
  },
  {
    title: "Business Insight",
    description: "Operational reporting for stock tracking, purchase review and production analysis.",
    count: "08",
    icon: "BarChart3",
    items: ["Daily Production", "Batching Details", "Finished Goods Stock", "Purchase Details", "Fabric Difference", "RM Fabric Stock", "RM PVC Stock", "Chemical Stock"],
  },
];

const commandNotes = [
  {
    title: "Sidebar Owns Navigation",
    text: "This screen no longer repeats page links. It supports orientation and status reading while the sidebar stays the primary action menu.",
    icon: "PanelLeftClose",
  },
  {
    title: "Designed As A Plant Board",
    text: "The layout now reads more like a manufacturing control board than a generic admin homepage.",
    icon: "Factory",
  },
  {
    title: "Ready For Live Counters",
    text: "Each block can later accept pending approvals, stock warnings and today totals without changing the structure again.",
    icon: "Radar",
  },
];

function Main() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white px-6 py-7 text-slate-900 shadow-[0_25px_80px_-45px_rgba(15,23,42,0.28)] lg:px-8 lg:py-8">
          <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr] xl:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-600">
                <Lucide icon="ShieldHalf" className="h-4 w-4" />
                Lamicoat Control Dashboard
              </div>
              <h1 className="mt-5 max-w-4xl text-3xl font-semibold leading-tight lg:text-[40px] lg:leading-[1.1]">
                A focused production overview built for visibility, not duplicated navigation.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 lg:text-base">
                The sidebar already handles page access. This dashboard now acts as a command surface that explains
                your process flow, module grouping and operational coverage in one glance.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  "Production-first layout",
                  "No open-page cards",
                  "Pipeline-based sections",
                  "Ready for live API metrics",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-medium tracking-[0.12em] text-slate-600"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-3 rounded-[28px] border border-slate-200 bg-slate-50 p-4">
              {commandNotes.map((note) => (
                <div key={note.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                      <Lucide icon={note.icon as any} className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{note.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{note.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((card) => (
            <div
              key={card.title}
              className={`overflow-hidden rounded-[26px] border bg-gradient-to-br ${card.tone} p-5 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.55)]`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold opacity-80">{card.title}</p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight">{card.value}</p>
                  <p className="mt-2 text-sm leading-6 opacity-80">{card.subtitle}</p>
                </div>
                <div className="rounded-2xl bg-white/75 p-3 shadow-sm">
                  <Lucide icon={card.icon as any} className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_25px_70px_-48px_rgba(15,23,42,0.65)]">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Production Pipeline</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Four stages arranged as one continuous manufacturing story from raw roll handling to quality check.
                </p>
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Workflow Board
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {productionStages.map((stage) => (
                <div key={stage.title} className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <div className="absolute right-4 top-3 text-[64px] font-semibold leading-none text-slate-200/70">
                    {stage.step}
                  </div>
                  <div className="relative">
                    <div className="flex items-center justify-between gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${stage.tone}`}>
                        <Lucide icon={stage.icon as any} className="h-5 w-5" />
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${stage.tone}`}>
                        {stage.status}
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-slate-900">{stage.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{stage.description}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {stage.signals.map((signal) => (
                        <span
                          key={signal}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
                        >
                          {signal}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,#fff8eb_0%,#ffffff_100%)] p-6 shadow-[0_25px_70px_-48px_rgba(15,23,42,0.65)]">
            <h2 className="text-xl font-semibold text-slate-900">Visual Intent</h2>
            <p className="mt-1 text-sm text-slate-500">
              The dashboard should feel distinct from forms and reports, so this panel explains the new direction.
            </p>

            <div className="mt-6 space-y-4">
              {[
                {
                  title: "Industrial Color Language",
                  text: "Slate, steel blue, amber and safety-rose tones create a more plant-oriented personality.",
                  icon: "Palette",
                },
                {
                  title: "Operational Reading Order",
                  text: "The eye moves from dashboard summary to production sequence to module coverage without extra clicks.",
                  icon: "ScanLine",
                },
                {
                  title: "Supports Future Live Data",
                  text: "Pending approvals, low-stock alerts and today counts can slot into these cards later.",
                  icon: "BellRing",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-[22px] border border-amber-100 bg-white/80 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                      <Lucide icon={item.icon as any} className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{item.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_25px_70px_-48px_rgba(15,23,42,0.65)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Application Coverage</h2>
              <p className="mt-1 text-sm text-slate-500">
                A dashboard summary of what the system contains, without duplicating the sidebar menu structure.
              </p>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Overview Only
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {moduleCards.map((module) => (
              <div key={module.title} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{module.count} screens</p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">{module.title}</h3>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                    <Lucide icon={module.icon as any} className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-500">{module.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {module.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Main;
