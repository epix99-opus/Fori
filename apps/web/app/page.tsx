import { platformName } from "@fori/shared";
import { Button } from "@fori/ui";

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-slate-50 px-6 py-10 text-slate-950">
      <section className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-3xl flex-col justify-center gap-6">
        <p className="text-sm font-medium text-blue-700">Production shell</p>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-normal">{platformName}</h1>
          <p className="max-w-2xl text-base leading-7 text-slate-700">
            Monorepo foundation for the Fori production apps. Business routes stay in the
            prototype until the scheduled Wave tasks migrate them.
          </p>
        </div>
        <div>
          <Button>Ready</Button>
        </div>
      </section>
    </main>
  );
}
