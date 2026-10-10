export interface GenericData {
  id: number;
  nome: string;
}

export interface Insumo {
  id: number;
  cod_frabricacao: string | null;
  cod_interno: string;
  nome: string;
  observacoes: string | null;
  foto_path: string | null;
  material: string | null;
  ferramenta: boolean;
  tipo: number | null;
  altura_min: number | null;
  altura_max: number | null;
  rpm: number | null;
  avanco_min: number | null;
  categoria: number | null;
  criado_em: number;
  atualizado_em: number;
  adicionado_por: number | null;
  completo: boolean;
}

export interface Maquina {
  id: number;
  nome: string;
  celula: GenericData;
}

export interface InsumoCardData {
  cod_interno: string;
  nome: string;
  observacoes: string | null;
  foto_path: string;
  categoria: string | null;
  completo: boolean;
  obsoleto: boolean;
  versao: number;
  maquinas: Maquina[];
}

export interface FerramentaCardData {
  cod_interno: string;
  nome: string;
  observacoes: string | null;
  foto_path: string;
  tipo: string | null;
  completo: boolean;
  obsoleto: boolean;
  versao: number;
  maquinas: Maquina[];
  insumos: InsumoCardData[];
}

export enum SortFerramentas {
  COD_AZ = "COD_AZ",
  COD_ZA = "COD_ZA",
  DATA_UPD_NEW = "DATA_UPD_NEW",
  DATA_UPD_OLD = "DATA_UPD_OLD",
  OCORRENCIAS_NEW = "OCORRENCIAS_NEW",
  OCORRENCIAS_OLD = "OCORRENCIAS_OLD",
}
