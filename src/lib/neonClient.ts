import { neon, NeonQueryFunction } from '@neondatabase/serverless';

const STORAGE_KEY = 'apanzo_neon_database_url';

/**
 * Obtém a Connection String do Neon:
 * 1. Da variável de ambiente VITE_NEON_DATABASE_URL
 * 2. Ou do localStorage (permitindo configurar diretamente pelo painel administrativo)
 */
export function getNeonDatabaseUrl(): string {
  if (typeof window !== 'undefined') {
    const fromStorage = localStorage.getItem(STORAGE_KEY);
    if (fromStorage && fromStorage.trim().startsWith('postgres')) {
      return fromStorage.trim();
    }
  }

  const fromEnv = (import.meta as any).env?.VITE_NEON_DATABASE_URL;
  if (fromEnv && typeof fromEnv === 'string' && fromEnv.trim().startsWith('postgres')) {
    return fromEnv.trim();
  }

  return '';
}

export function setNeonDatabaseUrl(url: string): void {
  if (typeof window !== 'undefined') {
    if (url && url.trim().startsWith('postgres')) {
      localStorage.setItem(STORAGE_KEY, url.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

export function isNeonConfigured(): boolean {
  return Boolean(getNeonDatabaseUrl());
}

let cachedSql: NeonQueryFunction<false, false> | null = null;
let lastUsedUrl = '';

/**
 * Retorna o cliente SQL do Neon via HTTP Serverless.
 * Funciona nativamente no navegador sobre HTTPS (fetch), sem necessidade de abrir sockets TCP.
 */
export function getNeonSql(): NeonQueryFunction<false, false> | null {
  const url = getNeonDatabaseUrl();
  if (!url) return null;

  if (cachedSql && lastUsedUrl === url) {
    return cachedSql;
  }

  try {
    cachedSql = neon(url);
    lastUsedUrl = url;
    return cachedSql;
  } catch (err) {
    console.error('Falha ao inicializar o cliente Neon:', err);
    return null;
  }
}

/**
 * Testa a conexão com o banco Neon Tech.
 */
export async function testNeonConnection(customUrl?: string): Promise<{ success: boolean; message: string; version?: string }> {
  const url = customUrl || getNeonDatabaseUrl();
  if (!url) {
    return { success: false, message: 'Nenhuma URL de conexão do Neon configurada.' };
  }

  try {
    const client = neon(url);
    const result = await client`SELECT version(), current_database() as db_name, now() as current_time;`;
    if (result && result.length > 0) {
      return {
        success: true,
        message: `Conectado com sucesso ao banco "${result[0].db_name}" no Neon Tech!`,
        version: String(result[0].version),
      };
    }
    return { success: false, message: 'Nenhum resultado retornado do banco Neon.' };
  } catch (error: any) {
    return {
      success: false,
      message: `Erro ao conectar ao Neon: ${error?.message || error}`,
    };
  }
}
