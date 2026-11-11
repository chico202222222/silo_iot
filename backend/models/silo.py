from extensions import db
#criar classe silo

class Silo(db.Model):
    __tablename__ = 'silos'

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    altura_total_metros = db.Column(db.Float, nullable=False)