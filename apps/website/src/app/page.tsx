import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { REGION_CONFIG, resolveRegion } from "../config/region";
import { RegionSwitcher } from "../components/RegionSwitcher";
import { BackendHealthCheck } from "../components/BackendHealthCheck";

export default async function HomePage() {
  const t = await getTranslations("HomePage");
  const cookieStore = await cookies();
  const currentRegionCode = cookieStore.get(REGION_CONFIG.cookieName)?.value;
  const region = resolveRegion(currentRegionCode);

  return (
    <main className="min-h-screen flex flex-col justify-between p-6 md:p-12 max-w-5xl mx-auto">
      <header className="flex items-center justify-between border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan via-purple to-pink flex items-center justify-center text-white font-extrabold text-xl shadow-md">
            N
          </div>
          <div>
            <h1 className="font-bold text-lg text-ink tracking-tight">
              NEXORA
            </h1>
            <p className="text-[11px] uppercase tracking-wider text-muted font-semibold">
              Growth Platform
            </p>
          </div>
        </div>

        {/* Region Switcher Placeholder */}
        <RegionSwitcher currentRegion={region} />
      </header>

      <section className="my-16 text-center flex flex-col items-center">
        <div className="inline-block px-3 py-1 mb-4 rounded-full bg-purple-light text-purple text-xs font-semibold">
          {t("regionBadge")}
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-navy tracking-tight max-w-2xl">
          {t("title")}
        </h2>
        <p className="mt-4 text-base text-muted max-w-xl">{t("subtitle")}</p>

        <div className="mt-10 w-full flex justify-center">
          <BackendHealthCheck />
        </div>
      </section>

      <footer className="border-t border-border pt-6 text-center text-xs text-muted">
        <p>© Nexora Digital Marketing Platform · Step 1 Foundation</p>
      </footer>
    </main>
  );
}
