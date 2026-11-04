import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Gamepad2, Menu, X, Trophy, Layers } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar-wrapper">
      <div className="app-container">
        <nav className="navbar" aria-label="Main Navigation">
          {/* Logo & Branding */}
          <NavLink to="/" className="nav-brand" onClick={closeMobileMenu}>
            <div className="nav-logo-box">
              <Gamepad2 size={22} strokeWidth={2.3} />
            </div>
            <div className="brand-text-group">
              <span className="brand-name">Arcade<span>Stop</span></span>
              <div className="brand-indicator">
                <span className="indicator-dot"></span>
                <span>System Ready</span>
              </div>
            </div>
          </NavLink>

          {/* Desktop Links */}
          <div className="nav-links-desktop">
            <NavLink
              to="/"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end
            >
              Home
            </NavLink>
            <NavLink
              to="/arcade"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Arcade
            </NavLink>
            <NavLink
              to="/records"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span>My Records</span>
              <span className="nav-records-tag">Soon</span>
            </NavLink>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="mobile-nav-toggle"
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
      </div>

      {/* Mobile Dropdown */}
      <div className={`mobile-nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <NavLink
          to="/"
          className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
          onClick={closeMobileMenu}
          end
        >
          <span>Home</span>
        </NavLink>
        <NavLink
          to="/arcade"
          className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
          onClick={closeMobileMenu}
        >
          <span>Arcade Collection</span>
        </NavLink>
        <NavLink
          to="/records"
          className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
          onClick={closeMobileMenu}
        >
          <span>My Records</span>
          <span className="nav-records-tag">Soon</span>
        </NavLink>
      </div>
    </header>
  );
}
