// ============================================
// CALCULATIONS.JS - Lógica de Cálculos y Validaciones
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

    // Calcular honorarios técnicos
    calcularHonorarios() {
        const diagnostico = parseFloat(document.getElementById('honorariosDiagnostico')?.value || 0);
        const planificacion = parseFloat(document.getElementById('honorariosPlanificacion')?.value || 0);
        const supervision = parseFloat(document.getElementById('honorariosSupervision')?.value || 0);

        this.subtotales.honorarios = diagnostico + planificacion + supervision;
        this.actualizarSubtotal('subtotalHonorarios', this.subtotales.honorarios);
        this.actualizarSubtotal('resumenHonorarios', this.subtotales.honorarios);
    }

    // Calcular brigada de trabajo
    calcularBrigada() {
        let total = 0;
        const items = document.querySelectorAll('.brigada-item');
        
        items.forEach(item => {
            const horas = parseFloat(item.querySelector('.brigada-horas')?.value || 0);
            const tarifa = parseFloat(item.querySelector('.brigada-tarifa')?.value || 0);
            const cantidad = parseFloat(item.querySelector('.brigada-cantidad')?.value || 1);
            
            const subtotal = horas * tarifa * cantidad;
            total += subtotal;
            
            const subtotalElement = item.querySelector('.brigada-subtotal');
            if (subtotalElement) {
                subtotalElement.textContent = this.formatearMoneda(subtotal);
            }
        });

        this.subtotales.brigada = total;
        this.actualizarSubtotal('subtotalBrigada', total);
        this.actualizarSubtotal('resumenBrigada', total);
    }

    // Calcular herramientas y equipos
    calcularHerramientas() {
        let total = 0;
        const items = document.querySelectorAll('.herramienta-item');
        
        items.forEach(item => {
            const costo = parseFloat(item.querySelector('.herramienta-costo')?.value || 0);
            const cantidad = parseFloat(item.querySelector('.herramienta-cantidad')?.value || 1);
            
            const subtotal = costo * cantidad;
            total += subtotal;
            
            const subtotalElement = item.querySelector('.herramienta-subtotal');
            if (subtotalElement) {
                subtotalElement.textContent = this.formatearMoneda(subtotal);
            }
        });

        this.subtotales.herramientas = total;
        this.actualizarSubtotal('subtotalHerramientas', total);
        this.actualizarSubtotal('resumenHerramientas', total);
    }

    // Calcular materiales e insumos
    calcularMateriales() {
        let total = 0;
        const items = document.querySelectorAll('.material-item');
        
        items.forEach(item => {
            const precio = parseFloat(item.querySelector('.material-precio')?.value || 0);
            const cantidad = parseFloat(item.querySelector('.material-cantidad')?.value || 1);
            
            const subtotal = precio * cantidad;
            total += subtotal;
            
            const subtotalElement = item.querySelector('.material-subtotal');
            if (subtotalElement) {
                subtotalElement.textContent = this.formatearMoneda(subtotal);
            }
        });

        this.subtotales.materiales = total;
        this.actualizarSubtotal('subtotalMateriales', total);
        this.actualizarSubtotal('resumenMateriales', total);
    }

    // Calcular logística
    calcularLogistica() {
        const transporte = parseFloat(document.getElementById('costoTransporte')?.value || 0);
        const movilizacion = parseFloat(document.getElementById('costoMovilizacion')?.value || 0);
        const gestionAccesos = parseFloat(document.getElementById('costoGestionAccesos')?.value || 0);

        this.subtotales.logistica = transporte + movilizacion + gestionAccesos;
        this.actualizarSubtotal('subtotalLogistica', this.subtotales.logistica);
        this.actualizarSubtotal('resumenLogistica', this.subtotales.logistica);
    }

    // Calcular documentación
    calcularDocumentacion() {
        const registro = parseFloat(document.getElementById('costoRegistroActividades')?.value || 0);
        const informe = parseFloat(document.getElementById('costoInformeTecnico')?.value || 0);
        const recomendaciones = parseFloat(document.getElementById('costoRecomendaciones')?.value || 0);

        this.subtotales.documentacion = registro + informe + recomendaciones;
        this.actualizarSubtotal('subtotalDocumentacion', this.subtotales.documentacion);
        this.actualizarSubtotal('resumenDocumentacion', this.subtotales.documentacion);
    }

    // Calcular gastos administrativos
    calcularAdministrativos() {
        const gastosDirectos = parseFloat(document.getElementById('gastosAdministrativos')?.value || 0);
        const porcentaje = parseFloat(document.getElementById('porcentajeAdministrativo')?.value || 0);

        // Si hay porcentaje, calcular sobre el subtotal parcial
        if (porcentaje > 0) {
            const subtotalParcial = this.subtotales.honorarios + 
                                   this.subtotales.brigada + 
                                   this.subtotales.herramientas + 
                                   this.subtotales.materiales + 
                                   this.subtotales.logistica + 
                                   this.subtotales.documentacion;
            
            this.subtotales.administrativos = (subtotalParcial * porcentaje) / 100;
        } else {
            this.subtotales.administrativos = gastosDirectos;
        }

        this.actualizarSubtotal('resumenAdministrativos', this.subtotales.administrativos);
    }

    // Calcular subtotal general
    calcularSubtotalGeneral() {
        this.subtotalGeneral = Object.values(this.subtotales).reduce((a, b) => a + b, 0);
        this.actualizarSubtotal('subtotalGeneral', this.subtotalGeneral);
    }

    // Calcular imprevistos
    calcularImprevistos() {
        const porcentaje = parseFloat(document.getElementById('porcentajeImprevistos')?.value || 0);
        this.montoImprevistos = (this.subtotalGeneral * porcentaje) / 100;
        
        document.getElementById('porcentajeImprevistosDisplay').textContent = porcentaje;
        this.actualizarSubtotal('montoImprevistos', this.montoImprevistos);
    }

    // Calcular total general
    calcularTotalGeneral() {
        this.totalGeneral = this.subtotalGeneral + this.montoImprevistos;
        this.actualizarSubtotal('totalGeneral', this.totalGeneral);
    }

    // Recalcular todo
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

    // Actualizar subtotal en el DOM
    actualizarSubtotal(elementId, valor) {
        const elemento = document.getElementById(elementId);
        if (elemento) {
            elemento.textContent = this.formatearMoneda(valor);
        }
    }

    // Formatear moneda
    formatearMoneda(valor) {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(valor);
    }

    // Validar formulario completo
    validarFormulario() {
        const errores = [];

        // Validar datos del cliente (MÍNIMOS REQUERIDOS)
        const clienteNombre = document.getElementById('clienteNombre');
        const clienteEmail = document.getElementById('clienteEmail');
        const clienteTelefono = document.getElementById('clienteTelefono');
        
        if (clienteNombre && !clienteNombre.value.trim()) {
            errores.push('El nombre del cliente es obligatorio');
        }
        if (clienteEmail && !clienteEmail.value.trim()) {
            errores.push('El email del cliente es obligatorio');
        } else if (clienteEmail && !this.validarEmail(clienteEmail.value)) {
            errores.push('El email del cliente no es válido');
        }
        if (clienteTelefono && !clienteTelefono.value.trim()) {
            errores.push('El teléfono del cliente es obligatorio');
        }

        // Validar datos del prestador (MÍNIMOS REQUERIDOS)
        const prestadorNombre = document.getElementById('prestadorNombre');
        const prestadorResponsable = document.getElementById('prestadorResponsable');
        const prestadorEmail = document.getElementById('prestadorEmail');
        const prestadorTelefono = document.getElementById('prestadorTelefono');
        
        if (prestadorNombre && !prestadorNombre.value.trim()) {
            errores.push('El nombre del prestador es obligatorio');
        }
        if (prestadorResponsable && !prestadorResponsable.value.trim()) {
            errores.push('El técnico responsable es obligatorio');
        }
        if (prestadorEmail && !prestadorEmail.value.trim()) {
            errores.push('El email del prestador es obligatorio');
        } else if (prestadorEmail && !this.validarEmail(prestadorEmail.value)) {
            errores.push('El email del prestador no es válido');
        }
        if (prestadorTelefono && !prestadorTelefono.value.trim()) {
            errores.push('El teléfono del prestador es obligatorio');
        }

        // Validar descripción del servicio (SOLO TIPO Y PLAZO SON OBLIGATORIOS)
        const tipoMantenimiento = document.getElementById('tipoMantenimiento');
        const plazoEjecucion = document.getElementById('plazoEjecucion');
        
        if (tipoMantenimiento && !tipoMantenimiento.value) {
            errores.push('Debe seleccionar un tipo de mantenimiento');
        }
        if (plazoEjecucion && !plazoEjecucion.value.trim()) {
            errores.push('El plazo de ejecución es obligatorio');
        }

        // Validar que haya al menos un concepto con costo
        if (this.totalGeneral <= 0) {
            errores.push('La cotización debe tener al menos un concepto con costo mayor a cero');
        }

        return errores;
    }

    // Validar email
    validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Validar teléfono
    validarTelefono(telefono) {
        const regex = /^[\d\s\-\+\(\)]+$/;
        return regex.test(telefono);
    }

    // Obtener totales actuales
    obtenerTotales() {
        return {
            subtotales: { ...this.subtotales },
            subtotalGeneral: this.subtotalGeneral,
            montoImprevistos: this.montoImprevistos,
            totalGeneral: this.totalGeneral,
            porcentajeImprevistos: parseFloat(document.getElementById('porcentajeImprevistos')?.value || 0)
        };
    }
}

// Crear instancia global
const calculator = new CotizacionCalculator();

// Event listeners para cálculos automáticos
document.addEventListener('DOMContentLoaded', () => {
    // Agregar listeners a todos los inputs con clase calc-input
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('calc-input')) {
            calculator.recalcularTodo();
        }
    });

    // Listener específico para porcentaje administrativo
    const porcentajeAdmin = document.getElementById('porcentajeAdministrativo');
    if (porcentajeAdmin) {
        porcentajeAdmin.addEventListener('input', () => {
            if (parseFloat(porcentajeAdmin.value) > 0) {
                document.getElementById('gastosAdministrativos').value = 0;
            }
            calculator.recalcularTodo();
        });
    }

    const gastosAdmin = document.getElementById('gastosAdministrativos');
    if (gastosAdmin) {
        gastosAdmin.addEventListener('input', () => {
            if (parseFloat(gastosAdmin.value) > 0) {
                document.getElementById('porcentajeAdministrativo').value = 0;
            }
            calculator.recalcularTodo();
        });
    }
});