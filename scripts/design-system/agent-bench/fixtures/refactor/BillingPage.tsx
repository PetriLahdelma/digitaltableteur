import LegacyTabs from "./LegacyTabs";

export default function BillingPage() {
  return (
    <LegacyTabs
      label="Billing sections"
      items={[
        { id: "plan", title: "Plan", content: <p>Pro plan, billed monthly</p> },
        { id: "invoices", title: "Invoices", content: <p>No invoices yet</p> },
        { id: "payment", title: "Payment", content: <p>Card ending 4242</p> },
      ]}
    />
  );
}
