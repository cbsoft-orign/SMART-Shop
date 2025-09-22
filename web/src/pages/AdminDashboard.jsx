import { Link } from 'react-router-dom'

export default function AdminDashboard() {
	return (
		<div className="p-6 space-y-4">
			<h1 className="text-2xl font-bold">Admin Dashboard</h1>
			<p className="text-slate-600">Validate payments and manage shops.</p>
			<div>
				<Link className="p-4 border rounded hover:bg-slate-50 inline-block" to="/admin/payments">Payments Validation</Link>
			</div>
		</div>
	)
}


