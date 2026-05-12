import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { db, type Contractor } from '../db/database';
import { Shield, Camera, X, CheckCircle2, AlertTriangle, LogIn, LogOut, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Scanner() {
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'detected' | 'success'>('idle');
  const [mode, setMode] = useState<'ENTRADA' | 'SALIDA'>('ENTRADA');
  
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    setStatus('scanning');
    try {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;
      
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // parse error, ignore
        }
      );
    } catch (err) {
      console.error(err);
      setError("No se pudo acceder a la cámara. Verifique los permisos.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop();
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    await stopScanner();
    setScannedResult(decodedText);
    setStatus('detected');
    
    const found = await db.contractors.where('uuid').equals(decodedText).first();
    if (found) {
      setContractor(found);
    } else {
      setError("Código QR no reconocido en la base de datos local.");
    }
  };

  const confirmMovement = async () => {
    if (!contractor) return;
    
    await db.movements.add({
      contractorUuid: contractor.uuid,
      type: mode,
      timestamp: Date.now(),
      gate: 'Portería Principal'
    });
    
    setStatus('success');
    setTimeout(() => {
      resetScanner();
    }, 2000);
  };

  const resetScanner = () => {
    setScannedResult(null);
    setContractor(null);
    setError(null);
    setStatus('idle');
    startScanner();
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col pt-2 relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera className="text-primary" />
          <h2 className="font-headline text-2xl font-bold">Escáner Sentinel</h2>
        </div>
        <div className="flex bg-surface-container-high rounded-lg p-1">
          <button 
            onClick={() => setMode('ENTRADA')}
            className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all ${mode === 'ENTRADA' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'}`}
          >
            ENTRADA
          </button>
          <button 
            onClick={() => setMode('SALIDA')}
            className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all ${mode === 'SALIDA' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant'}`}
          >
            SALIDA
          </button>
        </div>
      </div>

      <div className="flex-1 bg-black rounded-3xl overflow-hidden relative border-2 border-outline-variant/30 shadow-2xl">
        <div id="reader" className="w-full h-full"></div>
        
        {/* Overlay scanning effect */}
        {status === 'scanning' && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            <div className="w-64 h-64 border-2 border-primary/50 relative">
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary" />
              <motion.div 
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_#ffb4cb]"
              />
            </div>
            <p className="mt-8 text-xs font-bold text-primary animate-pulse bg-surface/80 px-4 py-2 rounded-full uppercase tracking-widest">
              Escaneando Toronto ID...
            </p>
          </div>
        )}

        <AnimatePresence>
          {(status === 'detected' || status === 'success' || error) && (
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="absolute inset-x-0 bottom-0 p-6 bg-surface-container-high/95 backdrop-blur-md rounded-t-3xl border-t border-outline-variant"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${status === 'success' ? 'bg-green-500' : mode === 'ENTRADA' ? 'bg-primary' : 'bg-secondary-container'} text-white`}>
                    {status === 'success' ? <CheckCircle2 size={24} /> : mode === 'ENTRADA' ? <LogIn size={24} /> : <LogOut size={24} />}
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-lg uppercase tracking-tight">
                      {status === 'success' ? 'Movimiento Registrado' : `Confirmar ${mode}`}
                    </h3>
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Portal Principal</p>
                  </div>
                </div>
                {status !== 'success' && (
                  <button onClick={resetScanner} className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
                    <X />
                  </button>
                )}
              </div>

              {contractor ? (
                <div className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 mb-6">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container-high">
                    {contractor.idPhoto ? (
                      <img src={contractor.idPhoto} className="w-full h-full object-cover grayscale" />
                    ) : <User className="w-full h-full p-4 opacity-30" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{contractor.fullName}</p>
                    <p className="text-xs text-on-surface-variant uppercase font-bold">{contractor.company}</p>
                    <p className="text-[10px] text-outline mt-1 font-bold">UID: {contractor.uuid}</p>
                  </div>
                </div>
              ) : error ? (
                <div className="p-4 bg-error-container/20 text-error rounded-2xl border border-error/30 mb-6 flex items-center gap-3">
                  <AlertTriangle size={24} />
                  <p className="text-xs font-bold font-headline">{error}</p>
                </div>
              ) : null}

              {status === 'detected' && contractor && (
                <button 
                  onClick={confirmMovement}
                  className="w-full py-4 bg-primary text-on-primary rounded-xl font-headline font-bold uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all"
                >
                  Confirmar Registro
                </button>
              )}
              
              {error && (
                <button 
                  onClick={resetScanner}
                  className="w-full py-4 bg-surface-container-highest text-on-surface rounded-xl font-headline font-bold uppercase tracking-widest border border-outline-variant"
                >
                  Reintentar
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
