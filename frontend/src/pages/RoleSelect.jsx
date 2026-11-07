import { useNavigate } from "react-router-dom";
import { ArrowDownRight, ArrowRight, BadgeCheck, Leaf, MapPin, Sprout, Truck, UsersRound } from "lucide-react";
import { useLang } from "../useLang";

const roles = [
  { id: "farmer", path: "/farmer/add", icon: Sprout, title: "I’m a farmer", detail: "Pool your harvest and reach more buyers.", tint: "role-green" },
  { id: "buyer", path: "/buyer", icon: UsersRound, title: "I’m a buyer", detail: "Source fresh produce directly from farms.", tint: "role-amber" },
  { id: "agent", path: "/agent", icon: Truck, title: "I’m a delivery agent", detail: "Verify and complete a delivery.", tint: "role-blue" },
];

export default function RoleSelect() {
  const navigate = useNavigate();
  const { lang, setLang, t } = useLang();

  function enterRole(role, path) {
    window.localStorage.setItem("kisanpool-role", role);
    navigate(path);
  }

  return (
    <div className="landing-page">
      <header className="landing-nav">
        <a className="brand-lockup" href="/">
          <span className="brand-mark"><Leaf size={21} /></span>
          <span className="brand-copy"><strong>KisanPool</strong><small>GROW TOGETHER</small></span>
        </a>
        <div className="landing-nav-actions"><span className="landing-tag"><span className="live-dot" /> A fairer way to move harvest</span><select className="landing-language" value={lang} onChange={(event) => setLang(event.target.value)} aria-label="Select language"><option value="en">English</option><option value="hi">हिन्दी</option><option value="ta">தமிழ்</option></select></div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-line" /> A smarter harvest starts here</p>
            <h1>Together, we grow.<br /><span>Together, we earn.</span></h1>
            <p className="hero-description">
              Empowering farmers through smart produce pooling, transparent pricing, and a marketplace built on trust.
            </p>
            <a href="#get-started" className="button button-primary hero-cta">Get started <ArrowDownRight size={17} /></a>
            <div className="hero-proof"><BadgeCheck size={17} /><span>Built for a fairer agricultural supply chain</span></div>
          </div>
          <div className="hero-visual" aria-label="Illustration of connected farms and pooled produce">
            <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
            <div className="sun-disc" />
            <div className="hero-field field-back" /><div className="hero-field field-front" />
            <div className="hero-leaf leaf-one">🌿</div><div className="hero-leaf leaf-two">🌱</div>
            <div className="hero-pool-card"><span className="pool-card-icon"><Sprout size={18} /></span><span><strong>Good things grow together</strong><small>Small harvests. Stronger markets.</small></span><MapPin size={16} /></div>
            <span className="hero-stamp">FROM<br />FARM TO<br />FAIR PRICE</span>
          </div>
        </section>

        <section className="landing-benefits" aria-label="Platform benefits">
          <div><span className="benefit-icon"><UsersRound size={19} /></span><span><strong>Pool together</strong><small>Bring nearby harvests together</small></span></div>
          <div><span className="benefit-icon"><BadgeCheck size={19} /></span><span><strong>Trade transparently</strong><small>Clear pricing and order updates</small></span></div>
          <div><span className="benefit-icon"><Truck size={19} /></span><span><strong>Deliver with trust</strong><small>OTP-confirmed delivery flow</small></span></div>
        </section>

        <section className="role-section" id="get-started">
          <div className="role-section-heading">
            <div><p className="eyebrow">YOUR KISANPOOL</p><h2>How would you like to get started?</h2></div>
            <p>Choose your workspace to continue.</p>
          </div>
          <div className="role-grid">
            {roles.map(({ id, path, icon: Icon, title, detail, tint }) => (
              <button key={id} onClick={() => enterRole(id, path)} className="role-card">
                <span className={`role-card-icon ${tint}`}><Icon size={22} /></span>
                <span className="role-card-text"><strong>{id === "farmer" ? t.farmer : id === "buyer" ? t.buyer : title}</strong><small>{detail}</small></span>
                <ArrowRight className="role-arrow" size={18} />
              </button>
            ))}
          </div>
        </section>
      </main>
      <footer className="landing-footer"><span>© 2026 KisanPool</span><span>Sell together. Earn more.</span></footer>
    </div>
  );
}
