from database import SessionLocal, engine, Base
from models import Producto

Base.metadata.create_all(bind=engine)
db = SessionLocal()

productos_prueba = [
    {'nombre': 'Ambientador', 'categoria': 'cuidado hogar', 'precio': 35000, 'stock': 48, 'stockMin': 10},
    {'nombre': 'Hipoclorito', 'categoria': 'cuidado hogar', 'precio': 52000, 'stock': 12, 'stockMin': 10},
    {'nombre': 'Suavizante', 'categoria': 'cuidado hogar', 'precio': 28000, 'stock': 8, 'stockMin': 10},
    {'nombre': 'Gel antibacterial', 'categoria': 'cuidado personal', 'precio': 45000, 'stock': 20, 'stockMin': 10},
    {'nombre': 'Limpiavidrios', 'categoria': 'cuidado hogar', 'precio': 32000, 'stock': 35, 'stockMin': 10},
]

for prod_data in productos_prueba:
    existente = db.query(Producto).filter(Producto.nombre == prod_data['nombre']).first()
    if not existente:
        producto = Producto(**prod_data)
        db.add(producto)
        print(f'Agregado: {prod_data["nombre"]}')

db.commit()
db.close()
print('Productos de prueba agregados')