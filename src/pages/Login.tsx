import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log("Submitting login form with:", email, password); // Add this

  try {
    const res = await fetch('http://localhost:5001/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Login failed');
    }

    const data = await res.json();

    if (data.success) {
      alert('Login successful');
      navigate('/code-editor');
    } else {
      alert(data.message || 'Login failed');
    }
  } catch (err: any) {
    alert('Error: ' + err.message);
  }
};


  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-black to-green-900/20"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>

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
          <p className="text-gray-300">Welcome back</p>
        </div>

        <Card className="p-8 bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
              onClick={() => console.log('Button clicked')}
            >
              Sign In
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-emerald-400 hover:text-emerald-300 transition-colors text-sm"
              >
                Don’t have an account? Sign up
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                className="text-gray-400 hover:text-gray-300 transition-colors text-sm"
              >
                Forgot your password?
              </button>
            </div>
          </form>
        </Card>

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
