import { useState, useEffect } from 'react';
import { FaCashRegister, FaMoneyBillWave } from 'react-icons/fa';
import api from '../api/axios';

export const CashModal = ({ mode, onClose, onSuccess, user }) => {
  const [loading, setLoading] = useState(false);
  const [initialCash, setInitialCash] = useState('');
  const [comments, setComments] = useState('');
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (mode === 'close') {
      fetchStatus();
    }
  }, [mode]);

  const fetchStatus = async () => {
    try {
      const { data } = await api.get('/cash/status');
      setSummary(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'open') {
        await api.post('/cash/open', { initialCash: Number(initialCash) });
        alert('✅ Caja abierta correctamente');
      } else {
        await api.post('/cash/close', { comments });
        alert('✅ Caja cerrada. Turno finalizado.');
      }
      if (onSuccess) onSuccess();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Cálculos visuales para entender los números
  const currentTotal = summary ? Number(summary.currentTotal) : 0;
  const initial = summary ? Number(summary.initialCash) : 0;
  const totalSold = summary ? Number(summary.salesTotal) : 0;
  const cashSold = currentTotal - initial; // Lo que realmente entró en efectivo

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{maxWidth: '450px'}}>
        <div className="modal-header">
          <h2>{mode === 'open' ? '🔓 Apertura de Caja' : '🔒 Cierre de Caja'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div style={{textAlign: 'center', marginBottom: '20px'}}>
          <div style={{background: '#e3f2fd', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto'}}>
            <FaCashRegister style={{fontSize: '30px', color: '#1565c0'}}/>
          </div>
          <p style={{marginTop: '10px', color: '#666'}}>
            {mode === 'open' 
              ? `Hola ${user?.fullName || ''}, ingresa el efectivo inicial.` 
              : 'Revisa el arqueo antes de cerrar el turno.'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'open' ? (
            <div className="form-row">
              <label>Monto Inicial ($)</label>
              <div style={{position: 'relative'}}>
                <FaMoneyBillWave style={{position: 'absolute', left: '10px', top: '12px', color: '#888'}}/>
                <input 
                  type="number" 
                  value={initialCash} 
                  onChange={e => setInitialCash(e.target.value)} 
                  style={{paddingLeft: '35px', fontSize: '1.2rem', fontWeight: 'bold'}}
                  placeholder="0"
                  autoFocus
                  required
                />
              </div>
            </div>
          ) : (
            // VISTA DE CIERRE SIMPLIFICADA
            <div style={{background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px'}}>
              {!summary ? <p>Cargando resumen...</p> : (
                <>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize:'0.9rem', color:'#666'}}>
                    <span>Fondo Inicial:</span>
                    <span>${initial.toLocaleString()}</span>
                  </div>
                  
                  {/* Desglose visual importante */}
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize:'0.9rem', color:'#666'}}>
                     <span>Ventas Totales (Ref):</span>
                     <span>${totalSold.toLocaleString()}</span>
                  </div>

                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#2e7d32', fontWeight:'bold'}}>
                    <span>+ Ventas Efectivo:</span>
                    <span>${cashSold.toLocaleString()}</span>
                  </div>

                  <div style={{borderTop: '2px dashed #ccc', margin: '10px 0'}}></div>

                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: '900', color: '#1e3c72'}}>
                    <span>Total en Caja:</span>
                    <span>${currentTotal.toLocaleString()}</span>
                  </div>
                  <small style={{display:'block', textAlign:'center', color:'#888', marginTop:5}}>
                    (Debe haber este dinero físico en el cajón)
                  </small>
                </>
              )}
              
              <div className="form-row" style={{marginTop: '20px'}}>
                <label>Comentarios / Diferencias</label>
                <input 
                  value={comments} 
                  onChange={e => setComments(e.target.value)}
                  placeholder="Ej: Todo cuadra ok..."
                />
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-save" style={{width: mode === 'open' ? '100%' : 'auto'}} disabled={loading}>
              {loading ? 'Procesando...' : (mode === 'open' ? 'Abrir Caja' : 'Cerrar Turno')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};