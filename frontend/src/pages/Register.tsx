import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthFormShell from '../components/AuthFormShell'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await register(name, email, password)
      navigate('/dashboard', { replace: true })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create account.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthFormShell
      title="Create your account"
      subtitle="Start with a clean workspace for authentication, workflow orchestration, and future execution logs."
      footerText="Already have an account?"
      footerLinkLabel="Sign in"
      footerLinkTo="/login"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
            Full name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="field"
            placeholder="Taylor Rivera"
            autoComplete="name"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="field"
            placeholder="you@company.com"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="field"
            placeholder="Create a strong password"
            autoComplete="new-password"
            required
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : null}

        <button type="submit" disabled={isSubmitting} className="primary-button w-full">
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthFormShell>
  )
}

export default Register
