import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../config/firebase';
import { collection, getDocs, updateDoc, deleteDoc, doc, addDoc, onSnapshot } from 'firebase/firestore';
import products from '../data/products.json';
import './AdminPanel.css';

export default function AdminPanel() {
  const { logout } = useAuth();
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [saveStatus, setSaveStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasFirestoreProducts, setHasFirestoreProducts] = useState(false);

  // Cargar productos desde Firestore con listener en tiempo real
  useEffect(() => {
    const productsRef = collection(db, 'products');
    
    const unsubscribe = onSnapshot(productsRef, (querySnapshot) => {
      try {
        const productsData = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          firebaseId: doc.id
        }));
        
        if (productsData.length === 0) {
          // Si no hay productos en Firestore, mostrar formulario vacío (sin cargar del JSON)
          setItems([]);
          setHasFirestoreProducts(false);
        } else {
          setItems(productsData);
          setHasFirestoreProducts(true);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading products:', error);
        setItems([]);
        setHasFirestoreProducts(false);
        setIsLoading(false);
      }
    }, (error) => {
      console.error('Error setting up listener:', error);
      setItems([]);
      setHasFirestoreProducts(false);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleEdit = (product) => {
    setEditingId(product.id);
    setEditData({ ...product });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSave = async (id) => {
    try {
      const product = items.find(p => p.id === id);
      if (!product) return;

      // Actualizar en Firestore
      if (product.firebaseId) {
        const docRef = doc(db, 'products', product.firebaseId);
        await updateDoc(docRef, editData);
      } else {
        // Si no existe en Firebase, crear nuevo documento
        await addDoc(collection(db, 'products'), {
          ...editData,
          id: editData.id,
          name: editData.name,
          description: editData.description,
          basePriceOneColor: Number(editData.basePriceOneColor || editData.price),
          priceColor: Number(editData.priceColor || editData.price),
          material: editData.material,
          dimensions: editData.dimensions,
          icon: editData.icon,
          color: editData.color,
          paperTypes: editData.paperTypes || [
            { "id": "paper1", "name": "Kraft", "label": "Kraft - Estándar" },
            { "id": "paper2", "name": "Maulle", "label": "Maulle - Premium" }
          ]
        });
      }

      setEditingId(null);
      setSaveStatus('✅ Producto actualizado');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error saving product:', error);
      setSaveStatus('❌ Error al guardar');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: field === 'basePriceOneColor' || field === 'priceColor' || field === 'price' || field === 'stock' ? Number(value) : value,
    }));
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        const product = items.find(p => p.id === id);
        if (product && product.firebaseId) {
          const docRef = doc(db, 'products', product.firebaseId);
          await deleteDoc(docRef);
        }
        setSaveStatus('🗑️ Producto eliminado');
        setTimeout(() => setSaveStatus(''), 3000);
      } catch (error) {
        console.error('Error deleting product:', error);
        setSaveStatus('❌ Error al eliminar');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    }
  };

  const handleAddProduct = async () => {
    try {
      const newId = Math.max(...items.map((i) => i.id), 0) + 1;
      const newProduct = {
        id: newId,
        name: 'Nuevo Producto',
        description: 'Descripción',
        basePriceOneColor: 100,
        priceColor: 150,
        material: 'Material',
        dimensions: '20×20×10 cm',
        icon: String(newId),
        color: 'primary',
        paperTypes: [
          { "id": "paper1", "name": "Kraft", "label": "Kraft - Estándar" },
          { "id": "paper2", "name": "Maulle", "label": "Maulle - Premium" }
        ]
      };
      
      await addDoc(collection(db, 'products'), newProduct);
      setSaveStatus('➕ Nuevo producto creado');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error adding product:', error);
      setSaveStatus('❌ Error al crear producto');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const initializeDefaultProducts = async () => {
    if (!confirm('¿Agregar los 5 productos por defecto a Firestore?')) return;
    
    try {
      setSaveStatus('⏳ Inicializando productos...');
      const productsRef = collection(db, 'products');
      
      console.log('📦 Iniciando carga de productos...');
      console.log('Productos a cargar:', products);
      
      for (const product of products) {
        console.log('Guardando:', product.name);
        const docRef = await addDoc(productsRef, {
          id: product.id,
          name: product.name,
          description: product.description,
          basePriceOneColor: Number(product.basePriceOneColor),
          priceColor: Number(product.priceColor),
          material: product.material,
          dimensions: product.dimensions,
          icon: product.icon,
          color: product.color,
          images: product.images || [],
          paperTypes: product.paperTypes || [
            { "id": "paper1", "name": "Kraft", "label": "Kraft - Estándar" },
            { "id": "paper2", "name": "Maulle", "label": "Maulle - Premium" }
          ],
          createdAt: new Date().toISOString(),
        });
        console.log('✅ Guardado con ID:', docRef.id);
      }
      
      setSaveStatus(`✅ ${products.length} productos inicializados`);
      console.log('✅ Todos los productos se guardaron exitosamente');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('❌ Error inicializando productos:', error);
      console.error('Mensaje:', error.message);
      console.error('Código:', error.code);
      setSaveStatus(`❌ Error: ${error.message}`);
      setTimeout(() => setSaveStatus(''), 5000);
    }
  };

  const updateExistingProducts = async () => {
    if (!confirm('¿Actualizar productos existentes con datos del JSON (incluyendo imágenes)?')) return;
    
    try {
      setSaveStatus('⏳ Actualizando productos...');
      let updated = 0;
      
      for (const product of items) {
        if (product.firebaseId) {
          const jsonProduct = products.find(p => p.id === product.id);
          if (jsonProduct) {
            const docRef = doc(db, 'products', product.firebaseId);
            await updateDoc(docRef, {
              images: jsonProduct.images || [],
              basePriceOneColor: Number(jsonProduct.basePriceOneColor),
              priceColor: Number(jsonProduct.priceColor),
              paperTypes: jsonProduct.paperTypes || product.paperTypes,
              description: jsonProduct.description,
              dimensions: jsonProduct.dimensions,
              material: jsonProduct.material
            });
            updated++;
            console.log(`✅ Actualizado: ${jsonProduct.name}`);
          }
        }
      }
      
      setSaveStatus(`✅ ${updated} productos actualizados`);
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('❌ Error actualizando productos:', error);
      setSaveStatus(`❌ Error: ${error.message}`);
      setTimeout(() => setSaveStatus(''), 5000);
    }
  };

  return (
    <div className="admin-container">
      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p>Cargando productos...</p>
        </div>
      )}
      
      {!isLoading && (
      <>
      <div className="admin-header">
        <div className="admin-title">
          <h1>⚙️ Panel de Administración</h1>
          <p>Gestiona tus productos</p>
        </div>

        <div className="admin-actions">
          <button className="btn-add" onClick={handleAddProduct}>
            ➕ Agregar Producto
          </button>
          {hasFirestoreProducts && (
            <button 
              className="btn-add" 
              onClick={updateExistingProducts}
              style={{ backgroundColor: '#2196F3' }}
            >
              🔄 Actualizar Productos
            </button>
          )}
          <button className="btn-logout" onClick={() => {
            logout();
            // Limpiar hash para volver al home
            window.location.hash = '';
            window.location.reload();
          }}>
            Cerrar Sesión
          </button>
        </div>
      </div>

      {saveStatus && <div className="save-status">{saveStatus}</div>}

      <div className="admin-content">
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Una Tinta</th>
                <th>A Color</th>
                <th>Dimensiones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((product) =>
                editingId === product.id ? (
                  <tr key={product.id} className="row-editing">
                    <td className="cell-id">{product.id}</td>
                    <td>
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) =>
                          handleInputChange('name', e.target.value)
                        }
                        className="input-edit"
                        placeholder="Nombre"
                      />
                      <input
                        type="text"
                        value={editData.description}
                        onChange={(e) =>
                          handleInputChange('description', e.target.value)
                        }
                        className="input-edit"
                        placeholder="Descripción"
                        style={{ marginTop: '5px' }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editData.basePriceOneColor}
                        onChange={(e) =>
                          handleInputChange('basePriceOneColor', e.target.value)
                        }
                        className="input-edit"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editData.priceColor}
                        onChange={(e) =>
                          handleInputChange('priceColor', e.target.value)
                        }
                        className="input-edit"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editData.dimensions}
                        onChange={(e) =>
                          handleInputChange('dimensions', e.target.value)
                        }
                        className="input-edit"
                      />
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-save"
                          onClick={() => handleSave(product.id)}
                        >
                          ✓
                        </button>
                        <button
                          className="btn-cancel"
                          onClick={handleCancel}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={product.id}>
                    <td className="cell-id">{product.id}</td>
                    <td className="cell-name">
                      <strong>{product.name}</strong>
                      <p className="desc">{product.description}</p>
                    </td>
                    <td className="cell-price">
                      <strong>${Number(product.basePriceOneColor || 0).toFixed(0)}</strong>
                    </td>
                    <td className="cell-price">
                      <strong>${Number(product.priceColor || 0).toFixed(0)}</strong>
                    </td>
                    <td className="cell-dimensions">{product.dimensions}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(product)}
                        >
                          ✎ Editar
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(product.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-info">
          <div className="info-card">
            <h3>📊 Estadísticas</h3>
            <p>
              <strong>Total de productos:</strong> {items.length}
            </p>
            <p>
              <strong>Stock total:</strong> {items.reduce((sum, p) => sum + p.stock, 0)} unidades
            </p>
            <p>
              <strong>Ingresos potenciales:</strong> ${(items.reduce((sum, p) => sum + p.price * p.stock, 0)).toFixed(2)}
            </p>
          </div>

          <div className="info-card">
            <h3>💾 Almacenamiento</h3>
            <p>Los cambios se guardan automáticamente en Firestore.</p>
            <p>Los datos se sincronizarán en la tienda en tiempo real.</p>
            
            {!hasFirestoreProducts && items.length === 0 && (
              <button
                className="btn-reset"
                onClick={initializeDefaultProducts}
                style={{ backgroundColor: '#4CAF50', marginBottom: '10px', display: 'block', width: '100%' }}
              >
                📦 Inicializar Productos (5 por defecto)
              </button>
            )}
            
            <button
              className="btn-reset"
              onClick={async () => {
                if (confirm('¿Restaurar productos por defecto?')) {
                  try {
                    // Eliminar todos los documentos
                    const productsRef = collection(db, 'products');
                    const querySnapshot = await getDocs(productsRef);
                    for (const docSnapshot of querySnapshot.docs) {
                      await deleteDoc(doc(db, 'products', docSnapshot.id));
                    }
                    
                    // Agregar productos por defecto
                    for (const product of products) {
                      await addDoc(productsRef, {
                        ...product,
                        price: Number(product.price),
                        stock: Number(product.stock),
                      });
                    }
                    
                    setSaveStatus('↻ Productos restaurados');
                    setTimeout(() => setSaveStatus(''), 3000);
                  } catch (error) {
                    console.error('Error restoring products:', error);
                    setSaveStatus('❌ Error al restaurar');
                    setTimeout(() => setSaveStatus(''), 3000);
                  }
                }
              }}
            >
              ↻ Restaurar por defecto
            </button>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
