import { useState } from 'react'
import { useShop } from '../context/ShopContext'

export default function ShopSelector() {
	const { shopId, setShopId } = useShop()
	const [value, setValue] = useState(shopId || '')
	return (
		<div className="flex items-center gap-2">
			<label className="text-sm">Shop ID</label>
			<input className="border rounded px-2 py-1 w-28" value={value} onChange={e=>setValue(e.target.value)} placeholder="e.g. 1" />
			<button className="bg-slate-700 text-white px-2 py-1 rounded" onClick={()=>setShopId(Number(value)||null)}>Set</button>
		</div>
	)
}


