import { login, signup } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-900 text-white">
      <form className="flex flex-col gap-4 w-full max-w-sm border border-slate-800 p-6 rounded-lg bg-slate-950">
        <h1 className="text-xl font-bold text-center mb-2">Finance App Auth</h1>

        {params.error && (
          <p className="bg-red-500/20 text-red-400 p-2 rounded text-xs text-center">
            {params.error}
          </p>
        )}

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-sm text-white outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-sm text-white outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex gap-2 mt-2">
          <button
            formAction={login}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 rounded transition"
          >
            Log In
          </button>
          <button
            formAction={signup}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium py-2 rounded transition"
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  )
}