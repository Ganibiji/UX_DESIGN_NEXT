import { useEffect, useMemo, useState } from "react";
import {
  Alert, Autocomplete, Button, Checkbox, ErrorSummary, Field, FormFooter, FormGrid, FormSection, Input, RadioGroup, Select, Textarea,
  formatINR, useToast, type AutocompleteOption, type SaveState,
} from "@ui/index";
import { PageLayout } from "@layouts/index";
import { ACCOUNTS } from "./data";

const GST_RE = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const STATES: Record<string, string> = { "27": "Maharashtra", "24": "Gujarat", "30": "Goa", "29": "Karnataka", "33": "Tamil Nadu" };

interface FormValues {
  name: string;
  type: "company" | "individual";
  industry: string;
  email: string;
  phone: string;
  address1: string;
  pin: string;
  sameShipping: boolean;
  creditLimit: string;
  terms: string;
  gstin: string;
  notes: string;
}

const EMPTY: FormValues = { name: "", type: "company", industry: "", email: "", phone: "", address1: "", pin: "", sameShipping: true, creditLimit: "", terms: "Net 30", gstin: "", notes: "" };

type Errors = Partial<Record<keyof FormValues, string>>;

function validate(v: FormValues): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Enter the account name";
  if (!v.industry) e.industry = "Select an industry — it drives pricing and reports";
  if (!v.email) e.email = "Enter an email for invoices";
  else if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(v.email)) e.email = "Enter an email like accounts@company.in";
  if (v.phone.replace(/\D/g, "").length < 10) e.phone = "Phone number needs 10 digits";
  if (!v.address1.trim()) e.address1 = "Enter the billing address";
  if (!/^\d{6}$/.test(v.pin)) e.pin = "PIN code is 6 digits";
  if (v.type === "company") {
    if (!v.gstin) e.gstin = "Enter the GSTIN, or choose Individual if the customer isn’t registered";
    else if (!GST_RE.test(v.gstin.toUpperCase())) e.gstin = "GSTIN format looks wrong — check characters 3–12 match the PAN";
  }
  return e;
}

/** Create / edit account. Sections, smart defaults, validation on blur and submit. */
export function AccountForm({ onDone }: { onDone: () => void }) {
  const toast = useToast();
  const [v, setV] = useState<FormValues>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [state, setState] = useState<SaveState>("pristine");
  const [parent, setParent] = useState<AutocompleteOption | null>(null);

  const errors = useMemo(() => validate(v), [v]);
  const show = (k: keyof FormValues) => (submitted || touched[k] ? errors[k] : undefined);
  const set = <K extends keyof FormValues>(k: K, value: FormValues[K]) => { setV((cur) => ({ ...cur, [k]: value })); setState("dirty"); };
  const blur = (k: keyof FormValues) => () => setTouched((t) => ({ ...t, [k]: true }));

  // Leave protection
  useEffect(() => {
    if (state !== "dirty") return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [state]);

  const gstValid = GST_RE.test(v.gstin.toUpperCase());
  const credit = Number(v.creditLimit.replace(/\D/g, "")) || 0;
  const duplicate = v.name.length > 3 && ACCOUNTS.find((a) => a.name.toLowerCase().startsWith(v.name.toLowerCase().slice(0, 7)));

  const submit = () => {
    setSubmitted(true);
    if (Object.keys(errors).length) { setState("error"); return; }
    setState("saving");
    window.setTimeout(() => { setState("saved"); toast({ text: <>Account <strong>CUST-00715</strong> created.</>, action: "Open account", onAction: onDone }); }, 800);
  };

  const summary = submitted ? Object.entries(errors).map(([k, m]) => ({ fieldId: `acc-${k}`, message: m as string })) : [];

  return (
    <PageLayout variant="narrow" breadcrumb={[{ label: "Home", href: "/" }, { label: "Accounts", href: "#" }, { label: "New account" }]} title="New account" description="Fields marked * are required. You can add contacts and documents after the account is created.">
      <form className="k-form" noValidate onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <ErrorSummary errors={summary} noun="account" />

        <FormSection title="Account information">
          <FormGrid columns={3}>
            <Field label="Account code" help="Next number: CUST-00715"><Input readOnly value="Generated on save" /></Field>
            <Field label="Account name" required span={2} id="acc-name" error={show("name")}>
              <Input value={v.name} onChange={(e) => set("name", e.target.value)} onBlur={blur("name")} placeholder="Registered business name, as on GST certificate" autoComplete="organization" />
            </Field>
            {duplicate && (
              <div className="k-span-full">
                <Alert tone="warning" title="This may be a duplicate">{duplicate.name} ({duplicate.code}, {duplicate.city}) already exists with a similar name.</Alert>
              </div>
            )}
            <RadioGroup legend="Account type" required name="type" value={v.type} onChange={(t) => set("type", t)} options={[{ value: "company", label: "Company" }, { value: "individual", label: "Individual" }]} />
            <Field label="Industry" required id="acc-industry" error={show("industry")}>
              <Select value={v.industry} onChange={(e) => set("industry", e.target.value)} onBlur={blur("industry")} placeholder="Select industry" options={["Automotive", "Construction", "Electronics manufacturing", "Food processing", "Healthcare", "Logistics", "Packaging", "Pharmaceuticals", "Textiles"].map((x) => ({ value: x, label: x }))} />
            </Field>
            <Field label="Parent account" optional help="For branches or subsidiaries">
              <Autocomplete options={ACCOUNTS.map((a) => ({ value: a.id, label: a.name, meta: `${a.code} · ${a.city}` }))} value={parent} onChange={setParent} placeholder="Search accounts" emptyText={(q) => `No account named “${q}”. Parent accounts must exist first.`} />
            </Field>
          </FormGrid>
        </FormSection>

        <FormSection title="Contact" description="Used on quotations, invoices and payment reminders.">
          <FormGrid columns={3}>
            <Field label="Accounts email" required id="acc-email" error={show("email")}><Input type="email" value={v.email} onChange={(e) => set("email", e.target.value)} onBlur={blur("email")} placeholder="accounts@company.in" autoComplete="email" /></Field>
            <Field label="Phone" required id="acc-phone" error={show("phone")}><Input prefix="+91" type="tel" inputMode="tel" value={v.phone} onChange={(e) => set("phone", e.target.value)} onBlur={blur("phone")} placeholder="98220 12345" /></Field>
          </FormGrid>
        </FormSection>

        <FormSection title="Addresses">
          <FormGrid columns={3}>
            <Field label="Billing address" required span={2} id="acc-address1" error={show("address1")}><Input value={v.address1} onChange={(e) => set("address1", e.target.value)} onBlur={blur("address1")} autoComplete="address-line1" /></Field>
            <Field label="PIN code" required id="acc-pin" error={show("pin")} help="City and state fill in automatically"><Input className="k-w-sm" inputMode="numeric" maxLength={6} value={v.pin} onChange={(e) => set("pin", e.target.value)} onBlur={blur("pin")} /></Field>
            <div className="k-span-full"><Checkbox label="Shipping address same as billing" checked={v.sameShipping} onChange={(e) => set("sameShipping", e.target.checked)} /></div>
            {!v.sameShipping && (
              <div className="k-span-full k-conditional">
                <FormGrid columns={3}>
                  <Field label="Shipping address" span={2}><Input placeholder="Warehouse / site address" /></Field>
                  <Field label="Receiving hours"><Input placeholder="Mon–Sat, 09:30–17:30" /></Field>
                </FormGrid>
              </div>
            )}
          </FormGrid>
        </FormSection>

        <FormSection title="Credit & terms" description="Finance reviews limits above ₹25,00,000.">
          <FormGrid columns={3}>
            <Field label="Credit limit" help={!credit ? "Leave blank for advance-only customers" : undefined} warning={credit > 2500000 ? "Above ₹25,00,000 — applies after Finance approves" : undefined}>
              <Input prefix="₹" numeric inputMode="numeric" value={v.creditLimit} onChange={(e) => set("creditLimit", e.target.value)} onBlur={() => credit && set("creditLimit", formatINR(credit).slice(1))} />
            </Field>
            <Field label="Payment terms" help="Net 30 is used for 82% of accounts">
              <Select value={v.terms} onChange={(e) => set("terms", e.target.value)} options={["Advance", "Net 15", "Net 30", "Net 45", "Net 60"].map((x) => ({ value: x, label: x }))} />
            </Field>
          </FormGrid>
        </FormSection>

        <FormSection title="Tax & compliance">
          <FormGrid columns={3}>
            {v.type === "company" && (
              <Field label="GSTIN" required id="acc-gstin" error={show("gstin")} success={gstValid ? `Format valid · registered in ${STATES[v.gstin.slice(0, 2)] ?? "unknown state"}` : undefined} help="15 characters. PAN and place of supply are taken from it.">
                <Input mono maxLength={15} value={v.gstin} onChange={(e) => set("gstin", e.target.value.toUpperCase())} onBlur={blur("gstin")} valid={gstValid} placeholder="27AABCA1234F1Z5" />
              </Field>
            )}
            <Field label="PAN"><Input mono readOnly value={gstValid ? v.gstin.slice(2, 12) : ""} placeholder="Derived from GSTIN" /></Field>
            <Field label="Internal notes" span="full" hint={`${v.notes.length} / 500`}>
              <Textarea maxLength={500} value={v.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Not shown to the customer" />
            </Field>
          </FormGrid>
        </FormSection>

        <FormFooter state={state}>
          <Button onClick={onDone}>Cancel</Button>
          <Button type="submit" variant="primary" loading={state === "saving"} shortcut="Ctrl S">Save account</Button>
        </FormFooter>
      </form>
    </PageLayout>
  );
}
