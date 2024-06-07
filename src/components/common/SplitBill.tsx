'use client'

import { useCallback, useEffect, useState } from "react"
import { handleSplitBill } from "../utils/handleSplitBill"

export const SplitBill = ({ tripId }: { tripId: string }) => {
    const [rembolsos, setRembolsos] = useState<{ from: string; to: string; amount: number; }[]>([])
    const [loading, setLoading] = useState(false)

    const handleClick = useCallback(async () => {
        setLoading(true)
        const response = await handleSplitBill({ tripId })
        setRembolsos(response)
        setLoading(false)
    }, [tripId])

    const copyURL = () => {
        navigator.clipboard.writeText(window.location.href)
        alert('URL copiada al portapapeles')
    }

    return (
        <>
            <button onClick={copyURL} className="text-blue-600">Invita a tus amigos</button>
            <button onClick={handleClick} disabled={loading} style={{ backgroundColor: loading ? 'rgb(37 99 235)' : '' }} className="border text-white px-3 py-2 bg-blue-500 hover:bg-blue-600">
                {loading ? 'Calculando...' : 'Calcular rembolsos'}
            </button>
            {
                rembolsos && rembolsos.length > 0 && rembolsos.map((rembolso, index) => {
                    return (
                        <div key={index}>
                            <p>{rembolso.from} le debe a {rembolso.to}: ${rembolso.amount}</p>
                        </div>
                    )
                })
            }
        </>
    )
}