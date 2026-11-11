import bcrypt
from getpass import getpass

from app import app
from extensions import db
from models.usuario import Usuario

def criar_usuario():


    nome = input("Nome: ").strip()
    email = input("E-mail: ").strip().lower()
    senha = getpass("Senha: ")
    confirmar = getpass("Confirmar senha: ")

    if not nome or not email or not senha:
        print("Preencha todos os campos.")
        return

    if "@" not in email:
        print("E-mail invalido.")
        return

    if len(senha) < 8 or len(senha.encode("utf-8")) > 72:
        print("A senha deve ter pelo menos 8 caracteres e ate 72 bytes.")
        return

    if senha != confirmar:
        print("As senhas nao coincidem.")
        return

    with app.app_context():

        usuario_existente = Usuario.query.filter_by(email=email).first()

        if usuario_existente:
            print("Este e-mail ja esta cadastrado.")
            return

        senha_hash = bcrypt.hashpw(
            senha.encode("utf-8"),
            bcrypt.gensalt(rounds=12)
        ).decode("utf-8")

        novo_usuario = Usuario(
            nome=nome,
            email=email,
            senha_hash=senha_hash
        )

        try:
            db.session.add(novo_usuario)
            db.session.commit()
            print("Usuario cadastrado com sucesso!!")

        except Exception:
            db.session.rollback()
            print("Erro ao cadastrar usuario.")


if __name__ == "__main__":
    criar_usuario()