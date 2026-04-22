import { Gauge } from "lucide-react"
import { WorkflowForm } from "@/components/WorkflowForm"
import { RunHistory } from "@/components/RunHistory"

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent/15 border border-accent/25">
              <Gauge className="w-4.5 h-4.5 text-accent" strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Workflow Bench</h1>
          </div>
          <p className="text-white/40 text-sm leading-relaxed pl-12">
            Compare durable workflow platforms head-to-head on your real use case.
          </p>
        </div>
        <WorkflowForm />
        <RunHistory />
      </div>
    </main>
  )
}
