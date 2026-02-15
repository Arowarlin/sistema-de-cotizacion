<?php
// ============================================
// api.php - API REST para Cotizaciones (CORREGIDO)
// ============================================

define('APP_ACCESS', true);
require_once 'config.php';

// Headers JSON
header('Content-Type: application/json; charset=utf-8');

// Obtener método HTTP
$method = $_SERVER['REQUEST_METHOD'];

// Obtener acción
$action = isset($_GET['action']) ? cleanInput($_GET['action']) : '';

// ✅ CORRECCIÓN: Log de debug
error_log("========================================");
error_log("Nueva petición: $method $action");
error_log("GET: " . json_encode($_GET));
error_log("POST raw: " . file_get_contents('php://input'));
error_log("========================================");

// Manejar OPTIONS (CORS preflight)
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ============================================
// ROUTER PRINCIPAL
// ============================================

try {
    switch ($action) {
        // ============================================
        // COTIZACIONES
        // ============================================
        case 'guardar_cotizacion':
            if ($method !== 'POST') throw new Exception('Método no permitido. Se esperaba POST, se recibió: ' . $method);
            guardarCotizacion();
            break;
            
        case 'obtener_cotizaciones':
            if ($method !== 'GET') throw new Exception('Método no permitido');
            obtenerCotizaciones();
            break;
            
        case 'obtener_cotizacion':
            if ($method !== 'GET') throw new Exception('Método no permitido');
            obtenerCotizacion();
            break;
            
        case 'eliminar_cotizacion':
            if ($method !== 'DELETE') throw new Exception('Método no permitido');
            eliminarCotizacion();
            break;
            
        // ============================================
        // CLIENTES
        // ============================================
        case 'obtener_clientes':
            if ($method !== 'GET') throw new Exception('Método no permitido');
            obtenerClientes();
            break;
            
        case 'buscar_cliente':
            if ($method !== 'GET') throw new Exception('Método no permitido');
            buscarCliente();
            break;
            
        // ============================================
        // ESTADÍSTICAS
        // ============================================
        case 'obtener_estadisticas':
            if ($method !== 'GET') throw new Exception('Método no permitido');
            obtenerEstadisticas();
            break;
            
        // ============================================
        // CONFIGURACIÓN
        // ============================================
        case 'obtener_configuracion':
            if ($method !== 'GET') throw new Exception('Método no permitido');
            obtenerConfiguracion();
            break;
            
        default:
            throw new Exception('Acción no válida: ' . $action);
    }
    
} catch (Exception $e) {
    error_log("❌ ERROR: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    jsonResponse([
        'success' => false,
        'error' => $e->getMessage()
    ], 400);
}

// ============================================
// FUNCIONES DE COTIZACIONES (CORREGIDAS)
// ============================================

function guardarCotizacion() {
    $db = getDB();
    
    // ✅ CORRECCIÓN: Obtener datos JSON con manejo de errores
    $json = file_get_contents('php://input');
    error_log("📦 Datos JSON recibidos: " . substr($json, 0, 500));
    
    if (empty($json)) {
        throw new Exception('No se recibieron datos JSON');
    }
    
    $data = json_decode($json, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('JSON inválido: ' . json_last_error_msg());
    }
    
    if (!$data) {
        throw new Exception('Datos vacíos o inválidos');
    }
    
    // ✅ VALIDAR DATOS REQUERIDOS
    if (empty($data['datosCliente']['nombre'])) {
        throw new Exception('El nombre del cliente es requerido');
    }
    if (empty($data['datosCliente']['email'])) {
        throw new Exception('El email del cliente es requerido');
    }
    if (empty($data['datosPrestador']['nombre'])) {
        throw new Exception('El nombre del prestador es requerido');
    }
    if (empty($data['datosServicio']['tipoMantenimiento'])) {
        throw new Exception('El tipo de mantenimiento es requerido');
    }
    
    $db->beginTransaction();
    
    try {
        // 1. Guardar o actualizar cliente
        error_log("💾 Guardando cliente...");
        $clienteId = guardarClienteSiNoExiste($db, $data['datosCliente']);
        error_log("✅ Cliente ID: $clienteId");
        
        // 2. Guardar o actualizar prestador
        error_log("💾 Guardando prestador...");
        $prestadorId = guardarPrestadorSiNoExiste($db, $data['datosPrestador']);
        error_log("✅ Prestador ID: $prestadorId");
        
        // 3. Generar folio
        $numeroFolio = generarNumeroFolio();
        error_log("📝 Folio generado: $numeroFolio");
        
        // 4. Insertar cotización
        error_log("💾 Insertando cotización...");
        $stmt = $db->prepare("
            INSERT INTO cotizaciones (
                numero_folio, cliente_id, prestador_id,
                tipo_mantenimiento, alcance_servicio, actividades,
                fecha_inicio, plazo_ejecucion,
                honorarios_diagnostico, honorarios_planificacion, honorarios_supervision,
                costo_transporte, costo_movilizacion, costo_gestion_accesos,
                costo_registro, costo_informe, costo_recomendaciones,
                gastos_admin_directos, gastos_admin_porcentaje,
                imprevistos_porcentaje, imprevistos_notas,
                vigencia_cotizacion, forma_pago, condiciones_adicionales,
                subtotal_honorarios, subtotal_logistica, subtotal_documentacion,
                subtotal_administrativos, subtotal_general,
                monto_imprevistos, total_general, estado
            ) VALUES (
                :numero_folio, :cliente_id, :prestador_id,
                :tipo_mantenimiento, :alcance_servicio, :actividades,
                :fecha_inicio, :plazo_ejecucion,
                :honorarios_diagnostico, :honorarios_planificacion, :honorarios_supervision,
                :costo_transporte, :costo_movilizacion, :costo_gestion_accesos,
                :costo_registro, :costo_informe, :costo_recomendaciones,
                :gastos_admin_directos, :gastos_admin_porcentaje,
                :imprevistos_porcentaje, :imprevistos_notas,
                :vigencia_cotizacion, :forma_pago, :condiciones_adicionales,
                :subtotal_honorarios, :subtotal_logistica, :subtotal_documentacion,
                :subtotal_administrativos, :subtotal_general,
                :monto_imprevistos, :total_general, 'borrador'
            )
        ");
        
        $stmt->execute([
            ':numero_folio' => $numeroFolio,
            ':cliente_id' => $clienteId,
            ':prestador_id' => $prestadorId,
            ':tipo_mantenimiento' => $data['datosServicio']['tipoMantenimiento'],
            ':alcance_servicio' => $data['datosServicio']['alcanceServicio'] ?? null,
            ':actividades' => json_encode($data['datosServicio']['actividades'] ?? []),
            ':fecha_inicio' => $data['datosServicio']['fechaInicio'] ?? null,
            ':plazo_ejecucion' => $data['datosServicio']['plazoEjecucion'] ?? '',
            ':honorarios_diagnostico' => $data['etapaTecnica']['honorarios']['diagnostico'] ?? 0,
            ':honorarios_planificacion' => $data['etapaTecnica']['honorarios']['planificacion'] ?? 0,
            ':honorarios_supervision' => $data['etapaTecnica']['honorarios']['supervision'] ?? 0,
            ':costo_transporte' => $data['etapaOperativa']['logistica']['transporte'] ?? 0,
            ':costo_movilizacion' => $data['etapaOperativa']['logistica']['movilizacion'] ?? 0,
            ':costo_gestion_accesos' => $data['etapaOperativa']['logistica']['gestionAccesos'] ?? 0,
            ':costo_registro' => $data['etapaOperativa']['documentacion']['registro'] ?? 0,
            ':costo_informe' => $data['etapaOperativa']['documentacion']['informe'] ?? 0,
            ':costo_recomendaciones' => $data['etapaOperativa']['documentacion']['recomendaciones'] ?? 0,
            ':gastos_admin_directos' => $data['etapaOperativa']['administrativos']['gastosDirectos'] ?? 0,
            ':gastos_admin_porcentaje' => $data['etapaOperativa']['administrativos']['porcentaje'] ?? 0,
            ':imprevistos_porcentaje' => $data['imprevistos']['porcentaje'] ?? 10,
            ':imprevistos_notas' => $data['imprevistos']['notas'] ?? null,
            ':vigencia_cotizacion' => $data['condiciones']['vigenciaCotizacion'] ?? '30 días',
            ':forma_pago' => $data['condiciones']['formaPago'] ?? null,
            ':condiciones_adicionales' => $data['condiciones']['condicionesAdicionales'] ?? null,
            ':subtotal_honorarios' => $data['totales']['subtotales']['honorarios'] ?? 0,
            ':subtotal_logistica' => $data['totales']['subtotales']['logistica'] ?? 0,
            ':subtotal_documentacion' => $data['totales']['subtotales']['documentacion'] ?? 0,
            ':subtotal_administrativos' => $data['totales']['subtotales']['administrativos'] ?? 0,
            ':subtotal_general' => $data['totales']['subtotalGeneral'] ?? 0,
            ':monto_imprevistos' => $data['totales']['montoImprevistos'] ?? 0,
            ':total_general' => $data['totales']['totalGeneral'] ?? 0
        ]);
        
        $cotizacionId = $db->lastInsertId();
        error_log("✅ Cotización insertada ID: $cotizacionId");
        
        // 5. Insertar brigada
        if (!empty($data['etapaTecnica']['brigada'])) {
            error_log("💾 Insertando brigada (" . count($data['etapaTecnica']['brigada']) . " items)...");
            foreach ($data['etapaTecnica']['brigada'] as $item) {
                $stmt = $db->prepare("
                    INSERT INTO brigada_trabajo (cotizacion_id, descripcion, horas, tarifa_hora, cantidad, notas, subtotal)
                    VALUES (:cotizacion_id, :descripcion, :horas, :tarifa_hora, :cantidad, :notas, :subtotal)
                ");
                $stmt->execute([
                    ':cotizacion_id' => $cotizacionId,
                    ':descripcion' => $item['descripcion'],
                    ':horas' => $item['horas'],
                    ':tarifa_hora' => $item['tarifa'],
                    ':cantidad' => $item['cantidad'],
                    ':notas' => $item['notas'] ?? null,
                    ':subtotal' => $item['horas'] * $item['tarifa'] * $item['cantidad']
                ]);
            }
        }
        
        // 6. Insertar herramientas
        if (!empty($data['etapaTecnica']['herramientas'])) {
            error_log("💾 Insertando herramientas (" . count($data['etapaTecnica']['herramientas']) . " items)...");
            foreach ($data['etapaTecnica']['herramientas'] as $item) {
                $stmt = $db->prepare("
                    INSERT INTO herramientas_equipos (cotizacion_id, nombre, tipo, costo, cantidad, notas, subtotal)
                    VALUES (:cotizacion_id, :nombre, :tipo, :costo, :cantidad, :notas, :subtotal)
                ");
                $stmt->execute([
                    ':cotizacion_id' => $cotizacionId,
                    ':nombre' => $item['nombre'],
                    ':tipo' => $item['tipo'],
                    ':costo' => $item['costo'],
                    ':cantidad' => $item['cantidad'],
                    ':notas' => $item['notas'] ?? null,
                    ':subtotal' => $item['costo'] * $item['cantidad']
                ]);
            }
        }
        
        // 7. Insertar materiales
        if (!empty($data['etapaTecnica']['materiales'])) {
            error_log("💾 Insertando materiales (" . count($data['etapaTecnica']['materiales']) . " items)...");
            foreach ($data['etapaTecnica']['materiales'] as $item) {
                $stmt = $db->prepare("
                    INSERT INTO materiales_insumos (cotizacion_id, descripcion, unidad, precio_unitario, cantidad, notas, subtotal)
                    VALUES (:cotizacion_id, :descripcion, :unidad, :precio_unitario, :cantidad, :notas, :subtotal)
                ");
                $stmt->execute([
                    ':cotizacion_id' => $cotizacionId,
                    ':descripcion' => $item['descripcion'],
                    ':unidad' => $item['unidad'],
                    ':precio_unitario' => $item['precio'],
                    ':cantidad' => $item['cantidad'],
                    ':notas' => $item['notas'] ?? null,
                    ':subtotal' => $item['precio'] * $item['cantidad']
                ]);
            }
        }
        
        $db->commit();
        error_log("✅ Transacción completada exitosamente");
        
        jsonResponse([
            'success' => true,
            'message' => 'Cotización guardada exitosamente',
            'data' => [
                'id' => $cotizacionId,
                'numeroFolio' => $numeroFolio
            ]
        ]);
        
    } catch (Exception $e) {
        $db->rollBack();
        error_log("❌ Error en transacción: " . $e->getMessage());
        throw $e;
    }
}

function guardarClienteSiNoExiste($db, $datos) {
    // Buscar cliente por email
    $stmt = $db->prepare("SELECT id FROM clientes WHERE email = :email LIMIT 1");
    $stmt->execute([':email' => $datos['email']]);
    $cliente = $stmt->fetch();
    
    if ($cliente) {
        error_log("ℹ️ Cliente ya existe con ID: " . $cliente['id']);
        return $cliente['id'];
    }
    
    // Insertar nuevo cliente
    $stmt = $db->prepare("
        INSERT INTO clientes (nombre, contacto, email, telefono, rnc_nif, direccion)
        VALUES (:nombre, :contacto, :email, :telefono, :rnc, :direccion)
    ");
    $stmt->execute([
        ':nombre' => $datos['nombre'],
        ':contacto' => $datos['contacto'] ?? null,
        ':email' => $datos['email'],
        ':telefono' => $datos['telefono'],
        ':rnc' => $datos['rnc'] ?? null,
        ':direccion' => $datos['direccion'] ?? null
    ]);
    
    $id = $db->lastInsertId();
    error_log("✅ Nuevo cliente creado con ID: $id");
    return $id;
}

function guardarPrestadorSiNoExiste($db, $datos) {
    // Buscar prestador por email
    $stmt = $db->prepare("SELECT id FROM prestadores WHERE email = :email LIMIT 1");
    $stmt->execute([':email' => $datos['email']]);
    $prestador = $stmt->fetch();
    
    if ($prestador) {
        error_log("ℹ️ Prestador ya existe con ID: " . $prestador['id']);
        return $prestador['id'];
    }
    
    // Insertar nuevo prestador
    $stmt = $db->prepare("
        INSERT INTO prestadores (nombre, responsable, email, telefono, rnc_nif, direccion)
        VALUES (:nombre, :responsable, :email, :telefono, :rnc, :direccion)
    ");
    $stmt->execute([
        ':nombre' => $datos['nombre'],
        ':responsable' => $datos['responsable'],
        ':email' => $datos['email'],
        ':telefono' => $datos['telefono'],
        ':rnc' => $datos['rnc'] ?? null,
        ':direccion' => $datos['direccion'] ?? null
    ]);
    
    $id = $db->lastInsertId();
    error_log("✅ Nuevo prestador creado con ID: $id");
    return $id;
}

function obtenerCotizaciones() {
    $db = getDB();
    
    $stmt = $db->query("
        SELECT 
            c.*,
            cl.nombre as cliente_nombre,
            cl.email as cliente_email,
            p.nombre as prestador_nombre
        FROM cotizaciones c
        LEFT JOIN clientes cl ON c.cliente_id = cl.id
        LEFT JOIN prestadores p ON c.prestador_id = p.id
        ORDER BY c.fecha_creacion DESC
    ");
    $cotizaciones = $stmt->fetchAll();
    
    jsonResponse([
        'success' => true,
        'data' => $cotizaciones
    ]);
}

function obtenerCotizacion() {
    $db = getDB();
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if (!$id) {
        throw new Exception('ID no válido');
    }
    
    // Obtener cotización principal
    $stmt = $db->prepare("SELECT * FROM cotizaciones WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $cotizacion = $stmt->fetch();
    
    if (!$cotizacion) {
        throw new Exception('Cotización no encontrada');
    }
    
    // Obtener brigada
    $stmt = $db->prepare("SELECT * FROM brigada_trabajo WHERE cotizacion_id = :id ORDER BY orden");
    $stmt->execute([':id' => $id]);
    $cotizacion['brigada'] = $stmt->fetchAll();
    
    // Obtener herramientas
    $stmt = $db->prepare("SELECT * FROM herramientas_equipos WHERE cotizacion_id = :id ORDER BY orden");
    $stmt->execute([':id' => $id]);
    $cotizacion['herramientas'] = $stmt->fetchAll();
    
    // Obtener materiales
    $stmt = $db->prepare("SELECT * FROM materiales_insumos WHERE cotizacion_id = :id ORDER BY orden");
    $stmt->execute([':id' => $id]);
    $cotizacion['materiales'] = $stmt->fetchAll();
    
    jsonResponse([
        'success' => true,
        'data' => $cotizacion
    ]);
}

function eliminarCotizacion() {
    $db = getDB();
    
    // ✅ CORRECCIÓN: Obtener datos del body para DELETE
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    $id = isset($data['id']) ? (int)$data['id'] : 0;
    
    if (!$id) {
        throw new Exception('ID no válido');
    }
    
    $stmt = $db->prepare("DELETE FROM cotizaciones WHERE id = :id");
    $stmt->execute([':id' => $id]);
    
    jsonResponse([
        'success' => true,
        'message' => 'Cotización eliminada correctamente'
    ]);
}

function obtenerClientes() {
    $db = getDB();
    
    $stmt = $db->query("SELECT * FROM clientes ORDER BY nombre");
    $clientes = $stmt->fetchAll();
    
    jsonResponse([
        'success' => true,
        'data' => $clientes
    ]);
}

function buscarCliente() {
    $db = getDB();
    $nombre = isset($_GET['nombre']) ? cleanInput($_GET['nombre']) : '';
    
    if (strlen($nombre) < 2) {
        throw new Exception('El nombre debe tener al menos 2 caracteres');
    }
    
    $stmt = $db->prepare("SELECT * FROM clientes WHERE nombre LIKE :nombre ORDER BY nombre LIMIT 10");
    $stmt->execute([':nombre' => "%{$nombre}%"]);
    $clientes = $stmt->fetchAll();
    
    jsonResponse([
        'success' => true,
        'data' => $clientes
    ]);
}

function obtenerEstadisticas() {
    $db = getDB();
    
    $stmt = $db->query("
        SELECT 
            COUNT(*) as total_cotizaciones,
            SUM(total_general) as monto_total,
            AVG(total_general) as promedio,
            MAX(total_general) as maximo,
            MIN(total_general) as minimo,
            COUNT(DISTINCT cliente_id) as total_clientes
        FROM cotizaciones
    ");
    $estadisticas = $stmt->fetch();
    
    jsonResponse([
        'success' => true,
        'data' => $estadisticas
    ]);
}

function obtenerConfiguracion() {
    jsonResponse([
        'success' => true,
        'data' => [
            'version' => APP_VERSION,
            'name' => APP_NAME,
            'status' => 'online',
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ]);
}

?>