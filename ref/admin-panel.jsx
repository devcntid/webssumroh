
import { useState } from "react";
import {
  LayoutDashboard, Settings, Package, Calendar, Globe, Map, Star,
  HelpCircle, Image, Users, Mail, Building2, UserCog, ClipboardList,
  Plus, Edit2, Trash2, Eye, Check, Search, Download, LogOut, Bell,
  ChevronRight, GripVertical, CheckCircle, AlertTriangle, X, Save,
  Upload, MessageSquare, Phone, AlertCircle, Star as StarFill
} from "lucide-react";
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

// ── Brand tokens ─────────────────────────────────────────────────
const T = {
  sb: "#1A0533", sbActive: "rgba(212,160,23,.18)", sbText: "rgba(255,255,255,.62)", sbGold: "#D4A017",
  pu: "#7C3ABE", pl: "#EFE2FB", pk: "#C4235C", gd: "#D4A017", gl: "#FEF6DC",
  ok: "#0F6B45", er: "#DC2626",
};

// ── Mock data ─────────────────────────────────────────────────────
let _id = 200;
const uid = () => ++_id;

const M_SETTINGS = { phone_display:"0813-1201-7883", whatsapp_number:"6281312017883", office_address:"Jl. Cihapit No. 41, Kota Bandung 40114", cs_name:"Bayu Muharram", ppiu_license:"SK PPIU No. U.108 Tahun 2021" };

const M_PACKAGES = [
  { id:1, slug:"hemat",    name:"Umroh Hemat",     category:"hemat",    tag_line:"Terjangkau",   hotel_distance_m:500, flight_type:"Direct ✈", price_mode:"contact", price_display_text:"Hubungi CS", is_featured:false, is_active:true,  display_order:1 },
  { id:2, slug:"bintang4", name:"Umroh Bintang 4", category:"bintang4", tag_line:"Paling Populer",hotel_distance_m:350, flight_type:"Direct ✈", price_mode:"contact", price_display_text:"Hubungi CS", is_featured:true,  is_active:true,  display_order:2 },
  { id:3, slug:"tabungan", name:"Tabungan Umroh",  category:"tabungan", tag_line:"Cicilan Syariah",hotel_distance_m:350, flight_type:"Direct ✈", price_mode:"contact", price_display_text:"Hubungi CS", is_featured:false, is_active:true,  display_order:3 },
  { id:4, slug:"ramadhan", name:"Umroh Ramadhan",  category:"ramadhan", tag_line:"Bulan Mulia",   hotel_distance_m:350, flight_type:"Direct ✈", price_mode:"contact", price_display_text:"Hubungi CS", is_featured:false, is_active:true,  display_order:4 },
  { id:5, slug:"group",    name:"Umroh Group",     category:"group",    tag_line:"Min. 10 Orang", hotel_distance_m:350, flight_type:"Direct ✈", price_mode:"contact", price_display_text:"Hubungi CS", is_featured:false, is_active:false, display_order:5 },
];
const M_SCHEDULES = [
  { id:1, package_name:"Umroh Hemat",     departure_date:"2025-09-10", return_date:"2025-09-19", departure_city:"CGK", airline:"Saudi Airlines",  total_seats:45, seats_remaining:32, status:"upcoming" },
  { id:2, package_name:"Umroh Bintang 4", departure_date:"2025-09-03", return_date:"2025-09-12", departure_city:"CGK", airline:"Garuda Indonesia", total_seats:40, seats_remaining:4,  status:"upcoming" },
  { id:3, package_name:"Umroh Hemat",     departure_date:"2025-10-08", return_date:"2025-10-17", departure_city:"CGK", airline:"Garuda Indonesia", total_seats:45, seats_remaining:41, status:"upcoming" },
  { id:4, package_name:"Umroh Bintang 4", departure_date:"2025-10-01", return_date:"2025-10-10", departure_city:"CGK", airline:"Saudi Airlines",  total_seats:40, seats_remaining:22, status:"upcoming" },
  { id:5, package_name:"Umroh Ramadhan",  departure_date:"2026-02-20", return_date:"2026-03-01", departure_city:"CGK", airline:"Saudi Airlines",  total_seats:45, seats_remaining:45, status:"upcoming" },
  { id:6, package_name:"Umroh Bintang 4", departure_date:"2025-07-01", return_date:"2025-07-10", departure_city:"BDO", airline:"Garuda Indonesia", total_seats:38, seats_remaining:0,  status:"completed" },
];
const M_HALAL_DEST = [
  { id:1, country_name:"Turki",          flag_emoji:"🇹🇷", badge_label:"🔥 Terpopuler",    duration_text:"10D7N", starting_price_text:"Rp 15,5 Jt", is_active:true,  display_order:1 },
  { id:2, country_name:"Jepang",         flag_emoji:"🇯🇵", badge_label:"⭐ Premium",        duration_text:"9D6N",  starting_price_text:"Rp 22 Jt",   is_active:true,  display_order:2 },
  { id:3, country_name:"Korea Selatan",  flag_emoji:"🇰🇷", badge_label:"✨ Trending",       duration_text:"7D5N",  starting_price_text:"Rp 17 Jt",   is_active:true,  display_order:3 },
  { id:4, country_name:"Uzbekistan",     flag_emoji:"🇺🇿", badge_label:"🕌 Islamic Heritage",duration_text:"8D6N",  starting_price_text:"Rp 14 Jt",   is_active:true,  display_order:4 },
  { id:5, country_name:"Dubai",          flag_emoji:"🇦🇪", badge_label:"💎 Luxury",         duration_text:"6D4N",  starting_price_text:"Rp 13 Jt",   is_active:true,  display_order:5 },
  { id:6, country_name:"Mesir",          flag_emoji:"🇪🇬", badge_label:"🏛 Peradaban",      duration_text:"9D7N",  starting_price_text:"Rp 16 Jt",   is_active:false, display_order:6 },
];
const M_HALAL_PKGS = [
  { id:1, name:"Halal Tour Turki — Istanbul & Cappadocia", tag_line:"🇹🇷 Best Seller",  is_featured:true,  seats_remaining:4,  price_display_text:"Rp 15,5 Jt", departure_month:"Feb 2026", is_active:true },
  { id:2, name:"Halal Tour Dubai & Abu Dhabi",             tag_line:"🇦🇪 Luxury Escape", is_featured:false, seats_remaining:20, price_display_text:"Rp 13 Jt",   departure_month:"Jan 2026", is_active:true },
  { id:3, name:"Halal Tour Maroko — Marrakech & Sahara",  tag_line:"✨ Eksotis",        is_featured:false, seats_remaining:15, price_display_text:"Rp 19 Jt",   departure_month:"Apr 2026", is_active:true },
  { id:4, name:"Halal Tour Jepang — Tokyo, Kyoto & Fuji", tag_line:"⭐ Premium",        is_featured:false, seats_remaining:6,  price_display_text:"Rp 22 Jt",   departure_month:"Mar 2026", is_active:true },
];
const M_TESTIMONIALS = [
  { id:1, full_name:"Ghifar Fajri Sofwan", initials:"GF", city_or_role:"Bandung",              package_name:"Paket Bintang 4",       star_rating:5, quote_text:"Penerbangan tanpa transit, hotel bintang 4. Alhamdulillah saya dan istri nyaman sekali.",             page_context:"general",    is_verified:true,  is_active:true  },
  { id:2, full_name:"Kusnadi",              initials:"KS", city_or_role:"Bandung",              package_name:"Paket Umroh",           star_rating:5, quote_text:"Barakallah. Terima kasih banyak untuk tim SS Travel yang profesional, ramah, dan friendly.",           page_context:"general",    is_verified:true,  is_active:true  },
  { id:3, full_name:"Rizky Hidayat",        initials:"RH", city_or_role:"Jakarta",              package_name:"Halal Tour Turki 2024", star_rating:5, quote_text:"Halal tour Turki bersama SS Umroh benar-benar di luar ekspektasi. Tour leader sangat luar biasa!",     page_context:"halal-tour", is_verified:true,  is_active:true  },
  { id:4, full_name:"Dewi Wulandari",       initials:"DW", city_or_role:"HR Manager, PT. XYZ",  package_name:"Halal Tour Dubai 2024", star_rating:5, quote_text:"Rombongan kantor 30 orang ke Dubai. SS Umroh mengurus segalanya dengan sempurna.",                     page_context:"halal-tour", is_verified:true,  is_active:true  },
  { id:5, full_name:"Budi Santoso",         initials:"BS", city_or_role:"Surabaya",             package_name:"Umroh Hemat",           star_rating:5, quote_text:"Pengalaman umroh pertama saya sangat berkesan. Terima kasih SS Umroh!",                               page_context:"general",    is_verified:false, is_active:false },
];
const M_FAQS = [
  { id:1, question:"Apakah SS Umroh sudah berizin resmi dari Kemenag?",     answer:"Ya. SS Umroh terdaftar resmi sebagai PPIU di Kemenag RI dengan SK PPIU No. U.108 Tahun 2021.", category:"general",    is_active:true, display_order:1 },
  { id:2, question:"Apakah ada penerbangan direct tanpa transit?",           answer:"Ya. SS Umroh mengutamakan direct flight Jakarta–Madinah tanpa transit via Saudi Airlines & Garuda.", category:"general",    is_active:true, display_order:2 },
  { id:3, question:"Berapa jarak hotel dari masjid?",                        answer:"SS Umroh memilih hotel maksimal 350m dari masjid agar jamaah bisa berjalan kaki kapan saja.",      category:"general",    is_active:true, display_order:3 },
  { id:4, question:"Apakah makanan dijamin halal di semua destinasi?",       answer:"Ya. SS Umroh sudah memetakan restoran halal bersertifikasi di setiap destinasi halal tour.",        category:"halal-tour", is_active:true, display_order:1 },
  { id:5, question:"Apakah SS Umroh melayani program untuk perusahaan?",     answer:"Ya. Program Umroh Korporat tersedia mulai dari 10 peserta dengan koordinator dan harga khusus.",  category:"korporat",   is_active:true, display_order:1 },
];
const M_GALLERY = [
  { id:1, alt_text:"Blue Mosque Istanbul",       caption:"Masjid Biru Istanbul",        category:"halal-tour", is_active:true,  color:"#EEF2FF" },
  { id:2, alt_text:"Jamaah di Masjidil Haram",   caption:"Masjidil Haram Mekkah",       category:"umroh",      is_active:true,  color:"#F7F2FD" },
  { id:3, alt_text:"Burj Khalifa Dubai",          caption:"Malam di Dubai",              category:"halal-tour", is_active:true,  color:"#FEF3C7" },
  { id:4, alt_text:"Fushimi Inari Kyoto",         caption:"Halal Tour Jepang 2025",      category:"halal-tour", is_active:true,  color:"#FEE2E2" },
  { id:5, alt_text:"Program korporat SS Umroh",   caption:"Umroh Korporat 2024",         category:"korporat",   is_active:true,  color:"#DCFCE7" },
  { id:6, alt_text:"Masjid Nabawi Madinah",       caption:"Suasana Madinah",             category:"umroh",      is_active:false, color:"#EDE9FE" },
];
const M_TEAM = [
  { id:1, full_name:"H. Ahmad Sadaya",    role_title:"Founder & Direktur Utama",        department:"Management",       is_active:true  },
  { id:2, full_name:"Bayu Muharram",      role_title:"Customer Service Manager",        department:"Customer Service", is_active:true  },
  { id:3, full_name:"Sari Rahayu",        role_title:"Marketing Manager",               department:"Marketing",        is_active:true  },
  { id:4, full_name:"Ustadz Fauzi",       role_title:"Pembimbing Ibadah Senior",        department:"Operations",       is_active:true  },
  { id:5, full_name:"Dian Permata",       role_title:"Koordinator Operasional",         department:"Operations",       is_active:true  },
  { id:6, full_name:"Rini Fitriani",      role_title:"Tour Leader Halal Tour",          department:"Operations",       is_active:false },
];
const M_LEADS = [
  { id:1, full_name:"Budi Santoso",  phone:"081234567890", email:"budi@gmail.com",       subject:"Tanya paket bintang 4",  message:"Saya tertarik paket bintang 4. Ada slot Oktober untuk 2 orang?",    page_source:"paket-umroh", status:"new",       created_at:"2025-07-18" },
  { id:2, full_name:"Ibu Hartini",   phone:"085678901234", email:null,                   subject:"Tabungan umroh untuk anak",message:"Ingin tanya tabungan umroh untuk keberangkatan 2026. Bisa cicil?",  page_source:"homepage",    status:"responded", created_at:"2025-07-17" },
  { id:3, full_name:"Pak Rizal",     phone:"087890123456", email:"rizal@co.id",          subject:"Umroh Ramadhan 2026",    message:"Ada jadwal Ramadhan 2026? Kami 4 orang.",                           page_source:"paket-umroh", status:"read",      created_at:"2025-07-16" },
  { id:4, full_name:"Sri Wahyuni",   phone:"081345678901", email:"sri@yahoo.com",        subject:"Halal Tour Turki",       message:"Berapa biaya halal tour Turki untuk 2 orang Februari?",             page_source:"halal-tour",  status:"closed",    created_at:"2025-07-15" },
  { id:5, full_name:"Ahmad Fauzi",   phone:"089012345678", email:null,                   subject:"Cicilan umroh",          message:"Apakah bisa dicicil 12 bulan untuk paket hemat?",                   page_source:"paket-umroh", status:"new",       created_at:"2025-07-18" },
];
const M_CORP = [
  { id:1, company_name:"PT. Maju Bersama",             contact_person:"Hendra Kusuma", phone:"0811-222-3333", email:"hendra@maju.co.id",  estimated_pax:45,  travel_type:"umroh",      preferred_date:"2025-11-01", notes:"Program reward karyawan. Budget 35 juta/orang.", status:"responded", created_at:"2025-07-10" },
  { id:2, company_name:"Yayasan Pendidikan Islam",     contact_person:"Ustadz Mahmud", phone:"0822-444-5555", email:null,                 estimated_pax:25,  travel_type:"umroh",      preferred_date:"2026-01-15", notes:"Guru-guru pesantren. Butuh pembimbing khusus.",   status:"new",       created_at:"2025-07-14" },
  { id:3, company_name:"Bank Syariah Mandiri Bandung", contact_person:"Ibu Lestari",   phone:"0833-666-7777", email:"lestari@bsm.co.id",  estimated_pax:120, travel_type:"both",       preferred_date:"2025-12-20", notes:"Sebagian umroh, sebagian halal tour.",            status:"quoted",    created_at:"2025-07-05" },
];
const M_USERS = [
  { id:1, full_name:"System Administrator", email:"admin@ssumroh.id",  role:"super_admin", is_active:true,  last_login:"2025-07-18 09:15" },
  { id:2, full_name:"Bayu Muharram",        email:"bayu@ssumroh.id",   role:"admin",       is_active:true,  last_login:"2025-07-18 08:30" },
  { id:3, full_name:"Sari Rahayu",          email:"sari@ssumroh.id",   role:"editor",      is_active:true,  last_login:"2025-07-17 14:20" },
  { id:4, full_name:"Rini Fitriani",        email:"rini@ssumroh.id",   role:"cs_agent",    is_active:false, last_login:"2025-07-10 10:00" },
];
const M_AUDIT = [
  { id:20, user:"Bayu Muharram",        action:"updated", entity:"packages",      entity_id:2,  detail:"is_featured → true",                    ts:"2025-07-18 09:22" },
  { id:19, user:"Sari Rahayu",          action:"created", entity:"testimonials",  entity_id:5,  detail:"New: Budi Santoso",                      ts:"2025-07-18 08:45" },
  { id:18, user:"Bayu Muharram",        action:"updated", entity:"leads",         entity_id:3,  detail:"status: new → read",                     ts:"2025-07-17 16:30" },
  { id:17, user:"System Administrator", action:"created", entity:"packages",      entity_id:5,  detail:"New: Umroh Group",                        ts:"2025-07-15 11:00" },
  { id:16, user:"Sari Rahayu",          action:"deleted", entity:"gallery",       entity_id:10, detail:"Removed old gallery item",                ts:"2025-07-14 13:15" },
  { id:15, user:"Bayu Muharram",        action:"updated", entity:"site_settings", entity_id:1,  detail:"cs_name updated",                         ts:"2025-07-12 10:00" },
  { id:14, user:"System Administrator", action:"login",   entity:"admin_users",   entity_id:1,  detail:"Login from 182.0.0.1",                    ts:"2025-07-12 08:00" },
];
const CHART_LEADS = [
  { day:"Mon", leads:3 },{ day:"Tue", leads:5 },{ day:"Wed", leads:2 },
  { day:"Thu", leads:7 },{ day:"Fri", leads:4 },{ day:"Sat", leads:6 },{ day:"Sun", leads:2 },
];
const CHART_PKG = [
  { name:"Bintang 4", value:38 },{ name:"Hemat", value:27 },
  { name:"Tabungan", value:18 },{ name:"Ramadhan", value:12 },{ name:"Group", value:5 },
];
const PIE_COLORS = [T.pu, T.pk, T.gd, T.ok, "#2563EB"];

// ── Utilities ─────────────────────────────────────────────────────
const CAT_COL = { hemat:"green", bintang4:"purple", tabungan:"gold", ramadhan:"pink", group:"blue" };
const DEPT_COL = { Management:"pink", Marketing:"purple", "Customer Service":"blue", Operations:"green", Finance:"gold" };
const CTX_COL  = { general:"purple", "halal-tour":"green", korporat:"blue" };
const ACT_COL  = { created:"green", updated:"blue", deleted:"red", login:"gray", logout:"gray" };
const LEAD_ST  = { new:"pink", read:"blue", responded:"purple", quoted:"gold", closed:"gray" };
const SCHED_ST = { upcoming:"purple", ongoing:"gold", completed:"green", cancelled:"red" };
const ROLE_COL = { super_admin:"pink", admin:"purple", editor:"gold", cs_agent:"blue" };
const LEAD_ORDER = ["new","read","responded","closed"];
const CORP_ORDER  = ["new","read","responded","quoted","closed"];

// ── Shared atoms ─────────────────────────────────────────────────

function Badge({ children, color = "gray" }) {
  const S = {
    purple:{ bg:T.pl,      fg:T.pu     }, pink:  { bg:"#FDDDE6", fg:T.pk     },
    gold:  { bg:T.gl,      fg:"#92670F"}, green: { bg:"#DCFCE7", fg:T.ok     },
    red:   { bg:"#FEE2E2", fg:T.er     }, blue:  { bg:"#DBEAFE", fg:"#1D4ED8" },
    gray:  { bg:"var(--surface-1)", fg:"var(--text-secondary)" },
  };
  const c = S[color] || S.gray;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:3, background:c.bg, color:c.fg,
      fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:999, whiteSpace:"nowrap" }}>
      {children}
    </span>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} style={{
      width:38, height:21, borderRadius:11, border:"none", cursor:"pointer",
      background: checked ? T.pu : "var(--border-strong)", position:"relative",
      flexShrink:0, transition:"background .2s", display:"inline-block",
    }}>
      <span style={{
        position:"absolute", top:3, left: checked ? 19 : 3,
        width:15, height:15, borderRadius:"50%", background:"white",
        transition:"left .2s", display:"block",
      }}/>
    </button>
  );
}

function Btn({ children, onClick, variant="secondary", size="sm", icon:Icon, danger }) {
  const VS = {
    primary:   { background:T.pk,    color:"white",                border:"none" },
    secondary: { background:"var(--surface-1)", color:"var(--text-primary)", border:"0.5px solid var(--border-strong)" },
    ghost:     { background:"transparent",      color:"var(--text-secondary)", border:"none", padding:"5px 8px" },
    danger:    { background:"#FEE2E2", color:T.er, border:"0.5px solid #FCA5A5" },
  };
  const v = VS[danger ? "danger" : variant] || VS.secondary;
  return (
    <button onClick={onClick} style={{
      display:"inline-flex", alignItems:"center", gap:6, cursor:"pointer",
      fontSize: size === "sm" ? 12 : 14, fontWeight:500, borderRadius:8,
      padding: size === "sm" ? "7px 13px" : "10px 20px",
      transition:"all .15s", ...v,
    }}>{Icon && <Icon size={13} />}{children}</button>
  );
}

function Inp({ value, onChange, placeholder, type="text", style: s }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width:"100%", padding:"8px 11px", borderRadius:8, fontSize:13,
        border:"0.5px solid var(--border-strong)", background:"var(--surface-2)",
        color:"var(--text-primary)", outline:"none", boxSizing:"border-box", ...s }} />
  );
}

function Sel({ value, onChange, options, style: s }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width:"100%", padding:"8px 11px", borderRadius:8, fontSize:13,
        border:"0.5px solid var(--border-strong)", background:"var(--surface-2)",
        color:"var(--text-primary)", outline:"none", boxSizing:"border-box", ...s }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Fld({ label, children, required }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:11, fontWeight:600, color:"var(--text-secondary)", display:"block",
        marginBottom:5, textTransform:"uppercase", letterSpacing:".05em" }}>
        {label}{required && <span style={{ color:T.pk }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children, width = 520 }) {
  return (
    <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.48)",
      display:"flex", alignItems:"flex-start", justifyContent:"center",
      paddingTop:40, zIndex:50, minHeight:"100%" }}>
      <div style={{ background:"var(--surface-2)", borderRadius:16, width, maxWidth:"96%",
        border:"0.5px solid var(--border)", maxHeight:"80vh", overflow:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"18px 22px 0" }}>
          <h3 style={{ margin:0, fontSize:16, fontWeight:500 }}>{title}</h3>
          <button onClick={onClose} style={{ background:"none", border:"none",
            cursor:"pointer", color:"var(--text-secondary)", padding:4 }}><X size={17}/></button>
        </div>
        <div style={{ padding:"14px 22px 22px" }}>{children}</div>
      </div>
    </div>
  );
}

function Toast({ msg, type, onClose }) {
  const S = {
    success:{ bg:"#DCFCE7", fg:T.ok,    b:"#86EFAC" },
    error:  { bg:"#FEE2E2", fg:T.er,    b:"#FCA5A5" },
    info:   { bg:"#DBEAFE", fg:"#1D4ED8",b:"#93C5FD" },
  };
  const c = S[type] || S.info;
  const Icon = type === "success" ? CheckCircle : AlertCircle;
  return (
    <div style={{ position:"absolute", bottom:20, right:20, zIndex:100,
      background:c.bg, color:c.fg, border:`0.5px solid ${c.b}`, borderRadius:10,
      padding:"11px 16px", fontSize:13, fontWeight:500, display:"flex",
      alignItems:"center", gap:9, minWidth:220 }}>
      <Icon size={14}/>{msg}
      <button onClick={onClose} style={{ marginLeft:"auto", background:"none", border:"none",
        cursor:"pointer", color:"inherit", padding:0 }}><X size={13}/></button>
    </div>
  );
}

function SeatBar({ total, remaining }) {
  const pct = total > 0 ? Math.round((total - remaining) / total * 100) : 0;
  const low = remaining <= 5;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:9 }}>
      <div style={{ flex:1, height:5, borderRadius:3, background:"var(--surface-0)", overflow:"hidden", minWidth:52 }}>
        <div style={{ width:`${pct}%`, height:"100%", background: low ? T.pk : T.pu, borderRadius:3, transition:"width .3s" }}/>
      </div>
      <span style={{ fontSize:11, color: low ? T.pk : "var(--text-secondary)", fontWeight: low ? 700 : 400, minWidth:44 }}>
        {remaining} left
      </span>
    </div>
  );
}

function StatCard({ icon:Icon, label, value, sub, icolor, ibg }) {
  return (
    <div style={{ background:"var(--surface-1)", borderRadius:12, padding:"18px 20px",
      border:"0.5px solid var(--border)" }}>
      <div style={{ width:38, height:38, borderRadius:10, background:ibg || T.pl,
        display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12 }}>
        <Icon size={17} color={icolor || T.pu}/>
      </div>
      <div style={{ fontSize:26, fontWeight:500, color:"var(--text-primary)", lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:12, color:"var(--text-secondary)", marginTop:4 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:2 }}>{sub}</div>}
    </div>
  );
}

function PgHeader({ title, sub, action }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
      <div>
        <h2 style={{ margin:0, fontSize:20, fontWeight:500, color:"var(--text-primary)" }}>{title}</h2>
        {sub && <p style={{ margin:"4px 0 0", fontSize:13, color:"var(--text-secondary)" }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function SBar({ value, onChange, placeholder }) {
  return (
    <div style={{ position:"relative", width:250 }}>
      <Search size={13} style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)" }}/>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || "Search..."}
        style={{ width:"100%", padding:"7px 10px 7px 29px", borderRadius:8, fontSize:13,
          border:"0.5px solid var(--border-strong)", background:"var(--surface-2)",
          color:"var(--text-primary)", outline:"none", boxSizing:"border-box" }}/>
    </div>
  );
}

function Tbl({ cols, rows, empty = "No records found." }) {
  if (!rows.length)
    return <div style={{ textAlign:"center", padding:"52px 0", color:"var(--text-muted)", fontSize:13 }}>{empty}</div>;
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
        <thead>
          <tr>
            {cols.map(c => (
              <th key={c.key} style={{ textAlign:"left", padding:"9px 14px", fontSize:10, fontWeight:700,
                color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:".07em",
                borderBottom:"0.5px solid var(--border)", background:"var(--surface-1)",
                whiteSpace:"nowrap" }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id ?? i}
              onMouseEnter={e => e.currentTarget.style.background = "var(--surface-1)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              style={{ borderBottom:"0.5px solid var(--border)" }}>
              {cols.map(c => (
                <td key={c.key} style={{ padding:"11px 14px", verticalAlign:"middle" }}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FilterTabs({ options, value, onChange }) {
  return (
    <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
      {options.map(([v, l]) => (
        <button key={v} onClick={() => onChange(v)} style={{
          padding:"6px 13px", borderRadius:8, border:"0.5px solid var(--border-strong)",
          cursor:"pointer", fontSize:12, fontWeight:500, transition:"all .15s",
          background: value === v ? T.pu : "var(--surface-1)",
          color: value === v ? "white" : "var(--text-secondary)",
        }}>{l}</button>
      ))}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────
const NAV = [
  { id:"dashboard",    label:"Dashboard",           icon:LayoutDashboard },
  { id:"settings",     label:"Site settings",        icon:Settings },
  { id:"packages",     label:"Packages",             icon:Package },
  { id:"schedules",    label:"Departure schedules",  icon:Calendar },
  { id:"halal-dest",   label:"Halal destinations",   icon:Globe },
  { id:"halal-pkgs",   label:"Halal packages",       icon:Map },
  { id:"testimonials", label:"Testimonials",          icon:Star },
  { id:"faqs",         label:"FAQ",                  icon:HelpCircle },
  { id:"gallery",      label:"Gallery",              icon:Image },
  { id:"team",         label:"Team",                 icon:Users },
  { id:"leads",        label:"Leads",                icon:Mail, badge:2 },
  { id:"corporate",    label:"Corporate inquiries",  icon:Building2 },
  { id:"users",        label:"User management",      icon:UserCog, adminOnly:true },
  { id:"audit",        label:"Audit log",            icon:ClipboardList },
];
const PAGE_LABELS = Object.fromEntries(NAV.map(n => [n.id, n.label]));

function Sidebar({ page, setPage, role }) {
  return (
    <aside style={{ width:224, background:T.sb, display:"flex", flexDirection:"column",
      flexShrink:0, borderRight:"1px solid rgba(255,255,255,.06)" }}>
      <div style={{ padding:"18px 16px 14px", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
        <div style={{ fontWeight:700, fontSize:15, color:"white" }}>SS Umroh</div>
        <div style={{ fontSize:11, color:"rgba(255,255,255,.32)", marginTop:1 }}>Admin Panel v1.0</div>
      </div>
      <nav style={{ flex:1, padding:"8px 6px", overflowY:"auto" }}>
        {NAV.filter(n => !n.adminOnly || role === "super_admin").map(item => {
          const active = page === item.id;
          const Icon = item.icon;
          return (
            <button key={item.id} onClick={() => setPage(item.id)} style={{
              display:"flex", alignItems:"center", gap:9, width:"100%",
              padding:"8px 10px", borderRadius:8, border:"none", cursor:"pointer",
              background: active ? T.sbActive : "transparent",
              color: active ? T.sbGold : T.sbText,
              fontSize:12, fontWeight: active ? 600 : 400,
              textAlign:"left", transition:"all .15s", marginBottom:1,
            }}>
              <Icon size={14}/><span style={{ flex:1 }}>{item.label}</span>
              {item.badge && (
                <span style={{ background:T.pk, color:"white", fontSize:10, fontWeight:700,
                  borderRadius:999, padding:"1px 6px" }}>{item.badge}</span>
              )}
              {active && <ChevronRight size={11} color={T.sbGold}/>}
            </button>
          );
        })}
      </nav>
      <div style={{ padding:"12px 14px", borderTop:"1px solid rgba(255,255,255,.06)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:30, height:30, borderRadius:"50%", background:T.pu,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:11, fontWeight:700, color:"white", flexShrink:0 }}>SA</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:11, fontWeight:500, color:"rgba(255,255,255,.8)",
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>System Administrator</div>
            <Badge color="pink">super_admin</Badge>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ page }) {
  return (
    <header style={{ height:52, display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"0 22px", background:"var(--surface-2)", borderBottom:"0.5px solid var(--border)",
      flexShrink:0 }}>
      <div style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:"var(--text-muted)" }}>
        <span>Admin</span><ChevronRight size={11}/>
        <span style={{ color:"var(--text-primary)", fontWeight:500 }}>{PAGE_LABELS[page] || page}</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <button style={{ background:"none", border:"none", cursor:"pointer",
          color:"var(--text-muted)", position:"relative", padding:5 }}>
          <Bell size={15}/>
          <span style={{ position:"absolute", top:4, right:4, width:6, height:6,
            borderRadius:"50%", background:T.pk, display:"block" }}/>
        </button>
        <button style={{ display:"flex", alignItems:"center", gap:5, background:"var(--surface-1)",
          border:"0.5px solid var(--border)", borderRadius:8, padding:"5px 11px",
          cursor:"pointer", fontSize:11, color:"var(--text-secondary)" }}>
          <LogOut size={12}/> Sign out
        </button>
      </div>
    </header>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────
function Dashboard({ schedules }) {
  const low = schedules.filter(s => s.seats_remaining <= 5 && s.status === "upcoming");
  return (
    <div>
      <PgHeader title="Dashboard" sub="Welcome back. Here's what's happening today."/>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,minmax(0,1fr))", gap:12, marginBottom:20 }}>
        <StatCard icon={Mail}          label="New leads today"      value="5"  sub="+2 from yesterday" icolor={T.pk} ibg="#FDDDE6"/>
        <StatCard icon={Package}       label="Active packages"      value="4"  sub="1 inactive"        icolor={T.pu} ibg={T.pl}  />
        <StatCard icon={Calendar}      label="Departures this month" value="3"  sub="Sep 3, 10 · Oct 1" icolor={T.ok} ibg="#DCFCE7"/>
        <StatCard icon={AlertTriangle} label="Low seat alerts"      value={String(low.length)} sub="≤5 seats remaining" icolor={T.pk} ibg="#FEE2E2"/>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:14, marginBottom:20 }}>
        <div style={{ background:"var(--surface-1)", borderRadius:12, padding:"16px 18px",
          border:"0.5px solid var(--border)" }}>
          <h3 style={{ margin:"0 0 14px", fontSize:13, fontWeight:500 }}>Leads — last 7 days</h3>
          <ResponsiveContainer width="100%" height={168}>
            <LineChart data={CHART_LEADS}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
              <XAxis dataKey="day" tick={{ fontSize:10, fill:"var(--text-muted)" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:10, fill:"var(--text-muted)" }} axisLine={false} tickLine={false} width={20}/>
              <Tooltip contentStyle={{ fontSize:11, borderRadius:8, border:"0.5px solid var(--border)",
                background:"var(--surface-2)", color:"var(--text-primary)" }}/>
              <Line type="monotone" dataKey="leads" stroke={T.pu} strokeWidth={2.5}
                dot={{ r:3, fill:T.pu }} activeDot={{ r:5 }}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background:"var(--surface-1)", borderRadius:12, padding:"16px 18px",
          border:"0.5px solid var(--border)" }}>
          <h3 style={{ margin:"0 0 10px", fontSize:13, fontWeight:500 }}>Package inquiries</h3>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={CHART_PKG} cx="50%" cy="50%" innerRadius={42} outerRadius={65}
                paddingAngle={3} dataKey="value">
                {CHART_PKG.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>)}
              </Pie>
              <Tooltip contentStyle={{ fontSize:10, borderRadius:8, border:"0.5px solid var(--border)",
                background:"var(--surface-2)", color:"var(--text-primary)" }}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
            {CHART_PKG.map((d, i) => (
              <div key={d.name} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11 }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:PIE_COLORS[i],
                  flexShrink:0, display:"block" }}/>
                <span style={{ flex:1, color:"var(--text-secondary)" }}>{d.name}</span>
                <span style={{ fontWeight:600 }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {low.length > 0 && (
        <div style={{ background:"#FFF7ED", border:"0.5px solid #FED7AA", borderRadius:12,
          padding:"14px 18px", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:8 }}>
            <AlertTriangle size={14} color="#D97706"/>
            <span style={{ fontSize:12, fontWeight:600, color:"#92400E" }}>Low seat alerts ({low.length})</span>
          </div>
          {low.map(s => (
            <div key={s.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 0",
              borderTop:"0.5px solid #FED7AA", fontSize:12 }}>
              <span style={{ flex:1, color:"#78350F" }}>{s.package_name} — {s.departure_date}</span>
              <Badge color="pink">{s.seats_remaining} seats left</Badge>
            </div>
          ))}
        </div>
      )}
      <div style={{ background:"var(--surface-1)", borderRadius:12, border:"0.5px solid var(--border)" }}>
        <div style={{ padding:"14px 18px", borderBottom:"0.5px solid var(--border)" }}>
          <h3 style={{ margin:0, fontSize:13, fontWeight:500 }}>Upcoming departures</h3>
        </div>
        <Tbl rows={schedules.filter(s => s.status === "upcoming").slice(0, 5)} cols={[
          { key:"package_name", label:"Package", render:r=><span style={{fontWeight:500,fontSize:12}}>{r.package_name}</span> },
          { key:"departure_date", label:"Date", render:r=><span style={{fontSize:12}}>{r.departure_date}</span> },
          { key:"departure_city", label:"From", render:r=><Badge color="gray">{r.departure_city}</Badge> },
          { key:"airline", label:"Airline", render:r=><span style={{fontSize:11}}>{r.airline}</span> },
          { key:"seats", label:"Availability", render:r=><SeatBar total={r.total_seats} remaining={r.seats_remaining}/> },
          { key:"status", label:"Status", render:r=><Badge color={SCHED_ST[r.status]||"gray"}>{r.status}</Badge> },
        ]}/>
      </div>
    </div>
  );
}

// ── Packages ──────────────────────────────────────────────────────
const PKG_EMPTY = { slug:"", name:"", category:"hemat", tag_line:"", hotel_distance_m:350,
  flight_type:"Direct ✈", price_mode:"contact", price_display_text:"Hubungi CS",
  is_featured:false, is_active:true };

function PackagesPage({ showToast }) {
  const [items, setItems] = useState(M_PACKAGES);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const f = k => v => setForm(p => ({ ...p, [k]:v }));

  const rows = items.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const openEdit = r => { setForm({ ...r }); setModal("edit"); };
  const openNew  = () => { setForm({ ...PKG_EMPTY }); setModal("new"); };

  const save = () => {
    if (!form.name) return;
    if (modal === "new") setItems(p => [...p, { ...form, id:uid(), display_order:p.length+1 }]);
    else setItems(p => p.map(x => x.id === form.id ? form : x));
    showToast(modal === "new" ? "Package created" : "Package updated");
    setModal(null);
  };
  const del = id => { setItems(p => p.filter(x => x.id !== id)); showToast("Package deleted","error"); };
  const toggleFeatured = id => {
    setItems(p => p.map(x => ({ ...x, is_featured: x.id === id ? !x.is_featured : false })));
    showToast("Featured updated");
  };
  const toggleActive = id => setItems(p => p.map(x => x.id === id ? { ...x, is_active:!x.is_active } : x));

  return (
    <div style={{ position:"relative", minHeight:500 }}>
      <PgHeader title="Packages (Umroh)" sub="Only one package can be featured at a time."
        action={<Btn variant="primary" icon={Plus} onClick={openNew}>Add package</Btn>}/>
      <div style={{ background:"var(--surface-1)", borderRadius:12, border:"0.5px solid var(--border)" }}>
        <div style={{ padding:"12px 14px", borderBottom:"0.5px solid var(--border)" }}>
          <SBar value={search} onChange={setSearch} placeholder="Search packages..."/>
        </div>
        <Tbl rows={rows} cols={[
          { key:"_", label:"", render:()=><GripVertical size={13} color="var(--text-muted)" style={{cursor:"grab"}}/> },
          { key:"name", label:"Package", render:r=>(
            <div>
              <div style={{fontWeight:500,fontSize:13}}>{r.name}</div>
              <div style={{fontSize:11,color:"var(--text-muted)"}}>/{r.slug}</div>
            </div>
          )},
          { key:"category", label:"Category", render:r=><Badge color={CAT_COL[r.category]||"gray"}>{r.category}</Badge> },
          { key:"tag_line",  label:"Tag",      render:r=><span style={{fontSize:12}}>{r.tag_line}</span> },
          { key:"hotel_distance_m", label:"Dist.", render:r=><span style={{fontSize:12}}>{r.hotel_distance_m}m</span> },
          { key:"price",     label:"Price",    render:r=><span style={{fontSize:12}}>{r.price_display_text}</span> },
          { key:"featured",  label:"Featured", render:r=><Toggle checked={r.is_featured} onChange={()=>toggleFeatured(r.id)}/> },
          { key:"active",    label:"Active",   render:r=><Toggle checked={r.is_active}   onChange={()=>toggleActive(r.id)}/> },
          { key:"actions",   label:"",         render:r=>(
            <div style={{display:"flex",gap:5}}>
              <Btn variant="ghost" onClick={()=>openEdit(r)}><Edit2 size={12}/></Btn>
              <Btn variant="ghost" danger onClick={()=>del(r.id)}><Trash2 size={12}/></Btn>
            </div>
          )},
        ]}/>
      </div>
      {modal && (
        <Modal title={modal==="new" ? "Add package" : "Edit package"} onClose={()=>setModal(null)}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Fld label="Package name" required><Inp value={form.name||""} onChange={f("name")} placeholder="Umroh Bintang 5"/></Fld>
            <Fld label="Slug" required><Inp value={form.slug||""} onChange={f("slug")} placeholder="bintang5"/></Fld>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Fld label="Category">
              <Sel value={form.category||"hemat"} onChange={f("category")} options={["hemat","bintang4","tabungan","ramadhan","group"].map(v=>({value:v,label:v}))}/>
            </Fld>
            <Fld label="Tag line"><Inp value={form.tag_line||""} onChange={f("tag_line")} placeholder="Paling Populer"/></Fld>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Fld label="Hotel dist. (m)"><Inp type="number" value={form.hotel_distance_m||""} onChange={v=>setForm(p=>({...p,hotel_distance_m:+v}))} placeholder="350"/></Fld>
            <Fld label="Price display text"><Inp value={form.price_display_text||""} onChange={f("price_display_text")} placeholder="Mulai Rp 15 Jt"/></Fld>
          </div>
          <div style={{display:"flex",gap:20,marginBottom:18}}>
            <label style={{display:"flex",alignItems:"center",gap:7,fontSize:13,cursor:"pointer"}}>
              <Toggle checked={!!form.is_featured} onChange={v=>setForm(p=>({...p,is_featured:v}))}/>Featured
            </label>
            <label style={{display:"flex",alignItems:"center",gap:7,fontSize:13,cursor:"pointer"}}>
              <Toggle checked={!!form.is_active} onChange={v=>setForm(p=>({...p,is_active:v}))}/>Active
            </label>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
            <Btn onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn variant="primary" icon={Save} onClick={save}>Save package</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Schedules ─────────────────────────────────────────────────────
const SCHED_EMPTY = { package_name:"", departure_date:"", return_date:"", departure_city:"CGK", airline:"", total_seats:45, seats_remaining:45, status:"upcoming" };
const CITY_OPTS   = [{value:"CGK",label:"Jakarta (CGK)"},{value:"BDO",label:"Bandung (BDO)"},{value:"SUB",label:"Surabaya (SUB)"}];
const STATUS_OPTS = ["upcoming","ongoing","completed","cancelled"].map(v=>({value:v,label:v}));

function SchedulesPage({ showToast }) {
  const [items, setItems] = useState(M_SCHEDULES);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const f = k => v => setForm(p => ({ ...p, [k]:v }));

  const openEdit = r => { setForm({...r}); setModal("edit"); };
  const openNew  = () => { setForm({...SCHED_EMPTY}); setModal("new"); };
  const save = () => {
    if (!form.package_name) return;
    if (modal==="new") setItems(p=>[...p,{...form,id:uid()}]);
    else setItems(p=>p.map(x=>x.id===form.id?form:x));
    showToast("Schedule saved"); setModal(null);
  };
  const del = id => { setItems(p=>p.filter(x=>x.id!==id)); showToast("Deleted","error"); };

  return (
    <div style={{position:"relative",minHeight:500}}>
      <PgHeader title="Departure schedules" sub="Track seat availability and departure status."
        action={<Btn variant="primary" icon={Plus} onClick={openNew}>Add schedule</Btn>}/>
      <div style={{background:"var(--surface-1)",borderRadius:12,border:"0.5px solid var(--border)"}}>
        <Tbl rows={items} cols={[
          { key:"package_name",  label:"Package",      render:r=><span style={{fontWeight:500,fontSize:12}}>{r.package_name}</span> },
          { key:"departure_date",label:"Departure",    render:r=><span style={{fontSize:12}}>{r.departure_date}</span> },
          { key:"return_date",   label:"Return",       render:r=><span style={{fontSize:12}}>{r.return_date}</span> },
          { key:"departure_city",label:"From",         render:r=><Badge color="gray">{r.departure_city}</Badge> },
          { key:"airline",       label:"Airline",      render:r=><span style={{fontSize:11}}>{r.airline}</span> },
          { key:"seats",         label:"Availability", render:r=><SeatBar total={r.total_seats} remaining={r.seats_remaining}/> },
          { key:"status",        label:"Status",       render:r=><Badge color={SCHED_ST[r.status]||"gray"}>{r.status}</Badge> },
          { key:"actions",       label:"",             render:r=>(
            <div style={{display:"flex",gap:5}}>
              <Btn variant="ghost" onClick={()=>openEdit(r)}><Edit2 size={12}/></Btn>
              <Btn variant="ghost" danger onClick={()=>del(r.id)}><Trash2 size={12}/></Btn>
            </div>
          )},
        ]}/>
      </div>
      {modal && (
        <Modal title={modal==="new"?"Add schedule":"Edit schedule"} onClose={()=>setModal(null)}>
          <Fld label="Package name" required><Inp value={form.package_name||""} onChange={f("package_name")} placeholder="Umroh Hemat"/></Fld>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Fld label="Departure"><Inp type="date" value={form.departure_date||""} onChange={f("departure_date")}/></Fld>
            <Fld label="Return"><Inp type="date" value={form.return_date||""} onChange={f("return_date")}/></Fld>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Fld label="City"><Sel value={form.departure_city||"CGK"} onChange={f("departure_city")} options={CITY_OPTS}/></Fld>
            <Fld label="Airline"><Inp value={form.airline||""} onChange={f("airline")} placeholder="Garuda Indonesia"/></Fld>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            <Fld label="Total seats"><Inp type="number" value={form.total_seats||""} onChange={v=>setForm(p=>({...p,total_seats:+v}))}/></Fld>
            <Fld label="Remaining"><Inp type="number" value={form.seats_remaining||""} onChange={v=>setForm(p=>({...p,seats_remaining:+v}))}/></Fld>
            <Fld label="Status"><Sel value={form.status||"upcoming"} onChange={f("status")} options={STATUS_OPTS}/></Fld>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
            <Btn onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn variant="primary" icon={Save} onClick={save}>Save</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Leads ─────────────────────────────────────────────────────────
function LeadsPage({ showToast }) {
  const [items, setItems] = useState(M_LEADS);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [detail, setDetail] = useState(null);

  const rows = items.filter(l => {
    const q = search.toLowerCase();
    const m = l.full_name.toLowerCase().includes(q) || l.phone.includes(q) ||
              (l.subject||"").toLowerCase().includes(q);
    return m && (tab === "all" || l.status === tab);
  });
  const counts = Object.fromEntries(["new","read","responded","closed"].map(s => [s, items.filter(l=>l.status===s).length]));
  const advance = id => {
    setItems(p => p.map(l => {
      if (l.id !== id) return l;
      const i = LEAD_ORDER.indexOf(l.status);
      return { ...l, status: LEAD_ORDER[Math.min(i+1, LEAD_ORDER.length-1)] };
    }));
    showToast("Status updated");
  };

  return (
    <div style={{position:"relative",minHeight:500}}>
      <PgHeader title="Leads inbox" sub="General contact form submissions."
        action={<Btn icon={Download} onClick={()=>showToast("Exporting CSV…","info")}>Export CSV</Btn>}/>
      <FilterTabs
        options={[["all",`All (${items.length})`],["new",`New (${counts.new})`],["read",`Read (${counts.read})`],["responded",`Responded (${counts.responded})`],["closed",`Closed (${counts.closed})`]]}
        value={tab} onChange={setTab}/>
      <div style={{background:"var(--surface-1)",borderRadius:12,border:"0.5px solid var(--border)"}}>
        <div style={{padding:"12px 14px",borderBottom:"0.5px solid var(--border)"}}>
          <SBar value={search} onChange={setSearch} placeholder="Name, phone, or subject…"/>
        </div>
        <Tbl rows={rows} cols={[
          { key:"created_at", label:"Date",    render:r=><span style={{fontSize:11,color:"var(--text-muted)"}}>{r.created_at}</span> },
          { key:"full_name",  label:"Lead",    render:r=>(
            <div>
              <div style={{fontWeight:500,fontSize:13}}>{r.full_name}</div>
              <div style={{fontSize:11,color:"var(--text-muted)"}}>{r.phone}</div>
            </div>
          )},
          { key:"subject",     label:"Subject",    render:r=><span style={{fontSize:12}}>{r.subject}</span> },
          { key:"page_source", label:"From page",  render:r=><Badge color="gray">{r.page_source}</Badge> },
          { key:"status",      label:"Status",     render:r=><Badge color={LEAD_ST[r.status]||"gray"}>{r.status}</Badge> },
          { key:"actions",     label:"",           render:r=>(
            <div style={{display:"flex",gap:5}}>
              <Btn variant="ghost" onClick={()=>setDetail(r)}><Eye size={12}/></Btn>
              {r.status !== "closed" && (
                <Btn variant="secondary" size="sm" onClick={()=>advance(r.id)}>
                  {r.status==="new"?"Mark read":r.status==="read"?"Respond":"Close"}
                </Btn>
              )}
            </div>
          )},
        ]} empty="No leads match your filter."/>
      </div>
      {detail && (
        <Modal title="Lead details" onClose={()=>setDetail(null)}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            {[["Name",detail.full_name],["Phone",detail.phone],["Email",detail.email||"—"],
              ["Source",detail.page_source],["Date",detail.created_at],["Status",detail.status]
            ].map(([k,v])=>(
              <div key={k}>
                <div style={{fontSize:10,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:3}}>{k}</div>
                <div style={{fontSize:13}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{background:"var(--surface-0)",borderRadius:10,padding:"12px 14px",marginBottom:14}}>
            <div style={{fontSize:10,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",marginBottom:6}}>Message</div>
            <p style={{margin:0,fontSize:13,lineHeight:1.65}}>{detail.message}</p>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <Btn icon={Phone}><a href={`tel:${detail.phone}`} style={{color:"inherit",textDecoration:"none"}}>Call</a></Btn>
            <Btn icon={MessageSquare}><a href={`https://wa.me/62${detail.phone.slice(1)}`} target="_blank" rel="noreferrer" style={{color:"inherit",textDecoration:"none"}}>WhatsApp</a></Btn>
            {detail.status !== "closed" && (
              <Btn variant="primary" icon={Check} onClick={()=>{advance(detail.id);setDetail(null);}}>Advance status</Btn>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Corporate ─────────────────────────────────────────────────────
function CorporatePage({ showToast }) {
  const [items, setItems] = useState(M_CORP);
  const [detail, setDetail] = useState(null);
  const advance = id => {
    setItems(p => p.map(c => {
      if (c.id !== id) return c;
      const i = CORP_ORDER.indexOf(c.status);
      return { ...c, status: CORP_ORDER[Math.min(i+1, CORP_ORDER.length-1)] };
    }));
    showToast("Status updated");
  };
  return (
    <div style={{position:"relative",minHeight:400}}>
      <PgHeader title="Corporate inquiries" sub="Inquiries from companies and organizations."
        action={<Btn icon={Download} onClick={()=>showToast("Exporting…","info")}>Export CSV</Btn>}/>
      <div style={{background:"var(--surface-1)",borderRadius:12,border:"0.5px solid var(--border)"}}>
        <Tbl rows={items} cols={[
          { key:"created_at",   label:"Date",      render:r=><span style={{fontSize:11,color:"var(--text-muted)"}}>{r.created_at}</span> },
          { key:"company_name", label:"Company",   render:r=>(
            <div>
              <div style={{fontWeight:500,fontSize:12}}>{r.company_name}</div>
              <div style={{fontSize:11,color:"var(--text-muted)"}}>{r.contact_person}</div>
            </div>
          )},
          { key:"phone",         label:"Phone",    render:r=><span style={{fontSize:12}}>{r.phone}</span> },
          { key:"estimated_pax", label:"Pax",      render:r=><Badge color="purple">{r.estimated_pax} pax</Badge> },
          { key:"travel_type",   label:"Type",     render:r=><Badge color={r.travel_type==="both"?"pink":"purple"}>{r.travel_type}</Badge> },
          { key:"status",        label:"Status",   render:r=><Badge color={LEAD_ST[r.status]||"gray"}>{r.status}</Badge> },
          { key:"actions",       label:"",         render:r=>(
            <div style={{display:"flex",gap:5}}>
              <Btn variant="ghost" onClick={()=>setDetail(r)}><Eye size={12}/></Btn>
              {r.status!=="closed"&&<Btn variant="secondary" size="sm" onClick={()=>advance(r.id)}>Advance</Btn>}
            </div>
          )},
        ]}/>
      </div>
      {detail && (
        <Modal title="Corporate inquiry" onClose={()=>setDetail(null)}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            {[["Company",detail.company_name],["Contact",detail.contact_person],["Phone",detail.phone],
              ["Email",detail.email||"—"],["Pax",detail.estimated_pax+" pax"],["Type",detail.travel_type],
              ["Preferred date",detail.preferred_date],["Status",detail.status]
            ].map(([k,v])=>(
              <div key={k}>
                <div style={{fontSize:10,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:3}}>{k}</div>
                <div style={{fontSize:13}}>{v}</div>
              </div>
            ))}
          </div>
          {detail.notes && (
            <div style={{background:"var(--surface-0)",borderRadius:10,padding:"12px 14px",marginBottom:14}}>
              <div style={{fontSize:10,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",marginBottom:6}}>Notes</div>
              <p style={{margin:0,fontSize:13,lineHeight:1.65}}>{detail.notes}</p>
            </div>
          )}
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            {detail.status!=="closed"&&<Btn variant="primary" icon={Check} onClick={()=>{advance(detail.id);setDetail(null);}}>Advance status</Btn>}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Testimonials ──────────────────────────────────────────────────
function TestimonialsPage({ showToast }) {
  const [items, setItems] = useState(M_TESTIMONIALS);
  const [tab, setTab] = useState("all");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const f = k => v => setForm(p=>({...p,[k]:v}));

  const rows = items.filter(t =>
    tab==="all" || (tab==="pending"&&!t.is_verified) || t.page_context===tab
  );
  const openNew  = ()=>{setForm({full_name:"",initials:"",city_or_role:"",package_name:"",star_rating:5,quote_text:"",page_context:"general",is_verified:false,is_active:false});setModal("new");};
  const openEdit = r=>{setForm({...r});setModal("edit");};
  const save = ()=>{
    if(!form.full_name||!form.quote_text)return;
    const ini = form.initials||form.full_name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
    if(modal==="new")setItems(p=>[...p,{...form,initials:ini,id:uid()}]);
    else setItems(p=>p.map(t=>t.id===form.id?{...form,initials:ini}:t));
    showToast("Testimonial saved"); setModal(null);
  };
  const del = id=>{setItems(p=>p.filter(t=>t.id!==id));showToast("Deleted","error");};
  const toggleVerify = id=>setItems(p=>p.map(t=>t.id===id?{...t,is_verified:!t.is_verified,is_active:!t.is_verified}:t));
  const toggleActive = id=>setItems(p=>p.map(t=>t.id===id?{...t,is_active:!t.is_active}:t));

  return (
    <div style={{position:"relative",minHeight:500}}>
      <PgHeader title="Testimonials" sub="Unverified testimonials are hidden from the public site."
        action={<Btn variant="primary" icon={Plus} onClick={openNew}>Add testimonial</Btn>}/>
      <FilterTabs options={[["all","All"],["pending","Pending"],["general","General"],["halal-tour","Halal Tour"],["korporat","Korporat"]]} value={tab} onChange={setTab}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:12}}>
        {rows.map(t=>(
          <div key={t.id} style={{background:"var(--surface-1)",border:`0.5px solid ${!t.is_verified?"#FED7AA":"var(--border)"}`,borderRadius:14,padding:"16px",display:"flex",flexDirection:"column",gap:10,opacity:t.is_active?1:.6}}>
            {!t.is_verified&&<div style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:"#92400E",background:"#FFF7ED",padding:"4px 9px",borderRadius:6}}><AlertCircle size={11}/>Pending verification</div>}
            <div style={{display:"flex",gap:1}}>{[1,2,3,4,5].map(s=><StarFill key={s} size={11} fill={s<=t.star_rating?T.gd:"none"} color={s<=t.star_rating?T.gd:"var(--border)"}/>)}</div>
            <p style={{margin:0,fontSize:12,color:"var(--text-secondary)",lineHeight:1.65,flex:1,fontStyle:"italic"}}>"{t.quote_text}"</p>
            <div style={{display:"flex",alignItems:"center",gap:9,borderTop:"0.5px solid var(--border)",paddingTop:10}}>
              <div style={{width:30,height:30,borderRadius:"50%",background:T.pu,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"white",flexShrink:0}}>{t.initials}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.full_name}</div>
                <div style={{fontSize:10,color:"var(--text-muted)"}}>{t.package_name}</div>
              </div>
              <Badge color={CTX_COL[t.page_context]||"gray"}>{t.page_context}</Badge>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",gap:5}}>
                <Btn variant="ghost" onClick={()=>openEdit(t)}><Edit2 size={11}/></Btn>
                <Btn variant="ghost" danger onClick={()=>del(t.id)}><Trash2 size={11}/></Btn>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10,fontSize:11,color:"var(--text-muted)"}}>
                <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer"}}>
                  <Toggle checked={t.is_verified} onChange={()=>toggleVerify(t.id)}/>Verified
                </label>
                <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer"}}>
                  <Toggle checked={t.is_active} onChange={()=>toggleActive(t.id)}/>Active
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
      {modal && (
        <Modal title={modal==="new"?"Add testimonial":"Edit testimonial"} onClose={()=>setModal(null)}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Fld label="Full name" required><Inp value={form.full_name||""} onChange={f("full_name")} placeholder="Customer name"/></Fld>
            <Fld label="Initials"><Inp value={form.initials||""} onChange={f("initials")} placeholder="Auto-generated"/></Fld>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Fld label="City / role"><Inp value={form.city_or_role||""} onChange={f("city_or_role")} placeholder="Bandung"/></Fld>
            <Fld label="Package"><Inp value={form.package_name||""} onChange={f("package_name")} placeholder="Paket Bintang 4"/></Fld>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Fld label="Page context">
              <Sel value={form.page_context||"general"} onChange={f("page_context")} options={["general","halal-tour","korporat"].map(v=>({value:v,label:v}))}/>
            </Fld>
            <Fld label="Rating">
              <Sel value={String(form.star_rating||5)} onChange={v=>setForm(p=>({...p,star_rating:+v}))} options={[5,4,3,2,1].map(n=>({value:String(n),label:`${n} stars`}))}/>
            </Fld>
          </div>
          <Fld label="Quote" required>
            <textarea value={form.quote_text||""} onChange={e=>setForm(p=>({...p,quote_text:e.target.value}))} rows={3} placeholder="Customer quote…"
              style={{width:"100%",padding:"8px 11px",borderRadius:8,fontSize:13,border:"0.5px solid var(--border-strong)",background:"var(--surface-2)",color:"var(--text-primary)",outline:"none",boxSizing:"border-box",resize:"vertical"}}/>
          </Fld>
          <div style={{display:"flex",gap:20,marginBottom:16}}>
            <label style={{display:"flex",alignItems:"center",gap:7,fontSize:13,cursor:"pointer"}}><Toggle checked={!!form.is_verified} onChange={v=>setForm(p=>({...p,is_verified:v}))}/>Verified</label>
            <label style={{display:"flex",alignItems:"center",gap:7,fontSize:13,cursor:"pointer"}}><Toggle checked={!!form.is_active}   onChange={v=>setForm(p=>({...p,is_active:v}))}/>Active</label>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
            <Btn onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn variant="primary" icon={Save} onClick={save}>Save</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────
function FAQPage({ showToast }) {
  const [items, setItems] = useState(M_FAQS);
  const [tab, setTab] = useState("all");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const f = k => v => setForm(p=>({...p,[k]:v}));

  const rows = items.filter(x => tab==="all"||x.category===tab);
  const openNew  = ()=>{setForm({question:"",answer:"",category:"general",is_active:true,display_order:items.length+1});setModal("new");};
  const openEdit = r=>{setForm({...r});setModal("edit");};
  const save = ()=>{
    if(!form.question||!form.answer)return;
    if(modal==="new")setItems(p=>[...p,{...form,id:uid()}]);
    else setItems(p=>p.map(x=>x.id===form.id?form:x));
    showToast("FAQ saved"); setModal(null);
  };
  const del = id=>{setItems(p=>p.filter(x=>x.id!==id));showToast("Deleted","error");};
  const toggle = id=>setItems(p=>p.map(x=>x.id===id?{...x,is_active:!x.is_active}:x));

  return (
    <div style={{position:"relative",minHeight:400}}>
      <PgHeader title="FAQ" sub="Frequently asked questions, organised by category."
        action={<Btn variant="primary" icon={Plus} onClick={openNew}>Add FAQ</Btn>}/>
      <FilterTabs options={[["all","All"],["general","General"],["halal-tour","Halal Tour"],["korporat","Korporat"]]} value={tab} onChange={setTab}/>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {rows.map((x,i)=>(
          <div key={x.id} style={{background:"var(--surface-1)",border:"0.5px solid var(--border)",borderRadius:12,padding:"13px 16px",opacity:x.is_active?1:.5}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:11}}>
              <GripVertical size={14} color="var(--text-muted)" style={{flexShrink:0,marginTop:2,cursor:"grab"}}/>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:5}}>
                  <span style={{fontSize:10,fontWeight:700,color:"var(--text-muted)"}}>{i+1}</span>
                  <span style={{fontSize:13,fontWeight:500,flex:1}}>{x.question}</span>
                  <Badge color={CTX_COL[x.category]||"gray"}>{x.category}</Badge>
                </div>
                <p style={{margin:0,fontSize:12,color:"var(--text-secondary)",lineHeight:1.65}}>{x.answer}</p>
              </div>
              <div style={{display:"flex",gap:5,flexShrink:0,alignItems:"center"}}>
                <Toggle checked={x.is_active} onChange={()=>toggle(x.id)}/>
                <Btn variant="ghost" onClick={()=>openEdit(x)}><Edit2 size={12}/></Btn>
                <Btn variant="ghost" danger onClick={()=>del(x.id)}><Trash2 size={12}/></Btn>
              </div>
            </div>
          </div>
        ))}
        {rows.length===0&&<div style={{textAlign:"center",padding:"40px",color:"var(--text-muted)",fontSize:13}}>No FAQs in this category.</div>}
      </div>
      {modal && (
        <Modal title={modal==="new"?"Add FAQ":"Edit FAQ"} onClose={()=>setModal(null)}>
          <Fld label="Question" required><Inp value={form.question||""} onChange={f("question")} placeholder="Question…"/></Fld>
          <Fld label="Answer" required>
            <textarea value={form.answer||""} onChange={e=>setForm(p=>({...p,answer:e.target.value}))} rows={4} placeholder="Detailed answer…"
              style={{width:"100%",padding:"8px 11px",borderRadius:8,fontSize:13,border:"0.5px solid var(--border-strong)",background:"var(--surface-2)",color:"var(--text-primary)",outline:"none",boxSizing:"border-box",resize:"vertical"}}/>
          </Fld>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
            <Fld label="Category">
              <Sel value={form.category||"general"} onChange={f("category")} options={["general","halal-tour","korporat"].map(v=>({value:v,label:v}))}/>
            </Fld>
            <Fld label="Active"><div style={{display:"flex",alignItems:"center",gap:7,height:38}}><Toggle checked={!!form.is_active} onChange={v=>setForm(p=>({...p,is_active:v}))}/><span style={{fontSize:13}}>{form.is_active?"Active":"Inactive"}</span></div></Fld>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
            <Btn onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn variant="primary" icon={Save} onClick={save}>Save</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Gallery ───────────────────────────────────────────────────────
function GalleryPage({ showToast }) {
  const [items, setItems] = useState(M_GALLERY);
  const [tab, setTab] = useState("all");
  const rows = items.filter(g => tab==="all"||g.category===tab);
  const toggle = id=>setItems(p=>p.map(g=>g.id===id?{...g,is_active:!g.is_active}:g));
  const del = id=>{setItems(p=>p.filter(g=>g.id!==id));showToast("Item deleted","error");};
  return (
    <div>
      <PgHeader title="Gallery" sub="Manage photo gallery by category."
        action={<Btn variant="primary" icon={Upload} onClick={()=>showToast("File picker would open here","info")}>Upload images</Btn>}/>
      <FilterTabs options={[["all","All"],["umroh","Umroh"],["halal-tour","Halal Tour"],["korporat","Korporat"],["general","General"]]} value={tab} onChange={setTab}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:12}}>
        {rows.map(g=>(
          <div key={g.id} style={{background:"var(--surface-1)",border:"0.5px solid var(--border)",borderRadius:12,overflow:"hidden",opacity:g.is_active?1:.55}}>
            <div style={{height:130,background:g.color||T.pl,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
              <Image size={26} color={T.pu} opacity={.35}/>
              <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"6px 9px",background:"rgba(0,0,0,.28)"}}>
                <Badge color={CTX_COL[g.category]||"gray"}>{g.category}</Badge>
              </div>
            </div>
            <div style={{padding:"10px 12px"}}>
              <div style={{fontSize:12,fontWeight:500,marginBottom:2}}>{g.alt_text}</div>
              <div style={{fontSize:11,color:"var(--text-muted)",marginBottom:10}}>{g.caption}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <label style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:"var(--text-secondary)",cursor:"pointer"}}>
                  <Toggle checked={g.is_active} onChange={()=>toggle(g.id)}/>{g.is_active?"Active":"Hidden"}
                </label>
                <Btn variant="ghost" danger onClick={()=>del(g.id)}><Trash2 size={12}/></Btn>
              </div>
            </div>
          </div>
        ))}
        <button onClick={()=>showToast("File picker would open here","info")}
          style={{background:"var(--surface-0)",border:"1px dashed var(--border-strong)",borderRadius:12,minHeight:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:7,cursor:"pointer",color:"var(--text-muted)",fontSize:12}}>
          <Upload size={20} color="var(--text-muted)"/><span>Upload image</span>
        </button>
      </div>
    </div>
  );
}

// ── Team ──────────────────────────────────────────────────────────
function TeamPage({ showToast }) {
  const [items, setItems] = useState(M_TEAM);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const f = k => v => setForm(p=>({...p,[k]:v}));

  const openNew  = ()=>{setForm({full_name:"",role_title:"",department:"Operations",is_active:true});setModal("new");};
  const openEdit = r=>{setForm({...r});setModal("edit");};
  const save = ()=>{
    if(!form.full_name)return;
    if(modal==="new")setItems(p=>[...p,{...form,id:uid()}]);
    else setItems(p=>p.map(t=>t.id===form.id?form:t));
    showToast("Team member saved"); setModal(null);
  };
  const del = id=>{setItems(p=>p.filter(t=>t.id!==id));showToast("Deleted","error");};
  const toggle = id=>setItems(p=>p.map(t=>t.id===id?{...t,is_active:!t.is_active}:t));

  return (
    <div style={{position:"relative",minHeight:400}}>
      <PgHeader title="Team" sub="Public team members shown on the About Us page."
        action={<Btn variant="primary" icon={Plus} onClick={openNew}>Add member</Btn>}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:12}}>
        {items.map(t=>(
          <div key={t.id} style={{background:"var(--surface-1)",border:"0.5px solid var(--border)",borderRadius:14,padding:"18px",opacity:t.is_active?1:.5}}>
            <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:12}}>
              <div style={{width:42,height:42,borderRadius:"50%",background:T.pu,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"white",flexShrink:0}}>
                {t.full_name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:500}}>{t.full_name}</div>
                <div style={{fontSize:11,color:"var(--text-secondary)"}}>{t.role_title}</div>
              </div>
            </div>
            <Badge color={DEPT_COL[t.department]||"gray"}>{t.department}</Badge>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12}}>
              <label style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:"var(--text-secondary)",cursor:"pointer"}}>
                <Toggle checked={t.is_active} onChange={()=>toggle(t.id)}/>{t.is_active?"Active":"Hidden"}
              </label>
              <div style={{display:"flex",gap:5}}>
                <Btn variant="ghost" onClick={()=>openEdit(t)}><Edit2 size={11}/></Btn>
                <Btn variant="ghost" danger onClick={()=>del(t.id)}><Trash2 size={11}/></Btn>
              </div>
            </div>
          </div>
        ))}
      </div>
      {modal && (
        <Modal title={modal==="new"?"Add team member":"Edit team member"} onClose={()=>setModal(null)}>
          <Fld label="Full name" required><Inp value={form.full_name||""} onChange={f("full_name")} placeholder="Full name"/></Fld>
          <Fld label="Role / title" required><Inp value={form.role_title||""} onChange={f("role_title")} placeholder="e.g. Marketing Manager"/></Fld>
          <Fld label="Department">
            <Sel value={form.department||"Operations"} onChange={f("department")} options={["Management","Marketing","Customer Service","Operations","Finance"].map(v=>({value:v,label:v}))}/>
          </Fld>
          <div style={{display:"flex",gap:20,marginBottom:16}}>
            <label style={{display:"flex",alignItems:"center",gap:7,fontSize:13,cursor:"pointer"}}><Toggle checked={!!form.is_active} onChange={v=>setForm(p=>({...p,is_active:v}))}/>Active</label>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
            <Btn onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn variant="primary" icon={Save} onClick={save}>Save</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Halal Destinations ────────────────────────────────────────────
function HalalDestPage({ showToast }) {
  const [items, setItems] = useState(M_HALAL_DEST);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const f = k => v => setForm(p=>({...p,[k]:v}));

  const openNew  = ()=>{setForm({country_name:"",flag_emoji:"",badge_label:"",duration_text:"",starting_price_text:"",is_active:true,display_order:items.length+1});setModal("new");};
  const openEdit = r=>{setForm({...r});setModal("edit");};
  const save = ()=>{
    if(!form.country_name)return;
    if(modal==="new")setItems(p=>[...p,{...form,id:uid()}]);
    else setItems(p=>p.map(d=>d.id===form.id?form:d));
    showToast("Destination saved"); setModal(null);
  };
  const del = id=>{setItems(p=>p.filter(d=>d.id!==id));showToast("Deleted","error");};
  const toggle = id=>setItems(p=>p.map(d=>d.id===id?{...d,is_active:!d.is_active}:d));

  return (
    <div style={{position:"relative",minHeight:400}}>
      <PgHeader title="Halal destinations" sub="Countries shown on the Halal Tour page."
        action={<Btn variant="primary" icon={Plus} onClick={openNew}>Add destination</Btn>}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:12}}>
        {items.map(d=>(
          <div key={d.id} style={{background:"var(--surface-1)",border:"0.5px solid var(--border)",borderRadius:14,padding:"16px",opacity:d.is_active?1:.55}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:11}}>
              <span style={{fontSize:24}}>{d.flag_emoji}</span>
              <div>
                <div style={{fontSize:14,fontWeight:500}}>{d.country_name}</div>
                <div style={{fontSize:11,color:"var(--text-muted)"}}>{d.badge_label}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
              <Badge color="gray">{d.duration_text}</Badge>
              <Badge color="gold">ab {d.starting_price_text}</Badge>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <label style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:"var(--text-secondary)",cursor:"pointer"}}>
                <Toggle checked={d.is_active} onChange={()=>toggle(d.id)}/>{d.is_active?"Active":"Hidden"}
              </label>
              <div style={{display:"flex",gap:5}}>
                <Btn variant="ghost" onClick={()=>openEdit(d)}><Edit2 size={11}/></Btn>
                <Btn variant="ghost" danger onClick={()=>del(d.id)}><Trash2 size={11}/></Btn>
              </div>
            </div>
          </div>
        ))}
      </div>
      {modal && (
        <Modal title={modal==="new"?"Add destination":"Edit destination"} onClose={()=>setModal(null)}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 72px",gap:12}}>
            <Fld label="Country name" required><Inp value={form.country_name||""} onChange={f("country_name")} placeholder="Turki"/></Fld>
            <Fld label="Flag"><Inp value={form.flag_emoji||""} onChange={f("flag_emoji")} placeholder="🇹🇷"/></Fld>
          </div>
          <Fld label="Badge label"><Inp value={form.badge_label||""} onChange={f("badge_label")} placeholder="🔥 Terpopuler"/></Fld>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Fld label="Duration"><Inp value={form.duration_text||""} onChange={f("duration_text")} placeholder="10D7N"/></Fld>
            <Fld label="Starting price"><Inp value={form.starting_price_text||""} onChange={f("starting_price_text")} placeholder="Rp 15,5 Jt"/></Fld>
          </div>
          <div style={{display:"flex",gap:20,marginBottom:16}}>
            <label style={{display:"flex",alignItems:"center",gap:7,fontSize:13,cursor:"pointer"}}><Toggle checked={!!form.is_active} onChange={v=>setForm(p=>({...p,is_active:v}))}/>Active</label>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
            <Btn onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn variant="primary" icon={Save} onClick={save}>Save</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Halal Packages ────────────────────────────────────────────────
function HalalPkgsPage({ showToast }) {
  const [items, setItems] = useState(M_HALAL_PKGS);
  const toggleFeatured = id=>setItems(p=>p.map(h=>({...h,is_featured:h.id===id?!h.is_featured:false})));
  const toggleActive   = id=>setItems(p=>p.map(h=>h.id===id?{...h,is_active:!h.is_active}:h));
  const del = id=>{setItems(p=>p.filter(h=>h.id!==id));showToast("Deleted","error");};
  return (
    <div>
      <PgHeader title="Halal packages" sub="Tour packages linked to destinations."
        action={<Btn variant="primary" icon={Plus} onClick={()=>showToast("Full form coming soon","info")}>Add package</Btn>}/>
      <div style={{background:"var(--surface-1)",borderRadius:12,border:"0.5px solid var(--border)"}}>
        <Tbl rows={items} cols={[
          { key:"name",     label:"Package",  render:r=>(
            <div>
              <div style={{fontWeight:500,fontSize:12,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.name}</div>
              <div style={{fontSize:11,color:"var(--text-muted)"}}>{r.tag_line}</div>
            </div>
          )},
          { key:"price",    label:"Price",    render:r=><span style={{fontSize:12,fontWeight:600,color:T.pu}}>{r.price_display_text}</span> },
          { key:"departs",  label:"Departs",  render:r=><Badge color="gold">{r.departure_month}</Badge> },
          { key:"seats",    label:"Seats",    render:r=><SeatBar total={30} remaining={r.seats_remaining}/> },
          { key:"featured", label:"Featured", render:r=><Toggle checked={r.is_featured} onChange={()=>toggleFeatured(r.id)}/> },
          { key:"active",   label:"Active",   render:r=><Toggle checked={r.is_active}   onChange={()=>toggleActive(r.id)}/> },
          { key:"actions",  label:"",         render:r=>(
            <div style={{display:"flex",gap:5}}>
              <Btn variant="ghost" onClick={()=>showToast("Edit form would open","info")}><Edit2 size={12}/></Btn>
              <Btn variant="ghost" danger onClick={()=>del(r.id)}><Trash2 size={12}/></Btn>
            </div>
          )},
        ]}/>
      </div>
    </div>
  );
}

// ── Site Settings ─────────────────────────────────────────────────
function SettingsPage({ showToast }) {
  const [form, setForm] = useState({ ...M_SETTINGS });
  const f = k => v => setForm(p => ({ ...p, [k]:v }));
  return (
    <div>
      <PgHeader title="Site settings" sub="Changes propagate to all WhatsApp CTAs, footer, and trust strip across every public page."/>
      <div style={{background:"var(--surface-1)",borderRadius:14,border:"0.5px solid var(--border)",padding:"26px",maxWidth:600}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <Fld label="Phone display" required><Inp value={form.phone_display} onChange={f("phone_display")} placeholder="0813-1201-7883"/></Fld>
          <Fld label="WhatsApp number (E.164)" required><Inp value={form.whatsapp_number} onChange={f("whatsapp_number")} placeholder="6281312017883"/></Fld>
        </div>
        <Fld label="Office address" required><Inp value={form.office_address} onChange={f("office_address")} placeholder="Full address"/></Fld>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <Fld label="CS representative name" required><Inp value={form.cs_name} onChange={f("cs_name")} placeholder="CS name"/></Fld>
          <Fld label="PPIU license number" required><Inp value={form.ppiu_license} onChange={f("ppiu_license")} placeholder="SK PPIU No. …"/></Fld>
        </div>
        <div style={{background:T.pl,borderRadius:10,padding:"12px 14px",marginBottom:20,fontSize:12,color:T.pu}}>
          <strong>Note:</strong> Changing the WhatsApp number affects all "Konsultasi Gratis" CTAs and the mobile bottom bar across all 7 public pages. Save carefully.
        </div>
        <Btn variant="primary" icon={Save} size="md" onClick={()=>showToast("Settings saved successfully")}>Save settings</Btn>
      </div>
    </div>
  );
}

// ── Users ─────────────────────────────────────────────────────────
function UsersPage({ showToast }) {
  const [items, setItems] = useState(M_USERS);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const f = k => v => setForm(p=>({...p,[k]:v}));

  const openNew  = ()=>{setForm({full_name:"",email:"",role:"editor",is_active:true});setModal("new");};
  const save = ()=>{
    if(!form.full_name||!form.email)return;
    setItems(p=>[...p,{...form,id:uid(),last_login:"—"}]);
    showToast("User created"); setModal(null);
  };
  const toggle = id=>setItems(p=>p.map(u=>u.id===id?{...u,is_active:!u.is_active}:u));
  const resetPwd = email=>showToast(`Password reset email sent to ${email}`,"info");

  return (
    <div style={{position:"relative",minHeight:400}}>
      <PgHeader title="User management" sub="Only super_admin can access this section."
        action={<Btn variant="primary" icon={Plus} onClick={openNew}>Add user</Btn>}/>
      <div style={{background:"var(--surface-1)",borderRadius:12,border:"0.5px solid var(--border)"}}>
        <Tbl rows={items} cols={[
          { key:"full_name", label:"User", render:r=>(
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              <div style={{width:30,height:30,borderRadius:"50%",background:T.pu,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"white",flexShrink:0}}>
                {r.full_name.slice(0,2).toUpperCase()}
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:500}}>{r.full_name}</div>
                <div style={{fontSize:11,color:"var(--text-muted)"}}>{r.email}</div>
              </div>
            </div>
          )},
          { key:"role",        label:"Role",       render:r=><Badge color={ROLE_COL[r.role]||"gray"}>{r.role}</Badge> },
          { key:"last_login",  label:"Last login",  render:r=><span style={{fontSize:11,color:"var(--text-muted)"}}>{r.last_login}</span> },
          { key:"is_active",   label:"Active",      render:r=><Toggle checked={r.is_active} onChange={()=>toggle(r.id)}/> },
          { key:"actions",     label:"",            render:r=>(
            <Btn variant="secondary" size="sm" onClick={()=>resetPwd(r.email)}>Reset password</Btn>
          )},
        ]}/>
      </div>
      {modal && (
        <Modal title="Add user" onClose={()=>setModal(null)}>
          <Fld label="Full name" required><Inp value={form.full_name||""} onChange={f("full_name")} placeholder="Full name"/></Fld>
          <Fld label="Email" required><Inp type="email" value={form.email||""} onChange={f("email")} placeholder="user@ssumroh.id"/></Fld>
          <Fld label="Role">
            <Sel value={form.role||"editor"} onChange={f("role")} options={[{value:"super_admin",label:"Super Admin"},{value:"admin",label:"Admin"},{value:"editor",label:"Editor"},{value:"cs_agent",label:"CS Agent"}]}/>
          </Fld>
          <div style={{background:"#FFF7ED",border:"0.5px solid #FED7AA",borderRadius:8,padding:"10px 13px",marginBottom:16,fontSize:12,color:"#92400E"}}>
            A temporary password will be shown once. The user must change it on first login.
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
            <Btn onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn variant="primary" icon={Save} onClick={save}>Create user</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Audit Log ─────────────────────────────────────────────────────
function AuditPage() {
  return (
    <div>
      <PgHeader title="Audit log" sub="Tamper-evident log of all write operations. Read-only."
        action={<Btn icon={Download} onClick={()=>{}}>Export log</Btn>}/>
      <div style={{background:"var(--surface-1)",borderRadius:12,border:"0.5px solid var(--border)"}}>
        <Tbl rows={M_AUDIT} cols={[
          { key:"ts",        label:"Timestamp", render:r=><span style={{fontSize:11,color:"var(--text-muted)",fontFamily:"monospace"}}>{r.ts}</span> },
          { key:"user",      label:"User",       render:r=><span style={{fontSize:12,fontWeight:500}}>{r.user}</span> },
          { key:"action",    label:"Action",     render:r=><Badge color={ACT_COL[r.action]||"gray"}>{r.action}</Badge> },
          { key:"entity",    label:"Entity",     render:r=>(
            <span style={{fontSize:12}}>
              <span style={{fontFamily:"monospace",color:T.pu}}>{r.entity}</span>
              <span style={{color:"var(--text-muted)"}}> #{r.entity_id}</span>
            </span>
          )},
          { key:"detail",    label:"Detail",     render:r=><span style={{fontSize:12,color:"var(--text-secondary)"}}>{r.detail}</span> },
        ]}/>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────
const PAGE_MAP = {
  dashboard:    p => <Dashboard schedules={p.schedules}/>,
  settings:     p => <SettingsPage showToast={p.showToast}/>,
  packages:     p => <PackagesPage showToast={p.showToast}/>,
  schedules:    p => <SchedulesPage showToast={p.showToast}/>,
  "halal-dest": p => <HalalDestPage showToast={p.showToast}/>,
  "halal-pkgs": p => <HalalPkgsPage showToast={p.showToast}/>,
  testimonials: p => <TestimonialsPage showToast={p.showToast}/>,
  faqs:         p => <FAQPage showToast={p.showToast}/>,
  gallery:      p => <GalleryPage showToast={p.showToast}/>,
  team:         p => <TeamPage showToast={p.showToast}/>,
  leads:        p => <LeadsPage showToast={p.showToast}/>,
  corporate:    p => <CorporatePage showToast={p.showToast}/>,
  users:        p => <UsersPage showToast={p.showToast}/>,
  audit:        p => <AuditPage/>,
};

export default function AdminPanel() {
  const [page, setPage] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const [schedules] = useState(M_SCHEDULES);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const render = PAGE_MAP[page];

  return (
    <div style={{ display:"flex", minHeight:"100vh",
      fontFamily:"system-ui, -apple-system, sans-serif", fontSize:14 }}>
      <Sidebar page={page} setPage={setPage} role="super_admin"/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        <Topbar page={page}/>
        <main style={{ flex:1, padding:22, background:"var(--surface-0)",
          position:"relative", overflowX:"hidden" }}>
          {render ? render({ showToast, schedules }) : null}
          {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
        </main>
      </div>
    </div>
  );
}
