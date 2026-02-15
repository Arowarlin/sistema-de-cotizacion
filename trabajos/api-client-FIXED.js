// ============================================
// API CLIENT - Conexión con Backend PHP/MySQL
// VERSIÓN CORREGIDA
// ============================================

class ApiClient {
    constructor() {
        // Detectar entorno automáticamente
        this.isLocal = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.includes('.local');
        
        // URL base según entorno
        if (this.isLocal) {
            // IMPORTANTE: Cambiar "cotizacion" por el nombre de tu carpeta
            const folder = 'cotizacion';
            this.baseURL = `http://localhost:8081/${folder}/php/api.php`;
        } else {
            // Producción
            this.baseURL = window.location.origin + '/php/api.php';
        }
        
        console.log('🌐 API Client inicializado:', this.baseURL);
    }

    // ============================================
    // MÉTODO GENÉRICO PARA PETICIONES (CORREGIDO)
    // ============================================
    async request(action, method = 'GET', data = null) {
        try {
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            };

            // Construir URL base
            let url = `${this.baseURL}?action=${action}`;

            // ✅ CORRECCIÓN: Manejar datos según método
            if (method === 'GET' && data) {
                // Para GET, agregar datos como query params
                const params = new URLSearchParams();
                Object.keys(data).forEach(key => {
                    if (data[key] !== null && data[key] !== undefined) {
                        params.append(key, data[key]);
                    }
                });
                url += '&' + params.toString();
            } else if ((method === 'POST' || method === 'PUT' || method === 'DELETE') && data) {
                // Para POST/PUT/DELETE, enviar en el body
                options.body = JSON.stringify(data);
            }

            console.log('📡 Petición:', method, action, url);
            if (data && method !== 'GET') {
                console.log('📦 Datos enviados:', data);
            }

            // Hacer petición
            const response = await fetch(url, options);
            
            // Verificar status HTTP
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
            }
            
            // Leer respuesta como texto primero
            const text = await response.text();
            console.log('📥 Respuesta raw:', text.substring(0, 500)); // Primeros 500 chars
            
            // Intentar parsear como JSON
            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                console.error('❌ Error parseando JSON:', e);
                console.error('Respuesta completa:', text);
                throw new Error('El servidor no devolvió JSON válido. Revisa la consola de PHP.');
            }

            // Verificar respuesta de la API
            if (!result.success) {
                throw new Error(result.error || 'Error desconocido en la petición');
            }

            console.log('✅ Respuesta exitosa:', result);
            return result.data;

        } catch (error) {
            console.error('❌ Error en API:', error);
            throw error;
        }
    }

    // ============================================
    // COTIZACIONES (CORREGIDO)
    // ============================================

    async guardarCotizacion(cotizacion) {
        console.log('💾 Guardando cotización:', cotizacion);
        const resultado = await this.request('guardar_cotizacion', 'POST', cotizacion);
        console.log('✅ Cotización guardada:', resultado);
        return resultado;
    }

    async obtenerCotizaciones() {
        return await this.request('obtener_cotizaciones', 'GET');
    }

    async obtenerCotizacion(id) {
        // ✅ CORRECCIÓN: Para GET, pasar id en query params
        return await this.request('obtener_cotizacion', 'GET', { id });
    }

    async eliminarCotizacion(id) {
        if (!confirm('¿Está seguro de eliminar esta cotización?')) {
            return null;
        }
        // ✅ CORRECCIÓN: DELETE envía datos en body
        return await this.request('eliminar_cotizacion', 'DELETE', { id });
    }

    // ============================================
    // CLIENTES
    // ============================================

    async obtenerClientes() {
        return await this.request('obtener_clientes', 'GET');
    }

    async buscarCliente(nombre) {
        if (!nombre || nombre.length < 2) {
            throw new Error('El nombre debe tener al menos 2 caracteres');
        }
        return await this.request('buscar_cliente', 'GET', { nombre });
    }

    // ============================================
    // ESTADÍSTICAS
    // ============================================

    async obtenerEstadisticas() {
        return await this.request('obtener_estadisticas', 'GET');
    }

    // ============================================
    // UTILIDADES
    // ============================================

    async probarConexion() {
        try {
            const result = await this.request('obtener_configuracion', 'GET');
            console.log('✅ Conexión con API exitosa:', result);
            return true;
        } catch (error) {
            console.warn('⚠️ No se pudo conectar con la API:', error.message);
            return false;
        }
    }
}

// ============================================
// CREAR INSTANCIA GLOBAL
// ============================================
const apiClient = new ApiClient();

// ============================================
// PUENTE DE COMPATIBILIDAD (CORREGIDO)
// ============================================

const db = {
    guardarCotizacion: async (cotizacion) => {
        try {
            console.log('🔄 db.guardarCotizacion llamado con:', cotizacion);
            const resultado = await apiClient.guardarCotizacion(cotizacion);
            console.log('✅ db.guardarCotizacion resultado:', resultado);
            return resultado;
        } catch (error) {
            console.error('❌ Error en db.guardarCotizacion:', error);
            throw error;
        }
    },
    
    obtenerTodasCotizaciones: async () => {
        return await apiClient.obtenerCotizaciones();
    },
    
    obtenerCotizacionPorId: async (id) => {
        return await apiClient.obtenerCotizacion(id);
    },
    
    eliminarCotizacion: async (id) => {
        return await apiClient.eliminarCotizacion(id);
    },
    
    buscarPorCliente: async (nombre) => {
        return await apiClient.buscarCliente(nombre);
    },
    
    obtenerEstadisticas: async () => {
        return await apiClient.obtenerEstadisticas();
    },
    
    exportarAJSON: async () => {
        const cotizaciones = await apiClient.obtenerCotizaciones();
        return JSON.stringify(cotizaciones, null, 2);
    },
    
    init: async () => {
        console.log('🔌 Inicializando conexión con MySQL...');
        return await apiClient.probarConexion();
    }
};

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando sistema...');
    
    try {
        const conectado = await apiClient.probarConexion();
        if (conectado) {
            console.log('✅ Sistema conectado a MySQL correctamente');
            if (typeof mostrarToast === 'function') {
                mostrarToast('Conectado a la base de datos', 'success', 'Sistema Listo');
            }
        } else {
            console.warn('⚠️ No se pudo conectar con MySQL');
            if (typeof mostrarToast === 'function') {
                mostrarToast('Error de conexión con el servidor', 'warning', 'Sin Conexión');
            }
        }
    } catch (error) {
        console.error('❌ Error al inicializar:', error);
        if (typeof mostrarToast === 'function') {
            mostrarToast('Error al inicializar el sistema: ' + error.message, 'error', 'Error');
        }
    }
});