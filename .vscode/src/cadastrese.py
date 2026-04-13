import http.server
import json
import mysql.connector
import bcrypt
import secrets
import os
from datetime import datetime

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# === CONFIGURAÇÕES DO BANCO ===
DB_CONFIG = {
    "host": "mainline.proxy.rlwy.net",
    "user": "root",
    "password": "UeJIbFioQMlXgpJvTZNPlVGokTZiJfBm",
    "database": "Lixie",
    "port": 28939
}

class ServidorCadastro(http.server.BaseHTTPRequestHandler):
    
    # === CORS ===
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):

        # =========================
        # CADASTRO
        # =========================
        if self.path.rstrip('/') == '/cadastrar':
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
                print(f"Erro no Esqueci Senha: {e}") # Isso vai aparecer nos logs do Railway
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"sucesso": False, "mensagem": str(e)}).encode())

            finally:
                if conexao and conexao.is_connected():
                    cursor.close()
                    conexao.close()
        elif self.path == '/dados-usuario':
            content_length = int(self.headers['Content-Length'])
            corpo_requisicao = self.rfile.read(content_length)
            from urllib.parse import parse_qs

            dados = parse_qs(corpo_requisicao.decode())
            email = dados.get("email", [""])[0]

            conexao = mysql.connector.connect(**DB_CONFIG)
            cursor = conexao.cursor()

            cursor.execute("""
                SELECT Nome, Pontuacao_Total_Acumulada_, Nivel 
                FROM Usuario WHERE Email = %s
            """, (email,))

            usuario = cursor.fetchone()

            resposta = {
                "nome": usuario[0],
                "pontos": usuario[1],
                "nivel": usuario[2]
            }

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(resposta).encode())

            cursor.close()
            conexao.close()
        
        elif self.path == '/verificar-email':
            content_length = int(self.headers['Content-Length'])
            corpo = self.rfile.read(content_length)
            from urllib.parse import parse_qs

            dados = parse_qs(corpo.decode())
            email = dados.get("email", [""])[0].strip()

            conexao = mysql.connector.connect(**DB_CONFIG)
            cursor = conexao.cursor()

            cursor.execute("SELECT Email FROM Usuario WHERE Email = %s", (email,))
            resultado = cursor.fetchone()

            resposta = {"existe": resultado is not None}

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(resposta).encode())

            cursor.close()
            conexao.close()

        elif self.path == '/redefinir-senha':
            content_length = int(self.headers['Content-Length'])
            corpo = self.rfile.read(content_length)
            from urllib.parse import parse_qs

            dados = parse_qs(corpo.decode())
            email = dados.get("email", [""])[0].strip()
            senha = dados.get("senha", [""])[0].encode('utf-8')

            conexao = mysql.connector.connect(**DB_CONFIG)
            cursor = conexao.cursor()

            senha_hash = bcrypt.hashpw(senha, bcrypt.gensalt())

            cursor.execute(
                "UPDATE Usuario SET Senha = %s WHERE Email = %s",
                (senha_hash.decode('utf-8'), email)
            )
            conexao.commit()

            resposta = {"sucesso": True}

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(resposta).encode())

            cursor.close()
            conexao.close()

        elif self.path == '/esqueci-senha':

            conexao = None
            try:
                content_length = int(self.headers['Content-Length'])
                corpo = self.rfile.read(content_length).decode()
                from urllib.parse import parse_qs
                dados = parse_qs(corpo)
                email_destino = dados.get("email", [""])[0].strip()

                conexao = mysql.connector.connect(**DB_CONFIG)
                cursor = conexao.cursor()

                cursor.execute("SELECT Email FROM Usuario WHERE Email = %s", (email_destino,))
                if cursor.fetchone():
                    token = secrets.token_urlsafe(32)
                    cursor.execute("""
                        UPDATE Usuario 
                        SET Token_Recuperacao = %s, Token_Expira = DATE_ADD(NOW(), INTERVAL 1 HOUR)
                        WHERE Email = %s
                    """, (token, email_destino))
                    conexao.commit()

                    link = f"https://lixie.vercel.app/esquecesenha.html?token={token}"

                    # --- CONFIGURAÇÃO DO GMAIL ---
                    meu_email = "isabelalouise.cs@gmail.com"
                    minha_senha = "ljwspppjpixwheel"

                    mensagem = MIMEMultipart()
                    mensagem['From'] = f"Lixie <{meu_email}>"
                    mensagem['To'] = email_destino
                    mensagem['Subject'] = "Recuperação de Senha - Lixie"

                    corpo_html = f"""
                    <html>
                        <body style="font-family: Arial; color: #333;">
                            <h2>Olá!</h2>
                            <p>Recebemos um pedido para redefinir sua senha.</p>
                            <p>Clique no link abaixo para prosseguir:</p>
                            <a href="{link}" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Redefinir Minha Senha</a>
                            <p>Este link expira em 1 hora.</p>
                        </body>
                    </html>
                    """
                    mensagem.attach(MIMEText(corpo_html, 'html'))

                    # ENVIO REAL
                    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
                        server.login(meu_email, minha_senha)
                        server.sendmail(meu_email, email_destino, mensagem.as_string())

                    resposta = {"sucesso": True}
                else:
                    resposta = {"sucesso": False, "mensagem": "Email não encontrado"}

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(resposta).encode())

            except Exception as e:
                print(f"❌ Erro no Gmail: {e}")
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({"sucesso": False, "mensagem": "Erro ao enviar e-mail"}).encode())
            finally:
                if conexao and conexao.is_connected():
                    cursor.close()
                    conexao.close()

        elif self.path == '/redefinir-com-token':
            content_length = int(self.headers['Content-Length'])
            corpo = self.rfile.read(content_length)
            from urllib.parse import parse_qs

            dados = parse_qs(corpo.decode())
            token = dados.get("token", [""])[0]
            senha = dados.get("senha", [""])[0].encode('utf-8')

            conexao = mysql.connector.connect(**DB_CONFIG)
            cursor = conexao.cursor()

            cursor.execute("""
                SELECT Email FROM Usuario 
                WHERE Token_Recuperacao = %s 
                AND Token_Expira > NOW()
            """, (token,))

            usuario = cursor.fetchone()

            if usuario:
                senha_hash = bcrypt.hashpw(senha, bcrypt.gensalt())

                cursor.execute("""
                    UPDATE Usuario 
                    SET Senha = %s,
                        Token_Recuperacao = NULL,
                        Token_Expira = NULL
                    WHERE Token_Recuperacao = %s
                """, (senha_hash.decode('utf-8'), token))

                conexao.commit()
                resposta = {"sucesso": True}

            else:
                resposta = {"sucesso": False, "mensagem": "Token inválido ou expirado"}

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(resposta).encode())

            cursor.close()
            conexao.close()


# === INICIALIZAÇÃO ===
if __name__ == "__main__":
    # O Railway injeta o número da porta nesta variável de ambiente. 
    # Se não houver, ele usa a 8000 por padrão.
    port = int(os.environ.get("PORT", 8000)) 
    
    # '0.0.0.0' é OBRIGATÓRIO para o Railway conseguir te dar um domínio.
    server_address = ('0.0.0.0', port)
    httpd = http.server.HTTPServer(server_address, ServidorCadastro)
    print(f"Servidor rodando na porta {port}...")
    httpd.serve_forever()