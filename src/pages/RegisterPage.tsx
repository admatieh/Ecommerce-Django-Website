import { useState } from 'react';
import { Link } from 'react-router-dom';
import { register } from '../services/authService';
import Button from '../components/Button';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await register(formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-24 px-6 flex items-center justify-center animate-fade-in-up">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-black/5 text-center">
          <h1 className="text-3xl font-serif text-textMain mb-4">Check your email</h1>
          <p className="text-sm text-textLight mb-8">
            We've sent a verification link to <span className="font-semibold text-textMain">{formData.email}</span>. Please verify your email to continue.
          </p>
          <Link to="/login" className="text-brand font-semibold hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-6 flex items-center justify-center animate-fade-in-up">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-black/5">
        <h1 className="text-3xl font-serif text-textMain mb-2 text-center">Create Account</h1>
        <p className="text-sm text-textLight text-center mb-8">Join us for an exclusive shopping experience</p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-textMain font-semibold mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-brand/40 transition-shadow"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-textMain font-semibold mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-brand/40 transition-shadow"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-textMain font-semibold mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-brand/40 transition-shadow"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-textMain font-semibold mb-2">Phone (Optional)</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-brand/40 transition-shadow"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-textMain font-semibold mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-brand/40 transition-shadow"
            />
          </div>
          
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full py-4 mt-6 bg-brand text-white uppercase tracking-widest text-xs font-semibold hover:opacity-90"
          >
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-textLight mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-brand font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
