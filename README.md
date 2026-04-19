# Elan Commerce Manager

Sistema completo de gestión comercial con frontend React y backend FastAPI.

## 🚀 Características

- **Frontend**: React + Vite con interfaz moderna y responsiva
- **Backend**: FastAPI con autenticación JWT y base de datos SQLite
- **Funcionalidades**:
  - Autenticación de usuarios
  - Gestión de productos (CRUD)
  - Control de inventario
  - Registro de ventas
  - Reportes y estadísticas
  - Catálogo público

## 🛠️ Tecnologías

- **Frontend**: React 19, React Router, Axios, Chart.js
- **Backend**: FastAPI, SQLAlchemy, JWT, Python 3.13
- **Base de datos**: SQLite
- **Estilos**: CSS-in-JS (inline styles)

## 📦 Instalación y Ejecución

### Prerrequisitos

- Node.js 18+
- Python 3.8+
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/elan-commerce-manager.git
cd elan-commerce-manager
```

### 2. Backend (FastAPI)

```bash
cd backend

# Crear entorno virtual
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Inicializar base de datos
python init_db.py

# Ejecutar servidor
python run.py
```

El backend estará disponible en: `http://127.0.0.1:8000`

### 3. Frontend (React)

```bash
cd elan-frontend-main

# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev
```

El frontend estará disponible en: `http://localhost:5173` o `http://localhost:5174`

## 🔐 Credenciales de acceso

- **Usuario**: `admin`
- **Contraseña**: `1234`

## 📁 Estructura del proyecto

```
elan-commerce-manager/
├── backend/                 # API FastAPI
│   ├── main.py             # Rutas y configuración
│   ├── models.py           # Modelos de base de datos
│   ├── auth.py             # Autenticación JWT
│   ├── database.py         # Configuración SQLAlchemy
│   ├── requirements.txt    # Dependencias Python
│   └── run.py              # Script para ejecutar servidor
├── elan-frontend-main/      # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Páginas de la aplicación
│   │   └── services/       # Servicios API
│   ├── package.json        # Dependencias Node.js
│   └── vite.config.js      # Configuración Vite
└── README.md               # Este archivo
```

## 🔧 API Endpoints

### Autenticación
- `POST /api/login` - Iniciar sesión
- `POST /api/logout` - Cerrar sesión

### Productos
- `GET /api/productos` - Obtener todos los productos
- `POST /api/productos` - Crear producto
- `PUT /api/productos/{id}` - Actualizar producto
- `DELETE /api/productos/{id}` - Eliminar producto

### Ventas
- `GET /api/ventas` - Obtener todas las ventas
- `POST /api/ventas` - Registrar venta

## 🚀 Despliegue

### Backend
```bash
# Producción
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
# Build para producción
npm run build

# Servir archivos estáticos
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 📞 Contacto

- **Autor**: Jaider Restrepo
- **Email**: jaider@example.com
- **GitHub**: [Tu perfil](https://github.com/TU_USUARIO)
   ```

3. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

El frontend estará disponible en `http://localhost:5173`

## Usuario por Defecto

- Email: admin
- Contraseña: 1234

## API Endpoints

- `POST /api/login` - Iniciar sesión
- `POST /api/logout` - Cerrar sesión
- `GET /api/productos` - Obtener productos
- `POST /api/productos` - Crear producto
- `PUT /api/productos/{id}` - Actualizar producto
- `DELETE /api/productos/{id}` - Eliminar producto
- `GET /api/ventas` - Obtener ventas
- `POST /api/ventas` - Crear venta