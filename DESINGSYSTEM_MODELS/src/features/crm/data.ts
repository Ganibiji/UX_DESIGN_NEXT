// Fictional sample data. In the product this comes from /api/crm/accounts.

export type AccountStatus = "Active" | "Credit hold" | "Prospect" | "Inactive" | "Archived";

export interface Account {
  id: string;
  name: string;
  code: string;
  industry: string;
  contact: string;
  city: string;
  state: string;
  status: AccountStatus;
  creditLimit: number;
  outstanding: number;
  lastOrder: string | null;
  owner: string;
  gstin: string | null;
}

export const ACCOUNTS: Account[] = [
  { id: "a1", name: "ABC Technologies Pvt Ltd", code: "CUST-00142", industry: "Electronics mfg.", contact: "Rahul Mehta", city: "Pune", state: "MH", status: "Active", creditLimit: 2500000, outstanding: 845000, lastOrder: "2026-10-14", owner: "Priya Deshmukh", gstin: "27AABCA1234F1Z5" },
  { id: "a2", name: "Bluecrest Pharma Ltd", code: "CUST-00087", industry: "Pharmaceuticals", contact: "Dr. Sneha Iyer", city: "Ahmedabad", state: "GJ", status: "Active", creditLimit: 5000000, outstanding: 1218400, lastOrder: "2026-10-09", owner: "Priya Deshmukh", gstin: "24AACCB5678K1Z2" },
  { id: "a3", name: "Deccan Auto Components", code: "CUST-00311", industry: "Automotive", contact: "Vikram Joshi", city: "Chakan", state: "MH", status: "Active", creditLimit: 1500000, outstanding: 0, lastOrder: "2026-10-02", owner: "Rohit Kulkarni", gstin: "27AADCD9012L1Z8" },
  { id: "a4", name: "Ganesh Hardware & Tools", code: "CUST-00512", industry: "Distribution", contact: "Sunil Patil", city: "Nashik", state: "MH", status: "Credit hold", creditLimit: 400000, outstanding: 462300, lastOrder: "2026-08-21", owner: "Priya Deshmukh", gstin: "27AAFFG3456M1Z1" },
  { id: "a5", name: "Kaveri Agro Foods", code: "CUST-00276", industry: "Food processing", contact: "Arjun Reddy", city: "Kolhapur", state: "MH", status: "Active", creditLimit: 3000000, outstanding: 1475000, lastOrder: "2026-10-16", owner: "Anjali Nair", gstin: "27AAHCK2345P1Z7" },
  { id: "a6", name: "Lumina Healthcare Systems", code: "CUST-00059", industry: "Healthcare", contact: "Dr. Kavita Rao", city: "Mumbai", state: "MH", status: "Active", creditLimit: 7500000, outstanding: 2310000, lastOrder: "2026-10-18", owner: "Priya Deshmukh", gstin: "27AAKCL0123R1Z6" },
  { id: "a7", name: "Mahalaxmi Textiles", code: "CUST-00620", industry: "Textiles", contact: "Ramesh Agarwal", city: "Surat", state: "GJ", status: "Credit hold", creditLimit: 800000, outstanding: 1046750, lastOrder: "2026-07-30", owner: "Imran Shaikh", gstin: "24AALFM4567S1Z9" },
  { id: "a8", name: "Northgate Logistics", code: "CUST-00377", industry: "Logistics", contact: "Karan Malhotra", city: "Bhiwandi", state: "MH", status: "Active", creditLimit: 1800000, outstanding: 544200, lastOrder: "2026-10-07", owner: "Imran Shaikh", gstin: "27AAMCN8901T1Z2" },
  { id: "a9", name: "Pinnacle Infra Projects", code: "CUST-00245", industry: "Construction", contact: "Sameer Kulkarni", city: "Thane", state: "MH", status: "Active", creditLimit: 6000000, outstanding: 3890000, lastOrder: "2026-10-15", owner: "Rohit Kulkarni", gstin: "27AAPCP6789V1Z8" },
  { id: "a10", name: "Trident Packaging Industries", code: "CUST-00129", industry: "Packaging", contact: "Pooja Bhatt", city: "Vadodara", state: "GJ", status: "Active", creditLimit: 2200000, outstanding: 0, lastOrder: "2026-10-05", owner: "Imran Shaikh", gstin: "24AATCT2345Z1Z0" },
  { id: "a11", name: "Vardhan Steel Traders", code: "CUST-00034", industry: "Steel trading", contact: "Nikhil Vardhan", city: "Mumbai", state: "MH", status: "Credit hold", creditLimit: 2000000, outstanding: 2140000, lastOrder: "2026-10-03", owner: "Priya Deshmukh", gstin: "27AAVFV6789A1Z3" },
  { id: "a12", name: "Western Ghats Coffee Co.", code: "CUST-00714", industry: "Beverages", contact: "Anita D’Souza", city: "Pune", state: "MH", status: "Prospect", creditLimit: 0, outstanding: 0, lastOrder: null, owner: "Meghna Sathe", gstin: null },
];

/** Simulated API: latency + failure so loading/error states are exercised. */
export function fetchAccounts(query: string): Promise<Account[]> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const q = query.trim().toLowerCase();
      resolve(q ? ACCOUNTS.filter((a) => [a.name, a.code, a.city, a.gstin ?? ""].some((v) => v.toLowerCase().includes(q))) : ACCOUNTS);
    }, 450);
  });
}

export function updateCreditLimit(id: string, value: number): Promise<void> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (value > 10000000) reject(new Error("Limits above ₹1 Cr need Board approval"));
      else {
        const a = ACCOUNTS.find((x) => x.id === id);
        if (a) a.creditLimit = value;
        resolve();
      }
    }, 400);
  });
}
