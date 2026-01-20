export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="gradient-border p-6">
          <h2 className="text-xl font-semibold mb-2">Portfolio</h2>
          <p className="text-gray-600">Manage your portfolio sites</p>
        </div>
        <div className="gradient-border p-6">
          <h2 className="text-xl font-semibold mb-2">Projects</h2>
          <p className="text-gray-600">Track your projects</p>
        </div>
        <div className="gradient-border p-6">
          <h2 className="text-xl font-semibold mb-2">CRM</h2>
          <p className="text-gray-600">Manage contacts and deals</p>
        </div>
      </div>
    </div>
  );
}
