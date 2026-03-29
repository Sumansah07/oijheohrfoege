'use client';

import React, { useEffect } from 'react';
import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
} from 'use-places-autocomplete';
import { Search, Loader2, MapPin, AlertCircle } from 'lucide-react';

interface AddressAutocompleteProps {
    onAddressSelect: (address: any) => void;
    isApiLoaded: boolean;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ onAddressSelect, isApiLoaded }) => {
    const {
        ready,
        value,
        suggestions: { status, data, loading: suggestionsLoading },
        setValue,
        clearSuggestions,
        init,
    } = usePlacesAutocomplete({
        debounce: 300,
        initOnMount: false,
    });

    // Manually initialize when API is loaded
    useEffect(() => {
        if (isApiLoaded) {
            init();
        }
    }, [isApiLoaded, init]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

    const handleSelect = ({ description }: { description: string }) => () => {
        setValue(description, false);
        clearSuggestions();

        getGeocode({ address: description })
            .then((results) => {
                const { lat, lng } = getLatLng(results[0]);

                const addressComponents = results[0].address_components;
                const streetNumber = addressComponents.find(c => c.types.includes('street_number'))?.long_name || '';
                const route = addressComponents.find(c => c.types.includes('route'))?.long_name || '';
                const city = addressComponents.find(c => c.types.includes('locality'))?.long_name || '';
                const state = addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.long_name || '';
                const country = addressComponents.find(c => c.types.includes('country'))?.long_name || '';
                const postalCode = addressComponents.find(c => c.types.includes('postal_code'))?.long_name || '';

                onAddressSelect({
                    street: `${streetNumber} ${route}`.trim(),
                    city,
                    state,
                    country,
                    zip_code: postalCode,
                    lat,
                    lng,
                    full_address: description
                });
            })
            .catch((error) => {
                console.error('Error during geocoding:', error);
            });
    };

    const renderSuggestions = () =>
        data.map((suggestion) => {
            const {
                place_id,
                structured_formatting: { main_text, secondary_text },
            } = suggestion;

            return (
                <li
                    key={place_id}
                    onClick={handleSelect(suggestion)}
                    className="p-4 hover:bg-primary/5 cursor-pointer transition-all border-b last:border-0 flex items-start gap-3 group"
                >
                    <div className="mt-1 h-6 w-6 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors shrink-0">
                        <MapPin className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <div>
                        <strong className="block text-sm font-bold text-foreground group-hover:text-primary transition-colors">{main_text}</strong>
                        <small className="text-xs text-muted-foreground line-clamp-1">{secondary_text}</small>
                    </div>
                </li>
            );
        });

    return (
        <div className="relative w-full">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                {ready ? (
                    suggestionsLoading ? <Loader2 className="h-5 w-5 text-primary animate-spin" /> : <Search className="h-5 w-5 text-muted-foreground" />
                ) : (
                    <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                )}
            </div>
            <input
                value={value}
                onChange={handleInput}
                disabled={!ready}
                placeholder={ready ? "Start typing your address..." : "Initializing search..."}
                className="w-full h-14 pl-12 pr-6 rounded-2xl border-2 border-transparent bg-muted/20 focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium placeholder:text-muted-foreground/60 shadow-sm"
            />

            {/* Suggestions Dropdown */}
            {status === 'OK' && (
                <ul className="absolute z-[120] w-full mt-2 bg-white border-2 rounded-[1.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-2 bg-muted/5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b flex justify-between px-4">
                        <span>Suggestions</span>
                        <span>Powered by Google</span>
                    </div>
                    {renderSuggestions()}
                </ul>
            )}

            {/* Error or No Results */}
            {(status !== 'OK' && status !== '' && status !== 'ZERO_RESULTS') && (
                <div className="absolute z-[120] w-full mt-2 bg-white border-2 border-red-100 rounded-[1.5rem] shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 text-red-500 mb-1">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Search Error</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Status: {status}. Please ensure <b>Places API</b> is enabled in your Google Cloud Console.</p>
                </div>
            )}

            {status === 'ZERO_RESULTS' && value.length > 3 && (
                <div className="absolute z-[120] w-full mt-2 bg-white border-2 rounded-[1.5rem] shadow-2xl p-6 text-center animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-sm font-medium text-muted-foreground">No matches found. Try refining your search or use the map pin.</p>
                </div>
            )}
        </div>
    );
};

export default AddressAutocomplete;
