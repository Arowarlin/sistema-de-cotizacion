// ============================================
// DATABASE.JS - Gestión de Base de Datos con IndexedDB
// ============================================

class DatabaseManager {
    constructor() {
        this.dbName = 'CotizacionesMantenimiento';
        this.dbVersion = 1;
        this.db = null;
    }

    // Inicializar la base de datos
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('Error al abrir la base de datos:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('Base de datos inicializada correctamente');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Crear object store para cotizaciones
                if (!db.objectStoreNames.contains('cotizaciones')) {
                    const objectStore = db.createObjectStore('cotizaciones', {
                        keyPath: 'id',
                        autoIncrement: true
                    });

                    // Crear índices
                    objectStore.createIndex('fecha', 'fecha', { unique: false });
                    objectStore.createIndex('clienteNombre', 'datosCliente.nombre', { unique: false });
                    objectStore.createIndex('numeroFolio', 'numeroFolio', { unique: true });
                }

                // Crear object store para configuraciones
                if (!db.objectStoreNames.contains('configuraciones')) {
                    db.createObjectStore('configuraciones', {
                        keyPath: 'clave'
                    });
                }

                console.log('Estructura de base de datos creada');
            };
        });
    }

    // Guardar una cotización
    async guardarCotizacion(cotizacion) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Base de datos no inicializada'));
                return;
            }

            const transaction = this.db.transaction(['cotizaciones'], 'readwrite');
            const objectStore = transaction.objectStore('cotizaciones');

            // Agregar fecha y número de folio si no existen
            if (!cotizacion.fecha) {
                cotizacion.fecha = new Date().toISOString();
            }

            if (!cotizacion.numeroFolio) {
                cotizacion.numeroFolio = this.generarNumeroFolio();
            }

            const request = objectStore.add(cotizacion);

            request.onsuccess = () => {
                console.log('Cotización guardada con ID:', request.result);
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('Error al guardar cotización:', request.error);
                reject(request.error);
            };
        });
    }

    // Actualizar una cotización existente
    async actualizarCotizacion(cotizacion) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Base de datos no inicializada'));
                return;
            }

            const transaction = this.db.transaction(['cotizaciones'], 'readwrite');
            const objectStore = transaction.objectStore('cotizaciones');

            cotizacion.fechaActualizacion = new Date().toISOString();

            const request = objectStore.put(cotizacion);

            request.onsuccess = () => {
                console.log('Cotización actualizada:', request.result);
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('Error al actualizar cotización:', request.error);
                reject(request.error);
            };
        });
    }

    // Obtener todas las cotizaciones
    async obtenerTodasCotizaciones() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Base de datos no inicializada'));
                return;
            }

            const transaction = this.db.transaction(['cotizaciones'], 'readonly');
            const objectStore = transaction.objectStore('cotizaciones');
            const request = objectStore.getAll();

            request.onsuccess = () => {
                // Ordenar por fecha descendente
                const cotizaciones = request.result.sort((a, b) => {
                    return new Date(b.fecha) - new Date(a.fecha);
                });
                resolve(cotizaciones);
            };

            request.onerror = () => {
                console.error('Error al obtener cotizaciones:', request.error);
                reject(request.error);
            };
        });
    }

    // Obtener una cotización por ID
    async obtenerCotizacionPorId(id) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Base de datos no inicializada'));
                return;
            }

            const transaction = this.db.transaction(['cotizaciones'], 'readonly');
            const objectStore = transaction.objectStore('cotizaciones');
            const request = objectStore.get(id);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('Error al obtener cotización:', request.error);
                reject(request.error);
            };
        });
    }

    // Eliminar una cotización
    async eliminarCotizacion(id) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Base de datos no inicializada'));
                return;
            }

            const transaction = this.db.transaction(['cotizaciones'], 'readwrite');
            const objectStore = transaction.objectStore('cotizaciones');
            const request = objectStore.delete(id);

            request.onsuccess = () => {
                console.log('Cotización eliminada:', id);
                resolve(true);
            };

            request.onerror = () => {
                console.error('Error al eliminar cotización:', request.error);
                reject(request.error);
            };
        });
    }

    // Buscar cotizaciones por cliente
    async buscarPorCliente(nombreCliente) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Base de datos no inicializada'));
                return;
            }

            const transaction = this.db.transaction(['cotizaciones'], 'readonly');
            const objectStore = transaction.objectStore('cotizaciones');
            const request = objectStore.getAll();

            request.onsuccess = () => {
                const todas = request.result;
                const filtradas = todas.filter(cot => 
                    cot.datosCliente.nombre.toLowerCase().includes(nombreCliente.toLowerCase())
                );
                resolve(filtradas);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Generar número de folio único
    generarNumeroFolio() {
        const fecha = new Date();
        const año = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');
        const hora = String(fecha.getHours()).padStart(2, '0');
        const minuto = String(fecha.getMinutes()).padStart(2, '0');
        const segundo = String(fecha.getSeconds()).padStart(2, '0');
        
        return `COT-${año}${mes}${dia}-${hora}${minuto}${segundo}`;
    }

    // Guardar configuración
    async guardarConfiguracion(clave, valor) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Base de datos no inicializada'));
                return;
            }

            const transaction = this.db.transaction(['configuraciones'], 'readwrite');
            const objectStore = transaction.objectStore('configuraciones');
            const request = objectStore.put({ clave, valor });

            request.onsuccess = () => {
                resolve(true);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Obtener configuración
    async obtenerConfiguracion(clave) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Base de datos no inicializada'));
                return;
            }

            const transaction = this.db.transaction(['configuraciones'], 'readonly');
            const objectStore = transaction.objectStore('configuraciones');
            const request = objectStore.get(clave);

            request.onsuccess = () => {
                resolve(request.result ? request.result.valor : null);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Exportar todas las cotizaciones a JSON
    async exportarAJSON() {
        const cotizaciones = await this.obtenerTodasCotizaciones();
        return JSON.stringify(cotizaciones, null, 2);
    }

    // Importar cotizaciones desde JSON
    async importarDesdeJSON(jsonString) {
        try {
            const cotizaciones = JSON.parse(jsonString);
            const promises = cotizaciones.map(cot => {
                // Remover el ID para que se genere uno nuevo
                delete cot.id;
                return this.guardarCotizacion(cot);
            });
            await Promise.all(promises);
            return true;
        } catch (error) {
            console.error('Error al importar JSON:', error);
            throw error;
        }
    }

    // Obtener estadísticas
    async obtenerEstadisticas() {
        const cotizaciones = await this.obtenerTodasCotizaciones();
        
        const stats = {
            total: cotizaciones.length,
            totalMonto: 0,
            promedioMonto: 0,
            montoMaximo: 0,
            montoMinimo: Infinity,
            porTipoMantenimiento: {},
            cotizacionesPorMes: {}
        };

        cotizaciones.forEach(cot => {
            const monto = cot.totales?.totalGeneral || 0;
            stats.totalMonto += monto;
            
            if (monto > stats.montoMaximo) stats.montoMaximo = monto;
            if (monto < stats.montoMinimo) stats.montoMinimo = monto;

            // Contar por tipo
            const tipo = cot.datosServicio?.tipoMantenimiento || 'sin especificar';
            stats.porTipoMantenimiento[tipo] = (stats.porTipoMantenimiento[tipo] || 0) + 1;

            // Contar por mes
            const fecha = new Date(cot.fecha);
            const mesAño = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
            stats.cotizacionesPorMes[mesAño] = (stats.cotizacionesPorMes[mesAño] || 0) + 1;
        });

        stats.promedioMonto = stats.total > 0 ? stats.totalMonto / stats.total : 0;
        if (stats.montoMinimo === Infinity) stats.montoMinimo = 0;

        return stats;
    }
}

// Crear instancia global
const db = new DatabaseManager();

// Inicializar cuando cargue el DOM
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await db.init();
        console.log('Sistema de base de datos listo');
    } catch (error) {
        console.error('Error al inicializar base de datos:', error);
        alert('Error al inicializar el sistema de almacenamiento. Algunas funciones pueden no estar disponibles.');
    }
});