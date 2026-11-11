from datetime import datetime, timezone
from extensions import db


class Evento(db.Model):
    __tablename__ = "eventos"

    id = db.Column(db.Integer, primary_key=True)

    silo_id = db.Column(
        db.Integer,
        db.ForeignKey("silos.id"),
        nullable=False
    )

    tipo = db.Column(db.String(50), nullable=False)
    descricao = db.Column(db.String(255), nullable=False)

    data_hora = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        nullable=False
    )