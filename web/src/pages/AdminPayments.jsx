import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client'
import { useShop } from '../context/ShopContext'

export default function AdminPayments() {
	const { shopId } = useShop()
	const [items, setItems] = useState([])
	const [error, setError] = useState('')

	async function load() {
		if (!shopId) return
		setError('')
		try { setItems(await apiFetch('/payments', { shopId })) } catch (e) { setError(e.message) }
	}
	useEffect(()=>{ load() }, [shopId])

	async function act(id, action) {
		setError('')
		try {
			await apiFetch(`/payments/${id}/${action}`, { method: 'POST' })
			load()
		} catch(e) { setError(e.message) }
	}

	if (!shopId) return <p className="p-6 text-red-600">Set a Shop ID first.</p>

	return (
		<div className="p-6 space-y-4">
			<h1 className="text-2xl font-bold">Admin: Payments Validation</h1>
			{error ? <p className="text-red-600 text-sm">{error}</p> : null}
			<table className="min-w-full border mt-2">
				<thead>
					<tr className="bg-slate-100">
						<th className="border px-2 py-1">ID</th>
						<th className="border px-2 py-1">Mode</th>
						<th className="border px-2 py-1 text-right">Amount</th>
						<th className="border px-2 py-1">Status</th>
						<th className="border px-2 py-1">Actions</th>
					</tr>
				</thead>
				<tbody>
					{items.map(p => (
						<tr key={p.id}>
							<td className="border px-2 py-1">{p.id}</td>
							<td className="border px-2 py-1">{p.mode}</td>
							<td className="border px-2 py-1 text-right">${(p.amount_cents/100).toFixed(2)}</td>
							<td className="border px-2 py-1">{p.status}</td>
							<td className="border px-2 py-1 space-x-2">
								<button disabled={p.status!=='pending'} className="bg-green-600 text-white px-2 py-1 rounded disabled:opacity-50" onClick={()=>act(p.id,'validate')}>Validate</button>
								<button disabled={p.status!=='pending'} className="bg-rose-600 text-white px-2 py-1 rounded disabled:opacity-50" onClick={()=>act(p.id,'reject')}>Reject</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}


