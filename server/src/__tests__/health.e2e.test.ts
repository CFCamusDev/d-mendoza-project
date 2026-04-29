import { describe, it, expect } from '@jest/globals';

describe('Health Check (E2E)', () => {
  // Asumimos que el contenedor expone el puerto 3000
  const API_URL = 'http://localhost:3000/api';

  it('debería retornar HTTP 200 y status ok cuando el contenedor expone el puerto correctamente', async () => {
    // Hacemos una petición HTTP real al puerto expuesto
    const response = await fetch(`${API_URL}/health`);
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('timestamp');
  });
});
