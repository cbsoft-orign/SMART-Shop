import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client'
import { useShop } from '../context/ShopContext'

export default function Products() {
	const { shopId } = useShop()
	const [items, setItems] = useState([])
	const [name, setName] = useState('')
	const [price, setPrice] = useState('')
	const [error, setError] = useState('')

	async function load() {
		if (!shopId) return
		try { setItems(await apiFetch('/products', { shopId })) } catch (e) { setError(e.message) }
	}
	useEffect(()=>{ load() }, [shopId])

	async function addProduct() {
		setError('')
		try {
			await apiFetch('/products', { method: 'POST', shopId, body: { name, price_cents: Math.round(Number(price)*100) } })
			setName(''); setPrice(''); load()
		} catch(e) { setError(e.message) }
	}

	async function stock(product_id, type) {
		try {
			await apiFetch('/stock', { method: 'POST', shopId, body: { product_id, type, quantity: 1 } })
			load()
		} catch(e) { setError(e.message) }
	}

	if (!shopId) return <p className="p-6 text-red-600">Set a Shop ID first.</p>

	return (
		<div className="p-6 space-y-4">
			<h1 className="text-2xl font-bold">Products</h1>
			{error ? <p className="text-red-600 text-sm">{error}</p> : null}
			<div className="flex gap-2 items-end">
				<div>
					<label className="block text-sm">Name</label>
					<input className="border rounded px-2 py-1" value={name} onChange={e=>setName(e.target.value)} />
				</div>
				<div>
					<label className="block text-sm">Price (USD)</label>
					<input className="border rounded px-2 py-1" value={price} onChange={e=>setPrice(e.target.value)} />
				</div>
				<button className="bg-sky-600 text-white px-3 py-2 rounded" onClick={addProduct}>Add</button>
			</div>
			<table className="min-w-full border mt-2">
				<thead>
					<tr className="bg-slate-100">
						<th className="border px-2 py-1 text-left">Name</th>
						<th className="border px-2 py-1 text-right">Price</th>
						<th className="border px-2 py-1 text-right">Stock</th>
						<th className="border px-2 py-1">Actions</th>
					</tr>
				</thead>
				<tbody>
					{items.map(p => (
						<tr key={p.id}>
							<td className="border px-2 py-1">{p.name}</td>
							<td className="border px-2 py-1 text-right">${(p.price_cents/100).toFixed(2)}</td>
							<td className="border px-2 py-1 text-right">{p.stock}</td>
							<td className="border px-2 py-1 space-x-2">
								<button className="bg-green-600 text-white px-2 py-1 rounded" onClick={()=>stock(p.id,'in')}>+1</button>
								<button className="bg-rose-600 text-white px-2 py-1 rounded" onClick={()=>stock(p.id,'out')}>-1</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}


