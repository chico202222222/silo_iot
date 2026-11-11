from flask import session
from extensions import db
from models.usuario import Usuario


def obter_usuario_logado():

    usuario_id = session.get("usuario_id")

    if not isinstance(usuario_id, int) or isinstance(usuario_id, bool):
        return None

    usuario = db.session.get(Usuario, usuario_id)

    return usuario