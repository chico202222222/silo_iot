from datetime import datetime, timezone
from extensions import db


class Leitura(db.Model):
    __tablename__ = "leituras"

    id = db.Column(db.Integer, primary_key=True)
    dispositivo_id = db.Column(
        db.Integer,
        db.ForeignKey("dispositivos.id"),
        nullable=False
    )

    distancia_metros = db.Column(db.Float, nullable=False)
    nivel_percentual = db.Column(db.Float, nullable = False)

    temperatura_c = db.Column(db.Float, nullable=True)
    umidade_percentual = db.Column(db.Float, nullable=True)

    #estado do ventilador,ligado ou off
    ventilador_ligado = db.Column(
        db.Boolean,
        nullable=True,
        default=False
    )



    data_hora = db.Column(
        db.DateTime,
        default = lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        nullable=False
    )