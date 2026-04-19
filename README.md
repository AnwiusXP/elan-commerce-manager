# Elan Frontend + FastAPI Backend

Este proyecto integra un frontend React con un backend FastAPI.

## Estructura

- `elan-frontend-main/`: Frontend React con Vite
- `backend/`: Backend FastAPI con SQLAlchemy y SQLite

## Instalación y Ejecución

### Backend

1. Navega al directorio backend:
   ```bash
   cd backend
   ```

2. Activa el entorno virtual:
   ```bash
   .venv\Scripts\Activate.ps1  # Windows
   ```

3. Instala dependencias:
   ```bash
   pip install -r requirements.txt
   ```

4. Inicializa la base de datos:
   ```bash
   python init_db.py
   ```

5. Ejecuta el servidor:
   ```bash
   python run.py
   ```

El backend estará disponible en `http://127.0.0.1:8000`

### Frontend

1. Navega al directorio frontend:
   ```bash
   cd elan-frontend-main
   ```

2. Instala dependencias:
   ```bash
   npm install
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