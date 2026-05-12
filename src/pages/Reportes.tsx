import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { BarChart3, FileDown, FileSpreadsheet, Share2, Users, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export default function Reportes() {
  const stats = useLiveQuery(async () => {
    const movements = await db.movements.toArray();
    const contractors = await db.contractors.toArray();
    
    const today = new Date().setHours(0,0,0,0);
    const entrancesToday = movements.filter(m => m.type === 'ENTRADA' && m.timestamp >= today).length;
    const exitsToday = movements.filter(m => m.type === 'SALIDA' && m.timestamp >= today).length;
    const uniqueContractors = new Set(movements.map(m => m.contractorUuid)).size;

    return {
      entrancesToday,
      exitsToday,
      uniqueContractors,
      totalContractors: contractors.length
    };
  });

  if (!stats) return null;

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-2">
        <BarChart3 className="text-primary" />
        <h2 className="font-headline text-2xl font-bold">Reportes y Estadísticas</h2>
      </div>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant flex flex-col items-center text-center space-y-3">
          <div className="w-20 h-20 rounded-full border-4 border-primary flex items-center justify-center bg-primary/10">
            <span className="text-2xl font-bold text-primary">{stats.entrancesToday}</span>
          </div>
          <div>
            <h3 className="font-headline font-bold text-sm">Entradas Hoy</h3>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Registradas</p>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant flex flex-col items-center text-center space-y-3">
          <div className="w-20 h-20 rounded-full border-4 border-secondary flex items-center justify-center bg-secondary-container/30">
            <span className="text-2xl font-bold text-on-secondary-container">{stats.exitsToday}</span>
          </div>
          <div>
            <h3 className="font-headline font-bold text-sm">Salidas Hoy</h3>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Confirmadas</p>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant flex flex-col items-center text-center space-y-3">
          <div className="w-20 h-20 rounded-full border-4 border-outline flex items-center justify-center bg-surface-container-highest">
            <span className="text-2xl font-bold text-outline">{stats.uniqueContractors}</span>
          </div>
          <div>
            <h3 className="font-headline font-bold text-sm">Unicos Hoy</h3>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Empresas Distintas</p>
          </div>
        </div>
      </section>

      {/* Detailed Stats */}
      <section className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/30">
        <h3 className="font-headline font-bold mb-4">Métricas del Dispositivo</h3>
        <div className="space-y-4">
           <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30">
             <div className="flex items-center gap-3">
               <Users className="text-primary" />
               <span className="text-sm font-semibold">Total de Contratistas en Memoria</span>
             </div>
             <span className="font-bold text-primary">{stats.totalContractors}</span>
           </div>
        </div>
      </section>

      {/* Export Options */}
      <section className="grid grid-cols-1 gap-3">
        <button className="h-14 bg-primary text-on-primary rounded-xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-sm shadow-lg overflow-hidden relative group">
          <FileDown size={20} /> EXPORTAR REPORTE PDF
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform" />
        </button>
        <button className="h-14 border-2 border-primary text-primary rounded-xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-sm hover:bg-primary/10 transition-colors">
          <FileSpreadsheet size={20} /> EXCEL (COMPARTIR)
        </button>
        <button className="h-14 bg-secondary-container text-on-secondary-container rounded-xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-sm hover:brightness-110">
          <Share2 size={20} /> COMPARTIR WHATSAPP
        </button>
      </section>
    </div>
  );
}
