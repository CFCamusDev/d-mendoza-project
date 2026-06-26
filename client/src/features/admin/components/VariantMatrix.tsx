import React, { useState, useEffect } from 'react';
import { useVariants } from '../hooks/useVariants';
import type { ProductVariant } from '../types/variant';

interface VariantMatrixProps {
  productId: number;
  productCode: string;
}

export const VariantMatrix: React.FC<VariantMatrixProps> = ({ productId, productCode }) => {
  const { variants, loading, fetchVariants, generateVariants, updateVariant } = useVariants(productId);

  // Form visibility state
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  
  // Creation mode state
  const [creationMode, setCreationMode] = useState<'automatic' | 'manual'>('automatic');

  // States for automatic generation
  const [tallasInput, setTallasInput] = useState<string>('S, M, L');
  const [coloresInput, setColoresInput] = useState<string>('NEGRO, BLANCO');
  const [basePrice, setBasePrice] = useState<number>(99.90);

  // States for manual input
  const [manualTalla, setManualTalla] = useState<string>('');
  const [manualColor, setManualColor] = useState<string>('');
  const [manualPrice, setManualPrice] = useState<number>(99.90);
  const [manualSku, setManualSku] = useState<string>('');

  // States for inline editing
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editSku, setEditSku] = useState<string>('');

  useEffect(() => {
    fetchVariants();
  }, [productId, fetchVariants]);

  // Sync panel visibility: show by default if no variants exist
  useEffect(() => {
    if (variants.length === 0) {
      setShowAddForm(true);
    }
  }, [variants.length]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const tallas = tallasInput
      .split(',')
      .map((t) => t.trim().toUpperCase())
      .filter((t) => t.length > 0);
    const colores = coloresInput
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c.length > 0);

    if (tallas.length === 0 || colores.length === 0) {
      alert('Debes proporcionar al menos una Talla y un Color.');
      return;
    }

    await generateVariants({
      attributes: { talla: tallas, color: colores },
      basePrice,
    });
  };

  const handleGenerateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    const tallaClean = manualTalla.trim().toUpperCase();
    const colorClean = manualColor.trim().toUpperCase();

    if (!tallaClean || !colorClean) {
      alert('Debes proporcionar una Talla y un Color.');
      return;
    }
    if (manualPrice <= 0) {
      alert('El precio debe ser mayor a 0.');
      return;
    }

    // Call generateVariants with a single combination
    const newVariants = await generateVariants({
      attributes: { talla: [tallaClean], color: [colorClean] },
      basePrice: manualPrice,
    });

    if (newVariants) {
      // Find the newly created variant (we match by attribute values)
      const newVar = newVariants.find(
        (v) =>
          v.attributesJson.talla?.toUpperCase() === tallaClean &&
          v.attributesJson.color?.toUpperCase() === colorClean
      );

      if (newVar && manualSku.trim()) {
        const skuClean = manualSku.trim().toUpperCase();
        await updateVariant(newVar.id, {
          sku: skuClean,
          price: manualPrice,
        });
      }

      // Clear inputs
      setManualTalla('');
      setManualColor('');
      setManualSku('');
    }
  };

  const startEdit = (v: ProductVariant) => {
    setEditingId(v.id);
    setEditPrice(v.price);
    setEditSku(v.sku);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleSave = async (variantId: number) => {
    if (editPrice <= 0) {
      alert('El precio debe ser mayor a 0');
      return;
    }
    if (!editSku.trim()) {
      alert('El SKU no puede estar vacío');
      return;
    }

    const success = await updateVariant(variantId, {
      price: editPrice,
      sku: editSku,
    });

    if (success) {
      setEditingId(null);
    }
  };

  const handleToggleActive = async (v: ProductVariant) => {
    await updateVariant(v.id, {
      isActive: !v.isActive,
    });
  };

  return (
    <div className="bg-brand-bg rounded-xl p-6 shadow-sm border border-gray-100 max-w-5xl mx-auto my-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-brand-accent">Matriz de Variantes SKU</h2>
          <p className="text-sm text-brand-text mt-1">
            Código Base: <span className="font-mono bg-gray-200 px-2 py-0.5 rounded text-xs">{productCode}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 mt-2 md:mt-0">
          {variants.length > 0 && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs font-semibold bg-brand-accent hover:opacity-90 text-white px-3 py-1.5 rounded-lg transition"
            >
              {showAddForm ? 'Ocultar Panel' : 'Agregar Variante'}
            </button>
          )}
          <span className="text-xs font-medium text-brand-text bg-brand-primary px-3 py-1.5 rounded-lg shrink-0">
            ID Producto: #{productId}
          </span>
        </div>
      </div>

      {/* Generator Section */}
      {showAddForm && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
          <div className="flex border-b border-gray-200 mb-5">
            <button
              onClick={() => setCreationMode('automatic')}
              className={`pb-2.5 px-4 text-sm font-semibold border-b-2 transition duration-150 ${
                creationMode === 'automatic'
                  ? 'border-brand-accent text-brand-accent'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Generación Masiva (Combinaciones)
            </button>
            <button
              onClick={() => setCreationMode('manual')}
              className={`pb-2.5 px-4 text-sm font-semibold border-b-2 transition duration-150 ${
                creationMode === 'manual'
                  ? 'border-brand-accent text-brand-accent'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Ingreso Manual (Uno a Uno)
            </button>
          </div>

          {creationMode === 'automatic' ? (
            <form onSubmit={handleGenerate}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-brand-text uppercase mb-1">Tallas (Separar con comas)</label>
                  <input
                    type="text"
                    value={tallasInput}
                    onChange={(e) => setTallasInput(e.target.value)}
                    placeholder="S, M, L"
                    className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-brand-accent focus:border-brand-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text uppercase mb-1">Colores (Separar con comas)</label>
                  <input
                    type="text"
                    value={coloresInput}
                    onChange={(e) => setColoresInput(e.target.value)}
                    placeholder="NEGRO, BLANCO"
                    className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-brand-accent focus:border-brand-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text uppercase mb-1">Precio Base ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={basePrice}
                    onChange={(e) => setBasePrice(parseFloat(e.target.value))}
                    className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-brand-accent focus:border-brand-accent outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-5 w-full bg-brand-accent hover:opacity-90 text-white text-sm font-medium py-2.5 rounded transition duration-200 disabled:opacity-50"
              >
                {loading ? 'Generando...' : 'Generar Combinaciones Autómaticas'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleGenerateManual}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-brand-text uppercase mb-1">Talla</label>
                  <input
                    type="text"
                    required
                    value={manualTalla}
                    onChange={(e) => setManualTalla(e.target.value)}
                    placeholder="Ej. S"
                    className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-brand-accent focus:border-brand-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text uppercase mb-1">Color</label>
                  <input
                    type="text"
                    required
                    value={manualColor}
                    onChange={(e) => setManualColor(e.target.value)}
                    placeholder="Ej. NEGRO"
                    className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-brand-accent focus:border-brand-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text uppercase mb-1">Precio ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={manualPrice}
                    onChange={(e) => setManualPrice(parseFloat(e.target.value))}
                    className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-brand-accent focus:border-brand-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text uppercase mb-1">SKU Personalizado (Opcional)</label>
                  <input
                    type="text"
                    value={manualSku}
                    onChange={(e) => setManualSku(e.target.value)}
                    placeholder="Ej. SKU-CUSTOM-01"
                    className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-brand-accent focus:border-brand-accent outline-none uppercase"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-5 w-full bg-brand-accent hover:opacity-90 text-white text-sm font-medium py-2.5 rounded transition duration-200 disabled:opacity-50"
              >
                {loading ? 'Agregando...' : 'Agregar Variante Manualmente'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Table Section */}
      {loading && variants.length === 0 ? (
        <div className="text-center py-12 text-brand-text text-sm font-medium">Cargando variantes...</div>
      ) : variants.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-brand-primary/20 text-brand-accent font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Atributos</th>
                <th className="px-6 py-3.5">SKU Auto-Generado</th>
                <th className="px-6 py-3.5">Precio ($)</th>
                <th className="px-6 py-3.5 text-center">Estado</th>
                <th className="px-6 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-brand-text">
              {variants.map((v) => {
                const attrs = Object.entries(v.attributesJson)
                  .map(([k, val]) => `${k}: ${val}`)
                  .join(' | ');

                const isEditing = editingId === v.id;

                return (
                  <tr key={v.id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 font-medium text-gray-800">{attrs}</td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editSku}
                          onChange={(e) => setEditSku(e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-brand-accent outline-none text-xs w-48"
                        />
                      ) : (
                        v.sku
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editPrice}
                          onChange={(e) => setEditPrice(parseFloat(e.target.value))}
                          className="border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-brand-accent outline-none text-xs w-24"
                        />
                      ) : (
                        `$${v.price.toFixed(2)}`
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleActive(v)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          v.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {v.isActive ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleSave(v.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 py-1 rounded transition"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="bg-gray-150 hover:bg-gray-250 text-gray-700 text-xs px-2.5 py-1 rounded transition"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(v)}
                          className="text-xs font-semibold text-brand-accent hover:text-black hover:underline"
                        >
                          Editar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white text-center py-16 rounded-lg border border-gray-200 text-gray-400">
          No hay variantes creadas para este producto. Rellena los campos de arriba para generar la matriz.
        </div>
      )}
    </div>
  );
};
