"use client"

import { useState, useEffect } from "react"
import {
    Mail,
    Search,
    Trash2,
    CheckCircle,
    Clock,
    User,
    MessageSquare,
    Loader2,
    X,
    ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/store/use-toast"
import { format } from "date-fns"

export default function AdminMessagesPage() {
    const { addToast } = useToast()
    const [loading, setLoading] = useState(true)
    const [messages, setMessages] = useState<any[]>([])
    const [search, setSearch] = useState("")
    const [selectedMessage, setSelectedMessage] = useState<any>(null)

    useEffect(() => {
        fetchMessages()
    }, [])

    const fetchMessages = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/messages")
            const data = await res.json()
            if (data && !data.error) {
                setMessages(data)
            } else {
                addToast(data.error || "Failed to fetch messages", "error")
            }
        } catch (error) {
            addToast("An error occurred while fetching messages", "error")
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (id: string, status: string) => {
        try {
            const res = await fetch("/api/messages", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
            })
            if (res.ok) {
                setMessages(messages.map(m => m.id === id ? { ...m, status } : m))
                if (selectedMessage?.id === id) {
                    setSelectedMessage({ ...selectedMessage, status })
                }
                addToast(`Message marked as ${status}`, "success")
            } else {
                const data = await res.json()
                addToast(data.error || "Failed to update status", "error")
            }
        } catch (error) {
            addToast("An error occurred while updating status", "error")
        }
    }

    const deleteMessage = async (id: string) => {
        if (!confirm("Are you sure you want to delete this message?")) return

        try {
            const res = await fetch(`/api/messages?id=${id}`, {
                method: "DELETE",
            })
            if (res.ok) {
                setMessages(messages.filter(m => m.id !== id))
                if (selectedMessage?.id === id) {
                    setSelectedMessage(null)
                }
                addToast("Message deleted successfully", "success")
            } else {
                const data = await res.json()
                addToast(data.error || "Failed to delete message", "error")
            }
        } catch (error) {
            addToast("An error occurred while deleting", "error")
        }
    }

    const filteredMessages = messages.filter(m =>
        m.first_name.toLowerCase().includes(search.toLowerCase()) ||
        m.last_name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()) ||
        m.message.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center justify-between border-b pb-8">
                <div>
                    <h1 className="text-4xl font-bold font-lufga tracking-tight">Customer Messages</h1>
                    <p className="text-muted-foreground mt-1">Manage inquiries and feedback from your customers.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-12 pl-12 pr-6 w-80 rounded-full border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List Side */}
                <div className="lg:col-span-1 space-y-4">
                    {filteredMessages.length > 0 ? filteredMessages.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => setSelectedMessage(m)}
                            className={cn(
                                "w-full p-6 rounded-2xl border text-left transition-all group relative overflow-hidden",
                                selectedMessage?.id === m.id
                                    ? "bg-white shadow-xl border-primary/20 -translate-y-1"
                                    : "bg-white/50 hover:bg-white border-transparent hover:shadow-lg"
                            )}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "h-2 w-2 rounded-full",
                                        m.status === 'new' ? "bg-primary" : "bg-muted"
                                    )} />
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                                        {format(new Date(m.created_at), 'MMM dd, HH:mm')}
                                    </span>
                                </div>
                                <div className={cn(
                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider",
                                    m.status === 'new' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                )}>
                                    {m.status}
                                </div>
                            </div>
                            <h4 className="font-bold text-sm truncate pr-4">
                                {m.first_name} {m.last_name}
                            </h4>
                            <p className="text-xs text-muted-foreground truncate mb-2">{m.email}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2 italic opacity-60">
                                "{m.message}"
                            </p>
                        </button>
                    )) : (
                        <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed">
                            <Mail className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-sm font-bold text-muted-foreground">No messages found</p>
                        </div>
                    )}
                </div>

                {/* Detail Side */}
                <div className="lg:col-span-2">
                    {selectedMessage ? (
                        <div className="bg-white border rounded-3xl p-10 shadow-sm space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 sticky top-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <User className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold font-lufga">
                                            {selectedMessage.first_name} {selectedMessage.last_name}
                                        </h2>
                                        <div className="flex items-center gap-4 mt-1">
                                            <a href={`mailto:${selectedMessage.email}`} className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
                                                <Mail className="h-4 w-4" />
                                                {selectedMessage.email}
                                            </a>
                                            <span className="text-muted-foreground text-xs">•</span>
                                            <span className="text-muted-foreground text-xs flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {format(new Date(selectedMessage.created_at), 'MMMM do, yyyy - hh:mm a')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedMessage.status === 'new' && (
                                        <button
                                            onClick={() => updateStatus(selectedMessage.id, 'read')}
                                            className="h-10 px-4 rounded-xl border border-primary/20 bg-primary/5 text-primary text-xs font-bold hover:bg-primary/10 transition-all flex items-center gap-2"
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                            Mark as Read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteMessage(selectedMessage.id)}
                                        className="h-10 w-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                    <MessageSquare className="h-3 w-3" />
                                    Message Content
                                </div>
                                <div className="p-8 rounded-3xl bg-muted/30 border text-lg leading-relaxed text-foreground/80 font-medium italic">
                                    "{selectedMessage.message}"
                                </div>
                            </div>

                            <div className="pt-8 border-t">
                                <a
                                    href={`mailto:${selectedMessage.email}?subject=Regarding your inquiry at Modern Store`}
                                    className="inline-flex items-center gap-2 h-14 px-8 rounded-full bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg"
                                >
                                    <Mail className="h-5 w-5" />
                                    Reply via Email
                                    <ExternalLink className="h-4 w-4 opacity-50 ml-2" />
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center py-40 bg-muted/20 rounded-3xl border-2 border-dashed space-y-4">
                            <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center border shadow-sm text-muted-foreground/30">
                                <MessageSquare className="h-10 w-10" />
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-muted-foreground">Select a message to view details</p>
                                <p className="text-sm text-muted-foreground/60">Click on any inquiry from the left list.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
