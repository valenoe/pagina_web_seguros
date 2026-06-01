from sqlalchemy import text
from database import engine


def test_conexion():
    with engine.connect() as conn:
        resultado = conn.execute(text("SHOW TABLES"))
        tablas = [fila[0] for fila in resultado]

    print("\nTablas encontradas en la base de datos:")
    for tabla in tablas:
        print(f"  - {tabla}")

    assert len(tablas) > 0, "No se encontraron tablas. Verifica que el schema esté aplicado."


if __name__ == "__main__":
    test_conexion()
    print("\nConexion exitosa.")
