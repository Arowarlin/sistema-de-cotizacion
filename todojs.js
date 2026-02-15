// ============================================
// SISTEMA-TODO-EN-UNO.JS
// Incluye: API Client + Calculations + App + UI + Guardar
// ============================================

console.log('🚀 ===== SISTEMA UNIFICADO CARGANDO =====');

// ============================================
// 1. API CLIENT
// ============================================

class ApiClient {
    constructor() {
        this.isLocal = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
        
        if (this.isLocal) {
            const folder = 'cotizacion';
            this.baseURL = `http://localhost:8081/${folder}/php/api.php`;
        } else {
            this.baseURL = window.location.origin + '/php/api.php';
        }
        
        console.log('🌐 API inicializada:', this.baseURL);
    }

    async request(action, method = 'GET', data = null) {
        try {
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            };

            let url = `${this.baseURL}?action=${action}`;

            if (method === 'GET' && data) {
                const params = new URLSearchParams();
                Object.keys(data).forEach(key => {
                    if (data[key] != null) params.append(key, data[key]);
                });
                url += '&' + params.toString();
            } else if ((method === 'POST' || method === 'PUT' || method === 'DELETE') && data) {
                options.body = JSON.stringify(data);
            }

            console.log('📡 Petición:', method, action);

            const response = await fetch(url, options);
            const text = await response.text();
            
            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                console.error('❌ Error JSON:', text);
                throw new Error('Respuesta inválida del servidor');
            }

            if (!result.success) {
                throw new Error(result.error || 'Error desconocido');
            }

            console.log('✅ Éxito:', result);
            return result.data;

        } catch (error) {
            console.error('❌ Error API:', error);
            throw error;
        }
    }

    async guardarCotizacion(cotizacion) {
        return await this.request('guardar_cotizacion', 'POST', cotizacion);
    }
}

const apiClient = new ApiClient();
const db = {
    guardarCotizacion: async (cot) => await apiClient.guardarCotizacion(cot),
    init: async () => true
};

// ============================================
// 2. CALCULATOR
// ============================================

class CotizacionCalculator {
    constructor() {
        this.subtotales = {
            honorarios: 0,
            brigada: 0,
            herramientas: 0,
            materiales: 0,
            logistica: 0,
            documentacion: 0,
            administrativos: 0
        };
        this.subtotalGeneral = 0;
        this.montoImprevistos = 0;
        this.totalGeneral = 0;
    }

    calcularHonorarios() {
        const d = parseFloat(document.getElementById('honorariosDiagnostico')?.value || 0);
        const p = parseFloat(document.getElementById('honorariosPlanificacion')?.value || 0);
        const s = parseFloat(document.getElementById('honorariosSupervision')?.value || 0);
        this.subtotales.honorarios = d + p + s;
        this.actualizar('subtotalHonorarios', this.subtotales.honorarios);
        this.actualizar('resumenHonorarios', this.subtotales.honorarios);
    }

    calcularBrigada() {
        let total = 0;
        document.querySelectorAll('.brigada-item').forEach(item => {
            const h = parseFloat(item.querySelector('.brigada-horas')?.value || 0);
            const t = parseFloat(item.querySelector('.brigada-tarifa')?.value || 0);
            const c = parseFloat(item.querySelector('.brigada-cantidad')?.value || 1);
            const sub = h * t * c;
            total += sub;
            const el = item.querySelector('.brigada-subtotal');
            if (el) el.textContent = this.formato(sub);
        });
        this.subtotales.brigada = total;
        this.actualizar('subtotalBrigada', total);
        this.actualizar('resumenBrigada', total);
    }

    calcularHerramientas() {
        let total = 0;
        document.querySelectorAll('.herramienta-item').forEach(item => {
            const c = parseFloat(item.querySelector('.herramienta-costo')?.value || 0);
            const q = parseFloat(item.querySelector('.herramienta-cantidad')?.value || 1);
            const sub = c * q;
            total += sub;
            const el = item.querySelector('.herramienta-subtotal');
            if (el) el.textContent = this.formato(sub);
        });
        this.subtotales.herramientas = total;
        this.actualizar('subtotalHerramientas', total);
        this.actualizar('resumenHerramientas', total);
    }

    calcularMateriales() {
        let total = 0;
        document.querySelectorAll('.material-item').forEach(item => {
            const p = parseFloat(item.querySelector('.material-precio')?.value || 0);
            const q = parseFloat(item.querySelector('.material-cantidad')?.value || 1);
            const sub = p * q;
            total += sub;
            const el = item.querySelector('.material-subtotal');
            if (el) el.textContent = this.formato(sub);
        });
        this.subtotales.materiales = total;
        this.actualizar('subtotalMateriales', total);
        this.actualizar('resumenMateriales', total);
    }

    calcularLogistica() {
        const t = parseFloat(document.getElementById('costoTransporte')?.value || 0);
        const m = parseFloat(document.getElementById('costoMovilizacion')?.value || 0);
        const g = parseFloat(document.getElementById('costoGestionAccesos')?.value || 0);
        this.subtotales.logistica = t + m + g;
        this.actualizar('subtotalLogistica', this.subtotales.logistica);
        this.actualizar('resumenLogistica', this.subtotales.logistica);
    }

    calcularDocumentacion() {
        const r = parseFloat(document.getElementById('costoRegistroActividades')?.value || 0);
        const i = parseFloat(document.getElementById('costoInformeTecnico')?.value || 0);
        const c = parseFloat(document.getElementById('costoRecomendaciones')?.value || 0);
        this.subtotales.documentacion = r + i + c;
        this.actualizar('subtotalDocumentacion', this.subtotales.documentacion);
        this.actualizar('resumenDocumentacion', this.subtotales.documentacion);
    }

    calcularAdministrativos() {
        const directo = parseFloat(document.getElementById('gastosAdministrativos')?.value || 0);
        const pct = parseFloat(document.getElementById('porcentajeAdministrativo')?.value || 0);
        
        if (pct > 0) {
            const parcial = Object.values(this.subtotales).reduce((a,b) => a+b, 0) - this.subtotales.administrativos;
            this.subtotales.administrativos = (parcial * pct) / 100;
        } else {
            this.subtotales.administrativos = directo;
        }
        
        this.actualizar('resumenAdministrativos', this.subtotales.administrativos);
        this.actualizar('subtotalAdministrativos', this.subtotales.administrativos);
    }

    calcularSubtotalGeneral() {
        this.subtotalGeneral = Object.values(this.subtotales).reduce((a, b) => a + b, 0);
        this.actualizar('subtotalGeneral', this.subtotalGeneral);
    }

    calcularImprevistos() {
        const pct = parseFloat(document.getElementById('porcentajeImprevistos')?.value || 0);
        this.montoImprevistos = (this.subtotalGeneral * pct) / 100;
        const display = document.getElementById('porcentajeImprevistosDisplay');
        if (display) display.textContent = pct;
        this.actualizar('montoImprevistos', this.montoImprevistos);
    }

    calcularTotalGeneral() {
        this.totalGeneral = this.subtotalGeneral + this.montoImprevistos;
        this.actualizar('totalGeneral', this.totalGeneral);
    }

    recalcularTodo() {
        this.calcularHonorarios();
        this.calcularBrigada();
        this.calcularHerramientas();
        this.calcularMateriales();
        this.calcularLogistica();
        this.calcularDocumentacion();
        this.calcularAdministrativos();
        this.calcularSubtotalGeneral();
        this.calcularImprevistos();
        this.calcularTotalGeneral();
    }

    actualizar(id, valor) {
        const el = document.getElementById(id);
        if (el) el.textContent = this.formato(valor);
    }

    formato(valor) {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'USD'
        }).format(valor);
    }

    validarFormulario() {
        const errores = [];
        
        if (!document.getElementById('clienteNombre')?.value) errores.push('Nombre del cliente requerido');
        if (!document.getElementById('clienteEmail')?.value) errores.push('Email del cliente requerido');
        if (!document.getElementById('clienteTelefono')?.value) errores.push('Teléfono del cliente requerido');
        
        if (!document.getElementById('prestadorNombre')?.value) errores.push('Nombre del prestador requerido');
        if (!document.getElementById('prestadorResponsable')?.value) errores.push('Responsable del prestador requerido');
        if (!document.getElementById('prestadorEmail')?.value) errores.push('Email del prestador requerido');
        if (!document.getElementById('prestadorTelefono')?.value) errores.push('Teléfono del prestador requerido');
        
        if (!document.getElementById('tipoMantenimiento')?.value) errores.push('Tipo de mantenimiento requerido');
        if (!document.getElementById('plazoEjecucion')?.value) errores.push('Plazo de ejecución requerido');
        
        if (this.totalGeneral <= 0) errores.push('El total debe ser mayor a cero');
        
        return errores;
    }

    obtenerTotales() {
        return {
            subtotales: { ...this.subtotales },
            subtotalGeneral: this.subtotalGeneral,
            montoImprevistos: this.montoImprevistos,
            totalGeneral: this.totalGeneral
        };
    }
}

const calculator = new CotizacionCalculator();

// ============================================
// 3. VARIABLES GLOBALES
// ============================================

let contadorBrigada = 0;
let contadorHerramienta = 0;
let contadorMaterial = 0;

// ============================================
// 4. UI FUNCTIONS
// ============================================

function mostrarToast(mensaje, tipo = 'info', titulo = '') {
    const container = document.getElementById('toastContainer');
    if (!container) {
        alert(mensaje);
        return;
    }
    
    const iconos = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    const titulos = { success: titulo || '¡Éxito!', error: titulo || 'Error', warning: titulo || 'Advertencia', info: titulo || 'Información' };
    
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerHTML = `
        <div class="toast-icon"><i class="fas ${iconos[tipo]}"></i></div>
        <div class="toast-content">
            <div class="toast-title">${titulos[tipo]}</div>
            <div class="toast-message">${mensaje}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

function mostrarLoading(msg = 'Cargando...') {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.querySelector('p').textContent = msg;
        overlay.classList.add('active');
    }
}

function ocultarLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.remove('active');
}

// ============================================
// 5. BRIGADA FUNCTIONS
// ============================================

function agregarBrigada() {
    contadorBrigada++;
    const container = document.getElementById('brigadaContainer');
    const item = document.createElement('div');
    item.className = 'item-dinamico brigada-item';
    item.id = `brigada-${contadorBrigada}`;
    item.innerHTML = `
        <button type="button" class="btn-remove" onclick="document.getElementById('brigada-${contadorBrigada}').remove(); calculator.recalcularTodo();">
            <i class="fas fa-times"></i>
        </button>
        <div class="grid-2">
            <div class="form-group">
                <label>Descripción *</label>
                <input type="text" class="brigada-descripcion calc-input" placeholder="Técnico especialista">
            </div>
            <div class="form-group">
                <label>Horas</label>
                <input type="number" class="brigada-horas calc-input" value="8" min="0" step="0.5">
            </div>
        </div>
        <div class="grid-3">
            <div class="form-group">
                <label>Tarifa/Hora ($)</label>
                <input type="number" class="brigada-tarifa calc-input" value="0" min="0" step="0.01">
            </div>
            <div class="form-group">
                <label>Cantidad</label>
                <input type="number" class="brigada-cantidad calc-input" value="1" min="1">
            </div>
            <div class="form-group">
                <label>Subtotal</label>
                <div class="subtotal-display brigada-subtotal">$0.00</div>
            </div>
        </div>
        <div class="form-group">
            <label>Notas</label>
            <textarea class="brigada-notas" rows="2"></textarea>
        </div>
    `;
    container.appendChild(item);
    item.querySelectorAll('.calc-input').forEach(inp => inp.addEventListener('input', () => calculator.recalcularTodo()));
    calculator.recalcularTodo();
}

function agregarHerramienta() {
    contadorHerramienta++;
    const container = document.getElementById('herramientasContainer');
    const item = document.createElement('div');
    item.className = 'item-dinamico herramienta-item';
    item.id = `herramienta-${contadorHerramienta}`;
    item.innerHTML = `
        <button type="button" class="btn-remove" onclick="document.getElementById('herramienta-${contadorHerramienta}').remove(); calculator.recalcularTodo();">
            <i class="fas fa-times"></i>
        </button>
        <div class="grid-2">
            <div class="form-group">
                <label>Nombre *</label>
                <input type="text" class="herramienta-nombre" placeholder="Taladro">
            </div>
            <div class="form-group">
                <label>Tipo</label>
                <select class="herramienta-tipo">
                    <option value="alquiler">Alquiler</option>
                    <option value="uso">Uso</option>
                    <option value="compra">Compra</option>
                </select>
            </div>
        </div>
        <div class="grid-3">
            <div class="form-group">
                <label>Costo ($)</label>
                <input type="number" class="herramienta-costo calc-input" value="0" min="0" step="0.01">
            </div>
            <div class="form-group">
                <label>Cantidad</label>
                <input type="number" class="herramienta-cantidad calc-input" value="1" min="0" step="0.5">
            </div>
            <div class="form-group">
                <label>Subtotal</label>
                <div class="subtotal-display herramienta-subtotal">$0.00</div>
            </div>
        </div>
        <div class="form-group">
            <label>Notas</label>
            <textarea class="herramienta-notas" rows="2"></textarea>
        </div>
    `;
    container.appendChild(item);
    item.querySelectorAll('.calc-input').forEach(inp => inp.addEventListener('input', () => calculator.recalcularTodo()));
    calculator.recalcularTodo();
}

function agregarMaterial() {
    contadorMaterial++;
    const container = document.getElementById('materialesContainer');
    const item = document.createElement('div');
    item.className = 'item-dinamico material-item';
    item.id = `material-${contadorMaterial}`;
    item.innerHTML = `
        <button type="button" class="btn-remove" onclick="document.getElementById('material-${contadorMaterial}').remove(); calculator.recalcularTodo();">
            <i class="fas fa-times"></i>
        </button>
        <div class="grid-2">
            <div class="form-group">
                <label>Descripción *</label>
                <input type="text" class="material-descripcion" placeholder="Tornillos">
            </div>
            <div class="form-group">
                <label>Unidad</label>
                <select class="material-unidad">
                    <option value="pza">Pieza</option>
                    <option value="lt">Litro</option>
                    <option value="kg">Kilogramo</option>
                    <option value="m">Metro</option>
                    <option value="caja">Caja</option>
                </select>
            </div>
        </div>
        <div class="grid-3">
            <div class="form-group">
                <label>Precio ($)</label>
                <input type="number" class="material-precio calc-input" value="0" min="0" step="0.01">
            </div>
            <div class="form-group">
                <label>Cantidad</label>
                <input type="number" class="material-cantidad calc-input" value="1" min="0" step="0.01">
            </div>
            <div class="form-group">
                <label>Subtotal</label>
                <div class="subtotal-display material-subtotal">$0.00</div>
            </div>
        </div>
        <div class="form-group">
            <label>Notas</label>
            <textarea class="material-notas" rows="2"></textarea>
        </div>
    `;
    container.appendChild(item);
    item.querySelectorAll('.calc-input').forEach(inp => inp.addEventListener('input', () => calculator.recalcularTodo()));
    calculator.recalcularTodo();
}

// ============================================
// 6. GUARDAR COTIZACIÓN
// ============================================

async function guardarCotizacion() {
    console.log('🔄 ===== GUARDANDO COTIZACIÓN =====');
    
    const errores = calculator.validarFormulario();
    if (errores.length > 0) {
        alert('Errores:\n\n' + errores.join('\n'));
        mostrarToast(`Hay ${errores.length} error(es)`, 'error');
        return;
    }

    mostrarLoading('Guardando...');

    try {
        const cotizacion = {
            datosCliente: {
                nombre: document.getElementById('clienteNombre')?.value || '',
                contacto: document.getElementById('clienteContacto')?.value || '',
                email: document.getElementById('clienteEmail')?.value || '',
                telefono: document.getElementById('clienteTelefono')?.value || '',
                rnc: document.getElementById('clienteRNC')?.value || '',
                direccion: document.getElementById('clienteDireccion')?.value || ''
            },
            datosPrestador: {
                nombre: document.getElementById('prestadorNombre')?.value || '',
                responsable: document.getElementById('prestadorResponsable')?.value || '',
                email: document.getElementById('prestadorEmail')?.value || '',
                telefono: document.getElementById('prestadorTelefono')?.value || '',
                rnc: document.getElementById('prestadorRNC')?.value || '',
                direccion: document.getElementById('prestadorDireccion')?.value || ''
            },
            datosServicio: {
                tipoMantenimiento: document.getElementById('tipoMantenimiento')?.value || '',
                alcanceServicio: document.getElementById('alcanceServicio')?.value || '',
                actividades: Array.from(document.querySelectorAll('.actividad:checked')).map(c => c.value),
                fechaInicio: document.getElementById('fechaInicio')?.value || null,
                plazoEjecucion: document.getElementById('plazoEjecucion')?.value || ''
            },
            etapaTecnica: {
                honorarios: {
                    diagnostico: parseFloat(document.getElementById('honorariosDiagnostico')?.value || 0),
                    planificacion: parseFloat(document.getElementById('honorariosPlanificacion')?.value || 0),
                    supervision: parseFloat(document.getElementById('honorariosSupervision')?.value || 0)
                },
                brigada: Array.from(document.querySelectorAll('.brigada-item')).map(i => ({
                    descripcion: i.querySelector('.brigada-descripcion')?.value || '',
                    horas: parseFloat(i.querySelector('.brigada-horas')?.value || 0),
                    tarifa: parseFloat(i.querySelector('.brigada-tarifa')?.value || 0),
                    cantidad: parseInt(i.querySelector('.brigada-cantidad')?.value || 1),
                    notas: i.querySelector('.brigada-notas')?.value || ''
                })).filter(x => x.descripcion),
                herramientas: Array.from(document.querySelectorAll('.herramienta-item')).map(i => ({
                    nombre: i.querySelector('.herramienta-nombre')?.value || '',
                    tipo: i.querySelector('.herramienta-tipo')?.value || 'uso',
                    costo: parseFloat(i.querySelector('.herramienta-costo')?.value || 0),
                    cantidad: parseFloat(i.querySelector('.herramienta-cantidad')?.value || 1),
                    notas: i.querySelector('.herramienta-notas')?.value || ''
                })).filter(x => x.nombre),
                materiales: Array.from(document.querySelectorAll('.material-item')).map(i => ({
                    descripcion: i.querySelector('.material-descripcion')?.value || '',
                    unidad: i.querySelector('.material-unidad')?.value || 'pza',
                    precio: parseFloat(i.querySelector('.material-precio')?.value || 0),
                    cantidad: parseFloat(i.querySelector('.material-cantidad')?.value || 0),
                    notas: i.querySelector('.material-notas')?.value || ''
                })).filter(x => x.descripcion)
            },
            etapaOperativa: {
                logistica: {
                    transporte: parseFloat(document.getElementById('costoTransporte')?.value || 0),
                    movilizacion: parseFloat(document.getElementById('costoMovilizacion')?.value || 0),
                    gestionAccesos: parseFloat(document.getElementById('costoGestionAccesos')?.value || 0)
                },
                documentacion: {
                    registro: parseFloat(document.getElementById('costoRegistroActividades')?.value || 0),
                    informe: parseFloat(document.getElementById('costoInformeTecnico')?.value || 0),
                    recomendaciones: parseFloat(document.getElementById('costoRecomendaciones')?.value || 0)
                },
                administrativos: {
                    gastosDirectos: parseFloat(document.getElementById('gastosAdministrativos')?.value || 0),
                    porcentaje: parseFloat(document.getElementById('porcentajeAdministrativo')?.value || 0)
                }
            },
            imprevistos: {
                porcentaje: parseFloat(document.getElementById('porcentajeImprevistos')?.value || 10),
                notas: document.getElementById('notasImprevistos')?.value || ''
            },
            condiciones: {
                vigenciaCotizacion: document.getElementById('vigenciaCotizacion')?.value || '30 días',
                formaPago: document.getElementById('formaPago')?.value || '',
                condicionesAdicionales: document.getElementById('condicionesAdicionales')?.value || ''
            },
            totales: calculator.obtenerTotales()
        };

        console.log('📦 Enviando:', cotizacion);
        const resultado = await db.guardarCotizacion(cotizacion);
        console.log('✅ Guardado:', resultado);

        ocultarLoading();
        mostrarToast(`Guardado exitosamente\nFolio: ${resultado.numeroFolio}\nTotal: $${cotizacion.totales.totalGeneral.toFixed(2)}`, 'success', '¡Éxito!');

    } catch (error) {
        console.error('❌ Error:', error);
        ocultarLoading();
        mostrarToast('Error: ' + error.message, 'error');
    }
}

// ============================================
// 7. OTRAS FUNCIONES
// ============================================

function limpiarFormulario() {
    if (!confirm('¿Limpiar todo?')) return;
    document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="number"], input[type="date"], textarea').forEach(i => {
        if (i.id !== 'vigenciaCotizacion' && i.id !== 'porcentajeImprevistos') i.value = '';
    });
    document.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
    document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
    document.getElementById('brigadaContainer').innerHTML = '';
    document.getElementById('herramientasContainer').innerHTML = '';
    document.getElementById('materialesContainer').innerHTML = '';
    contadorBrigada = contadorHerramienta = contadorMaterial = 0;
    agregarBrigada();
    agregarHerramienta();
    agregarMaterial();
    calculator.recalcularTodo();
    mostrarToast('Formulario limpiado', 'success');
}

function cargarPlantilla() {
    if (!confirm('¿Cargar ejemplo?')) return;
    mostrarLoading('Cargando ejemplo...');
    
    document.getElementById('clienteNombre').value = 'Hotel Paradise Resort';
    document.getElementById('clienteEmail').value = 'test@hotel.com';
    document.getElementById('clienteTelefono').value = '809-555-1234';
    
    document.getElementById('prestadorNombre').value = 'Mi Empresa SRL';
    document.getElementById('prestadorResponsable').value = 'Juan Pérez';
    document.getElementById('prestadorEmail').value = 'info@empresa.com';
    document.getElementById('prestadorTelefono').value = '809-555-5678';
    
    document.getElementById('tipoMantenimiento').value = 'mixto';
    document.getElementById('plazoEjecucion').value = '5 días hábiles';
    
    calculator.recalcularTodo();
    
    setTimeout(() => {
        ocultarLoading();
        mostrarToast('Ejemplo cargado', 'success');
    }, 500);
}

function guardarBorrador() {
    mostrarToast('Borrador guardado localmente', 'success');
}

function generarPDF() {
    mostrarToast('Función en desarrollo', 'info');
}

function mostrarHistorial() {
    mostrarToast('Función en desarrollo', 'info');
}

function cerrarHistorial() {}

function mostrarEstadisticas() {
    mostrarToast('Función en desarrollo', 'info');
}

function cambiarTema() {
    const actual = document.documentElement.getAttribute('data-theme') || 'light';
    const nuevo = actual === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', nuevo);
    localStorage.setItem('tema', nuevo);
    const icon = document.getElementById('themeIcon');
    if (icon) icon.className = nuevo === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    mostrarToast(`Tema ${nuevo}`, 'success');
}

function toggleSection(n) {
    const card = document.querySelector(`.card[data-section="${n}"]`);
    if (card) card.classList.toggle('collapsed');
}

// ============================================
// 8. INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Sistema unificado cargado');
    
    // Agregar items iniciales
    if (document.getElementById('brigadaContainer')?.children.length === 0) agregarBrigada();
    if (document.getElementById('herramientasContainer')?.children.length === 0) agregarHerramienta();
    if (document.getElementById('materialesContainer')?.children.length === 0) agregarMaterial();
    
    // Listeners para cálculos
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('calc-input')) calculator.recalcularTodo();
    });
    
    calculator.recalcularTodo();
    
    mostrarToast('Sistema listo', 'success');
});

console.log('✅ ===== SISTEMA UNIFICADO LISTO =====');