export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-muted-foreground mb-6 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
      <div className="prose max-w-none">
        <p>
          We respect your privacy. This policy explains what data we collect, how we use it, and your rights.
        </p>
        <h2>Information We Collect</h2>
        <ul>
          <li>Account and contact information</li>
          <li>Order details and delivery addresses</li>
          <li>Device and usage data (for analytics and security)</li>
        </ul>
        <h2>How We Use Your Information</h2>
        <ul>
          <li>To provide and improve our services</li>
          <li>To process orders and payments</li>
          <li>To communicate updates and promotions (with consent)</li>
        </ul>
        <h2>Data Retention</h2>
        <p>We retain data as required for legal, tax, and service purposes.</p>
        <h2>Your Rights</h2>
        <p>You may request access, correction, or deletion of your data by contacting support.</p>
      </div>
    </div>
  );
}
