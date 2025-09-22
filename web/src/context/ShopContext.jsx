import { createContext, useContext, useEffect, useState } from 'react'

const ShopCtx = createContext({ shopId: null, setShopId: () => {} })

export function ShopProvider({ children }) {
	const [shopId, setShopIdState] = useState(() => {
		try {
			const v = localStorage.getItem('shopId')
			return v ? Number(v) : null
		} catch { return null }
	})

	function setShopId(id) {
		setShopIdState(id)
		try { localStorage.setItem('shopId', id ? String(id) : '') } catch {}
	}

	return (
		<ShopCtx.Provider value={{ shopId, setShopId }}>
			{children}
		</ShopCtx.Provider>
	)
}

export function useShop() { return useContext(ShopCtx) }


