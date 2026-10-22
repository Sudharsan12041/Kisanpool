import { useNavigate } from "react-router-dom";
import { useLang } from "../LanguageContext";

export default function RoleSelect() {
  const navigate = useNavigate();
  const { t } = useLang();

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-green-50 px-5 py-12">
      <main className="w-full max-w-md">
        {/* Hero section */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-green-700 sm:text-5xl">
            KisanPool
          </h1>
          <p className="mt-3 text-lg text-gray-600">Sell together. Earn more.</p>
        </header>

        <div className="flex flex-col gap-5">
          {/* Farmer role card */}
          <button
            onClick={() => navigate("/farmer/add")}
            className="flex w-full items-center gap-5 rounded-2xl bg-white p-5 text-left shadow transition hover:shadow-lg active:scale-95"
          >
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
              <svg
                aria-hidden="true"
                className="size-7"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <path d="M7 20h10" />
                <path d="M10 20c5.5-2.5 8-6.5 8-12-5.5 0-9.5 2.5-12 8" />
                <path d="M8 12c-2.5 0-4-1.5-4-4 4 0 6 1.5 6 4" />
              </svg>
            </span>
            <span>
              <span className="block text-xl font-semibold text-green-700">
                {t.farmer}
              </span>
              <span className="mt-1 block text-sm text-gray-600">
                Pool your harvest and sell together.
              </span>
            </span>
          </button>

          {/* Buyer role card */}
          <button
            onClick={() => navigate("/buyer")}
            className="flex w-full items-center gap-5 rounded-2xl bg-white p-5 text-left shadow transition hover:shadow-lg active:scale-95"
          >
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <svg
                aria-hidden="true"
                className="size-7"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.72a2 2 0 0 0 2-1.58L22 7H5" />
              </svg>
            </span>
            <span>
              <span className="block text-xl font-semibold text-green-700">
                {t.buyer}
              </span>
              <span className="mt-1 block text-sm text-gray-600">
                Find fresh produce from local farmers.
              </span>
            </span>
          </button>
        </div>
      </main>
    </div>
  );
}