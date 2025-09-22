import { useState } from 'react'
import { apiFetch, setAuth } from '../api/client'
import { useNavigate } from 'react-router-dom'

export default function Login() {
	const [email, setEmail] = useState('admin@smartshop.local')
	const [password, setPassword] = useState('admin123')
	const [error, setError] = useState('')
	const navigate = useNavigate()

	async function onSubmit(e) {
		e.preventDefault()
		setError('')
		try {
			const data = await apiFetch('/auth/login', { method: 'POST', body: { email, password } })
			setAuth({ token: data.token })
			navigate('/')
		} catch (err) {
			setError(err.message)
		}
	}

	return (
		<div className="min-h-screen grid place-items-center bg-slate-50">
			<form onSubmit={onSubmit} className="w-full max-w-sm bg-white shadow p-6 rounded space-y-4">
				<h1 className="text-xl font-semibold">Smart Shop Login</h1>
				{error ? <p className="text-red-600 text-sm">{error}</p> : null}
				<input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
				<input className="w-full border rounded px-3 py-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
				<button className="w-full bg-sky-600 text-white rounded px-3 py-2">Login</button>
			</form>
		</div>
	)
}


