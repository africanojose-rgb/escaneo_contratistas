import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Contractor } from '../db/database';
import { Shield } from 'lucide-react';

interface IDCardProps {
  contractor: Contractor;
}

export default function IDCard({ contractor }: IDCardProps) {
  return (
    <div className="w-[323px] h-[204px] bg-surface-container-lowest rounded-lg shadow-2xl border border-primary/20 flex flex-col relative overflow-hidden text-on-surface">
      {/* Header */}
      <div className="h-10 bg-primary flex items-center justify-between px-3">
        <div className="flex items-center gap-1">
          <Shield size={14} className="text-on-primary fill-on-primary" />
          <span className="text-on-primary font-bold text-[10px] tracking-wide uppercase">TORONTO SEGURIDAD</span>
        </div>
        <span className="text-on-primary/70 text-[8px] font-bold">TS-SENTINEL</span>
      </div>

      <div className="flex-1 p-3 flex gap-3">
        {/* Photo Area */}
        <div className="w-24 h-28 bg-surface-container-low border border-outline-variant rounded-lg overflow-hidden flex items-center justify-center">
          {contractor.idPhoto ? (
            <img src={contractor.idPhoto} alt={contractor.fullName} className="w-full h-full object-cover grayscale" />
          ) : (
            <div className="flex flex-col items-center opacity-30">
               <Shield size={32} />
               <span className="text-[8px] mt-1 uppercase font-bold">Sin Foto</span>
            </div>
          )}
        </div>

        {/* Text Data */}
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <h3 className="text-primary font-bold text-[14px] leading-tight uppercase truncate">
              {contractor.fullName || 'JUAN PÉREZ'}
            </h3>
            <p className="text-on-surface-variant text-[9px] font-semibold tracking-wide">CONTRATISTA AUTORIZADO</p>
          </div>

          <div className="space-y-[2px]">
            <div className="flex justify-between border-b border-outline-variant/30 text-[8px]">
              <span className="text-on-surface-variant uppercase font-bold">Empresa</span>
              <span className="text-on-surface font-semibold truncate max-w-[80px]">{contractor.company || 'Empresa S.A.'}</span>
            </div>
            <div className="flex justify-between border-b border-outline-variant/30 text-[8px]">
              <span className="text-on-surface-variant uppercase font-bold">Cargo</span>
              <span className="text-on-surface font-semibold truncate max-w-[80px]">{contractor.position || 'Técnico'}</span>
            </div>
            <div className="flex justify-between text-[8px]">
              <span className="text-primary uppercase font-bold">Vencimiento</span>
              <span className="text-primary font-bold">{contractor.expiryDate || '12/12/2026'}</span>
            </div>
          </div>
        </div>

        {/* QR Area */}
        <div className="w-16 flex flex-col items-center justify-end">
          <div className="bg-white p-1 rounded-sm">
            <QRCodeSVG 
              value={contractor.uuid} 
              size={48} 
              fgColor="#141313"
              level="M"
            />
          </div>
          <span className="text-[6px] text-primary font-bold mt-1 tracking-tighter uppercase">VALIDADO</span>
        </div>
      </div>

      {/* Footer Accent */}
      <div className="h-1 bg-primary w-full shadow-[0_-2px_4px_rgba(255,180,203,0.3)]" />
    </div>
  );
}
