// SS Umroh — Full Website React App (Single File)
// All 6 pages: Homepage, Paket Umroh, Korporat, Tentang Kami, Destinasi, Kontak
//
// STATIC DATA: design tokens, hero images, nav structure, destination copy, travel guides
// DYNAMIC DATA (marked /** CMS **/ ): packages, testimonials, FAQ, schedules, team, gallery
//
import { useState, useEffect, useRef, useCallback } from "react";

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&family=Inter:wght@400;500;600&family=Amiri:wght@400;700&display=swap');
:root{
  --p9:#1A0533;--p8:#2D0A5C;--p7:#4A1490;--p6:#7C3ABE;--p5:#9B5DD4;--p3:#D9B8F5;--p1:#EFE2FB;--p0:#F7F2FD;
  --g9:#78500A;--g7:#C48A1A;--g6:#D4A017;--g3:#F5CE6A;--g1:#FEF6DC;
  --r6:#C4235C;--r5:#E03572;--r4:#F04478;--r1:#FDD6E5;
  --n9:#1C1A20;--n7:#2E2B35;--n6:#534F5E;--n4:#7A7585;--n2:#B5B0BF;--n1:#DDD9E5;--n05:#F2F0F6;--n0:#FAFAF9;
  --ok:#0F6B45;--ok-bg:#D1FAE5;
  --font-h:'Ubuntu',system-ui,sans-serif;
  --font-b:'Inter',system-ui,sans-serif;
  --font-ar:'Amiri',serif;
  --nav-h:68px;
  --ease:cubic-bezier(0.16,1,0.3,1);
  --shadow-cta:0 4px 24px rgba(196,35,92,.30);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:var(--font-b);font-size:16px;line-height:1.7;color:var(--n9);background:var(--n0);overflow-x:hidden}
a{color:inherit;text-decoration:none}
img{max-width:100%;display:block}
ul{list-style:none}
button{cursor:pointer;border:none;background:none;font:inherit}
.container{width:100%;max-width:1200px;margin-inline:auto;padding-inline:24px}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0}
h1,h2,h3,h4{font-family:var(--font-h);line-height:1.18;letter-spacing:-0.01em}
.arabic{font-family:var(--font-ar);direction:rtl;font-size:clamp(18px,3vw,26px);letter-spacing:.04em;color:var(--g6)}
@keyframes slideUp{from{opacity:0;transform:translateY(48px)}to{opacity:1;transform:none}}
@keyframes slideLeft{from{opacity:0;transform:translateX(-48px)}to{opacity:1;transform:none}}
@keyframes slideRight{from{opacity:0;transform:translateX(48px)}to{opacity:1;transform:none}}
@keyframes scaleIn{from{opacity:0;transform:scale(.88)}to{opacity:1;transform:scale(1)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes flipUp{from{opacity:0;transform:perspective(600px) rotateX(18deg) translateY(32px)}to{opacity:1;transform:perspective(600px) rotateX(0) translateY(0)}}
@keyframes glowPulse{0%,100%{box-shadow:0 0 0 0 rgba(212,160,23,.4)}50%{box-shadow:0 0 0 10px rgba(212,160,23,0)}}
@keyframes waPulse{0%,100%{box-shadow:0 0 0 0 rgba(37,211,102,.45)}60%{box-shadow:0 0 0 14px rgba(37,211,102,0)}}
[data-anim]{opacity:0}
[data-anim].visible{animation-fill-mode:both;animation-timing-function:var(--ease)}
[data-anim="slide-up"].visible{animation:slideUp .7s both}
[data-anim="slide-left"].visible{animation:slideLeft .7s both}
[data-anim="slide-right"].visible{animation:slideRight .7s both}
[data-anim="scale"].visible{animation:scaleIn .65s both}
[data-anim="fade"].visible{animation:fadeIn .8s both}
[data-anim="flip"].visible{animation:flipUp .7s both}
[data-delay="100"].visible{animation-delay:.10s}[data-delay="200"].visible{animation-delay:.20s}
[data-delay="300"].visible{animation-delay:.30s}[data-delay="400"].visible{animation-delay:.40s}
[data-delay="500"].visible{animation-delay:.50s}[data-delay="600"].visible{animation-delay:.60s}
@media(prefers-reduced-motion:reduce){[data-anim]{opacity:1!important;animation:none!important}}
/* Nav */
.nav{position:fixed;top:0;left:0;right:0;z-index:100;height:var(--nav-h);transition:height .35s var(--ease),background .28s ease,box-shadow .28s ease;will-change:height,background;transform:translateZ(0)}
.nav.scrolled{height:58px;background:rgba(26,5,51,.97);backdrop-filter:blur(20px);box-shadow:0 1px 0 rgba(212,160,23,.12),0 4px 28px rgba(0,0,0,.28)}
.nav-inner{display:flex;align-items:center;justify-content:space-between;height:100%;gap:28px;padding:10px 0}
.nav-logo img{height:38px;width:auto;object-fit:contain;transition:height .35s var(--ease)}
.nav.scrolled .nav-logo img{height:30px}
.nav-links{display:flex;align-items:center;gap:2px;flex:1}
.nav-item{position:relative}
.nav-link{font-size:14px;font-weight:500;color:rgba(255,255,255,.82);padding:8px 13px;border-radius:6px;transition:color .2s,background .2s;white-space:nowrap;display:flex;align-items:center;gap:4px;cursor:pointer;background:none;border:none;font-family:inherit}
.nav-link:hover,.nav-link.active{color:#fff;background:rgba(255,255,255,.09)}
.nav-link .chevron{font-size:10px;opacity:.6;transition:transform .25s}
.nav-item:hover .chevron{transform:rotate(180deg)}
.mega{position:absolute;top:calc(100% + 10px);left:0;background:rgba(26,5,51,.98);backdrop-filter:blur(24px);border:1px solid rgba(212,160,23,.15);border-radius:16px;padding:20px;min-width:480px;display:grid;grid-template-columns:1fr 1fr;gap:6px;opacity:0;visibility:hidden;transform:translateY(-10px) scale(.97);transition:all .22s var(--ease);box-shadow:0 24px 60px rgba(0,0,0,.38);pointer-events:none}
.nav-item:hover .mega{opacity:1;visibility:visible;transform:none;pointer-events:auto}
.mega-item{display:flex;gap:12px;align-items:flex-start;padding:13px;border-radius:10px;transition:background .18s;cursor:pointer}
.mega-item:hover{background:rgba(255,255,255,.07)}
.mega-icon{width:38px;height:38px;border-radius:10px;background:rgba(212,160,23,.12);display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0}
.mega-label{font-size:13px;font-weight:600;color:#fff;margin-bottom:3px;font-family:var(--font-h)}
.mega-desc{font-size:11px;color:rgba(255,255,255,.5);line-height:1.5}
.nav-cta{margin-left:auto;background:var(--r6);color:#fff;font-size:14px;font-weight:600;padding:10px 22px;border-radius:999px;transition:background .2s,box-shadow .2s;white-space:nowrap;box-shadow:var(--shadow-cta);flex-shrink:0;cursor:pointer;border:none;font-family:inherit}
.nav.scrolled .nav-cta{padding:8px 18px;font-size:13px}
.nav-cta:hover{background:var(--r5)}
.hamburger{display:none;flex-direction:column;gap:5px;width:32px;padding:4px;cursor:pointer;background:none;border:none}
.hamburger span{display:block;height:2px;background:#fff;border-radius:2px;transition:all .25s}
.hamburger.open span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.hamburger.open span:nth-child(2){opacity:0;transform:scaleX(0)}
.hamburger.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
.mobile-nav{position:fixed;inset:0;background:rgba(26,5,51,.99);z-index:99;display:flex;flex-direction:column;padding:calc(var(--nav-h) + 24px) 24px 120px;gap:4px;overflow-y:auto;opacity:0;visibility:hidden;transition:all .32s var(--ease)}
.mobile-nav.open{opacity:1;visibility:visible}
.mobile-nav a,.mobile-nav button{font-family:var(--font-h);font-size:18px;font-weight:500;color:rgba(255,255,255,.8);padding:14px 0;border-bottom:1px solid rgba(255,255,255,.07);display:block;transition:color .18s;cursor:pointer;background:none;border:none;text-align:left;width:100%}
.mobile-nav a:hover,.mobile-nav button:hover{color:#fff}
.mob-ctas{margin-top:28px;display:flex;flex-direction:column;gap:12px}
/* Buttons */
.btn-primary{display:inline-flex;align-items:center;gap:8px;background:var(--r6);color:#fff;font-size:15px;font-weight:600;padding:14px 28px;border-radius:999px;box-shadow:var(--shadow-cta);transition:background .22s,transform .15s;white-space:nowrap;font-family:var(--font-h);cursor:pointer;border:none}
.btn-primary:hover{background:var(--r5);transform:translateY(-2px)}
.btn-outline{display:inline-flex;align-items:center;gap:8px;border:1.5px solid rgba(255,255,255,.28);color:#fff;font-size:14px;font-weight:500;padding:13px 24px;border-radius:999px;transition:border-color .22s,background .22s;font-family:var(--font-h);cursor:pointer;background:none}
.btn-outline:hover{border-color:rgba(255,255,255,.58);background:rgba(255,255,255,.07)}
.badge-hero{display:flex;align-items:center;gap:7px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:6px 13px;font-size:12px;color:rgba(255,255,255,.86);font-weight:500}
.badge-hero.ok{border-color:rgba(15,107,69,.45);background:rgba(15,107,69,.1);color:#6EE7B7}
/* Cards */
.k-card{background:#fff;border:1px solid var(--n1);border-radius:20px;padding:34px 28px;position:relative;overflow:hidden;transition:border-color .25s,box-shadow .25s,transform .22s}
.k-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(124,58,190,.025),transparent 55%);pointer-events:none}
.k-card:hover{border-color:rgba(124,58,190,.22);box-shadow:0 8px 36px rgba(44,13,92,.1);transform:translateY(-4px)}
.k-icon{width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,var(--p1),rgba(212,160,23,.1));display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:20px;transition:transform .25s}
.k-card:hover .k-icon{transform:scale(1.1) rotate(-4deg)}
.k-title{font-family:var(--font-h);font-size:18px;font-weight:700;color:var(--n9);margin-bottom:11px;line-height:1.3}
.k-body{font-size:14px;color:var(--n6);line-height:1.78;margin-bottom:15px}
.k-tag{font-size:11px;font-weight:700;color:var(--p6);background:var(--p1);border-radius:999px;padding:4px 12px;display:inline-block}
/* t-card */
.t-card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:26px;display:flex;flex-direction:column;gap:15px;transition:background .25s,border-color .25s,transform .22s}
.t-card:hover{background:rgba(255,255,255,.08);border-color:rgba(212,160,23,.22);transform:translateY(-4px)}
.t-stars{color:var(--g6);font-size:15px;letter-spacing:2px}
.t-quote{font-size:15px;color:rgba(255,255,255,.8);line-height:1.75;flex:1;font-style:italic}
.t-quote::before{content:'"';font-family:var(--font-h);font-size:36px;color:var(--g6);opacity:.5;display:block;line-height:1;margin-bottom:4px}
.t-author{display:flex;align-items:center;gap:12px;border-top:1px solid rgba(255,255,255,.06);padding-top:15px}
.t-av{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--p6),var(--g6));display:flex;align-items:center;justify-content:center;font-family:var(--font-h);font-size:14px;font-weight:700;color:#fff;flex-shrink:0}
.t-name{font-family:var(--font-h);font-size:13px;font-weight:600;color:#fff}
.t-meta{font-size:11px;color:rgba(255,255,255,.4)}
/* Accordion */
.acc-item{background:#fff;border:1px solid var(--n1);border-radius:12px;overflow:hidden;transition:border-color .22s,box-shadow .22s;margin-bottom:7px}
.acc-item.open{border-color:rgba(124,58,190,.3);box-shadow:0 4px 20px rgba(124,58,190,.07)}
.acc-btn{width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 20px;text-align:left;cursor:pointer;background:none;border:none;font:inherit;transition:background .18s}
.acc-btn:hover{background:rgba(124,58,190,.025)}
.acc-q{font-family:var(--font-h);font-size:14px;font-weight:600;color:var(--n9);line-height:1.45}
.acc-ico{width:22px;height:22px;border-radius:50%;background:var(--p1);color:var(--p6);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;transition:transform .28s var(--ease),background .22s}
.acc-item.open .acc-ico{transform:rotate(45deg);background:var(--p6);color:#fff}
.acc-body{display:none;padding:0 20px 18px;font-size:13px;color:var(--n6);line-height:1.78}
.acc-item.open .acc-body{display:block}
/* Section helpers */
.section-label{font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--p6);margin-bottom:12px;display:block}
.section-title{font-size:clamp(24px,3.5vw,38px);font-weight:700;color:var(--n9);margin-bottom:14px}
.section-sub{font-size:17px;color:var(--n6);max-width:580px;line-height:1.7}
.section-header{margin-bottom:clamp(36px,5vw,56px)}
.section-header.center{text-align:center}.section-header.center .section-sub{margin-inline:auto}
/* Trust */
.trust{background:var(--p9);border-top:1px solid rgba(212,160,23,.15);padding:40px 0}
.trust-in{display:flex;flex-direction:column;align-items:center;gap:18px;text-align:center}
.trust-badge{display:inline-flex;align-items:center;gap:10px;background:rgba(15,107,69,.15);border:1px solid rgba(15,107,69,.32);border-radius:999px;padding:9px 22px;font-size:13px;font-weight:700;color:#6EE7B7;font-family:var(--font-h);animation:glowPulse 3.5s ease-in-out infinite}
.trust-det{font-size:13px;color:rgba(255,255,255,.42);line-height:1.8}
.trust-det strong{color:rgba(255,255,255,.68);font-weight:500}
.trust-logo{opacity:.45;filter:brightness(2);height:32px;width:auto}
/* Footer */
footer{background:var(--p9);border-top:1px solid rgba(255,255,255,.05);padding:clamp(48px,6vw,80px) 0 0}
.footer-g{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:clamp(20px,4vw,44px);padding-bottom:44px;border-bottom:1px solid rgba(255,255,255,.06)}
.f-logo img{height:34px;width:auto;object-fit:contain;margin-bottom:14px}
.f-desc{font-size:12px;color:rgba(255,255,255,.42);line-height:1.75;margin-bottom:18px}
.f-ci{display:flex;align-items:flex-start;gap:8px;font-size:12px;color:rgba(255,255,255,.5);line-height:1.55;margin-bottom:7px}
.f-col-t{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:14px;font-family:var(--font-h)}
.f-link{font-size:12px;color:rgba(255,255,255,.5);display:block;margin-bottom:9px;transition:color .18s,padding-left .18s;cursor:pointer;background:none;border:none;text-align:left;font-family:inherit}
.f-link:hover{color:rgba(255,255,255,.88);padding-left:4px}
.f-soc{width:34px;height:34px;border-radius:8px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.09);display:inline-flex;align-items:center;justify-content:center;font-size:14px;color:rgba(255,255,255,.55);transition:background .2s,color .2s;margin-right:8px;cursor:pointer}
.f-soc:hover{background:rgba(212,160,23,.14);color:var(--g6)}
.f-bottom{padding:18px 0;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
.f-copy{font-size:11px;color:rgba(255,255,255,.28)}
.f-legal-link{font-size:11px;color:rgba(255,255,255,.28);margin-left:18px;cursor:pointer;background:none;border:none;font-family:inherit}
.f-legal-link:hover{color:rgba(255,255,255,.6)}
/* WA + MobBar */
.wa-wrap{position:fixed;bottom:90px;right:20px;z-index:90;display:flex;flex-direction:column;align-items:flex-end;gap:7px}
.wa-lbl{background:rgba(26,5,51,.92);color:#fff;font-size:11px;font-weight:600;padding:5px 12px;border-radius:999px;white-space:nowrap;font-family:var(--font-h);opacity:0;animation:fadeIn .5s 2.5s both}
.wa-btn{width:54px;height:54px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 4px 22px rgba(37,211,102,.42);transition:transform .22s;text-decoration:none;opacity:0;animation:scaleIn .5s 2.3s var(--ease) both}
.wa-btn:hover{transform:scale(1.1)}
.mob-bar{display:none;position:fixed;bottom:0;left:0;right:0;z-index:89;background:rgba(26,5,51,.98);backdrop-filter:blur(18px);border-top:1px solid rgba(212,160,23,.18);padding:9px 14px;gap:9px;align-items:center;box-shadow:0 -4px 24px rgba(0,0,0,.32)}
.mob-tel{flex:0 0 auto;display:flex;align-items:center;gap:5px;border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:10px 13px;font-size:12px;font-weight:700;color:#fff;font-family:var(--font-h);text-decoration:none}
.mob-wa-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:7px;background:var(--r6);color:#fff;border-radius:10px;padding:11px 14px;font-size:13px;font-weight:800;box-shadow:var(--shadow-cta);transition:background .2s;font-family:var(--font-h);text-decoration:none}
.mob-wa-btn:hover{background:var(--r5)}
/* Page hero shared */
.page-hero{min-height:60vh;display:flex;align-items:center;position:relative;overflow:hidden;padding-top:var(--nav-h);padding-bottom:clamp(40px,6vw,72px)}
.ph-bg{position:absolute;inset:0;background-size:cover;background-position:center 38%}
.ph-bg::after{content:'';position:absolute;inset:0;background:linear-gradient(160deg,rgba(10,1,26,.97) 0%,rgba(26,5,51,.92) 35%,rgba(45,10,92,.84) 62%,rgba(10,1,26,.94) 100%)}
.ph-pattern{position:absolute;inset:0;opacity:.042;background-image:repeating-linear-gradient(30deg,transparent,transparent 34px,rgba(212,160,23,1) 34px,rgba(212,160,23,1) 35px),repeating-linear-gradient(150deg,transparent,transparent 34px,rgba(212,160,23,1) 34px,rgba(212,160,23,1) 35px)}
.ph-glow{position:absolute;top:-8%;right:-4%;width:min(520px,58vw);height:min(520px,58vw);background:radial-gradient(ellipse,rgba(124,58,190,.28) 0%,transparent 68%);pointer-events:none}
.ph-content{position:relative;z-index:2;width:100%}
.breadcrumb{display:flex;align-items:center;gap:8px;margin-bottom:20px}
.breadcrumb-link{font-size:13px;color:rgba(255,255,255,.5);cursor:pointer;background:none;border:none;font-family:inherit}
.breadcrumb-link:hover{color:rgba(255,255,255,.85)}
.breadcrumb-sep{color:rgba(255,255,255,.25);font-size:12px}
.breadcrumb-cur{font-size:13px;color:var(--g6);font-weight:500}
.ph-h1{font-size:clamp(28px,4.5vw,52px);color:#fff;font-weight:700;margin-bottom:16px;line-height:1.15}
.ph-h1 em{font-style:normal;background:linear-gradient(135deg,var(--g6),var(--g3));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.ph-sub{font-size:clamp(14px,1.8vw,17px);color:rgba(255,255,255,.68);line-height:1.75;max-width:580px;margin-bottom:28px}
.ph-badges{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:28px}
.ph-ctas{display:flex;flex-wrap:wrap;gap:12px}
/* CTA Banner */
.cta-banner{background:linear-gradient(135deg,var(--p8),var(--p7));padding:clamp(56px,7vw,96px) 0;position:relative;overflow:hidden;text-align:center}
.cta-banner::before{content:'';position:absolute;inset:0;opacity:.05;background-image:repeating-linear-gradient(45deg,transparent,transparent 24px,rgba(212,160,23,1) 24px,rgba(212,160,23,1) 25px)}
.cta-banner .section-title{color:#fff}
.cta-banner .section-sub{color:rgba(255,255,255,.65);margin-inline:auto}
.cta-banner .section-label{color:var(--g6)}
.cta-btns{display:flex;flex-wrap:wrap;gap:14px;justify-content:center;margin-top:36px}
/* Testi section */
.testi-section{background:linear-gradient(175deg,var(--p9) 0%,#1e0843 100%);padding-block:clamp(56px,8vw,96px);position:relative;overflow:hidden}
.testi-section::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--g6),transparent)}
.t-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
/* FAQ section */
.faq-section{background:#fff;padding-block:clamp(56px,8vw,96px)}
.faq-inner{display:grid;grid-template-columns:1fr 2fr;gap:clamp(32px,5vw,80px);align-items:start}
.faq-side{position:sticky;top:calc(var(--nav-h)+24px)}
.faq-cta-box{background:linear-gradient(135deg,var(--p9),var(--p8));border-radius:18px;padding:28px;color:#fff;margin-top:28px}
.faq-cta-box h3{font-family:var(--font-h);font-size:18px;font-weight:700;color:#fff;margin-bottom:9px}
.faq-cta-box p{font-size:13px;color:rgba(255,255,255,.6);margin-bottom:20px;line-height:1.65}
.btn-faq{display:flex;align-items:center;justify-content:center;gap:7px;background:var(--r6);color:#fff;font-size:13px;font-weight:700;padding:13px;border-radius:10px;transition:background .2s;font-family:var(--font-h);box-shadow:var(--shadow-cta);cursor:pointer;border:none;width:100%;text-decoration:none}
.btn-faq:hover{background:var(--r5)}
/* Responsive */
@media(max-width:1024px){
  .footer-g{grid-template-columns:1fr 1fr}
  .t-grid{grid-template-columns:repeat(2,1fr)}
  .faq-inner{grid-template-columns:1fr}
  .faq-side{position:static}
}
@media(max-width:768px){
  .nav-links,.nav-cta{display:none}
  .hamburger{display:flex}
  .mob-bar{display:flex}
  .wa-wrap{bottom:80px}
  .t-grid{grid-template-columns:1fr}
  .footer-g{grid-template-columns:1fr}
  .ph-ctas,.cta-btns{flex-direction:column;align-items:stretch}
  .btn-primary,.btn-outline{justify-content:center}
}
/* ─── HALAL TOUR ─────────────────────────────────── */
.dest-card{background:#fff;border:1px solid var(--n1);border-radius:24px;overflow:hidden;transition:transform .28s var(--ease),box-shadow .28s,border-color .25s;display:flex;flex-direction:column}
.dest-card:hover{transform:translateY(-8px);box-shadow:0 24px 60px rgba(44,13,92,.14);border-color:rgba(124,58,190,.22)}
.dest-card-img{height:200px;position:relative;overflow:hidden;background:linear-gradient(135deg,var(--p1),var(--g1))}
.dest-card-img img{width:100%;height:100%;object-fit:cover;transition:transform .5s var(--ease)}
.dest-card:hover .dest-card-img img{transform:scale(1.07)}
.dest-card-badge{position:absolute;top:12px;left:12px;background:linear-gradient(135deg,var(--g6),var(--g7));color:var(--p9);font-size:11px;font-weight:800;padding:4px 11px;border-radius:999px;font-family:var(--font-h)}
.dest-card-body{padding:20px;flex:1;display:flex;flex-direction:column}
.dest-card-flag{font-size:20px;margin-bottom:6px}
.dest-card-name{font-family:var(--font-h);font-size:17px;font-weight:700;color:var(--n9);margin-bottom:5px}
.dest-card-desc{font-size:12px;color:var(--n6);line-height:1.65;flex:1;margin-bottom:12px}
.dest-card-meta{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.dest-meta-chip{font-size:10px;font-weight:700;padding:3px 9px;border-radius:999px;background:var(--n05);color:var(--n6)}
.dest-card-price{font-family:var(--font-h);font-size:12px;color:var(--n4);margin-bottom:10px}
.dest-card-price strong{color:var(--p6);font-size:15px}
.dest-card-cta{display:flex;align-items:center;justify-content:center;gap:6px;background:var(--p0);border:1.5px solid var(--p3);color:var(--p6);font-size:12px;font-weight:700;padding:10px;border-radius:10px;transition:background .2s,border-color .2s;font-family:var(--font-h);cursor:pointer;text-decoration:none}
.dest-card-cta:hover{background:var(--p6);color:#fff;border-color:var(--p6)}
.ht-pkg-card{background:#fff;border:1px solid var(--n1);border-radius:24px;overflow:hidden;transition:transform .28s var(--ease),box-shadow .28s,border-color .25s;display:flex;flex-direction:column}
.ht-pkg-card:hover{transform:translateY(-6px);box-shadow:0 20px 56px rgba(44,13,92,.12);border-color:rgba(124,58,190,.22)}
.ht-pkg-card.featured{border:2px solid var(--p6);position:relative}
.ht-pkg-card.featured::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--p6),var(--g6));z-index:1}
.ht-pkg-img{height:190px;position:relative;overflow:hidden}
.ht-pkg-img img{width:100%;height:100%;object-fit:cover;transition:transform .5s var(--ease)}
.ht-pkg-card:hover .ht-pkg-img img{transform:scale(1.06)}
.ht-pkg-tag{position:absolute;top:12px;left:12px;background:linear-gradient(135deg,var(--r6),var(--r5));color:#fff;font-size:11px;font-weight:800;padding:4px 11px;border-radius:999px;font-family:var(--font-h)}
.ht-pkg-seats{position:absolute;top:12px;right:12px;background:rgba(10,1,26,.78);backdrop-filter:blur(8px);color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:999px;font-family:var(--font-h)}
.ht-pkg-body{padding:20px;flex:1;display:flex;flex-direction:column;gap:10px}
.ht-pkg-name{font-family:var(--font-h);font-size:16px;font-weight:700;color:var(--n9);line-height:1.3}
.ht-pkg-country{font-size:11px;color:var(--p6);font-weight:700;text-transform:uppercase;letter-spacing:.05em}
.ht-pkg-metas{display:flex;flex-wrap:wrap;gap:6px}
.ht-pkg-meta{font-size:10px;padding:3px 9px;border-radius:999px;background:var(--n05);color:var(--n6);font-weight:500}
.ht-pkg-highlights{font-size:12px;color:var(--n6);line-height:1.65}
.ht-pkg-price-row{display:flex;align-items:baseline;gap:8px;padding:12px 0 0;border-top:1px solid var(--n1);margin-top:auto}
.ht-pkg-label{font-size:11px;color:var(--n4)}
.ht-pkg-price{font-family:var(--font-h);font-size:20px;font-weight:700;color:var(--p6)}
.ht-pkg-unit{font-size:11px;color:var(--n4)}
.ht-pkg-ctas{display:flex;gap:8px;margin-top:12px}
.ht-pkg-btn-wa{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;background:var(--r6);color:#fff;font-size:12px;font-weight:700;padding:11px;border-radius:10px;transition:background .2s;font-family:var(--font-h);text-decoration:none;border:none;cursor:pointer}
.ht-pkg-btn-wa:hover{background:var(--r5)}
.ht-pkg-btn-det{display:flex;align-items:center;justify-content:center;border:1.5px solid var(--n1);color:var(--n6);font-size:12px;font-weight:600;padding:11px 14px;border-radius:10px;transition:border-color .2s,color .2s;font-family:var(--font-h);background:none;cursor:pointer}
.ht-pkg-btn-det:hover{border-color:var(--p6);color:var(--p6)}
.exp-tabs{display:flex;gap:4px;background:var(--n05);border:1px solid var(--n1);border-radius:14px;padding:5px;margin-bottom:32px;overflow-x:auto;scrollbar-width:none}
.exp-tab{flex-shrink:0;padding:9px 18px;border-radius:10px;font-size:12px;font-weight:600;color:var(--n6);transition:all .22s;cursor:pointer;border:none;background:none;font-family:var(--font-h);white-space:nowrap}
.exp-tab.active{background:#fff;color:var(--p6);box-shadow:0 2px 12px rgba(44,13,92,.1)}
.gallery-grid{columns:3;column-gap:14px}
.gallery-item{break-inside:avoid;margin-bottom:14px;border-radius:14px;overflow:hidden;position:relative;cursor:pointer;display:block}
.gallery-item img{width:100%;display:block;transition:transform .4s var(--ease)}
.gallery-item:hover img{transform:scale(1.04)}
.gallery-overlay{position:absolute;inset:0;background:rgba(26,5,51,0);transition:background .3s;display:flex;align-items:center;justify-content:center}
.gallery-item:hover .gallery-overlay{background:rgba(26,5,51,.35)}
.gallery-overlay-icon{font-size:26px;color:#fff;opacity:0;transform:scale(0);transition:all .28s var(--ease)}
.gallery-item:hover .gallery-overlay-icon{opacity:1;transform:scale(1)}
.timeline{position:relative;padding-left:36px;max-width:700px;margin-inline:auto}
.timeline::before{content:'';position:absolute;left:0;top:8px;bottom:8px;width:2px;background:linear-gradient(to bottom,var(--p1),var(--p6),var(--p1))}
.tl-item{position:relative;padding:0 0 44px 32px}
.tl-dot{position:absolute;left:-52px;top:4px;width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--p6),var(--p7));border:3px solid #fff;box-shadow:0 2px 14px rgba(124,58,190,.28);display:flex;align-items:center;justify-content:center;font-size:11px;color:#fff;font-weight:700}
.tl-num{font-size:11px;font-weight:700;color:var(--p6);letter-spacing:.08em;text-transform:uppercase;margin-bottom:5px}
.tl-title{font-family:var(--font-h);font-size:18px;font-weight:700;color:var(--n9);margin-bottom:7px}
.tl-desc{font-size:13px;color:var(--n6);line-height:1.7}
.tl-badge{display:inline-flex;align-items:center;gap:5px;background:var(--ok-bg);color:var(--ok);font-size:11px;font-weight:700;padding:4px 11px;border-radius:999px;margin-top:9px;font-family:var(--font-h)}
.video-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.vid-card{border-radius:16px;overflow:hidden;position:relative;cursor:pointer;aspect-ratio:16/10;background:linear-gradient(135deg,var(--p1),var(--g1))}
.vid-card img{width:100%;height:100%;object-fit:cover;transition:transform .4s var(--ease)}
.vid-card:hover img{transform:scale(1.05)}
.vid-overlay{position:absolute;inset:0;background:rgba(10,1,26,.4);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px}
.vid-play{width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,.92);display:flex;align-items:center;justify-content:center;font-size:18px;transition:transform .22s;padding-left:3px}
.vid-card:hover .vid-play{transform:scale(1.12)}
.vid-label{font-size:12px;font-weight:700;color:#fff;font-family:var(--font-h);text-shadow:0 1px 6px rgba(0,0,0,.5)}
.rel-card{background:#fff;border:1px solid var(--n1);border-radius:20px;padding:26px;display:flex;flex-direction:column;gap:11px;transition:all .25s;cursor:pointer;text-decoration:none}
.rel-card:hover{border-color:rgba(124,58,190,.25);box-shadow:0 8px 36px rgba(44,13,92,.1);transform:translateY(-4px)}
.rel-icon{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:22px;background:linear-gradient(135deg,var(--p1),rgba(212,160,23,.1));transition:transform .25s}
.rel-card:hover .rel-icon{transform:scale(1.1) rotate(-4deg)}
.rel-name{font-family:var(--font-h);font-size:16px;font-weight:700;color:var(--n9)}
.rel-desc{font-size:12px;color:var(--n6);line-height:1.65}
.rel-arr{font-size:12px;color:var(--p6);font-weight:700;margin-top:auto}
.cta-banner{background:linear-gradient(135deg,var(--p8),var(--p7));padding:clamp(56px,7vw,96px) 0;position:relative;overflow:hidden;text-align:center}
.cta-banner::before{content:'';position:absolute;inset:0;opacity:.05;background-image:repeating-linear-gradient(45deg,transparent,transparent 24px,rgba(212,160,23,1) 24px,rgba(212,160,23,1) 25px)}
.cta-glow{position:absolute;right:-5%;top:50%;transform:translateY(-50%);width:min(400px,45vw);height:min(400px,45vw);background:radial-gradient(ellipse,rgba(196,35,92,.2) 0%,transparent 68%);pointer-events:none}
.cta-inner{position:relative;z-index:2;text-align:center;max-width:640px;margin-inline:auto}
.cta-inner .section-title{color:#fff}
.cta-inner .section-sub{color:rgba(255,255,255,.65);margin-inline:auto}
.cta-inner .section-label{color:var(--g6)}

/* Gambar Spesifik Home Keunggulan */
.home-feat-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 24px;
  box-shadow: 0 24px 48px rgba(44,13,92,.15);
}

@media(max-width:1024px){
  .dest-grid-10{grid-template-columns:repeat(3,1fr)!important}
  .pkg-grid-3{grid-template-columns:repeat(2,1fr)!important}
  .gallery-grid{columns:2}
  .video-grid{grid-template-columns:1fr 1fr}
  .rel-services-grid{grid-template-columns:repeat(2,1fr)!important}
  .why-grid-10{grid-template-columns:repeat(3,1fr)!important}
  .exp-grid-3{grid-template-columns:repeat(2,1fr)!important}
  .home-feat-grid {grid-template-columns: 1fr!important;}
}
@media(max-width:768px){
  .dest-grid-10{grid-template-columns:1fr!important}
  .pkg-grid-3{grid-template-columns:1fr!important}
  .gallery-grid{columns:1}
  .video-grid{grid-template-columns:1fr}
  .rel-services-grid{grid-template-columns:1fr 1fr!important}
  .why-grid-10{grid-template-columns:repeat(2,1fr)!important}
  .exp-grid-3{grid-template-columns:1fr!important}
}
`;

const WA = (msg = "Assalamu%27alaikum%20SS%20Umroh%2C%20saya%20ingin%20konsultasi%20paket%20umroh.") =>
  `https://wa.me/${SITE_SETTINGS.wa}?text=${msg}`;

const LOGO = "https://ssumroh.id/wp-content/uploads/2023/01/Logo-Putih.png";

// ─── NEW IMAGE ASSETS DARI UNSPLASH ──────────────────────────────────────────
const HERO_BG = "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1920&q=85"; // Ka'bah (Home)
const HERO_PAKET_BG = "https://images.unsplash.com/photo-1565552643952-2591e13b8694?auto=format&fit=crop&w=1920&q=85"; // Jamaah di Madinah
const HERO_KORPORAT_BG = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=85"; // Group/Business
const HERO_TENTANG_BG = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1920&q=85"; // Perjalanan/Jalan
const HERO_DESTINASI_BG = "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1920&q=85"; // Arsitektur Masjid Indah
const HERO_KONTAK_BG = "https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&w=1920&q=85"; // Customer Service ramah

const NABAWI_IMG = "https://images.unsplash.com/photo-1523151164408-6540213bd2c8?auto=format&fit=crop&w=800&q=80";
const USTADZ_IMG = "https://images.unsplash.com/photo-1655438806456-a20a9ac6ba25?auto=format&fit=crop&w=800&q=80";

// Ilustrasi Halaman Khusus
const HOME_FEAT_IMG = "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=800&q=80"; // Zamzam / Kenyamanan
const TENTANG_CERITA_IMG = "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80"; // Office / Tim
const KORPORAT_LAYANAN_IMG = "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80"; // Group Meeting / CSR

// Gambar Destinasi Khusus (Melengkapi yang null)
const IMG_RAUDHAH = "https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?auto=format&fit=crop&w=600&q=80";
const IMG_BAQI = "https://images.unsplash.com/photo-1604580864964-0462f5d5b1a8?auto=format&fit=crop&w=600&q=80";
const IMG_QUBA = "https://images.unsplash.com/photo-1590847923419-f53702df9344?auto=format&fit=crop&w=600&q=80";
const IMG_QIBLATAIN = "https://images.unsplash.com/photo-1564121211835-e88c852648ab?auto=format&fit=crop&w=600&q=80";
const IMG_UHUD = "https://images.unsplash.com/photo-1627883908272-9b0d6635bbbb?auto=format&fit=crop&w=600&q=80";
const IMG_HARAM = "https://images.unsplash.com/photo-1565552643952-2591e13b8694?auto=format&fit=crop&w=600&q=80";
const IMG_KAABAH = "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=600&q=80";
const IMG_ZAMZAM = "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=600&q=80";
const IMG_SAI = "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80";
const IMG_ARAFAH = "https://images.unsplash.com/photo-1629853965576-80db6b93fbdf?auto=format&fit=crop&w=600&q=80";
const IMG_NUR = "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=600&q=80";
const IMG_ZIARAH = "https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?auto=format&fit=crop&w=600&q=80";


/** CMS */ const SITE_SETTINGS = {
  phone: "0813-1201-7883",
  wa: "6281312017883",
  address: "Jl. Cihapit No. 41, Kota Bandung",
  cs_name: "Bayu Muharram",
  ppiu: "SK PPIU No. U.108 Tahun 2021",
};

/** CMS */ const TESTIMONIALS = [
  { id:1, initials:"GF", name:"Ghifar Fajri Sofwan", city:"Bandung", pkg:"Paket Bintang 4", stars:5, quote:"Penerbangan tanpa transit, hotel bintang 4. Alhamdulillah saya dan istri nyaman sekali, baik dalam perjalanan maupun di Mekkah sana." },
  { id:2, initials:"KS", name:"Kusnadi", city:"", pkg:"Paket Umroh", stars:5, quote:"Barakallah. Terima kasih banyak untuk tim SS Travel yang memberikan pelayanan secara profesional, ramah, baik, humoris, dan friendly." },
  { id:3, initials:"NK", name:"[Data Diperbarui Segera]", city:"", pkg:"SS Umroh", stars:5, quote:"Koordinasi untuk rombongan kami sangat baik. CS merespons cepat, semua pertanyaan dijawab dengan sabar. Tidak ada satu pun anggota yang bermasalah." },
];

/** CMS */ const PACKAGES = [
  { id:1, slug:"hemat", category:"hemat", tag:"Terjangkau", name:"Umroh Hemat", desc:"Direct flight, hotel bintang 3+ dengan jarak berjalan kaki ke masjid.", hotel_dist:500, flight:"Direct ✈", price_display:"contact" },
  { id:2, slug:"bintang4", category:"bintang4", tag:"Paling Populer", name:"Umroh Bintang 4", desc:"Hotel 350m dari Masjid Nabawi dan Masjidil Haram. Penerbangan direct tanpa transit.", hotel_dist:350, flight:"Direct ✈", price_display:"contact", featured:true },
  { id:3, slug:"tabungan", category:"tabungan", tag:"Cicilan Syariah", name:"Tabungan Umroh", desc:"Daftarkan diri sekarang, cicil via BNI. Keberangkatan terjadwal fleksibel.", hotel_dist:350, flight:"Direct ✈", price_display:"contact" },
  { id:4, slug:"ramadhan", category:"ramadhan", tag:"Bulan Mulia", name:"Umroh Ramadhan", desc:"Beribadah di bulan Ramadhan di Tanah Suci bersama SS Umroh.", hotel_dist:350, flight:"Direct ✈", price_display:"contact" },
  { id:5, slug:"group", category:"group", tag:"Min. 10 Orang", name:"Umroh Group", desc:"Program umroh group untuk perusahaan, komunitas, dan organisasi.", hotel_dist:350, flight:"Direct ✈", price_display:"contact" },
];

/** CMS */ const FAQ_GENERAL = [
  { id:1, q:"Apakah SS Umroh sudah berizin resmi dari Kemenag?", a:"Ya. SS Umroh (PT. Sarana Sadaya) terdaftar resmi sebagai PPIU di Kemenag RI dengan nomor SK PPIU No. U.108 Tahun 2021. Izin ini dapat diverifikasi di portal resmi Kemenag RI." },
  { id:2, q:"Apakah ada penerbangan direct tanpa transit?", a:"Ya. SS Umroh mengutamakan penerbangan direct Jakarta–Madinah (PP) tanpa transit untuk menghemat waktu dan tenaga jamaah. Tersedia via Saudi Airlines dan Garuda Indonesia." },
  { id:3, q:"Berapa jarak hotel dari masjid?", a:"SS Umroh memilih hotel maksimal 350m dari masjid. Di Madinah: Nozol Munawaroh (350m dari Masjid Nabawi). Di Mekkah: Le Meridien Ajyad (350m dari Masjidil Haram). Jamaah bisa jalan kaki kapan saja." },
  { id:4, q:"Apakah harga paket sudah termasuk tiket pesawat?", a:"Ya. Semua paket SS Umroh sudah termasuk tiket pesawat PP, hotel, makan 3x sehari, manasik, perlengkapan, visa, dan bimbingan ustadz. Hubungi CS untuk harga terkini." },
  { id:5, q:"Berapa maksimal jamaah per rombongan?", a:"SS Umroh membatasi maksimal 45 jamaah per rombongan agar setiap jamaah mendapat perhatian penuh dari koordinator dan ustadz pembimbing." },
  { id:6, q:"Apakah ada manasik sebelum berangkat?", a:"Ya. SS Umroh mengadakan manasik intensif 1 minggu sebelum keberangkatan di hotel berbintang di Bandung. Manasik dipimpin ustadz berpengalaman." },
  { id:7, q:"Bagaimana cara mendaftar paket umroh SS Umroh?", a:"Hubungi CS kami Bayu Muharram via WhatsApp 0813-1201-7883. Konsultasi gratis, tanpa tekanan. Kami bantu pilihkan paket yang paling sesuai dengan kebutuhan dan budget Anda." },
];

/** CMS */ const HALAL_DESTINATIONS = [
  { id:1, flag:"🇹🇷", name:"Turki", badge:"🔥 Terpopuler", desc:"Istanbul, Cappadocia, Efesus, Pamukkale. Peradaban Islam terbesar — masjid agung, bazaar bersejarah, keindahan alam.", dur:"10D7N", season:"Mar–Mei, Sep–Nov", price:"Rp 15,5 Jt", img:"https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=600&q=80" },
  { id:2, flag:"🇯🇵", name:"Jepang", badge:"⭐ Premium", desc:"Tokyo, Kyoto, Osaka, Fuji. Harmoni budaya modern dan tradisi. Kuliner halal semakin mudah ditemukan.", dur:"9D6N", season:"Mar–Apr, Okt–Nov", price:"Rp 22 Jt", img:"https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=600&q=80" },
  { id:3, flag:"🇰🇷", name:"Korea Selatan", badge:"✨ Trending", desc:"Seoul, Jeju, Busan. Budaya K-pop, istana bersejarah, street food halal. Favorit keluarga muda Muslim.", dur:"7D5N", season:"Sep–Nov, Mar–Mei", price:"Rp 17 Jt", img:"https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=600&q=80" },
  { id:4, flag:"🇺🇿", name:"Uzbekistan", badge:"🕌 Islamic Heritage", desc:"Samarkand, Bukhara, Tashkent. Warisan peradaban Islam jalur sutra — madrasah dan situs bersejarah.", dur:"8D6N", season:"Apr–Jun, Sep–Okt", price:"Rp 14 Jt", img:"https://images.unsplash.com/photo-1596401057633-54a8c8e30b0b?auto=format&fit=crop&w=600&q=80" },
  { id:5, flag:"🇦🇪", name:"Dubai", badge:"💎 Luxury", desc:"Dubai, Abu Dhabi, Sharjah. Kota paling ramah Muslim di dunia. Masjid megah, mall mewah, desert safari.", dur:"6D4N", season:"Nov–Mar", price:"Rp 13 Jt", img:"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80" },
  { id:6, flag:"🇪🇬", name:"Mesir", badge:"🏛 Peradaban", desc:"Kairo, Luxor, Alexandria. Piramida Giza, Masjid Al-Azhar. Peradaban kuno dan warisan Islam berpadu.", dur:"9D7N", season:"Okt–Apr", price:"Rp 16 Jt", img:"https://images.unsplash.com/photo-1539768942893-daf53e448371?auto=format&fit=crop&w=600&q=80" },
  { id:7, flag:"🇲🇦", name:"Maroko", badge:"✨ Eksotis", desc:"Marrakech, Fes, Casablanca, Sahara. Medina bersejarah, riad mewah, dan lanskap yang memukau.", dur:"10D8N", season:"Mar–Mei, Sep–Nov", price:"Rp 19 Jt", img:"https://images.unsplash.com/photo-1489493887464-892be6d1daae?auto=format&fit=crop&w=600&q=80" },
  { id:8, flag:"🇪🇺", name:"Eropa Muslim Friendly", badge:"🌍 Multi-Country", desc:"Paris, Amsterdam, Barcelona. Itinerary khusus Muslim dengan daftar restoran halal dan masjid terdekat.", dur:"12D10N", season:"Jun–Sep", price:"Rp 28 Jt", img:"https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80" },
  { id:9, flag:"🇲🇾", name:"Malaysia", badge:"✅ Ramah Keluarga", desc:"Kuala Lumpur, Penang, Langkawi. Halal food terlengkap di Asia — nyaman untuk keluarga Muslim.", dur:"5D3N", season:"Sepanjang Tahun", price:"Rp 6,5 Jt", img:"https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=600&q=80" },
  { id:10, flag:"🇧🇳", name:"Brunei Darussalam", badge:"🕌 Islamic Kingdom", desc:"Bandar Seri Begawan. Kerajaan Islam terkaya di Asia Tenggara. Masjid megah dan water village.", dur:"4D3N", season:"Feb–Apr", price:"Rp 8 Jt", img:"https://images.unsplash.com/photo-1569951715165-1e4c28b22c2d?auto=format&fit=crop&w=600&q=80" },
];

/** CMS */ const HALAL_PACKAGES = [
  { id:1, featured:true, tag:"🔥 Bestseller", seats:8, country:"🇹🇷 Turki", name:"Halal Tour Turki — Istanbul, Cappadocia & Efesus", metas:["10D7N","Direct Flight","Hotel Bintang 4","Makan 3x","Sep 2025"], highlights:"Blue Mosque · Hagia Sophia · Topkapi Palace · Bosphorus Cruise · Cappadocia · Grand Bazaar", price:"Rp 15,5 Jt", img:"https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=700&q=80" },
  { id:2, tag:"💎 Luxury", seats:12, country:"🇦🇪 Dubai / UAE", name:"Halal Tour Dubai — Luxury & Culture Experience", metas:["6D4N","Direct Flight","Hotel Bintang 5","Makan 3x","Nov 2025"], highlights:"Burj Khalifa · Dubai Mall · Sheikh Zayed Mosque · Desert Safari · Dhow Cruise · Gold Souk", price:"Rp 13 Jt", img:"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=700&q=80" },
  { id:3, tag:"🕌 Islamic Heritage", seats:20, country:"🇺🇿 Uzbekistan", name:"Halal Tour Uzbekistan — Jalur Sutra Islam", metas:["8D6N","via Tashkent","Hotel Bintang 4","Makan 3x","Okt 2025"], highlights:"Registan Samarkand · Kalon Minaret Bukhara · Makam Imam Bukhari · Chorsu Bazaar", price:"Rp 14 Jt", img:"https://images.unsplash.com/photo-1596401057633-54a8c8e30b0b?auto=format&fit=crop&w=700&q=80" },
  { id:4, tag:"⭐ Premium", seats:6, country:"🇯🇵 Jepang", name:"Halal Tour Jepang — Tokyo, Kyoto, Osaka & Fuji", metas:["9D6N","Garuda Direct","Hotel Bintang 4","Makan Halal","Mar 2026"], highlights:"Shibuya · Senso-ji · Fuji-san · Fushimi Inari · Dotonbori · Nara · Bullet Train", price:"Rp 22 Jt", img:"https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=700&q=80" },
  { id:5, tag:"✨ Eksotis", seats:15, country:"🇲🇦 Maroko", name:"Halal Tour Maroko — Marrakech, Fes & Sahara", metas:["10D8N","via Casablanca","Riad Bintang 4","Makan 3x","Apr 2026"], highlights:"Masjid Hassan II · Medina Marrakech · Fes Medina · Todra Gorge · Sahara Desert Camp", price:"Rp 19 Jt", img:"https://images.unsplash.com/photo-1489493887464-892be6d1daae?auto=format&fit=crop&w=700&q=80" },
  { id:6, tag:"🌍 Best Value", seats:18, country:"🇪🇺 Eropa Muslim Friendly", name:"Halal Tour Eropa — Paris, Amsterdam & Barcelona", metas:["12D10N","via Emirates","Hotel Bintang 4","Halal Guide","Jun 2026"], highlights:"Eiffel Tower · Louvre · Rijksmuseum · Keukenhof · Sagrada Familia · 50+ Halal Restaurants", price:"Rp 28 Jt", img:"https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=700&q=80" },
];

/** CMS */ const HALAL_TESTIMONIALS = [
  { id:4, initials:"RH", name:"Rizky Hidayat & Keluarga", city:"Jakarta", pkg:"Halal Tour Turki 2024", stars:5, quote:"Halal tour Turki bersama SS Umroh benar-benar di luar ekspektasi kami. Tour leader sangat memperhatikan waktu sholat, semua makanan halal 100%, dan hotelnya nyaman banget." },
  { id:5, initials:"DW", name:"Dewi Wulandari", city:"HR Manager, PT. XYZ", pkg:"Halal Tour Dubai 2024", stars:5, quote:"Rombongan kantor kami 30 orang ke Dubai. SS Umroh mengurus segalanya — visa, hotel, transport, sampai restoran halal bersertifikat. Tidak ada satu pun yang mengeluh." },
  { id:6, initials:"MF", name:"Muhammad Fauzi", city:"Bandung", pkg:"Halal Tour Uzbekistan 2024", stars:5, quote:"Ziarah ke makam Imam Bukhari — pengalaman spiritual yang tidak bisa dibeli. SS Umroh paham betul kebutuhan wisatawan Muslim." },
  { id:7, initials:"SN", name:"Siti Nurhaliza", city:"Surabaya", pkg:"Halal Tour Jepang 2025", stars:5, quote:"Jepang dengan itinerary halal friendly dari SS Umroh. Semua restoran sudah dicek, masjid terdekat sudah dipetakan. Anak-anak dan orang tua kami sangat menikmati." },
  { id:8, initials:"AP", name:"Ahmad & Putri", city:"Bekasi", pkg:"Halal Honeymoon Maroko 2025", stars:5, quote:"Honeymoon ke Maroko — pilihan paling tepat! Riad bintang 4 di Marrakech yang romantis, semua makan halal, itinerary couple-friendly. Kenangan terbaik dalam hidup kami." },
  { id:9, initials:"YR", name:"Yusuf Ramadhan", city:"Bandung", pkg:"Halal Tour Eropa 2025", stars:5, quote:"Masjid Agung Cordoba, Alhambra Granada, semua dalam satu paket Eropa Muslim Friendly SS Umroh. Ini bukan tour biasa — ini perjalanan menelusuri kejayaan Islam di Eropa." },
];

/** CMS */ const FAQ_HALAL = [
  { id:1, q:"Apakah makanan dijamin halal di semua destinasi?", a:"Ya. SS Umroh sudah memetakan dan menyeleksi restoran halal bersertifikasi di setiap destinasi. Panduan kuliner halal diberikan sebelum keberangkatan, dan tour leader memastikan semua makanan selama perjalanan grup adalah halal." },
  { id:2, q:"Bagaimana waktu sholat selama perjalanan?", a:"Itinerary SS Umroh dirancang untuk menghormati waktu sholat 5 waktu. Tour leader memiliki jadwal sholat lokal dan memastikan ada waktu, tempat, dan musholla atau masjid terdekat di setiap destinasi." },
  { id:3, q:"Apakah itinerary ramah keluarga dengan anak-anak?", a:"Ya. SS Umroh memiliki paket family-friendly dengan tempo perjalanan yang lebih santai, aktivitas yang cocok untuk semua usia, dan hotel yang memiliki fasilitas keluarga." },
  { id:4, q:"Apakah tersedia paket private tour?", a:"Ya. SS Umroh menyediakan paket private tour untuk pasangan (honeymoon), keluarga, dan kelompok kecil. Private tour memiliki fleksibilitas penuh dalam memilih destinasi, hotel, dan jadwal." },
  { id:5, q:"Apakah bisa custom itinerary sesuai keinginan?", a:"Ya. Kami dengan senang hati menyesuaikan itinerary sesuai preferensi Anda — menambah hari di kota tertentu, menghilangkan destinasi yang tidak diminati, atau menambahkan aktivitas khusus." },
  { id:6, q:"Apakah tersedia cicilan atau pembayaran bertahap?", a:"Ya. SS Umroh bekerja sama dengan mitra pembiayaan syariah. Bayar DP untuk mengamankan kursi, lunasi sebelum keberangkatan. Hubungi CS untuk detail skema cicilan." },
  { id:7, q:"Bagaimana proses pendaftaran Halal Tour?", a:"Sangat mudah: (1) Konsultasi via WhatsApp, (2) Terima proposal dan itinerary, (3) Bayar DP untuk amankan kursi, (4) Kami urus visa, tiket, hotel, (5) Berangkat bersama tour leader kami." },
];

function useScrollAnim() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: "0px 0px -44px 0px" }
    );
    document.querySelectorAll("[data-anim]").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });
}

function AccItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`acc-item${open ? " open" : ""}`}>
      <button className="acc-btn" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="acc-q">{q}</span>
        <span className="acc-ico">+</span>
      </button>
      {open && <div className="acc-body">{a}</div>}
    </div>
  );
}

function TestimonialsSection({ items = TESTIMONIALS }) {
  return (
    <section className="testi-section" aria-label="Testimoni jamaah">
      <div className="container">
        <div className="section-header center" data-anim="slide-up">
          <span className="section-label" style={{color:"var(--g6)"}}>Kata Jamaah</span>
          <h2 className="section-title" style={{color:"#fff"}}>Yang Dikatakan Jamaah SS Umroh</h2>
          <p className="section-sub" style={{color:"rgba(255,255,255,.55)"}}>Kepercayaan jamaah adalah bukti nyata komitmen kami — bukan klaim, tapi pengalaman nyata.</p>
        </div>
        <div className="t-grid">
          {items.map((t, i) => (
            <article className="t-card" key={t.id} data-anim="scale" data-delay={String((i+1)*100)}>
              <div className="t-stars">{"★".repeat(t.stars)}</div>
              <blockquote className="t-quote">"{t.quote}"</blockquote>
              <div className="t-author">
                <div className="t-av">{t.initials}</div>
                <div><div className="t-name">{t.name}</div><div className="t-meta">{[t.city, t.pkg].filter(Boolean).join(" · ")}</div></div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection({ items = FAQ_GENERAL, label = "FAQ", title = "Pertanyaan yang Sering Diajukan", sub = "Semua yang perlu Anda ketahui sebelum mendaftar.", ctaText = "Masih ada pertanyaan?", ctaSub = "Hubungi CS kami Bayu Muharram via WhatsApp — konsultasi gratis, tanpa tekanan." }) {
  return (
    <section className="faq-section" aria-label="FAQ">
      <div className="container">
        <div className="faq-inner">
          <div className="faq-side">
            <div data-anim="slide-right">
              <span className="section-label">{label}</span>
              <h2 className="section-title">{title}</h2>
              <p className="section-sub">{sub}</p>
            </div>
            <div className="faq-cta-box" data-anim="slide-right" data-delay="200">
              <h3>{ctaText}</h3>
              <p>{ctaSub}</p>
              <a href={WA()} className="btn-faq">💬 Chat WhatsApp Sekarang</a>
            </div>
          </div>
          <div data-anim="slide-left">
            {items.map(f => <AccItem key={f.id} q={f.q} a={f.a} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTABanner({ label = "Mulai Sekarang", title = "Siap Memulai Perjalanan Ibadah Anda?", sub = "Lebih dari 1.000 jamaah mempercayai SS Umroh setiap tahun. 0 gagal berangkat sejak 2012.", primaryText = "💬 Konsultasi Gratis via WhatsApp", primaryMsg, secondaryText = "Lihat Semua Paket →", onSecondary }) {
  return (
    <section className="cta-banner" aria-label="Call to action">
      <div className="container" style={{maxWidth:640,marginInline:"auto",textAlign:"center",position:"relative",zIndex:2}}>
        <div data-anim="slide-up">
          <span className="section-label">{label}</span>
          <h2 className="section-title">{title}</h2>
          <p className="section-sub">{sub}</p>
        </div>
        <div className="cta-btns" data-anim="slide-up" data-delay="200">
          <a href={WA(primaryMsg)} className="btn-primary">{primaryText}</a>
          {onSecondary && <button className="btn-outline" onClick={onSecondary}>{secondaryText}</button>}
        </div>
        <div style={{marginTop:28,display:"flex",flexWrap:"wrap",gap:10,justifyContent:"center"}} data-anim="fade" data-delay="300">
          <span className="badge-hero ok">✓ SK PPIU No.U.108/2021</span>
          <span className="badge-hero">✈ Direct Flight</span>
          <span className="badge-hero">🛡 0 Gagal Berangkat</span>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  return (
    <div className="trust">
      <div className="container">
        <div className="trust-in">
          <img src={LOGO} alt="Logo SS Umroh" className="trust-logo" loading="lazy" />
          <div className="trust-badge">✓ Berizin Resmi Kementerian Agama RI — {SITE_SETTINGS.ppiu}</div>
          <p className="trust-det">
            <strong>PT. Sarana Sadaya</strong> · Beroperasi sejak <strong>2012</strong> · Rebranding SS Umroh <strong>2023</strong><br/>
            {SITE_SETTINGS.address}, Jawa Barat · <strong>{SITE_SETTINGS.phone}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

function Footer({ setPage }) {
  const nav = (page) => { setPage(page); window.scrollTo(0,0); };
  return (
    <footer aria-label="Footer SS Umroh">
      <div className="container">
        <div className="footer-g">
          <div>
            <div className="f-logo"><img src={LOGO} alt="SS Umroh" /></div>
            <p className="f-desc">Biro perjalanan umroh dan wisata halal terpercaya dari Bandung. Berizin Kemenag SK PPIU No.U.108/2021. Melayani sejak 2012.</p>
            <div className="f-ci">📍 <span>{SITE_SETTINGS.address}, Kota Bandung</span></div>
            <div className="f-ci">📞 <a href={`tel:+${SITE_SETTINGS.wa}`} style={{color:"inherit"}}>{SITE_SETTINGS.phone}</a></div>
            <div className="f-ci">💬 <a href={WA()} style={{color:"inherit"}}>WhatsApp: {SITE_SETTINGS.cs_name}</a></div>
            <div style={{marginTop:16}}>
              <span className="f-soc">📘</span><span className="f-soc">📸</span><span className="f-soc">▶️</span><span className="f-soc">🎵</span>
            </div>
          </div>
          <div>
            <div className="f-col-t">Layanan</div>
            {[["Umroh Hemat","paket"],["Umroh Bintang 4","paket"],["Tabungan Umroh","paket"],["Halal Tour","halaltour"],["Umroh Korporat","korporat"]].map(([l,p])=>(
              <button key={l} className="f-link" onClick={()=>nav(p)}>{l}</button>
            ))}
          </div>
          <div>
            <div className="f-col-t">Perusahaan</div>
            {[["Tentang SS Umroh","tentang"],["Destinasi Umroh","destinasi"],["Hubungi Kami","kontak"]].map(([l,p])=>(
              <button key={l} className="f-link" onClick={()=>nav(p)}>{l}</button>
            ))}
          </div>
          <div>
            <div className="f-col-t">Kontak</div>
            <a href={WA()} className="f-link">💬 WhatsApp: {SITE_SETTINGS.phone}</a>
            <a href={`tel:+${SITE_SETTINGS.wa}`} className="f-link">📞 {SITE_SETTINGS.phone}</a>
            <div className="f-link">📍 {SITE_SETTINGS.address}</div>
          </div>
        </div>
        <div className="f-bottom">
          <p className="f-copy">© 2025 PT. Sarana Sadaya — SS Umroh. Semua hak dilindungi.<br/>{SITE_SETTINGS.ppiu}</p>
          <div>
            <button className="f-legal-link">Kebijakan Privasi</button>
            <button className="f-legal-link">Syarat &amp; Ketentuan</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Nav({ currentPage, setPage }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = (page) => { setPage(page); setMobileOpen(false); window.scrollTo(0,0); };

  const PAGES = [
    { id:"paket", label:"Umroh", mega:[
      { icon:"✈️", label:"Umroh Hemat", desc:"Direct flight, hotel bintang 3+" },
      { icon:"⭐", label:"Umroh Bintang 4", desc:"350m dari Masjidil Haram" },
      { icon:"🏦", label:"Tabungan Umroh", desc:"Cicil via BNI" },
      { icon:"💳", label:"Pembiayaan Syariah", desc:"Mitra pembiayaan halal" },
    ]},
    { id:"halaltour", label:"Halal Tour", mega:[
      { icon:"🇹🇷", label:"Turki", desc:"10D7N · Bintang 4 · Mulai 15,5jt" },
      { icon:"🇦🇪", label:"Dubai", desc:"6D4N · Bintang 5 · Mulai 13jt" },
      { icon:"🇯🇵", label:"Jepang", desc:"9D6N · Bintang 4 · Mulai 22jt" },
      { icon:"🇺🇿", label:"Uzbekistan", desc:"8D6N · Islamic Heritage" },
      { icon:"🇲🇦", label:"Maroko", desc:"10D8N · Eksotis · Mulai 19jt" },
      { icon:"🌍", label:"Eropa Muslim Friendly", desc:"12D10N · Multi-country" },
    ]},
    { id:"destinasi", label:"Destinasi" },
    { id:"korporat", label:"Korporat" },
    { id:"tentang", label:"Tentang Kami" },
    { id:"kontak", label:"Kontak" },
  ];

  return (
    <>
      <nav className={`nav${scrolled ? " scrolled" : ""}`} style={{background: scrolled ? undefined : "transparent"}}>
        <div className="container">
          <div className="nav-inner">
            <button className="nav-logo" onClick={() => nav("home")} style={{background:"none",border:"none",cursor:"pointer"}}>
              <img src={LOGO} alt="SS Umroh" height="38" onError={e=>e.target.style.display="none"} />
            </button>
            <ul className="nav-links" style={{listStyle:"none"}}>
              {PAGES.map(p => (
                <li key={p.id} className={`nav-item${p.mega ? "" : ""}`}>
                  <button className={`nav-link${currentPage===p.id?" active":""}`} onClick={() => nav(p.id)}>
                    {p.label}{p.mega && <span className="chevron">▾</span>}
                  </button>
                  {p.mega && (
                    <div className="mega">
                      {p.mega.map(m => (
                        <div key={m.label} className="mega-item" onClick={() => nav(p.id)}>
                          <div className="mega-icon">{m.icon}</div>
                          <div><div className="mega-label">{m.label}</div><div className="mega-desc">{m.desc}</div></div>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <button className="nav-cta" onClick={() => window.open(WA(), "_blank")}>Konsultasi Gratis</button>
            <button className={`hamburger${mobileOpen?" open":""}`} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              <span/><span/><span/>
            </button>
          </div>
        </div>
      </nav>
      <div className={`mobile-nav${mobileOpen?" open":""}`}>
        {PAGES.map(p => (
          <button key={p.id} onClick={() => nav(p.id)}
            style={currentPage===p.id?{color:"var(--g6)"}:{}}>{p.label}</button>
        ))}
        <div className="mob-ctas" style={{marginTop:28,display:"flex",flexDirection:"column",gap:12}}>
          <button className="btn-primary" style={{justifyContent:"center"}} onClick={() => {window.open(WA(),"_blank");setMobileOpen(false);}}>💬 Konsultasi via WhatsApp</button>
          <a href={`tel:+${SITE_SETTINGS.wa}`} className="btn-outline" style={{justifyContent:"center"}} onClick={() => setMobileOpen(false)}>📞 {SITE_SETTINGS.phone}</a>
        </div>
      </div>
    </>
  );
}

function HomePage({ setPage }) {
  useScrollAnim();
  return (
    <>
      {/* HERO */}
      <section style={{minHeight:"100vh",display:"flex",alignItems:"center",position:"relative",overflow:"hidden",paddingTop:"var(--nav-h)"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:`url(${HERO_BG})`,backgroundSize:"cover",backgroundPosition:"center 30%"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(155deg,rgba(10,1,26,.96) 0%,rgba(26,5,51,.90) 35%,rgba(45,10,92,.84) 60%,rgba(10,1,26,.93) 100%)"}}/>
        <div className="ph-pattern"/>
        <div style={{position:"absolute",top:"-8%",right:"-4%",width:"min(560px,62vw)",height:"min(560px,62vw)",background:"radial-gradient(ellipse,rgba(124,58,190,.30) 0%,transparent 68%)"}}/>
        <div style={{position:"absolute",bottom:"-10%",left:"-5%",width:"min(440px,48vw)",height:"min(440px,48vw)",background:"radial-gradient(ellipse,rgba(196,35,92,.15) 0%,transparent 68%)"}}/>
        <div className="container" style={{position:"relative",zIndex:2,paddingBlock:"clamp(60px,10vw,100px)"}}>
          <div style={{opacity:0,animation:"fadeIn .7s .2s both"}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:20}}>
              <span className="badge-hero ok">✓ SK PPIU No.U.108/2021</span>
              <span className="badge-hero">✈ Direct Flight</span>
              <span className="badge-hero">🛡 0 Gagal Berangkat</span>
            </div>
          </div>
          <h1 style={{fontSize:"clamp(32px,5vw,62px)",color:"#fff",fontWeight:700,lineHeight:1.1,marginBottom:20,opacity:0,animation:"slideUp .8s .4s both"}}>
            Umroh Terpercaya<br/>dari <em style={{fontStyle:"normal",background:"linear-gradient(135deg,var(--g6),var(--g3))",WebkitBackgroundClip:"text",backgroundClip:"text",WebkitTextFillColor:"transparent"}}>Bandung</em><br/>untuk Indonesia
          </h1>
          <p style={{fontSize:"clamp(15px,2vw,19px)",color:"rgba(255,255,255,.7)",lineHeight:1.75,maxWidth:560,marginBottom:32,opacity:0,animation:"slideUp .7s .55s both"}}>
            Hotel 350m dari masjid. Direct flight tanpa transit. Pembimbing ustadz berpengalaman. Radiophone 200m. 1.000+ jamaah per tahun — 0 gagal berangkat sejak 2012.
          </p>
          <div style={{display:"flex",flexWrap:"wrap",gap:14,opacity:0,animation:"slideUp .7s .7s both"}}>
            <button className="btn-primary" onClick={() => window.open(WA(),"_blank")}>💬 Konsultasi Gratis</button>
            <button className="btn-outline" onClick={() => setPage("paket")}>Lihat Paket Umroh →</button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div style={{background:"var(--p9)",borderTop:"1px solid rgba(212,160,23,.13)"}}>
        <div className="container">
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)"}}>
            {[["1.000+","Jamaah per Tahun"],["0","Gagal Berangkat"],["350m","Hotel dari Masjid"],["45","Maks. per Rombongan"]].map(([n,l],i)=>(
              <div key={i} style={{padding:"32px 20px",textAlign:"center",borderRight:"1px solid rgba(255,255,255,.05)"}} data-anim="slide-up" data-delay={String((i+1)*100)}>
                <div style={{fontFamily:"var(--font-h)",fontSize:"clamp(26px,3.5vw,40px)",fontWeight:700,color:"var(--g6)",lineHeight:1,marginBottom:7}}>{n}</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,.5)"}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PACKAGES */}
      <section style={{background:"var(--n0)",paddingBlock:"clamp(56px,8vw,96px)"}}>
        <div className="container">
          <div className="section-header center" data-anim="slide-up">
            <span className="section-label">Paket Umroh</span>
            <h2 className="section-title">Pilih Paket yang Tepat untuk Anda</h2>
            <p className="section-sub">Semua paket menggunakan direct flight, hotel dekat masjid, dan ustadz berpengalaman — tanpa kompromi.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:22}}>
            {PACKAGES.slice(0,3).map((pkg,i)=>(
              <article className="k-card" key={pkg.id} data-anim="flip" data-delay={String((i+1)*100)} style={pkg.featured?{border:"2px solid var(--p6)"}:{}}>
                {pkg.featured && <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,var(--p6),var(--g6))"}}/>}
                <div className="k-icon">✈️</div>
                {pkg.tag && <span className="k-tag" style={{marginBottom:12,display:"inline-block"}}>{pkg.tag}</span>}
                <h3 className="k-title">{pkg.name}</h3>
                <p className="k-body">{pkg.desc}</p>
                <div style={{display:"flex",gap:8,marginBottom:16}}>
                  <span style={{fontSize:12,background:"var(--ok-bg)",color:"var(--ok)",borderRadius:999,padding:"3px 10px",fontWeight:700}}>📍 {pkg.hotel_dist}m dari Masjid</span>
                  <span style={{fontSize:12,background:"var(--p1)",color:"var(--p6)",borderRadius:999,padding:"3px 10px",fontWeight:700}}>{pkg.flight}</span>
                </div>
                <div style={{fontSize:15,fontWeight:700,color:"var(--n4)",marginBottom:14}}>Hubungi CS Kami</div>
                <button className="btn-primary" style={{width:"100%",justifyContent:"center",padding:"12px"}} onClick={()=>window.open(WA(`Saya%20tertarik%20dengan%20${encodeURIComponent(pkg.name)}%20SS%20Umroh`),"_blank")}>💬 Tanya Harga</button>
              </article>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:28}} data-anim="fade">
            <button className="btn-outline" style={{border:"1.5px solid var(--p6)",color:"var(--p6)",borderRadius:999}} onClick={()=>{setPage("paket");window.scrollTo(0,0);}}>Lihat Semua Paket Umroh →</button>
          </div>
        </div>
      </section>

      {/* FEATURES DENGAN ILUSTRASI GAMBAR */}
      <section style={{background:"#fff",paddingBlock:"clamp(56px,8vw,96px)"}}>
        <div className="container">
          <div className="home-feat-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"clamp(40px,6vw,80px)",alignItems:"center"}}>
            <div data-anim="slide-right">
              <img src={HOME_FEAT_IMG} alt="Kenyamanan Ibadah bersama SS Umroh" className="home-feat-img" loading="lazy" />
            </div>
            <div data-anim="slide-left">
              <span className="section-label">Keunggulan SS Umroh</span>
              <h2 className="section-title">Bukan Hanya Berangkat — Tapi Beribadah dengan Khusyuk</h2>
              <p className="section-sub" style={{marginBottom:32}}>Kami percaya perjalanan umroh adalah perjalanan spiritual yang harus dijaga kenyamanannya. Fokus ibadah, kami urus sisanya.</p>
              
              <div style={{display:"flex",flexDirection:"column",gap:24}}>
                {[
                  ["🏨","Hotel 350m dari Masjid","Tidak ada shuttle, tidak ada menunggu. Anda berjalan kaki kapan saja — subuh, siang, malam. Hotel Nozol Munawaroh (Madinah) dan Le Meridien Ajyad (Mekkah)."],
                  ["✈️","Direct Flight Tanpa Transit","Penerbangan langsung Jakarta–Madinah–Mekkah–Jakarta via Saudi Airlines dan Garuda Indonesia. Hemat waktu, hemat tenaga, lebih banyak untuk ibadah."],
                  ["📻","Radiophone 200m","Setiap rombongan dilengkapi earphone wireless 200m. Penjelasan ustadz terdengar jelas di tengah jutaan jamaah — di manapun Anda berada."],
                ].map(([ic,t,d])=>(
                  <div key={t} style={{display:"flex",gap:16}}>
                    <div style={{width:52,height:52,borderRadius:14,background:"linear-gradient(135deg,var(--p1),rgba(212,160,23,.1))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{ic}</div>
                    <div>
                      <h3 style={{fontFamily:"var(--font-h)",fontSize:18,fontWeight:700,color:"var(--n9)",marginBottom:6}}>{t}</h3>
                      <p style={{fontSize:14,color:"var(--n6)",lineHeight:1.7}}>{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <TestimonialsSection />

      <FAQSection
        items={FAQ_GENERAL}
        label="FAQ"
        title="Pertanyaan yang Sering Diajukan"
        sub="Semua yang perlu Anda ketahui sebelum mendaftar umroh bersama SS Umroh."
      />

      <CTABanner onSecondary={()=>{setPage("paket");window.scrollTo(0,0);}} />
      <TrustStrip />
    </>
  );
}

function PaketUmrohPage({ setPage }) {
  useScrollAnim();
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? PACKAGES : PACKAGES.filter(p => p.category === filter);

  return (
    <>
      <section className="page-hero">
        <div className="ph-bg" style={{backgroundImage:`url(${HERO_PAKET_BG})`}}/>
        <div className="ph-pattern"/>
        <div className="ph-glow"/>
        <div className="container"><div className="ph-content">
          <nav className="breadcrumb">
            <button className="breadcrumb-link" onClick={()=>{setPage("home");window.scrollTo(0,0);}}>Beranda</button>
            <span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-cur">Paket Umroh</span>
          </nav>
          <h1 className="ph-h1">Paket Umroh SS Umroh —<br/><em>Direct Flight, Hotel Dekat,</em> Harga Terjangkau</h1>
          <p className="ph-sub">Semua paket menggunakan penerbangan direct tanpa transit, hotel maksimal 350m dari masjid, ustadz berpengalaman, dan radiophone 200m per rombongan.</p>
          <div className="ph-badges">
            <span className="badge-hero ok">✓ SK PPIU No.U.108/2021</span>
            <span className="badge-hero">✈ Direct Flight</span>
            <span className="badge-hero">📍 Hotel 350m</span>
            <span className="badge-hero">📻 Radiophone 200m</span>
          </div>
          <div className="ph-ctas">
            <button className="btn-primary" onClick={()=>window.open(WA(),"_blank")}>💬 Konsultasi Paket</button>
            <button className="btn-outline" onClick={()=>document.getElementById("pkgs")?.scrollIntoView({behavior:"smooth"})}>Lihat Paket ↓</button>
          </div>
        </div></div>
      </section>

      {/* Filter */}
      <div style={{background:"#fff",borderBottom:"1px solid var(--n1)",position:"sticky",top:"var(--nav-h)",zIndex:40,padding:"0"}}>
        <div className="container" style={{display:"flex",gap:8,padding:"14px 24px",overflowX:"auto"}}>
          {[["all","Semua Paket"],["hemat","Umroh Hemat"],["bintang4","Bintang 4"],["tabungan","Tabungan"],["ramadhan","Ramadhan"],["group","Group/Korporat"]].map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)} style={{flexShrink:0,padding:"8px 16px",borderRadius:999,border:"1.5px solid",fontFamily:"var(--font-h)",fontSize:13,fontWeight:600,cursor:"pointer",transition:"all .2s",
              borderColor:filter===v?"var(--p6)":"var(--n1)",background:filter===v?"var(--p6)":"#fff",color:filter===v?"#fff":"var(--n6)"}}>{l}</button>
          ))}
        </div>
      </div>

      {/* Package Grid */}
      <section id="pkgs" style={{background:"var(--n0)",paddingBlock:"clamp(48px,7vw,88px)"}}>
        <div className="container">
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:22}}>
            {filtered.map((pkg,i)=>(
              <article className="k-card" key={pkg.id} data-anim="flip" data-delay={String((i%3+1)*100)} style={pkg.featured?{border:"2px solid var(--p6)"}:{}}>
                <div className="k-icon">✈️</div>
                {pkg.tag && <span className="k-tag" style={{marginBottom:12,display:"inline-block"}}>{pkg.tag}</span>}
                <h3 className="k-title">{pkg.name}</h3>
                <p className="k-body">{pkg.desc}</p>
                <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
                  <span style={{fontSize:12,background:"var(--ok-bg)",color:"var(--ok)",borderRadius:999,padding:"3px 10px",fontWeight:700}}>📍 {pkg.hotel_dist}m</span>
                  <span style={{fontSize:12,background:"var(--p1)",color:"var(--p6)",borderRadius:999,padding:"3px 10px",fontWeight:700}}>{pkg.flight}</span>
                </div>
                <div style={{fontSize:15,fontWeight:700,color:"var(--n4)",marginBottom:14}}>Hubungi CS Kami</div>
                <button className="btn-primary" style={{width:"100%",justifyContent:"center",padding:"12px"}} onClick={()=>window.open(WA(`Saya%20tertarik%20${encodeURIComponent(pkg.name)}`),"_blank")}>💬 Tanya Harga</button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Hotels */}
      <section style={{background:"var(--n05)",paddingBlock:"clamp(56px,7vw,88px)"}}>
        <div className="container">
          <div className="section-header center" data-anim="slide-up">
            <span className="section-label">Akomodasi</span>
            <h2 className="section-title">Hotel 350m dari Masjid — Bukan Kebetulan</h2>
            <p className="section-sub">Filosofi SS Umroh: hotel sedekat mungkin dari masjid agar jamaah bisa beribadah lebih banyak.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
            {[
              {name:"Nozol Munawaroh",city:"Al-Madinah",stars:4,dist:"350m dari Masjid Nabawi",img:NABAWI_IMG,feats:["350m dari Masjid Nabawi — jalan kaki setiap sholat","Sarapan dan makan malam termasuk","Kamar 2–3 orang, standar bintang 4","WiFi tersedia di seluruh area"]},
              {name:"Le Meridien Ajyad",city:"Mekkah Al-Mukarramah",stars:5,dist:"350m dari Masjidil Haram",img:null,feats:["350m dari Masjidil Haram — tawaf sunnah kapan saja","Hotel bintang 5, view ke arah Masjidil Haram","Restoran dengan menu halal internasional","Tersedia di paket Bintang 4"]},
            ].map(h=>(
              <article key={h.name} style={{background:"#fff",border:"1px solid var(--n1)",borderRadius:20,overflow:"hidden",transition:"box-shadow .25s,transform .22s"}} data-anim={h.img?"slide-right":"slide-left"}>
                <div style={{height:220,background:h.img?`url(${h.img}) center/cover`:"linear-gradient(135deg,var(--p1),var(--g1))",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                  {!h.img && <span style={{fontSize:52}}>🕌</span>}
                  <div style={{position:"absolute",top:14,left:14,background:"linear-gradient(135deg,var(--g6),var(--g7))",color:"var(--p9)",fontSize:11,fontWeight:800,padding:"5px 12px",borderRadius:999,fontFamily:"var(--font-h)"}}>{h.city.split(" ")[0]}</div>
                </div>
                <div style={{padding:24}}>
                  <div style={{color:"var(--g6)",fontSize:14,letterSpacing:2,marginBottom:6}}>{"★".repeat(h.stars)}</div>
                  <h3 style={{fontFamily:"var(--font-h)",fontSize:20,fontWeight:700,color:"var(--n9)",marginBottom:4}}>{h.name}</h3>
                  <div style={{fontSize:12,fontWeight:700,color:"var(--p6)",textTransform:"uppercase",letterSpacing:".04em",marginBottom:12}}>{h.dist}</div>
                  {h.feats.map(f=>(
                    <div key={f} style={{display:"flex",gap:9,fontSize:13,color:"var(--n6)",marginBottom:8}}>
                      <span>✓</span><span>{f}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <TestimonialsSection />
      <FAQSection items={FAQ_GENERAL} label="FAQ Paket" title="Pertanyaan Seputar Paket Umroh" />
      <CTABanner onSecondary={()=>{setPage("home");window.scrollTo(0,0);}} secondaryText="Kembali ke Beranda →" />
      <TrustStrip />
    </>
  );
}

function KorporatPage({ setPage }) {
  useScrollAnim();
  const FAQ_KORP = [
    {id:1,q:"Berapa minimum peserta untuk program umroh korporat?",a:"Program korporat SS Umroh dapat diikuti mulai dari 10 orang. Maksimal 45 jamaah per rombongan agar layanan tetap optimal."},
    {id:2,q:"Apakah jadwal keberangkatan bisa disesuaikan?",a:"Ya. Untuk program korporat, SS Umroh menyediakan penjadwalan fleksibel yang disesuaikan dengan kalender perusahaan atau agenda komunitas Anda."},
    {id:3,q:"Dokumen apa yang disediakan untuk keperluan CSR atau HR?",a:"SS Umroh menyediakan laporan keberangkatan formal termasuk daftar nama jamaah, tanggal perjalanan, dan dokumentasi foto selama perjalanan."},
    {id:4,q:"Apakah ada diskon khusus untuk group besar?",a:"Ya. Semakin banyak peserta, semakin kompetitif harga per orang yang kami berikan. Hubungi CS untuk mendapatkan penawaran."},
    {id:5,q:"Apakah manasik dilakukan secara group?",a:"Ya. Untuk program korporat, manasik dilaksanakan secara group seminggu sebelum keberangkatan di hotel berbintang Bandung."},
    {id:6,q:"Apakah SS Umroh sudah berizin untuk menyelenggarakan umroh?",a:"Ya. SS Umroh (PT. Sarana Sadaya) berizin resmi dengan SK PPIU No. U.108 Tahun 2021 dari Kemenag RI."},
    {id:7,q:"Komunitas apa saja yang bisa menggunakan layanan korporat?",a:"Perusahaan, komunitas masjid, pesantren, ormas Islam, arisan, alumni, komunitas RT/RW, dan instansi pemerintah."},
  ];
  return (
    <>
      <section className="page-hero" style={{minHeight:"62vh"}}>
        <div className="ph-bg" style={{backgroundImage:`url(${HERO_KORPORAT_BG})`}}/>
        <div className="ph-pattern"/><div className="ph-glow"/>
        <div className="container"><div className="ph-content">
          <nav className="breadcrumb">
            <button className="breadcrumb-link" onClick={()=>{setPage("home");window.scrollTo(0,0);}}>Beranda</button>
            <span className="breadcrumb-sep">›</span><span className="breadcrumb-cur">Korporat</span>
          </nav>
          <h1 className="ph-h1">Umroh Korporat &amp; Group —<br/><em>Pengalaman Ibadah</em> untuk Tim Anda</h1>
          <p className="ph-sub">SS Umroh melayani perusahaan, komunitas, dan organisasi. Koordinator dedicated, harga spesial group, laporan keberangkatan.</p>
          <div className="ph-badges">
            <span className="badge-hero ok">✓ Koordinator Dedicated</span>
            <span className="badge-hero">👥 Min. 10 Orang</span>
            <span className="badge-hero">⭐ Harga Spesial Group</span>
            <span className="badge-hero">📋 Laporan Formal</span>
          </div>
          <div className="ph-ctas">
            <button className="btn-primary" onClick={()=>window.open(WA("Assalamu%27alaikum%20SS%20Umroh%2C%20saya%20ingin%20konsultasi%20program%20umroh%20korporat."),"_blank")}>💬 Ajukan Penawaran Group</button>
          </div>
        </div></div>
      </section>

      {/* Stats */}
      <div style={{background:"var(--p9)",borderTop:"1px solid rgba(212,160,23,.13)"}}>
        <div className="container">
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)"}}>
            {[["1.000+","Jamaah per Tahun"],["0","Gagal Berangkat"],["45","Maks. per Rombongan"],["Sejak 2012","Melayani Group"]].map(([n,l],i)=>(
              <div key={i} style={{padding:"32px 20px",textAlign:"center",borderRight:"1px solid rgba(255,255,255,.05)"}} data-anim="slide-up" data-delay={String((i+1)*100)}>
                <div style={{fontFamily:"var(--font-h)",fontSize:"clamp(22px,3vw,36px)",fontWeight:700,color:"var(--g6)",lineHeight:1,marginBottom:7}}>{n}</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,.5)"}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services + Corporate Image */}
      <section style={{background:"var(--n0)",paddingBlock:"clamp(56px,8vw,96px)"}}>
        <div className="container">
          <div className="section-header center" data-anim="slide-up">
            <span className="section-label">Layanan Korporat</span>
            <h2 className="section-title">Program untuk Setiap Jenis Organisasi</h2>
            <p className="section-sub">Dari perusahaan multinasional hingga komunitas RT, SS Umroh menyesuaikan program sesuai kebutuhan Anda.</p>
          </div>
          
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:22,marginBottom:48}}>
            {[
              ["🏢","Umroh Karyawan & Insentif","Penghargaan paling bermakna kepada karyawan terbaik. Koordinasi lengkap, dokumentasi, dan laporan untuk HR.","Karyawan · Reward · Insentif"],
              ["⭐","CSR Perusahaan","Program tanggung jawab sosial melalui ibadah. Dokumentasi lengkap dan laporan formal untuk pelaporan CSR.","CSR · Laporan Formal"],
              ["🕌","Komunitas & Organisasi","Masjid, pesantren, ormas Islam, arisan, alumni. Jadwal dan koordinasi menyesuaikan kebutuhan kelompok.","Masjid · Pesantren · Komunitas"],
            ].map(([ic,t,d,badge],i)=>(
              <article className="k-card" key={t} data-anim="flip" data-delay={String((i+1)*100)}>
                <div className="k-icon">{ic}</div>
                <h3 className="k-title">{t}</h3>
                <p className="k-body">{d}</p>
                <span className="k-tag">{badge}</span>
              </article>
            ))}
          </div>

          <div style={{borderRadius:24,overflow:"hidden",position:"relative",minHeight:300,boxShadow:"0 24px 48px rgba(0,0,0,.15)"}} data-anim="scale">
             <img src={KORPORAT_LAYANAN_IMG} alt="Corporate Umrah Gathering" style={{width:"100%",height:"100%",objectFit:"cover",position:"absolute",inset:0}} loading="lazy" />
             <div style={{position:"absolute",inset:0,background:"linear-gradient(to right, rgba(26,5,51,0.9) 0%, rgba(26,5,51,0.4) 100%)"}}></div>
             <div style={{position:"relative",zIndex:2,padding:"clamp(40px,6vw,60px)",maxWidth:600}}>
                <h3 style={{fontFamily:"var(--font-h)",fontSize:28,fontWeight:700,color:"#fff",marginBottom:16}}>Rancang Perjalanan Bersama Kami</h3>
                <p style={{fontSize:16,color:"rgba(255,255,255,.8)",marginBottom:24,lineHeight:1.7}}>Tim dedicated kami siap mempresentasikan program umroh korporat di kantor Anda. Kami pastikan setiap kebutuhan perusahaan terpenuhi secara profesional.</p>
                <button className="btn-primary" onClick={()=>window.open(WA("Assalamu%27alaikum%2C%20saya%20ingin%20mengundang%20tim%20SS%20Umroh%20untuk%20presentasi%20program%20korporat."),"_blank")}>Undang Kami Presentasi →</button>
             </div>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section style={{background:"var(--p0)",paddingBlock:"clamp(56px,7vw,88px)"}}>
        <div className="container">
          <div className="section-header center" data-anim="slide-up">
            <span className="section-label">Siapa yang Kami Layani</span>
            <h2 className="section-title">Melayani Semua Jenis Organisasi</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
            {[["🏭","Manufaktur","Program insentif karyawan"],["🏦","Perbankan & Keuangan","Reward nasabah premier"],["🕌","Masjid & DKM","Program jemaah masjid"],["📚","Pesantren","Guru & santri berprestasi"],["👥","Ormas Islam","NU, Muhammadiyah, dll"],["🏛️","Instansi Pemerintah","Reward ASN"],["🏥","Rumah Sakit","Reward tenaga medis"],["🤝","Arisan & Komunitas","Arisan umroh, alumni, RT/RW"]].map(([ic,n,d])=>(
              <div key={n} style={{background:"#fff",border:"1px solid var(--n1)",borderRadius:16,padding:"24px 20px",textAlign:"center",transition:"all .25s"}} data-anim="flip">
                <div style={{fontSize:32,marginBottom:12}}>{ic}</div>
                <div style={{fontFamily:"var(--font-h)",fontSize:14,fontWeight:700,color:"var(--n9)",marginBottom:5}}>{n}</div>
                <div style={{fontSize:12,color:"var(--n4)"}}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section style={{background:"#fff",paddingBlock:"clamp(56px,7vw,88px)"}}>
        <div className="container">
          <div className="section-header center" data-anim="slide-up">
            <span className="section-label">Cara Kerja</span>
            <h2 className="section-title">Proses Mudah, Transparan, Profesional</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:0,position:"relative"}}>
            <div style={{position:"absolute",top:36,left:"10%",right:"10%",height:1,background:"linear-gradient(90deg,var(--p1),var(--p6),var(--p1))"}}/>
            {[["1","💬","Konsultasi Awal","Hubungi CS kami via WhatsApp"],["2","📄","Penawaran Khusus","Proposal dengan harga spesial group"],["3","✍️","Konfirmasi & DP","Booking fee untuk amankan jadwal"],["4","🎓","Manasik Group","Di hotel bintang Bandung"],["5","✈️","Berangkat","Dengan koordinator dedicated"]].map(([n,ic,t,d],i)=>(
              <div key={n} style={{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",padding:"0 12px",position:"relative",zIndex:1}} data-anim="slide-up" data-delay={String((i+1)*100)}>
                <div style={{width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,var(--p8),var(--p6))",border:"3px solid #fff",boxShadow:"0 4px 20px rgba(124,58,190,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--font-h)",fontSize:22,fontWeight:700,color:"#fff",marginBottom:20}}>{n}</div>
                <div style={{fontSize:20,marginBottom:10}}>{ic}</div>
                <div style={{fontFamily:"var(--font-h)",fontSize:14,fontWeight:700,color:"var(--n9)",marginBottom:8}}>{t}</div>
                <div style={{fontSize:12,color:"var(--n4)"}}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TestimonialsSection />
      <FAQSection items={FAQ_KORP} label="FAQ Korporat" title="Pertanyaan Program Korporat" sub="Informasi cara mendaftarkan organisasi atau perusahaan Anda." ctaText="Siap Mendiskusikan Program?" ctaSub="Tim SS Umroh siap buat penawaran sesuai kebutuhan dan anggaran organisasi Anda." />
      <CTABanner label="Mulai Sekarang" title="Wujudkan Program Ibadah untuk Organisasi Anda" sub="Konsultasi gratis, penawaran tanpa syarat." primaryText="💬 Minta Penawaran via WhatsApp" primaryMsg="Assalamu%27alaikum%2C%20saya%20ingin%20mendapatkan%20penawaran%20program%20umroh%20korporat." />
      <TrustStrip />
    </>
  );
}

function TentangKamiPage({ setPage }) {
  useScrollAnim();
  const FAQ_TENTANG = [
    {id:1,q:"Kapan SS Umroh berdiri?",a:"SS Umroh (sebelumnya SS Travel) berdiri pada 2012 di Bandung di bawah PT. Sarana Sadaya. Mendapat izin Kemenag 2021, rebranding 2023, kantor baru Jl. Cihapit No. 41 pada 2025."},
    {id:2,q:"Siapa direktur SS Umroh?",a:"SS Umroh dipimpin oleh Hamzah Romzul Qurani selaku Direktur Utama PT. Sarana Sadaya. Beliau mendirikan SS Travel pada 2012 dengan rekam jejak 0 gagal berangkat."},
    {id:3,q:"Apakah SS Umroh sudah berizin resmi?",a:"Ya. SS Umroh (PT. Sarana Sadaya) terdaftar resmi sebagai PPIU di Kemenag RI dengan nomor SK PPIU No. U.108 Tahun 2021."},
    {id:4,q:"Di mana kantor SS Umroh?",a:"Kantor SS Umroh di Jl. Cihapit No. 41, Kota Bandung, Jawa Barat. Hubungi kami via WhatsApp terlebih dahulu untuk mengatur waktu kunjungan."},
    {id:5,q:"Berapa jamaah yang sudah diberangkatkan?",a:"Lebih dari 1.000 jamaah per tahun dari Bandung Raya, Jakarta, Padang, Bekasi, Depok, Makassar. Sejak 2012 hingga kini, 0 gagal berangkat."},
    {id:6,q:"Apakah SS Umroh pernah diliput media?",a:"Ya. SS Umroh diliput Republika Online (7 Mei 2025) dan tampil di Inspira TV (2025)."},
    {id:7,q:"Apa yang membedakan SS Umroh dari biro lain?",a:"Tiga standar tak berkompromi: (1) Hotel 350m dari masjid — tanpa shuttle, (2) Penerbangan direct Jakarta–Madinah, (3) Radiophone 200m per rombongan."},
  ];
  const TL = [
    {year:"2012",icon:"⭐",title:"SS Travel Berdiri di Bandung",body:"Hamzah Romzul Qurani mendirikan SS Travel. Jamaah pertama sudah merasakan standar: hotel dekat masjid, ustadz pendamping, tidak ada shuttle.",tag:"📍 Bandung, Jawa Barat"},
    {year:"2012–2020",icon:"⬆",title:"Bertumbuh Bersama Jamaah",body:"Berkembang murni dari kepercayaan jamaah. Tanpa iklan besar — jamaah puas merekomendasikan kepada keluarga. Jamaah mulai dari Jakarta, Padang, Bekasi, Depok, Makassar.",tag:"👥 Jamaah dari seluruh Indonesia"},
    {year:"2021",icon:"🛡",title:"Izin Resmi Kemenag RI",body:"Mendapatkan izin sebagai PPIU dari Kemenag RI: SK PPIU No. U.108 Tahun 2021. Bukti standar yang dijaga selama hampir satu dekade telah diakui negara.",tag:"✓ SK PPIU No. U.108/2021"},
    {year:"2023",icon:"🎉",title:"Rebranding Menjadi SS Umroh",body:"SS Travel melakukan rebranding menjadi SS Umroh. Logo baru, nama baru, semangat yang sama. Diliput Republika Online dan Inspira TV.",tag:"⭐ Identitas Baru, Misi Sama"},
    {year:"2025",icon:"🏠",title:"Kantor Baru di Jl. Cihapit",body:"SS Umroh meresmikan kantor baru di Jl. Cihapit No. 41, Kota Bandung — lebih strategis, lebih representatif untuk melayani jamaah yang terus bertambah.",tag:"📍 Jl. Cihapit No. 41, Bandung"},
  ];
  return (
    <>
      <section className="page-hero" style={{minHeight:"64vh"}}>
        <div className="ph-bg" style={{backgroundImage:`url(${HERO_TENTANG_BG})`}}/><div className="ph-pattern"/><div className="ph-glow"/>
        <div className="container"><div className="ph-content">
          <nav className="breadcrumb">
            <button className="breadcrumb-link" onClick={()=>{setPage("home");window.scrollTo(0,0);}}>Beranda</button>
            <span className="breadcrumb-sep">›</span><span className="breadcrumb-cur">Tentang Kami</span>
          </nav>
          <h1 className="ph-h1">Mengenal <em>SS Umroh</em> —<br/>Sejak 2012, Lahir dari Kepercayaan</h1>
          <p className="ph-sub">Kami adalah PT. Sarana Sadaya — biro perjalanan umroh yang tumbuh bersama jamaah dari Bandung ke seluruh Indonesia. Lebih dari satu dekade, satu misi: memastikan setiap jamaah berangkat dengan tenang dan beribadah dengan khusyuk.</p>
          <div className="ph-badges">
            <span className="badge-hero ok">✓ SK PPIU No.U.108/2021</span>
            <span className="badge-hero">🕌 Berdiri 2012</span>
            <span className="badge-hero">🛡 0 Gagal Berangkat</span>
          </div>
          <div className="ph-ctas">
            <button className="btn-primary" onClick={()=>window.open(WA(),"_blank")}>💬 Kenalan via WhatsApp</button>
          </div>
        </div></div>
      </section>

      {/* Company Story dengan Ilustrasi */}
      <section style={{background:"#fff",paddingBlock:"clamp(64px,9vw,104px)"}}>
        <div className="container">
          <div style={{display:"grid",gridTemplateColumns:"1.1fr 1fr",gap:"clamp(48px,6vw,88px)",alignItems:"center"}}>
            <div data-anim="slide-right">
              <span className="section-label">Cerita Kami</span>
              <h2 className="section-title">Dari SS Travel hingga SS Umroh</h2>
              <p style={{fontSize:16,color:"var(--n6)",lineHeight:1.85,marginBottom:16}}>Pada tahun <strong>2012</strong>, Hamzah Romzul Qurani mendirikan SS Travel di Bandung dengan satu keyakinan: jamaah harus bisa fokus beribadah tanpa khawatir teknis perjalanan.</p>
              <p style={{fontSize:16,color:"var(--n6)",lineHeight:1.85,marginBottom:16}}>Selama hampir satu dekade, SS Travel membangun reputasi dari kepercayaan jamaah yang kembali merekomendasikan kepada keluarga. Jamaah dari Bandung Raya, Jakarta, Padang, Bekasi, Depok, hingga Makassar datang karena cerita dari mulut ke mulut.</p>
              <p style={{fontSize:16,color:"var(--n6)",lineHeight:1.85,marginBottom:24}}>Pada <strong>2021</strong> mendapat izin Kemenag RI. Pada <strong>2023</strong> rebranding menjadi SS Umroh. Pada <strong>2025</strong> kantor baru di Jl. Cihapit No. 41 diresmikan.</p>
              
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16, marginTop:32}}>
                {[["2012","Tahun Berdiri"],["1.000+","Jamaah/Tahun"],["0","Gagal Berangkat"],["45","Maks./Rombongan"]].map(([n,l])=>(
                  <div key={l} style={{background:"linear-gradient(135deg,var(--p9),var(--p8))",borderRadius:18,padding:20,textAlign:"center"}}>
                    <div style={{fontFamily:"var(--font-h)",fontSize:"clamp(24px,3vw,32px)",fontWeight:700,color:"var(--g6)",lineHeight:1,marginBottom:4}}>{n}</div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,.55)"}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div data-anim="slide-left" style={{display:"flex",flexDirection:"column",gap:24}}>
              <img src={TENTANG_CERITA_IMG} alt="Tim SS Umroh di Kantor" style={{width:"100%", borderRadius:24, boxShadow:"0 20px 40px rgba(0,0,0,.08)"}} loading="lazy" />
              <div style={{background:"var(--n05)",border:"1px solid var(--n1)",borderRadius:18,padding:24}}>
                {[["Nama Perusahaan","PT. Sarana Sadaya"],["Merek Dagang","SS Umroh"],["Direktur","Hamzah Romzul Qurani"],["Berdiri","2012 (SS Travel)"],["Rebranding","2023 (SS Umroh)"],["Izin Kemenag","SK PPIU No.U.108/2021"],["Kantor","Jl. Cihapit No. 41, Bandung"],["CS",SITE_SETTINGS.cs_name]].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid var(--n1)",fontSize:13}}>
                    <span style={{color:"var(--n4)",fontWeight:500}}>{k}</span>
                    <span style={{color:"var(--n9)",fontWeight:600,textAlign:"right",maxWidth:"55%"}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Director */}
      <section style={{background:"var(--p0)",paddingBlock:"clamp(56px,7vw,88px)"}}>
        <div className="container">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1.8fr",gap:"clamp(40px,5vw,80px)",alignItems:"center"}}>
            <div data-anim="slide-right">
              <div style={{borderRadius:24,overflow:"hidden",aspectRatio:"3/4",background:"linear-gradient(135deg,var(--p1),var(--g1))"}}>
                <img src={USTADZ_IMG} alt="Ustadz pembimbing SS Umroh" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top"}} loading="lazy"/>
              </div>
              <div style={{background:"var(--p9)",border:"2px solid var(--g6)",borderRadius:14,padding:"12px 20px",textAlign:"center",marginTop:-16,marginInline:"auto",width:"fit-content",animation:"glowPulse 3s ease-in-out 1s infinite"}}>
                <div style={{fontFamily:"var(--font-h)",fontSize:14,fontWeight:700,color:"#fff"}}>Hamzah Romzul Qurani</div>
                <div style={{fontSize:11,color:"var(--g6)"}}>Direktur Utama · PT. Sarana Sadaya</div>
              </div>
            </div>
            <div data-anim="slide-left">
              <span className="section-label">Pimpinan</span>
              <h2 className="section-title">Hamzah Romzul Qurani</h2>
              <p style={{fontSize:16,color:"var(--n6)",lineHeight:1.85,marginBottom:14}}>Mendirikan SS Travel pada 2012 dengan modal paling berharga: kepercayaan jamaah Bandung yang ingin beribadah umroh dengan tenang dan layak.</p>
              <p style={{fontSize:16,color:"var(--n6)",lineHeight:1.85,marginBottom:24}}>Di bawah kepemimpinannya, SS Umroh tumbuh dari biro kecil lokal menjadi penyelenggara umroh berizin yang melayani lebih dari 1.000 jamaah per tahun — tanpa satu pun gagal berangkat.</p>
              <blockquote style={{fontSize:"clamp(17px,2.2vw,20px)",fontFamily:"var(--font-h)",fontWeight:500,color:"var(--n9)",lineHeight:1.55,padding:"22px 24px",background:"var(--p0)",borderLeft:"3px solid var(--p6)",borderRadius:"0 14px 14px 0",fontStyle:"italic",marginBottom:20}}>
                "Travel memberangkatkan 1.000 jamaah dan tidak pernah ada gagal keberangkatan."
              </blockquote>
              <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
                <span style={{background:"var(--ok-bg)",color:"var(--ok)",fontSize:12,fontWeight:700,padding:"6px 14px",borderRadius:999,fontFamily:"var(--font-h)"}}>✓ 1.000+ Jamaah/Tahun</span>
                <span style={{background:"var(--p1)",color:"var(--p6)",fontSize:12,fontWeight:700,padding:"6px 14px",borderRadius:999,fontFamily:"var(--font-h)"}}>🕌 Sejak 2012</span>
                <span style={{background:"var(--g1)",color:"var(--g9)",fontSize:12,fontWeight:700,padding:"6px 14px",borderRadius:999,fontFamily:"var(--font-h)"}}>🛡 0 Gagal Berangkat</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section style={{background:"#fff",paddingBlock:"clamp(56px,7vw,88px)"}}>
        <div className="container">
          <div className="section-header center" data-anim="slide-up">
            <span className="section-label">Perjalanan SS Umroh</span>
            <h2 className="section-title">Lebih dari Satu Dekade Melayani Jamaah</h2>
          </div>
          <div style={{position:"relative",paddingLeft:40,maxWidth:800,marginInline:"auto"}}>
            <div style={{position:"absolute",left:0,top:8,bottom:8,width:2,background:"linear-gradient(to bottom,var(--p1),var(--p6),var(--p1))"}}/>
            {TL.map((t,i)=>(
              <div key={t.year} style={{position:"relative",padding:"0 0 48px 32px"}} data-anim="slide-left" data-delay={String(i*100)}>
                <div style={{position:"absolute",left:-44,top:4,width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,var(--p6),var(--p7))",border:"3px solid #fff",boxShadow:"0 2px 12px rgba(124,58,190,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",fontWeight:700}}>{t.icon}</div>
                <div style={{fontSize:12,fontWeight:700,color:"var(--p6)",letterSpacing:".08em",textTransform:"uppercase",marginBottom:6}}>{t.year}</div>
                <h3 style={{fontFamily:"var(--font-h)",fontSize:18,fontWeight:700,color:"var(--n9)",marginBottom:8}}>{t.title}</h3>
                <p style={{fontSize:14,color:"var(--n6)",lineHeight:1.7}}>{t.body}</p>
                <span style={{display:"inline-flex",alignItems:"center",gap:5,background:"var(--ok-bg)",color:"var(--ok)",fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:999,marginTop:10,fontFamily:"var(--font-h)"}}>{t.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TestimonialsSection />
      <FAQSection items={FAQ_TENTANG} label="FAQ" title="Pertanyaan tentang SS Umroh" />
      <CTABanner title="Siap Memulai Perjalanan Ibadah Anda?" onSecondary={()=>{setPage("paket");window.scrollTo(0,0);}} />
      <TrustStrip />
    </>
  );
}

function DestinasiPage({ setPage }) {
  useScrollAnim();
  const [activeTab, setActiveTab] = useState("madinah");
  const TABS = [
    {id:"madinah",label:"Al-Madinah",icon:"🕌",count:6},
    {id:"mekkah",label:"Mekkah Al-Mukarramah",icon:"🏛️",count:6},
    {id:"ziarah",label:"Ziarah Tambahan",icon:"📍",count:5},
    {id:"hotel",label:"Hotel & Akomodasi",icon:"🏨",count:2},
  ];
  const SITES = {
    madinah:[
      {name:"Masjid Nabawi",ar:"الْمَسْجِدُ النَّبَوِيُّ",dist:"350m dari Hotel",badge:"✓ Wajib Dikunjungi",desc:"Masjid yang dibangun Nabi Muhammad SAW. Sholat di sini setara 1.000 kali. Jamaah SS Umroh bisa jalan kaki setiap waktu sholat.",img:NABAWI_IMG},
      {name:"Raudhah",ar:"الرَّوْضَةُ الشَّرِيفَةُ",badge:"⭐ Taman Surga",desc:"Antara mimbar dan makam Rasulullah SAW — taman surga di Masjid Nabawi. Spot paling istimewa untuk berdoa dengan khusyuk.",img:IMG_RAUDHAH},
      {name:"Makam Baqi",ar:"الْبَقِيعُ",badge:"📍 Ziarah",desc:"Pemakaman bersejarah di sisi timur Masjid Nabawi. Tempat peristirahatan para sahabat, istri, dan keluarga Rasulullah SAW.",img:IMG_BAQI},
      {name:"Masjid Quba",ar:"مَسْجِدُ قُبَاء",badge:"🕌 Masjid Pertama",desc:"Masjid pertama dalam sejarah Islam. Sholat 2 rakaat setara pahala umroh. ±5 km dari pusat Madinah.",img:IMG_QUBA},
      {name:"Masjid Qiblatain",ar:"مَسْجِدُ الْقِبْلَتَيْن",badge:"⚬ Dua Kiblat",desc:"Tempat turunnya perintah mengubah kiblat dari Masjidil Aqsa ke Ka'bah saat Rasulullah SAW sedang sholat.",img:IMG_QIBLATAIN},
      {name:"Jabal Uhud",ar:"جَبَلُ أُحُد",badge:"⛰ Sejarah Islam",desc:"Bukit tempat Perang Uhud. Rasulullah SAW bersabda Uhud mencintai kita. Terdapat makam syuhada Uhud.",img:IMG_UHUD},
    ],
    mekkah:[
      {name:"Masjidil Haram",ar:"الْمَسْجِدُ الْحَرَامُ",dist:"350m dari Hotel",badge:"⭐ Wajib",desc:"Masjid terbesar dan tersuci di dunia. Sholat di sini setara 100.000 kali. Pusat semua ritual umroh.",img:IMG_HARAM},
      {name:"Ka'bah — Baitullah",ar:"الْكَعْبَةُ الْمُشَرَّفَةُ",badge:"⬟ Baitullah",desc:"Rumah Allah — titik pusat tawaf dan kiblat seluruh umat Islam. Momen pertama melihat Ka'bah adalah pengalaman mengharukan.",img:IMG_KAABAH},
      {name:"Air Zamzam",ar:"مَاءُ زَمْزَم",badge:"💧 Paling Berkah",desc:"Air paling berkah di dunia — memancar sejak zaman Ibrahim AS. Tersedia gratis di seluruh Masjidil Haram.",img:IMG_ZAMZAM},
      {name:"Shafa & Marwah",ar:"الصَّفَا وَالْمَرْوَةُ",badge:"🏃 Rukun Umroh",desc:"Tempat Siti Hajar berlari mencari air. Diabadikan dalam ritual sa'i (7 kali) sebagai bagian wajib umroh.",img:IMG_SAI},
      {name:"Arafah",ar:"عَرَفَاتُ",badge:"🌅 Wukuf Haji",desc:"Padang luas tempat wukuf — puncak ibadah haji. Rasulullah SAW berkhutbah di sini saat Haji Wada.",img:IMG_ARAFAH},
      {name:"Jabal Nur & Gua Hira",ar:"جَبَلُ النُّورِ",badge:"📖 Wahyu Pertama",desc:"Bukit tempat Gua Hira — wahyu pertama Al-Quran diturunkan kepada Nabi Muhammad SAW oleh Malaikat Jibril.",img:IMG_NUR},
    ],
    ziarah:[
      {name:"Jabal Tsur & Gua Tsur",ar:"جَبَلُ ثَوْر",badge:"📍 Hijrah",desc:"Tempat Rasulullah SAW dan Abu Bakar bersembunyi 3 hari saat hijrah ke Madinah.",img:IMG_ZIARAH},
      {name:"Muzdalifah",ar:"مُزْدَلِفَةُ",badge:"🌙 Situs Haji",desc:"Hamparan antara Arafah dan Mina tempat jamaah haji bermalam dan mengumpulkan batu jumroh.",img:IMG_ZIARAH},
      {name:"Ji'ranah",ar:"الْجِعِرَّانَةُ",badge:"⚬ Miqat",desc:"Tempat miqat pilihan Rasulullah SAW untuk umroh sunnah tambahan.",img:IMG_ZIARAH},
      {name:"Pemakaman Ma'la",ar:"مَقْبَرَةُ الْمُعَلَّى",badge:"📍 Ziarah",desc:"Pemakaman Khadijah binti Khuwailid dan Abdul Muthalib di Mekkah.",img:IMG_ZIARAH},
      {name:"Kawasan Maulid Nabi",ar:"مَوْلِدُ النَّبِيِّ ﷺ",badge:"⭐ Sejarah",desc:"Kawasan bersejarah di Mekkah diyakini sebagai lokasi kelahiran Nabi Muhammad SAW.",img:IMG_ZIARAH},
    ],
    hotel:[],
  };
  const FAQ_DEST = [
    {id:1,q:"Hotel SS Umroh di Madinah berapa jauh dari Masjid Nabawi?",a:"Jamaah SS Umroh menginap di Nozol Munawaroh, hanya 350m dari Masjid Nabawi — cukup jalan kaki 4–5 menit untuk setiap waktu sholat."},
    {id:2,q:"Hotel SS Umroh di Mekkah berapa jauh dari Masjidil Haram?",a:"Di Mekkah, jamaah menginap di Le Meridien Ajyad, hanya 350m dari Masjidil Haram — tawaf sunnah kapan saja tanpa shuttle."},
    {id:3,q:"Apakah jamaah bisa tawaf sunnah tambahan?",a:"Ya. Karena hotel 350m dari Masjidil Haram, jamaah bisa tawaf sunnah kapan saja — sendiri atau bersama rombongan."},
    {id:4,q:"Apa itu radiophone dan kenapa SS Umroh pakai?",a:"Earphone wireless 200m terhubung ke mic ustadz. Seluruh jamaah mendengar penjelasan dengan jelas bahkan di kerumunan jutaan orang."},
    {id:5,q:"Situs ziarah apa saja yang dikunjungi?",a:"Madinah: Masjid Nabawi, Raudhah, Baqi, Quba, Qiblatain, Jabal Uhud. Mekkah: Masjidil Haram, Ka'bah, Arafah, Mina, Muzdalifah, Jabal Nur, Ji'ranah."},
    {id:6,q:"Berapa lama durasi umroh SS Umroh?",a:"Durasi bervariasi tergantung paket. Hubungi CS kami di 0813-1201-7883 untuk jadwal dan durasi spesifik."},
    {id:7,q:"Maskapai apa yang digunakan?",a:"Saudi Airlines (direct), Garuda Indonesia (direct), dan Qatar Airways (via Doha). SS Umroh mengutamakan penerbangan direct."},
  ];
  return (
    <>
      <section className="page-hero" style={{minHeight:"70vh"}}>
        <div className="ph-bg" style={{backgroundImage:`url(${HERO_DESTINASI_BG})`}}/><div className="ph-pattern"/>
        <div style={{position:"absolute",top:"-6%",right:"-3%",width:"min(560px,58vw)",height:"min(560px,58vw)",background:"radial-gradient(ellipse,rgba(124,58,190,.28) 0%,transparent 68%)"}}/>
        <div style={{position:"absolute",bottom:"-8%",left:"-4%",width:"min(400px,42vw)",height:"min(400px,42vw)",background:"radial-gradient(ellipse,rgba(196,35,92,.15) 0%,transparent 68%)"}}/>
        <div className="container"><div className="ph-content">
          <nav className="breadcrumb">
            <button className="breadcrumb-link" onClick={()=>{setPage("home");window.scrollTo(0,0);}}>Beranda</button>
            <span className="breadcrumb-sep">›</span><span className="breadcrumb-cur">Destinasi</span>
          </nav>
          <h1 className="ph-h1">Mengenal Tanah Suci —<br/><em>Madinah, Mekkah</em> &amp; Situs Ziarah</h1>
          <p className="ph-sub">Panduan lengkap destinasi ibadah umroh SS Umroh. Setiap situs diceritakan dengan makna dan jarak dari hotel.</p>
          <div className="ph-badges">
            <span className="badge-hero ok">✓ Hotel 350m dari Masjid</span>
            <span className="badge-hero">📍 Madinah + Mekkah</span>
            <span className="badge-hero">📻 Radiophone 200m</span>
          </div>
          <div className="ph-ctas">
            <button className="btn-primary" onClick={()=>window.open(WA(),"_blank")}>💬 Konsultasi Paket</button>
          </div>
        </div></div>
      </section>

      {/* Tabs */}
      <div style={{background:"var(--p9)",borderBottom:"1px solid rgba(212,160,23,.13)",position:"sticky",top:"var(--nav-h)",zIndex:50}}>
        <div className="container">
          <div style={{display:"flex",overflowX:"auto",scrollbarWidth:"none"}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{display:"flex",alignItems:"center",gap:9,padding:"18px 24px",fontFamily:"var(--font-h)",fontSize:14,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,background:"none",border:"none",borderBottom:`2px solid ${activeTab===t.id?"var(--g6)":"transparent"}`,color:activeTab===t.id?"var(--g6)":"rgba(255,255,255,.5)",transition:"all .22s"}}>
                <span>{t.icon}</span>{t.label}
                <span style={{fontSize:11,background:"rgba(212,160,23,.14)",color:"var(--g6)",borderRadius:999,padding:"2px 8px",fontWeight:700}}>{t.count} Situs</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Panels */}
      {activeTab !== "hotel" && (
        <section style={{background:activeTab==="ziarah"?"var(--p0)":"var(--n0)",paddingBlock:"clamp(48px,7vw,88px)"}}>
          <div className="container">
            <div className="section-header" data-anim="slide-up">
              <span className="section-label">{TABS.find(t=>t.id===activeTab)?.label}</span>
              <h2 className="section-title">{activeTab==="madinah"?"Al-Madinah Al-Munawwarah":activeTab==="mekkah"?"Mekkah Al-Mukarramah":"Situs Ziarah Pilihan"}</h2>
              {activeTab==="madinah" && <p className="section-sub">Jamaah SS Umroh menginap di <strong>Nozol Munawaroh — 350m dari Masjid Nabawi.</strong></p>}
              {activeTab==="mekkah" && <p className="section-sub">Jamaah SS Umroh menginap di <strong>Le Meridien Ajyad — 350m dari Masjidil Haram.</strong></p>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
              {(SITES[activeTab]||[]).map((s,i)=>(
                <article key={s.name} style={{borderRadius:18,overflow:"hidden",background:"#fff",border:"1px solid var(--n1)",transition:"all .25s"}} data-anim="flip" data-delay={String((i%3+1)*100)}>
                  <div style={{height:180,background:s.img?`url(${s.img}) center/cover`:"linear-gradient(135deg,var(--p1),var(--g1))",position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {!s.img && <span style={{fontSize:40}}>🕌</span>}
                    {s.dist && <div style={{position:"absolute",bottom:10,left:10,background:"rgba(26,5,51,.88)",color:"var(--g6)",fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:999,fontFamily:"var(--font-h)"}}>{s.dist}</div>}
                  </div>
                  <div style={{padding:20}}>
                    <h3 style={{fontFamily:"var(--font-h)",fontSize:16,fontWeight:700,color:"var(--n9)",marginBottom:4}}>{s.name}</h3>
                    <p style={{fontSize:13,color:"var(--n6)",lineHeight:1.7}}>{s.desc}</p>
                    <span style={{display:"inline-flex",alignItems:"center",gap:5,background:"var(--ok-bg)",color:"var(--ok)",fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:999,marginTop:10,fontFamily:"var(--font-h)"}}>{s.badge}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeTab === "hotel" && (
        <section style={{background:"var(--n05)",paddingBlock:"clamp(48px,7vw,88px)"}}>
          <div className="container">
            <div className="section-header" data-anim="slide-up">
              <span className="section-label">Akomodasi</span>
              <h2 className="section-title">Hotel Dipilih Karena Satu Alasan: Jarak ke Masjid</h2>
              <p className="section-sub">Filosofi SS Umroh sederhana: hotel harus sedekat mungkin dari masjid agar jamaah bisa beribadah lebih banyak.</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
              {[
                {name:"Nozol Munawaroh",city:"Al-Madinah",stars:4,dist:"350m dari Masjid Nabawi",img:NABAWI_IMG,feats:["350m dari Masjid Nabawi — jalan kaki setiap sholat","Sarapan dan makan malam termasuk","Kamar standar bintang 4","WiFi tersedia"]},
                {name:"Le Meridien Ajyad",city:"Mekkah Al-Mukarramah",stars:5,dist:"350m dari Masjidil Haram",img:IMG_HARAM,feats:["350m dari Masjidil Haram — tawaf sunnah kapan saja","Hotel bintang 5 dengan view Masjidil Haram","Restoran menu halal internasional","Tersedia di paket Bintang 4"]},
              ].map((h,i)=>(
                <article key={h.name} style={{background:"#fff",border:"1px solid var(--n1)",borderRadius:20,overflow:"hidden"}} data-anim={i===0?"slide-right":"slide-left"}>
                  <div style={{height:220,background:h.img?`url(${h.img}) center/cover`:"linear-gradient(135deg,var(--p1),var(--g1))",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                    {!h.img && <span style={{fontSize:52}}>🕌</span>}
                    <div style={{position:"absolute",top:14,left:14,background:"linear-gradient(135deg,var(--g6),var(--g7))",color:"var(--p9)",fontSize:11,fontWeight:800,padding:"5px 12px",borderRadius:999,fontFamily:"var(--font-h)"}}>{h.city.split(" ")[0]}</div>
                  </div>
                  <div style={{padding:24}}>
                    <div style={{color:"var(--g6)",fontSize:14,letterSpacing:2,marginBottom:6}}>{"★".repeat(h.stars)}</div>
                    <h3 style={{fontFamily:"var(--font-h)",fontSize:20,fontWeight:700,color:"var(--n9)",marginBottom:4}}>{h.name}</h3>
                    <div style={{fontSize:12,fontWeight:700,color:"var(--p6)",textTransform:"uppercase",letterSpacing:".04em",marginBottom:14}}>{h.dist}</div>
                    {h.feats.map(f=>(<div key={f} style={{display:"flex",gap:9,fontSize:13,color:"var(--n6)",marginBottom:8}}><span>✓</span><span>{f}</span></div>))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <TestimonialsSection />
      <FAQSection items={FAQ_DEST} label="FAQ Destinasi" title="Pertanyaan Seputar Destinasi" />
      <CTABanner title="Setiap Destinasi Sudah Menunggu — Kapan Giliran Anda?" onSecondary={()=>{setPage("paket");window.scrollTo(0,0);}} />
      <TrustStrip />
    </>
  );
}

function KontakPage({ setPage }) {
  useScrollAnim();
  const [form, setForm] = useState({name:"",phone:"",email:"",topic:"",jamaah:"",message:""});
  const [openStatus, setOpenStatus] = useState("");
  const FAQ_KONTAK = [
    {id:1,q:"Bagaimana cara tercepat menghubungi SS Umroh?",a:"Via WhatsApp ke 0813-1201-7883. CS kami Bayu Muharram siap membalas selama jam kerja (Senin–Jumat 08.00–17.00, Sabtu 08.00–13.00 WIB)."},
    {id:2,q:"Apakah bisa konsultasi tanpa datang ke kantor?",a:"Ya. Hampir semua konsultasi bisa dilakukan via WhatsApp atau telepon. Kunjungan kantor diperlukan untuk penandatanganan dokumen."},
    {id:3,q:"Jam berapa kantor SS Umroh buka?",a:"Senin–Jumat 08.00–17.00 WIB, Sabtu 08.00–13.00 WIB. Hari Minggu dan libur nasional tutup."},
    {id:4,q:"Di mana kantor SS Umroh?",a:"Jl. Cihapit No. 41, Kota Bandung, Jawa Barat. Hubungi kami via WhatsApp terlebih dahulu untuk konfirmasi."},
    {id:5,q:"Apakah ada biaya untuk konsultasi?",a:"Tidak. Konsultasi dengan SS Umroh sepenuhnya gratis dan tanpa kewajiban apapun."},
    {id:6,q:"Apakah SS Umroh melayani jamaah di luar Bandung?",a:"Ya. Jamaah kami berasal dari seluruh Indonesia. Seluruh proses dapat dilakukan online via WhatsApp."},
    {id:7,q:"Berapa lama respons CS?",a:"CS SS Umroh merespons pesan WhatsApp dalam waktu singkat pada jam kerja. Di luar jam kerja, pesan dibalas saat kantor dibuka kembali."},
  ];

  useEffect(() => {
    const now = new Date();
    const wib = new Date(now.toLocaleString("en-US",{timeZone:"Asia/Jakarta"}));
    const day = wib.getDay(); const t = wib.getHours()*60+wib.getMinutes();
    const isOpen = (day>=1&&day<=5&&t>=480&&t<1020)||(day===6&&t>=480&&t<780);
    setOpenStatus(isOpen ? "🟢 Sekarang Buka" : "🔴 Sekarang Tutup");
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.topic || !form.message) { alert("Mohon lengkapi nama, nomor WA, topik, dan pesan."); return; }
    const text = encodeURIComponent(`Assalamu'alaikum SS Umroh,\n\n*Nama:* ${form.name}\n*No. WA:* ${form.phone}\n*Topik:* ${form.topic}\n${form.jamaah?`*Jamaah:* ${form.jamaah}\n`:""}\n*Pesan:*\n${form.message}`);
    window.open(`https://wa.me/${SITE_SETTINGS.wa}?text=${text}`,"_blank");
  };

  const inp = {width:"100%",background:"#fff",border:"1.5px solid var(--n1)",borderRadius:10,padding:"12px 16px",fontSize:14,fontFamily:"var(--font-b)",color:"var(--n9)",outline:"none",transition:"border-color .22s"};
  const fld = (label,key,type="text",placeholder="") => (
    <div style={{marginBottom:18}}>
      <label style={{fontSize:13,fontWeight:600,color:"var(--n7)",fontFamily:"var(--font-h)",display:"block",marginBottom:6}}>{label}</label>
      <input style={inp} type={type} placeholder={placeholder} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} onFocus={e=>e.target.style.borderColor="var(--p6)"} onBlur={e=>e.target.style.borderColor="var(--n1)"}/>
    </div>
  );

  return (
    <>
      <section className="page-hero" style={{minHeight:"56vh"}}>
        <div className="ph-bg" style={{backgroundImage:`url(${HERO_KONTAK_BG})`}}/><div className="ph-pattern"/><div className="ph-glow"/>
        <div className="container"><div className="ph-content">
          <nav className="breadcrumb">
            <button className="breadcrumb-link" onClick={()=>{setPage("home");window.scrollTo(0,0);}}>Beranda</button>
            <span className="breadcrumb-sep">›</span><span className="breadcrumb-cur">Kontak</span>
          </nav>
          <h1 className="ph-h1">Kami di Sini untuk Anda —<br/><em>Konsultasi Gratis,</em> Tanpa Tekanan</h1>
          <p className="ph-sub">Hubungi tim SS Umroh kapan saja. Kami tidak menjual dengan tekanan — kami mendengarkan, menjawab, dan membantu Anda.</p>
          <div className="ph-badges">
            <span className="badge-hero ok">✓ Respons Cepat via WhatsApp</span>
            <span className="badge-hero">📞 {SITE_SETTINGS.phone}</span>
          </div>
        </div></div>
      </section>

      {/* Contact Methods */}
      <div style={{background:"var(--p9)",paddingBlock:"clamp(40px,5vw,64px)",borderBottom:"1px solid rgba(212,160,23,.1)"}}>
        <div className="container">
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
            {[
              {href:WA(),icon:"💬",iconBg:"rgba(37,211,102,.15)",title:"WhatsApp",value:SITE_SETTINGS.phone,desc:`CS ${SITE_SETTINGS.cs_name} · Respons tercepat`,primary:true},
              {href:`tel:+${SITE_SETTINGS.wa}`,icon:"📞",iconBg:"rgba(124,58,190,.18)",title:"Telepon",value:SITE_SETTINGS.phone,desc:"Senin–Jumat 08.00–17.00 · Sabtu 08.00–13.00"},
              {href:"https://maps.google.com/?q=Jl.+Cihapit+No.+41+Bandung",icon:"📍",iconBg:"rgba(212,160,23,.12)",title:"Kunjungi Kantor",value:"Jl. Cihapit No. 41",desc:"Kota Bandung, Jawa Barat"},
            ].map(c=>(
              <a key={c.title} href={c.href} target={c.title==="Kunjungi Kantor"?"_blank":"_self"} rel="noopener"
                style={{background:c.primary?"rgba(37,211,102,.07)":"rgba(255,255,255,.05)",border:`1px solid ${c.primary?"rgba(37,211,102,.25)":"rgba(255,255,255,.08)"}`,borderRadius:18,padding:"28px 24px",display:"flex",flexDirection:"column",gap:14,textDecoration:"none",transition:"all .25s"}}
                data-anim="slide-up" data-delay={c.title==="WhatsApp"?"100":c.title==="Telepon"?"200":"300"}>
                <div style={{width:52,height:52,borderRadius:14,background:c.iconBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{c.icon}</div>
                <div>
                  <div style={{fontFamily:"var(--font-h)",fontSize:16,fontWeight:700,color:"#fff",marginBottom:4}}>{c.title}</div>
                  <div style={{fontSize:15,fontWeight:700,color:"var(--g6)",marginBottom:6}}>{c.value}</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,.5)"}}>{c.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Form + Info */}
      <section style={{background:"#fff",paddingBlock:"clamp(56px,8vw,96px)"}}>
        <div className="container">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"clamp(40px,5vw,72px)"}}>
            <div data-anim="slide-right">
              <div style={{background:"var(--n0)",border:"1px solid var(--n1)",borderRadius:20,padding:"clamp(28px,4vw,40px)"}}>
                <h2 style={{fontFamily:"var(--font-h)",fontSize:22,fontWeight:700,color:"var(--n9)",marginBottom:6}}>Kirim Pesan kepada Kami</h2>
                <p style={{fontSize:14,color:"var(--n6)",marginBottom:28,lineHeight:1.6}}>Formulir ini akan membuka WhatsApp dengan pesan terisi otomatis untuk respons lebih cepat.</p>
                <form onSubmit={handleSubmit}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                    {fld("Nama Lengkap *","name","text","Nama Anda")}
                    {fld("Nomor WhatsApp *","phone","tel","08xx-xxxx-xxxx")}
                  </div>
                  {fld("Email","email","email","email@anda.com")}
                  <div style={{marginBottom:18}}>
                    <label style={{fontSize:13,fontWeight:600,color:"var(--n7)",fontFamily:"var(--font-h)",display:"block",marginBottom:6}}>Topik *</label>
                    <select style={{...inp,backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237A7585' stroke-width='1.5' fill='none'/%3E%3C/svg%3E\")",backgroundRepeat:"no-repeat",backgroundPosition:"right 14px center",paddingRight:38,cursor:"pointer",appearance:"none"}}
                      value={form.topic} onChange={e=>setForm({...form,topic:e.target.value})}>
                      <option value="">Pilih topik...</option>
                      {["Paket Umroh Hemat","Paket Umroh Bintang 4","Tabungan Umroh","Umroh Korporat / Group","Halal Tour","Jadwal Keberangkatan","Lainnya"].map(o=><option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div style={{marginBottom:18}}>
                    <label style={{fontSize:13,fontWeight:600,color:"var(--n7)",fontFamily:"var(--font-h)",display:"block",marginBottom:6}}>Pesan *</label>
                    <textarea style={{...inp,resize:"vertical",minHeight:110,lineHeight:1.6}} placeholder="Ceritakan kebutuhan Anda — kapan ingin berangkat, budget, pertanyaan tentang paket..."
                      value={form.message} onChange={e=>setForm({...form,message:e.target.value})}/>
                  </div>
                  <button type="submit" style={{width:"100%",background:"var(--r6)",color:"#fff",fontSize:15,fontWeight:700,padding:"15px 28px",borderRadius:999,boxShadow:"var(--shadow-cta)",transition:"background .22s",fontFamily:"var(--font-h)",cursor:"pointer",border:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:9}}>
                    💬 Kirim via WhatsApp
                  </button>
                  <p style={{fontSize:12,color:"var(--n4)",textAlign:"center",marginTop:12}}>🔒 Data Anda aman. Kami tidak membagikan informasi Anda kepada pihak ketiga.</p>
                </form>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:20}} data-anim="slide-left">
              {/* Office Info */}
              <div style={{background:"var(--n05)",border:"1px solid var(--n1)",borderRadius:18,padding:24}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
                  <div style={{width:44,height:44,borderRadius:12,background:"linear-gradient(135deg,var(--p1),rgba(212,160,23,.1))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🏢</div>
                  <div style={{fontFamily:"var(--font-h)",fontSize:15,fontWeight:700,color:"var(--n9)"}}>Informasi Kantor</div>
                </div>
                {[["Nama","PT. Sarana Sadaya (SS Umroh)"],["Alamat","Jl. Cihapit No. 41, Kota Bandung"],["Telepon",SITE_SETTINGS.phone],["CS",SITE_SETTINGS.cs_name],["Izin",SITE_SETTINGS.ppiu]].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid var(--n1)",fontSize:13}}>
                    <span style={{color:"var(--n4)",fontWeight:500}}>{k}</span>
                    <span style={{color:"var(--n9)",fontWeight:600,textAlign:"right",maxWidth:"55%"}}>{v}</span>
                  </div>
                ))}
              </div>
              {/* Hours */}
              <div style={{background:"var(--n05)",border:"1px solid var(--n1)",borderRadius:18,padding:24}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                  <div style={{width:44,height:44,borderRadius:12,background:"linear-gradient(135deg,var(--p1),rgba(212,160,23,.1))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🕐</div>
                  <div>
                    <div style={{fontFamily:"var(--font-h)",fontSize:15,fontWeight:700,color:"var(--n9)"}}>Jam Operasional</div>
                    <div style={{fontSize:12,marginTop:4,fontWeight:700,fontFamily:"var(--font-h)"}}>{openStatus}</div>
                  </div>
                </div>
                {[["Senin–Jumat","08.00–17.00 WIB"],["Sabtu","08.00–13.00 WIB"],["Minggu","Tutup"]].map(([d,t])=>(
                  <div key={d} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid var(--n1)",fontSize:13}}>
                    <span style={{color:"var(--n6)",fontWeight:500}}>{d}</span>
                    <span style={{fontWeight:700,color:t==="Tutup"?"var(--n4)":"var(--ok)"}}>{t}</span>
                  </div>
                ))}
                <div style={{marginTop:14,padding:"12px 14px",background:"var(--g1)",border:"1px solid rgba(212,160,23,.25)",borderRadius:10,fontSize:12,color:"var(--g9)"}}>
                  💬 <strong>Di luar jam kantor?</strong> Kirim pesan WA — kami balas saat jam operasional dimulai.
                </div>
              </div>
              {/* CS Profile */}
              <div style={{background:"var(--n05)",border:"1px solid var(--n1)",borderRadius:18,padding:24}}>
                <div style={{display:"flex",alignItems:"center",gap:14,padding:14,background:"linear-gradient(135deg,var(--p0),var(--g1))",borderRadius:12,marginBottom:16}}>
                  <div style={{width:52,height:52,borderRadius:"50%",background:"linear-gradient(135deg,var(--p6),var(--g6))",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--font-h)",fontSize:18,fontWeight:700,color:"#fff",flexShrink:0}}>BM</div>
                  <div>
                    <div style={{fontFamily:"var(--font-h)",fontSize:15,fontWeight:700,color:"var(--n9)"}}>{SITE_SETTINGS.cs_name}</div>
                    <div style={{fontSize:12,color:"var(--p6)",fontWeight:600,marginBottom:2}}>Customer Service SS Umroh</div>
                    <div style={{fontSize:12,color:"var(--n4)"}}>Siap membantu dengan sabar &amp; profesional</div>
                  </div>
                </div>
                <a href={WA(`Assalamu%27alaikum%20Bayu%2C%20saya%20ingin%20konsultasi%20paket%20umroh.`)} target="_blank" rel="noopener"
                  style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"#25D366",color:"#fff",fontSize:14,fontWeight:700,padding:13,borderRadius:10,fontFamily:"var(--font-h)",textDecoration:"none"}}>
                  💬 Chat Langsung dengan {SITE_SETTINGS.cs_name}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section style={{background:"var(--p0)",paddingBlock:"clamp(48px,6vw,72px)"}}>
        <div className="container">
          <div className="section-header center" data-anim="slide-up">
            <span className="section-label">Lokasi Kantor</span>
            <h2 className="section-title">Temukan Kami di Bandung</h2>
          </div>
          <div style={{background:"#fff",border:"1px solid var(--n1)",borderRadius:20,overflow:"hidden"}} data-anim="scale">
            <div style={{padding:"24px 28px",borderBottom:"1px solid var(--n1)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
              <div>
                <div style={{fontFamily:"var(--font-h)",fontSize:18,fontWeight:700,color:"var(--n9)"}}>🏢 Kantor SS Umroh</div>
                <div style={{fontSize:13,color:"var(--n6)",marginTop:3}}>{SITE_SETTINGS.address}, Kota Bandung, Jawa Barat · PT. Sarana Sadaya</div>
              </div>
              <a href={WA("Saya%20ingin%20buat%20janji%20kunjungan%20ke%20kantor%20SS%20Umroh.")} target="_blank" rel="noopener"
                style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(37,211,102,.1)",border:"1px solid rgba(37,211,102,.25)",color:"#0a6e2e",fontSize:12,fontWeight:700,padding:"9px 16px",borderRadius:999,fontFamily:"var(--font-h)",textDecoration:"none"}}>
                💬 Buat Janji Kunjungan
              </a>
            </div>
            <div style={{height:360,background:"linear-gradient(135deg,var(--p0),var(--g1))",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div style={{textAlign:"center",padding:32}}>
                <span style={{fontSize:52,display:"block",marginBottom:14}}>📍</span>
                <h3 style={{fontFamily:"var(--font-h)",fontSize:20,fontWeight:700,color:"var(--p7)",marginBottom:8}}>{SITE_SETTINGS.address}</h3>
                <p style={{fontSize:15,color:"var(--n6)",marginBottom:20}}>Kota Bandung, Jawa Barat · PT. Sarana Sadaya</p>
                <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
                  <a href="https://maps.google.com/?q=Jl.+Cihapit+No.+41+Bandung" target="_blank" rel="noopener"
                    style={{display:"inline-flex",alignItems:"center",gap:8,background:"var(--p6)",color:"#fff",fontSize:13,fontWeight:700,padding:"11px 22px",borderRadius:999,fontFamily:"var(--font-h)",textDecoration:"none"}}>
                    📍 Buka Google Maps
                  </a>
                  <a href="https://waze.com/ul?q=Jl.+Cihapit+No.+41+Bandung" target="_blank" rel="noopener"
                    style={{display:"inline-flex",alignItems:"center",gap:8,border:"1.5px solid var(--p6)",color:"var(--p6)",fontSize:13,fontWeight:700,padding:"11px 22px",borderRadius:999,fontFamily:"var(--font-h)",textDecoration:"none"}}>
                    📷 Buka Waze
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WA Section */}
      <section style={{background:"linear-gradient(135deg,#0d4c23,#0a6e2e)",paddingBlock:"clamp(48px,6vw,72px)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,opacity:.06,backgroundImage:"repeating-linear-gradient(45deg,transparent,transparent 24px,rgba(255,255,255,1) 24px,rgba(255,255,255,1) 25px)"}}/>
        <div className="container" style={{position:"relative",zIndex:2}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:48,alignItems:"center"}}>
            <div data-anim="slide-right">
              <h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(24px,3vw,36px)",fontWeight:700,color:"#fff",marginBottom:12}}>Langsung Chat dengan Tim SS Umroh</h2>
              <p style={{fontSize:16,color:"rgba(255,255,255,.72)",lineHeight:1.75}}>WhatsApp adalah cara kami melayani paling cepat. CS kami Bayu Muharram siap menjawab pertanyaan Anda dengan sabar dan jelas.</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:10,marginTop:20}}>
                {["✓ Konsultasi gratis","✓ Tanpa tekanan","✓ Jawaban jelas"].map(b=>(
                  <span key={b} style={{background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.18)",color:"#fff",fontSize:12,fontWeight:600,padding:"6px 14px",borderRadius:999}}>{b}</span>
                ))}
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:14}} data-anim="slide-left">
              <a href={WA()} target="_blank" rel="noopener"
                style={{display:"flex",alignItems:"center",gap:14,background:"#fff",color:"#0a6e2e",fontSize:16,fontWeight:800,padding:"18px 24px",borderRadius:16,boxShadow:"0 8px 32px rgba(0,0,0,.15)",textDecoration:"none",fontFamily:"var(--font-h)"}}>
                <div style={{width:48,height:48,borderRadius:12,background:"#25D366",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,animation:"waPulse 2.5s ease-in-out infinite",flexShrink:0}}>💬</div>
                <div><div style={{fontSize:12,opacity:.7,display:"block",marginBottom:4}}>Chat WhatsApp Sekarang</div><span style={{fontSize:18}}>{SITE_SETTINGS.phone}</span></div>
              </a>
              <a href={`tel:+${SITE_SETTINGS.wa}`} style={{display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.18)",borderRadius:12,padding:"14px 18px",color:"#fff",fontSize:14,fontWeight:600,fontFamily:"var(--font-h)",textDecoration:"none"}}>
                📞 {SITE_SETTINGS.phone}
              </a>
              <div style={{display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.18)",borderRadius:12,padding:"14px 18px",color:"#fff",fontSize:14}}>
                📍 {SITE_SETTINGS.address}, Kota Bandung
              </div>
            </div>
          </div>
        </div>
      </section>

      <FAQSection items={FAQ_KONTAK} label="FAQ Kontak" title="Pertanyaan Sebelum Menghubungi" ctaText="Langsung Konsultasi?" ctaSub="Tidak perlu isi form — langsung chat WhatsApp dengan CS kami. Gratis, tanpa komitmen." />
      <CTABanner title="Satu Pesan — Perjalanan Ibadah Dimulai" sub="1.000+ jamaah per tahun. 0 gagal berangkat sejak 2012. Hubungi kami hari ini." primaryText="💬 Chat WhatsApp Sekarang" onSecondary={()=>{setPage("paket");window.scrollTo(0,0);}} secondaryText="Lihat Paket Umroh →" />
      <TrustStrip />
    </>
  );
}


function HalalTourPage({ setPage }) {
  useScrollAnim();
  const [activeTab, setActiveTab] = useState("attraction");
  const EXP_TABS = [
    { id:"attraction", icon:"⭐", label:"Top Attractions" },
    { id:"heritage",   icon:"🕌", label:"Islamic Heritage" },
    { id:"culinary",   icon:"🍱", label:"Halal Culinary" },
    { id:"shopping",   icon:"🛍", label:"Shopping" },
    { id:"nature",     icon:"🌿", label:"Nature" },
    { id:"culture",    icon:"🎭", label:"Culture" },
  ];
  const EXP_ITEMS = {
    attraction:[
      { ic:"🕌", t:"Blue Mosque Istanbul", d:"Masjid Sultan Ahmed — ikon Istanbul dengan 6 menara dan kubah berlapis biru. Sholat subuh di sini adalah pengalaman spiritual tak terlupakan.", badge:"Turki" },
      { ic:"🏰", t:"Hagia Sophia", d:"Katedral Byzantium yang kini menjadi masjid kembali. Arsitektur megah yang menyimpan sejarah panjang peradaban Islam di Eropa.", badge:"Turki" },
      { ic:"🏛", t:"Sheikh Zayed Mosque", d:"Masjid terbesar di UAE dengan kapasitas 40.000+ jamaah. Arsitektur marmer putih yang memukau di Abu Dhabi.", badge:"Dubai/UAE" },
      { ic:"🔶", t:"Registan Samarkand", d:"Tiga madrasah megah di alun-alun utama Samarkand — pusat ilmu pengetahuan Islam abad ke-14 di jalur sutra.", badge:"Uzbekistan" },
      { ic:"🗼", t:"Menara Eiffel + Mosque Paris", d:"Melihat Eiffel saat sunrise, lalu sholat dhuhur di Grande Mosquée de Paris — masjid bersejarah yang didirikan 1926.", badge:"Eropa" },
      { ic:"🌸", t:"Fuji & Senso-ji", d:"Keindahan Gunung Fuji yang ikonik dan kuil Senso-ji di Asakusa — dua ikon Jepang dalam satu paket perjalanan.", badge:"Jepang" },
    ],
    heritage:[
      { ic:"📚", t:"Makam Imam Bukhari", d:"Kota Samarkand menyimpan makam Imam Bukhari — perawi hadis paling masyhur. Ziarah yang penuh makna untuk umat Muslim.", badge:"Uzbekistan" },
      { ic:"🕌", t:"Masjid Al-Azhar Kairo", d:"Universitas Islam tertua di dunia, berdiri sejak 972 M. Pusat ilmu Islam selama lebih dari seribu tahun.", badge:"Mesir" },
      { ic:"🔮", t:"Masjid Hassan II Casablanca", d:"Masjid terbesar di Afrika dengan menara tertinggi di dunia (210m). Dibangun di tepi Samudera Atlantik.", badge:"Maroko" },
      { ic:"🏰", t:"Topkapi Palace Istanbul", d:"Bekas istana Kesultanan Ottoman — menyimpan relik Islam termasuk jubah, pedang, dan surat Nabi Muhammad SAW.", badge:"Turki" },
      { ic:"📖", t:"Kalan Minaret Bukhara", d:"Menara yang dibangun pada 1127 M — salah satu struktur Islam tertua yang masih berdiri sempurna di Asia Tengah.", badge:"Uzbekistan" },
      { ic:"🕍", t:"Fes Medina UNESCO", d:"Kota tua Islam terbesar yang masih hidup di dunia. Labirin gang sempit, toko pengrajin, dan masjid bersejarah.", badge:"Maroko" },
    ],
    culinary:[
      { ic:"🥙", t:"Kebab Turki Autentik", d:"Döner kebab, Adana kebab, dan baklava asli Turki. SS Umroh sudah memetakan restoran halal terbaik di setiap kota.", badge:"Turki · Halal 100%" },
      { ic:"🍣", t:"Japanese Halal Ramen & Sushi", d:"50+ restoran halal certified di Tokyo, Kyoto, dan Osaka — sudah dipetakan untuk jamaah SS Umroh.", badge:"Jepang · Halal Certified" },
      { ic:"🫕", t:"Tagine Maroko", d:"Tagine kambing, couscous, dan harira — masakan Maroko berbasis daging halal yang kaya rempah.", badge:"Maroko · Halal 100%" },
      { ic:"🥗", t:"Dubai Brunch Halal", d:"Seafood premium, mezze Arab, dan internasional cuisine di restoran halal bintang 5 Dubai.", badge:"Dubai · Halal Certified" },
      { ic:"🍽", t:"Halal Guide Eropa", d:"Di Paris, Amsterdam, Barcelona — 100+ restoran halal bersertifikasi yang nyaman untuk jamaah.", badge:"Eropa · Halal Guide" },
      { ic:"🍛", t:"Plov Uzbekistan", d:"Nasi pilaf dengan daging domba, wortel, dan rempah — makanan nasional Uzbekistan yang 100% halal.", badge:"Uzbekistan · Halal 100%" },
    ],
    shopping:[
      { ic:"🏪", t:"Grand Bazaar Istanbul", d:"Pasar tertutup terbesar di dunia — 4.000+ toko dengan karpet, rempah, perhiasan, dan cinderamata.", badge:"Turki" },
      { ic:"🏬", t:"Dubai Mall", d:"Mall terbesar di dunia dengan 1.200+ toko. Luxury brands, Aquarium Dubai, Dubai Fountain view.", badge:"Dubai" },
      { ic:"🛒", t:"Akihabara & Shibuya Tokyo", d:"Elektronik, fashion, dan produk unik Jepang. Banyak kosmetik dan makanan Jepang sudah halal certified.", badge:"Jepang" },
      { ic:"🪔", t:"Medina Souks Maroko", d:"Tanneries Fes, kerajinan tangan Marrakech, argan oil, dan karpet Berber.", badge:"Maroko" },
      { ic:"🏅", t:"Gold Souk Dubai", d:"Pasar emas terbesar di dunia. Perhiasan emas 18K–24K dengan harga kompetitif dan desain khas Arab.", badge:"Dubai" },
      { ic:"🎁", t:"Suvenir Uzbekistan", d:"Miniatur Registan, keramik Rischtan, sutra Margilan, dan topi lokal yang cantik dari jalur sutra.", badge:"Uzbekistan" },
    ],
    nature:[
      { ic:"🎈", t:"Hot Air Balloon Cappadocia", d:"Terbang di atas formasi batu peri Cappadocia saat matahari terbit — pengalaman yang selalu masuk bucket list.", badge:"Turki" },
      { ic:"🌊", t:"Pamukkale Thermal Pools", d:"Kolam air panas alami berwarna putih bersalju — keajaiban alam Turki yang dikenal sebagai Kastil Kapas.", badge:"Turki" },
      { ic:"🏔", t:"Gunung Fuji", d:"Gunung paling ikonik di Asia. Pemandangan dari Hakone atau Kawaguchiko yang memantulkan Fuji di danau.", badge:"Jepang" },
      { ic:"🐪", t:"Sahara Desert Camp", d:"Berkemah di padang pasir Sahara, naik unta, dan menyaksikan bintang malam paling terang di Afrika.", badge:"Maroko" },
      { ic:"🌺", t:"Keukenhof Tulip Garden", d:"7 juta bunga tulip di atas 32 hektar — taman bunga paling indah di dunia, hanya buka Maret–Mei.", badge:"Belanda" },
      { ic:"🏖", t:"Pantai Langkawi", d:"Pantai tropis Malaysia dengan air biru jernih, mangrove tour, dan Sky Bridge.", badge:"Malaysia" },
    ],
    culture:[
      { ic:"🎭", t:"Pertunjukan Tari Sufi", d:"Sema Ceremony — tarian sufi Mevlevi yang memukau di Konya. Ritual spiritual yang penuh makna dalam budaya Islam.", badge:"Turki" },
      { ic:"🌸", t:"Matcha Ceremony Jepang", d:"Upacara teh Jepang yang penuh ketenangan. Pengalaman budaya unik dan cocok untuk wisatawan Muslim.", badge:"Jepang" },
      { ic:"🎶", t:"Musik Gnawa Maroko", d:"Musik Gnawa dan Chaabi di Jemaa el-Fna — alun-alun Marrakech yang hidup dengan pertunjukan budaya setiap malam.", badge:"Maroko" },
      { ic:"👘", t:"Hanbok & K-Culture Seoul", d:"Mencoba hanbok di Istana Gyeongbokgung dan menikmati musik tradisional Korea yang kaya.", badge:"Korea Selatan" },
      { ic:"🏺", t:"Pengrajin Keramik Uzbekistan", d:"Bengkel keramik tradisional di Rischtan — melihat langsung proses pembuatan piring khas Uzbekistan.", badge:"Uzbekistan" },
      { ic:"🎨", t:"Arabic Calligraphy Workshop", d:"Workshop kaligrafi Arab di Istanbul — belajar seni tulis Islam dari seniman lokal.", badge:"Turki" },
    ],
  };
  const GALLERY_IMGS = [
    { src:"https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=600&q=80", alt:"Blue Mosque Istanbul" },
    { src:"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80", alt:"Burj Khalifa Dubai" },
    { src:"https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=600&q=80", alt:"Fushimi Inari Kyoto" },
    { src:"https://images.unsplash.com/photo-1596401057633-54a8c8e30b0b?auto=format&fit=crop&w=600&q=80", alt:"Registan Samarkand" },
    { src:"https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80", alt:"Menara Eiffel Paris" },
    { src:"https://images.unsplash.com/photo-1489493887464-892be6d1daae?auto=format&fit=crop&w=600&q=80", alt:"Medina Marrakech Maroko" },
    { src:"https://images.unsplash.com/photo-1539768942893-daf53e448371?auto=format&fit=crop&w=600&q=80", alt:"Piramida Giza Mesir" },
    { src:"https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=600&q=80", alt:"Gyeongbokgung Palace Seoul" },
    { src:"https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=600&q=80", alt:"Twin Towers Kuala Lumpur" },
  ];
  const TL_STEPS = [
    { n:"1", ic:"💬", t:"Konsultasi Gratis", d:"Hubungi CS kami Bayu Muharram via WhatsApp. Ceritakan impian perjalanan Anda — destinasi, budget, durasi, jumlah peserta. Kami mendengarkan tanpa tekanan.", badge:"✓ Gratis, tanpa komitmen" },
    { n:"2", ic:"📋", t:"Penawaran & Itinerary", d:"Tim kami menyiapkan proposal perjalanan lengkap: itinerary harian, breakdown biaya, hotel pilihan, restoran halal, dan jadwal sholat. Semua transparan.", badge:"✓ Dalam 24 jam kerja" },
    { n:"3", ic:"✍️", t:"Pendaftaran & DP", d:"Setujui itinerary, tanda tangani perjanjian, dan bayar uang muka untuk mengamankan kursi. Bisa dicicil atau lunas sesuai kemampuan Anda.", badge:"✓ Cicilan tersedia" },
    { n:"4", ic:"🗂", t:"Persiapan Perjalanan", d:"SS Umroh mengurus visa, tiket pesawat, hotel, dan asuransi. Anda menerima travel kit berisi panduan destinasi, daftar packing, dan tips halal travel.", badge:"✓ Visa & dokumen kami urus" },
    { n:"5", ic:"✈️", t:"Keberangkatan", d:"Berangkat dari bandara pilihan bersama tour leader berpengalaman. Check-in bersama, boarding bersama — tidak ada yang tertinggal.", badge:"✓ Tour leader dedicated" },
    { n:"6", ic:"✓", t:"Pulang dengan Kenangan Terbaik", d:"Tiba di tanah air dengan galeri foto indah, kenangan tak terlupakan, dan hati yang dipenuhi syukur. SS Umroh siap merencanakan perjalanan berikutnya.", badge:"✓ 1.000+ wisatawan puas" },
  ];
  const waHT = (msg) => WA(msg || "Assalamu%27alaikum%20SS%20Umroh%2C%20saya%20ingin%20konsultasi%20Halal%20Tour.");

  return (
    <>
      {/* ── HERO ── */}
      <section className="page-hero" style={{minHeight:"92vh"}}>
        <div className="ph-bg" style={{backgroundImage:"url('https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1920&q=85')",backgroundPosition:"center 45%"}}/>
        <div className="ph-pattern"/>
        <div className="ph-glow"/>
        <div style={{position:"absolute",bottom:"-8%",left:"-4%",width:"min(400px,42vw)",height:"min(400px,42vw)",background:"radial-gradient(ellipse,rgba(196,35,92,.15) 0%,transparent 68%)"}}/>
        <div className="container">
          <div className="ph-content" style={{maxWidth:760}}>
            <nav className="breadcrumb">
              <button className="breadcrumb-link" onClick={()=>{setPage("home");window.scrollTo(0,0);}}>Beranda</button>
              <span className="breadcrumb-sep">›</span>
              <span className="breadcrumb-cur">Halal Tour</span>
            </nav>
            <h1 className="ph-h1">Jelajahi Dunia dengan<br/>Nyaman, Aman, dan<br/><em>Sesuai Syariah</em></h1>
            <p className="ph-sub">Nikmati pengalaman wisata halal ke berbagai destinasi pilihan dengan itinerary yang dirancang khusus untuk memberikan kenyamanan beribadah, kuliner halal, akomodasi berkualitas, dan pengalaman perjalanan yang berkesan.</p>
            <div className="ph-badges">
              <span className="badge-hero ok">✔ Muslim Friendly</span>
              <span className="badge-hero">🍱 Halal Food</span>
              <span className="badge-hero">🏨 Hotel Pilihan</span>
              <span className="badge-hero">🎒 Tour Leader</span>
              <span className="badge-hero">📋 Itinerary Ramah Muslim</span>
            </div>
            <div className="ph-ctas">
              <button className="btn-primary" onClick={()=>document.getElementById("ht-paket")?.scrollIntoView({behavior:"smooth"})}>🌍 Lihat Paket Halal Tour</button>
              <button className="btn-outline" onClick={()=>window.open(waHT(),"_blank")}>💬 Konsultasi Gratis</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED DESTINATIONS ── */}
      <section style={{background:"var(--n0)",paddingBlock:"clamp(56px,8vw,96px)"}}>
        <div className="container">
          <div className="section-header center" data-anim="slide-up">
            <span className="section-label">Destinasi Pilihan</span>
            <h2 className="section-title">10 Destinasi Halal Tour Terpopuler</h2>
            <p className="section-sub">Dari masjid bersejarah Istanbul hingga keindahan alam Jepang yang damai — setiap destinasi dipilih dengan mempertimbangkan ketersediaan fasilitas halal terbaik.</p>
          </div>
          <div className="dest-grid-10" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:18}}>
            {HALAL_DESTINATIONS.map((d,i) => (
              <article className="dest-card" key={d.id} data-anim="flip" data-delay={String((i%5+1)*100)}>
                <div className="dest-card-img">
                  <img src={d.img} alt={d.name} loading="lazy"/>
                  <div className="dest-card-badge">{d.badge}</div>
                </div>
                <div className="dest-card-body">
                  <div className="dest-card-flag">{d.flag}</div>
                  <div className="dest-card-name">{d.name}</div>
                  <p className="dest-card-desc">{d.desc}</p>
                  <div className="dest-card-meta">
                    <span className="dest-meta-chip">⏱ {d.dur}</span>
                    <span className="dest-meta-chip">🌤 {d.season}</span>
                  </div>
                  <div className="dest-card-price">Mulai <strong>{d.price}</strong>/orang</div>
                  <a href={waHT(`Saya%20tertarik%20Halal%20Tour%20${encodeURIComponent(d.name)}%20SS%20Umroh.`)} className="dest-card-cta" target="_blank" rel="noopener">Lihat Detail →</a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE ── */}
      <section style={{background:"#fff",paddingBlock:"clamp(56px,8vw,96px)"}}>
        <div className="container">
          <div className="section-header center" data-anim="slide-up">
            <span className="section-label">Keunggulan Halal Tour SS Umroh</span>
            <h2 className="section-title">Bukan Wisata Biasa — Wisata yang <em style={{fontStyle:"normal",background:"linear-gradient(135deg,var(--p6),var(--g6))",WebkitBackgroundClip:"text",backgroundClip:"text",WebkitTextFillColor:"transparent"}}>Memuliakan</em></h2>
            <p className="section-sub">Setiap detail perjalanan kami rancang mempertimbangkan kebutuhan unik wisatawan Muslim.</p>
          </div>
          <div className="why-grid-10" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:18}}>
            {[
              ["🏨","Hotel Ramah Muslim","Hotel dengan fasilitas kiblat, sajadah, Al-Quran, dan waktu sholat di kamar.","Muslim Friendly"],
              ["🍱","Restoran Halal","Setiap destinasi sudah terpetakan restoran halal bersertifikasi.","Halal Certified"],
              ["🕌","Jadwal Sholat Terjaga","Itinerary menghormati waktu sholat 5 waktu dengan masjid terdekat.","Prayer Friendly"],
              ["🌍","Destinasi Pilihan","Hanya destinasi yang terbukti ramah Muslim — sudah disurvei fasilitas halal.","Curated"],
              ["🚌","Transportasi Nyaman","Bus AC, private van — semua armada dipilih untuk kenyamanan keluarga Muslim.","Comfort Transport"],
              ["🎒","Tour Leader Profesional","Fasih bahasa setempat, paham kebutuhan Muslim, siap membantu 24 jam.","Expert Guide"],
              ["👥","Small Group Experience","Maksimal 25 orang per grup untuk pengalaman yang lebih personal.","Max 25 Orang"],
              ["👨‍👩‍👧‍👦","Family Friendly","Itinerary mempertimbangkan kebutuhan anak-anak dan lansia.","All Ages"],
              ["⭐","Luxury Accommodation","Hotel bintang 4–5 di setiap destinasi untuk perjalanan yang berkesan.","Bintang 4–5"],
              ["📋","Flexible Itinerary","Itinerary bisa dikustomisasi sesuai kebutuhan perjalanan Anda.","Customizable"],
            ].map(([ic,t,d,badge],i) => (
              <article className="k-card" key={t} data-anim="flip" data-delay={String((i%5+1)*100)}>
                <div className="k-icon">{ic}</div>
                <h3 className="k-title">{t}</h3>
                <p className="k-body">{d}</p>
                <span className="k-tag">{badge}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── PACKAGE CARDS ── */}
      <section id="ht-paket" style={{background:"var(--n05)",paddingBlock:"clamp(56px,8vw,96px)"}}>
        <div className="container">
          <div className="section-header center" data-anim="slide-up">
            <span className="section-label">Paket Halal Tour</span>
            <h2 className="section-title">Pilih Paket yang Tepat untuk Perjalanan Anda</h2>
            <p className="section-sub">Semua paket dirancang dengan standar halal: hotel Muslim friendly, kuliner halal, jadwal sholat terjaga, dan tour leader berpengalaman.</p>
          </div>
          <div className="pkg-grid-3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:22}}>
            {HALAL_PACKAGES.map((pkg,i) => (
              <article key={pkg.id} className={`ht-pkg-card${pkg.featured?" featured":""}`} data-anim="flip" data-delay={String((i%3+1)*100)}>
                <div className="ht-pkg-img">
                  <img src={pkg.img} alt={pkg.name} loading="lazy"/>
                  <span className="ht-pkg-tag">{pkg.tag}</span>
                  <span className="ht-pkg-seats">🪑 Sisa {pkg.seats} kursi</span>
                </div>
                <div className="ht-pkg-body">
                  <div className="ht-pkg-country">{pkg.country}</div>
                  <div className="ht-pkg-name">{pkg.name}</div>
                  <div className="ht-pkg-metas">{pkg.metas.map(m=><span key={m} className="ht-pkg-meta">{m}</span>)}</div>
                  <p className="ht-pkg-highlights">{pkg.highlights}</p>
                  <div className="ht-pkg-price-row">
                    <div><div className="ht-pkg-label">Mulai dari</div><div className="ht-pkg-price">{pkg.price}<span className="ht-pkg-unit">/orang</span></div></div>
                  </div>
                  <div className="ht-pkg-ctas">
                    <a href={waHT(`Saya%20tertarik%20${encodeURIComponent(pkg.name)}.`)} className="ht-pkg-btn-wa" target="_blank" rel="noopener">💬 Konsultasi</a>
                    <button className="ht-pkg-btn-det" onClick={()=>window.open(waHT(),"_blank")}>Detail →</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:32}} data-anim="fade">
            <button className="btn-primary" onClick={()=>window.open(waHT("Saya%20ingin%20melihat%20semua%20paket%20Halal%20Tour%20SS%20Umroh."),"_blank")}>💬 Lihat Semua Paket via WhatsApp</button>
          </div>
        </div>
      </section>

      {/* ── EXPERIENCE TABS ── */}
      <section style={{background:"var(--p0)",paddingBlock:"clamp(56px,8vw,96px)"}}>
        <div className="container">
          <div className="section-header center" data-anim="slide-up">
            <span className="section-label">Pengalaman Perjalanan</span>
            <h2 className="section-title">Apa yang Akan Anda Rasakan di Setiap Destinasi</h2>
            <p className="section-sub">Setiap aspek perjalanan kami rancang memberikan pengalaman terbaik bagi wisatawan Muslim.</p>
          </div>
          <div className="exp-tabs" role="tablist">
            {EXP_TABS.map(t => (
              <button key={t.id} role="tab" aria-selected={activeTab===t.id} className={`exp-tab${activeTab===t.id?" active":""}`} onClick={()=>setActiveTab(t.id)}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <div className="exp-grid-3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18}}>
            {(EXP_ITEMS[activeTab]||[]).map((it,i) => (
              <article className="k-card" key={it.t} data-anim="flip" data-delay={String((i%3+1)*100)}>
                <div className="k-icon">{it.ic}</div>
                <h3 className="k-title">{it.t}</h3>
                <p className="k-body">{it.d}</p>
                <span className="k-tag">{it.badge}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section style={{background:"#fff",paddingBlock:"clamp(56px,8vw,96px)"}}>
        <div className="container">
          <div className="section-header center" data-anim="slide-up">
            <span className="section-label">Perjalanan Anda Bersama Kami</span>
            <h2 className="section-title">Dari Konsultasi hingga Pulang dengan Kenangan Indah</h2>
            <p className="section-sub">Proses perjalanan bersama SS Umroh dirancang mudah, transparan, dan penuh perhatian di setiap langkah.</p>
          </div>
          <div className="timeline" data-anim="fade">
            {TL_STEPS.map((s,i) => (
              <div key={s.n} className="tl-item" style={i===TL_STEPS.length-1?{paddingBottom:0}:{}}>
                <div className="tl-dot">{s.n}</div>
                <div className="tl-num">Langkah 0{s.n}</div>
                <div className="tl-title">{s.ic} {s.t}</div>
                <p className="tl-desc">{s.d}</p>
                <span className="tl-badge">{s.badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section style={{background:"var(--n05)",paddingBlock:"clamp(56px,8vw,96px)"}}>
        <div className="container">
          <div className="section-header center" data-anim="slide-up">
            <span className="section-label">Galeri Perjalanan</span>
            <h2 className="section-title">Sekilas Keindahan di Setiap Destinasi</h2>
            <p className="section-sub">Setiap foto adalah cerita nyata dari perjalanan jamaah SS Umroh yang merasakan pengalaman halal tour premium.</p>
          </div>
          <div className="gallery-grid" data-anim="fade">
            {GALLERY_IMGS.map((img,i) => (
              <div key={i} className="gallery-item">
                <img src={img.src} alt={img.alt} loading="lazy"/>
                <div className="gallery-overlay"><span className="gallery-overlay-icon">🔍</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VIDEO ── */}
      <section style={{background:"var(--p9)",paddingBlock:"clamp(48px,7vw,88px)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,var(--g6),transparent)"}}/>
        <div style={{position:"absolute",top:"-10%",right:"-5%",width:"min(480px,50vw)",height:"min(480px,50vw)",background:"radial-gradient(ellipse,rgba(124,58,190,.22) 0%,transparent 68%)",pointerEvents:"none"}}/>
        <div className="container" style={{position:"relative",zIndex:2}}>
          <div className="section-header center" data-anim="slide-up">
            <span className="section-label" style={{color:"var(--g6)"}}>Video Perjalanan</span>
            <h2 className="section-title" style={{color:"#fff"}}>Rasakan Sebelum Berangkat</h2>
            <p className="section-sub" style={{color:"rgba(255,255,255,.55)"}}>Tonton kisah nyata wisatawan dan jelajahi destinasi impian Anda sebelum memutuskan.</p>
          </div>
          <div className="video-grid">
            {[
              { img:"https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=700&q=80", label:"🇹🇷 Halal Tour Turki — Highlights" },
              { img:"https://images.unsplash.com/photo-1596401057633-54a8c8e30b0b?auto=format&fit=crop&w=700&q=80", label:"🕌 Islamic Heritage Uzbekistan" },
              { img:"https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=700&q=80", label:"🍱 Halal Food Guide Jepang" },
            ].map((v,i) => (
              <div key={i} className="vid-card" data-anim="scale" data-delay={String((i+1)*100)} onClick={()=>window.open(waHT(),"_blank")}>
                <img src={v.img} alt={v.label} loading="lazy"/>
                <div className="vid-overlay">
                  <div className="vid-play">▶</div>
                  <span className="vid-label">{v.label}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:28}} data-anim="fade">
            <button className="btn-outline" onClick={()=>window.open(waHT("Saya%20ingin%20melihat%20video%20halal%20tour%20SS%20Umroh."),"_blank")}>💬 Minta Video Lengkap via WhatsApp</button>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <TestimonialsSection items={HALAL_TESTIMONIALS} />

      {/* ── FAQ ── */}
      <FAQSection
        items={FAQ_HALAL}
        label="FAQ Halal Tour"
        title="Pertanyaan yang Sering Diajukan"
        sub="Semua yang perlu Anda ketahui sebelum mendaftar halal tour bersama SS Umroh."
        ctaText="Masih ada pertanyaan?"
        ctaSub="Konsultan kami siap membantu memilih destinasi terbaik sesuai kebutuhan dan anggaran Anda."
      />

      {/* ── CTA BANNER ── */}
      <section className="cta-banner" aria-label="Call to action halal tour">
        <div className="cta-glow"/>
        <div className="container" style={{position:"relative",zIndex:2}}>
          <div className="cta-inner" data-anim="slide-up">
            <span className="section-label">Mulai Perjalanan Anda</span>
            <h2 className="section-title">Siap Merencanakan Liburan Halal Impian Anda?</h2>
            <p className="section-sub">Konsultan kami siap membantu memilih destinasi terbaik sesuai kebutuhan, anggaran, dan preferensi perjalanan Anda.</p>
            <div className="cta-btns" data-anim="slide-up" style={{marginTop:28}}>
              <button className="btn-primary" onClick={()=>window.open(waHT(),"_blank")}>💬 WhatsApp · Konsultasi Gratis</button>
              <a href="tel:+6281312017883" className="btn-outline">📞 0813-1201-7883</a>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:10,justifyContent:"center",marginTop:24}} data-anim="fade">
              <span className="badge-hero ok">✓ SK PPIU No.U.108/2021</span>
              <span className="badge-hero">✔ Muslim Friendly</span>
              <span className="badge-hero">🍱 Halal Food Guaranteed</span>
              <span className="badge-hero">🛡 Asuransi Perjalanan</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── RELATED SERVICES ── */}
      <section style={{background:"var(--n05)",paddingBlock:"clamp(56px,7vw,88px)"}}>
        <div className="container">
          <div className="section-header center" data-anim="slide-up">
            <span className="section-label">Layanan SS Umroh</span>
            <h2 className="section-title">Layanan Perjalanan Religi & Wisata Lainnya</h2>
          </div>
          <div className="rel-services-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:18}}>
            {[
              { page:"paket", ic:"🕌", n:"Umroh", d:"Hotel 350m dari masjid. Direct flight. Ustadz berpengalaman. 0 gagal berangkat sejak 2012.", arr:"Lihat Paket Umroh →" },
              { page:"halaltour", ic:"🌍", n:"Halal Tour", d:"Wisata halal premium ke 10+ negara. Muslim friendly, kuliner halal, jadwal sholat terjaga.", arr:"Halaman Ini ✓", active:true },
              { page:"korporat", ic:"🏢", n:"Korporat & Group", d:"Program umroh dan halal tour untuk perusahaan, instansi, dan komunitas.", arr:"Lihat Program Korporat →" },
              { page:"kontak", ic:"💬", n:"Custom Tour", d:"Tidak menemukan paket sesuai? Kami rancang itinerary khusus sesuai kebutuhan Anda.", arr:"Konsultasi Custom Tour →" },
            ].map(r => (
              <button key={r.page} className="rel-card" data-anim="flip" onClick={()=>{setPage(r.page);window.scrollTo(0,0);}}
                style={{textAlign:"left",background:r.active?"var(--p0)":"#fff",border:r.active?"2px solid var(--p6)":"1px solid var(--n1)"}}>
                <div className="rel-icon" style={r.active?{background:"linear-gradient(135deg,var(--p6),var(--g6))"}:{}}>{r.ic}</div>
                <div className="rel-name">{r.n}</div>
                <p className="rel-desc">{r.d}</p>
                <span className="rel-arr">{r.arr}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <TrustStrip />
    </>
  );
}

export default function App() {
  const [page, setPage] = useState("home");

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const pages = {
    home: <HomePage setPage={setPage} />,
    paket: <PaketUmrohPage setPage={setPage} />,
    halaltour: <HalalTourPage setPage={setPage} />,
    korporat: <KorporatPage setPage={setPage} />,
    tentang: <TentangKamiPage setPage={setPage} />,
    destinasi: <DestinasiPage setPage={setPage} />,
    kontak: <KontakPage setPage={setPage} />,
  };

  return (
    <div>
      <a href="#main" style={{position:"absolute",width:1,height:1,overflow:"hidden",clip:"rect(0,0,0,0)"}}>Lewati ke konten</a>
      <Nav currentPage={page} setPage={setPage} />
      <main id="main">
        {pages[page] || pages.home}
      </main>
      <Footer setPage={setPage} />
      {/* WA Float */}
      <div className="wa-wrap">
        <span className="wa-lbl">Konsultasi Gratis</span>
        <a href={WA()} target="_blank" rel="noopener" className="wa-btn" aria-label="Chat WhatsApp">💬</a>
      </div>
      {/* Mobile Bottom Bar */}
      <div className="mob-bar">
        <a href={`tel:+${SITE_SETTINGS.wa}`} className="mob-tel">📞 {SITE_SETTINGS.phone}</a>
        <a href={WA()} target="_blank" rel="noopener" className="mob-wa-btn">💬 Konsultasi via WhatsApp</a>
      </div>
    </div>
  );
}