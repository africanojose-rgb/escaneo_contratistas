import React from 'react';
import { Shield, Home, UserPlus, History, BarChart3, Settings } from 'lucide-react';
import { motion } from 'motion/react';

interface NavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Navigation({ activeTab, onTabChange }: NavProps) {
  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Inicio' },
    { id: 'registrar', icon: UserPlus, label: 'Registrar' },
    { id: 'scanner', icon: Shield, label: 'Scanner' },
    { id: 'historial', icon: History, label: 'Historial' },
    { id: 'ajustes', icon: Settings, label: 'Config' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-surface-container-high border-t border-outline-variant h-20 flex justify-around items-center px-2 z-50">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center min-w-[64px] transition-colors ${
              isActive ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            <div
              className={`p-2 rounded-xl transition-all ${
                isActive ? 'bg-primary-container text-on-primary-container shadow-lg' : ''
              }`}
            >
              <tab.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="text-[10px] mt-1 font-semibold uppercase tracking-wider">{tab.label}</span>
            {isActive && (
              <motion.div
                layoutId="nav-pill"
                className="absolute bottom-1 w-1 h-1 bg-primary rounded-full"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

export function Header() {
  return (
    <header className="fixed top-0 w-full h-16 bg-surface-container-high border-b border-outline-variant flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-2">
        <Shield size={28} className="text-primary fill-primary/10" />
        <h1 className="font-headline text-xl font-bold tracking-tight text-primary">Toronto Sentinel</h1>
      </div>
      <div className="w-10 h-10 rounded-full border border-outline-variant overflow-hidden">
         <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&h=100&auto=format&fit=crop" 
            alt="Profile" 
            className="w-full h-full object-cover"
         />
      </div>
    </header>
  );
}
