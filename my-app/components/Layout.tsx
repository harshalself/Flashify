
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';

const Layout = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <div className="min-h-screen bg-cyan-50 text-foreground flex flex-col">
          <main className="flex-1">
            <Outlet />
          </main>
          <Navbar />
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default Layout;
