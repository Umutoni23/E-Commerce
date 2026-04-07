import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { isAuthenticated, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setOpen(false);
  };

  const links = (
    <>
      <Link to="/" onClick={() => setOpen(false)} className="hover:text-blue-600 transition">Home</Link>
      {!isAuthenticated && (
        <Link to="/login" onClick={() => setOpen(false)} className="hover:text-blue-600 transition">Login</Link>
      )}
      {isAuthenticated && userRole === 'USER' && (
        <>
          <Link to="/cart" onClick={() => setOpen(false)} className="hover:text-blue-600 transition">My Cart</Link>
          <Link to="/orders" onClick={() => setOpen(false)} className="hover:text-blue-600 transition">My Orders</Link>
        </>
      )}
      {isAuthenticated && userRole === 'ADMIN' && (
        <Link to="/admin" onClick={() => setOpen(false)} className="hover:text-blue-600 transition">Admin Dashboard</Link>
      )}
      {isAuthenticated && (
        <button onClick={handleLogout} className="hover:text-red-500 transition text-left">Logout</button>
      )}
    </>
  );

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-600">ShopZone</Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
          {links}
        </div>

        {/* Hamburger */}
        <button className="md:hidden flex flex-col gap-1" onClick={() => setOpen(!open)}>
          <span className="w-6 h-0.5 bg-gray-700 block" />
          <span className="w-6 h-0.5 bg-gray-700 block" />
          <span className="w-6 h-0.5 bg-gray-700 block" />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden flex flex-col gap-4 px-4 pb-4 text-sm font-medium text-gray-700 border-t">
          {links}
        </div>
      )}
    </nav>
  );
}
