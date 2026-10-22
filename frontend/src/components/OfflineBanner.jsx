import { useEffect, useState } from "react";

export default function OfflineBanner() {
  // navigator.onLine is the browser's own "am I connected?" flag
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);

    // The browser fires these events when the connection changes
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    // Cleanup: remove the listeners when this component disappears
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Online: render nothing at all
  if (online) return null;

  return (
    <div className="bg-red-600 px-4 py-2 text-center text-sm font-medium text-white">
      You are offline. Some features may not work.
    </div>
  );
}