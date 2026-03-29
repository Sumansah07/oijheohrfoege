import { Loader2 } from "lucide-react"

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <div className="absolute inset-0 h-12 w-12 animate-pulse rounded-full border-2 border-primary/20" />
                </div>
                <p className="text-sm font-bold tracking-[0.2em] uppercase text-muted-foreground animate-pulse">
                    Loading Store...
                </p>
            </div>
        </div>
    )
}
