import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import FormInput from '../Components/FormInput';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Minimum 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@admin.com',
      password: 'admin123',
    },
  });
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onLogin = async (values: LoginForm) => {
    try {
      await login(values.email, values.password);
      const stored = localStorage.getItem('user');
      const role = stored ? JSON.parse(stored).role : 'USER';
      toast.success('Logged in!');
      navigate(role === 'ADMIN' ? '/admin' : '/');
    } catch {
      toast.error('Invalid credentials');
    }
  };

  const onRegister = async (values: RegisterForm) => {
    try {
      await api.post('/auth/users/register', values);
      toast.success('Account created! Please log in.');
      setIsRegister(false);
    } catch {
      toast.error('Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {isRegister ? 'Create Account' : 'Sign In'}
        </h2>

        {!isRegister ? (
          <form onSubmit={loginForm.handleSubmit(onLogin)} className="flex flex-col gap-4">
            <FormInput
              label="Email"
              type="email"
              {...loginForm.register('email')}
              error={loginForm.formState.errors.email?.message}
            />
            <FormInput
              label="Password"
              type="password"
              {...loginForm.register('password')}
              error={loginForm.formState.errors.password?.message}
            />
            <button
              type="submit"
              disabled={loginForm.formState.isSubmitting}
              className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              {loginForm.formState.isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={registerForm.handleSubmit(onRegister)} className="flex flex-col gap-4">
            <FormInput
              label="Full Name"
              {...registerForm.register('name')}
              error={registerForm.formState.errors.name?.message}
            />
            <FormInput
              label="Email"
              type="email"
              {...registerForm.register('email')}
              error={registerForm.formState.errors.email?.message}
            />
            <FormInput
              label="Password"
              type="password"
              {...registerForm.register('password')}
              error={registerForm.formState.errors.password?.message}
            />
            <button
              type="submit"
              disabled={registerForm.formState.isSubmitting}
              className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium"
            >
              {registerForm.formState.isSubmitting ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-4">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-600 hover:underline font-medium"
          >
            {isRegister ? 'Sign In' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
}
