import { Loader2 } from "lucide-react"

export default function AdminLoading() {
    return (
        <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-muted/20">
            <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <div className="absolute inset-0 h-10 w-10 animate-pulse rounded-full border-2 border-primary/20" />
                </div>
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground animate-pulse">
                    Updating Dashboard...
                </p>
            </div>
        </div>
    )
}
