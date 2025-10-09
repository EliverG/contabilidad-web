import type { AsientoContable } from '../types/AsientoContable';

const API_BASE_URL = 'http://localhost:3000/contabilidad/asientos-contables';

export const asientoContableService = {
  // Obtener todos los asientos
  async getAll(): Promise<AsientoContable[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/all`);
      if (!response.ok) throw new Error('Error al obtener asientos');
      return await response.json();
    } catch (error) {
      console.error('Error en getAll:', error);
      throw error;
    }
  },

  // Obtener asiento por ID
  async getById(id: number): Promise<AsientoContable> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      if (!response.ok) throw new Error('Error al obtener el asiento');
      return await response.json();
    } catch (error) {
      console.error('Error en getById:', error);
      throw error;
    }
  },

  // Crear nuevo asiento
  async create(asiento: Omit<AsientoContable, 'id'>): Promise<AsientoContable> {
    try {
      const response = await fetch(`${API_BASE_URL}/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(asiento),
      });
      if (!response.ok) throw new Error('Error al crear el asiento');
      return await response.json();
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  },

  // Eliminar asiento
  async delete(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al eliminar el asiento');
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  },

  // Actualizar estado
  async updateEstado(id: number, estado: 'BORRADOR' | 'CONTABILIZADO' | 'ANULADO'): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado }),
      });
      if (!response.ok) throw new Error('Error al actualizar el estado');
    } catch (error) {
      console.error('Error en updateEstado:', error);
      throw error;
    }
  },

  async update(id: number, asiento: Partial<AsientoContable>): Promise<AsientoContable> {
  try {
    console.log('🚀 Enviando PUT a:', `${API_BASE_URL}/${id}`);
    console.log('📝 Datos a actualizar:', asiento);
    
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(asiento),
    });
    
    console.log('📨 Response status:', response.status);
    console.log('📨 Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Asiento actualizado:', data);
    return data;
    
  } catch (error) {
    console.error('💥 Error en update:', error);
    throw error;
  }
}
};