import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { LogIn, LogOut, Calendar, PlusCircle, BarChart2, ShieldCheck, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DashboardProps {
  onAction: (action: string) => void;
}

export default function Dashboard({ onAction }: DashboardProps) {
  const profile = useLiveQuery(() => db.userProfile.toCollection().first());
  const recentMovements = useLiveQuery(() => 
    db.movements.orderBy('timestamp').reverse().limit(5).toArray()
  );

  const contractorsInsideCount = useLiveQuery(async () => {
    const movements = await db.movements.toArray();
    // Logic: latest movement per contractor should be ENTRADA
    const latestMovements = new Map<string, string>();
    movements.forEach(m => {
      const current = latestMovements.get(m.contractorUuid);
      if (!current || m.timestamp > (movements.find(x => x.contractorUuid === m.contractorUuid && x.type === current)?.timestamp || 0)) {
        latestMovements.set(m.contractorUuid, m.type);
      }
    });
    return Array.from(latestMovements.values()).filter(v => v === 'ENTRADA').length;
  });

  const getContractor = async (uuid: string) => {
    return await db.contractors.where('uuid').equals(uuid).first();
  };

  const [contractorsData, setContractorsData] = React.useState<Record<string, any>>({});

  React.useEffect(() => {
    if (recentMovements) {
      recentMovements.forEach(async (m) => {
        if (!contractorsData[m.contractorUuid]) {
          const c = await getContractor(m.contractorUuid);
          setContractorsData(prev => ({ ...prev, [m.contractorUuid]: c }));
        }
      });
    }
  }, [recentMovements]);

  return (
    <div className="space-y-6 pb-4">
      {/* Welcome Header */}
      <div className="mt-2 text-on-surface">
        <h2 className="text-xl font-headline font-bold">¡Buen día, {profile?.name?.split(' ')[0] || 'Oficial'}!</h2>
        <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Módulo de Vigilancia Activo</p>
      </div>

      {/* Status Banner */}
      <section className="mt-2">
        <div className="bg-primary-container text-on-primary-container rounded-2xl p-6 flex items-center justify-between shadow-xl">
          <div>
            <h2 className="font-headline text-2xl font-bold mb-1">Estado Actual</h2>
            <div className="flex items-center gap-2 text-sm opacity-80">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Sincronizado en tiempo real
            </div>
          </div>
          <div className="text-right">
            <span className="font-headline text-5xl font-bold block leading-none">{contractorsInsideCount || 0}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">Contratistas dentro</span>
          </div>
        </div>
      </section>

      {/* Main Action Buttons */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={() => onAction('registrar_entrada')}
          className="flex flex-col items-center justify-center gap-3 py-10 bg-primary text-on-primary rounded-2xl shadow-lg active:scale-95 transition-all group"
        >
          <div className="bg-on-primary/10 p-4 rounded-full group-hover:scale-110 transition-transform">
            <LogIn size={40} strokeWidth={2.5} />
          </div>
          <span className="font-headline text-xl font-bold tracking-widest uppercase">REGISTRAR ENTRADA</span>
        </button>
        <button 
           onClick={() => onAction('registrar_salida')}
           className="flex flex-col items-center justify-center gap-3 py-10 bg-secondary-container text-on-secondary-container rounded-2xl shadow-lg active:scale-95 transition-all group"
        >
          <div className="bg-on-secondary-container/10 p-4 rounded-full group-hover:scale-110 transition-transform">
            <LogOut size={40} strokeWidth={2.5} />
          </div>
          <span className="font-headline text-xl font-bold tracking-widest uppercase">REGISTRAR SALIDA</span>
        </button>
      </section>

      {/* Quick Access */}
      <section className="grid grid-cols-3 gap-3">
        <div 
          onClick={() => onAction('historial')}
          className="bg-surface-container-low rounded-xl p-3 flex flex-col items-center text-center gap-2 hover:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant/30"
        >
          <Calendar size={20} className="text-primary" />
          <span className="text-[10px] font-bold uppercase">Historial</span>
        </div>
        <div 
          onClick={() => onAction('registrar')}
          className="bg-surface-container-low rounded-xl p-3 flex flex-col items-center text-center gap-2 hover:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant/30"
        >
          <PlusCircle size={20} className="text-primary" />
          <span className="text-[10px] font-bold uppercase">Nuevo</span>
        </div>
        <div 
           onClick={() => onAction('reportes')}
           className="bg-surface-container-low rounded-xl p-3 flex flex-col items-center text-center gap-2 hover:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant/30"
        >
          <BarChart2 size={20} className="text-primary" />
          <span className="text-[10px] font-bold uppercase">Reportes</span>
        </div>
      </section>

      {/* Recent Access List */}
      <section className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/30 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-headline text-lg font-bold">Accesos Recientes</h3>
          <button 
            onClick={() => onAction('historial')}
            className="text-primary text-xs font-bold hover:underline"
          >
            Ver todos
          </button>
        </div>
        <div className="space-y-4">
          {!recentMovements || recentMovements.length === 0 ? (
            <div className="py-10 text-center text-on-surface-variant opacity-50 border-2 border-dashed border-outline-variant/20 rounded-xl">
              <Clock className="mx-auto mb-2" size={32} />
              <p className="text-sm">Sin movimientos recientes</p>
            </div>
          ) : (
            recentMovements.map((move) => {
              const contractor = contractorsData[move.contractorUuid];
              return (
                <div key={move.id} className="flex items-center gap-4 py-1 border-b border-outline-variant/10 last:border-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${move.type === 'ENTRADA' ? 'bg-primary/20 text-primary' : 'bg-secondary-container text-on-secondary-container'}`}>
                    {move.type === 'ENTRADA' ? <LogIn size={24} /> : <LogOut size={24} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{contractor?.fullName || '---'}</p>
                    <p className="text-[10px] text-on-surface-variant uppercase font-semibold">{contractor?.company || '---'}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[10px] font-black uppercase ${move.type === 'ENTRADA' ? 'text-primary' : 'text-on-surface-variant'}`}>{move.type}</p>
                    <p className="text-[10px] font-bold text-on-surface-variant">{format(move.timestamp, 'HH:mm', { locale: es })}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
