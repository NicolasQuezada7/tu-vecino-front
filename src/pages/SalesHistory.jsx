import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FaEye, FaCalendarAlt, FaUser, FaBoxOpen } from 'react-icons/fa';
 // Asegúrate de tener este CSS o el genérico

export const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null); // Para el modal
  const [loading, setLoading] = useState(true);

  // Cargar lista de ventas
  const fetchSales = async () => {
    try {
      const res = await api.get('/sales');
      setSales(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar detalle de UNA venta
  const handleViewDetails = async (id) => {
    try {
      const res = await api.get(`/sales/${id}`);
      setSelectedSale(res.data); 
    } catch (error) {
      alert("Error al cargar detalles de la venta");
    }
  };

  useEffect(() => { fetchSales(); }, []);

  // Función segura para calcular total (evita el error reduce of undefined)
  const calculateTotal = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((acc, item) => {
      // Usamos item.subtotal si existe, si no, calculamos al vuelo
      const sub = item.subtotal || (Number(item.quantity) * Number(item.unitPrice));
      return acc + sub;
    }, 0);
  };

  return (
    <div>
      <div className="page-header-row">
        <h1 style={{color: '#1e3c72'}}>📜 Historial de Ventas</h1>
      </div>

      {loading ? <p>Cargando historial...</p> : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Método</th>
              <th>Vendedor</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(sale => (
              <tr key={sale.id}>
                <td>#{sale.id}</td>
                <td>{new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                <td>{sale.client || 'Cliente Casual'}</td>
                <td>
                    <span className="badge" style={{background: '#eee', color: '#333'}}>
                        {sale.paymentMethod === 'CASH' ? 'Efectivo' : 
                         sale.paymentMethod === 'DEBIT' ? 'Débito' : 
                         sale.paymentMethod === 'CREDIT' ? 'Crédito' : 'Transf.'}
                    </span>
                </td>
                <td>{sale.user?.fullName || 'Desconocido'}</td>
                <td style={{fontWeight:'bold'}}>${Number(sale.total).toLocaleString('es-CL')}</td>
                <td>
                  <button className="action-btn btn-view" onClick={() => handleViewDetails(sale.id)} style={{background:'#17a2b8'}}>
                    <FaEye /> Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* --- MODAL TIPO BOLETA --- */}
      {selectedSale && (
        <div className="modal-overlay" onClick={() => setSelectedSale(null)}>
          <div className="modal-content receipt" onClick={e => e.stopPropagation()} style={{fontFamily: 'Courier New, monospace', maxWidth: '380px'}}>
            
            <div className="receipt-header" style={{textAlign:'center', marginBottom:20}}>
              <h2 style={{margin:0, textTransform:'uppercase'}}>Tu Vecino</h2>
              <p style={{margin:0, fontSize:'0.9rem'}}>Comprobante #{selectedSale.id}</p>
              <p className="receipt-date" style={{fontSize:'0.8rem', color:'#555'}}>
                <FaCalendarAlt style={{marginRight:5}}/>
                {new Date(selectedSale.date).toLocaleString()}
              </p>
            </div>

            <div className="receipt-info" style={{fontSize:'0.9rem', marginBottom:15}}>
              <p><strong>Cliente:</strong> {selectedSale.client || 'Casual'}</p>
              <p><strong>Vendedor:</strong> <FaUser style={{fontSize:10}}/> {selectedSale.user?.fullName || 'Cajero'}</p>
              <p><strong>Pago:</strong> {selectedSale.paymentMethod}</p>
            </div>

            <div style={{borderBottom:'2px dashed #ccc', margin:'10px 0'}}></div>

            <table className="receipt-table" style={{width:'100%', fontSize:'0.85rem'}}>
              <thead>
                <tr style={{textAlign:'left'}}>
                  <th>Cant.</th>
                  <th>Producto</th>
                  <th style={{textAlign:'right'}}>Total</th>
                </tr>
              </thead>
              <tbody>
                {/* 🔥 PROTECCIÓN CONTRA EL ERROR REDUCE/MAP 🔥 */}
                {(selectedSale.items || []).length > 0 ? (
                    (selectedSale.items || []).map((item, index) => (
                    <tr key={index}>
                        <td>{item.quantity}</td>
                        <td>{item.product?.name || 'Producto eliminado'}</td>
                        <td style={{textAlign:'right'}}>
                            ${((item.subtotal) || (item.quantity * item.unitPrice)).toLocaleString('es-CL')}
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr><td colSpan="3" style={{textAlign:'center', padding:10}}>Sin detalles de productos</td></tr>
                )}
              </tbody>
            </table>

            <div style={{borderBottom:'2px dashed #ccc', margin:'10px 0'}}></div>

            <div className="receipt-total" style={{display:'flex', justifyContent:'space-between', fontSize:'1.2rem', fontWeight:'bold'}}>
              <span>TOTAL</span>
              {/* Usamos el total guardado en la venta, o calculamos si no existe */}
              <span>${(selectedSale.total || calculateTotal(selectedSale.items)).toLocaleString('es-CL')}</span>
            </div>

            <button className="close-modal-btn" onClick={() => setSelectedSale(null)} 
                style={{marginTop:20, width:'100%', padding:10, background:'#333', color:'white', border:'none', cursor:'pointer'}}>
              Cerrar Comprobante
            </button>
          </div>
        </div>
      )}
    </div>
  );
};