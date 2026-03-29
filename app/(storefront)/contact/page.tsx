"use client"

import { useState, useEffect } from "react";
import { ArrowRight, Mail, MapPin, Phone, Loader2 } from "lucide-react";
import { submitContactForm } from "@/app/actions/contact";
import { useToast } from "@/store/use-toast";

export default function ContactPage() {
    const { addToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [settings, setSettings] = useState<any>(null);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        message: ""
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/settings");
                const data = await res.json();
                if (data && !data.error) {
                    setSettings(data);
                }
            } catch (error) {
                console.error("Failed to fetch settings", error);
            }
        };
        fetchSettings();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const result = await submitContactForm(formData);
            if (result.success) {
                addToast("Message sent successfully! We'll get back to you soon.", "success");
                setFormData({
                    first_name: "",
                    last_name: "",
                    email: "",
                    message: ""
                });
            } else {
                addToast(result.error || "Failed to send message. Please try again.", "error");
            }
        } catch (error) {
            addToast("An unexpected error occurred. Please try again later.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    return (
        <div className="container mx-auto px-4 py-16 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Contact Us</p>
                        <h1 className="text-5xl font-bold font-lufga">Get in Touch</h1>
                        <p className="text-lg text-muted-foreground max-w-md">
                            Have a question about an order or just want to say hello? We'd love to hear from you.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                            <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center text-primary shrink-0"><Mail className="h-6 w-6" /></div>
                            <div>
                                <h4 className="font-bold">Email Us</h4>
                                <p className="text-sm text-muted-foreground">{settings?.contact_email || "hello@modernstore.com"}</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center text-primary shrink-0"><Phone className="h-6 w-6" /></div>
                            <div>
                                <h4 className="font-bold">Call Us</h4>
                                <p className="text-sm text-muted-foreground">{settings?.contact_phone || "+1 (555) 000-0000"}</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center text-primary shrink-0"><MapPin className="h-6 w-6" /></div>
                            <div>
                                <h4 className="font-bold">Visit Us</h4>
                                <p className="text-sm text-muted-foreground">{settings?.address || "123 Design St, Creative City, ST 12345"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-muted/30 p-8 md:p-12 rounded-3xl space-y-6 border">
                    <h2 className="text-3xl font-bold font-lufga mb-4">Send a Message</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                id="first_name"
                                type="text"
                                placeholder="First Name"
                                value={formData.first_name}
                                onChange={handleChange}
                                className="h-14 w-full rounded-xl border bg-background px-4 text-sm focus:ring-1 focus:ring-primary outline-none"
                                required
                            />
                            <input
                                id="last_name"
                                type="text"
                                placeholder="Last Name"
                                value={formData.last_name}
                                onChange={handleChange}
                                className="h-14 w-full rounded-xl border bg-background px-4 text-sm focus:ring-1 focus:ring-primary outline-none"
                                required
                            />
                        </div>
                        <input
                            id="email"
                            type="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            className="h-14 w-full rounded-xl border bg-background px-4 text-sm focus:ring-1 focus:ring-primary outline-none"
                            required
                        />
                        <textarea
                            id="message"
                            placeholder="How can we help?"
                            rows={6}
                            value={formData.message}
                            onChange={handleChange}
                            className="w-full rounded-xl border bg-background p-4 text-sm focus:ring-1 focus:ring-primary outline-none resize-none"
                            required
                        ></textarea>
                        <button
                            disabled={isSubmitting}
                            className="w-full h-14 bg-primary text-white rounded-full font-bold flex items-center justify-center group disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Send Message <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

