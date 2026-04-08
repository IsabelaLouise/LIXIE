import http.server
import json
import mysql.connector
import bcrypt
from datetime import datetime

# === CONFIGURAÇÕES DO BANCO ===
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "Ilcs050607",
    "database": "Lixie",
    "port": 3306
}

class ServidorCadastro(http.server.BaseHTTPRequestHandler):
    
    # === CORS ===
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):

        # =========================
        # CADASTRO
        # =========================
        if self.path == '/cadastrar':
            content_length = int(self.headers['Content-Length'])
            corpo_requisicao = self.rfile.read(content_length)
            from urllib.parse import parse_qs

            dados_raw = corpo_requisicao.decode()
            dados = parse_qs(dados_raw)

            conexao = None
            try:
                conexao = mysql.connector.connect(**DB_CONFIG)
                cursor = conexao.cursor()

                # === DATA ===
                data_input = dados.get("data_nasc", [""])[0].strip()
                if not data_input:
                    raise ValueError("Data de nascimento não fornecida")

                try:
                    data_obj = datetime.strptime(data_input, "%d/%m/%Y")
                except ValueError:
                    data_obj = datetime.strptime(data_input, "%Y-%m-%d")

                data_formatada = data_obj.strftime("%Y-%m-%d")

                # === CAMPOS ===
                nome = dados.get("nome", [""])[0].strip() or None
                email = dados.get("email", [""])[0].strip() or None
                telefone = dados.get("numero", [""])[0].strip() or None
                cep = dados.get("cep", [""])[0].replace("-", "").strip() or None
                rua = dados.get("rua", [""])[0].strip() or None
                cidade = dados.get("cidade", [""])[0].strip() or None
                estado = dados.get("estado", [""])[0].strip() or None
                numero = dados.get("numeroCasa", [""])[0].strip() or None
                complemento = dados.get("complemento", [""])[0].strip() or None
                senha = dados.get("senha", [""])[0].encode('utf-8')

                # 🔐 HASH
                senha_hash = bcrypt.hashpw(senha, bcrypt.gensalt())

                # === INSERT ===
                sql = """
                INSERT INTO Usuario 
                (Nome, Email, Senha, Data_Nasc, Rua, Numero_casa, Cidade, Estado, Complemento, CEP, Telefone, Dt_Criacao, Pontuacao_Total_Acumulada_, Nivel)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURDATE(), 0, 1)
                """

                valores = (
                    nome,
                    email,
                    senha_hash.decode('utf-8'),
                    data_formatada,
                    rua,
                    numero,
                    cidade,
                    estado,
                    complemento,
                    cep,
                    telefone
                )

                cursor.execute(sql, valores)
                conexao.commit()

                self.send_response(201)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"mensagem": "Cadastrado com sucesso!"}).encode())

            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"erro": str(e)}).encode())

            finally:
                if conexao and conexao.is_connected():
                    cursor.close()
                    conexao.close()

        # =========================
        # LOGIN (VALIDAÇÃO REAL)
        # =========================
        elif self.path == '/login':
            content_length = int(self.headers['Content-Length'])
            corpo_requisicao = self.rfile.read(content_length)
            from urllib.parse import parse_qs

            dados_raw = corpo_requisicao.decode()
            dados = parse_qs(dados_raw)

            email = dados.get("email", [""])[0].strip()
            senha = dados.get("senha", [""])[0].encode('utf-8')

            conexao = None
            try:
                conexao = mysql.connector.connect(**DB_CONFIG)
                cursor = conexao.cursor()

                # 🔍 BUSCA PELO EMAIL
                cursor.execute("SELECT Senha FROM Usuario WHERE Email = %s", (email,))
                resultado = cursor.fetchone()

                # ❌ EMAIL NÃO EXISTE
                if resultado is None:
                    resposta = {"sucesso": False, "mensagem": "Email incorreto"}

                else:
                    senha_hash = resultado[0].encode('utf-8')

                    # 🔐 VERIFICA SENHA
                    if bcrypt.checkpw(senha, senha_hash):
                        resposta = {"sucesso": True, "mensagem": "Login realizado"}
                    else:
                        resposta = {"sucesso": False, "mensagem": "Senha incorreta"}

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(resposta).encode())

            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"erro": str(e)}).encode())

            finally:
                if conexao and conexao.is_connected():
                    cursor.close()
                    conexao.close()


# === INICIALIZAÇÃO ===
if __name__ == "__main__":
    endereco = ('localhost', 8000)
    servidor = http.server.HTTPServer(endereco, ServidorCadastro)
    print(f"Servidor rodando em http://{endereco[0]}:{endereco[1]}")
    servidor.serve_forever()