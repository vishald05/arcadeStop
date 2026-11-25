import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Gamepad2, Menu, X } from 'lucide-react';

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
          {/* Logo & Gaming Wordmark */}
          <Link to="/" className="nav-brand" onClick={closeMobileMenu}>
            <div className="nav-logo-box">
              <Gamepad2 size={20} strokeWidth={2.4} />
            </div>
            <span className="brand-name">
              ARCADE<span className="brand-accent">STOP</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
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
              Records
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

      {/* Mobile Dropdown Menu */}
      <div className={`mobile-nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <NavLink
          to="/"
          className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
          onClick={closeMobileMenu}
          end
        >
          Home
        </NavLink>
        <NavLink
          to="/arcade"
          className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
          onClick={closeMobileMenu}
        >
          Arcade
        </NavLink>
        <NavLink
          to="/records"
          className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
          onClick={closeMobileMenu}
        >
          Records
        </NavLink>
      </div>
    </header>
  );
}
