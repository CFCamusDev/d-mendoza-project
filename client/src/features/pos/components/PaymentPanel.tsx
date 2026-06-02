import React, { useState } from 'react';
import { Banknote, CreditCard, Send, Plus, Trash2, CheckCircle2, DollarSign } from 'lucide-react';
import type { PaymentMethod } from '../types/pos.types';

export interface PaymentItem {
  id: string;
  method: PaymentMethod;
  amount: number;
}

interface PaymentPanelProps {
  totalAmount: number;
  onConfirm: (payments: PaymentItem[]) => void;
  isLoading?: boolean;
}

export const PaymentPanel: React.FC<PaymentPanelProps> = ({ totalAmount, onConfirm, isLoading = false }) => {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [currentMethod, setCurrentMethod] = useState<PaymentMethod>('CASH');
  const [currentAmount, setCurrentAmount] = useState<string>('');

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, totalAmount - totalPaid);
  const change = Math.max(0, totalPaid - totalAmount);

  const canConfirm = totalPaid >= totalAmount && totalAmount > 0;

  const handleAddPayment = () => {
    const amountVal = parseFloat(currentAmount);
    if (isNaN(amountVal) || amountVal <= 0) return;

    // Si es exacto o se pasa, dejarlo agregar.
    // Solo permitimos pasarnos si es efectivo (CASH)
    if (amountVal > remaining && currentMethod !== 'CASH') {
      alert(`No puedes cobrar más del restante (S/. ${remaining.toFixed(2)}) con ${currentMethod}. Solo efectivo (CASH) permite vuelto.`);
      return;
    }

    setPayments([
      ...payments,
      { id: Date.now().toString(), method: currentMethod, amount: amountVal },
    ]);
    setCurrentAmount('');
  };

  const handleRemovePayment = (id: string) => {
    setPayments(payments.filter(p => p.id !== id));
  };

  const methodOptions: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
    { value: 'CASH', label: 'Efectivo', icon: <Banknote size={16} /> },
    { value: 'CARD', label: 'Tarjeta', icon: <CreditCard size={16} /> },
    { value: 'YAPE', label: 'Yape / Plin', icon: <Send size={16} /> },
    { value: 'TRANSFER', label: 'Transferencia', icon: <Send size={16} /> },
  ];

  return (
    <div className="bg-white border-2 border-[#D9D9D2] rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-[#F7F7F5] border-b border-[#D9D9D2] p-4 flex justify-between items-center">
        <h3 className="font-extrabold text-[#3F3F3F] flex items-center gap-2 uppercase tracking-wide text-sm">
          <DollarSign size={18} />
          Métodos de Pago
        </h3>
        <span className="text-[#9B9B94] font-semibold text-xs bg-white px-2 py-1 rounded-lg border border-[#D9D9D2]">
          Total: S/. {totalAmount.toFixed(2)}
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Añadir Pago */}
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            {methodOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setCurrentMethod(opt.value)}
                className={`flex items-center justify-center gap-2 p-2 rounded-xl border-2 transition-all font-semibold text-sm ${
                  currentMethod === opt.value
                    ? 'border-[#3F3F3F] bg-[#3F3F3F] text-white'
                    : 'border-[#EBEBE8] bg-[#F7F7F5] text-[#6B6B6B] hover:border-[#D9D9D2]'
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9B94] font-bold">S/.</span>
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder={remaining > 0 ? remaining.toFixed(2) : "0.00"}
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddPayment();
                }}
                disabled={remaining <= 0}
                className="w-full pl-9 pr-3 py-2 border-2 border-[#EBEBE8] rounded-xl focus:outline-none focus:border-[#3F3F3F] font-bold text-[#3F3F3F]"
              />
            </div>
            <button
              onClick={handleAddPayment}
              disabled={!currentAmount || isNaN(parseFloat(currentAmount)) || parseFloat(currentAmount) <= 0 || remaining <= 0}
              className="px-4 bg-[#3F3F3F] text-white rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Plus size={18} />
              Añadir
            </button>
          </div>
        </div>

        {/* Lista de Pagos */}
        {payments.length > 0 && (
          <div className="space-y-2 border-t border-[#EBEBE8] pt-4">
            <h4 className="text-xs font-bold text-[#9B9B94] uppercase tracking-wider">Pagos Recibidos</h4>
            <div className="space-y-2">
              {payments.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-[#F7F7F5] rounded-xl border border-[#EBEBE8]">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-white rounded-lg shadow-sm">
                      {methodOptions.find(m => m.value === p.method)?.icon}
                    </span>
                    <div>
                      <span className="block text-sm font-bold text-[#3F3F3F]">
                        {methodOptions.find(m => m.value === p.method)?.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-[#3F3F3F]">S/. {p.amount.toFixed(2)}</span>
                    <button
                      onClick={() => handleRemovePayment(p.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resumen */}
        <div className="bg-[#F7F7F5] rounded-xl p-4 border border-[#EBEBE8] space-y-2 text-sm">
          <div className="flex justify-between text-[#6B6B6B]">
            <span className="font-semibold">Total a Pagar:</span>
            <span className="font-bold text-[#3F3F3F]">S/. {totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[#6B6B6B]">
            <span className="font-semibold">Pagado:</span>
            <span className="font-bold text-[#3F3F3F]">S/. {totalPaid.toFixed(2)}</span>
          </div>
          <div className="pt-2 border-t border-[#EBEBE8] flex justify-between items-center">
            {change > 0 ? (
              <>
                <span className="font-bold text-[#c0392b] uppercase text-xs">Vuelto</span>
                <span className="font-extrabold text-[#c0392b] text-lg">S/. {change.toFixed(2)}</span>
              </>
            ) : (
              <>
                <span className="font-bold text-[#E58A1F] uppercase text-xs">Restante</span>
                <span className="font-extrabold text-[#E58A1F] text-lg">S/. {remaining.toFixed(2)}</span>
              </>
            )}
          </div>
        </div>

        {/* Botón Confirmar */}
        <button
          onClick={() => onConfirm(payments)}
          disabled={!canConfirm || isLoading}
          className="w-full py-3.5 bg-black text-white rounded-xl font-extrabold tracking-wide uppercase text-sm flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors disabled:opacity-50 shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] disabled:shadow-none mt-2"
        >
          {isLoading ? (
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
          ) : (
            <>
              <CheckCircle2 size={18} />
              Confirmar Venta
            </>
          )}
        </button>
      </div>
    </div>
  );
};
