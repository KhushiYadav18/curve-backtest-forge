// File: pages/Signup.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Send } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  try {
    const res = await fetch('http://localhost:5001/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password.trim()
      })
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data?.message || `Signup failed: ${res.status}`);
      return;
    }

    if (data.success) {
      alert('Signup successful!');
      navigate('/login');
    } else {
      setError(data?.message || 'Signup failed');
    }

  } catch (err) {
    console.error('Signup error:', err);
    setError('Something went wrong. Please try again.');
  }
};


  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-black to-green-900/20"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>

      {/* Back button */}
      <button
        onClick={handleBackToHome}
        className="absolute top-8 left-8 flex items-center space-x-2 text-gray-300 hover:text-emerald-400 transition-colors z-10"
      >
        <ArrowLeft size={20} />
        <span>Back to Home</span>
      </button>

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent mb-2">
            QuantEdge
          </h1>
          <p className="text-gray-300">Create your account</p>
        </div>

        <Card className="p-8 bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter a password"
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500"
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <Button
              type="submit"
              
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
            >
              Create Account <Send className="ml-2" size={16} />
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-emerald-400 hover:text-emerald-300 transition-colors text-sm"
              >
                Already have an account? Sign in
              </button>
            </div>
          </form>
        </Card>

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>By signing up, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
