import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import {
  LayoutDashboard, ShoppingBag, DollarSign, BarChart3,
  BrainCircuit, Search, LogOut, User, RefreshCw, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import './Reportes.css';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
);

const ReportesIA = () => {
  const [productoId, setProductoId] = useState("");
  const [prediccion, setPrediccion] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Lista de productos (Simulada, deberías cargarla de tu API de Laravel)
  const productos = [
    { id: 1, nombre: "Ambientador Elan Pure" },
    { id: 2, nombre: "Límpido Desinfectante" },
    { id: 3, nombre: "Detergente Líquido" },
    { id: 4, nombre: "Desengrasante Multiusos" }
  ];

  const ejecutarAnalisis = async () => {
    if (!productoId) {
      alert("Por favor, selecciona un producto primero");
      return;
    }
    setCargando(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:8000/api/ia/predict?producto=${productoId}`);
      setPrediccion(response.data);
    } catch (err) {
      setError('Error en la conexión con el motor de IA.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="admin-layout">
      {/* BARRA LATERAL (SIDEBAR) */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src="/logo-elan.png" alt="Elan Pure" />
          <span>ECM Admin</span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item"><LayoutDashboard size={20} /> Dashboard</div>
          <div className="nav-item"><ShoppingBag size={20} /> Inventario</div>
          <div className="nav-item"><DollarSign size={20} /> Ventas</div>
          <div className="nav-item active"><BarChart3 size={20} /> Reportes IA</div>
          <div className="nav-separator">Configuración</div>
          <div className="nav-item"><User size={20} /> Mi Cuenta</div>
          <div className="nav-item logout"><LogOut size={20} /> Cerrar Sesión</div>
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">
        <header className="main-header">
          <div className="breadcrumb">Panel / Reportes / <span>Analítica IA</span></div>
          <div className="user-profile">
            <span>Admin Elan Pure</span>
            <div className="avatar">A</div>
          </div>
        </header>

        <section className="dashboard-body">
          {/* BARRA DE FILTROS Y SELECCIÓN */}
          <div className="filter-bar">
            <div className="search-box">
              <Search size={18} />
              <select
                value={productoId}
                onChange={(e) => setProductoId(e.target.value)}
              >
                <option value="">Selecciona un producto para analizar...</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <button className="btn-primary" onClick={ejecutarAnalisis} disabled={cargando}>
              {cargando ? <RefreshCw className="spin" /> : <BrainCircuit size={18} />}
              {cargando ? 'Procesando...' : 'Analizar con Gemini'}
            </button>
          </div>

          {/* INDICADORES (TARJETAS) */}
          <div className="stats-grid">
            <div className="stat-card">
              <span className="label">Ventas Históricas</span>
              <div className="value">1,240 <small>unid</small></div>
              <div className="trend up">+12.5%</div>
            </div>
            <div className="stat-card">
              <span className="label">Predicción Demanda</span>
              <div className="value">{prediccion ? prediccion.cantidad_estimada : '--'} <small>unid</small></div>
              <div className="trend info">Próx. 7 días</div>
            </div>
            <div className="stat-card">
              <span className="label">Confianza Motor</span>
              <div className="value">94.2%</div>
              <div className="trend">XGBoost Optimized</div>
            </div>
          </div>

          {/* ÁREA DE GRÁFICO E IA */}
          <div className="analytics-container">
            <div className="chart-panel">
              <div className="panel-header">
                <h3>Tendencia y Proyección de Ventas</h3>
                <p>Análisis de comportamiento temporal del producto</p>
              </div>
              <div className="chart-wrapper">
                {/* VALIDACIÓN ESTRICTA: Solo renderiza si existe prediccion, datosGrafica y labels */}
                {prediccion && prediccion.datosGrafica && prediccion.datosGrafica.labels ? (
                  <Line
                    data={prediccion.datosGrafica}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                ) : (
                  <div className="placeholder-chart">
                    {cargando ? (
                      "Cargando proyecciones..."
                    ) : prediccion ? (
                      "La IA generó la recomendación, pero no hay datos gráficos suficientes para este producto."
                    ) : (
                      "Selecciona un producto y presiona Analizar"
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="ai-panel">
              <div className="ai-header">
                <BrainCircuit color="#7c3aed" />
                <h3>Asesor Gemini AI</h3>
              </div>
              <div className="ai-content">
                {prediccion ? (
                  <>
                    <div className="ai-badge">Nivel: {prediccion.nivel}</div>
                    <p className="ai-text">{prediccion.recomendacion}</p>
                  </>
                ) : (
                  <p className="ai-placeholder">Esperando análisis para generar recomendaciones estratégicas...</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ReportesIA;