"use client"

import * as React from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules"
import Link from "next/link"
import { proxyImageUrl } from "@/lib/image-proxy"

import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "swiper/css/effect-fade"

interface Banner {
    id: string
    title: string
    subtitle: string | null
    cta_text: string | null
    cta_link: string | null
    image_url: string
}

const FALLBACK_SLIDES: Banner[] = [
    {
        id: "1",
        title: "New Arrivals",
        subtitle: "Spring Collection 2024",
        cta_text: "Shop Now",
        cta_link: "/",
        image_url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop"
    }
]

export function HeroSlider({ banners }: { banners?: Banner[] }) {
    const slides = (banners && banners.length > 0) ? banners : FALLBACK_SLIDES

    return (
        <section className="w-full">
            <Swiper
                modules={[Navigation, Pagination, Autoplay, EffectFade]}
                effect="fade"
                speed={1000}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                navigation
                className="h-[600px] w-full"
            >
                {slides.map((slide) => (
                    <SwiperSlide key={slide.id}>
                        <div className="relative h-full w-full">
                            <img
                                src={proxyImageUrl(slide.image_url)}
                                alt={slide.title}
                                className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30" />
                            <div className="absolute inset-0 flex items-center">
                                <div className="container mx-auto px-4">
                                    <div className="max-w-xl space-y-6 text-white animate-in slide-in-from-left duration-1000">
                                        {slide.subtitle && <p className="text-sm font-bold uppercase tracking-[0.2em]">{slide.subtitle}</p>}
                                        <h2 className="text-5xl font-bold font-lufga leading-tight">{slide.title}</h2>
                                        {slide.cta_text && (
                                            <div className="pt-4">
                                                <Link
                                                    href={slide.cta_link || "/"}
                                                    className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-bold text-black transition-transform hover:scale-105"
                                                >
                                                    {slide.cta_text}
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    )
}
