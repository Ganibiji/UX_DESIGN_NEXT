import { useEffect, useMemo, useState } from "react";
import {
  Button, Checkbox, DataGrid, Drawer, EmptyState, Field, Icon, Modal, Person, Select, Status,
  formatDate, formatINR, useToast, type Column,
} from "@ui/index";
import { CrudPage, Pagination, type AppliedFilter } from "@patterns/index";
import { fetchAccounts, updateCreditLimit, type Account } from "./data";

const VIEWS = [
  { id: "mine", label: "My active customers", group: "mine" as const, isDefault: true },
  { id: "hold", label: "Credit hold — follow up", group: "mine" as const },
  { id: "all", label: "All accounts", group: "shared" as const },
  { id: "key", label: "Key accounts (Tier A)", group: "shared" as const },
];

export interface AccountsPageProps {
  onOpen: (account: Account) => void;
  onCreate: () => void;
}

/** CRM › Accounts — the reference CRUD list implementation. */
export function AccountsPage({ onOpen, onCreate }: AccountsPageProps) {
  const toast = useToast();
  const [rows, setRows] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("mine");
  const [filters, setFilters] = useState<AppliedFilter[]>([
    { key: "owner", label: "Owner", value: "Me" },
    { key: "status", label: "Status", value: "Active, Credit hold" },
  ]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<Account[] | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    let live = true;
    setLoading(true);
    fetchAccounts(search).then((r) => { if (live) { setRows(r); setLoading(false); } });
    return () => { live = false; };
  }, [search]);

  const visible = useMemo(() => {
    const ownerMe = filters.some((f) => f.key === "owner");
    const statusF = filters.some((f) => f.key === "status");
    return rows.filter((r) => (!ownerMe || r.owner === "Priya Deshmukh") && (!statusF || r.status === "Active" || r.status === "Credit hold"));
  }, [rows, filters]);

  const columns: Column<Account>[] = [
    { key: "name", header: "Account", width: 260, sortable: true, hideable: false, render: (a) => <a href="#" onClick={(e) => { e.preventDefault(); onOpen(a); }} title={a.name}>{a.name}</a> },
    { key: "code", header: "Code", width: 104, sortable: true, mono: true },
    { key: "industry", header: "Industry", width: 150, sortable: true, secondary: true },
    { key: "contact", header: "Primary contact", width: 160 },
    { key: "city", header: "Location", width: 140, secondary: true, render: (a) => `${a.city}, ${a.state}`, sortValue: (a) => a.city },
    { key: "status", header: "Status", width: 132, sortable: true, render: (a) => <Status>{a.status}</Status> },
    {
      key: "creditLimit", header: "Credit limit", width: 132, align: "end", sortable: true,
      render: (a) => (a.creditLimit ? formatINR(a.creditLimit) : <span className="u-muted">Not set</span>),
      edit: {
        kind: "number",
        getValue: (a) => String(a.creditLimit),
        validate: (v) => (Number.isNaN(Number(v.replace(/,/g, ""))) ? "Enter a number, e.g. 1500000" : null),
        onCommit: async (a, v) => {
          const prev = a.creditLimit;
          const next = Number(v.replace(/,/g, ""));
          await updateCreditLimit(a.id, next);
          setRows((rs) => rs.map((r) => (r.id === a.id ? { ...r, creditLimit: next } : r)));
          toast({
            text: <>Credit limit for {a.name} set to <strong>{formatINR(next)}</strong></>,
            action: "Undo",
            onAction: () => { updateCreditLimit(a.id, prev); setRows((rs) => rs.map((r) => (r.id === a.id ? { ...r, creditLimit: prev } : r))); },
          });
        },
      },
    },
    {
      key: "outstanding", header: "Outstanding", width: 132, align: "end", sortable: true,
      render: (a) => {
        const over = a.creditLimit > 0 && a.outstanding > a.creditLimit;
        return <span className={over ? "k-text-error" : undefined}>{formatINR(a.outstanding)}{over && <><span className="k-sr-only"> (over credit limit)</span> <Icon name="alert-triangle" size="xs" /></>}</span>;
      },
    },
    { key: "lastOrder", header: "Last order", width: 116, sortable: true, secondary: true, render: (a) => (a.lastOrder ? formatDate(a.lastOrder) : "—"), sortValue: (a) => a.lastOrder ?? "" },
    { key: "owner", header: "Owner", width: 160, sortable: true, render: (a) => <Person name={a.owner} /> },
    { key: "gstin", header: "GSTIN", width: 156, mono: true, hiddenByDefault: true, render: (a) => a.gstin ?? "—" },
  ];

  const archive = (targets: Account[]) => {
    setRows((rs) => rs.filter((r) => !targets.includes(r)));
    toast({ text: `${targets.length} account${targets.length > 1 ? "s" : ""} archived.`, action: "Undo", onAction: () => setRows((rs) => [...rs, ...targets]) });
  };

  const hasFilters = filters.length > 0;

  return (
    <CrudPage
      title="Accounts"
      description="Customers and prospects you sell to. Credit, tax and billing details are shared with Sales and Finance."
      breadcrumb={[{ label: "Home", href: "/" }, { label: "CRM" }, { label: "Accounts" }]}
      noun="account"
      onCreate={onCreate}
      secondaryActions={<Button icon="upload">Import</Button>}
      views={VIEWS}
      activeView={view}
      viewModified={view === "mine" && filters.length !== 2}
      onViewChange={setView}
      onSaveView={() => toast({ text: "View saved." })}
      search={search}
      onSearchChange={setSearch}
      searchHint="Name, code, GSTIN or city"
      filters={filters}
      onRemoveFilter={(k) => setFilters((f) => f.filter((x) => x.key !== k))}
      onClearFilters={() => setFilters([])}
      onOpenFilters={() => setFilterOpen(true)}
    >
      {(toolbar) => (
        <>
          <DataGrid
            id="crm.accounts"
            label="Accounts"
            rows={visible}
            columns={columns}
            rowKey={(a) => a.id}
            totalCount={1284}
            selectable
            fill
            loading={loading}
            toolbar={toolbar}
            initialSort={[{ key: "name", dir: "asc" }]}
            rowAttention={(a) => a.creditLimit > 0 && a.outstanding > a.creditLimit}
            bulkActions={[
              { label: "Change owner", icon: "user", onAction: (r) => toast({ text: `Owner changed for ${r.length} accounts.` }) },
              { label: "Export", icon: "download", onAction: (r) => toast({ text: `Exporting ${r.length} accounts…`, tone: "neutral" }) },
              { label: "Archive", danger: true, onAction: (r) => setArchiveTarget(r) },
            ]}
            rowActions={(a) => [
              { label: "Open", onSelect: () => onOpen(a) },
              { label: "New quotation", onSelect: () => undefined },
              { label: "Archive", danger: true, onSelect: () => setArchiveTarget([a]) },
            ]}
            empty={
              <EmptyState
                compact
                icon="search"
                title={search ? `No accounts match “${search}”` : "No accounts match your current filters"}
                actions={<>{hasFilters && <Button onClick={() => setFilters([])}>Clear filters</Button>}{search && <Button variant="subtle" onClick={() => setSearch("")}>Clear search</Button>}</>}
              >
                {hasFilters ? `${filters.length} filter${filters.length > 1 ? "s are" : " is"} applied. Search looks at name, code, GSTIN and city.` : "Check the spelling, or search by GSTIN or account code."}
              </EmptyState>
            }
            footer={<Pagination page={page} pageSize={pageSize} total={1284} noun="account" onPageChange={setPage} onPageSizeChange={setPageSize} />}
          />

          <Drawer
            open={filterOpen}
            onClose={() => setFilterOpen(false)}
            title="Filters"
            footer={<><Button variant="subtle" onClick={() => setFilters([])} style={{ marginRight: "auto" }}>Reset</Button><Button onClick={() => setFilterOpen(false)}>Cancel</Button><Button variant="primary" onClick={() => setFilterOpen(false)}>Show results</Button></>}
          >
            <div className="k-filter-group">
              <div className="k-filter-group__title">Status</div>
              <div className="k-choice-group">
                {["Active", "Credit hold", "Prospect", "Inactive"].map((s) => <Checkbox key={s} label={s} defaultChecked={s === "Active" || s === "Credit hold"} />)}
              </div>
            </div>
            <div className="k-filter-group">
              <Field label="Owner"><Select options={[{ value: "me", label: "Me (Priya Deshmukh)" }, { value: "team", label: "My team — Sales West" }, { value: "any", label: "Anyone" }]} /></Field>
            </div>
          </Drawer>

          <Modal
            open={archiveTarget !== null}
            onClose={() => setArchiveTarget(null)}
            tone="warning"
            size="sm"
            title={`Archive ${archiveTarget?.length === 1 ? archiveTarget[0].name : `${archiveTarget?.length ?? 0} accounts`}?`}
            footer={<><Button onClick={() => setArchiveTarget(null)}>Keep</Button><Button variant="danger" onClick={() => { if (archiveTarget) archive(archiveTarget); setArchiveTarget(null); }}>Archive</Button></>}
          >
            <p>Archived accounts are hidden from lists and can’t receive new quotations or orders. Open invoices and history are kept. You can restore them from Accounts › Archived.</p>
          </Modal>
        </>
      )}
    </CrudPage>
  );
}
