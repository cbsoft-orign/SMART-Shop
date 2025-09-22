import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import ShopDashboard from './pages/ShopDashboard'
import Products from './pages/Products'
import Reports from './pages/Reports'
import Payments from './pages/Payments'
import { getAuth, clearAuth } from './api/client'

function RequireAuth({ children }) {
	const auth = getAuth()
	if (!auth?.token) return <Navigate to="/login" replace />
	return children
}

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route
					path="/admin"
					element={
						<RequireAuth>
							<AdminDashboard />
						</RequireAuth>
					}
				/>
				<Route
					path="/admin/payments"
					element={
						<RequireAuth>
							{/* Access control could be enhanced here by decoding token role */}
							{/* For now, rely on backend to enforce admin on action endpoints */}
							{/* eslint-disable-next-line */}
							(require('./pages/AdminPayments.jsx').default())
						</RequireAuth>
					}
				/>
				<Route
					path="/"
					element={
						<RequireAuth>
							<ShopDashboard />
						</RequireAuth>
					}
				/>
				<Route
					path="/products"
					element={
						<RequireAuth>
							<Products />
						</RequireAuth>
					}
				/>
				<Route
					path="/reports"
					element={
						<RequireAuth>
							<Reports />
						</RequireAuth>
					}
				/>
				<Route
					path="/payments"
					element={
						<RequireAuth>
							<Payments />
						</RequireAuth>
					}
				/>
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
	)
}

export default App
