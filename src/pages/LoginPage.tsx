import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login({ email, password });
      navigate('/account');
    } catch (err: any) {
      const data = err.response?.data;
      // Backend sends { message: "..." } for email verification errors
      const msg =
        data?.message ||
        (Array.isArray(data?.non_field_errors) ? data.non_field_errors[0] : null) ||
        data?.detail ||
        err.message ||
        'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-6 flex items-center justify-center animate-fade-in-up">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-black/5">
        <h1 className="text-3xl font-serif text-textMain mb-2 text-center">Welcome Back</h1>
        <p className="text-sm text-textLight text-center mb-8">Sign in to your account to continue</p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-textMain font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-brand/40 transition-shadow"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-textMain font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-brand/40 transition-shadow"
            />
          </div>
          
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full py-4 mt-6 bg-brand text-white uppercase tracking-widest text-xs font-semibold hover:opacity-90"
          >
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-textLight mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
