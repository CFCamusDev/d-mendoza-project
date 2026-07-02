import React, { useState } from 'react';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { CreditNotesTable } from './components/CreditNotesTable';
import { Ticket, Search } from 'lucide-react';
import type { CreditNote } from '../types/credit-note';

const MOCK_CREDIT_NOTES: CreditNote[] = [
  {
    id: 1,
    returnRequestId: 10,
    amount: 75.90,
    type: 'CREDIT_NOTE',
    code: 'NC-2026-0001',
    usedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    client: {
      name: 'Carlos Mendoza',
      email: 'carlos.mendoza@gmail.com',
    },
  },
  {
    id: 2,
    returnRequestId: 11,
    amount: 120.00,
    type: 'STORE_CREDIT',
    code: 'NC-2026-0002',
    usedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    client: {
      name: 'Ana Belén',
      email: 'ana.belen@hotmail.com',
    },
  },
];

export const CreditNotesPage: React.FC = () => {
  useDocumentTitle('Notas de Crédito - D\'Mendoza');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [resendingId, setResendingId] = useState<number | null>(null);

  const handleResendPdf = (id: number) => {
    setResendingId(id);
    setTimeout(() => {
      setResendingId(null);
      alert('PDF reenviado con éxito (Mock)');
    }, 1000);
  };

  const filteredNotes = MOCK_CREDIT_NOTES.filter(note => 
    note.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (note.client?.name && note.client.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (note.client?.email && note.client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center shrink-0">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-brand-accent tracking-tight">Notas de Crédito y Vales</h2>
            <p className="text-xs text-brand-text mt-0.5">Gestione y reenvíe los comprobantes de saldo a favor emitidos por devoluciones.</p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filters bar */}
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por código o cliente..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-brand-accent focus:ring-1 focus:ring-brand-accent outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table wrapper */}
        <CreditNotesTable 
          creditNotes={filteredNotes} 
          onResendPdf={handleResendPdf}
          resendingId={resendingId}
        />
      </div>
    </div>
  );
};

export default CreditNotesPage;
