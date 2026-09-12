import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowRight, CalendarDays, Check, ImagePlus, LockKeyhole, MessageCircle, Plus, Scissors, Sparkles, Trash2, UserRound, X } from "lucide-react";
import "./styles.css";

const API = import.meta.env.VITE_API_URL || "/api";
const adminNumber = "917799553251";

async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, { headers: { "Content-Type": "application/json", ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}) }, ...options, body: options.body ? JSON.stringify(options.body) : undefined });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.message || "Something went wrong");
  return data;
}

function App() {
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem("kala-session") || "null"));
  const [showLogin, setShowLogin] = useState(!session);
  const [intro, setIntro] = useState(false);
  const [services, setServices] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [toast, setToast] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const photoFor = (slot, fallback) => photos.find((photo) => photo.slot === slot)?.image || fallback;
  const heroSlides = [
    { src: photoFor("hero-1", "/admin-hero-picture.png"), label: "Glow rituals", detail: "Signature facials" },
    { src: photoFor("hero-2", "/admin-picture.png"), label: "Soft glam", detail: "Makeup artistry" },
    { src: photoFor("hero-3", "/admin-hero-picture.png"), label: "Fresh finish", detail: "Skin-first care" }
  ];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 3500);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => { api("/services").then(setServices).catch(() => {}); }, []);
  useEffect(() => { api("/photos").then(setPhotos).catch(() => {}); }, []);
  useEffect(() => {
    if (session) api("/bookings", { token: session.token }).then(setBookings).catch((error) => notify(error.message));
  }, [session]);
  const refreshBookings = () => api("/bookings", { token: session.token }).then(setBookings).catch((error) => notify(error.message));
  const enter = (data) => {
    localStorage.setItem("kala-session", JSON.stringify(data));
    setSession(data); setShowLogin(false); setIntro(true);
    const context = new AudioContext();
    const progression = [
      [261.63, 329.63, 392.0],
      [329.63, 392.0, 493.88],
      [392.0, 493.88, 587.33],
      [329.63, 392.0, 493.88],
      [261.63, 329.63, 392.0],
    ];

    progression.forEach((chord, index) => {
      const startTime = context.currentTime + index * 0.9;

      chord.forEach((frequency, toneIndex) => {
        const oscillator = context.createOscillator();
        const harmonics = context.createOscillator();
        const gain = context.createGain();
        const stereo = context.createStereoPanner();

        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        harmonics.type = "triangle";
        harmonics.frequency.value = frequency * 2;

        const panValue = (toneIndex - (chord.length - 1) / 2) * 0.35;
        stereo.pan.value = panValue;

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.028, startTime + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.018, startTime + 0.9);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.7);

        oscillator.connect(gain).connect(stereo).connect(context.destination);
        harmonics.connect(gain);
        oscillator.start(startTime);
        harmonics.start(startTime);
        oscillator.stop(startTime + 1.8);
        harmonics.stop(startTime + 1.8);
      });
    });
    setTimeout(() => setIntro(false), 10000);
  };
  const notify = (message) => { setToast(message); setTimeout(() => setToast(""), 3500); };
  if (showLogin) return <Login onSuccess={enter} />;
  return <><header className="topbar"><a className="brand" href="#home"><img className="brand-mark" src="/kala-logo.png" alt="Kala Beauty Parlour logo" /><span>Kala <small>BEAUTY PARLOUR</small></span></a><nav><a href="#services">Services</a><a href="#story">Our story</a><a className="whatsapp-link" href={`https://wa.me/${adminNumber}`} target="_blank" rel="noreferrer"><MessageCircle size={16}/> WhatsApp</a></nav><button className="logout" onClick={() => { localStorage.removeItem("kala-session"); setSession(null); setShowLogin(true); }}>Sign out</button></header>
    <main><section id="home" className="hero"><div className="hero-copy"><p className="eyebrow"><Sparkles size={16}/> A little luxury, just for you</p><h1>Feel beautiful.<br/><em>Feel like Kala.</em></h1><p className="hero-text">Thoughtful beauty rituals, made personal. Step into a warm, welcoming space where your glow is our favourite thing.</p><a className="primary-button" href="#services">Explore our services <ArrowRight size={18}/></a></div><div className="hero-art"><div className="sun"></div><div className="carousel-window" aria-live="polite"><div className="carousel-track" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>{heroSlides.map((slide) => <div className="carousel-slide" key={`${slide.label}-${slide.detail}`}><img src={slide.src} alt={slide.label} /><div className="slide-tag"><strong>{slide.label}</strong><span>{slide.detail}</span></div></div>)}</div></div><div className="carousel-dots" aria-label="Hero image carousel">{heroSlides.map((slide, index) => <button key={slide.label} type="button" className={index === activeSlide ? "dot active" : "dot"} aria-label={`Show slide ${index + 1}`} onClick={() => setActiveSlide(index)} />)}</div><div className="float-card"><span>10</span><div>years of<br/>beauty & care</div></div></div></section>
      <section id="story" className="story"><div><p className="eyebrow">The Kala touch</p><h2>Ten years of making<br/><em>everyday moments special.</em></h2></div><div className="story-copy"><p>Founded and led by Kala, our certified beautician, Kala Beauty Parlour is a calm little corner for your self-care. We believe beauty is never one-size-fits-all — it is the confidence you carry home.</p><div className="signature">Kala <span>✦</span></div></div></section>
      <section id="services" className="services"><div className="section-heading"><div><p className="eyebrow">Curated for your glow</p><h2>Our services</h2></div>{session?.user?.role === "admin" && <><AdminPanel token={session.token} onChange={() => api("/services").then(setServices)} notify={notify}/><PhotoPanel token={session.token} photos={photos} onChange={() => api("/photos").then(setPhotos)} notify={notify}/></>}</div><div className="service-grid">{services.length ? services.map((service) => <article className="service-card" key={service._id}><div className="service-icon">{service.category === "Facial" ? <Sparkles/> : <Scissors/>}</div><p className="category">{service.category}</p><h3>{service.name}</h3><p>{service.description}</p><strong>₹{service.price.toLocaleString("en-IN")}</strong>{session?.user?.role === "admin" && <button className="small-button danger service-remove" type="button" onClick={async () => { if (!window.confirm(`Remove ${service.name}?`)) return; try { await api(`/services/${service._id}`, { method: "DELETE", token: session.token }); await api("/services").then(setServices); notify("Service removed"); } catch (error) { notify(error.message); } }}><Trash2 size={14}/> Remove service</button>}</article>) : <div className="empty-services"><Sparkles/><p>New makeup and facial rituals are being prepared.<br/>Check back soon or message Kala to book.</p></div>}</div></section>
      <BookingSection session={session} services={services} bookings={bookings} onChange={refreshBookings} notify={notify}/>
      <section className="contact"><div><p className="eyebrow">Let's plan your glow</p><h2>Have a question?<br/><em>We'd love to hear from you.</em></h2></div><a className="primary-button light" href={`https://wa.me/${adminNumber}?text=Hello%20Kala%20Beauty%20Parlour`} target="_blank" rel="noreferrer"><MessageCircle size={18}/> Chat with Kala on WhatsApp</a></section></main><footer><span>© {new Date().getFullYear()} Kala Beauty Parlour</span><span>Certified care · Since 2014</span><a href="tel:+917799553251">7799553251</a></footer><nav className="mobile-nav" aria-label="Mobile navigation"><a href="#home"><Sparkles size={18}/><span>Home</span></a><a href="#services"><Scissors size={18}/><span>Services</span></a><a href="#bookings"><CalendarDays size={18}/><span>Book</span></a><a href={`https://wa.me/${adminNumber}`} target="_blank" rel="noreferrer"><MessageCircle size={18}/><span>Chat</span></a></nav>{intro && <Intro/>}{toast && <div className="toast">{toast}</div>}</>;
}

function Login({ onSuccess }) {
  const [mode, setMode] = useState("login"); const [form, setForm] = useState({ phone: "", password: "", otp: "" }); const [step, setStep] = useState(1); const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  const submit = async (event) => { event.preventDefault(); setError(""); setNotice(""); try { if (mode === "forgot" && step === 1) { const data = await api("/auth/request-otp", { method: "POST", body: { phone: form.phone } }); setStep(2); setNotice(data.message); return; } if (mode === "forgot") { await api("/auth/reset-password", { method: "POST", body: form }); setMode("login"); setStep(1); setForm({ phone: form.phone, password: "", otp: "" }); setNotice("Password updated. Sign in with your new password."); return; } const data = await api(mode === "login" ? "/auth/login" : "/auth/register", { method: "POST", body: form }); onSuccess(data); } catch (e) { setError(e.message); } };
  const title = mode === "login" ? "Come on in." : mode === "register" ? "Let's get you glowing." : step === 1 ? "Reset your password." : "Create a new password.";
  const eyebrow = mode === "login" ? "Welcome back" : mode === "register" ? "Create your account" : step === 1 ? "Forgot password" : "Verify your number";
  const description = mode === "login" ? "Sign in with your phone number and password." : mode === "register" ? "Create your account with your phone number and a password." : step === 1 ? "We'll generate an OTP for your phone number." : `Enter the code sent for ${form.phone}, then choose a new password.`;
  return <div className="auth-page"><div className="auth-visual"><img className="auth-admin-picture" src="/admin-picture.png" alt="" /><div className="auth-orb"></div><p className="eyebrow">KALA BEAUTY PARLOUR</p><h1>Your glow<br/><em>starts here.</em></h1><p>Ten years of beauty, care and confidence — created by Kala, for you.</p></div><div className="auth-panel"><div className="auth-logo"><img className="brand-mark" src="/kala-logo.png" alt="Kala Beauty Parlour logo" /><span>Kala <small>BEAUTY PARLOUR</small></span></div><div className="auth-form"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p className="muted">{description}</p><form onSubmit={submit}>{mode === "forgot" && step === 2 && <label>Verification code<input required value={form.otp} onChange={update("otp")} placeholder="6-digit OTP" inputMode="numeric"/></label>}{(mode !== "forgot" || step === 1) && <label><UserRound size={16}/> Phone number<input required value={form.phone} onChange={update("phone")} placeholder="10-digit phone number" inputMode="tel"/></label>}{mode === "register" && <label><LockKeyhole size={16}/> Password<input required type="password" value={form.password} onChange={update("password")} placeholder="At least 6 characters"/></label>}{mode === "login" && <label><LockKeyhole size={16}/> Password<input required type="password" value={form.password} onChange={update("password")} placeholder="Your password"/></label>}{mode === "forgot" && step === 2 && <label><LockKeyhole size={16}/> New password<input required type="password" value={form.password} onChange={update("password")} placeholder="At least 6 characters"/></label>}<button className="primary-button full" type="submit">{mode === "login" ? "Sign in" : mode === "register" ? "Create account" : step === 1 ? "Generate OTP" : "Update password"} <ArrowRight size={17}/></button></form>{notice && <p className="notice">{notice}</p>}{error && <p className="error">{error}</p>}{mode === "login" && <button className="text-button" onClick={() => { setMode("forgot"); setStep(1); setError(""); setNotice(""); }}>Forgot password?</button>}<button className="text-button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setStep(1); setError(""); setNotice(""); setForm({ phone: "", password: "", otp: "" }); }}>{mode === "login" ? "New here? Create an account" : "Back to sign in"}</button></div></div></div>;
}

function BookingSection({ session, services, bookings, onChange, notify }) {
  const [form, setForm] = useState({ serviceId: "", preferredDate: "", preferredTime: "", note: "" });
  const [saving, setSaving] = useState(false);
  const [responses, setResponses] = useState({});
  const today = new Date().toISOString().slice(0, 10);
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api("/bookings", { method: "POST", token: session.token, body: form });
      setForm({ serviceId: "", preferredDate: "", preferredTime: "", note: "" });
      notify("Booking request sent to Kala");
      onChange();
    } catch (error) {
      notify(error.message);
    } finally {
      setSaving(false);
    }
  };
  const updateResponse = (id, key, value) => setResponses({ ...responses, [id]: { ...responses[id], [key]: value } });
  const decide = async (booking, status) => {
    const response = responses[booking._id] || {};
    try {
      await api(`/bookings/${booking._id}`, {
        method: "PATCH",
        token: session.token,
        body: { status, confirmedDate: response.confirmedDate || "", confirmedTime: response.confirmedTime || "", adminMessage: response.adminMessage || "" }
      });
      notify(`Booking ${status}`);
      onChange();
    } catch (error) {
      notify(error.message);
    }
  };
  const clearAppointments = async () => {
    if (!window.confirm("Clear all appointments? This cannot be undone.")) return;
    try {
      await api("/bookings", { method: "DELETE", token: session.token });
      notify("Appointments cleared");
      onChange();
    } catch (error) {
      notify(error.message);
    }
  };
  return <section id="bookings" className="bookings"><div className="section-heading"><div><p className="eyebrow"><CalendarDays size={15}/> Appointments</p><h2>{session.user.role === "admin" ? "Manage bookings" : "Book your glow"}</h2></div>{session.user.role === "admin" && bookings.length > 0 && <button className="small-button danger" type="button" onClick={clearAppointments}><Trash2 size={14}/> Clear appointments</button>}</div>{session.user.role === "customer" ? <><form className="booking-form" onSubmit={submit}><label>Service<select required value={form.serviceId} onChange={(event) => setForm({ ...form, serviceId: event.target.value })}><option value="">Choose a service</option>{services.map((service) => <option key={service._id} value={service._id}>{service.name}</option>)}</select></label><label>Preferred date<input required type="date" min={today} value={form.preferredDate} onChange={(event) => setForm({ ...form, preferredDate: event.target.value })}/></label><label>Preferred time<input required type="time" value={form.preferredTime} onChange={(event) => setForm({ ...form, preferredTime: event.target.value })}/></label><label className="booking-note">Message for Kala<textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Anything we should know?"/></label><button className="primary-button" disabled={saving} type="submit">{saving ? "Sending..." : "Request appointment"} <ArrowRight size={17}/></button></form><div className="booking-list">{bookings.length ? bookings.map((booking) => <article className="booking-card" key={booking._id}><div><p className="category">{booking.status}</p><h3>{booking.serviceName}</h3><p>Requested: {booking.preferredDate} at {booking.preferredTime}</p>{booking.status === "accepted" && <strong>Confirmed: {booking.confirmedDate} at {booking.confirmedTime}</strong>}{booking.adminMessage && <p className="booking-message">{booking.adminMessage}</p>}</div><span className={`booking-status ${booking.status}`}>{booking.status}</span></article>) : <p className="muted">Your appointment requests will appear here.</p>}</div></> : <div className="booking-list">{bookings.length ? bookings.map((booking) => { const response = responses[booking._id] || {}; return <article className="booking-card admin-booking" key={booking._id}><div><p className="category">{booking.status} · {booking.customerPhone}</p><h3>{booking.serviceName}</h3><p>Requested: {booking.preferredDate} at {booking.preferredTime}</p>{booking.note && <p className="booking-message">Customer note: {booking.note}</p>}</div>{booking.status === "pending" ? <div className="booking-decision"><input type="date" min={today} value={response.confirmedDate || ""} onChange={(event) => updateResponse(booking._id, "confirmedDate", event.target.value)} /><input type="time" value={response.confirmedTime || ""} onChange={(event) => updateResponse(booking._id, "confirmedTime", event.target.value)} /><input placeholder="Message to customer" value={response.adminMessage || ""} onChange={(event) => updateResponse(booking._id, "adminMessage", event.target.value)} /><div><button className="small-button" onClick={() => decide(booking, "accepted")}><Check size={14}/> Accept</button><button className="small-button reject" onClick={() => decide(booking, "rejected")}><X size={14}/> Reject</button></div></div> : <span className={`booking-status ${booking.status}`}>{booking.status}</span>}</article>; }) : <p className="muted">No booking requests yet.</p>}</div>}</section>;
}

function AdminPanel({ token, onChange, notify }) {
  const [open, setOpen] = useState(false); const [form, setForm] = useState({ name: "", description: "", price: "", category: "Makeup" });
  const submit = async (event) => { event.preventDefault(); try { await api("/services", { method: "POST", token, body: form }); setForm({ name: "", description: "", price: "", category: "Makeup" }); setOpen(false); onChange(); notify("New service added"); } catch (e) { notify(e.message); } };
  return <div className="admin-actions">{open ? <form className="admin-form" onSubmit={submit}><input required placeholder="Service name" value={form.name} onChange={(e) => setForm({...form, name:e.target.value})}/><input required placeholder="Short description" value={form.description} onChange={(e) => setForm({...form, description:e.target.value})}/><input required type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({...form, price:e.target.value})}/><select value={form.category} onChange={(e) => setForm({...form, category:e.target.value})}><option>Makeup</option><option>Facial</option></select><button className="small-button" type="submit">Publish</button><button className="text-button" type="button" onClick={() => setOpen(false)}>Cancel</button></form> : <button className="small-button" onClick={() => setOpen(true)}><Plus size={16}/> Add service</button>}</div>;
}

function PhotoPanel({ token, photos, onChange, notify }) {
  const slots = [
    { id: "hero-1", label: "Hero photo 1" },
    { id: "hero-2", label: "Hero photo 2" },
    { id: "hero-3", label: "Hero photo 3" }
  ];
  const upload = (slot) => async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      notify("Upload a JPG, PNG, WEBP, or GIF image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      notify("Image must be smaller than 5 MB");
      return;
    }
    const image = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Could not read that image"));
      reader.readAsDataURL(file);
    });
    try {
      await api(`/photos/${slot}`, { method: "PUT", token, body: { image, mimeType: file.type } });
      onChange();
      notify("Photo uploaded");
    } catch (error) {
      notify(error.message);
    }
  };
  return <div className="photo-panel"><p className="photo-panel-title"><ImagePlus size={15}/> Photos</p><div className="photo-grid">{slots.map((slot) => { const photo = photos.find((item) => item.slot === slot.id); return <label className="photo-slot" key={slot.id}><span>{slot.label}</span><img src={photo?.image || (slot.id === "hero-2" ? "/admin-picture.png" : "/admin-hero-picture.png")} alt="" /><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={upload(slot.id)} /><strong>{photo ? "Re-upload" : "Upload photo"}</strong></label>; })}</div></div>;
}

function Intro() {
  return <div className="intro"><div className="intro-content"><div className="intro-flower">✦</div><p className="eyebrow">WELCOME TO</p><h1>Kala <em>Beauty Parlour</em></h1><p>Take a breath. Your beautiful moment begins now.</p><div className="progress"><span></span></div><small>Preparing your experience</small></div></div>;
}

createRoot(document.getElementById("root")).render(<App />);
