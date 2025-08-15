export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
      <p className="text-muted-foreground mb-6 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
      <div className="prose max-w-none">
        <h2>Introduction</h2>
        <p>By using our platform, you agree to these terms. Please read them carefully.</p>
        <h2>Accounts</h2>
        <p>You are responsible for safeguarding your account credentials and activity.</p>
        <h2>Orders and Payments</h2>
        <p>All orders are subject to availability and confirmation. Taxes may apply.</p>
        <h2>Returns</h2>
        <p>Returns are governed by our Return Policy. Some items may be ineligible.</p>
        <h2>Liability</h2>
        <p>To the maximum extent permitted by law, we disclaim certain warranties and limit liability.</p>
      </div>
    </div>
  );
}
