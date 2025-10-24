// services/periodoService.ts
const API_BASE_URL = 'http://localhost:3000/contabilidad/periodos';

export interface Periodo {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
}

export const periodoService = {
  async getAll(): Promise<Periodo[]> {
    try {
      console.log('🔄 Obteniendo periodos desde:', `${API_BASE_URL}/all`);
      
      const response = await fetch(`${API_BASE_URL}/all`);
      
      console.log('📨 Response status:', response.status);
      console.log('📨 Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Periodos obtenidos (RAW):', data);
      
      // CORREGIR: Mapear de MAYÚSCULAS a minúsculas
      const periodosMapeados = data.map((periodo: any) => ({
        id: periodo.ID,
        nombre: periodo.NOMBRE,
        fechaInicio: periodo.fechaInicio, // Este ya está mapeado en el backend
        fechaFin: periodo.fechaFin, // Este ya está mapeado en el backend
        estado: periodo.ESTADO
      }));
      
      console.log('✅ Periodos mapeados:', periodosMapeados);
      return periodosMapeados;
    } catch (error) {
      console.error('💥 Error completo al obtener periodos:', error);
      throw error;
    }
  }
};