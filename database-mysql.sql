CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('admin','usuario','visor') DEFAULT 'usuario',
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultimo_acceso` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `clientes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `contacto` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `telefono` varchar(50) NOT NULL,
  `rnc_nif` varchar(50) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_nombre` (`nombre`),
  KEY `idx_email` (`email`),
  KEY `idx_rnc` (`rnc_nif`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `prestadores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `responsable` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `telefono` varchar(50) NOT NULL,
  `rnc_nif` varchar(50) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_nombre` (`nombre`),
  KEY `idx_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cotizaciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero_folio` varchar(50) NOT NULL,
  `cliente_id` int(11) NOT NULL,
  `prestador_id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  
  -- Datos del Servicio
  `tipo_mantenimiento` enum('preventivo','correctivo','mixto','predictivo') NOT NULL,
  `alcance_servicio` text DEFAULT NULL,
  `actividades` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`actividades`)),
  `fecha_inicio` date DEFAULT NULL,
  `plazo_ejecucion` varchar(100) NOT NULL,
  
  -- Honorarios
  `honorarios_diagnostico` decimal(10,2) DEFAULT 0.00,
  `honorarios_planificacion` decimal(10,2) DEFAULT 0.00,
  `honorarios_supervision` decimal(10,2) DEFAULT 0.00,
  
  -- Logística
  `costo_transporte` decimal(10,2) DEFAULT 0.00,
  `costo_movilizacion` decimal(10,2) DEFAULT 0.00,
  `costo_gestion_accesos` decimal(10,2) DEFAULT 0.00,
  
  -- Documentación
  `costo_registro` decimal(10,2) DEFAULT 0.00,
  `costo_informe` decimal(10,2) DEFAULT 0.00,
  `costo_recomendaciones` decimal(10,2) DEFAULT 0.00,
  
  -- Administrativos
  `gastos_admin_directos` decimal(10,2) DEFAULT 0.00,
  `gastos_admin_porcentaje` decimal(5,2) DEFAULT 0.00,
  
  -- Imprevistos
  `imprevistos_porcentaje` decimal(5,2) DEFAULT 10.00,
  `imprevistos_notas` text DEFAULT NULL,
  
  -- Condiciones
  `vigencia_cotizacion` varchar(100) DEFAULT '30 días',
  `forma_pago` varchar(100) DEFAULT NULL,
  `condiciones_adicionales` text DEFAULT NULL,
  
  -- Totales
  `subtotal_honorarios` decimal(10,2) DEFAULT 0.00,
  `subtotal_brigada` decimal(10,2) DEFAULT 0.00,
  `subtotal_herramientas` decimal(10,2) DEFAULT 0.00,
  `subtotal_materiales` decimal(10,2) DEFAULT 0.00,
  `subtotal_logistica` decimal(10,2) DEFAULT 0.00,
  `subtotal_documentacion` decimal(10,2) DEFAULT 0.00,
  `subtotal_administrativos` decimal(10,2) DEFAULT 0.00,
  `subtotal_general` decimal(10,2) DEFAULT 0.00,
  `monto_imprevistos` decimal(10,2) DEFAULT 0.00,
  `total_general` decimal(10,2) NOT NULL,
  
  -- Estado
  `estado` enum('borrador','enviada','aprobada','rechazada','expirada') DEFAULT 'borrador',
  `fecha_envio` datetime DEFAULT NULL,
  `fecha_aprobacion` datetime DEFAULT NULL,
  `notas_internas` text DEFAULT NULL,
  
  -- Auditoría
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_folio` (`numero_folio`),
  KEY `idx_cliente` (`cliente_id`),
  KEY `idx_prestador` (`prestador_id`),
  KEY `idx_estado` (`estado`),
  KEY `idx_fecha_creacion` (`fecha_creacion`),
  KEY `idx_tipo` (`tipo_mantenimiento`),
  
  CONSTRAINT `fk_cotizaciones_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`),
  CONSTRAINT `fk_cotizaciones_prestador` FOREIGN KEY (`prestador_id`) REFERENCES `prestadores` (`id`),
  CONSTRAINT `fk_cotizaciones_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `brigada_trabajo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cotizacion_id` int(11) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `horas` decimal(8,2) NOT NULL,
  `tarifa_hora` decimal(10,2) NOT NULL,
  `cantidad` int(11) DEFAULT 1,
  `notas` text DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `orden` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_cotizacion` (`cotizacion_id`),
  CONSTRAINT `fk_brigada_cotizacion` FOREIGN KEY (`cotizacion_id`) REFERENCES `cotizaciones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `herramientas_equipos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cotizacion_id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `tipo` enum('alquiler','uso','compra') NOT NULL,
  `costo` decimal(10,2) NOT NULL,
  `cantidad` decimal(8,2) DEFAULT 1.00,
  `notas` text DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `orden` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_cotizacion` (`cotizacion_id`),
  CONSTRAINT `fk_herramientas_cotizacion` FOREIGN KEY (`cotizacion_id`) REFERENCES `cotizaciones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `materiales_insumos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cotizacion_id` int(11) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `unidad` varchar(50) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `notas` text DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `orden` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_cotizacion` (`cotizacion_id`),
  CONSTRAINT `fk_materiales_cotizacion` FOREIGN KEY (`cotizacion_id`) REFERENCES `cotizaciones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `configuraciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `clave` varchar(100) NOT NULL,
  `valor` text DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `tipo` enum('texto','numero','json','booleano') DEFAULT 'texto',
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_clave` (`clave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `archivos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cotizacion_id` int(11) NOT NULL,
  `nombre_original` varchar(255) NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `ruta` varchar(500) NOT NULL,
  `tipo_mime` varchar(100) DEFAULT NULL,
  `tamanio` int(11) DEFAULT NULL,
  `fecha_subida` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_cotizacion` (`cotizacion_id`),
  CONSTRAINT `fk_archivos_cotizacion` FOREIGN KEY (`cotizacion_id`) REFERENCES `cotizaciones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 📄 PARTE 4: ARCHIVOS COMPLETOS DETALLADOS

Ya te los envié anteriormente, pero aquí un resumen de dónde están:

### **Archivos descargados:**

1. ✅ `database-mysql.sql` - Script completo de BD
2. ✅ `php/config.php` - Configuración de conexión
3. ✅ `php/api.php` - API REST completa
4. ✅ `api-client.js` - Cliente JavaScript
5. ✅ `GUIA-MYSQL-PHPMYADMIN.md` - Guía completa

---

## 🔗 PARTE 5: CONEXIÓN COMPLETA PASO A PASO

### **Paso 1: Copiar Archivos**
```
C:\xampp\htdocs\cotizacion\
├── index.html              (tu archivo actual)
├── styles.css             (tu archivo actual)
├── config.json            (tu archivo actual)
├── api-client.js          ← COPIAR AQUÍ
├── database-enhanced.js   (tu archivo actual)
├── calculations.js        (tu archivo actual - ACTUALIZADO)
├── app.js                 (tu archivo actual)
├── app-improved.js        (tu archivo actual)
└── php\
    ├── config.php         ← COPIAR AQUÍ
    └── api.php            ← COPIAR AQUÍ