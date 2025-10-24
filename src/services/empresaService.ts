// services/empresaService.ts
const API_BASE_URL = 'http://localhost:3000/contabilidad/empresa';

export interface Empresa {
  id: number;
  nombre: string;
  ruc: string;
  estado: string;
}

export const empresaService = {
  async getAll(): Promise<Empresa[]> {
    try {
      console.log('🔄 Obteniendo empresas desde:', `${API_BASE_URL}/all`);
      
      const response = await fetch(`${API_BASE_URL}/all`);
      
      console.log('📨 Response status:', response.status);
      console.log('📨 Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Empresas obtenidas (RAW):', data);
      
      // CORREGIR: Mapear de MAYÚSCULAS a minúsculas
      {/*const empresasMapeadas = data.map((empresa: any) => ({
        id: empresa.ID,
        nombre: empresa.NOMBRE,
        ruc: empresa.RUC,
        estado: empresa.ESTADO
      }));*/}

      const empresasMapeadas = data.map((empresa: any) => ({
        id: empresa.id,
        nombre: empresa.nombre,
        ruc: empresa.ruc,
        estado: empresa.estado
      }));

      
      console.log('✅ Empresas mapeadas:', empresasMapeadas);
      return empresasMapeadas;
    } catch (error) {
      console.error('💥 Error completo al obtener empresas:', error);
      throw error;
    }
  }
};