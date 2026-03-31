"use client"

import { useState } from "react"
import { Loader2, Download, Truck, Calendar, Clock, Package } from "lucide-react"
import { useRouter } from "next/navigation"

interface ShippingLabelGeneratorProps {
    orderId: string
    trackingNumber?: string
    labelUrl?: string
    pickupScheduled?: boolean
    pickupDate?: string
    pickupTime?: string
}

export function ShippingLabelGenerator({
    orderId,
    trackingNumber,
    labelUrl,
    pickupScheduled,
    pickupDate,
    pickupTime
}: ShippingLabelGeneratorProps) {
    const router = useRouter()
    const [generating, setGenerating] = useState(false)
    const [scheduling, setScheduling] = useState(false)
    const [showPickupForm, setShowPickupForm] = useState(false)
    const [pickupFormData, setPickupFormData] = useState({
        pickup_date: '',
        pickup_time: '14:00',
        packages_count: 1
    })

    const handleGenerateLabel = async () => {
        setGenerating(true)
        try {
            const res = await fetch(`/api/admin/orders/${orderId}/generate-label`, {
                method: 'POST'
            })
            const data = await res.json()
            
            if (data.success) {
                router.refresh()
            } else {
                alert(data.error || 'Failed to generate label')
            }
        } catch (error) {
            alert('An error occurred')
        } finally {
            setGenerating(false)
        }
    }

    const handleSchedulePickup = async () => {
        if (!pickupFormData.pickup_date) {
            alert('Please select a pickup date')
            return
        }

        setScheduling(true)
        try {
            const res = await fetch(`/api/admin/orders/${orderId}/schedule-pickup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pickupFormData)
            })
            const data = await res.json()
            
            if (data.success) {
                alert(data.message)
                setShowPickupForm(false)
                router.refresh()
            } else {
                alert(data.error || 'Failed to schedule pickup')
            }
        } catch (error) {
            alert('An error occurred')
        } finally {
            setScheduling(false)
        }
    }

    const handleDownloadLabel = () => {
        if (orderId) {
            // Open label in new window (will auto-print)
            window.open(`/api/admin/orders/${orderId}/label`, '_blank')
        }
    }

    return (
        <div className="space-y-4">
            {!trackingNumber ? (
                <button
                    onClick={handleGenerateLabel}
                    disabled={generating}
                    className="w-full h-12 rounded-xl bg-primary text-white font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {generating ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Package className="h-4 w-4" />
                            Generate Shipping Label
                        </>
                    )}
                </button>
            ) : (
                <div className="space-y-3">
                    <button
                        onClick={handleDownloadLabel}
                        className="w-full h-12 rounded-xl bg-green-600 text-white font-bold text-sm uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Download Label PDF
                    </button>

                    {!pickupScheduled && (
                        <>
                            {!showPickupForm ? (
                                <button
                                    onClick={() => setShowPickupForm(true)}
                                    className="w-full h-12 rounded-xl bg-blue-600 text-white font-bold text-sm uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <Truck className="h-4 w-4" />
                                    Schedule DHL Pickup
                                </button>
                            ) : (
                                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 space-y-4">
                                    <h4 className="font-bold text-sm text-blue-900 flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Schedule Pickup
                                    </h4>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-blue-800">Pickup Date</label>
                                            <input
                                                type="date"
                                                value={pickupFormData.pickup_date}
                                                onChange={(e) => setPickupFormData({
                                                    ...pickupFormData,
                                                    pickup_date: e.target.value
                                                })}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full h-10 rounded-lg border-2 border-blue-200 px-3 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-blue-800">Pickup Time</label>
                                            <select
                                                value={pickupFormData.pickup_time}
                                                onChange={(e) => setPickupFormData({
                                                    ...pickupFormData,
                                                    pickup_time: e.target.value
                                                })}
                                                className="w-full h-10 rounded-lg border-2 border-blue-200 px-3 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                                            >
                                                <option value="09:00">9:00 AM</option>
                                                <option value="10:00">10:00 AM</option>
                                                <option value="11:00">11:00 AM</option>
                                                <option value="12:00">12:00 PM</option>
                                                <option value="13:00">1:00 PM</option>
                                                <option value="14:00">2:00 PM</option>
                                                <option value="15:00">3:00 PM</option>
                                                <option value="16:00">4:00 PM</option>
                                                <option value="17:00">5:00 PM</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-blue-800">Number of Packages</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={pickupFormData.packages_count}
                                            onChange={(e) => setPickupFormData({
                                                ...pickupFormData,
                                                packages_count: parseInt(e.target.value)
                                            })}
                                            className="w-full h-10 rounded-lg border-2 border-blue-200 px-3 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                                        />
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => setShowPickupForm(false)}
                                            className="flex-1 h-10 rounded-lg border-2 border-blue-200 text-blue-700 font-bold text-xs hover:bg-blue-50 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSchedulePickup}
                                            disabled={scheduling}
                                            className="flex-1 h-10 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {scheduling ? (
                                                <>
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                    Scheduling...
                                                </>
                                            ) : (
                                                'Confirm Pickup'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {pickupScheduled && (
                        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
                            <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                    <Truck className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-green-900">Pickup Scheduled</p>
                                    <p className="text-xs text-green-700 mt-1">
                                        {pickupDate && new Date(pickupDate).toLocaleDateString('en-US', { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                        {pickupTime && ` at ${pickupTime}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
