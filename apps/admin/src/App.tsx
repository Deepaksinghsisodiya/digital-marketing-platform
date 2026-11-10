import { useTranslation } from "react-i18next";
import {
  useGetLiveHealthQuery,
  useGetReadyHealthQuery,
} from "./store/api/healthApi";
import { formatDate } from "./utils/formatters";
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  ShieldCheck,
  Database,
} from "lucide-react";

export function App() {
  const { t } = useTranslation();
  const {
    data: liveData,
    isLoading: isLiveLoading,
    isError: isLiveError,
    refetch: refetchLive,
  } = useGetLiveHealthQuery(undefined, { pollingInterval: 15000 });

  const {
    data: readyData,
    isLoading: isReadyLoading,
    isError: isReadyError,
    refetch: refetchReady,
  } = useGetReadyHealthQuery(undefined, { pollingInterval: 15000 });

  const isConnected = !isLiveError && liveData?.status === "Healthy";

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-between p-6 md:p-10 font-sans">
      <header className="flex items-center justify-between border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple via-blue to-cyan flex items-center justify-center text-white font-black text-xl shadow-md">
            N
          </div>
          <div>
            <h1 className="text-lg font-bold text-ink tracking-tight">
              {t("app.title")}
            </h1>
            <p className="text-xs text-muted font-medium">{t("app.tagline")}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full font-semibold border border-border bg-white text-ink">
            {t("app.stepNotice")}
          </span>
        </div>
      </header>

      <main className="my-auto py-10 flex flex-col items-center">
        <div className="w-full max-w-xl bg-white border border-border rounded-2xl p-7 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-paper text-purple">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-ink">
                  {t("app.apiStatus")}
                </h2>
                <p className="text-xs text-muted">
                  ASP.NET Core 10 Web API Connection
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                refetchLive();
                refetchReady();
              }}
              className="p-2 text-muted hover:text-ink hover:bg-paper rounded-lg transition-colors"
              title="Refresh Health"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Connection Status Banner */}
          <div
            className={`p-4 rounded-xl flex items-center gap-3 mb-6 ${
              isConnected
                ? "bg-green-light/40 border border-green/20 text-green-dark"
                : "bg-orange-light/40 border border-orange/20 text-ink"
            }`}
          >
            {isConnected ? (
              <CheckCircle2 className="w-6 h-6 text-green flex-shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 text-orange flex-shrink-0" />
            )}
            <div>
              <p className="font-semibold text-sm">
                {isLiveLoading
                  ? t("app.apiConnecting")
                  : isConnected
                    ? t("app.apiConnected")
                    : t("app.apiDisconnected")}
              </p>
              <p className="text-xs opacity-80">
                {isConnected
                  ? `Service: ${liveData?.service} · Timestamp: ${formatDate(liveData?.timestamp || new Date())}`
                  : "Backend API is currently offline. Start the backend service on port 5000 to verify connection."}
              </p>
            </div>
          </div>

          {/* Detailed Health Checks Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-border bg-paper">
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-muted">
                <ShieldCheck className="w-4 h-4 text-purple" />
                <span>/health/live</span>
              </div>
              <p className="text-sm font-bold text-ink">
                {isLiveLoading ? "Checking..." : liveData?.status || "Offline"}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-paper">
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-muted">
                <Database className="w-4 h-4 text-blue" />
                <span>/health/ready</span>
              </div>
              <p className="text-sm font-bold text-ink">
                {isReadyLoading
                  ? "Checking..."
                  : isReadyError
                    ? "Unhealthy (DB Offline)"
                    : readyData?.status || "Offline"}
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border pt-5 text-center text-xs text-muted">
        <p>© Nexora Digital Marketing Platform · Step 1 Foundation</p>
      </footer>
    </div>
  );
}

export default App;
