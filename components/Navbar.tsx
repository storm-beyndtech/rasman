'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Music, ShoppingCart, User, Settings } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if user is admin
  const isAdmin = user?.publicMetadata?.role === 'admin';

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/songs', label: 'Songs' },
    { href: '/albums', label: 'Albums' },
    { href: '/biography', label: 'Biography' },
  ];

  const authLinks = isSignedIn ? [
    { href: '/dashboard', label: 'My Music', icon: <Music size={18} /> },
    ...(isAdmin ? [{ href: '/admin', label: 'Admin', icon: <Settings size={18} /> }] : []),
  ] : [];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-reggae-gradient rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Music className="text-white" size={24} />
            </div>
            <span className={`font-bold text-xl font-serif ${
              scrolled ? 'text-reggae-dark' : 'text-white'
            } group-hover:text-reggae-green transition-colors duration-300`}>
              Rasman Music
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Main Nav Links */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium transition-colors duration-300 hover:text-reggae-green relative ${
                  pathname === link.href 
                    ? 'text-reggae-green' 
                    : scrolled ? 'text-gray-700' : 'text-white'
                }`}
              >
                {link.label}
                {pathname === link.href && (
                  <motion.div
                    layoutId="underline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-reggae-green"
                  />
                )}
              </Link>
            ))}

            {/* Auth Links */}
            {authLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-1 font-medium transition-colors duration-300 hover:text-reggae-green ${
                  pathname === link.href 
                    ? 'text-reggae-green' 
                    : scrolled ? 'text-gray-700' : 'text-white'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}

            {/* Authentication Buttons */}
            <div className="flex items-center space-x-4">
              {isSignedIn ? (
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10",
                      userButtonPopoverCard: "shadow-xl border-0",
                    }
                  }}
                />
              ) : (
                <div className="flex items-center space-x-3">
                  <SignInButton mode="modal">
                    <button className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                      scrolled 
                        ? 'text-gray-700 hover:text-reggae-green' 
                        : 'text-white hover:text-reggae-yellow'
                    }`}>
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="bg-reggae-green text-white px-6 py-2 rounded-full font-medium hover:bg-green-600 transition-colors duration-300 shadow-md">
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors duration-300 ${
              scrolled ? 'text-gray-700' : 'text-white'
            }`}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t shadow-lg"
          >
            <div className="container mx-auto px-4 py-6 space-y-4">
              {/* Navigation Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block py-2 font-medium transition-colors duration-300 ${
                    pathname === link.href 
                      ? 'text-reggae-green' 
                      : 'text-gray-700 hover:text-reggae-green'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Auth Links */}
              {authLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-2 py-2 font-medium transition-colors duration-300 ${
                    pathname === link.href 
                      ? 'text-reggae-green' 
                      : 'text-gray-700 hover:text-reggae-green'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}

              {/* Mobile Authentication */}
              {!isSignedIn && (
                <div className="pt-4 border-t space-y-3">
                  <SignInButton mode="modal">
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="w-full text-left py-2 text-gray-700 hover:text-reggae-green font-medium"
                    >
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="w-full bg-reggae-green text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors duration-300"
                    >
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              )}

              {isSignedIn && (
                <div className="pt-4 border-t">
                  <div className="flex items-center space-x-3">
                    <UserButton />
                    <span className="text-gray-700 font-medium">
                      {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;