import React, { useRef, useState, useEffect } from 'react';
import { db, type UserProfile } from '../db/database';
import { useLiveQuery } from 'dexie-react-hooks';
import { Share2, Bluetooth, Download, Upload, Shield, Bell, Smartphone, User, Database, CheckCircle2, AlertTriangle, Camera, Save, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Ajustes() {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'exporting' | 'importing' | 'success' | 'error'>('idle');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const profile = useLiveQuery(() => db.userProfile.toCollection().first());
  
  const [profileForm, setProfileForm] = useState<UserProfile>({
    name: '',
    position: '',
    photo: ''
  });

  useEffect(() => {
    if (profile) {
      setProfileForm(profile);
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      if (profile?.id) {
        await db.userProfile.update(profile.id, profileForm);
      } else {
        await db.userProfile.add(profileForm);
      }
      setIsEditingProfile(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = async () => {
    setSyncStatus('exporting');
    try {
      const contractors = await db.contractors.toArray();
      const movements = await db.movements.toArray();
      const data = {
        version: 1,
        timestamp: Date.now(),
        contractors,
        movements,
        deviceName: navigator.userAgent.substring(0, 20), // Identification
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const filename = `Toronto_Sentinel_Backup_${new Date().toISOString().slice(0,10)}.json`;

      if (navigator.share) {
        const file = new File([blob], filename, { type: 'application/json' });
        await navigator.share({
          files: [file],
          title: 'Respaldo Toronto Sentinel',
          text: 'Base de datos para sincronizar con otro vigilante.',
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      setSyncStatus('success');
    } catch (error) {
      console.error(error);
      setSyncStatus('error');
    }
    setTimeout(() => setSyncStatus('idle'), 3000);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSyncStatus('importing');
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (data.contractors && Array.isArray(data.contractors)) {
        // Simple merge logic: update existing, add new
        for (const c of data.contractors) {
          const existing = await db.contractors.where('uuid').equals(c.uuid).first();
          if (existing) {
             await db.contractors.update(existing.id!, c);
          } else {
            const { id, ...rest } = c;
            await db.contractors.add(rest);
          }
        }
      }

      if (data.movements && Array.isArray(data.movements)) {
         // Merging movements is trickier, we add only those not present (by timestamp and contractor)
         for (const m of data.movements) {
           const existing = await db.movements
             .where('timestamp').equals(m.timestamp)
             .filter(x => x.contractorUuid === m.contractorUuid)
             .first();
           if (!existing) {
             const { id, ...rest } = m;
             await db.movements.add(rest);
           }
         }
      }

      setSyncStatus('success');
    } catch (error) {
      console.error(error);
      setSyncStatus('error');
    }
    setTimeout(() => setSyncStatus('idle'), 3000);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-2">
        <Smartphone className="text-primary" />
        <h2 className="font-headline text-2xl font-bold">Configuración</h2>
      </div>

      {/* Profile Section */}
      <section className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/30 space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-16 h-16 rounded-full border-2 border-primary overflow-hidden bg-surface-container-high flex items-center justify-center">
              {profileForm.photo ? (
                <img src={profileForm.photo} alt="User" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-on-surface-variant opacity-30" />
              )}
            </div>
            {isEditingProfile && (
              <button 
                onClick={() => photoInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera size={20} className="text-white" />
              </button>
            )}
            <input 
              type="file" 
              ref={photoInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handlePhotoChange}
            />
          </div>
          
          <div className="flex-1">
            {isEditingProfile ? (
              <div className="space-y-2">
                <input 
                  value={profileForm.name}
                  onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Nombre"
                  className="w-full bg-surface-container-high border border-outline-variant rounded-lg px-3 py-1 text-sm outline-none focus:border-primary"
                />
                <input 
                  value={profileForm.position}
                  onChange={e => setProfileForm(p => ({ ...p, position: e.target.value }))}
                  placeholder="Cargo"
                  className="w-full bg-surface-container-high border border-outline-variant rounded-lg px-3 py-1 text-xs outline-none focus:border-primary"
                />
              </div>
            ) : (
              <>
                <h3 className="font-bold">{profile?.name || 'Oficial de Seguridad'}</h3>
                <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                  {profile?.position || 'Personal de Turno'}
                </p>
              </>
            )}
          </div>

          <button 
            onClick={() => isEditingProfile ? handleSaveProfile() : setIsEditingProfile(true)}
            className={`p-2 rounded-lg transition-colors ${
              isEditingProfile ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
            }`}
          >
            {isEditingProfile ? <Save size={20} /> : <Edit2 size={20} />}
          </button>
        </div>
      </section>

      {/* Sync Section - The Bluetooth/Backup Feature */}
      <section className="bg-surface-container-high rounded-2xl overflow-hidden border border-outline-variant/50">
        <div className="bg-primary-container/20 p-5 border-b border-outline-variant/30">
          <div className="flex items-center gap-3">
             <div className="bg-primary text-on-primary p-2 rounded-xl">
               <Bluetooth size={24} />
             </div>
             <div>
               <h3 className="font-headline font-bold">SINCRONIZAR DATOS</h3>
               <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Transferencia entre dispositivos</p>
             </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Utilice esta función para entregar o recibir el turno. Podrá exportar toda la base de datos para que el siguiente oficial la actualice en su dispositivo.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleExport}
              disabled={syncStatus !== 'idle'}
              className="flex flex-col items-center gap-3 p-5 bg-surface-container-lowest rounded-xl border border-outline-variant hover:border-primary transition-colors active:scale-95 disabled:opacity-50"
            >
              <Share2 className="text-primary" size={32} />
              <span className="text-[10px] font-bold uppercase">Entregar Turno</span>
            </button>
            <button 
               onClick={() => fileInputRef.current?.click()}
               disabled={syncStatus !== 'idle'}
               className="flex flex-col items-center gap-3 p-5 bg-surface-container-lowest rounded-xl border border-outline-variant hover:border-primary transition-colors active:scale-95 disabled:opacity-50"
            >
              <Download className="text-primary" size={32} />
              <span className="text-[10px] font-bold uppercase">Recibir Turno</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json" 
              onChange={handleImport}
            />
          </div>

          <AnimatePresence>
            {syncStatus !== 'idle' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`p-4 rounded-xl flex items-center gap-3 border shadow-lg ${
                  syncStatus === 'success' ? 'bg-green-900/30 border-green-500/50 text-green-200' :
                  syncStatus === 'error' ? 'bg-red-900/30 border-red-500/50 text-red-200' :
                  'bg-primary/20 border-primary/50 text-primary'
                }`}
              >
                {syncStatus === 'success' && <CheckCircle2 size={24} />}
                {syncStatus === 'error' && <AlertTriangle size={24} />}
                {['exporting', 'importing'].includes(syncStatus) && (
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
                <div className="text-xs font-bold uppercase tracking-wider">
                  {syncStatus === 'exporting' ? 'Preparando archivo...' :
                   syncStatus === 'importing' ? 'Importando base de datos...' :
                   syncStatus === 'success' ? 'Operación exitosa' :
                   'Error en la operación'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Other Settings */}
      <section className="space-y-3">
         <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 flex items-center justify-between hover:bg-surface-container transition-colors cursor-pointer group">
           <div className="flex items-center gap-3">
             <Bell className="text-on-surface-variant group-hover:text-primary transition-colors" size={20} />
             <span className="text-sm font-semibold">Notificaciones de Acceso</span>
           </div>
           <div className="w-10 h-5 bg-primary rounded-full relative">
              <div className="absolute right-1 top-1 w-3 h-3 bg-on-primary rounded-full" />
           </div>
         </div>
         <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 flex items-center justify-between hover:bg-surface-container transition-colors cursor-pointer group">
           <div className="flex items-center gap-3">
             <Database className="text-on-surface-variant group-hover:text-primary transition-colors" size={20} />
             <span className="text-sm font-semibold">Limpiar Base de Datos</span>
           </div>
           <AlertTriangle className="text-error" size={16} />
         </div>
      </section>
      
      <div className="text-center opacity-30 py-4">
        <p className="text-[10px] font-bold uppercase tracking-widest">Toronto Sentinel v1.0.0</p>
        <p className="text-[8px] mt-1">ID Dispositivo: {navigator.userAgent.slice(-12)}</p>
      </div>
    </div>
  );
}
