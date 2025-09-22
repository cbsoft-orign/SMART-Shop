import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client'
import { useShop } from '../context/ShopContext'

export default function Payments() {
	const { shopId } = useShop()
	const [amount, setAmount] = useState('')
	const [mode, setMode] = useState('day')
	const [items, setItems] = useState([])
	const [error, setError] = useState('')

	async function load() {
		if (!shopId) return
		setError('')
		try { setItems(await apiFetch('/payments', { shopId })) } catch (e) { setError(e.message) }
	}
	useEffect(()=>{ load() }, [shopId])

	async function createPayment() {
		setError('')
		try {
			await apiFetch('/payments', { method: 'POST', shopId, body: { amount_cents: Math.round(Number(amount)*100), mode } })
			setAmount(''); load()
		} catch(e) { setError(e.message) }
	}

	if (!shopId) return <p className="p-6 text-red-600">Set a Shop ID first.</p>

	return (
		<div className="p-6 space-y-4">
			<h1 className="text-2xl font-bold">Payments</h1>
			{error ? <p className="text-red-600 text-sm">{error}</p> : null}
			<div className="flex gap-2 items-end">
				<div>
					<label className="block text-sm">Amount (USD)</label>
					<input className="border rounded px-2 py-1" value={amount} onChange={e=>setAmount(e.target.value)} />
				</div>
				<div>
					<label className="block text-sm">Mode</label>
					<select className="border rounded px-2 py-1" value={mode} onChange={e=>setMode(e.target.value)}>
						<option value="day">day</option>
						<option value="week">week</option>
						<option value="month">month</option>
					</select>
				</div>
				<button className="bg-sky-600 text-white px-3 py-2 rounded" onClick={createPayment}>Submit</button>
			</div>
			<table className="min-w-full border mt-2">
				<thead>
					<tr className="bg-slate-100">
						<th className="border px-2 py-1 text-left">ID</th>
						<th className="border px-2 py-1">Mode</th>
						<th className="border px-2 py-1 text-right">Amount</th>
						<th className="border px-2 py-1">Status</th>
					</tr>
				</thead>
				<tbody>
					{items.map(p => (
						<tr key={p.id}>
							<td className="border px-2 py-1">{p.id}</td>
							<td className="border px-2 py-1">{p.mode}</td>
							<td className="border px-2 py-1 text-right">${(p.amount_cents/100).toFixed(2)}</td>
							<td className="border px-2 py-1">{p.status}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}


