"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Leaf, Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";
export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const navLinks = [
    { href: "/crop", label: t.nav.crop },
    { href: "/disease", label: t.nav.disease },
    { href: "/fertilizer", label: t.nav.fertilizer },
    { href: "/yield", label: t.nav.yield },
  ];
  const handleLogout = () => {
    logout();
    router.push('/login');
    setIsOpen(false);
  };
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg group-hover:scale-110 transition-transform">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              AgroAI
            </span>
          </Link>
          {}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-600 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {}
            <div className="ml-4 flex items-center gap-2 border-l border-gray-200 pl-4">
              <LanguageSelector />
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                    <UserIcon className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {t.nav.logout}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-gray-700 hover:text-green-600 font-medium transition-colors"
                  >
                    {t.nav.login}
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                  >
                    {t.nav.signup}
                  </Link>
                </>
              )}
            </div>
          </div>
          {}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-600 font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {}
              <div className="border-t border-gray-200 mt-2 pt-2">
                <div className="px-4 py-2 mb-2">
                  <LanguageSelector />
                </div>
                {isAuthenticated && user ? (
                  <>
                    <div className="px-4 py-2 text-sm text-gray-600">
                      Logged in as <span className="font-semibold text-gray-900">{user.name}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {t.nav.logout}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 text-gray-700 hover:bg-green-50 rounded-lg font-medium transition-colors"
                    >
                      {t.nav.login}
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg text-center mt-2"
                    >
                      {t.nav.signup}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
