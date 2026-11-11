from extensions import db

class Dispositivo(db.Model):
    __tablename__ = "dispositivos"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)
    silo_id = db.Column(
        db.Integer,
        db.ForeignKey("silos.id"), 
        nullable=False
        )