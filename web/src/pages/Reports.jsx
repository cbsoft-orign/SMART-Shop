import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client'
import { useShop } from '../context/ShopContext'

export default function Reports() {
	const { shopId } = useShop()
	const [period, setPeriod] = useState('day')
	const [data, setData] = useState(null)
	const [error, setError] = useState('')

	async function load(p = period) {
		if (!shopId) return
		setError('')
		try { setData(await apiFetch(`/reports/${p}`, { shopId })) } catch (e) { setError(e.message) }
	}
	useEffect(()=>{ load(period) }, [shopId, period])

	if (!shopId) return <p className="p-6 text-red-600">Set a Shop ID first.</p>

	return (
		<div className="p-6 space-y-4">
			<h1 className="text-2xl font-bold">Reports</h1>
			<div className="flex gap-2">
				{['day','week','month','year'].map(p => (
					<button key={p} className={`px-3 py-1 rounded border ${period===p?'bg-slate-900 text-white':'bg-white'}`} onClick={()=>setPeriod(p)}>{p}</button>
				))}
			</div>
			{error ? <p className="text-red-600 text-sm">{error}</p> : null}
			{data ? (
				<div className="grid grid-cols-2 gap-4">
					<div className="p-4 border rounded">
						<div className="text-slate-500 text-sm">Total In</div>
						<div className="text-xl font-semibold">{data.total_in ?? 0}</div>
					</div>
					<div className="p-4 border rounded">
						<div className="text-slate-500 text-sm">Total Out</div>
						<div className="text-xl font-semibold">{data.total_out ?? 0}</div>
					</div>
				</div>
			): null}
		</div>
	)
}


