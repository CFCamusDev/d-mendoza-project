import React, { useState } from 'react';
import { ShoppingCart, Tag, Trash2, Plus, Minus } from 'lucide-react';
import { DiscountPanel } from '@/features/pos';
import type { CartItem, DiscountResult } from '@/features/pos';

// ─── Tipos locales ────────────────────────────────────────────────────────────
interface CartDisplayItem extends CartItem {
  label: string;
}

const DEMO_DISPLAY: CartDisplayItem[] = [
  { variantId: 1, quantity: 2, unitPrice: 49.99, label: 'Polo Manga Corta (Azul / M)' },
  { variantId: 2, quantity: 1, unitPrice: 25.00, label: 'Gorra Casual (Negro / Único)' },
];

/**
 * HU-034 / HU-035 / HU-036 / HU-039 — Página base del Punto de Venta (POS).
 *
 * Esta página actúa como contenedor principal para todos los módulos del POS.
 * Actualmente contiene el carrito de prueba y el <DiscountPanel> (HU-034).
 * En las siguientes historias se integrarán <PaymentPanel>, <Receipt>, etc.
 *
 * URL: /admin/pos
 */
const PosPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartDisplayItem[]>(DEMO_DISPLAY);
  const [discountResult, setDiscountResult] = useState<DiscountResult | null>(null);

  // Calcula subtotal del carrito en tiempo real
  const subtotal = cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const total = discountResult ? discountResult.total : subtotal;

  const handleQuantityChange = (variantId: number, delta: number) => {
    setDiscountResult(null); // Resetea el descuento si cambia el carrito
    setCartItems(prev =>
      prev
        .map(item =>
          item.variantId === variantId
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const handleRemove = (variantId: number) => {
    setDiscountResult(null);
    setCartItems(prev => prev.filter(item => item.variantId !== variantId));
  };

  // Convierte los ítems del display al formato que espera el <DiscountPanel>
  const cartForDiscount: CartItem[] = cartItems.map(({ variantId, quantity, unitPrice }) => ({
    variantId,
    quantity,
    unitPrice,
  }));

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F7F7F5',
        padding: '32px 24px',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Encabezado de la página */}
      <div style={{ marginBottom: '28px' }}>
        <h1
          style={{
            fontSize: '22px',
            fontWeight: 800,
            color: '#3F3F3F',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <ShoppingCart size={24} />
          Punto de Venta
        </h1>
        <p style={{ color: '#9B9B94', fontSize: '13px', marginTop: '4px' }}>
          Gestiona la venta, aplica descuentos y registra los pagos desde aquí.
        </p>
      </div>

      {/* Layout de dos columnas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* ── Columna izquierda: Carrito ── */}
        <div
          style={{
            background: '#fff',
            border: '1.5px solid #D9D9D2',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          {/* Cabecera tabla */}
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid #D9D9D2',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#F7F7F5',
            }}
          >
            <ShoppingCart size={16} color="#3F3F3F" />
            <span style={{ fontWeight: 700, color: '#3F3F3F', fontSize: '14px' }}>
              Carrito de Venta
            </span>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: '12px',
                background: '#3F3F3F',
                color: '#F7F7F5',
                borderRadius: '20px',
                padding: '2px 10px',
                fontWeight: 600,
              }}
            >
              {cartItems.length} ítem(s)
            </span>
          </div>

          {/* Tabla de ítems */}
          {cartItems.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9B9B94' }}>
              El carrito está vacío.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F7F7F5', fontSize: '12px', color: '#6B6B6B' }}>
                  <th style={{ padding: '10px 20px', textAlign: 'left', fontWeight: 600 }}>Producto</th>
                  <th style={{ padding: '10px', textAlign: 'center', fontWeight: 600 }}>Cantidad</th>
                  <th style={{ padding: '10px', textAlign: 'right', fontWeight: 600 }}>P. Unit.</th>
                  <th style={{ padding: '10px', textAlign: 'right', fontWeight: 600 }}>Subtotal</th>
                  <th style={{ padding: '10px 20px', textAlign: 'center', fontWeight: 600 }}></th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item, idx) => (
                  <tr
                    key={item.variantId}
                    style={{
                      borderTop: idx > 0 ? '1px solid #F0F0EC' : 'none',
                      fontSize: '13px',
                    }}
                  >
                    <td style={{ padding: '12px 20px', color: '#3F3F3F', fontWeight: 500 }}>
                      {item.label}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          border: '1.5px solid #D9D9D2',
                          borderRadius: '8px',
                          padding: '3px 8px',
                        }}
                      >
                        <button
                          onClick={() => handleQuantityChange(item.variantId, -1)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0',
                            color: '#3F3F3F',
                            display: 'flex',
                          }}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.variantId, 1)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0',
                            color: '#3F3F3F',
                            display: 'flex',
                          }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#6B6B6B' }}>
                      S/. {item.unitPrice.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: '#3F3F3F' }}>
                      S/. {(item.unitPrice * item.quantity).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleRemove(item.variantId)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#c0392b',
                          display: 'flex',
                          padding: '4px',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Totales */}
          <div
            style={{
              padding: '16px 20px',
              borderTop: '1px solid #D9D9D2',
              background: '#F7F7F5',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '13px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B6B6B' }}>
              <span>Subtotal:</span>
              <span>S/. {subtotal.toFixed(2)}</span>
            </div>
            {discountResult && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#c0392b' }}>
                <span>
                  Descuento (
                  {discountResult.discountType === 'percentage'
                    ? `${discountResult.discountValue}%`
                    : 'Monto fijo'}
                  ):
                </span>
                <span>- S/. {discountResult.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: '#3F3F3F',
                fontWeight: 800,
                fontSize: '16px',
                borderTop: '1px solid #D9D9D2',
                paddingTop: '8px',
                marginTop: '4px',
              }}
            >
              <span>TOTAL:</span>
              <span>S/. {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ── Columna derecha: Panel de acciones ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Panel de Descuentos (HU-034) */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '8px',
              }}
            >
              <Tag size={14} color="#9B9B94" />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#9B9B94', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Descuentos — HU-034
              </span>
            </div>
            <DiscountPanel
              items={cartForDiscount}
              onDiscountApplied={(result) => setDiscountResult(result)}
            />
          </div>

          {/* Placeholder PaymentPanel (HU-035) */}
          <div
            style={{
              border: '1.5px dashed #D9D9D2',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
              color: '#9B9B94',
              fontSize: '13px',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              HU-035 — Próximamente
            </span>
            Panel de Métodos de Pago
          </div>

          {/* Placeholder Receipt (HU-036) */}
          <div
            style={{
              border: '1.5px dashed #D9D9D2',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
              color: '#9B9B94',
              fontSize: '13px',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              HU-036 — Próximamente
            </span>
            Emisión de Comprobantes y Vuelto
          </div>
        </div>
      </div>
    </div>
  );
};

export default PosPage;
