import http.server
import json
import mysql.connector
import bcrypt
import secrets
import os
import io
try: # 
    import cgi
    HAVE_CGI = True
except Exception:
    cgi = None
    HAVE_CGI = False
import uuid
import time
import cloudinary
import cloudinary.uploader
import os
import cloudinary
from datetime import datetime

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# === CONFIGURAÇÕES DO BANCO ===
import os
import cloudinary

# === BANCO ===
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "Ilcs050607",
    "database": "Lixie",
    "port": 3306
}
# === CLOUDINARY ===
cloudinary.config(
    cloud_name= "dkcyjejp6",
    api_key= "452934599459777",
    api_secret= "6cc8gmWOynE4YOYibmXt3gG2Ndk"
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
            # Serve uploads 404 explicitly
            if self.path.startswith("/uploads/"):
                self.send_response(404) # Fotos locais não existem mais
                self.end_headers()
                return

            # Serve arquivos estáticos da pasta .vscode/src para facilitar desenvolvimento
            try:
                import urllib.parse
                import mimetypes

                root = os.path.join(os.getcwd(), '.vscode', 'src')
                req_path = urllib.parse.unquote(self.path.split('?',1)[0])
                if req_path == '/' or req_path == '':
                    # você pode mudar o index se quiser
                    req_path = '/adminUsuarios.html'

                # remove leading slash
                rel_path = req_path.lstrip('/')
                fs_path = os.path.normpath(os.path.join(root, rel_path))

                # evitar path traversal
                if not fs_path.startswith(root):
                    self.send_response(403)
                    self.end_headers()
                    return

                if os.path.isdir(fs_path):
                    # procurar index.html
                    index_file = os.path.join(fs_path, 'index.html')
                    if os.path.exists(index_file):
                        fs_path = index_file
                    else:
                        self.send_response(404)
                        self.end_headers()
                        return

                if not os.path.exists(fs_path):
                    self.send_response(404)
                    self.end_headers()
                    return

                ctype, _ = mimetypes.guess_type(fs_path)
                if not ctype:
                    ctype = 'application/octet-stream'

                with open(fs_path, 'rb') as f:
                    data = f.read()

                self.send_response(200)
                self.send_header('Content-Type', ctype)
                self.send_header('Content-Length', str(len(data)))
                self.end_headers()
                self.wfile.write(data)
                return
            except Exception as e:
                print('Erro servindo arquivo estático:', e)
                try:
                    self.send_response(500)
                    self.end_headers()
                except Exception:
                    pass

    def do_POST(self):

        # =========================
        # CADASTRO
        # =========================
        if self.path.rstrip('/') == '/cadastrar':
            try:
                conexao = mysql.connector.connect(**DB_CONFIG)
                print("✅ Conectou no banco!")
                conexao.close()
            except Exception as e:
                print("❌ ERRO DE CONEXÃO:", e)
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
                telefone = dados.get("telefone", [""])[0].strip()  
                cep = dados.get("cep", [""])[0].replace("-", "").strip() or None
                rua = dados.get("rua", [""])[0].strip() or None
                cidade = dados.get("cidade", [""])[0].strip() or None
                estado = dados.get("estado", [""])[0].strip() or None
                numero = dados.get("numeroCasa", [""])[0].strip()      
                complemento = dados.get("complemento", [""])[0].strip() or None
                senha = dados.get("senha", [""])[0].encode('utf-8')

                # 🔍 Verifica se email já existe
                cursor.execute("SELECT Email FROM Usuario WHERE Email = %s", (email,))
                if cursor.fetchone():
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"erro": "Essa conta já existe"}).encode())
                    return
                
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

                # tentamos suportar tanto o modelo antigo (Nivel) quanto a nova FK de permissão
                cursor.execute("SELECT Senha, COALESCE(fk_permissao, NULL), COALESCE(Nivel, NULL) FROM Usuario WHERE Email = %s", (email,))
                resultado = cursor.fetchone()

                if resultado is None:
                    resposta = {"sucesso": False, "mensagem": "Email e/ou senha incorreto(s)"}
                else:
                    senha_hash = resultado[0].encode('utf-8')
                    fk_perm = resultado[1]
                    nivel = resultado[2]

                    if bcrypt.checkpw(senha, senha_hash):
                        perm_nome = 'usuario'
                        # se existir fk_permissao, buscar nome na tabela Permissao
                        if fk_perm:
                            try:
                                cursor.execute("SELECT Nome FROM Permissao WHERE ID_permissao = %s", (fk_perm,))
                                row = cursor.fetchone()
                                if row and row[0]:
                                    perm_nome = row[0]
                            except Exception:
                                perm_nome = 'usuario'
                        else:
                            # fallback pelo campo Nivel (compatibilidade retroativa)
                            if nivel is not None and int(nivel) == 10:
                                perm_nome = 'admin'

                        resposta = {"sucesso": True, "mensagem": "Login realizado", "permissao": perm_nome}
                    else:
                        resposta = {"sucesso": False, "mensagem": "Email e/ou senha incorreto(s)"}

                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(resposta).encode())

            except Exception as e:
                print(f"Erro no Login: {e}")
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

            # buscar dados do usuário (tratar NULLs na pontuação) e permissão
            cursor.execute("""
                SELECT Nome, COALESCE(Pontuacao_Total_Acumulada_, 0) as pontos, Nivel, COALESCE(fk_permissao, NULL)
                FROM Usuario WHERE Email = %s
            """, (email,))

            usuario = cursor.fetchone()

            if not usuario:
                resposta = {"nome": "", "pontos": 0, "nivel": "", "posicao": None, "permissao": "usuario"}
            else:
                pontos_usuario = usuario[1]
                # calcular posição do usuário no ranking geral de forma robusta
                try:
                    cursor.execute(
                        "SELECT COUNT(*) FROM Usuario WHERE (COALESCE(Pontuacao_Total_Acumulada_, 0) > %s) OR (COALESCE(Pontuacao_Total_Acumulada_, 0) = %s AND Nome < %s)",
                        (pontos_usuario, pontos_usuario, usuario[0])
                    )
                    maior_count = cursor.fetchone()[0]
                    posicao = maior_count + 1
                except Exception:
                    posicao = None

                # determina nome da permissão
                fk_perm = usuario[3]
                perm_nome = 'usuario'
                if fk_perm:
                    try:
                        cursor.execute("SELECT Nome FROM Permissao WHERE ID_permissao = %s", (fk_perm,))
                        r = cursor.fetchone()
                        if r and r[0]:
                            perm_nome = r[0]
                    except Exception:
                        perm_nome = 'usuario'
                else:
                    # fallback a partir do campo Nivel
                    try:
                        if usuario[2] is not None and int(usuario[2]) == 10:
                            perm_nome = 'admin'
                    except Exception:
                        pass

                resposta = {
                    "nome": usuario[0],
                    "pontos": pontos_usuario,
                    "nivel": usuario[2],
                    "posicao": posicao,
                    "permissao": perm_nome
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

            # Retornar ranking completo com id, email, nome, pontos e permissão (nome)
            cursor.execute("""
                SELECT ID_usuario, Nome, Email, COALESCE(Pontuacao_Total_Acumulada_, 0) as pontos, COALESCE(fk_permissao, NULL), COALESCE(Nivel, NULL)
                FROM Usuario
                ORDER BY pontos DESC, Nome ASC
            """)

            resultados = cursor.fetchall()

            ranking = []
            for i, user in enumerate(resultados):
                uid = user[0]
                nome = user[1]
                email = user[2]
                pontos = user[3]
                fk_perm = user[4]
                nivel = user[5]

                perm_nome = 'usuario'
                if fk_perm:
                    try:
                        cursor.execute("SELECT Nome FROM Permissao WHERE ID_permissao = %s", (fk_perm,))
                        r = cursor.fetchone()
                        if r and r[0]:
                            perm_nome = r[0]
                    except Exception:
                        perm_nome = 'usuario'
                else:
                    try:
                        if nivel is not None and int(nivel) == 10:
                            perm_nome = 'admin'
                    except Exception:
                        pass

                ranking.append({
                    "posicao": i + 1,
                    "id": uid,
                    "nome": nome,
                    "email": email,
                    "pontos": pontos,
                    "permissao": perm_nome
                })

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(ranking).encode())

            cursor.close()
            conexao.close()

        elif self.path == '/listar-reciclagens':
            # Lista reciclagens, juntando com usuário para obter email/nome
            conexao = mysql.connector.connect(**DB_CONFIG)
            cursor = conexao.cursor()
            try:
                cursor.execute("""
                    SELECT 
                        R.ID_reciclagem,
                        R.Tipo_Material,
                        R.Data,
                        R.Quantidade,
                        R.Pontos,
                        R.fk_Usuario_ID_usuario,
                        U.Email,
                        U.Nome
                    FROM Reciclagem R
                    LEFT JOIN Usuario U ON R.fk_Usuario_ID_usuario = U.ID_usuario
                    ORDER BY R.Data DESC
                """)
            except Exception:
                # fallback se a coluna Data for nome diferente
                cursor.execute("SELECT ID_reciclagem, Tipo_Material, Quantidade, fk_Usuario_ID_usuario FROM Reciclagem")

            rows = cursor.fetchall()
            lista = []
            for r in rows:
                # adaptação: se a query foi a primeira, terá 6 colunas; se fallback, 4
                if len(r) >= 6:
                    lista.append({
                        'id': r[0],
                        'tipo': r[1],
                        'data': str(r[2]),
                        'quantidade': r[3],
                        'pontos': r[4],
                        'fk_usuario': r[5],
                        'usuario_email': r[6],
                        'usuario_nome': r[7]if len(r) > 6 else ''
                    })
                else:
                    lista.append({
                        'id': r[0],
                        'tipo': r[1],
                        'data': '',
                        'quantidade': r[2],
                        'fk_usuario': r[3],
                        'usuario_email': '',
                        'usuario_nome': ''
                    })

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(lista).encode())

            cursor.close()
            conexao.close()

        elif self.path == '/deletar-usuario':
            # Deleta usuário por email (admin only)
            content_length = int(self.headers.get('Content-Length', 0))
            corpo = self.rfile.read(content_length).decode()
            try:
                dados = json.loads(corpo)
            except Exception:
                self.send_response(400)
                self.end_headers()
                return

            requester = dados.get('requester')
            target_email = dados.get('email')
            if not requester or not target_email:
                self.send_response(400)
                self.end_headers()
                return

            conexao = mysql.connector.connect(**DB_CONFIG)
            cursor = conexao.cursor()

            cursor.execute("SELECT COALESCE(fk_permissao,0) FROM Usuario WHERE Email = %s", (requester,))
            perm_row = cursor.fetchone()
            fk_perm = perm_row[0] if perm_row else None
            is_admin = False
            if fk_perm:
                cursor.execute("SELECT Nome FROM Permissao WHERE ID_permissao = %s", (fk_perm,))
                p = cursor.fetchone()
                is_admin = (p and p[0] == 'admin')

            if not is_admin:
                self.send_response(403)
                self.end_headers()
                cursor.close()
                conexao.close()
                return

            # delete user
            cursor.execute("DELETE FROM Usuario WHERE Email = %s", (target_email,))
            conexao.commit()

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'sucesso': True}).encode())

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

            if not usuario:
                # usuário não encontrado -> responder campos vazios para o frontend não quebrar
                resposta = {
                    "nome": "",
                    "email": "",
                    "telefone": "",
                    "dataNascimento": "",
                    "cep": "",
                    "rua": "",
                    "cidade": "",
                    "estado": "",
                    "numero": "",
                    "complemento": "",
                    "foto": ""
                }
            else:
                # normaliza valores None para string vazia
                def norm(v):
                    return "" if v is None else (str(v) if not isinstance(v, str) else v)

                resposta = {
                    "nome": norm(usuario[0]),
                    "email": norm(usuario[1]),
                    "telefone": norm(usuario[2]),
                    "dataNascimento": norm(usuario[3]),
                    "cep": norm(usuario[4]),
                    "rua": norm(usuario[5]),
                    "cidade": norm(usuario[6]),
                    "estado": norm(usuario[7]),
                    "numero": norm(usuario[8]),
                    "complemento": norm(usuario[9]),
                    "foto": norm(usuario[10])
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
                if HAVE_CGI:
                    # Use cgi.FieldStorage quando disponível
                    try:
                        fs = cgi.FieldStorage(fp=self.rfile, headers=self.headers, environ={'REQUEST_METHOD': 'POST'}, keep_blank_values=True)
                    except Exception as e:
                        print(f"❌ Erro ao parsear multipart: {e}")
                        fs = None

                    if fs:
                        for key in fs.keys():
                            if key == 'foto':
                                fileitem = fs['foto']
                                # fileitem.filename existe se um arquivo foi enviado
                                if getattr(fileitem, 'filename', None):
                                    try:
                                        file_bytes = fileitem.file.read()
                                        print("--- Iniciando upload para Cloudinary ---")
                                        # Enviar um file-like object para o uploader
                                        upload_result = cloudinary.uploader.upload(file=io.BytesIO(file_bytes), folder="perfil_usuarios")
                                        url_foto_cloudinary = upload_result.get('secure_url')
                                        print(f"--- Sucesso! URL: {url_foto_cloudinary} ---")
                                    except Exception as e:
                                        print(f"❌ Erro Cloudinary: {e}")
                                        # Retorna erro JSON para o frontend
                                        try:
                                            self.send_response(500)
                                            self.send_header('Content-Type', 'application/json')
                                            self.end_headers()
                                            self.wfile.write(json.dumps({"ok": False, "mensagem": f"Erro no upload da foto: {str(e)}"}).encode())
                                        except Exception:
                                            pass
                                        return
                            else:
                                try:
                                    valor = fs.getvalue(key)
                                    dados[key] = valor
                                except Exception:
                                    pass
                else:
                    # Fallback manual quando cgi não estiver presente
                    try:
                        boundary = content_type.split('boundary=')[1].encode()
                    except Exception:
                        boundary = None

                    if not boundary:
                        print('❌ Boundary não encontrado no Content-Type multipart')
                    else:
                        try:
                            length = int(self.headers.get('Content-Length', 0))
                            body = self.rfile.read(length)
                            partes = body.split(b"--" + boundary)

                            for parte in partes:
                                parte = parte.strip()
                                if not parte or parte == b'--':
                                    continue
                                if b"\r\n\r\n" not in parte:
                                    continue
                                headers, conteudo = parte.split(b"\r\n\r\n", 1)
                                if conteudo.endswith(b"\r\n"):
                                    conteudo = conteudo[:-2]

                                # FILE
                                if b'name="foto"' in headers and b'filename="' in headers:
                                    if len(conteudo) > 0:
                                        try:
                                            print('--- Iniciando upload para Cloudinary (fallback) ---')
                                            upload_result = cloudinary.uploader.upload(file=io.BytesIO(conteudo), folder='perfil_usuarios')
                                            url_foto_cloudinary = upload_result.get('secure_url')
                                            print(f'--- Sucesso! URL: {url_foto_cloudinary} ---')
                                        except Exception as e:
                                            print(f'❌ Erro Cloudinary (fallback): {e}')
                                            try:
                                                self.send_response(500)
                                                self.send_header('Content-Type', 'application/json')
                                                self.end_headers()
                                                self.wfile.write(json.dumps({"ok": False, "mensagem": f"Erro no upload da foto: {str(e)}"}).encode())
                                            except Exception:
                                                pass
                                            return
                                else:
                                    # TEXT FIELDS
                                    if b'name="' in headers:
                                        try:
                                            nome_campo = headers.split(b'name="')[1].split(b'"')[0].decode()
                                            valor = conteudo.decode('utf-8', errors='ignore').strip()
                                            dados[nome_campo] = valor
                                        except Exception:
                                            pass
                        except Exception as e:
                            print(f'❌ Erro no parsing multipart (fallback): {e}')

            email_usuario = dados.get("email", "")
            if isinstance(email_usuario, list):
                email_usuario = email_usuario[0]

            email_usuario = email_usuario.strip()
            print(f"--- Tentando atualizar usuário: {email_usuario} ---")
            print("--- Dados brutos recebidos (campos):", dados)

            conexao = None
            try:
                conexao = mysql.connector.connect(**DB_CONFIG)
                cursor = conexao.cursor()

                if url_foto_cloudinary:
                    sql = """UPDATE Usuario SET 
                        Nome=%s, 
                        Telefone=%s, 
                        CEP=%s, 
                        Rua=%s, 
                        Cidade=%s, 
                        Estado=%s, 
                        Numero_casa=%s, 
                        Complemento=%s,
                        Data_Nasc=%s,
                        Foto=%s
                    WHERE Email=%s"""

                    valores = (
                        dados.get("nome"),
                        dados.get("telefone"),
                        dados.get("cep"),
                        dados.get("rua"),
                        dados.get("cidade"),
                        dados.get("estado"),
                        dados.get("numero"),
                        dados.get("complemento"),
                        dados.get("dataNascimento"),
                        url_foto_cloudinary,
                        email_usuario
                    )

                else:
                    sql = """UPDATE Usuario SET 
                        Nome=%s, 
                        Telefone=%s, 
                        CEP=%s, 
                        Rua=%s, 
                        Cidade=%s, 
                        Estado=%s, 
                        Numero_casa=%s, 
                        Complemento=%s,
                        Data_Nasc=%s
                    WHERE Email=%s"""

                    valores = (
                        dados.get("nome"),
                        dados.get("telefone"),
                        dados.get("cep"),
                        dados.get("rua"),
                        dados.get("cidade"),
                        dados.get("estado"),
                        dados.get("numero"),
                        dados.get("complemento"),
                        dados.get("dataNascimento"),
                        email_usuario
                    )
                cursor.execute(sql, valores)
                conexao.commit()

                # Verifica se alguma linha foi realmente afetada
                if cursor.rowcount == 0:
                    print("⚠️ Nenhuma linha atualizada. O e-mail existe no banco?")
                    resposta = {"ok": False, "mensagem": "Nenhuma linha atualizada. Verifique o email."}
                    self.send_response(400)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps(resposta).encode())
                else:
                    resposta = {"ok": True, "foto": url_foto_cloudinary}
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps(resposta).encode())

            except Exception as e:
                print(f"❌ Erro ao salvar no banco: {e}")
                # Retorna JSON com a mensagem de erro para ajudar no debug do frontend
                try:
                    self.send_response(500)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"ok": False, "mensagem": str(e)}).encode())
                except Exception:
                    # Caso a resposta JSON falhe, apenas finalize com 500
                    self.send_response(500)
                    self.end_headers()
            finally:
                if conexao and conexao.is_connected():
                    cursor.close()
                    conexao.close()
        
        elif self.path == '/deletar-conta':
            content_length = int(self.headers['Content-Length'])
            corpo = self.rfile.read(content_length)

            dados = json.loads(corpo.decode())

            email = dados.get("email")
            senha = dados.get("senha").encode('utf-8')

            conexao = mysql.connector.connect(**DB_CONFIG)
            cursor = conexao.cursor()

            try:
                # 🔍 busca senha do usuário
                cursor.execute("SELECT Senha FROM Usuario WHERE Email = %s", (email,))
                resultado = cursor.fetchone()

                if not resultado:
                    resposta = {"sucesso": False, "mensagem": "Usuário não encontrado"}

                else:
                    senha_hash = resultado[0].encode('utf-8')

                    # 🔐 compara senha digitada com hash
                    if bcrypt.checkpw(senha, senha_hash):

                        # 🗑️ deleta usuário
                        cursor.execute("DELETE FROM Usuario WHERE Email = %s", (email,))
                        conexao.commit()

                        resposta = {"sucesso": True}

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
                self.wfile.write(json.dumps({"sucesso": False, "erro": str(e)}).encode())

            finally:
                cursor.close()
                conexao.close()

        elif self.path == '/trocar-senha':
            # Endpoint para alterar senha a partir do perfil (requisição JSON)
            content_length = int(self.headers.get('Content-Length', 0))
            corpo = self.rfile.read(content_length)

            try:
                dados = json.loads(corpo.decode())
            except Exception:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"sucesso": False, "mensagem": "JSON inválido"}).encode())
                return

            email = dados.get('email')
            senha_atual = dados.get('senhaAtual', '').encode('utf-8')
            nova_senha = dados.get('novaSenha', '').encode('utf-8')

            if not email or not senha_atual or not nova_senha:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"sucesso": False, "mensagem": "Dados insuficientes"}).encode())
                return

            conexao = None
            try:
                conexao = mysql.connector.connect(**DB_CONFIG)
                cursor = conexao.cursor()

                # busca hash atual
                cursor.execute("SELECT Senha FROM Usuario WHERE Email = %s", (email,))
                resultado = cursor.fetchone()

                if not resultado:
                    resposta = {"sucesso": False, "mensagem": "Usuário não encontrado"}
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps(resposta).encode())
                    return

                senha_hash = resultado[0].encode('utf-8')

                # valida senha atual
                if not bcrypt.checkpw(senha_atual, senha_hash):
                    resposta = {"sucesso": False, "mensagem": "Senha incorreta"}
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps(resposta).encode())
                    return

                # gera hash da nova senha e atualiza
                nova_hash = bcrypt.hashpw(nova_senha, bcrypt.gensalt()).decode('utf-8')
                cursor.execute("UPDATE Usuario SET Senha = %s WHERE Email = %s", (nova_hash, email))
                conexao.commit()

                resposta = {"sucesso": True, "mensagem": "Senha alterada com sucesso"}
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(resposta).encode())

            except Exception as e:
                print(f"❌ Erro ao trocar senha: {e}")
                try:
                    self.send_response(500)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"sucesso": False, "mensagem": str(e)}).encode())
                except Exception:
                    pass
            finally:
                if conexao and conexao.is_connected():
                    cursor.close()
                    conexao.close()

        elif self.path == '/registrar-reciclagem':
            try:
                content_length = int(self.headers['Content-Length'])
                dados = json.loads(self.rfile.read(content_length).decode())

                print("DADOS RECEBIDOS:", dados)

                conexao = mysql.connector.connect(**DB_CONFIG)
                cursor = conexao.cursor()

                cursor.execute(
                    "SELECT ID_usuario FROM Usuario WHERE Email = %s",
                    (dados["email"],)
                )

                usuario = cursor.fetchone()

                if not usuario:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()

                    self.wfile.write(json.dumps({
                        "sucesso": False,
                        "mensagem": "Usuário não encontrado"
                    }).encode())

                    return

                id_usuario = usuario[0]

                pontos = dados.get("pontos") if isinstance(dados.get("pontos"), (int, float)) else dados.get("pontos")

                try:
                    cursor.execute("""
                        INSERT INTO Reciclagem (
                            Tipo_Material,
                            Data,
                            Quantidade,
                            Pontos,
                            fk_Usuario_ID_usuario
                        )
                        VALUES (%s, NOW(), %s, %s, %s)
                    """, (
                        dados["tipo"],
                        dados["quantidade"],
                        pontos,
                        id_usuario
                    ))
                    # Log do ID inserido (útil para diagnosticar problemas de chave primária)
                    try:
                        last_id = cursor.lastrowid
                        print(f"[DEBUG] Reciclagem inserida com ID: {last_id}")
                    except Exception:
                        last_id = None
                except Exception as insert_err:
                    # Se a tabela não tiver AUTO_INCREMENT para ID_reciclagem, tentar calcular próximo ID e inserir explicitamente
                    print('[WARN] Inserção direta em Reciclagem falhou, tentando fallback com ID explícito:', insert_err)
                    try:
                        cursor.execute("SELECT COALESCE(MAX(ID_reciclagem), 0) + 1 FROM Reciclagem")
                        next_id = cursor.fetchone()[0]
                        cursor.execute("""
                            INSERT INTO Reciclagem (
                                ID_reciclagem,
                                Tipo_Material,
                                Data,
                                Quantidade,
                                Pontos,
                                fk_Usuario_ID_usuario
                            )
                            VALUES (%s, %s, NOW(), %s, %s, %s)
                        """, (
                            next_id,
                            dados["tipo"],
                            dados["quantidade"],
                            pontos,
                            id_usuario
                        ))
                        last_id = next_id
                        print(f"[DEBUG] Reciclagem inserida com ID (fallback): {last_id}")
                    except Exception as e2:
                        print('[ERROR] Fallback de inserção também falhou:', e2)
                        raise

                # Atualiza pontos do usuário (se fornecido)
                try:
                    if pontos is not None:
                        cursor.execute("""
                            UPDATE Usuario 
                            SET Pontuacao_Total_Acumulada_ = COALESCE(Pontuacao_Total_Acumulada_,0) + %s
                            WHERE ID_usuario = %s
                        """, (
                            pontos,
                            id_usuario
                        ))
                    else:
                        print('[WARN] Nenhum campo "pontos" enviado na requisição; pulando atualização de pontos')
                except Exception as e:
                    print('[ERROR] Falha ao atualizar pontos do usuário:', e)

                conexao.commit()

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()

                self.wfile.write(json.dumps({
                    "sucesso": True,
                    "mensagem": "Reciclagem registrada"
                }).encode())

            except Exception as e:
                print("ERRO AO REGISTRAR:", e)

                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()

                self.wfile.write(json.dumps({
                    "sucesso": False,
                    "erro": str(e)
                }).encode())

            finally:
                if conexao and conexao.is_connected():
                    cursor.close()
                    conexao.close()

        elif self.path == '/editar-reciclagem':
            dados = json.loads(self.rfile.read(int(self.headers['Content-Length'])).decode())

            # exige 'requester' (email) para validar permissão
            requester = dados.get('requester')
            if not requester:
                self.send_response(403)
                self.end_headers()
                return

            conexao = mysql.connector.connect(**DB_CONFIG)
            cursor = conexao.cursor()

            # checa permissão do requester
            cursor.execute("SELECT COALESCE(fk_permissao, 0) FROM Usuario WHERE Email = %s", (requester,))
            perm_row = cursor.fetchone()
            fk_perm = perm_row[0] if perm_row else None

            is_admin = False
            if fk_perm:
                cursor.execute("SELECT Nome FROM Permissao WHERE ID_permissao = %s", (fk_perm,))
                p = cursor.fetchone()
                is_admin = (p and p[0] == 'admin')

            if not is_admin:
                self.send_response(403)
                self.end_headers()
                cursor.close()
                conexao.close()
                return

            cursor.execute("""
                UPDATE Reciclagem 
                SET Tipo_Material=%s, Data=%s, Quantidade=%s, Pontos=%s
                WHERE ID_reciclagem=%s
            """, (
                dados["tipo"],
                dados["data"],
                dados["quantidade"],
                dados.get("pontos"),
                dados["id"]
            ))

            conexao.commit()

            self.send_response(200)
            self.end_headers()

            cursor.close()
            conexao.close()

        elif self.path == '/editar-usuario':
            # Admin pode editar nome, pontos e permissão de um usuário
            try:
                dados = json.loads(self.rfile.read(int(self.headers.get('Content-Length', 0))).decode())
            except Exception:
                self.send_response(400)
                self.end_headers()
                return

            requester = dados.get('requester')
            target_email = dados.get('email')
            novo_nome = dados.get('nome')
            novos_pontos = dados.get('pontos')
            nova_permissao = dados.get('permissao')

            if not requester or not target_email:
                self.send_response(400)
                self.end_headers()
                return

            conexao = mysql.connector.connect(**DB_CONFIG)
            cursor = conexao.cursor()

            # valida permissões do requester
            cursor.execute("SELECT COALESCE(fk_permissao, 0) FROM Usuario WHERE Email = %s", (requester,))
            perm_row = cursor.fetchone()
            fk_perm = perm_row[0] if perm_row else None

            is_admin = False
            if fk_perm:
                cursor.execute("SELECT Nome FROM Permissao WHERE ID_permissao = %s", (fk_perm,))
                p = cursor.fetchone()
                is_admin = (p and p[0] == 'admin')

            if not is_admin:
                self.send_response(403)
                self.end_headers()
                cursor.close()
                conexao.close()
                return

            # mapear permissao textual para fk_permissao se existir
            fk_to_set = None
            if nova_permissao:
                try:
                    cursor.execute("SELECT ID_permissao FROM Permissao WHERE Nome = %s", (nova_permissao,))
                    r = cursor.fetchone()
                    if r:
                        fk_to_set = r[0]
                except Exception:
                    fk_to_set = None

            updates = []
            params = []
            if novo_nome is not None:
                updates.append("Nome=%s"); params.append(novo_nome)
            if novos_pontos is not None:
                updates.append("Pontuacao_Total_Acumulada_=%s"); params.append(novos_pontos)
            if fk_to_set is not None:
                updates.append("fk_permissao=%s"); params.append(fk_to_set)

            if updates:
                sql = "UPDATE Usuario SET " + ", ".join(updates) + " WHERE Email=%s"
                params.append(target_email)
                cursor.execute(sql, tuple(params))
                conexao.commit()

            self.send_response(200)
            self.send_header('Content-Type','application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'sucesso': True}).encode())

            cursor.close()
            conexao.close()

        elif self.path == '/deletar-reciclagem':
            dados = json.loads(self.rfile.read(int(self.headers['Content-Length'])).decode())

            requester = dados.get('requester')
            if not requester:
                self.send_response(403)
                self.end_headers()
                return

            conexao = mysql.connector.connect(**DB_CONFIG)
            cursor = conexao.cursor()

            cursor.execute("SELECT COALESCE(fk_permissao, 0) FROM Usuario WHERE Email = %s", (requester,))
            perm_row = cursor.fetchone()
            fk_perm = perm_row[0] if perm_row else None

            is_admin = False
            if fk_perm:
                cursor.execute("SELECT Nome FROM Permissao WHERE ID_permissao = %s", (fk_perm,))
                p = cursor.fetchone()
                is_admin = (p and p[0] == 'admin')

            if not is_admin:
                self.send_response(403)
                self.end_headers()
                cursor.close()
                conexao.close()
                return

            cursor.execute("SELECT Pontos, fk_Usuario_ID_usuario FROM Reciclagem WHERE ID_reciclagem=%s", (dados["id"],))
            reg = cursor.fetchone()

            if reg:
                pontos, id_usuario = reg

                cursor.execute("DELETE FROM Reciclagem WHERE ID_reciclagem=%s", (dados["id"],))

                cursor.execute("""
                    UPDATE Usuario 
                    SET Pontuacao_Total_Acumulada_ = COALESCE(Pontuacao_Total_Acumulada_,0) - %s
                    WHERE ID_usuario = %s
                """, (pontos, id_usuario))

                conexao.commit()

            self.send_response(200)
            self.end_headers()

            cursor.close()
            conexao.close()



# === INICIALIZAÇÃO ===
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000)) 
    server_address = ('0.0.0.0', port)
    httpd = http.server.HTTPServer(server_address, ServidorCadastro)
    print(f"Servidor rodando na porta {port}...")
    httpd.serve_forever()
