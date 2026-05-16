import React, { useState, useEffect } from 'react';
import { db, type Contractor } from '../db/database';
import { useLiveQuery } from 'dexie-react-hooks';
import { Search, Filter, ChevronRight, LogIn, LogOut, User, Calendar, Trash2, History, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import IDCard from '../components/IDCard';

export default function Historial() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'TODO' | 'ENTRADA' | 'SALIDA'>('TODO');
  const [printContractor, setPrintContractor] = useState<Contractor | null>(null);

  const movements = useLiveQuery(async () => {
    let query = db.movements.orderBy('timestamp').reverse();
    const all = await query.toArray();
    
    // Enrich with contractor data
    const enriched = await Promise.all(all.map(async (m) => {
      const contractor = await db.contractors.where('uuid').equals(m.contractorUuid).first();
      return { ...m, contractor };
    }));

    return enriched.filter(m => {
       const nameMatch = m.contractor?.fullName.toLowerCase().includes(searchTerm.toLowerCase());
       const typeMatch = filterType === 'TODO' || m.type === filterType;
       return nameMatch && typeMatch;
    });
  }, [searchTerm, filterType]);

  const handlePrintCard = (contractor: Contractor) => {
    setPrintContractor(contractor);
    setTimeout(() => {
      window.print();
      setPrintContractor(null);
    }, 100);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Hidden container for single card printing */}
      <div id="printable-card" className="hidden">
        {printContractor && <IDCard contractor={printContractor} />}
      </div>

      <div className="flex items-center gap-2">
        <History className="text-primary" />
        <h2 className="font-headline text-2xl font-bold">Bitácora de Movimientos</h2>
      </div>

      {/* Search and Filter */}
      <section className="space-y-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Buscar por nombre o ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-surface-container-high border border-outline-variant rounded-xl text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {(['TODO', 'ENTRADA', 'SALIDA'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                filterType === type 
                ? 'bg-primary text-on-primary border-primary shadow-lg' 
                : 'bg-surface-container-high text-on-surface-variant border-outline-variant hover:border-outline'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </section>

      {/* List */}
      <section className="space-y-3">
        {!movements ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : movements.length === 0 ? (
          <div className="text-center py-20 bg-surface-container-low rounded-2xl border-2 border-dashed border-outline-variant/20">
            <Search className="mx-auto text-outline-variant mb-4" size={48} />
            <p className="text-on-surface-variant font-bold text-sm uppercase">Sin resultados</p>
            <p className="text-xs text-outline mt-1">Intente cambiar los filtros de búsqueda</p>
          </div>
        ) : (
          movements.map((move) => (
            <div key={move.id} className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/30 flex items-center gap-4 hover:bg-surface-container-high transition-colors group">
              <div className="relative">
                {move.contractor?.idPhoto ? (
                  <img src={move.contractor.idPhoto} className="w-14 h-14 rounded-xl object-cover grayscale" alt="avatar" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-surface-container-highest flex items-center justify-center text-outline">
                    <User size={24} />
                  </div>
                )}
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-surface-container-low flex items-center justify-center shadow-lg ${
                  move.type === 'ENTRADA' ? 'bg-primary text-on-primary' : 'bg-secondary-container text-on-secondary-container'
                }`}>
                  {move.type === 'ENTRADA' ? <LogIn size={12} /> : <LogOut size={12} />}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                   <h3 className="text-on-surface font-bold text-sm truncate">{move.contractor?.fullName || 'Desconocido'}</h3>
                </div>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">{move.contractor?.company || '---'}</p>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-outline font-bold">
                  <span className="flex items-center gap-1 uppercase"><Calendar size={12} /> {format(move.timestamp, "dd/MM/yyyy", { locale: es })}</span>
                  <span className="text-on-primary-container text-[8px] bg-primary/10 px-1.5 py-0.5 rounded uppercase">{move.gate}</span>
                </div>
              </div>

              <div className="text-right flex flex-col items-end gap-2">
                <p className="text-sm font-black text-on-surface">{format(move.timestamp, "HH:mm")}</p>
                <div className="flex items-center gap-3">
                   {move.contractor && (
                     <button 
                       onClick={() => handlePrintCard(move.contractor!)}
                       className="p-1.5 bg-surface-container-highest rounded-lg text-primary hover:bg-primary/20 transition-colors"
                     >
                       <Printer size={16} />
                     </button>
                   )}
                   <ChevronRight size={18} className="text-outline group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
