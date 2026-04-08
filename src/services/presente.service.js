import api from './api.js';

/**
 * @param {Object} perfil
 * @returns {Promise<{ sugestoes: Array, mensagemCartao: string }>}
 */
export async function gerarSugestoes(perfil) {
  const response = await api.post('/presente/sugestoes', { perfil });

  if (!response.success) {
    throw new Error(response.error || 'Erro ao gerar sugestões.');
  }

  return response.data;
}
