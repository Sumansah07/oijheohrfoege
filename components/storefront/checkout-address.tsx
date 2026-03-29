'use client';

import React, { useEffect, useState } from 'react';
import { MapPin, Plus, CheckCircle2, Loader2, Home, Briefcase, Info, ChevronRight } from 'lucide-react';
import { getAddresses } from '@/app/actions/address-actions';
import AddressForm from '@/components/account/addresses/address-form';

interface CheckoutAddressProps {
    onAddressSelect: (address: any) => void;
    selectedAddressId?: string;
    apiKey: string;
}

export function CheckoutAddress({ onAddressSelect, selectedAddressId, apiKey }: CheckoutAddressProps) {
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchAddresses = async () => {
        setLoading(true);
        const data = await getAddresses();
        setAddresses(data);

        // Auto-select default address if none selected
        if (!selectedAddressId && data.length > 0) {
            const defaultAddr = data.find((a: any) => a.is_default) || data[0];
            onAddressSelect(defaultAddr);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const tagIcons: Record<string, any> = {
        'Home': Home,
        'Work': Briefcase,
        'Other': Info
    };

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-8 w-48 bg-muted rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-32 bg-muted rounded-2xl" />
                    <div className="h-32 bg-muted rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold font-lufga flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Shipping Address
                </h3>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="text-sm font-bold text-primary flex items-center gap-1 hover:underline"
                >
                    <Plus className="h-4 w-4" />
                    Add New Address
                </button>
            </div>

            {addresses.length === 0 ? (
                <div className="bg-muted/30 border-2 border-dashed rounded-3xl p-10 text-center space-y-4">
                    <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <MapPin className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <p className="font-bold">No addresses found</p>
                        <p className="text-sm text-muted-foreground">Please add a shipping address to continue.</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="h-12 px-6 rounded-full bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all"
                    >
                        Add Your First Address
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => {
                        const Icon = tagIcons[address.tag] || Info;
                        const isSelected = selectedAddressId === address.id;

                        return (
                            <button
                                key={address.id}
                                onClick={() => onAddressSelect(address)}
                                className={`relative p-6 rounded-[2rem] border-2 text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${isSelected
                                        ? 'border-primary bg-primary/5 ring-4 ring-primary/5'
                                        : 'border-muted bg-white hover:border-primary/30'
                                    }`}
                            >
                                {isSelected && (
                                    <div className="absolute top-4 right-4 text-primary">
                                        <CheckCircle2 className="h-6 w-6 fill-primary text-white" />
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        <Icon className="h-3 w-3" />
                                        {address.tag} {address.is_default && '• Default'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-base truncate">{address.name}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{address.phone}</p>
                                    </div>
                                    <p className="text-xs leading-relaxed text-muted-foreground font-medium line-clamp-2">
                                        {address.full_address || `${address.house_number ? address.house_number + ', ' : ''}${address.street}, ${address.city}, ${address.state}`}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {showAddModal && (
                <AddressForm
                    apiKey={apiKey}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        fetchAddresses();
                    }}
                />
            )}
        </div>
    );
}
