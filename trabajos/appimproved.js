// ============================================
// APP-IMPROVED.JS - Funciones de UI Mejoradas
// VERSIÓN COMPLETA Y FUNCIONAL
// ============================================

// Variables globales
let temaActual = localStorage.getItem('tema') || 'light';

// ============================================
// SISTEMA DE NOTIFICACIONES (TOASTS)
// ============================================

function mostrarToast(mensaje, tipo = 'info', titulo = '') {
    const container = document.getElementById('toastContainer');
    if (!container) {
        console.warn('⚠️ Toast container no encontrado');
        return;
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    
    const iconos = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    const titulos = {
        success: titulo || '¡Éxito!',
        error: titulo || 'Error',
        warning: titulo || 'Advertencia',
        info: titulo || 'Información'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${iconos[tipo]}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${titulos[tipo]}</div>
            <div class="toast-message">${mensaje}</div>
        </div>
        <button class="toast-close" onclick="cerrarToast(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

function cerrarToast(btn) {
    const toast = btn.closest('.toast');
    if (toast) {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }
}

// ============================================
// LOADING OVERLAY
// ============================================

function mostrarLoading(mensaje = 'Cargando...') {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.querySelector('p').textContent = mensaje;
        overlay.classList.add('active');
    }
}

function ocultarLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

// ============================================
// TEMA CLARO/OSCURO
// ============================================

function cambiarTema() {
    temaActual = temaActual === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', temaActual);
    localStorage.setItem('tema', temaActual);
    
    const icon = document.getElementById('themeIcon');
    if (icon) {
        icon.className = temaActual === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    mostrarToast(
        `Tema ${temaActual === 'dark' ? 'oscuro' : 'claro'} activado`,
        'success'
    );
}

// ============================================
// BARRA DE PROGRESO
// ============================================

function actualizarProgreso() {
    const secciones = document.querySelectorAll('.card[data-section]');
    let progreso = 0;
    let seccionesCompletas = 0;
    
    secciones.forEach((seccion, index) => {
        const inputs = seccion.querySelectorAll('input[required], select[required], textarea[required]');
        const inputsCompletados = Array.from(inputs).filter(input => {
            if (input.type === 'checkbox') return input.checked;
            return input.value.trim() !== '';
        });
        
        const porcentajeSeccion = inputs.length > 0 ? (inputsCompletados.length / inputs.length) * 100 : 100;
        
        if (porcentajeSeccion === 100) {
            seccionesCompletas++;
            marcarPasoCompletado(index + 1);
        } else if (porcentajeSeccion > 0) {
            marcarPasoActivo(index + 1);
        }
    });
    
    progreso = (seccionesCompletas / secciones.length) * 100;
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.style.width = `${progreso}%`;
    }
}

function marcarPasoActivo(paso) {
    const pasoElement = document.querySelector(`.step[data-step="${paso}"]`);
    if (pasoElement && !pasoElement.classList.contains('completed')) {
        document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
        pasoElement.classList.add('active');
    }
}

function marcarPasoCompletado(paso) {
    const pasoElement = document.querySelector(`.step[data-step="${paso}"]`);
    if (pasoElement) {
        pasoElement.classList.add('completed');
        pasoElement.classList.remove('active');
    }
}

// ============================================
// COLAPSAR/EXPANDIR SECCIONES
// ============================================

function toggleSection(sectionNumber) {
    const card = document.querySelector(`.card[data-section="${sectionNumber}"]`);
    if (!card) return;
    
    const icon = card.querySelector('.btn-collapse i');
    
    card.classList.toggle('collapsed');
    
    if (icon) {
        if (card.classList.contains('collapsed')) {
            icon.style.transform = 'rotate(180deg)';
        } else {
            icon.style.transform = 'rotate(0deg)';
        }
    }
}

// ============================================
// ACTUALIZAR BADGE DEL HISTORIAL
// ============================================

async function actualizarBadgeHistorial() {
    try {
        if (typeof db !== 'undefined' && db.obtenerTodasCotizaciones) {
            const cotizaciones = await db.obtenerTodasCotizaciones();
            const badge = document.getElementById('badgeHistorial');
            if (badge) {
                badge.textContent = cotizaciones.length;
            }
        }
    } catch (error) {
        console.error('Error al actualizar badge:', error);
    }
}

// ============================================
// VALIDACIÓN EN TIEMPO REAL
// ============================================

function validarCampoTiempoReal(input) {
    if (!input) return;
    
    const tipo = input.type;
    const valor = input.value;
    
    if (tipo === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (valor && !emailRegex.test(valor)) {
            input.style.borderColor = 'var(--danger-color)';
            input.setCustomValidity('Email inválido');
        } else {
            input.style.borderColor = '';
            input.setCustomValidity('');
        }
    }
    
    if (tipo === 'tel') {
        const telRegex = /^[\d\s\-\+\(\)]+$/;
        if (valor && !telRegex.test(valor)) {
            input.style.borderColor = 'var(--warning-color)';
        } else {
            input.style.borderColor = '';
        }
    }
    
    if (typeof actualizarProgreso === 'function') {
        actualizarProgreso();
    }
}

// ============================================
// INICIALIZACIÓN MEJORADA
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 app-improved.js cargado correctamente');
    
    // Aplicar tema guardado
    document.documentElement.setAttribute('data-theme', temaActual);
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.className = temaActual === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    // Configurar validación en tiempo real
    document.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('blur', () => validarCampoTiempoReal(input));
        input.addEventListener('input', () => {
            if (input.classList.contains('calc-input')) {
                if (typeof calculator !== 'undefined' && calculator.recalcularTodo) {
                    calculator.recalcularTodo();
                }
            }
            actualizarProgreso();
        });
    });
    
    // Actualizar badge del historial
    actualizarBadgeHistorial();
    
    // Actualizar progreso inicial
    actualizarProgreso();
    
    // Mostrar mensaje de bienvenida
    setTimeout(() => {
        mostrarToast(
            'Sistema listo para crear cotizaciones profesionales',
            'info',
            '¡Bienvenido!'
        );
    }, 500);
    
    console.log('✅ Sistema de UI mejorado inicializado');
});

// ============================================
// ESTADÍSTICAS (Placeholder)
// ============================================

async function mostrarEstadisticas() {
    mostrarToast('Función de estadísticas en desarrollo', 'info', 'Próximamente');
}