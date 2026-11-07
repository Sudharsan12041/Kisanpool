import { Bell, Globe2, Info, Languages, LockKeyhole, Settings2, UserRound } from "lucide-react";
import { useLang } from "../useLang";
import { EmptyState, PageHeading } from "../components/ui";

const roleName = {
  farmer: "Farmer",
  buyer: "Buyer",
  agent: "Delivery agent",
};

export function NotificationsPage() {
  return (
    <div className="page-stack">
      <PageHeading eyebrow="UPDATES" title="Stay in the loop." description="Important activity and order updates will appear here." />
      <section className="panel notifications-panel">
        <EmptyState icon={Bell} title="No notifications yet" description="Notification events aren’t available from the current backend. This page won’t show sample or fabricated alerts." />
      </section>
      <div className="notice-card notice-blue"><Info size={18} /><div><strong>Backend requirement</strong><span>To power notifications, KisanPool needs an events/notifications API and a way to identify the signed-in user.</span></div></div>
    </div>
  );
}

export function ProfilePage() {
  const role = window.localStorage.getItem("kisanpool-role") || "farmer";
  return (
    <div className="page-stack">
      <PageHeading eyebrow="YOUR ACCOUNT" title="Profile" description="Account details are managed here when sign-in is available." />
      <section className="panel profile-panel">
        <div className="profile-large-avatar"><UserRound size={28} /></div>
        <div className="profile-details"><p className="eyebrow">CURRENT WORKSPACE</p><h3>{roleName[role] || "KisanPool member"}</h3><span className="profile-demo-badge">Demo session</span></div>
      </section>
      <div className="profile-data-grid">
        <div className="profile-data-card"><span><UserRound size={17} /></span><div><small>Name</small><strong>Not available</strong></div></div>
        <div className="profile-data-card"><span><Globe2 size={17} /></span><div><small>Location</small><strong>Not available</strong></div></div>
        <div className="profile-data-card"><span><LockKeyhole size={17} /></span><div><small>Contact & account</small><strong>Sign-in not configured</strong></div></div>
      </div>
      <div className="notice-card"><strong>Personal data is not connected</strong><span>The current app has role selection but no login, profile or account APIs. No personal details are stored or inferred.</span></div>
    </div>
  );
}

export function SettingsPage() {
  const { lang, setLang } = useLang();
  return (
    <div className="page-stack">
      <PageHeading eyebrow="PREFERENCES" title="Settings" description="Choose how KisanPool appears for this browser." />
      <section className="panel settings-panel">
        <div className="settings-section-head"><span className="settings-icon"><Languages size={19} /></span><div><h3>Language</h3><p>Your selection is saved on this device.</p></div></div>
        <label className="settings-language"><span>Display language</span><select className="form-control" value={lang} onChange={(event) => setLang(event.target.value)}><option value="en">English</option><option value="hi">हिन्दी</option><option value="ta">தமிழ்</option></select></label>
        <div className="settings-divider" />
        <div className="settings-section-head"><span className="settings-icon"><Settings2 size={19} /></span><div><h3>Appearance</h3><p>Theme options will be available when supported.</p></div><span className="coming-soon">COMING SOON</span></div>
        <p className="settings-muted">Light theme is active. Theme preference and account controls are not backed by the current application.</p>
      </section>
      <div className="notice-card notice-blue"><Info size={18} /><div><strong>Language preferences</strong><span>English, Hindi and Tamil labels are available. Some newly added interface content remains in English.</span></div></div>
    </div>
  );
}
