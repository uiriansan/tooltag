PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Insumos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cod_fabricacao TEXT UNIQUE NOT NULL,
  cod_interno TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  observacoes TEXT,
  foto_path TEXT,
  material TEXT,
  ferramenta BOOLEAN NOT NULL DEFAULT 0,
  tipo INTEGER,
  altura_min REAL,
  altura_max REAL,
  rpm REAL,
  avanco_min REAL,
  categoria INTEGER,

  FOREIGN KEY (tipo) REFERENCES TiposFerramentas(id),
  FOREIGN KEY (categoria) REFERENCES Categorias(id)
);

CREATE TABLE IF NOT EXISTS InsumosFerramentas (
  insumo_id INTEGER NOT NULL,
  ferramenta_id INTEGER NOT NULL,
  quantidade INTEGER NOT NULL,
  PRIMARY KEY (insumo_id, ferramenta_id),

  FOREIGN KEY (insumo_id) REFERENCES Insumos(id),
  FOREIGN KEY (ferramenta_id) REFERENCES Insumos(id)
);

CREATE TABLE IF NOT EXISTS TiposFerramentas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS Categorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS Ocorrencias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  status INTEGER NOT NULL CHECK( status in (0, 1) ),
  prioridade INTEGER NOT NULL CHECK( prioridade in (0, 1, 2, 3) ),
  data DATETIME DEFAULT CURRENT_TIMESTAMP,
  solicitante TEXT NOT NULL,
  justificativa TEXT NOT NULL,
  aprovado_por TEXT,
  data_aprovacao DATETIME,
  observacao TEXT,
  maquina INTEGER NOT NULL,

  FOREIGN KEY (maquina) REFERENCES Maquinas(id)
);

CREATE TABLE IF NOT EXISTS Maquinas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS InsumosMaquinas (
  insumo_id INTEGER NOT NULL,
  maquina_id INTEGER NOT NULL,
  PRIMARY KEY (insumo_id, maquina_id),

  FOREIGN KEY (insumo_id) REFERENCES Insumos(id),
  FOREIGN KEY (maquina_id) REFERENCES Maquinas(id)
);

CREATE TABLE IF NOT EXISTS InsumosOcorrencias (
  ocorrencia_id INTEGER NOT NULL,
  insumo_id INTEGER NOT NULL,
  quantidade INTEGER NOT NULL,
  PRIMARY KEY (ocorrencia_id, insumo_id),

  FOREIGN KEY (ocorrencia_id) REFERENCES Ocorrencias(id),
  FOREIGN KEY (insumo_id) REFERENCES Insumos(id)
);
