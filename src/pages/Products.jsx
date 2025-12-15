import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FaEdit, FaTrash, FaPlus, FaBoxOpen, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';

export const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Formulario
  const [formData, setFormData] = useState({
    sku: '', name: '', price: '', stock: '', categoryId: '', providerId: ''
  });

  // Estado para "Nueva Categoría Rápida"
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Estados para Filtro de Stock
  const [stockFilter, setStockFilter] = useState('ALL'); // 'ALL', 'LOW', 'OUT'
  const LOW_STOCK_THRESHOLD = 10; // Umbral de stock bajo

  // --- CARGA INICIAL ---
  const fetchData = async () => {
    try {
      const [resProd, resCat, resProv] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
        api.get('/providers')
      ]);
      setProducts(resProd.data);
      setCategories(resCat.data);
      setProviders(resProv.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- LÓGICA DE FILTRADO ---
  const getFilteredProducts = () => {
    switch (stockFilter) {
      case 'LOW':
        // Stock bajo (queda, pero menos del umbral)
        return products.filter(p => Number(p.stock) > 0 && Number(p.stock) < LOW_STOCK_THRESHOLD);
      case 'OUT':
        // Agotados
        return products.filter(p => Number(p.stock) === 0);
      case 'ALL':
      default:
        return products;
    }
  };
  const filteredProducts = getFilteredProducts();

  // Contador para los badges de los botones
  const countStockStatus = (status) => {
    if (status === 'LOW') {
      return products.filter(p => Number(p.stock) > 0 && Number(p.stock) < LOW_STOCK_THRESHOLD).length;
    }
    if (status === 'OUT') {
      return products.filter(p => Number(p.stock) === 0).length;
    }
    return products.length;
  };

  // --- MANEJO DEL MODAL ---
  const openModal = (product = null) => {
    if (product) {
      setIsEditing(true);
      setCurrentId(product.id);
      setFormData({
        sku: product.sku,
        name: product.name,
        price: product.price,
        stock: product.stock,
        // Al editar, aseguramos que se cargue el ID numérico
        categoryId: product.category?.id || '',
        providerId: product.provider?.id || ''
      });
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setFormData({ sku: '', name: '', price: '', stock: '', categoryId: '', providerId: '' });
    }
    setShowNewCatInput(false);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  // --- CREAR CATEGORÍA RÁPIDA ---
  const handleQuickCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const res = await api.post('/categories', { name: newCatName });
      const newCat = res.data;
      
      setCategories([...categories, newCat]);
      setFormData({ ...formData, categoryId: newCat.id });
      
      setNewCatName('');
      setShowNewCatInput(false);
      alert('Categoría creada!');
    } catch (error) {
      alert('Error al crear categoría');
    }
  };

  // --- GUARDAR PRODUCTO (BLINDADO para Edición) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Conversión segura de IDs y manejo de strings vacíos a null
      const categoryIdValue = formData.categoryId ? Number(formData.categoryId) : null;
      const providerIdValue = formData.providerId ? Number(formData.providerId) : null;

      const payload = {
        sku: formData.sku,
        name: formData.name,
        // Conversiones obligatorias a Number
        price: Number(formData.price),
        stock: Number(formData.stock),
        
        // Asignación de IDs
        categoryId: categoryIdValue, 
        providerId: providerIdValue,
      };

      if (isEditing) {
        // PATCH: Editar producto existente
        await api.patch(`/products/${currentId}`, payload);
      } else {
        // POST: Crear nuevo producto
        await api.post('/products', payload);
      }
      
      alert(`Producto ${isEditing ? 'actualizado' : 'creado'} correctamente`);
      closeModal();
      fetchData(); // Recargar tabla
    } catch (error) {
      console.error('Error al guardar producto:', error.response?.data || error.message);
      alert('Error al guardar producto. Revisa los datos (SKU, Stock, IDs).');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Borrar producto? Esta acción es irreversible.')) {
      await api.delete(`/products/${id}`);
      fetchData();
    }
  };

  return (
    <div className="main-content-card">
      <div className="page-header-row">
        <h1 style={{color: '#1e3c72'}}>📦 Inventario de Productos</h1>
        <button className="btn-primary" onClick={() => openModal()}>
          <FaPlus /> Nuevo Producto
        </button>
      </div>

      {/* --- BOTONES DE FILTRO DE STOCK --- */}
      <div className="filter-buttons" style={{ marginBottom: '20px', display: 'flex', gap: '15px' }}>
        <button
          className="btn-filter"
          style={{ background: stockFilter === 'ALL' ? '#1e3c72' : '#f8f9fa', color: stockFilter === 'ALL' ? 'white' : '#333' }}
          onClick={() => setStockFilter('ALL')}
        >
          <FaBoxOpen style={{ marginRight: '8px' }} /> Todos ({countStockStatus('ALL')})
        </button>

        <button
          className="btn-filter"
          style={{ background: stockFilter === 'LOW' ? '#ffc107' : '#f8f9fa', color: stockFilter === 'LOW' ? 'white' : '#333', border: stockFilter === 'LOW' ? '1px solid #ffc107' : '1px solid #ccc' }}
          onClick={() => setStockFilter('LOW')}
        >
          <FaExclamationTriangle style={{ marginRight: '8px' }} /> Stock Bajo ({countStockStatus('LOW')})
        </button>

        <button
          className="btn-filter"
          style={{ background: stockFilter === 'OUT' ? '#dc3545' : '#f8f9fa', color: stockFilter === 'OUT' ? 'white' : '#333', border: stockFilter === 'OUT' ? '1px solid #dc3545' : '1px solid #ccc' }}
          onClick={() => setStockFilter('OUT')}
        >
          <FaTimesCircle style={{ marginRight: '8px' }} /> Agotados ({countStockStatus('OUT')})
        </button>
      </div>

      {loading ? <p>Cargando...</p> : (
        <table className="data-table">
          <thead>
            <tr><th>SKU</th><th>Producto</th><th>Categoría</th><th>Proveedor</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map(p => {
                const currentStock = Number(p.stock);
                const isLowStock = currentStock > 0 && currentStock < LOW_STOCK_THRESHOLD;
                const isOut = currentStock === 0;

                return (
                  <tr key={p.id}>
                    <td>{p.sku}</td>
                    <td style={{fontWeight:'bold'}}>{p.name}</td>
                    <td><span className="badge" style={{background:'#e0f7fa', color:'#006064'}}>{p.category?.name}</span></td>
                    <td>{p.provider?.name}</td>
                    <td>${p.price.toLocaleString('es-CL')}</td>
                    <td style={{color: isOut ? 'red' : isLowStock ? '#ffc107' : 'green', fontWeight:'bold'}}>
                      {p.stock}
                    </td>
                    <td>
                      <button className="action-btn btn-edit" onClick={() => openModal(p)}><FaEdit/></button>
                      <button className="action-btn btn-delete" onClick={() => handleDelete(p.id)}><FaTrash/></button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No hay productos que coincidan con el filtro.</td></tr>
            )}
          </tbody>
        </table>
      )}

      {/* --- MODAL DE CREACIÓN / EDICIÓN --- */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 2fr', gap:15}}>
                <div className="form-row">
                  <label>SKU</label>
                  <input value={formData.sku} onChange={e=>setFormData({...formData, sku:e.target.value})} required placeholder="Ej: A-001"/>
                </div>
                <div className="form-row">
                  <label>Nombre</label>
                  <input value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} required/>
                </div>
              </div>

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:15}}>
                <div className="form-row">
                  <label>Precio</label>
                  <input type="number" value={formData.price} onChange={e=>setFormData({...formData, price:e.target.value})} required/>
                </div>
                <div className="form-row">
                  <label>Stock</label>
                  <input type="number" value={formData.stock} onChange={e=>setFormData({...formData, stock:e.target.value})} required/>
                </div>
              </div>

              {/* SELECCIÓN DE CATEGORÍA CON CREACIÓN RÁPIDA */}
              <div className="form-row">
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <label>Categoría</label>
                  <span style={{fontSize:'0.8rem', color:'#1e3c72', cursor:'pointer', textDecoration:'underline'}} onClick={()=>setShowNewCatInput(!showNewCatInput)}>
                    {showNewCatInput ? 'Cancelar' : '+ Nueva Categoría'}
                  </span>
                </div>
                
                {showNewCatInput ? (
                  <div style={{display:'flex', gap:5}}>
                    <input placeholder="Nombre nueva cat." value={newCatName} onChange={e=>setNewCatName(e.target.value)} autoFocus />
                    <button type="button" onClick={handleQuickCategory} style={{background:'#4caf50', color:'white', border:'none', borderRadius:4, padding:'0 10px'}}>OK</button>
                  </div>
                ) : (
                  <select value={formData.categoryId} onChange={e=>setFormData({...formData, categoryId:e.target.value})} required>
                    <option value="">-- Seleccione --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                )}
              </div>

              <div className="form-row">
                <label>Proveedor</label>
                <select value={formData.providerId} onChange={e=>setFormData({...formData, providerId:e.target.value})} required>
                  <option value="">-- Seleccione --</option>
                  {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn-save">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};