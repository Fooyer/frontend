import { useState } from 'react';
import { gerarSugestoes } from '../services/presente.service.js';

export function usePresente() {
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function buscarSugestoes(perfil) {
    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      const data = await gerarSugestoes(perfil);
      setResultado(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function resetar() {
    setResultado(null);
    setError(null);
  }

  return { resultado, loading, error, buscarSugestoes, resetar };
}
