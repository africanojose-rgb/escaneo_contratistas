import React, { useState } from 'react';
import { db } from '../db/database';
import { Camera, UserPlus, BadgeCheck, FileText, Calendar, Trash2, Shield, Printer, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import IDCard from '../components/IDCard';
import { format } from 'date-fns';

export default function Registrar() {
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    position: '',
    expiryDate: format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    idPhoto: undefined as string | undefined,
  });

  const [savedContractor, setSavedContractor] = useState<any>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const uuid = Math.random().toString(36).substring(2, 10).toUpperCase();
    const newContractor = {
      ...formData,
      uuid,
      createdAt: Date.now(),
    };
    const id = await db.contractors.add(newContractor);
    setSavedContractor({ ...newContractor, id });
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      company: '',
      position: '',
      expiryDate: format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      idPhoto: undefined,
    });
    setSavedContractor(null);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-2 mb-2">
        <UserPlus className="text-primary" />
        <h2 className="font-headline text-2xl font-bold">Registro de Contratista</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <section className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm space-y-6">
          <form onSubmit={handleCreate} className="space-y-6">
             {/* Photo Input (Simulation) */}
             <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/50">
               <div className="flex flex-col sm:flex-row gap-5 items-center">
                 <div className="w-32 h-32 bg-surface-container-high rounded-xl flex items-center justify-center border-2 border-dashed border-outline-variant relative overflow-hidden group">
                   {formData.idPhoto ? (
                     <img src={formData.idPhoto} alt="Preview" className="w-full h-full object-cover" />
                   ) : (
                     <Camera className="text-outline-variant" size={40} />
                   )}
                   <input 
                     type="file" 
                     accept="image/*"
                     capture="user"
                     className="absolute inset-0 opacity-0 cursor-pointer"
                     onChange={(e) => {
                       const file = e.target.files?.[0];
                       if (file) {
                         const reader = new FileReader();
                         reader.onloadend = () => {
                           setFormData(prev => ({ ...prev, idPhoto: reader.result as string }));
                         };
                         reader.readAsDataURL(file);
                       }
                     }}
                   />
                 </div>
                 <div className="flex-1 space-y-2 text-center sm:text-left">
                   <h3 className="font-headline font-bold text-primary text-sm uppercase tracking-wider">Identificación Biométrica</h3>
                   <p className="text-xs text-on-surface-variant">Capture una fotografía clara para el carnet.</p>
                   <button 
                     type="button"
                     className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold flex items-center gap-2 mx-auto sm:mx-0 shadow-md active:scale-95 transition-all"
                   >
                     <Camera size={14} /> Seleccionar Foto
                   </button>
                 </div>
               </div>
             </div>

             <div className="grid grid-cols-1 gap-4">
               <div className="space-y-1">
                 <label className="text-[10px] font-bold text-on-surface-variant uppercase ml-1">Nombre Completo</label>
                 <input 
                   required
                   value={formData.fullName}
                   onChange={e => setFormData(p => ({...p, fullName: e.target.value}))}
                   className="w-full bg-surface-container-high border border-outline-variant rounded-xl h-12 px-4 focus:border-primary outline-none text-sm"
                   placeholder="Ej. Juan Pérez"
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-bold text-on-surface-variant uppercase ml-1">Empresa</label>
                 <input 
                   required
                   value={formData.company}
                   onChange={e => setFormData(p => ({...p, company: e.target.value}))}
                   className="w-full bg-surface-container-high border border-outline-variant rounded-xl h-12 px-4 focus:border-primary outline-none text-sm"
                   placeholder="Ej. TecnoRed S.A."
                 />
               </div>
               <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1">
                   <label className="text-[10px] font-bold text-on-surface-variant uppercase ml-1">Cargo</label>
                   <input 
                     required
                     value={formData.position}
                     onChange={e => setFormData(p => ({...p, position: e.target.value}))}
                     className="w-full bg-surface-container-high border border-outline-variant rounded-xl h-12 px-4 focus:border-primary outline-none text-sm"
                     placeholder="Ej. Electricista"
                   />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-bold text-on-surface-variant uppercase ml-1">Vencimiento</label>
                   <input 
                     required
                     type="date"
                     value={formData.expiryDate}
                     onChange={e => setFormData(p => ({...p, expiryDate: e.target.value}))}
                     className="w-full bg-surface-container-high border border-outline-variant rounded-xl h-12 px-4 focus:border-primary outline-none text-sm"
                   />
                 </div>
               </div>
             </div>

             <button 
               type="submit"
               className="w-full py-4 bg-primary text-on-primary rounded-xl font-headline font-bold uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform active:scale-95"
             >
               <BadgeCheck size={24} /> Generar Toronto ID
             </button>
          </form>
        </section>

        {/* Preview / Result */}
        <section className="space-y-6">
          <div className="bg-surface-container-high rounded-2xl p-6 border border-outline-variant/30 flex flex-col items-center shadow-inner relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-tighter">
              Vista Previa
            </div>
            
            <div className="mt-8" id="printable-card">
              <IDCard contractor={savedContractor || { ...formData, uuid: 'TEMP-ID' } as any} />
            </div>

            {savedContractor && (
              <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="mt-6 w-full space-y-4"
              >
                <div className="bg-surface-container-lowest p-4 rounded-xl flex items-start gap-4 border border-primary/20">
                  <Shield size={20} className="text-primary mt-1 flex-shrink-0" />
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Sistema Sentinel activado. El código QR permite la validación instantánea en puntos de control.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => window.print()} className="flex-1 py-3 bg-surface-container-highest rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-outline-variant hover:bg-surface-bright transition-colors">
                    <Printer size={16} /> Imprimir
                  </button>
                  <button onClick={handleReset} className="flex-1 py-3 bg-error-container text-on-error-container rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-opacity">
                    <Trash2 size={16} /> Nuevo
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
