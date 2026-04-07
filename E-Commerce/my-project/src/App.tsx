import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthProvider';
import { UserRoute, AdminRoute } from './Components/protectedRoute';
import Navbar from './Components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import CartPage from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import ProductDetails from './pages/ProductDetails';
import AdminDashboard from './pages/AdminDashboard';
import ProductForm from './pages/ProductForm';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/products/:id" element={<ProductDetails />} />

            <Route path="/cart" element={<UserRoute><CartPage /></UserRoute>} />
            <Route path="/checkout" element={<UserRoute><Checkout /></UserRoute>} />
            <Route path="/orders" element={<UserRoute><Orders /></UserRoute>} />

            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/product/:id" element={<AdminRoute><ProductForm /></AdminRoute>} />
          </Routes>
          <Toaster position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
