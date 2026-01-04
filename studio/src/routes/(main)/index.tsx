import { createFileRoute } from '@tanstack/react-router'

// Components
const NoticeBanner = () => (
  <div className="rounded-lg border border-amber-500/30 bg-amber-50/50 p-4 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
    <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold">
      <span className="text-amber-600 dark:text-amber-400">
        🚧 Project Notice
      </span>
    </h2>
    <p className="mb-3">
      Welcome to Bunvel! This is a <strong>hobby/learning project</strong> built
      with Bun, designed to explore creating a Supabase-like experience with the
      speed and features of Bun runtime.
    </p>
    <div className="space-y-2 text-sm">
      <p>
        ✨ <strong>Current Status:</strong> Early Development
      </p>
      <p>
        🎯 <strong>Goal:</strong> Create a production-ready, open-source
        alternative with modern tooling
      </p>
      <p>
        🤝 <strong>Contributions:</strong> All contributions, feedback, and
        ideas are welcome!
      </p>
    </div>
  </div>
)

export const Route = createFileRoute('/(main)/')({
  component: Dashboard,
})

function Dashboard() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <NoticeBanner />
    </div>
  )
}