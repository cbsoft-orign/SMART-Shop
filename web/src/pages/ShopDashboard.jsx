import { Link } from 'react-router-dom'
import ShopSelector from '../components/ShopSelector'

export default function ShopDashboard() {
	return (
		<div className="p-6 space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Shop Dashboard</h1>
				<ShopSelector />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Link className="p-4 border rounded hover:bg-slate-50" to="/products">Products</Link>
				<Link className="p-4 border rounded hover:bg-slate-50" to="/reports">Reports</Link>
				<Link className="p-4 border rounded hover:bg-slate-50" to="/payments">Payments</Link>
			</div>
		</div>
	)
}


