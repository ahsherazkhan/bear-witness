'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, ArrowRight, User, LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useUserInfo } from '@/hooks/useUserInfo';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const supabase = createClient();
  const { user } = useUserInfo(supabase);
  const router = useRouter();

  const navigationItems = [
    // { label: 'How it Works', anchor: 'how-it-works', priority: 1 },
    // { label: 'Benefits', anchor: 'benefits', priority: 2 },
    { label: 'Analytics', anchor: 'stats', priority: 1 },
    { label: 'Pricing', anchor: 'pricing', priority: 2 },
    ...(user ? [{ label: 'Dashboard', href: '/dashboard/subscriptions', priority: 3 }] : []),
    ...(!user ? [{ label: 'Start Trial', anchor: 'trial-signup', priority: 4 }] : []),
  ] as Array<{ label: string; anchor?: string; href?: string; priority: number }>;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    await fetch('/api/logout', { method: 'POST' });
    router.push('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);

      // Track active section
      const sections = navigationItems
        .filter((item) => item.anchor) // Only items with anchor
        .map((item) => item.anchor!);
      const currentSection = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });

      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [user]);

  const scrollToSection = (anchor: string) => {
    const element = document.getElementById(anchor);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
    setIsMenuOpen(false);
  };

  const handleNavigationClick = (item: any) => {
    if (item.href) {
      router.push(item.href);
    } else if (item.anchor) {
      scrollToSection(item.anchor);
    }
  };

  const handleTrialClick = () => {
    const element = document.getElementById('trial-signup');
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-gradient-to-r from-white/95 to-gray-50/95 backdrop-blur-sm border-b border-gray-200'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/assets/logo-1752484296338.png" alt="Bear Witness AI" className="w-10 h-10 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-black">Bear Witness AI</span>
              <span className="text-xs text-gray-600 hidden sm:block">AI Content Detection</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.anchor || item.href}
                onClick={() => handleNavigationClick(item)}
                className={`text-sm font-medium transition-colors duration-200 hover:text-black ${
                  activeSection === item.anchor ? 'text-black border-b-2 border-black pb-1' : 'text-gray-600'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-sm border-black text-black hover:bg-gradient-to-r hover:from-black hover:to-gray-800 hover:text-white"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => router.push('/dashboard/subscriptions')}>Dashboard</DropdownMenuItem>
                  {/* <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                    Profile Settings
                  </DropdownMenuItem> */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = '/login')}
                className="text-sm border-black text-black hover:bg-gradient-to-r hover:from-black hover:to-gray-800 hover:text-white"
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-black hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 transition-all duration-200"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-gradient-to-br from-white to-gray-50 border-b border-gray-200 shadow-lg">
            <div className="px-6 py-4 space-y-4">
              {navigationItems
                .sort((a, b) => a.priority - b.priority)
                .map((item) => (
                  <button
                    key={item.anchor || item.href}
                    onClick={() => handleNavigationClick(item)}
                    className={`block w-full text-left py-2 text-base font-medium transition-colors duration-200 ${
                      activeSection === item.anchor ? 'text-black' : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}

              <div className="pt-4 border-t border-gray-200 space-y-3">
                {user ? (
                  <>
                    {/* <Button
                      variant="outline"
                      onClick={() => router.push('/dashboard')}
                      className="w-full border-black text-black hover:bg-gradient-to-r hover:from-black hover:to-gray-800 hover:text-white"
                    >
                      Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button> */}
                    <Button
                      variant="outline"
                      onClick={handleSignOut}
                      className="w-full border-black text-black hover:bg-gradient-to-r hover:from-black hover:to-gray-800 hover:text-white"
                    >
                      Sign Out
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => (window.location.href = '/login')}
                      className="w-full border-black text-black hover:bg-gradient-to-r hover:from-black hover:to-gray-800 hover:text-white"
                    >
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => (window.location.href = '/signup')}
                      className="w-full border-black text-black hover:bg-gradient-to-r hover:from-black hover:to-gray-800 hover:text-white"
                    >
                      Sign Up
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
