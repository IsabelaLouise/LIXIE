import http.server
import json
import mysql.connector
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
        if self.path == '/cadastrar':
            content_length = int(self.headers['Content-Length'])
            corpo_requisicao = self.rfile.read(content_length)
            dados = json.loads(corpo_requisicao)

            conexao = None
            try:
                conexao = mysql.connector.connect(**DB_CONFIG)
                cursor = conexao.cursor()

                # === CONVERSÃO DA DATA ===
                data_input = dados.get("data_nasc", "").strip()
                if not data_input:
                    raise ValueError("Data de nascimento não fornecida")

                try:
                    data_obj = datetime.strptime(data_input, "%d/%m/%Y")
                except ValueError:
                    data_obj = datetime.strptime(data_input, "%Y-%m-%d")

                data_formatada = data_obj.strftime("%Y-%m-%d")

                # === LIMPEZA DE CAMPOS ===
                numero = dados.get("numeroCasa", "").strip() or None
                telefone = dados.get("telefone", "").strip() or None
                cep = dados.get("cep", "").replace("-", "").strip() or None
                rua = dados.get("rua", "").strip() or None
                nome = dados.get("nome", "").strip() or None
                email = dados.get("email", "").strip() or None
                senha = dados.get("senha", "").strip() or None

                # === SQL INSERT ===
                sql = """
                INSERT INTO Usuario 
                (Nome, Email, Senha, Data_Nasc, Endereco, Numero, CEP, Telefone, Dt_Criacao, Pontuacao_Total_Acumulada_, Nivel)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, CURDATE(), 0, 1)
                """

                valores = (
                    dados.get("nome", "").strip() or None,
                    dados.get("email", "").strip() or None,
                    dados.get("senha", "").strip() or None,
                    data_formatada,
                    dados.get("rua", "").strip() or None,
                    dados.get("numeroCasa", "").strip() or None,  # 👈 mantém string
                    dados.get("cep", "").replace("-", "").strip() or None,
                    dados.get("telefone", "").strip() or None     # 👈 mantém string
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

# === INICIALIZAÇÃO DO SERVIDOR ===
if __name__ == "__main__":
    endereco = ('localhost', 8000)
    servidor = http.server.HTTPServer(endereco, ServidorCadastro)
    print(f"Servidor rodando em http://{endereco[0]}:{endereco[1]}")
    servidor.serve_forever()