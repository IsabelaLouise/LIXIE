from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

# Conexão MySQL
conexao = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Ilcs050607",
    database="Lixie",
    port=3306
)
cursor = conexao.cursor()

@app.route("/")
def index():
    return render_template("cadastresse.html")

@app.route("/cadastrar", methods=["POST"])
def cadastrar():
    dados = request.json
    try:
        sql = """
        INSERT INTO Usuario 
        (Nome, Email, Senha, Data_Nasc, Endereco, Numero, CEP, Telefone, Dt_Criacao, Pontuacao_Total_Acumulada_, Nivel)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, CURDATE(), 0, 1)
        """
        valores = (
            dados["nome"],
            dados["email"],
            dados["senha"],
            dados["data_nasc"],
            dados["rua"],
            dados["numeroCasa"],
            dados["cep"],
            dados["telefone"]
        )
        cursor.execute(sql, valores)
        conexao.commit()
        return jsonify({"mensagem": "Cadastrado com sucesso!"})
    except Exception as e:
        return jsonify({"erro": str(e)})

app.run(debug=True)