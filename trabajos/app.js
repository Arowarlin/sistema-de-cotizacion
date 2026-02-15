// ============================================
// APP.JS - Funciones Principales del Sistema
// VERSIÓN COMPLETA Y FUNCIONAL
// ============================================

// Variables globales
let contadorBrigada = 0;
let contadorHerramienta = 0;
let contadorMaterial = 0;
let cotizacionActual = null;

// ============================================
// FUNCIONES DE BRIGADA DE TRABAJO
// ============================================

function agregarBrigada() {
    contadorBrigada++;
    const container = document.getElementById('brigadaContainer');
    
    const item = document.createElement('div');
    item.className = 'item-dinamico brigada-item';
    item.id = `brigada-${contadorBrigada}`;
    
    item.innerHTML = `
        <button type="button" class="btn-remove" onclick="eliminarBrigada(${contadorBrigada})" title="Eliminar">
            <i class="fas fa-times"></i>
        </button>
        
        <div class="grid-2">
            <div class="form-group">
                <label>Descripción del Personal/Rol *</label>
                <input 
                    type="text" 
                    class="brigada-descripcion calc-input" 
                    placeholder="Ej: Técnico especialista"
                    required
                >
            </div>
            <div class="form-group">
                <label>Horas de Trabajo</label>
                <input 
                    type="number" 
                    class="brigada-horas calc-input" 
                    step="0.5" 
                    min="0" 
                    value="8"
                    placeholder="8"
                >
            </div>
        </div>
        
        <div class="grid-3">
            <div class="form-group">
                <label>Tarifa por Hora ($)</label>
                <input 
                    type="number" 
                    class="brigada-tarifa calc-input" 
                    step="0.01" 
                    min="0" 
                    value="0"
                    placeholder="0.00"
                >
            </div>
            <div class="form-group">
                <label>Cantidad de Personal</label>
                <input 
                    type="number" 
                    class="brigada-cantidad calc-input" 
                    min="1" 
                    value="1"
                >
            </div>
            <div class="form-group">
                <label>Subtotal</label>
                <div class="subtotal-display brigada-subtotal">$0.00</div>
            </div>
        </div>
        
        <div class="form-group">
            <label>Notas adicionales</label>
            <textarea 
                class="brigada-notas" 
                rows="2" 
                placeholder="Información adicional sobre este personal..."
            ></textarea>
        </div>
    `;
    
    container.appendChild(item);
    
    // Agregar listeners para recálculo automático
    const inputs = item.querySelectorAll('.calc-input');
    inputs.forEach(input => {
        input.addEventListener('input', () => calculator.recalcularTodo());
    });
    
    calculator.recalcularTodo();
    console.log('✅ Brigada agregada:', contadorBrigada);
}

function eliminarBrigada(id) {
    const item = document.getElementById(`brigada-${id}`);
    if (item) {
        item.remove();
        calculator.recalcularTodo();
        console.log('🗑️ Brigada eliminada:', id);
    }
}

// ============================================
// FUNCIONES DE HERRAMIENTAS Y EQUIPOS
// ============================================

function agregarHerramienta() {
    contadorHerramienta++;
    const container = document.getElementById('herramientasContainer');
    
    const item = document.createElement('div');
    item.className = 'item-dinamico herramienta-item';
    item.id = `herramienta-${contadorHerramienta}`;
    
    item.innerHTML = `
        <button type="button" class="btn-remove" onclick="eliminarHerramienta(${contadorHerramienta})" title="Eliminar">
            <i class="fas fa-times"></i>
        </button>
        
        <div class="grid-2">
            <div class="form-group">
                <label>Nombre de Herramienta/Equipo *</label>
                <input 
                    type="text" 
                    class="herramienta-nombre" 
                    placeholder="Ej: Taladro industrial"
                    required
                >
            </div>
            <div class="form-group">
                <label>Tipo de Costo</label>
                <select class="herramienta-tipo">
                    <option value="alquiler">Alquiler</option>
                    <option value="uso">Uso/Depreciación</option>
                    <option value="compra">Compra</option>
                </select>
            </div>
        </div>
        
        <div class="grid-3">
            <div class="form-group">
                <label>Costo ($)</label>
                <input 
                    type="number" 
                    class="herramienta-costo calc-input" 
                    step="0.01" 
                    min="0" 
                    value="0"
                    placeholder="0.00"
                >
            </div>
            <div class="form-group">
                <label>Cantidad/Días</label>
                <input 
                    type="number" 
                    class="herramienta-cantidad calc-input" 
                    step="0.5" 
                    min="0" 
                    value="1"
                >
            </div>
            <div class="form-group">
                <label>Subtotal</label>
                <div class="subtotal-display herramienta-subtotal">$0.00</div>
            </div>
        </div>
        
        <div class="form-group">
            <label>Notas adicionales</label>
            <textarea 
                class="herramienta-notas" 
                rows="2" 
                placeholder="Especificaciones o detalles..."
            ></textarea>
        </div>
    `;
    
    container.appendChild(item);
    
    const inputs = item.querySelectorAll('.calc-input');
    inputs.forEach(input => {
        input.addEventListener('input', () => calculator.recalcularTodo());
    });
    
    calculator.recalcularTodo();
    console.log('✅ Herramienta agregada:', contadorHerramienta);
}

function eliminarHerramienta(id) {
    const item = document.getElementById(`herramienta-${id}`);
    if (item) {
        item.remove();
        calculator.recalcularTodo();
        console.log('🗑️ Herramienta eliminada:', id);
    }
}

// ============================================
// FUNCIONES DE MATERIALES E INSUMOS
// ============================================

function agregarMaterial() {
    contadorMaterial++;
    const container = document.getElementById('materialesContainer');
    
    const item = document.createElement('div');
    item.className = 'item-dinamico material-item';
    item.id = `material-${contadorMaterial}`;
    
    item.innerHTML = `
        <button type="button" class="btn-remove" onclick="eliminarMaterial(${contadorMaterial})" title="Eliminar">
            <i class="fas fa-times"></i>
        </button>
        
        <div class="grid-2">
            <div class="form-group">
                <label>Descripción del Material/Insumo *</label>
                <input 
                    type="text" 
                    class="material-descripcion" 
                    placeholder="Ej: Tornillos M6"
                    required
                >
            </div>
            <div class="form-group">
                <label>Unidad de Medida</label>
                <select class="material-unidad">
                    <option value="pza">Pieza</option>
                    <option value="lt">Litro</option>
                    <option value="kg">Kilogramo</option>
                    <option value="m">Metro</option>
                    <option value="m2">Metro cuadrado</option>
                    <option value="caja">Caja</option>
                    <option value="galon">Galón</option>
                    <option value="otro">Otro</option>
                </select>
            </div>
        </div>
        
        <div class="grid-3">
            <div class="form-group">
                <label>Precio Unitario ($)</label>
                <input 
                    type="number" 
                    class="material-precio calc-input" 
                    step="0.01" 
                    min="0" 
                    value="0"
                    placeholder="0.00"
                >
            </div>
            <div class="form-group">
                <label>Cantidad</label>
                <input 
                    type="number" 
                    class="material-cantidad calc-input" 
                    step="0.01" 
                    min="0" 
                    value="1"
                >
            </div>
            <div class="form-group">
                <label>Subtotal</label>
                <div class="subtotal-display material-subtotal">$0.00</div>
            </div>
        </div>
        
        <div class="form-group">
            <label>Notas adicionales</label>
            <textarea 
                class="material-notas" 
                rows="2" 
                placeholder="Especificaciones técnicas..."
            ></textarea>
        </div>
    `;
    
    container.appendChild(item);
    
    const inputs = item.querySelectorAll('.calc-input');
    inputs.forEach(input => {
        input.addEventListener('input', () => calculator.recalcularTodo());
    });
    
    calculator.recalcularTodo();
    console.log('✅ Material agregado:', contadorMaterial);
}

function eliminarMaterial(id) {
    const item = document.getElementById(`material-${id}`);
    if (item) {
        item.remove();
        calculator.recalcularTodo();
        console.log('🗑️ Material eliminado:', id);
    }
}

// ============================================
// CARGAR PLANTILLA DE EJEMPLO
// ============================================

async function cargarPlantilla() {
    if (!confirm('¿Desea cargar datos de ejemplo? Esto sobrescribirá los datos actuales.')) {
        return;
    }
    
    mostrarLoading('Cargando plantilla de ejemplo...');
    
    try {
        // Datos de ejemplo
        const ejemplo = {
            datosCliente: {
                nombre: "Hotel Paradise Resort & Spa",
                contacto: "Juan Pérez Martínez",
                email: "mantenimiento@paradiseresort.com",
                telefono: "809-555-0123",
                rnc: "130-12345-6",
                direccion: "Av. Principal #123, Punta Cana, La Altagracia"
            },
            datosPrestador: {
                nombre: "Servicios Técnicos Profesionales SRL",
                responsable: "Ing. Carlos Martínez Gómez",
                email: "info@stprofesionales.com",
                telefono: "809-555-0456",
                rnc: "131-98765-4",
                direccion: "Calle Técnica #45, Zona Industrial, Santo Domingo"
            },
            datosServicio: {
                tipoMantenimiento: "mixto",
                alcanceServicio: "Mantenimiento preventivo y correctivo del sistema de climatización del hotel, incluyendo inspección de 50 unidades split, limpieza de filtros, verificación de presiones de refrigerante, y reparación de 3 unidades con fallas detectadas.",
                actividades: ["inspeccion", "limpieza", "ajustes", "reparaciones", "pruebas", "verificacion"],
                fechaInicio: "2024-03-01",
                plazoEjecucion: "5 días hábiles"
            },
            etapaTecnica: {
                honorarios: {
                    diagnostico: 500,
                    planificacion: 300,
                    supervision: 800
                },
                brigada: [
                    {
                        descripcion: "Técnico especialista en climatización",
                        horas: 40,
                        tarifa: 35,
                        cantidad: 2,
                        notas: "Certificados HVAC y 5 años de experiencia"
                    },
                    {
                        descripcion: "Ayudante técnico",
                        horas: 40,
                        tarifa: 18,
                        cantidad: 2,
                        notas: "Apoyo en trabajos de altura y logística"
                    }
                ],
                herramientas: [
                    {
                        nombre: "Manómetros digitales (2 unidades)",
                        tipo: "alquiler",
                        costo: 80,
                        cantidad: 5,
                        notas: "Alquiler por día de uso"
                    },
                    {
                        nombre: "Bomba de vacío profesional",
                        tipo: "uso",
                        costo: 150,
                        cantidad: 1,
                        notas: "Depreciación por uso"
                    },
                    {
                        nombre: "Kit de herramientas especializadas",
                        tipo: "uso",
                        costo: 75,
                        cantidad: 1,
                        notas: "Llaves torx, destornilladores de precisión"
                    }
                ],
                materiales: [
                    {
                        descripcion: "Gas refrigerante R-410A",
                        unidad: "kg",
                        precio: 85,
                        cantidad: 12,
                        notas: "Cilindro de 25 lbs certificado"
                    },
                    {
                        descripcion: "Filtros de aire (diversos tamaños)",
                        unidad: "pza",
                        precio: 15,
                        cantidad: 50,
                        notas: "Reemplazo preventivo en todas las unidades"
                    },
                    {
                        descripcion: "Aceite lubricante sintético POE",
                        unidad: "lt",
                        precio: 45,
                        cantidad: 4,
                        notas: "Para compresores scroll"
                    },
                    {
                        descripcion: "Cinta de aislar 3M",
                        unidad: "otro",
                        precio: 12,
                        cantidad: 10,
                        notas: "Rollos de alta temperatura"
                    }
                ]
            },
            etapaOperativa: {
                logistica: {
                    transporte: 350,
                    movilizacion: 200,
                    gestionAccesos: 50
                },
                documentacion: {
                    registro: 150,
                    informe: 250,
                    recomendaciones: 100
                },
                administrativos: {
                    gastosDirectos: 0,
                    porcentaje: 8
                }
            },
            imprevistos: {
                porcentaje: 10,
                notas: "Reservado para reparaciones no detectadas en inspección inicial, componentes adicionales o trabajos extras solicitados por el cliente."
            },
            condiciones: {
                vigenciaCotizacion: "30 días",
                formaPago: "50-50",
                condicionesAdicionales: "• El pago del anticipo (50%) debe realizarse antes del inicio de los trabajos.\n• La garantía cubre 90 días en mano de obra y 60 días en materiales instalados.\n• Cualquier trabajo adicional será cotizado y aprobado por el cliente antes de su ejecución.\n• Los precios no incluyen IVA (18%)."
            }
        };
        
        // Cargar datos del cliente
        document.getElementById('clienteNombre').value = ejemplo.datosCliente.nombre;
        document.getElementById('clienteContacto').value = ejemplo.datosCliente.contacto;
        document.getElementById('clienteEmail').value = ejemplo.datosCliente.email;
        document.getElementById('clienteTelefono').value = ejemplo.datosCliente.telefono;
        document.getElementById('clienteRNC').value = ejemplo.datosCliente.rnc;
        document.getElementById('clienteDireccion').value = ejemplo.datosCliente.direccion;
        
        // Cargar datos del prestador
        document.getElementById('prestadorNombre').value = ejemplo.datosPrestador.nombre;
        document.getElementById('prestadorResponsable').value = ejemplo.datosPrestador.responsable;
        document.getElementById('prestadorEmail').value = ejemplo.datosPrestador.email;
        document.getElementById('prestadorTelefono').value = ejemplo.datosPrestador.telefono;
        document.getElementById('prestadorRNC').value = ejemplo.datosPrestador.rnc;
        document.getElementById('prestadorDireccion').value = ejemplo.datosPrestador.direccion;
        
        // Cargar datos del servicio
        document.getElementById('tipoMantenimiento').value = ejemplo.datosServicio.tipoMantenimiento;
        document.getElementById('alcanceServicio').value = ejemplo.datosServicio.alcanceServicio;
        document.getElementById('fechaInicio').value = ejemplo.datosServicio.fechaInicio;
        document.getElementById('plazoEjecucion').value = ejemplo.datosServicio.plazoEjecucion;
        
        // Marcar actividades
        document.querySelectorAll('.actividad').forEach(checkbox => {
            checkbox.checked = ejemplo.datosServicio.actividades.includes(checkbox.value);
        });
        
        // Cargar honorarios
        document.getElementById('honorariosDiagnostico').value = ejemplo.etapaTecnica.honorarios.diagnostico;
        document.getElementById('honorariosPlanificacion').value = ejemplo.etapaTecnica.honorarios.planificacion;
        document.getElementById('honorariosSupervision').value = ejemplo.etapaTecnica.honorarios.supervision;
        
        // Limpiar y cargar brigada
        document.getElementById('brigadaContainer').innerHTML = '';
        contadorBrigada = 0;
        ejemplo.etapaTecnica.brigada.forEach(item => {
            agregarBrigada();
            const lastItem = document.querySelector('.brigada-item:last-child');
            lastItem.querySelector('.brigada-descripcion').value = item.descripcion;
            lastItem.querySelector('.brigada-horas').value = item.horas;
            lastItem.querySelector('.brigada-tarifa').value = item.tarifa;
            lastItem.querySelector('.brigada-cantidad').value = item.cantidad;
            lastItem.querySelector('.brigada-notas').value = item.notas;
        });
        
        // Limpiar y cargar herramientas
        document.getElementById('herramientasContainer').innerHTML = '';
        contadorHerramienta = 0;
        ejemplo.etapaTecnica.herramientas.forEach(item => {
            agregarHerramienta();
            const lastItem = document.querySelector('.herramienta-item:last-child');
            lastItem.querySelector('.herramienta-nombre').value = item.nombre;
            lastItem.querySelector('.herramienta-tipo').value = item.tipo;
            lastItem.querySelector('.herramienta-costo').value = item.costo;
            lastItem.querySelector('.herramienta-cantidad').value = item.cantidad;
            lastItem.querySelector('.herramienta-notas').value = item.notas;
        });
        
        // Limpiar y cargar materiales
        document.getElementById('materialesContainer').innerHTML = '';
        contadorMaterial = 0;
        ejemplo.etapaTecnica.materiales.forEach(item => {
            agregarMaterial();
            const lastItem = document.querySelector('.material-item:last-child');
            lastItem.querySelector('.material-descripcion').value = item.descripcion;
            lastItem.querySelector('.material-unidad').value = item.unidad;
            lastItem.querySelector('.material-precio').value = item.precio;
            lastItem.querySelector('.material-cantidad').value = item.cantidad;
            lastItem.querySelector('.material-notas').value = item.notas;
        });
        
        // Cargar logística
        document.getElementById('costoTransporte').value = ejemplo.etapaOperativa.logistica.transporte;
        document.getElementById('costoMovilizacion').value = ejemplo.etapaOperativa.logistica.movilizacion;
        document.getElementById('costoGestionAccesos').value = ejemplo.etapaOperativa.logistica.gestionAccesos;
        
        // Cargar documentación
        document.getElementById('costoRegistroActividades').value = ejemplo.etapaOperativa.documentacion.registro;
        document.getElementById('costoInformeTecnico').value = ejemplo.etapaOperativa.documentacion.informe;
        document.getElementById('costoRecomendaciones').value = ejemplo.etapaOperativa.documentacion.recomendaciones;
        
        // Cargar administrativos
        document.getElementById('gastosAdministrativos').value = ejemplo.etapaOperativa.administrativos.gastosDirectos;
        document.getElementById('porcentajeAdministrativo').value = ejemplo.etapaOperativa.administrativos.porcentaje;
        
        // Cargar imprevistos
        document.getElementById('porcentajeImprevistos').value = ejemplo.imprevistos.porcentaje;
        document.getElementById('notasImprevistos').value = ejemplo.imprevistos.notas;
        
        // Cargar condiciones
        document.getElementById('vigenciaCotizacion').value = ejemplo.condiciones.vigenciaCotizacion;
        document.getElementById('formaPago').value = ejemplo.condiciones.formaPago;
        document.getElementById('condicionesAdicionales').value = ejemplo.condiciones.condicionesAdicionales;
        
        // Recalcular todo
        calculator.recalcularTodo();
        
        // Actualizar progreso
        if (typeof actualizarProgreso === 'function') {
            actualizarProgreso();
        }
        
        setTimeout(() => {
            ocultarLoading();
            mostrarToast('Plantilla de ejemplo cargada exitosamente', 'success', '¡Listo!');
        }, 1000);
        
    } catch (error) {
        console.error('Error al cargar plantilla:', error);
        ocultarLoading();
        mostrarToast('Error al cargar la plantilla: ' + error.message, 'error');
    }
}

// ============================================
// LIMPIAR FORMULARIO
// ============================================

function limpiarFormulario() {
    if (!confirm('¿Está seguro de limpiar todos los datos? Esta acción no se puede deshacer.')) {
        return;
    }
    
    mostrarLoading('Limpiando formulario...');
    
    setTimeout(() => {
        // Limpiar inputs
        document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="number"], input[type="date"], textarea').forEach(input => {
            if (input.id !== 'vigenciaCotizacion' && input.id !== 'porcentajeImprevistos') {
                input.value = '';
            }
        });
        
        // Limpiar selects
        document.querySelectorAll('select').forEach(select => {
            select.selectedIndex = 0;
        });
        
        // Limpiar checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Limpiar items dinámicos
        document.getElementById('brigadaContainer').innerHTML = '';
        document.getElementById('herramientasContainer').innerHTML = '';
        document.getElementById('materialesContainer').innerHTML = '';
        
        contadorBrigada = 0;
        contadorHerramienta = 0;
        contadorMaterial = 0;
        
        // Agregar items iniciales
        agregarBrigada();
        agregarHerramienta();
        agregarMaterial();
        
        calculator.recalcularTodo();
        
        if (typeof actualizarProgreso === 'function') {
            actualizarProgreso();
        }
        
        ocultarLoading();
        mostrarToast('Formulario limpiado correctamente', 'success');
    }, 500);
}

// ============================================
// GUARDAR BORRADOR
// ============================================

async function guardarBorrador() {
    mostrarLoading('Guardando borrador...');
    
    try {
        const borrador = {
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
                plazoEjecucion: document.getElementById('plazoEjecucion')?.value || ''
            },
            fecha: new Date().toISOString(),
            tipo: 'borrador'
        };
        
        localStorage.setItem('borrador_cotizacion', JSON.stringify(borrador));
        
        setTimeout(() => {
            ocultarLoading();
            mostrarToast('Borrador guardado en este dispositivo', 'success');
        }, 500);
        
    } catch (error) {
        console.error('Error al guardar borrador:', error);
        ocultarLoading();
        mostrarToast('Error al guardar el borrador', 'error');
    }
}

// ============================================
// GENERAR PDF (Placeholder)
// ============================================

function generarPDF() {
    mostrarToast('Función de generación de PDF en desarrollo', 'info', 'Próximamente');
}

// ============================================
// HISTORIAL (Placeholder)
// ============================================

function mostrarHistorial() {
    mostrarToast('Función de historial en desarrollo', 'info', 'Próximamente');
}

function cerrarHistorial() {
    const modal = document.getElementById('modalHistorial');
    if (modal) {
        modal.classList.remove('active');
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 app.js cargado correctamente');
    
    // Agregar items iniciales si los containers están vacíos
    if (document.getElementById('brigadaContainer').children.length === 0) {
        agregarBrigada();
    }
    if (document.getElementById('herramientasContainer').children.length === 0) {
        agregarHerramienta();
    }
    if (document.getElementById('materialesContainer').children.length === 0) {
        agregarMaterial();
    }
    
    console.log('✅ Items iniciales agregados');
});