import { useEffect, useState } from 'react';
import api from '../api/axios';
import { 
  FaBarcode, FaMoneyBillWave, FaCreditCard, FaExchangeAlt, 
  FaTrash, FaCheckCircle, FaSpinner
} from 'react-icons/fa';
import './Sales.css';
import logoImg from '../assets/logo.png'; 
// CashModal y otros imports de caja eliminados correctamente.

export const Sales = () => {
  // --- ESTADOS EXISTENTES ---
  const [products, setProducts] = useState([]); 
  const [cart, setCart] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH'); 
  const [amountTendered, setAmountTendered] = useState(''); 
  const [clientName, setClientName] = useState('Cliente General');
  const [loading, setLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSaleData, setLastSaleData] = useState(null);
  const [clients, setClients] = useState([]); 

  // --- ESTADO DE CAJA (SOLO STATUS para validaciones) ---
  const [cashStatus, setCashStatus] = useState({ isOpen: false }); 

  // --- FUNCIÓN PARA CONSULTAR ESTADO DE CAJA ---
  const checkCashStatus = async () => {
    try {
      const { data } = await api.get('/cash/status');
      setCashStatus(data); 
    } catch (error) {
      setCashStatus({ isOpen: false });
      console.error("Error consultando caja:", error);
    }
  };

  // --- CARGAR DATOS INICIALES (Productos, Clientes y Estado de Caja) ---
  const loadData = async () => {
    try {
      const prodRes = await api.get('/products');
      setProducts(prodRes.data.map(p => ({
        ...p, price: Number(p.price), stock: Number(p.stock)
      })));

      const clientsRes = await api.get('/clients');
      setClients(clientsRes.data);
    } catch (error) { 
      console.error("Error cargando productos/clientes:", error);
    }
    
    // Siempre chequeamos el estado de caja para las validaciones
    checkCashStatus();
  };

  useEffect(() => { loadData(); }, []); 

  // --- LÓGICA CARRITO Y VALIDACIONES ---
  const addToCart = (product) => {
    // 🔥 Validacion 1: Al añadir producto
    if (!cashStatus.isOpen) return alert("⚠️ Debes ABRIR LA CAJA antes de añadir productos.");
    if (product.stock <= 0) return alert("❌ Sin stock.");
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.qty + 1 > product.stock) return alert("⚠️ Stock insuficiente.");
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    setSearchTerm('');
    setShowResults(false);
  };
  
  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));
  const total = cart.reduce((acc, item) => acc + (Number(item.price) * Number(item.qty)), 0);
  const tenderedNumber = amountTendered === '' ? 0 : Number(amountTendered);
  const change = tenderedNumber - total;

  // --- FINALIZAR VENTA ---
  const handleFinalizeSale = async () => {
    // 🔥 Validacion 2: Al finalizar la venta
    if (!cashStatus.isOpen) {
      return alert("⚠️ Debes ABRIR LA CAJA antes de realizar una venta.");
    }
    if (cart.length === 0) return alert("Carrito vacío");
    if (paymentMethod === 'CASH' && change < 0) return alert("Monto insuficiente");

    setLoading(true);
    try {
      await api.post('/sales', {
        client: clientName || "Cliente General",
        paymentMethod: paymentMethod,
        items: cart.map(item => ({ productId: Number(item.id), quantity: Number(item.qty) }))
      });
      
      // Datos para la boleta
      setLastSaleData({
        client: clientName || "Cliente General",
        total: Number(total),
        items: cart.map(item => ({...item})),
        method: paymentMethod === 'CASH' ? 'Efectivo' : paymentMethod === 'DEBIT' ? 'Débito' : paymentMethod === 'CREDIT' ? 'Crédito' : 'Transferencia',
        date: new Date().toLocaleString(),
        tendered: tenderedNumber,
        change: change
      });
      
      setCart([]);
      setAmountTendered('');
      setClientName('Cliente General');
      await loadData(); // Recarga productos y verifica status
      setShowReceipt(true);
    } catch (error) {
      const msg = error.response?.data?.message || "Error desconocido";
      alert(`Error: ${Array.isArray(msg) ? msg.join(', ') : msg}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = searchTerm.length > 0 
    ? products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.includes(searchTerm))
    : [];

  return (
    <div className="pos-container">
      
      {/* --- MODAL BOLETA (CONTENIDO RESTAURADO) --- */}
      {showReceipt && lastSaleData && (
        <div className="modal-overlay">
          <div className="receipt-card">
            <div className="receipt-header">
              <img src={logoImg} alt="Tu Vecino" className="receipt-logo" />
              <div className="receipt-title">Tu Vecino</div>
              <small>Minimarket & Abarrotes</small>
            </div>
            
            <div className="dashed-line"></div>
            
            <div className="receipt-details">
              <div className="receipt-row"><span>Fecha:</span> <span>{lastSaleData.date}</span></div>
              <div className="receipt-row"><span>Cliente:</span> <span>{lastSaleData.client}</span></div>
              <div className="receipt-row"><span>Pago:</span> <strong>{lastSaleData.method}</strong></div>
            </div>

            <div className="dashed-line"></div>

            <div className="receipt-items">
              {lastSaleData.items.map((item, index) => (
                <div key={index} className="receipt-row">
                  <span>{item.qty} x {item.name}</span>
                  <span>${(Number(item.price) * Number(item.qty)).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="dashed-line"></div>

            <div className="receipt-total">
              TOTAL: ${Number(lastSaleData.total).toLocaleString()}
            </div>
            
            {(lastSaleData.method === 'Efectivo') && (
              <div style={{marginTop: '10px', fontSize: '0.9rem'}}>
                <div className="receipt-row"><span>Efectivo:</span> <span>${Number(lastSaleData.tendered).toLocaleString()}</span></div>
                <div className="receipt-row"><span>Vuelto:</span> <span>${Number(lastSaleData.change).toLocaleString()}</span></div>
              </div>
            )}

            <button className="btn-close-receipt" onClick={() => setShowReceipt(false)}>
              <FaCheckCircle style={{marginRight: '8px'}}/> Aceptar y Cerrar
            </button>
          </div>
        </div>
      )}

      {/* --- PANEL IZQUIERDO --- */}
      <div className="pos-left-panel">
        <div className="search-bar-container">
          <FaBarcode className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar producto (Nombre o SKU)..." 
            className="pos-input"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setShowResults(true); }}
            autoFocus
            // 🔥 Deshabilitar búsqueda si caja está cerrada
            disabled={!cashStatus.isOpen}
          />
        </div>

        {/* CONTENIDO DEL RESULTADO DE BÚSQUEDA */}
        {showResults && filteredProducts.length > 0 && (
          <div className="search-results">
            {filteredProducts.map(p => (
              <div key={p.id} className="search-item" onClick={() => addToCart(p)}>
                <div>
                  <strong>{p.name}</strong>
                  <span style={{fontSize: '0.8rem', marginLeft: '10px', color: p.stock < 5 ? 'red' : 'green'}}> (Stock: {p.stock})</span>
                </div>
                <span>${Number(p.price).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        <div className="cart-list-container">
          <table className="cart-table">
            <thead>
              <tr><th>Prod</th><th>$$</th><th>Cant</th><th>Sub</th><th></th></tr>
            </thead>
            <tbody>
              {cart.map(item => (
                <tr key={item.id}>
                  <td>
                    <div style={{fontWeight: 'bold'}}>{item.name}</div>
                    <small style={{color: '#888'}}>{item.sku}</small>
                  </td>
                  <td>${Number(item.price).toLocaleString()}</td>
                  <td><span className="qty-badge">{item.qty}</span></td>
                  <td style={{fontWeight: 'bold', color: '#2a5298'}}>${(Number(item.price) * item.qty).toLocaleString()}</td>
                  <td><button onClick={() => removeFromCart(item.id)} style={{color: '#ff4d4d', background:'none', border:'none'}}><FaTrash/></button></td>
                </tr>
              ))}
              {cart.length === 0 && <tr><td colSpan="5" style={{textAlign:'center', padding:'40px', color:'#aaa'}}>🛒 Carrito vacío.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- PANEL DERECHO --- */}
      <div className="pos-right-panel">
        
        {/* 1. ÁREA SUPERIOR FIJA: Total */}
        <div className="pos-top-fixed">
          
          {/* PANTALLA DE TOTAL */}
          <div className="total-display">
            <div className="total-label">Total a Pagar</div>
            <h1 className="total-amount">${total.toLocaleString()}</h1>
          </div>
        </div> 

        {/* 2. ÁREA DE PAGO (FIJA Y COMPACTA) */}
        <div className="pos-payment-scroll">

          <div className="payment-header">
            <h3>Detalle de Pago</h3>
            <select 
              className="pos-input" 
              style={{border: '1px solid #ddd', padding: '10px', fontSize: '1rem'}}
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              disabled={!cashStatus.isOpen} 
            >
              <option value="Cliente General">Cliente General (Público)</option>
              {clients.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        
          <div className="payment-methods">
            <button className={`method-btn ${paymentMethod === 'CASH' ? 'active' : ''}`} onClick={() => setPaymentMethod('CASH')} disabled={!cashStatus.isOpen}>
              <FaMoneyBillWave className="method-icon"/> Efectivo
            </button>
            <button className={`method-btn ${paymentMethod === 'DEBIT' ? 'active' : ''}`} onClick={() => setPaymentMethod('DEBIT')} disabled={!cashStatus.isOpen}>
              <FaCreditCard className="method-icon"/> Débito
            </button>
            <button className={`method-btn ${paymentMethod === 'CREDIT' ? 'active' : ''}`} onClick={() => setPaymentMethod('CREDIT')} disabled={!cashStatus.isOpen}>
              <FaCreditCard className="method-icon"/> Crédito
            </button>
            <button className={`method-btn ${paymentMethod === 'TRANSFER' ? 'active' : ''}`} onClick={() => setPaymentMethod('TRANSFER')} disabled={!cashStatus.isOpen}>
              <FaExchangeAlt className="method-icon"/> Transf.
            </button>
          </div>

          <div className="payment-details">
            {paymentMethod === 'CASH' && (
              <div className="cash-input-group">
                <label>Monto Entregado ($):</label>
                <input 
                  type="number" 
                  className="cash-input" 
                  placeholder="0" 
                  value={amountTendered}
                  onChange={e => setAmountTendered(e.target.value)}
                  disabled={!cashStatus.isOpen} 
                />
                <div className="change-display">
                  <span>Vuelto:</span>
                  <span className={change >= 0 ? 'change-positive' : 'change-negative'}>
                    ${amountTendered ? change.toLocaleString() : '0'}
                  </span>
                </div>
              </div>
            )}
            
            {(paymentMethod === 'DEBIT' || paymentMethod === 'CREDIT') && (
              <div className="info-box">
                <FaSpinner className="icon-spin" style={{fontSize: '2rem', marginBottom: '10px', color: '#2a5298'}} />
                <p><strong>Esperando Datafono...</strong></p>
              </div>
            )}

            {paymentMethod === 'TRANSFER' && (
              <div className="transfer-data">
                <p style={{textAlign: 'center', marginBottom: '10px'}}><strong>Datos Bancarios</strong></p>
                <p>🏦 Banco Estado | Cuenta RUT</p>
                <p>👤 Tu Vecino SpA | 76.123.456-K</p>
              </div>
            )}
          </div>
        </div> 

        {/* 3. ÁREA INFERIOR FIJA: Botón de Confirmar Venta */}
        <div className="pos-bottom-fixed">
          <button 
            className="finish-sale-btn" 
            onClick={handleFinalizeSale} 
            disabled={loading || cart.length === 0 || !cashStatus.isOpen || (paymentMethod === 'CASH' && change < 0)}
          >
            {loading ? <FaSpinner className="icon-spin"/> : <FaCheckCircle/>} {loading ? 'Procesando...' : 'Confirmar Venta'}
          </button>
        </div>
      </div>
    </div>
  );
};