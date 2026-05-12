import React, { useState, useEffect } from 'react';
import { Header, default as Nav } from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Registrar from './pages/Registrar';
import Historial from './pages/Historial';
import Reportes from './pages/Reportes';
import Ajustes from './pages/Ajustes';
import Scanner from './pages/Scanner';
import { db } from './db/database';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ShieldCheck, LogIn, LogOut } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showQuickAction, setShowQuickAction] = useState<'ENTRADA' | 'SALIDA' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleAction = (action: string) => {
    if (action === 'registrar_entrada') setShowQuickAction('ENTRADA');
    else if (action === 'registrar_salida') setShowQuickAction('SALIDA');
    else if (['dashboard', 'registrar', 'historial', 'reportes', 'ajustes', 'scanner'].includes(action)) {
      setActiveTab(action);
    }
  };

  const handleSearchContractor = async (term: string) => {
    setSearchTerm(term);
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }
    const results = await db.contractors
      .filter(c => 
        c.fullName.toLowerCase().includes(term.toLowerCase()) || 
        c.uuid.toUpperCase().includes(term.toUpperCase())
      )
      .toArray();
    setSearchResults(results);
  };

  const recordMovement = async (contractorUuid: string) => {
    if (!showQuickAction) return;
    await db.movements.add({
      contractorUuid,
      type: showQuickAction,
      timestamp: Date.now(),
      gate: 'Portería Principal'
    });
    setShowQuickAction(null);
    setSearchTerm('');
    setSearchResults([]);
    setActiveTab('dashboard');
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onAction={handleAction} />;
      case 'registrar': return <Registrar />;
      case 'historial': return <Historial />;
      case 'reportes': return <Reportes />;
      case 'ajustes': return <Ajustes />;
      case 'scanner': return <Scanner />;
      default: return <Dashboard onAction={handleAction} />;
    }
  };

  return (
    <div className="min-h-screen bg-surface selection:bg-primary/30">
      <Header />
      
      <main className="pt-20 px-4 md:px-margin-desktop max-w-container-max mx-auto min-h-[calc(100vh-80px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Nav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Quick Action Modal (Movement Recording) */}
      <AnimatePresence>
        {showQuickAction && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-surface-container-high w-full max-w-md rounded-3xl p-6 shadow-2xl border border-outline-variant/30"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl scale-125 ${showQuickAction === 'ENTRADA' ? 'bg-primary text-on-primary' : 'bg-secondary-container text-on-secondary-container'}`}>
                    {showQuickAction === 'ENTRADA' ? <LogIn size={20} /> : <LogOut size={20} />}
                  </div>
                  <h3 className="font-headline text-xl font-bold">REGISTRAR {showQuickAction}</h3>
                </div>
                <button onClick={() => setShowQuickAction(null)} className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
                  <X />
                </button>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
                  <input 
                    autoFocus
                    placeholder="Escriba nombre o escanee ID..."
                    className="w-full h-14 pl-12 pr-4 bg-surface-container-low border border-outline-variant rounded-xl outline-none focus:border-primary transition-all text-sm"
                    value={searchTerm}
                    onChange={e => handleSearchContractor(e.target.value)}
                  />
                </div>

                <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2">
                  {searchResults.map(c => (
                    <button
                      key={c.uuid}
                      onClick={() => recordMovement(c.uuid)}
                      className="w-full p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 flex items-center gap-4 hover:border-primary transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-surface-container-high overflow-hidden">
                        {c.idPhoto ? (
                          <img src={c.idPhoto} alt={c.fullName} className="w-full h-full object-cover grayscale" />
                        ) : <ShieldCheck className="w-full h-full p-2 text-outline-variant" />}
                      </div>
                      <div className="flex-1">
                         <p className="font-bold text-sm group-hover:text-primary transition-colors">{c.fullName}</p>
                         <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">{c.company}</p>
                      </div>
                      <ShieldCheck size={20} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                  {searchTerm.length > 2 && searchResults.length === 0 && (
                    <div className="text-center py-10 text-on-surface-variant opacity-50">
                      <p className="text-sm">No se encontraron contratistas</p>
                      <button onClick={() => setActiveTab('registrar')} className="text-primary text-xs font-bold underline mt-2">Registrar Nuevo</button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
