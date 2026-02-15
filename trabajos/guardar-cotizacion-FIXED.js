// ============================================
// FUNCIÓN GUARDAR COTIZACIÓN - VERSIÓN CORREGIDA
// ============================================

async function guardarCotizacion() {
    console.log('🔄 Iniciando guardado de cotización...');
    
    // Validar primero
    const errores = calculator.validarFormulario();
    
    if (errores.length > 0) {
        console.warn('⚠️ Errores de validación:', errores);
        let mensajeError = 'Por favor corrija los siguientes errores:\n\n';
        errores.forEach((error, index) => {
            mensajeError += `${index + 1}. ${error}\n`;
        });
        
        mostrarToast(
            `Hay ${errores.length} error(es) de validación. Revise el formulario.`,
            'error',
            'Error de Validación'
        );
        
        alert(mensajeError);
        return;
    }

    mostrarLoading('Guardando cotización...');

    try {
        // ✅ RECOPILAR TODOS LOS DATOS CORRECTAMENTE
        const cotizacion = {
            // Datos del Cliente
            datosCliente: {
                nombre: document.getElementById('clienteNombre')?.value || '',
                contacto: document.getElementById('clienteContacto')?.value || '',
                email: document.getElementById('clienteEmail')?.value || '',
                telefono: document.getElementById('clienteTelefono')?.value || '',
                rnc: document.getElementById('clienteRNC')?.value || '',
                direccion: document.getElementById('clienteDireccion')?.value || ''
            },
            
            // Datos del Prestador
            datosPrestador: {
                nombre: document.getElementById('prestadorNombre')?.value || '',
                responsable: document.getElementById('prestadorResponsable')?.value || '',
                email: document.getElementById('prestadorEmail')?.value || '',
                telefono: document.getElementById('prestadorTelefono')?.value || '',
                rnc: document.getElementById('prestadorRNC')?.value || '',
                direccion: document.getElementById('prestadorDireccion')?.value || ''
            },
            
            // Datos del Servicio
            datosServicio: {
                tipoMantenimiento: document.getElementById('tipoMantenimiento')?.value || '',
                alcanceServicio: document.getElementById('alcanceServicio')?.value || '',
                actividades: Array.from(document.querySelectorAll('.actividad:checked')).map(check => check.value),
                fechaInicio: document.getElementById('fechaInicio')?.value || null,
                plazoEjecucion: document.getElementById('plazoEjecucion')?.value || ''
            },
            
            // Etapa Técnica
            etapaTecnica: {
                honorarios: {
                    diagnostico: parseFloat(document.getElementById('honorariosDiagnostico')?.value || 0),
                    planificacion: parseFloat(document.getElementById('honorariosPlanificacion')?.value || 0),
                    supervision: parseFloat(document.getElementById('honorariosSupervision')?.value || 0)
                },
                brigada: recopilarBrigada(),
                herramientas: recopilarHerramientas(),
                materiales: recopilarMateriales()
            },
            
            // Etapa Operativa
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
            
            // Imprevistos
            imprevistos: {
                porcentaje: parseFloat(document.getElementById('porcentajeImprevistos')?.value || 10),
                notas: document.getElementById('notasImprevistos')?.value || ''
            },
            
            // Condiciones
            condiciones: {
                vigenciaCotizacion: document.getElementById('vigenciaCotizacion')?.value || '30 días',
                formaPago: document.getElementById('formaPago')?.value || '',
                condicionesAdicionales: document.getElementById('condicionesAdicionales')?.value || ''
            },
            
            // Totales (desde el calculador)
            totales: calculator.obtenerTotales()
        };

        console.log('📦 Cotización completa a enviar:', cotizacion);

        // ✅ GUARDAR USANDO LA API
        const resultado = await db.guardarCotizacion(cotizacion);
        
        console.log('✅ Resultado del guardado:', resultado);

        ocultarLoading();
        
        // Mostrar mensaje de éxito
        const total = cotizacion.totales.totalGeneral;
        const folio = resultado.numeroFolio;
        
        mostrarToast(
            `Cotización guardada exitosamente\n\nFolio: ${folio}\nTotal: $${total.toFixed(2)}`,
            'success',
            '¡Guardado Exitoso!'
        );

        // Actualizar badge del historial
        if (typeof actualizarBadgeHistorial === 'function') {
            actualizarBadgeHistorial();
        }

    } catch (error) {
        console.error('❌ Error al guardar cotización:', error);
        ocultarLoading();
        
        let mensajeError = 'No se pudo guardar la cotización';
        
        // Mensaje más específico según el error
        if (error.message.includes('JSON')) {
            mensajeError = 'Error en la comunicación con el servidor. Verifica que PHP esté funcionando.';
        } else if (error.message.includes('HTTP')) {
            mensajeError = 'Error de conexión con el servidor. Verifica la URL de la API.';
        } else {
            mensajeError = error.message;
        }
        
        mostrarToast(
            mensajeError,
            'error',
            'Error al Guardar'
        );
    }
}

// ============================================
// FUNCIONES AUXILIARES PARA RECOPILAR DATOS
// ============================================

function recopilarBrigada() {
    const items = [];
    const containerBrigada = document.getElementById('brigadaContainer');
    
    if (!containerBrigada) {
        console.warn('⚠️ Container de brigada no encontrado');
        return items;
    }
    
    // ✅ CORRECCIÓN: Selector correcto
    const brigadaItems = containerBrigada.querySelectorAll('.brigada-item, .item-dinamico');
    
    console.log(`📋 Recopilando ${brigadaItems.length} items de brigada`);
    
    brigadaItems.forEach((item, index) => {
        // Buscar inputs por clase
        const descripcionInput = item.querySelector('[class*="brigada-descripcion"]') || 
                                 item.querySelector('input[type="text"]');
        const horasInput = item.querySelector('[class*="brigada-horas"]') || 
                          item.querySelectorAll('input[type="number"]')[0];
        const tarifaInput = item.querySelector('[class*="brigada-tarifa"]') || 
                           item.querySelectorAll('input[type="number"]')[1];
        const cantidadInput = item.querySelector('[class*="brigada-cantidad"]') || 
                             item.querySelectorAll('input[type="number"]')[2];
        const notasInput = item.querySelector('[class*="brigada-notas"]') || 
                          item.querySelector('textarea');

        const descripcion = descripcionInput?.value || '';
        const horas = parseFloat(horasInput?.value || 0);
        const tarifa = parseFloat(tarifaInput?.value || 0);
        const cantidad = parseInt(cantidadInput?.value || 1);
        const notas = notasInput?.value || '';

        if (descripcion.trim()) {
            items.push({
                descripcion,
                horas,
                tarifa,
                cantidad,
                notas
            });
            console.log(`  ✅ Brigada ${index + 1}:`, descripcion);
        }
    });
    
    console.log(`✅ Total brigada recopilada: ${items.length} items`);
    return items;
}

function recopilarHerramientas() {
    const items = [];
    const containerHerramientas = document.getElementById('herramientasContainer');
    
    if (!containerHerramientas) {
        console.warn('⚠️ Container de herramientas no encontrado');
        return items;
    }
    
    const herramientaItems = containerHerramientas.querySelectorAll('.herramienta-item, .tool-item, .item-dinamico');
    
    console.log(`🔧 Recopilando ${herramientaItems.length} herramientas`);
    
    herramientaItems.forEach((item, index) => {
        const nombreInput = item.querySelector('[class*="herramienta-nombre"]') || 
                           item.querySelector('input[type="text"]');
        const tipoSelect = item.querySelector('[class*="herramienta-tipo"]') || 
                          item.querySelector('select');
        const costoInput = item.querySelector('[class*="herramienta-costo"]') || 
                          item.querySelectorAll('input[type="number"]')[0];
        const cantidadInput = item.querySelector('[class*="herramienta-cantidad"]') || 
                             item.querySelectorAll('input[type="number"]')[1];
        const notasInput = item.querySelector('[class*="herramienta-notas"]') || 
                          item.querySelector('textarea');

        const nombre = nombreInput?.value || '';
        const tipo = tipoSelect?.value || 'uso';
        const costo = parseFloat(costoInput?.value || 0);
        const cantidad = parseFloat(cantidadInput?.value || 1);
        const notas = notasInput?.value || '';

        if (nombre.trim()) {
            items.push({
                nombre,
                tipo,
                costo,
                cantidad,
                notas
            });
            console.log(`  ✅ Herramienta ${index + 1}:`, nombre);
        }
    });
    
    console.log(`✅ Total herramientas recopiladas: ${items.length} items`);
    return items;
}

function recopilarMateriales() {
    const items = [];
    const containerMateriales = document.getElementById('materialesContainer');
    
    if (!containerMateriales) {
        console.warn('⚠️ Container de materiales no encontrado');
        return items;
    }
    
    const materialItems = containerMateriales.querySelectorAll('.material-item, .item-dinamico');
    
    console.log(`📦 Recopilando ${materialItems.length} materiales`);
    
    materialItems.forEach((item, index) => {
        const descripcionInput = item.querySelector('[class*="material-descripcion"]') || 
                                item.querySelector('input[type="text"]');
        const unidadSelect = item.querySelector('[class*="material-unidad"]') || 
                            item.querySelector('select');
        const precioInput = item.querySelector('[class*="material-precio"]') || 
                           item.querySelectorAll('input[type="number"]')[0];
        const cantidadInput = item.querySelector('[class*="material-cantidad"]') || 
                             item.querySelectorAll('input[type="number"]')[1];
        const notasInput = item.querySelector('[class*="material-notas"]') || 
                          item.querySelector('textarea');

        const descripcion = descripcionInput?.value || '';
        const unidad = unidadSelect?.value || 'pza';
        const precio = parseFloat(precioInput?.value || 0);
        const cantidad = parseFloat(cantidadInput?.value || 0);
        const notas = notasInput?.value || '';

        if (descripcion.trim()) {
            items.push({
                descripcion,
                unidad,
                precio,
                cantidad,
                notas
            });
            console.log(`  ✅ Material ${index + 1}:`, descripcion);
        }
    });
    
    console.log(`✅ Total materiales recopilados: ${items.length} items`);
    return items;
}

// ============================================
// LOG DE VERIFICACIÓN AL CARGAR
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Función guardarCotizacion cargada correctamente');
    
    // Verificar que existen los elementos necesarios
    const verificaciones = {
        'Calculator': typeof calculator !== 'undefined',
        'DB (apiClient)': typeof db !== 'undefined',
        'mostrarToast': typeof mostrarToast === 'function',
        'mostrarLoading': typeof mostrarLoading === 'function',
        'ocultarLoading': typeof ocultarLoading === 'function'
    };
    
    console.table(verificaciones);
    
    // Verificar containers
    const containers = {
        'brigadaContainer': !!document.getElementById('brigadaContainer'),
        'herramientasContainer': !!document.getElementById('herramientasContainer'),
        'materialesContainer': !!document.getElementById('materialesContainer')
    };
    
    console.table(containers);
});