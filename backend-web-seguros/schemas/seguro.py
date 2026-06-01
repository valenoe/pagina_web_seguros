from pydantic import BaseModel


class SeguroOut(BaseModel):
    id_seguro: int
    nombre: str
    descripcion: str | None
    permite_digital: bool
    permite_tradicional: bool
    url_externa: str | None
    seguro_activo: bool
    orden_display: int

    model_config = {"from_attributes": True}
