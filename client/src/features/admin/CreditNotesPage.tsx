import React, { useEffect, useState } from 'react';
import axiosInstance from '../../shared/api/axiosInstance';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount);
};

interface CreditNote {
  id: number;
  code: string;
  type: string;
  amount: string | number;
  isUsed: boolean;
  usedAt: string | null;
  createdAt: string;
  returnRequest: {
    user: {
      name: string;
      lastName: string;
      email: string;
    };
  };
}

export const CreditNotesPage: React.FC = () => {
  const [notes, setNotes] = useState<CreditNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/admin/credit-notes');
      setNotes(res.data.notes || []);
    } catch (error) {
      console.error('Error fetching credit notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (id: number) => {
    try {
      await axiosInstance.post(`/admin/credit-notes/${id}/resend`);
      alert('Correo reenviado con éxito');
    } catch (error) {
      console.error('Error resending email:', error);
      alert('Error al reenviar correo');
    }
  };

  if (loading) return <div className="p-4">Cargando...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Notas de Crédito y Vales</h1>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-gray-600">Código</th>
              <th className="p-4 font-semibold text-gray-600">Cliente</th>
              <th className="p-4 font-semibold text-gray-600">Tipo</th>
              <th className="p-4 font-semibold text-gray-600">Monto</th>
              <th className="p-4 font-semibold text-gray-600">Estado</th>
              <th className="p-4 font-semibold text-gray-600">Fecha Emisión</th>
              <th className="p-4 font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {notes.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  No hay notas de crédito emitidas.
                </td>
              </tr>
            ) : (
              notes.map((note) => (
                <tr key={note.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium">{note.code}</td>
                  <td className="p-4">
                    {note.returnRequest?.user?.name} {note.returnRequest?.user?.lastName}
                    <div className="text-xs text-gray-500">{note.returnRequest?.user?.email}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${note.type === 'CREDIT_NOTE' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                      {note.type === 'CREDIT_NOTE' ? 'Nota de Crédito' : 'Vale de Tienda'}
                    </span>
                  </td>
                  <td className="p-4 font-semibold">{formatCurrency(Number(note.amount))}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${note.isUsed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {note.isUsed ? 'Usada' : 'Disponible'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleResend(note.id)}
                      className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 text-sm transition"
                    >
                      Reenviar Correo
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
