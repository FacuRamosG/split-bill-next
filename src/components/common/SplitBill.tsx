'use client'

import { useCallback, useEffect, useState } from "react"
import { handleSplitBill } from "../utils/handleSplitBill"
import { toast } from "sonner"
import { useRouter } from "next/router"

export const SplitBill = ({ tripId }: { tripId: string }) => {
    const [rembolsos, setRembolsos] = useState<{ from: string; to: string; amount: number; }[]>([])
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    const url = `https://split-bill-next.vercel.app/trip/${tripId}`

    const handleClick = useCallback(async () => {
        setLoading(true)
        const response = await handleSplitBill({ tripId })
        setRembolsos(response)
        setLoading(false)
    }, [tripId])

    const copyURL = () => {
        navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => {
            setCopied(false)
        }, 2000)
        toast.success('URL copiada')
    }

    return (
        <>



            <button onClick={handleClick} disabled={loading} style={{ backgroundColor: loading ? 'rgb(37 99 235)' : '' }} className="border mt-10 text-white px-3 py-2 bg-blue-500 hover:bg-blue-600">
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

            <div className="w-full max-w-sm mt-10">
                <div className="mb-2 flex justify-between items-center">
                    <label htmlFor="website-url" className="text-xl font-medium text-gray-900 ">Invita a tus amigos:</label>
                </div>
                <div className="flex items-center">
                    <span className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-900 bg-gray-300 border border-gray-300 rounded-s-lg ">URL</span>
                    <div className="relative w-full">
                        <input id="website-url" type="text" aria-describedby="helper-text-explanation" className="bg-gray-200 border border-e-0 border-gray-300 text-gray-500  text-sm border-s-0 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " value={url} readOnly disabled />
                    </div>
                    <button data-tooltip-target="tooltip-website-url" onClick={copyURL} data-copy-to-clipboard-target="website-url" className="flex-shrink-0 z-10 inline-flex items-center py-3 px-4 text-sm font-medium text-center text-white bg-blue-700 rounded-e-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300  border border-blue-700  hover:border-blue-800 " type="button">
                        {!copied ? <span id="default-icon">
                            <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                                <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
                            </svg>
                        </span>
                            : <span id="success-icon" className=" inline-flex items-center">
                                <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5.917 5.724 10.5 15 1.5" />
                                </svg>
                            </span>}
                    </button>

                </div>
                <p id="helper-text-explanation" className="mt-2 text-sm text-gray-500 ">Envia el link a tus amigos</p>
            </div>

        </>
    )
}