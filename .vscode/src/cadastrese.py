import http.server
import json
import mysql.connector
import bcrypt
import secrets
import os
import uuid
import cloudinary
import cloudinary.uploader
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

cloudinary.config(
    cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key = os.getenv('CLOUDINARY_API_KEY'),
    api_secret = os.getenv('CLOUDINARY_API_SECRET')
)

class ServidorCadastro(http.server.BaseHTTPRequestHandler):

    def end_headers(self):
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.send_header('Access-Control-Max-Age', '86400') 
            super().end_headers()

    def do_OPTIONS(self):
            self.send_response(200)
            self.end_headers()

    def do_GET(self):
            # Como as fotos agora estão no Cloudinary, você não precisará mais 
            # desse GET para buscar na pasta /uploads/, mas vou manter por segurança.
            if self.path.startswith("/uploads/"):
                self.send_response(404) # Fotos locais não existem mais
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

                    # Verifique se o nome do arquivo dentro de /.vscode/src/ é exatamente este
                    link = f"https://lixie-chi.vercel.app/esquecesenha.html?token={token}"

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

                    # Substitua o bloco de ENVIO REAL por este:
                    # --- CONFIGURAÇÃO E ENVIO REAL ---
                    try:
                        with smtplib.SMTP('smtp.gmail.com', 587) as server:
                            server.starttls() 
                            server.login(meu_email, minha_senha)
                            server.sendmail(meu_email, email_destino, mensagem.as_string())
                        
                        # Se chegou aqui, deu certo
                        resposta = {"sucesso": True}
                        
                    except Exception as e:
                        print(f"❌ Erro específico no SMTP: {e}")
                        # Se deu erro no envio, repassa para o except geral
                        raise e

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
        


# ===RANKING ===
        elif self.path == '/ranking':
            conexao = mysql.connector.connect(**DB_CONFIG)
            cursor = conexao.cursor()

            cursor.execute("""
                SELECT Nome, Pontuacao_Total_Acumulada_
                FROM Usuario
                ORDER BY Pontuacao_Total_Acumulada_ DESC
                LIMIT 10
            """)

            resultados = cursor.fetchall()

            ranking = []
            for i, user in enumerate(resultados):
                ranking.append({
                "posicao": i + 1,
                "nome": user[0],
                "pontos": user[1]
                })

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(ranking).encode())

            cursor.close()
            conexao.close()


        elif self.path == '/perfil':
            content_length = int(self.headers['Content-Length'])
            corpo = self.rfile.read(content_length)
            from urllib.parse import parse_qs

            dados = parse_qs(corpo.decode())
            email = dados.get("email", [""])[0]

            conexao = mysql.connector.connect(**DB_CONFIG)
            cursor = conexao.cursor()

            cursor.execute("""
                SELECT Nome, Email, Telefone, Data_Nasc, CEP, Rua, Cidade, Estado, Numero_casa, Complemento, Foto
                FROM Usuario WHERE Email = %s
            """, (email,))

            usuario = cursor.fetchone()

            resposta = {
                "nome": usuario[0],
                "email": usuario[1],
                "telefone": usuario[2],
                "dataNascimento": str(usuario[3]),
                "cep": usuario[4],
                "rua": usuario[5],
                "cidade": usuario[6],
                "estado": usuario[7],
                "numero": usuario[8],
                "complemento": usuario[9],
                "foto": usuario[10]
            }

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(resposta).encode())

            cursor.close()
            conexao.close()
        
        elif self.path == '/atualizar-perfil':
            content_type = self.headers.get('Content-Type')
            dados = {}
            url_foto_cloudinary = None

            if "multipart/form-data" in content_type:
                boundary = content_type.split("boundary=")[1].encode()
                length = int(self.headers.get('Content-Length'))
                body = self.rfile.read(length)
                partes = body.split(b"--" + boundary)

                for parte in partes:
                    if b"Content-Disposition" in parte:
                        parts = parte.split(b"\r\n\r\n", 1)
                        if len(parts) < 2: continue
                        headers, conteudo = parts
                        conteudo = conteudo.strip(b"\r\n")

                        # 📸 PROCESSANDO A FOTO
                        if b'name="foto"' in headers and b'filename="' in headers:
                            if len(conteudo) > 0:
                                try:
                                    print("--- Iniciando upload para Cloudinary ---")
                                    upload_result = cloudinary.uploader.upload(conteudo, folder="perfil_usuarios")
                                    url_foto_cloudinary = upload_result.get('secure_url')
                                    print(f"--- Sucesso! URL: {url_foto_cloudinary} ---")
                                except Exception as e:
                                    print(f"❌ Erro Cloudinary: {e}")
                        
                        # 📝 CAMPOS DE TEXTO
                        elif b'name="' in headers:
                            nome_campo = headers.split(b'name="')[1].split(b'"')[0].decode()
                            valor = conteudo.decode('utf-8').strip()
                            dados[nome_campo] = valor

            email_usuario = dados.get("email", "").strip()
            print(f"--- Tentando atualizar usuário: {email_usuario} ---")

            conexao = None
            try:
                conexao = mysql.connector.connect(**DB_CONFIG)
                cursor = conexao.cursor()

                if url_foto_cloudinary:
                    sql = """UPDATE Usuario SET Nome=%s, Telefone=%s, CEP=%s, Rua=%s, Cidade=%s, Estado=%s, 
                             Numero_casa=%s, Complemento=%s, Foto=%s WHERE Email=%s"""
                    valores = (dados.get("nome"), dados.get("tel"), dados.get("cep"), dados.get("rua"), 
                               dados.get("cidade"), dados.get("estado"), dados.get("num"), 
                               dados.get("complemento"), url_foto_cloudinary, email_usuario)
                else:
                    sql = """UPDATE Usuario SET Nome=%s, Telefone=%s, CEP=%s, Rua=%s, Cidade=%s, Estado=%s, 
                             Numero_casa=%s, Complemento=%s WHERE Email=%s"""
                    valores = (dados.get("nome"), dados.get("tel"), dados.get("cep"), dados.get("rua"), 
                               dados.get("cidade"), dados.get("estado"), dados.get("num"), 
                               dados.get("complemento"), email_usuario)

                cursor.execute(sql, valores)
                conexao.commit()
                
                # Verifica se alguma linha foi realmente afetada
                if cursor.rowcount == 0:
                    print("⚠️ Nenhuma linha atualizada. O e-mail existe no banco?")

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"ok": True, "foto": url_foto_cloudinary}).encode())

            except Exception as e:
                print(f"❌ Erro ao salvar no banco: {e}")
                self.send_response(500)
                self.end_headers()
            finally:
                if conexao and conexao.is_connected():
                    cursor.close()
                    conexao.close()

# === INICIALIZAÇÃO ===
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000)) 
    server_address = ('0.0.0.0', port)
    httpd = http.server.HTTPServer(server_address, ServidorCadastro)
    print(f"Servidor rodando na porta {port}...")
    httpd.serve_forever()
