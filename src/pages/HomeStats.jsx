import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FaWallet, FaBoxOpen, FaUsers, FaExclamationTriangle, FaShoppingBag } from 'react-icons/fa';
import './HomeStats.css';

export const HomeStats = () => {
  // Estados para contadores
  const [totalSales, setTotalSales] = useState(0);
  const [income, setIncome] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [clientsCount, setClientsCount] = useState(0);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // 1. Cargar Ventas
        const salesRes = await api.get('/sales');
        const sales = salesRes.data;
        
        setTotalSales(sales.length);
        setRecentSales(sales.slice(0, 5)); // Tomamos las últimas 5

        // Calcular Ingresos Totales (Sumando subtotales de items si existen)
        // Nota: Como no guardamos el total en la tabla 'sale' (a menos que lo hayas descomentado en el backend),
        // aquí hacemos una aproximación o mostramos cantidad de ventas.
        // Si quieres sumar $$ real, necesitamos recorrer los items de cada venta.
        const totalDinero = sales.reduce((acc, sale) => {
            const totalVenta = sale.items?.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) || 0;
            return acc + totalVenta;
        }, 0);
        setIncome(totalDinero);

        // 2. Cargar Productos (Para ver bajo stock)
        const productsRes = await api.get('/products');
        const lowStock = productsRes.data.filter(p => p.stock < 10).length;
        setLowStockCount(lowStock);

        // 3. Cargar Clientes
        const clientsRes = await api.get('/clients');
        setClientsCount(clientsRes.data.length);

      } catch (error) {
        console.error("Error cargando estadísticas", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) return <div style={{padding: 20}}>Cargando tablero...</div>;

  return (
    <div className="stats-container">
      <div className="welcome-banner">
        <h1>📊 Resumen General</h1>
        <p>Bienvenido al panel de control de Tu Vecino</p>
      </div>

      <div className="stats-grid">
        {/* Tarjeta 1: Ventas Totales ($) */}
        <div className="stat-card green">
          <div className="stat-icon"><FaWallet /></div>
          <div className="stat-info">
            <h3>${income.toLocaleString()}</h3>
            <p>Ingresos Totales</p>
          </div>
        </div>

        {/* Tarjeta 2: Cantidad Ventas */}
        <div className="stat-card blue">
          <div className="stat-icon"><FaShoppingBag /></div>
          <div className="stat-info">
            <h3>{totalSales}</h3>
            <p>Ventas Realizadas</p>
          </div>
        </div>

        {/* Tarjeta 3: Bajo Stock */}
        <div className="stat-card orange">
          <div className="stat-icon"><FaExclamationTriangle /></div>
          <div className="stat-info">
            <h3>{lowStockCount}</h3>
            <p>Productos Bajo Stock</p>
          </div>
        </div>

        {/* Tarjeta 4: Clientes */}
        <div className="stat-card purple">
          <div className="stat-icon"><FaUsers /></div>
          <div className="stat-info">
            <h3>{clientsCount}</h3>
            <p>Clientes Registrados</p>
          </div>
        </div>
      </div>

      {/* Tabla de Últimas Ventas */}
      <div className="recent-section">
        <h3 className="section-title">Últimas Ventas Registradas</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID Venta</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Items</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {recentSales.map(sale => {
              // Calcular total de esta venta al vuelo
              const totalVenta = sale.items?.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) || 0;
              
              return (
                <tr key={sale.id}>
                  <td>#{sale.id}</td>
                  <td>{new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString()}</td>
                  <td style={{fontWeight: 'bold'}}>{sale.client || 'Cliente General'}</td>
                  <td>{sale.items?.length || 0} productos</td>
                  <td style={{color: '#28a745', fontWeight: 'bold'}}>${totalVenta.toLocaleString()}</td>
                </tr>
              );
            })}
            {recentSales.length === 0 && <tr><td colSpan="5">No hay ventas registradas aún.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};