USE Lixie;

CREATE TABLE Usuario (
    ID_usuario INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(250) UNIQUE,
    Nome VARCHAR(100),
    Pontuacao_Total_Acumulada_ INT(16),
    Data_Nasc DATE,
    Rua VARCHAR(100),
    Numero_casa INT(11),
    Cidade VARCHAR(100),
    Estado VARCHAR(100),
    Complemento VARCHAR(100),
    CEP VARCHAR(9),
    Telefone VARCHAR(20),
    Senha VARCHAR(50),
    Dt_Criacao DATE,
    Nivel INT(11)
);

CREATE TABLE Reciclagem (
    ID_reciclagem INT(11) PRIMARY KEY,
    Tipo_Material VARCHAR(50),
    Data DATE,
    Quantidade INT(20),
    fk_Usuario_ID_usuario INT(11)
);

CREATE TABLE Instituicao (
    ID_Instituicao INT(11) PRIMARY KEY,
    Nome VARCHAR(50),
    Tipo VARCHAR(50),
    Descricao VARCHAR(100),
    Endereco VARCHAR(250)
);

CREATE TABLE Recompensa (
    ID_recompensa INT(11) PRIMARY KEY,
    Nome VARCHAR(50),
    Tipo VARCHAR(50),
    Descricao VARCHAR(250),
    Pontos INT(11),
    Quantidade INT(11),
    fk_Instituicao_ID_Instituicao INT(11),
    fk_Usuario_ID_usuario INT(11)
);

CREATE TABLE Pontos (
    Quantidade INT(11),
    fk_Reciclagem_ID_reciclagem INT(11)
);
 
ALTER TABLE Reciclagem ADD CONSTRAINT FK_Reciclagem_2
    FOREIGN KEY (fk_Usuario_ID_usuario)
    REFERENCES Usuario (ID_usuario)
    ON DELETE CASCADE;
 
ALTER TABLE Recompensa ADD CONSTRAINT FK_Recompensa_2
    FOREIGN KEY (fk_Instituicao_ID_Instituicao)
    REFERENCES Instituicao (ID_Instituicao)
    ON DELETE RESTRICT;
 
ALTER TABLE Recompensa ADD CONSTRAINT FK_Recompensa_3
    FOREIGN KEY (fk_Usuario_ID_usuario)
    REFERENCES Usuario (ID_usuario)
    ON DELETE CASCADE;
 
ALTER TABLE Pontos ADD CONSTRAINT FK_Pontos_1
    FOREIGN KEY (fk_Reciclagem_ID_reciclagem)
    REFERENCES Reciclagem (ID_reciclagem)
    ON DELETE RESTRICT;
    
ALTER TABLE Usuario MODIFY senha VARCHAR(255);

ALTER TABLE Usuario ADD Ativo BOOLEAN DEFAULT FALSE;

SET SQL_SAFE_UPDATES = 0;
UPDATE Usuario SET Foto = NULL;
SET SQL_SAFE_UPDATES = 1;

ALTER TABLE Usuario MODIFY Senha VARCHAR(255);

ALTER TABLE Usuario MODIFY Numero_casa VARCHAR(20);

ALTER TABLE Usuario MODIFY Foto VARCHAR(500);

ALTER TABLE Usuario MODIFY Numero_casa VARCHAR(10);

CREATE TABLE Permissao (
    ID_permissao INT AUTO_INCREMENT PRIMARY KEY,
    Nome VARCHAR(50) UNIQUE
);

INSERT INTO Permissao (Nome) VALUES 
('admin'),
('usuario');

ALTER TABLE Usuario 
ADD fk_permissao INT;

ALTER TABLE Usuario 
ADD CONSTRAINT FK_Usuario_Permissao
FOREIGN KEY (fk_permissao)
REFERENCES Permissao(ID_permissao);

ALTER TABLE Usuario 
MODIFY fk_permissao INT DEFAULT 2;

UPDATE Usuario
SET fk_permissao = 1
WHERE Email = 'isabelalouise.cs@gmail.com';

ALTER TABLE Usuario
ADD Foto TEXT;

ALTER TABLE Reciclagem
ADD Pontos INT DEFAULT 0;

UPDATE Usuario
SET fk_permissao = 1
WHERE Email = 'isaadm@gmail.com';


SELECT * FROM Usuario;
SELECT * FROM Reciclagem;