import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Leaf,
  Map,
  Menu,
  PackagePlus,
  ShoppingBasket,
  SlidersHorizontal,
  Sprout,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import { useLang } from "../useLang";

const navigation = {
  farmer: [
    { to: "/farmer/lots", key: "overview", icon: Sprout },
    { to: "/farmer/add", key: "addProduceNav", icon: PackagePlus },
    { to: "/map", key: "liveMap", icon: Map },
    { to: "/prices", key: "marketPrices", icon: WalletCards },
    { to: "/quality", key: "qualityGrading", icon: Leaf },
  ],
  buyer: [
    { to: "/buyer", key: "marketplace", icon: ShoppingBasket },
    { to: "/map", key: "liveMap", icon: Map },
    { to: "/prices", key: "marketPrices", icon: WalletCards },
  ],
  agent: [{ to: "/agent", key: "deliveryTasks", icon: ClipboardList }],
};

const titles = {
  "/farmer/lots": "Farmer overview",
  "/farmer/add": "Add produce",
  "/buyer": "Explore marketplace",
  "/agent": "Delivery workspace",
  "/map": "Live pooling map",
  "/prices": "Market prices",
  "/quality": "Quality grading",
  "/notifications": "Notifications",
  "/profile": "Profile",
  "/settings": "Settings",
};

export default function AppShell({ role: suppliedRole }) {
  const requestedRole = suppliedRole || window.localStorage.getItem("kisanpool-role") || "farmer";
  const role = navigation[requestedRole] ? requestedRole : "farmer";
  const { lang, setLang, t } = useLang();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    if (suppliedRole) window.localStorage.setItem("kisanpool-role", suppliedRole);
  }, [suppliedRole]);
  const title =
    location.pathname.startsWith("/order/") ? "Order tracking" :
      location.pathname.startsWith("/lot/") ? "Pooling lot details" :
        titles[location.pathname] || "KisanPool";
  const roleLabel = role === "agent" ? t.deliveryAgent : role === "buyer" ? t.buyer : t.farmer;

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <div className={`app-layout ${collapsed ? "sidebar-collapsed" : ""}`}>
      {mobileOpen && <button className="mobile-scrim" aria-label="Close menu" onClick={closeMobile} />}
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <Link className="brand-lockup" to="/" onClick={closeMobile}>
          <span className="brand-mark"><Leaf size={21} strokeWidth={2.2} /></span>
          <span className="brand-copy"><strong>KisanPool</strong><small>GROW TOGETHER</small></span>
          <button className="mobile-close" aria-label="Close menu" onClick={(event) => { event.preventDefault(); closeMobile(); }}>
            <X size={19} />
          </button>
        </Link>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label={`${roleLabel} navigation`}>
          {navigation[role].map(({ to, key, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeMobile}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              <Icon size={19} />
              <span>{t[key]}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-divider" />
          <NavLink to="/notifications" onClick={closeMobile} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <Bell size={19} /><span>{t.notifications}</span>
          </NavLink>
          <NavLink to="/profile" onClick={closeMobile} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <UserRound size={19} /><span>{t.profile}</span>
          </NavLink>
          <NavLink to="/settings" onClick={closeMobile} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <SlidersHorizontal size={19} /><span>{t.settings}</span>
          </NavLink>
          <div className="sidebar-role">
            <span className="role-avatar"><Leaf size={16} /></span>
            <span className="role-copy"><strong>{roleLabel}</strong><small>Demo workspace</small></span>
            <ChevronDown size={16} />
          </div>
        </div>
        <button className="collapse-toggle" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
        </button>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="topbar-leading">
            <button className="mobile-menu" aria-label="Open menu" onClick={() => setMobileOpen(true)}><Menu size={21} /></button>
            <div>
              <div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><span>{title}</span></div>
              <h1>{title}</h1>
            </div>
          </div>
          <div className="topbar-actions">
            <label className="language-control" aria-label="Select language">
              <span className="language-globe">文</span>
              <select value={lang} onChange={(event) => setLang(event.target.value)}>
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="ta">தமிழ்</option>
              </select>
              <ChevronDown size={14} />
            </label>
            <Link to="/notifications" className="icon-button notification-button" aria-label="Notifications"><Bell size={19} /></Link>
            <Link to="/profile" className="topbar-profile">
              <span className="profile-avatar">{roleLabel.charAt(0)}</span>
              <span className="profile-label"><strong>{roleLabel}</strong><small>Demo account</small></span>
              <ChevronDown size={15} />
            </Link>
            <Link to="/" className="help-button" aria-label="Switch role"><CircleHelp size={18} /></Link>
          </div>
        </header>
        <main className="page-content"><Outlet /></main>
        <footer className="app-footer">
          <span>© 2026 KisanPool</span>
          <span>Built for a fairer harvest <Leaf size={13} /></span>
        </footer>
      </div>
    </div>
  );
}
