'use client';

import { useEffect, useState } from "react"
import { Plus, MapPin, Edit3, Trash2, ShieldCheck, Home, Briefcase, ChevronRight, Info, Loader2 } from "lucide-react"
import AddressForm from "@/components/account/addresses/address-form"
import { getAddresses, deleteAddress, setDefaultAddress } from "@/app/actions/address-actions"

export default function AccountAddressesPage() {
    const [addresses, setAddresses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingAddress, setEditingAddress] = useState<any>(null)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

    const fetchAddresses = async () => {
        setLoading(true)
        const data = await getAddresses()
        setAddresses(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchAddresses()
    }, [])

    const handleAdd = () => {
        setEditingAddress(null)
        setIsFormOpen(true)
    }

    const handleEdit = (address: any) => {
        setEditingAddress(address)
        setIsFormOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this address?")) return
        setActionLoading(id)
        const result = await deleteAddress(id)
        if (result.success) {
            fetchAddresses()
        } else {
            alert(result.error)
        }
        setActionLoading(null)
    }

    const handleSetDefault = async (id: string) => {
        setActionLoading(id)
        const result = await setDefaultAddress(id)
        if (result.success) {
            fetchAddresses()
        } else {
            alert(result.error)
        }
        setActionLoading(null)
    }

    const getIcon = (tag: string) => {
        switch (tag) {
            case 'Home': return Home;
            case 'Work': return Briefcase;
            default: return Info;
        }
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold font-lufga tracking-tight">Addresses</h1>
                    <p className="text-muted-foreground mt-1">Manage your delivery and billing locations.</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="h-14 px-8 rounded-full bg-primary text-white font-bold flex items-center justify-center space-x-2 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
                >
                    <Plus className="h-5 w-5" />
                    <span>Add New Address</span>
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[1, 2].map(i => (
                        <div key={i} className="h-64 rounded-[2rem] bg-muted/50 animate-pulse border" />
                    ))}
                </div>
            ) : addresses.length === 0 ? (
                <div className="bg-muted/10 border-2 border-dashed rounded-[2rem] p-12 text-center space-y-4">
                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <MapPin className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold font-lufga">No addresses saved yet</h3>
                        <p className="text-muted-foreground">Add your first address to enjoy faster checkout.</p>
                    </div>
                    <button
                        onClick={handleAdd}
                        className="text-primary font-bold hover:underline"
                    >
                        Add your first address
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {addresses.map((address) => {
                        const Icon = getIcon(address.tag)
                        return (
                            <div key={address.id} className={cn(
                                "bg-card border rounded-[2rem] p-8 shadow-sm relative group hover:border-primary/50 transition-all overflow-hidden",
                                address.is_default && "border-primary/30 bg-primary/[0.02]"
                            )}>
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                            <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                        <span className="text-sm font-bold uppercase tracking-widest">{address.tag}</span>
                                    </div>
                                    {address.is_default && (
                                        <div className="flex items-center space-x-1.5 text-primary">
                                            <ShieldCheck className="h-4 w-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider italic">Primary</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 mb-10">
                                    <h4 className="text-xl font-bold font-lufga">{address.name}</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {address.full_address ? (
                                            address.full_address
                                        ) : (
                                            <>
                                                {address.house_number && `${address.house_number}, `}{address.street}<br />
                                                {address.city}, {address.state}<br />
                                                {address.zip_code}, {address.country}
                                            </>
                                        )}
                                    </p>
                                    <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 pt-2">
                                        <Plus className="h-3 w-3" /> {address.phone}
                                    </p>
                                </div>

                                <div className="flex items-center space-x-3 pt-6 border-t border-dashed">
                                    <button
                                        onClick={() => handleEdit(address)}
                                        className="h-10 px-6 rounded-xl border text-xs font-bold hover:bg-muted transition-colors flex items-center space-x-2"
                                    >
                                        <Edit3 className="h-3 w-3" />
                                        <span>Edit</span>
                                    </button>
                                    {!address.is_default && (
                                        <button
                                            onClick={() => handleDelete(address.id)}
                                            disabled={actionLoading === address.id}
                                            className="h-10 px-6 rounded-xl border border-red-100 text-red-500 text-xs font-bold hover:bg-red-50 transition-colors flex items-center space-x-2 disabled:opacity-50"
                                        >
                                            {actionLoading === address.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                                            <span>Delete</span>
                                        </button>
                                    )}
                                    {!address.is_default && (
                                        <button
                                            onClick={() => handleSetDefault(address.id)}
                                            disabled={actionLoading === address.id}
                                            className="text-xs font-bold text-muted-foreground hover:text-primary underline ml-auto transition-colors disabled:opacity-50"
                                        >
                                            {actionLoading === address.id ? 'Setting...' : 'Set as Primary'}
                                        </button>
                                    )}
                                </div>

                                {/* Decorative background circle */}
                                <div className="absolute -bottom-8 -right-8 h-32 w-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        )
                    })}
                </div>
            )}

            <div className="bg-muted/20 border border-dashed rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                        <MapPin className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                        <h5 className="text-sm font-bold">Have multiple delivery locations?</h5>
                        <p className="text-xs text-muted-foreground mt-0.5">You can save up to 10 addresses for faster checkout.</p>
                    </div>
                </div>
                <button className="text-sm font-bold text-primary flex items-center space-x-2 group">
                    <span>Learn more about shipping</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {isFormOpen && (
                <AddressForm
                    apiKey={googleMapsApiKey}
                    address={editingAddress}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={() => {
                        setIsFormOpen(false)
                        fetchAddresses()
                    }}
                />
            )}
        </div>
    )
}

function cn(...args: any[]) {
    return args.filter(Boolean).join(" ")
}
