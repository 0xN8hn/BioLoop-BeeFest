'use client';

import React, { useEffect, useRef, useState, ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Leaf, Menu, X } from "lucide-react";

/* ---------- helpers ---------- */

function useReveal(): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, visible];
}

function useCountUp(target: number, active: boolean, duration = 1400): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    let raf: number;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return value;
}

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(26px)",
        transition: `opacity 0.8s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 0.8s cubic-bezier(.16,1,.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ---------- custom app-style icons (bukan lucide di lingkaran) ---------- */

interface IconSquareProps {
  bg: string;
  children: ReactNode;
  size?: number;
}

function IconSquare({ bg, children, size = 56 }: IconSquareProps) {
  return (
    <div
      className="rounded-2xl flex items-center justify-center relative overflow-hidden shrink-0"
      style={{
        width: size,
        height: size,
        background: bg,
        boxShadow: "0 6px 16px -8px rgba(22,36,30,0.35)",
      }}
    >
      <div
        className="absolute -right-3 -top-3 w-8 h-8 rounded-full"
        style={{ background: "rgba(255,255,255,0.16)" }}
      />
      {children}
    </div>
  );
}

function ListingGlyph() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <path d="M4 8.5L13 4l9 4.5-9 4.5-9-4.5Z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M4 8.5V17l9 4.5 9-4.5V8.5" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M13 13v8.5" stroke="#fff" strokeWidth="1.8" />
    </svg>
  );
}

function ClaimGlyph() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <rect x="3" y="8" width="13" height="9" rx="1.5" stroke="#fff" strokeWidth="1.8" />
      <path d="M16 11h4l3 3.5V17h-7v-6Z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="8" cy="19.5" r="2" fill="#fff" />
      <circle cx="19" cy="19.5" r="2" fill="#fff" />
    </svg>
  );
}

function TrackGlyph() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <path d="M4 18l5.5-6 4 3.5L21 7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 7h5v5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MapGlyph() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <path
        d="M13 22s7-7.2 7-12.5A7 7 0 0 0 6 9.5C6 14.8 13 22 13 22Z"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="13" cy="9.5" r="2.4" fill="#fff" />
    </svg>
  );
}

function ShieldGlyph() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <path
        d="M13 3.5 21 6.5V12c0 6-3.5 9-8 10.5C8.5 21 5 18 5 12V6.5L13 3.5Z"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9.5 12.5l2.3 2.3 4.7-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UsersGlyph() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <circle cx="9.5" cy="9" r="3.2" stroke="#fff" strokeWidth="1.8" />
      <path d="M3.5 21c0-3.6 2.7-6 6-6s6 2.4 6 6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="18" cy="9.5" r="2.6" stroke="#fff" strokeWidth="1.6" />
      <path d="M16.5 15.2c2.7 0.2 5 2.4 5 5.8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- hero illustration ---------- */

interface HeroIllustrationProps {
  visible: boolean;
}

function HeroIllustration({ visible }: HeroIllustrationProps) {
  return (
    <svg viewBox="0 0 560 520" className="w-full h-full" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="binGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF7A5C" />
          <stop offset="100%" stopColor="#F0603C" />
        </linearGradient>
        <linearGradient id="larvaGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3FCB6E" />
          <stop offset="100%" stopColor="#16A34A" />
        </linearGradient>
        <linearGradient id="feedGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFC24B" />
          <stop offset="100%" stopColor="#F5A623" />
        </linearGradient>
        <linearGradient id="fertGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#57B8EA" />
          <stop offset="100%" stopColor="#2F9BE0" />
        </linearGradient>
      </defs>

      <circle cx="440" cy="90" r="90" fill="#FFE9C7" style={{ animation: "float 8s ease-in-out infinite" }} />
      <circle cx="70" cy="420" r="70" fill="#D9F2E0" style={{ animation: "float 7s ease-in-out infinite reverse" }} />

      <g
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.8s ease 0.1s, transform 0.8s cubic-bezier(.16,1,.3,1) 0.1s",
        }}
      >
        <rect x="40" y="200" width="120" height="140" rx="18" fill="url(#binGrad)" />
        <rect x="30" y="180" width="140" height="30" rx="14" fill="#F0603C" />
        <circle cx="100" cy="270" r="26" fill="#FFFFFF" opacity="0.25" />
      </g>

      <path
        d="M175 260 C 205 260, 205 260, 235 260"
        stroke="#16241E"
        strokeOpacity="0.25"
        strokeWidth="2.5"
        strokeDasharray="6 8"
        fill="none"
      />

      <g
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.8s ease 0.35s, transform 0.8s cubic-bezier(.16,1,.3,1) 0.35s",
        }}
      >
        <rect x="245" y="170" width="150" height="170" rx="24" fill="url(#larvaGrad)" />
        <ellipse cx="320" cy="255" rx="42" ry="26" fill="#FFFFFF" opacity="0.9" />
        <circle cx="305" cy="250" r="4" fill="#16A34A" />
        <circle cx="332" cy="250" r="4" fill="#16A34A" />
        <path d="M305 264 Q320 272 335 264" stroke="#16A34A" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>

      <path
        d="M400 220 C 430 220, 430 160, 455 130"
        stroke="#16241E"
        strokeOpacity="0.25"
        strokeWidth="2.5"
        strokeDasharray="6 8"
        fill="none"
      />
      <path
        d="M400 300 C 430 300, 430 370, 455 400"
        stroke="#16241E"
        strokeOpacity="0.25"
        strokeWidth="2.5"
        strokeDasharray="6 8"
        fill="none"
      />

      <g
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.8s ease 0.6s, transform 0.8s cubic-bezier(.16,1,.3,1) 0.6s",
          animation: visible ? "float 6s ease-in-out infinite" : "none",
        }}
      >
        <rect x="450" y="70" width="90" height="100" rx="16" fill="url(#feedGrad)" />
        <path d="M470 100 h50 M470 120 h50 M470 140 h34" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
      </g>

      <g
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.8s ease 0.75s, transform 0.8s cubic-bezier(.16,1,.3,1) 0.75s",
          animation: visible ? "float 7s ease-in-out infinite reverse" : "none",
        }}
      >
        <rect x="450" y="360" width="90" height="100" rx="16" fill="url(#fertGrad)" />
        <path d="M472 405 q13-18 26 0 q13 18 26 0" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

interface MascotProps {
  size?: number;
}

function Mascot({ size = 110 }: MascotProps) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} style={{ animation: "float 5s ease-in-out infinite" }}>
      <defs>
        <linearGradient id="mascotGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3FCB6E" />
          <stop offset="100%" stopColor="#16A34A" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="120" rx="62" ry="54" fill="url(#mascotGrad)" />
      <path d="M70 70 Q60 40 40 45 Q55 65 70 70Z" fill="#F5A623" />
      <path d="M130 70 Q140 40 160 45 Q145 65 130 70Z" fill="#F5A623" />
      <circle cx="82" cy="118" r="7" fill="#16241E" />
      <circle cx="118" cy="118" r="7" fill="#16241E" />
      <path d="M82 140 Q100 154 118 140" stroke="#16241E" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="60" cy="130" r="9" fill="#FF7A5C" opacity="0.6" />
      <circle cx="140" cy="130" r="9" fill="#FF7A5C" opacity="0.6" />
    </svg>
  );
}

/* ---------- types for content data ---------- */

type GlyphComponent = () => JSX.Element;

interface Step {
  Glyph: GlyphComponent;
  bg: string;
  num: string;
  title: string;
  desc: string;
}

interface Feature {
  Glyph: GlyphComponent;
  bg: string;
  title: string;
  desc: string;
}

/* ---------- page ---------- */

export default function BioLoopLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [statsRef, statsVisible] = useReveal();

  const wasteTon = useCountUp(12.4, statsVisible);
  const partners = useCountUp(850, statsVisible);
  const co2 = useCountUp(3.2, statsVisible);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    const t = setTimeout(() => setHeroVisible(true), 150);
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(t);
    };
  }, []);

  const steps: Step[] = [
    {
      Glyph: ListingGlyph,
      bg: "#2F9BE0",
      num: "SPESIMEN 01",
      title: "Buat Listing",
      desc: "Producer mencatat estimasi volume dan kategori limbah organik dalam hitungan detik.",
    },
    {
      Glyph: ClaimGlyph,
      bg: "#16A34A",
      num: "SPESIMEN 02",
      title: "Diklaim Mitra",
      desc: "Fasilitas pengolah BSF terdekat melihat sebaran limbah dan menjadwalkan penjemputan.",
    },
    {
      Glyph: TrackGlyph,
      bg: "#F0603C",
      num: "SPESIMEN 03",
      title: "Lacak Dampak",
      desc: "Setiap kilogram terkonversi menjadi angka reduksi CO2e dan poin reward yang bisa dipantau.",
    },
  ];

  const features: Feature[] = [
    {
      Glyph: MapGlyph,
      bg: "#2F9BE0",
      title: "Peta sebaran limbah real-time",
      desc: "Mitra pengolah melihat titik limbah terdekat, meminimalkan jarak dan biaya penjemputan yang selama ini jadi hambatan terbesar pasokan BSF.",
    },
    {
      Glyph: ShieldGlyph,
      bg: "#16A34A",
      title: "Dashboard ESG otomatis",
      desc: "Laporan reduksi CO2e terhitung otomatis dari tiap transaksi, siap diunduh sebagai sertifikat hijau bulanan untuk kebutuhan pelaporan.",
    },
    {
      Glyph: UsersGlyph,
      bg: "#F5A623",
      title: "Sistem kepercayaan dua arah",
      desc: "Rating antara producer dan mitra menjaga kualitas setiap transaksi, dari ketepatan waktu hingga kebersihan limbah yang diserahkan.",
    },
  ];

  const partnersRow: string[] = [
    "Warung Makan Bahagia",
    "Hotel Cemara Raya",
    "Peternakan Sinergi",
    "Katering Nusantara",
    "Pasar Segar Kita",
    "Resto Daun Muda",
  ];

  const marqueeColors = ["#16A34A", "#F5A623", "#2F9BE0", "#F0603C"];

  return (
    <div className="w-full min-h-screen bg-[#FAFAF7] text-[#16241E] antialiased overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

        .font-display { font-family: 'Fraunces', serif; font-optical-sizing: auto; }
        .font-body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(3deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.10; transform: scale(1); }
          50% { opacity: 0.22; transform: scale(1.06); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .marquee-track { animation: marquee 26s linear infinite; }

        .underline-hover { position: relative; }
        .underline-hover::after {
          content: '';
          position: absolute;
          left: 0; bottom: -3px;
          width: 100%; height: 1px;
          background: currentColor;
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.4s cubic-bezier(.16,1,.3,1);
        }
        .underline-hover:hover::after { transform: scaleX(1); transform-origin: left; }

        .btn-solid { transition: background-color 0.3s ease, transform 0.3s ease; }
        .btn-solid:hover { transform: translateY(-1px); }

        .row-hover { transition: background-color 0.3s ease; }
        .row-hover:hover { background-color: rgba(22,36,30,0.02); }

        .icon-pop { transition: transform 0.4s cubic-bezier(.16,1,.3,1); }
        .row-hover:hover .icon-pop { transform: scale(1.06) rotate(-2deg); }
      `}</style>

      {/* NAV */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-[#FAFAF7]/90 backdrop-blur-md shadow-[0_1px_0_0_rgba(22,36,30,0.08)]" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#16A34A] flex items-center justify-center">
              <Leaf size={17} color="#FAFAF7" strokeWidth={2} />
            </div>
            <span className="font-body font-extrabold text-xl tracking-tight">BioLoop</span>
          </div>

          <nav className="hidden md:flex items-center gap-10 font-body font-medium text-[15px] text-[#16241E]/80">
            <a href="#fitur" className="underline-hover">Fitur</a>
            <a href="#cara-kerja" className="underline-hover">Cara Kerja</a>
            <a href="#mitra" className="underline-hover">Mitra</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button className="font-body font-medium text-[15px] px-5 py-2.5 rounded-full hover:bg-[#16241E]/5 transition-colors duration-300">
              Masuk
            </button>
            <button className="btn-solid font-body text-[15px] font-bold px-5 py-2.5 rounded-full bg-[#16A34A] text-white flex items-center gap-1.5">
              Daftar <ArrowUpRight size={16} strokeWidth={2.4} />
            </button>
          </div>

          <button className="md:hidden" onClick={() => setMenuOpen((v) => !v)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden px-6 pb-6 flex flex-col gap-4 font-body font-medium bg-[#FAFAF7]">
            <a href="#fitur" onClick={() => setMenuOpen(false)}>Fitur</a>
            <a href="#cara-kerja" onClick={() => setMenuOpen(false)}>Cara Kerja</a>
            <a href="#mitra" onClick={() => setMenuOpen(false)}>Mitra</a>
            <button className="mt-2 px-5 py-2.5 rounded-full bg-[#16A34A] text-white font-bold">Daftar</button>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative max-w-7xl mx-auto px-6 md:px-10 pt-36 md:pt-44 pb-16 grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
        <div className="md:col-span-6 relative z-10">
          <h1
            className="font-display font-normal text-[#16241E] leading-[1.02] text-[3rem] sm:text-[3.8rem] md:text-[4.3rem]"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(32px)",
              transition: "opacity 1.1s cubic-bezier(.16,1,.3,1), transform 1.1s cubic-bezier(.16,1,.3,1)",
            }}
          >
            Dari sisa makanan,
            <br />
            jadi sumber daya.
          </h1>

          <p
            className="font-body text-[#16241E]/70 text-lg mt-7 max-w-md leading-relaxed"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 1.1s cubic-bezier(.16,1,.3,1) 0.15s, transform 1.1s cubic-bezier(.16,1,.3,1) 0.15s",
            }}
          >
            BioLoop menghubungkan penghasil limbah organik dengan mitra pengolah
            larva Black Soldier Fly terdekat. Cepat, terlacak, dan bernilai.
          </p>

          <div
            className="flex items-center gap-5 mt-9"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 1.1s cubic-bezier(.16,1,.3,1) 0.3s, transform 1.1s cubic-bezier(.16,1,.3,1) 0.3s",
            }}
          >
            <button className="btn-solid font-body font-bold px-7 py-3.5 rounded-full bg-[#16A34A] text-white flex items-center gap-2">
              Mulai Gratis <ArrowRight size={17} strokeWidth={2.4} />
            </button>
            <button className="font-body font-medium text-[#16241E] underline-hover">Lihat Demo Produk</button>
          </div>

          <div
            className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-10 font-body text-sm text-[#16241E]/60"
            style={{ opacity: heroVisible ? 1 : 0, transition: "opacity 1.1s ease 0.5s" }}
          >
            <span>Data terenkripsi</span>
            <span className="w-1 h-1 rounded-full bg-[#16241E]/30" />
            <span>Mitra terverifikasi</span>
            <span className="w-1 h-1 rounded-full bg-[#16241E]/30" />
            <span>850+ pengguna aktif</span>
          </div>
        </div>

        <div className="md:col-span-6 relative h-[380px] md:h-[500px]">
          <HeroIllustration visible={heroVisible} />
        </div>
      </section>

      {/* COLORFUL STATS BLOCK */}
      <section ref={statsRef} className="relative mx-4 md:mx-10 rounded-[2.5rem] bg-[#16A34A] overflow-hidden my-16">
        <div className="absolute -left-16 -top-16 w-72 h-72 rounded-full bg-white/10" style={{ animation: "pulseGlow 6s ease-in-out infinite" }} />
        <div className="absolute -right-10 -bottom-24 w-80 h-80 rounded-full bg-[#0F7A3A]/50" style={{ animation: "pulseGlow 7s ease-in-out infinite reverse" }} />
        <div className="relative z-10 px-8 md:px-16 py-14 flex flex-wrap gap-x-20 gap-y-8 text-white">
          <div>
            <div className="font-mono text-4xl md:text-5xl">{wasteTon.toFixed(1)}t</div>
            <div className="font-body text-sm text-white/75 mt-2">Limbah diproses / bulan</div>
          </div>
          <div>
            <div className="font-mono text-4xl md:text-5xl">{Math.round(partners)}+</div>
            <div className="font-body text-sm text-white/75 mt-2">Mitra terdaftar</div>
          </div>
          <div>
            <div className="font-mono text-4xl md:text-5xl">{co2.toFixed(1)}t</div>
            <div className="font-body text-sm text-white/75 mt-2">CO2e tereduksi</div>
          </div>
        </div>
      </section>

      {/* PARTNER MARQUEE */}
      <div className="py-8 overflow-hidden border-y border-[#16241E]/10">
        <div className="flex whitespace-nowrap marquee-track font-body text-[#16241E]/40 text-sm tracking-wide">
          {[...partnersRow, ...partnersRow].map((name, i) => (
            <span key={i} className="mx-8 flex items-center gap-2">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                style={{ background: marqueeColors[i % marqueeColors.length] }}
              >
                {name.charAt(0)}
              </span>
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* CARA KERJA */}
      <section id="cara-kerja" className="max-w-7xl mx-auto px-6 md:px-10 py-24">
        <Reveal>
          <h2 className="font-body font-extrabold text-[#16241E] text-3xl md:text-4xl max-w-lg mb-16">
            Tiga langkah, satu siklus tertutup.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-10">
          {steps.map((s, i) => (
            <Reveal key={s.num} delay={i * 140}>
              <div>
                <div className="icon-pop inline-block mb-6">
                  <IconSquare bg={s.bg}>
                    <s.Glyph />
                  </IconSquare>
                </div>
                <div className="font-mono text-xs text-[#16241E]/40 mb-2 tracking-wide">{s.num}</div>
                <h3 className="font-body font-extrabold text-2xl mb-3">{s.title}</h3>
                <p className="font-body text-[#16241E]/60 text-[15px] leading-relaxed mb-6 max-w-xs">{s.desc}</p>
                <button className="btn-solid font-body text-sm font-bold px-5 py-2.5 rounded-full bg-[#16A34A] text-white">
                  Pelajari Lebih Lanjut
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FITUR */}
      <section id="fitur" className="max-w-7xl mx-auto px-6 md:px-10 pb-24">
        <Reveal>
          <h2 className="font-body font-extrabold text-[#16241E] text-3xl md:text-4xl max-w-lg mb-4">
            Satu platform, banyak manfaat.
          </h2>
        </Reveal>

        <div className="mt-10 border-t border-[#16241E]/10">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 100}>
              <div className="row-hover border-b border-[#16241E]/10 py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center px-2 rounded-2xl">
                <div className="md:col-span-1">
                  <div className="icon-pop">
                    <IconSquare bg={f.bg} size={52}>
                      <f.Glyph />
                    </IconSquare>
                  </div>
                </div>
                <div className="md:col-span-4">
                  <h3 className="font-body font-extrabold text-xl md:text-2xl">{f.title}</h3>
                </div>
                <div className="md:col-span-6">
                  <p className="font-body text-[#16241E]/60 text-[15px] leading-relaxed">{f.desc}</p>
                </div>
                <div className="md:col-span-1 flex md:justify-end">
                  <ArrowUpRight size={20} strokeWidth={2} className="text-[#16241E]/30" />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA PENUTUP dengan mascot */}
      <section id="mitra" className="max-w-7xl mx-auto px-6 md:px-10 pb-28">
        <Reveal>
          <div className="rounded-[2.5rem] bg-[#16241E] text-white px-10 py-16 text-center relative overflow-hidden">
            <div
              className="absolute left-1/2 top-0 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#16A34A]/15"
              style={{ animation: "pulseGlow 6s ease-in-out infinite" }}
            />
            <div className="relative z-10 flex flex-col items-center">
              <Mascot size={100} />
              <h2 className="font-body font-extrabold text-3xl md:text-4xl max-w-xl mx-auto leading-tight mt-6">
                Mulai tutup siklusnya, hari ini.
              </h2>
              <button className="btn-solid mt-9 font-body font-bold px-8 py-4 rounded-full bg-[#16A34A] text-white inline-flex items-center gap-2">
                Daftarkan Bisnis Anda <ArrowRight size={17} strokeWidth={2.4} />
              </button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 md:px-10 pb-10 flex flex-wrap items-center justify-between gap-4 font-body text-sm text-[#16241E]/50">
        <span>© 2026 BioLoop. Semua hak dilindungi.</span>
        <div className="flex gap-6">
          <a href="#" className="underline-hover">Privasi</a>
          <a href="#" className="underline-hover">Ketentuan</a>
          <a href="#" className="underline-hover">Kontak</a>
        </div>
      </footer>
    </div>
  );
}