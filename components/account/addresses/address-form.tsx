'use client';

import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, User, Home, Briefcase, Info, Loader2, CheckCircle2, AlignLeft } from 'lucide-react';
import { useJsApiLoader } from '@react-google-maps/api';
import AddressAutocomplete from './address-autocomplete';
import AddressMap from './address-map';
import { saveAddress } from '@/app/actions/address-actions';

interface AddressFormProps {
    address?: any;
    onClose: () => void;
    onSuccess: () => void;
    apiKey: string;
}

const libraries: ("places" | "geometry")[] = ['places', 'geometry'];

const AddressForm: React.FC<AddressFormProps> = ({ address, onClose, onSuccess, apiKey }) => {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey,
        libraries
    });

    const [formData, setFormData] = useState({
        id: address?.id || null,
        name: address?.name || '',
        phone: address?.phone || '',
        full_address: address?.full_address || '',
        house_number: address?.house_number || '',
        street: address?.street || '',
        city: address?.city || '',
        state: address?.state || '',
        zip_code: address?.zip_code || '',
        country: address?.country || '',
        lat: address?.lat ? Number(address.lat) : 27.7172,
        lng: address?.lng ? Number(address.lng) : 85.3240,
        tag: address?.tag || 'Home',
        is_default: address?.is_default || false,
    });

    const [loading, setLoading] = useState(false);
    const [reverseGeocoding, setReverseGeocoding] = useState(false);
    const [error, setError] = useState('');

    const handleAddressSelect = (selectedAddress: any) => {
        setFormData(prev => ({
            ...prev,
            full_address: selectedAddress.full_address,
            street: selectedAddress.street,
            city: selectedAddress.city,
            state: selectedAddress.state,
            country: selectedAddress.country,
            zip_code: selectedAddress.zip_code,
            lat: Number(selectedAddress.lat),
            lng: Number(selectedAddress.lng),
        }));
    };

    const handleLocationChange = (lat: number, lng: number) => {
        setFormData(prev => ({ ...prev, lat, lng }));
    };

    const confirmLocationFromMap = async () => {
        if (!isLoaded || !formData.lat || !formData.lng) return;

        setReverseGeocoding(true);
        const geocoder = new google.maps.Geocoder();

        try {
            const response = await geocoder.geocode({ location: { lat: formData.lat, lng: formData.lng } });
            if (response.results[0]) {
                const result = response.results[0];
                const addressComponents = result.address_components;

                const streetNumber = addressComponents.find(c => c.types.includes('street_number'))?.long_name || '';
                const route = addressComponents.find(c => c.types.includes('route'))?.long_name || '';
                const city = addressComponents.find(c => c.types.includes('locality'))?.long_name || '';
                const state = addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.long_name || '';
                const country = addressComponents.find(c => c.types.includes('country'))?.long_name || '';
                const postalCode = addressComponents.find(c => c.types.includes('postal_code'))?.long_name || '';

                setFormData(prev => ({
                    ...prev,
                    full_address: result.formatted_address,
                    street: `${streetNumber} ${route}`.trim() || prev.street,
                    city: city || prev.city,
                    state: state || prev.state,
                    country: country || prev.country,
                    zip_code: postalCode || prev.zip_code,
                }));
            }
        } catch (err) {
            console.error("Reverse geocoding failed:", err);
        } finally {
            setReverseGeocoding(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await saveAddress(formData);
        setLoading(false);

        if (result.success) {
            onSuccess();
        } else {
            setError(result.error || 'Failed to save address');
        }
    };

    const tags = [
        { name: 'Home', icon: Home },
        { name: 'Work', icon: Briefcase },
        { name: 'Other', icon: Info },
    ];

    if (loadError) return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 text-white">Error loading Google Maps API</div>;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-300">

                {/* Left Side: Map and Search */}
                <div className="w-full md:w-1/2 p-8 bg-muted/10 border-r flex flex-col gap-6 relative">
                    <div className="flex items-center justify-between md:hidden mb-4">
                        <h2 className="text-2xl font-bold font-lufga">{address ? 'Edit' : 'Add'} Address</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-muted"><X className="h-6 w-6" /></button>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground font-lufga">Search Location</label>
                        <AddressAutocomplete isApiLoaded={isLoaded} onAddressSelect={handleAddressSelect} />
                    </div>

                    <div className="flex-1 min-h-[350px] border-2 border-white shadow-inner rounded-3xl overflow-hidden relative">
                        {isLoaded ? (
                            <AddressMap
                                lat={formData.lat}
                                lng={formData.lng}
                                onLocationChange={handleLocationChange}
                            />
                        ) : (
                            <div className="h-full w-full bg-muted animate-pulse flex items-center justify-center font-bold text-muted-foreground">Loading Map...</div>
                        )}

                        {/* Map Overlay Button */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[80%]">
                            <button
                                type="button"
                                onClick={confirmLocationFromMap}
                                disabled={!isLoaded || reverseGeocoding}
                                className="w-full h-12 rounded-2xl bg-white/90 backdrop-blur-md border border-primary/20 shadow-xl flex items-center justify-center gap-2 font-bold text-primary text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all group"
                            >
                                {reverseGeocoding ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-primary group-hover:text-white" />
                                ) : (
                                    <CheckCircle2 className="h-4 w-4" />
                                )}
                                <span>Confirm Pin Location</span>
                            </button>
                        </div>

                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-sm text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 pointer-events-none">
                            <MapPin className="h-3 w-3 text-primary" />
                            Drag marker to pinpoint
                        </div>
                    </div>
                </div>

                {/* Right Side: Form Details */}
                <div className="w-full md:w-1/2 p-8 overflow-y-auto">
                    <div className="hidden md:flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold font-lufga">{address ? 'Edit' : 'Add'} Address</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors"><X className="h-6 w-6" /></button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <User className="h-3 w-3" /> Full Name
                                </label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full h-12 px-4 rounded-xl border bg-muted/20 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Phone className="h-3 w-3" /> Phone Number
                                </label>
                                <input
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full h-12 px-4 rounded-xl border bg-muted/20 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <AlignLeft className="h-3 w-3" /> Full Address
                            </label>
                            <textarea
                                required
                                value={formData.full_address}
                                onChange={e => setFormData(prev => ({ ...prev, full_address: e.target.value }))}
                                placeholder="Complete address (calculated from pin or search)"
                                className="w-full min-h-[80px] p-4 rounded-xl border bg-muted/20 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm font-medium resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">House / Flat / Floor No.</label>
                                <input
                                    value={formData.house_number}
                                    onChange={e => setFormData(prev => ({ ...prev, house_number: e.target.value }))}
                                    className="w-full h-12 px-4 rounded-xl border bg-muted/20 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Street / Locality</label>
                                <input
                                    required
                                    value={formData.street}
                                    onChange={e => setFormData(prev => ({ ...prev, street: e.target.value }))}
                                    className="w-full h-12 px-4 rounded-xl border bg-muted/20 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm font-medium"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">City</label>
                                <input
                                    required
                                    value={formData.city}
                                    onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                    className="w-full h-12 px-4 rounded-xl border bg-muted/20 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Zip / Postal Code</label>
                                <input
                                    required
                                    value={formData.zip_code}
                                    onChange={e => setFormData(prev => ({ ...prev, zip_code: e.target.value }))}
                                    className="w-full h-12 px-4 rounded-xl border bg-muted/20 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Save As</label>
                            <div className="flex gap-4">
                                {tags.map(tag => (
                                    <button
                                        key={tag.name}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, tag: tag.name }))}
                                        className={`flex-1 h-14 rounded-2xl border-2 flex items-center justify-center gap-2 transition-all font-bold text-xs ${formData.tag === tag.name
                                            ? 'border-primary bg-primary/5 text-primary'
                                            : 'border-muted text-muted-foreground hover:border-primary/50'
                                            }`}
                                    >
                                        <tag.icon className="h-4 w-4" />
                                        {tag.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 py-4">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, is_default: !prev.is_default }))}
                                className={`h-6 w-11 rounded-full relative transition-colors ${formData.is_default ? 'bg-primary' : 'bg-muted'}`}
                            >
                                <div className={`absolute top-1 left-1 h-4 w-4 bg-white rounded-full transition-transform ${formData.is_default ? 'translate-x-5' : ''}`} />
                            </button>
                            <span className="text-sm font-bold text-muted-foreground">Set as default address</span>
                        </div>

                        {error && <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}

                        <button
                            disabled={loading}
                            className="w-full h-14 rounded-full bg-primary text-white font-bold text-lg flex items-center justify-center shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : address ? 'Update Address' : 'Save Address'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddressForm;
