import { Header } from '@/components/Header';
import { Section } from '@/components/Section';
import { KpiStrip } from '@/components/KpiStrip';
import { KeyCard } from '@/components/KeyCard';
import { ThroughputChart } from '@/components/ThroughPutChart';
import { TokenMixChart } from '@/components/TokenMixChart';
import { ErrorLatencyChart } from '@/components/ErrorLatencyChart';
import { UsageTable } from '@/components/UsageTable';
import { useTelemetry } from '@/lib/useTelemetry';
import { fmtInt } from '@/lib/format';

function App() {
  const { data, error } = useTelemetry(60000);

  return (
    <div className="min-h-screen text-zinc-100">
      <Header data={data} error={error} />

      <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-5 sm:px-6 sm:py-7">
        {error && (
          <div className="rounded-lg border border-rose-900/50 bg-rose-950/40 px-4 py-10 text-center">
            <p className="text-sm font-medium text-rose-300">Could not load telemetry data</p>
            <p className="mt-1 text-xs text-rose-400/70">data.json is missing or unreadable</p>
          </div>
        )}

        {!data && !error && (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-cyan-400" />
            <span className="text-sm text-zinc-500">Loading telemetry</span>
          </div>
        )}

        {data && (
          <>
            <Section title="Overview">
              <KpiStrip buckets={data.usageLog} />
            </Section>

            <Section
              title="Model"
              meta={data.keys.length > 1 ? `${data.keys.length} models` : data.keys[0]?.model}
            >
              <div
                className={
                  data.keys.length === 1
                    ? 'grid grid-cols-1'
                    : 'grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4'
                }
              >
                {data.keys.map((k) => (
                  <KeyCard key={k.label} k={k} usage={data.usageLog} />
                ))}
              </div>
            </Section>

            <Section title="Throughput">
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                <ThroughputChart buckets={data.usageLog} />
                <TokenMixChart buckets={data.usageLog} />
                <div className="xl:col-span-2">
                  <ErrorLatencyChart buckets={data.usageLog} />
                </div>
              </div>
            </Section>

            <Section title="Usage Log" meta={`latest 100 of ${fmtInt(data.usageLog.length)}`}>
              <div className="overflow-hidden rounded-lg border border-zinc-800/70 bg-zinc-900/40">
                <UsageTable buckets={data.usageLog} />
              </div>
            </Section>

            <p className="pb-2 text-xs text-zinc-600">
              Cost estimate reference:{' '}
              <span className="font-mono text-zinc-500">{typeof data.costEstimateReference === 'string' ? data.costEstimateReference : `Input $${data.costEstimateReference.inputUsdPerMillion}/M, output $${data.costEstimateReference.outputUsdPerMillion}/M`}</span>
            </p>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
