"use client";

/**
 * BioLoop landing page — editorial charcoal, clay, and oatmeal system.
 * One clear idea per scene: source waste, show the methane problem, then show the recovery route.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Factory,
  Menu,
  PackageCheck,
  Route,
  Sprout,
  Truck,
  Utensils,
  X,
} from "lucide-react";

const ASSETS = {
  logo: "/bioloop/logo-mark.png",
  poster: "/bioloop/hero-poster.jpg",
  video: "/bioloop/hero-atmosphere.mp4",
  source: "/bioloop/kitchen-source.jpg",
  landfill: "/bioloop/landfill-methane.jpg",
  atmosphere: "/bioloop/methane-atmosphere.jpg",
  recovery: "/bioloop/bsf-recovery.jpg",
};

const steps = [
  [Utensils, "Pisahkan", "Masukkan sisa organik dari dapur sebelum bercampur dengan sampah lain."],
  [Truck, "Jemput", "Temukan mitra BSF yang dapat mengambilnya sesuai area dan kapasitas."],
  [Sprout, "Olah", "Sisa makanan masuk ke proses biologis dan menjadi sumber daya baru."],
] as const;

const tools = [
  [Route, "Daftar penjemputan", "Lihat sisa organik yang tersedia, lokasi, dan waktu pengambilan tanpa berpindah-pindah chat."],
  [Factory, "Partner yang tepat", "Mitra pengolah BSF dapat menemukan sumber bahan organik yang sesuai dengan rute mereka."],
  [PackageCheck, "Riwayat proses", "Simpan aktivitas yang selesai untuk evaluasi operasional dan pelaporan dampak."],
] as const;

const roles = [
  ["Untuk usaha makanan", "Restoran, hotel, katering, dan pasar yang ingin membuat sisa organik dari dapurnya lebih terarah."],
  ["Untuk pengolah BSF", "Fasilitas yang membutuhkan sumber bahan organik yang lebih terorganisir untuk proses pengolahan."],
  ["Untuk tim dampak", "Tim yang ingin merapikan catatan aktivitas keberlanjutan tanpa membuat proses baru yang rumit."],
] as const;

const storyFrames = [
  ["Dapur sudah selesai. Masalahnya belum.", "Setiap hari, sisa makanan yang tidak terarah ikut masuk ke alur sampah yang sama."],
  ["Di tempat pembuangan, sisa makanan membusuk tanpa oksigen.", "Dalam kondisi ini, bahan organik dapat menghasilkan metana, gas rumah kaca yang ikut memerangkap panas."],
  ["Metana bergerak ke atmosfer. Panas ikut tertahan.", "Gunung sampah bukan hanya soal ruang yang penuh. Ia juga menjadi bagian dari masalah iklim yang lebih besar."],
  ["Sisa makanan butuh rute lain.", "BioLoop mempertemukan sumber sisa organik dan partner pengolah agar prosesnya tidak berakhir di tempat pembuangan."],
] as const;

function Reveal({ children, className = "", delay = 0, initiallyVisible = false }: { children: ReactNode; className?: string; delay?: number; initiallyVisible?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(initiallyVisible);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`bl-reveal ${visible ? "is-visible" : ""} ${className}`}>
      {children}
    </div>
  );
}

export default function BioLoopLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [flowActive, setFlowActive] = useState(false);
  const [storyStep, setStoryStep] = useState(0);
  const flowRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 18);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => {
    const element = flowRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFlowActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const story = storyRef.current;
    if (!story) return;

    const frames = Array.from(story.querySelectorAll<HTMLElement>("[data-story-step]"));
    const observer = new IntersectionObserver(
      (entries) => {
        const active = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (active) setStoryStep(Number((active.target as HTMLElement).dataset.storyStep));
      },
      { threshold: [0.45, 0.7], rootMargin: "-10% 0px -10% 0px" },
    );

    frames.forEach((frame) => observer.observe(frame));
    return () => observer.disconnect();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="bioloop-page">
      <header className={`bl-topbar ${scrolled ? "is-scrolled" : ""}`}>
        <div className="bl-page-width bl-topbar-row">
          <a href="#beranda" className="bl-wordmark" onClick={closeMenu} aria-label="BioLoop beranda">
            <img src={ASSETS.logo} alt="" />
            <span>BioLoop</span>
          </a>

          <nav className="bl-main-nav" aria-label="Navigasi utama">
            <a href="#fitur">Fitur</a>
            <a href="#cara-kerja">Cara kerja</a>
            <a href="#mitra">Mitra</a>
          </nav>

          <div className="bl-nav-actions">
            <a className="bl-login-link" href="/login">Masuk</a>
            <a className="bl-button bl-button-clay" href="/register">Daftar <ArrowUpRight size={16} aria-hidden="true" /></a>
          </div>

          <button className="bl-menu-button" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Tutup menu" : "Buka menu"} aria-expanded={menuOpen}>
            {menuOpen ? <X size={20} /> : <Menu size={21} />}
          </button>
        </div>

        {menuOpen && (
          <div className="bl-mobile-menu">
            <a href="#fitur" onClick={closeMenu}>Fitur <ChevronRight size={16} aria-hidden="true" /></a>
            <a href="#cara-kerja" onClick={closeMenu}>Cara kerja <ChevronRight size={16} aria-hidden="true" /></a>
            <a href="#mitra" onClick={closeMenu}>Mitra <ChevronRight size={16} aria-hidden="true" /></a>
            <div>
              <a className="bl-login-link" href="/login">Masuk</a>
              <a className="bl-button bl-button-clay" href="/register" onClick={closeMenu}>Daftar <ArrowUpRight size={16} aria-hidden="true" /></a>
            </div>
          </div>
        )}
      </header>

      <main id="beranda">
        <section className="bl-hero-scene" aria-labelledby="hero-title">
          <video className="bl-hero-video" autoPlay muted loop playsInline preload="metadata" poster={ASSETS.poster} aria-hidden="true">
            <source src={ASSETS.video} type="video/mp4" />
          </video>
          <div className="bl-hero-video-overlay" aria-hidden="true" />
          <div className="bl-page-width bl-hero-video-content">
            <Reveal className="bl-hero-copy" initiallyVisible>
              <h1 id="hero-title">Sisa makanan <em>masih punya</em> tujuan.</h1>
              <p>BioLoop menghubungkan bisnis makanan dengan mitra pengolah Black Soldier Fly agar sisa organik dari dapur tidak berhenti sebagai sampah.</p>
              <div className="bl-hero-actions">
                <a className="bl-button bl-button-clay bl-button-large" href="/register">Mulai bersama BioLoop <ArrowUpRight size={17} aria-hidden="true" /></a>
                <a className="bl-text-link" href="#cerita">Lihat masalahnya <ArrowDown size={16} aria-hidden="true" /></a>
              </div>
            </Reveal>
          </div>
        </section>

        <section ref={storyRef} id="cerita" className="bl-story-scroll" aria-label="Cerita sisa makanan dan metana">
          <div className={`bl-story-stage bl-story-step-${storyStep}`}>
            <div className="bl-story-atmosphere" aria-hidden="true"><span /><span /><span /></div>
            <div className="bl-story-media">
              <img className="bl-source-image" src={ASSETS.source} alt="Sisa makanan yang dipisahkan di dapur" />
              <img className="bl-landfill-image" src={ASSETS.landfill} alt="Gunung sisa makanan di tempat pembuangan" />
              <img className="bl-atmosphere-image" src={ASSETS.atmosphere} alt="Emisi dari sisa organik bergerak ke atmosfer" />
              <img className="bl-recovery-image" src={ASSETS.recovery} alt="Larva Black Soldier Fly mengolah sisa organik" />
            </div>
            <div className="bl-page-width bl-story-layout">
              <div className="bl-story-copy">
                {storyFrames.map(([title, text], index) => (
                  <article className={`bl-story-frame ${storyStep === index ? "is-active" : ""}`} key={title}>
                    <h2>{title}</h2>
                    <p>{text}</p>
                    {index === 1 && (
                      <p className="bl-story-source">Rujukan: <a href="https://www.epa.gov/lmop/basic-information-about-landfill-gas" target="_blank" rel="noreferrer">EPA</a> dan <a href="https://www.unep.org/resources/report/global-methane-assessment-benefits-and-costs-mitigating-methane-emissions" target="_blank" rel="noreferrer">UNEP</a>.</p>
                    )}
                    {index === 3 && <a className="bl-text-link bl-story-link" href="#cara-kerja">Lihat cara BioLoop bekerja <ArrowRight size={16} aria-hidden="true" /></a>}
                  </article>
                ))}
              </div>
              <div className="bl-story-progress" aria-hidden="true">{storyFrames.map((_, index) => <span className={storyStep >= index ? "is-active" : ""} key={index} />)}</div>
            </div>
          </div>
          <div className="bl-story-triggers" aria-hidden="true">{storyFrames.map((_, index) => <div data-story-step={index} key={index} />)}</div>
        </section>

        <section id="cara-kerja" className="bl-process-scene">
          <div className="bl-page-width bl-process-head">
            <Reveal><h2>Tiga langkah yang menjaga sisa makanan tetap bergerak.</h2></Reveal>
            <Reveal delay={100}><p>Setiap pihak tahu apa yang harus dilakukan berikutnya. Sesederhana itu.</p></Reveal>
          </div>
          <div ref={flowRef} className={`bl-page-width bl-process-rail ${flowActive ? "is-active" : ""}`}>
            <div className="bl-rail-line" aria-hidden="true"><span /></div>
            {steps.map(([Icon, title, text], index) => (
              <Reveal key={title} delay={index * 95} className="bl-process-step">
                <article><div className="bl-process-marker"><Icon size={21} aria-hidden="true" /></div><h3>{title}</h3><p>{text}</p></article>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="fitur" className="bl-tools-scene bl-page-width">
          <div className="bl-tools-copy"><Reveal><h2>Semua yang dibutuhkan untuk menjalankan alurnya.</h2><p>BioLoop tidak menambah pekerjaan baru. Kami hanya merapikan informasi yang sudah dibutuhkan oleh dapur dan pengolah.</p></Reveal></div>
          <div className="bl-tool-rail">
            {tools.map(([Icon, title, text], index) => (
              <Reveal className={`bl-tool-reveal ${index % 2 === 0 ? "from-left" : "from-right"}`} delay={50} key={title}>
                <article className="bl-tool-card"><div><Icon size={22} aria-hidden="true" /></div><h3>{title}</h3><p>{text}</p></article>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="mitra" className="bl-partner-scene">
          <div className="bl-page-width">
            <Reveal className="bl-partner-heading"><h2>Peran yang berbeda, satu alur yang sama.</h2><p>Pilih tempat BioLoop bisa membantu Anda memulai.</p></Reveal>
            <div className="bl-role-list">
              {roles.map(([title, text], index) => (
                <Reveal key={title} delay={index * 80}>
                  <article className="bl-role-row"><h3>{title}</h3><p>{text}</p><a href="/register" aria-label={`Daftar sebagai ${title}`}><ArrowUpRight size={20} aria-hidden="true" /></a></article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="hubungi" className="bl-closing-scene bl-page-width">
          <Reveal className="bl-closing-card">
            <div><h2>Ceritakan alur dapur Anda.</h2><p>Kami bantu melihat apakah BioLoop cocok untuk kebutuhan pengelolaan sisa makanan di bisnis Anda.</p></div>
            <a className="bl-button bl-button-amber bl-button-large" href="mailto:hello@bioloop.eco?subject=Diskusi%20BioLoop">Ngobrol dengan BioLoop <ArrowUpRight size={17} aria-hidden="true" /></a>
          </Reveal>
        </section>
      </main>

      <footer className="bl-footer">
        <div className="bl-page-width bl-footer-row">
          <a href="#beranda" className="bl-wordmark" aria-label="Kembali ke beranda BioLoop"><img src={ASSETS.logo} alt="" /><span>BioLoop</span></a>
          <span>Pengelolaan sisa makanan yang lebih terarah.</span>
          <div><a href="#cara-kerja">Cara kerja</a><a href="#mitra">Mitra</a></div>
        </div>
      </footer>
    </div>
  );
}
