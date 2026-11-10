import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard, 
  UploadCloud, 
  Settings as SettingsIcon, 
  LogOut, 
  User, 
  Menu, 
  X, 
  Bell, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Navbar = ({ onOpenUpload }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload Document', path: '/upload', icon: UploadCloud },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  if (!isAuthenticated) return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gold-500/20 bg-brown-950/80 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <NavLink to="/dashboard" className="flex items-center gap-3 group focus:outline-none">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-brown-900 p-[1px] shadow-gold-sm transition-transform group-hover:scale-105">
                <div className="w-full h-full bg-brown-950 rounded-[11px] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-gold-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight gold-gradient-text">
                    DocAlert
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-gold-500/20 text-gold-300 border border-gold-500/30">
                    3D Pro
                  </span>
                </div>
                <span className="text-[10px] text-brown-300 tracking-wider -mt-1 hidden sm:block">
                  WARRANTY & DOCUMENT VAULT
                </span>
              </div>
            </NavLink>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30 shadow-gold-sm'
                        : 'text-brown-200 hover:text-gold-200 hover:bg-brown-900/60 border border-transparent'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            {/* Quick Upload CTA button */}
            {onOpenUpload && (
              <button
                id="navbar-quick-upload-btn"
                onClick={onOpenUpload}
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold btn-gold-glow cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-brown-950" />
                <span>AI Quick Scan</span>
              </button>
            )}

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                id="user-profile-menu-button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-brown-900/70 hover:bg-brown-850 border border-gold-500/20 hover:border-gold-500/40 transition-all text-left focus:outline-none"
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-gold-400/30 bg-brown-800 flex-shrink-0">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gold-400 font-bold text-xs">
                      {user?.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
                <div className="hidden lg:flex flex-col">
                  <span className="text-xs font-semibold text-brown-100 leading-tight">
                    {user?.name || 'Alexander V.'}
                  </span>
                  <span className="text-[10px] text-gold-400 leading-tight font-medium">
                    {user?.role || 'Pro Member'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-brown-300 hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl glass-card border border-gold-500/30 shadow-3d-card py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2.5 border-b border-brown-800/80">
                    <p className="text-xs font-semibold text-brown-100 truncate">{user?.name || 'User'}</p>
                    <p className="text-[11px] text-brown-300 truncate">{user?.email || 'user@example.com'}</p>
                  </div>

                  <div className="py-1">
                    <NavLink
                      to="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-brown-200 hover:text-gold-300 hover:bg-brown-800/50 transition-colors"
                    >
                      <SettingsIcon className="w-3.5 h-3.5 text-gold-400" />
                      Account Settings
                    </NavLink>
                    <NavLink
                      to="/upload"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-brown-200 hover:text-gold-300 hover:bg-brown-800/50 transition-colors"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-gold-400" />
                      Upload New Item
                    </NavLink>
                  </div>

                  <div className="border-t border-brown-800/80 pt-1 mt-1">
                    <button
                      id="logout-dropdown-button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-400" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              id="mobile-menu-toggle-button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-brown-900/80 border border-gold-500/20 text-brown-200 hover:text-gold-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-in Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gold-500/20 bg-brown-950/95 backdrop-blur-2xl px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                    isActive
                      ? 'bg-gold-500/20 text-gold-300 border border-gold-500/30'
                      : 'text-brown-200 hover:bg-brown-900/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 text-gold-400" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}

          <div className="pt-2 border-t border-brown-800/80">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-950/30"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
