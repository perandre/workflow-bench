import { WorkflowForm } from "@/components/WorkflowForm"
import { RunHistory } from "@/components/RunHistory"

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-20">
      <div className="max-w-2xl mx-auto">
        <header className="mb-14 text-center">
          <h1 className="hero-gradient text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
            Workflow Bench
          </h1>
          <p className="mt-4 text-lg text-white/60 leading-relaxed">
            Compare durable workflow platforms head-to-head on your real use case.
          </p>
          <div className="mt-8 mx-auto h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </header>

        <WorkflowForm />
        <RunHistory />
      </div>
    </main>
  )
}
