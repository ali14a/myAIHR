import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LinkedInLogoutModal from './LinkedInLogoutModal';
import { logoutService } from '@auth/services/logoutService';
import {
  HomeIcon,
  DocumentArrowUpIcon,
  ChartBarIcon,
  UserGroupIcon,
  PencilSquareIcon,
  DocumentTextIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  MoonIcon,
  SunIcon
} from '@heroicons/react/24/outline';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Your resume analysis is complete", time: "2 min ago", unread: true },
    { id: 2, message: "New job matches found", time: "1 hour ago", unread: true },
    { id: 3, message: "Cover letter generated successfully", time: "3 hours ago", unread: false }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Upload Resume', href: '/upload', icon: DocumentArrowUpIcon },
    { name: 'Resume Analysis', href: '/analysis', icon: ChartBarIcon },
    { name: 'Job Matching', href: '/matching', icon: UserGroupIcon },
    { name: 'Improve Resume', href: '/improvement', icon: PencilSquareIcon },
    { name: 'Cover Letter', href: '/cover-letter', icon: DocumentTextIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];

  const isActive = (path: string): boolean => location.pathname === path;

  // Get background configuration for current page
  const getPageBackground = () => {
    const currentPath = location.pathname;
    
    switch (currentPath) {
      case '/dashboard':
        return {
          className: 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100',
          pattern: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.05\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          floatingElements: true
        };
      case '/profile':
        return {
          className: 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50',
          pattern: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%236B7280\' fill-opacity=\'0.03\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          floatingElements: false
        };
      case '/upload':
        return {
          className: 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100',
          pattern: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2310B981\' fill-opacity=\'0.05\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          floatingElements: true
        };
      case '/analysis':
        return {
          className: 'bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-100',
          pattern: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%238B5CF6\' fill-opacity=\'0.05\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          floatingElements: true
        };
      case '/matching':
        return {
          className: 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100',
          pattern: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23F59E0B\' fill-opacity=\'0.05\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          floatingElements: true
        };
      case '/improvement':
        return {
          className: 'bg-gradient-to-br from-pink-50 via-rose-50 to-red-100',
          pattern: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23EC4899\' fill-opacity=\'0.05\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          floatingElements: true
        };
      case '/cover-letter':
        return {
          className: 'bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-100',
          pattern: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2306B6D4\' fill-opacity=\'0.05\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          floatingElements: true
        };
      default:
        return {
          className: 'bg-gray-50',
          pattern: null,
          floatingElements: false
        };
    }
  };

  const pageBackground = getPageBackground();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 w-full h-full" 
        />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-gray-900">Resume Scanner</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-10 bg-black bg-opacity-5 hidden lg:block w-full h-full" 
        />
      )}

      {/* Desktop sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:z-40 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-gray-900">Resume Scanner</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ease-in-out relative z-20 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'}`}>
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between bg-white border-b border-gray-200 px-4 shadow-sm sm:px-6 lg:px-8">
          {/* Left side - Hamburger menu and title */}
          <div className="flex items-center gap-x-4">
            {!sidebarOpen && (
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon className="h-6 w-6" />
              </button>
            )}
            <div className={`hidden sm:block ${sidebarOpen ? 'lg:hidden' : ''}`}>
              <h1 className="text-xl font-semibold text-gray-900">Resume Scanner</h1>
            </div>
          </div>

          {/* Right side - Menu items and user profile */}
          <div className="flex items-center gap-x-2">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>

            {/* Help/Support */}
            <button
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              title="Help & Support"
            >
              <QuestionMarkCircleIcon className="h-5 w-5" />
            </button>

            {/* Settings */}
            <button
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              title="Settings"
            >
              <Cog6ToothIcon className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 relative"
                title="Notifications"
              >
                <BellIcon className="h-5 w-5" />
                {notifications.some(n => n.unread) && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">
                      {notifications.filter(n => n.unread).length}
                    </span>
                  </span>
                )}
              </button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          notification.unread ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => {
                          setNotifications(prev => 
                            prev.map(n => 
                              n.id === notification.id ? { ...n, unread: false } : n
                            )
                          );
                        }}
                      >
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-gray-200">
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-200" />

            {/* User profile */}
            <Link
              to="/profile"
              className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              title={`Go to ${user?.first_name || 'User'}'s profile`}
            >
              {user?.profile_photo ? (
                <img
                  src={user.profile_photo}
                  alt="Profile"
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold text-white">
                  {user?.first_name?.charAt(0) || 'U'}
                </span>
              )}
            </Link>

            {/* Logout button */}
            <button
              onClick={async () => {
                try {
                  // Check if this is a LinkedIn user and if special handling is needed
                  const authMethod = logoutService.getCurrentAuthMethod();
                  
                  if (authMethod === 'linkedin') {
                    // Check if LinkedIn logout requires user action
                    const linkedinCheck = await logoutService.checkLinkedInLogoutRequirement();
                    
                    if (linkedinCheck.requiresUserAction) {
                      // Show LinkedIn logout modal
                      setShowLinkedInModal(true);
                      return;
                    }
                  }
                  
                  // Proceed with normal logout
                  const result = await logout();
                  if (result.success) {
                    console.log('Logout successful:', result.message);
                  } else {
                    console.error('Logout failed:', result.error);
                  }
                } catch (error) {
                  console.error('Logout error:', error);
                }
              }}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Page content with background */}
        <main className={`min-h-screen relative ${pageBackground.className}`}>
          {/* Background Pattern */}
          {pageBackground.pattern && (
            <div 
              className="absolute inset-0 opacity-30" 
              style={{ backgroundImage: pageBackground.pattern }}
            />
          )}
          
          {/* Floating Elements */}
          {pageBackground.floatingElements && (
            <>
              <div className="absolute top-20 right-20 w-32 h-32 bg-white/20 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/30 rounded-full opacity-20 animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 right-10 w-16 h-16 bg-white/20 rounded-full opacity-20 animate-pulse delay-500"></div>
            </>
          )}
          
          {/* Content */}
          <div className="relative z-10 py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>

        {/* LinkedIn Logout Modal */}
        <LinkedInLogoutModal
          isOpen={showLinkedInModal}
          onClose={() => setShowLinkedInModal(false)}
          onLogoutComplete={async () => {
            // Complete the logout process
            const result = await logout();
            if (result.success) {
              console.log('LinkedIn logout completed:', result.message);
            }
            setShowLinkedInModal(false);
          }}
        />
      </div>
    </div>
  );
};

export default Layout;
