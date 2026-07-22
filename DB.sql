CREATE TABLE `web_seguros_catalogo` (
  `id_seguro` integer PRIMARY KEY AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `permite_digital` boolean DEFAULT false,
  `permite_tradicional` boolean DEFAULT true,
  `url_externa` varchar(500),
  `seguro_activo` boolean DEFAULT true,
  `categoria` varchar(50) NOT NULL DEFAULT 'Otros',
  `ramo` varchar(50) DEFAULT NULL,
  `orden_display` integer DEFAULT 0
);

CREATE TABLE `web_leads_contacto` (
  `id_lead` integer PRIMARY KEY AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefono` varchar(20),
  `mensaje` text,
  `fecha_contacto` timestamp DEFAULT (now())
);

CREATE TABLE `web_cotizaciones` (
  `id_cotizacion` integer PRIMARY KEY AUTO_INCREMENT,
  `seguro_id` integer NOT NULL,
  `cliente_id` integer,
  `nombre` varchar(100) NOT NULL,
  `rut` varchar(20) NOT NULL,
  `tipo_cliente` varchar(20) NOT NULL DEFAULT 'persona',
  `email` varchar(100) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `mensaje` text,
  `datos_adicionales` longtext,
  `canal` varchar(20) NOT NULL,
  `estado` varchar(20) DEFAULT 'pendiente',
  `fecha_solicitud` timestamp DEFAULT (now())
);

CREATE TABLE `web_clientes` (
  `id_cliente` integer PRIMARY KEY AUTO_INCREMENT,
  `rut` varchar(20) NOT NULL,
  `tipo_cliente` varchar(10) NOT NULL,
  `nombre_o_razon_social` varchar(200) NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `direccion` varchar(300) DEFAULT NULL,
  `region` varchar(100) DEFAULT NULL,
  `comuna` varchar(100) DEFAULT NULL,
  `preferencias_notificacion` longtext DEFAULT NULL,
  `foto_perfil` varchar(500) DEFAULT NULL,
  `foto_original` varchar(500) DEFAULT NULL,
  `foto_crop` longtext DEFAULT NULL,
  `cliente_activo` boolean DEFAULT true,
  `fecha_registro` timestamp DEFAULT (now()),
  `updated_at` timestamp
);

CREATE TABLE `web_portal_accesos` (
  `id_acceso` integer PRIMARY KEY AUTO_INCREMENT,
  `cliente_id` integer NOT NULL,
  `tipo_acceso` varchar(10) NOT NULL,
  `pin_hash` varchar(255) NOT NULL,
  `password_hash` varchar(255),
  `tiene_cuenta` boolean DEFAULT false,
  `portal_acceso_activo` boolean DEFAULT true,
  `ultimo_ingreso` timestamp,
  `fecha_creacion` timestamp DEFAULT (now()),
  `updated_at` timestamp
);

CREATE TABLE `web_polizas` (
  `id_poliza` integer PRIMARY KEY AUTO_INCREMENT,
  `cliente_id` integer NOT NULL,
  `seguro_id` integer NOT NULL,
  `cotizacion_id` integer,
  `numero_poliza` varchar(100),
  `compania` varchar(100),
  `ramo` varchar(50) DEFAULT NULL,
  `materia` varchar(300) DEFAULT NULL,
  `producto` varchar(100) DEFAULT NULL,
  `fecha_inicio` date,
  `fecha_vencimiento` date,
  `prima` decimal(12,2),                     -- prima total (UF); bruta = total
  `prima_neta` decimal(12,2) DEFAULT NULL,   -- UF
  `prima_afecta` decimal(12,2) DEFAULT NULL, -- UF
  `prima_exenta` decimal(12,2) DEFAULT NULL, -- UF
  `iva` decimal(12,2) DEFAULT NULL,          -- UF
  `monto_asegurado` decimal(14,2) DEFAULT NULL, -- UF
  `estado` varchar(20) DEFAULT 'activa',
  `origen` varchar(20) NOT NULL,
  `forma_pago` varchar(50) DEFAULT NULL,
  `frecuencia_pago` varchar(20) DEFAULT NULL,
  `num_cuotas` integer DEFAULT NULL,
  `monto_cuota` decimal(12,2) DEFAULT NULL,
  `fecha_proximo_pago` date DEFAULT NULL,
  `materia_asegurada` longtext DEFAULT NULL  -- JSON: detalles según ramo
);

CREATE TABLE `web_poliza_beneficiarios` (
  `id_beneficiario` integer PRIMARY KEY AUTO_INCREMENT,
  `poliza_id` integer NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `rut` varchar(20),
  `relacion` varchar(50)
);

CREATE TABLE `web_poliza_pagos` (
  `id_pago` integer PRIMARY KEY AUTO_INCREMENT,
  `poliza_id` integer NOT NULL,
  `numero_cuota` integer NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `fecha_pago` date DEFAULT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'pendiente',
  `metodo_pago` varchar(50) DEFAULT NULL,
  `referencia_transaccion` varchar(100) DEFAULT NULL,
  `fecha_registro` timestamp DEFAULT (now())
);

CREATE TABLE `web_imagenes` (
  `id_imagen` integer PRIMARY KEY AUTO_INCREMENT,
  `nombre` varchar(200) NOT NULL,
  `url` varchar(500) NOT NULL,
  `descripcion` varchar(500),
  `seccion` varchar(100),
  `activo` boolean DEFAULT true,
  `fecha_creacion` timestamp DEFAULT (now())
);

CREATE TABLE `web_usuarios_internos` (
  `id_usuario` integer PRIMARY KEY AUTO_INCREMENT,
  `username` varchar(50) NOT NULL UNIQUE,
  `nombre` varchar(200) NOT NULL,
  `email` varchar(100) NOT NULL UNIQUE,
  `password_hash` varchar(255) NOT NULL,
  `rol` varchar(50) NOT NULL DEFAULT 'agente',
  `activo` boolean DEFAULT true,
  `fecha_creacion` timestamp DEFAULT (now()),
  `ultimo_ingreso` timestamp
);

ALTER TABLE `web_cotizaciones` ADD FOREIGN KEY (`seguro_id`) REFERENCES `web_seguros_catalogo` (`id_seguro`);

ALTER TABLE `web_cotizaciones` ADD FOREIGN KEY (`cliente_id`) REFERENCES `web_clientes` (`id_cliente`);

ALTER TABLE `web_portal_accesos` ADD FOREIGN KEY (`cliente_id`) REFERENCES `web_clientes` (`id_cliente`);

ALTER TABLE `web_polizas` ADD FOREIGN KEY (`cliente_id`) REFERENCES `web_clientes` (`id_cliente`);

ALTER TABLE `web_polizas` ADD FOREIGN KEY (`seguro_id`) REFERENCES `web_seguros_catalogo` (`id_seguro`);

ALTER TABLE `web_polizas` ADD FOREIGN KEY (`cotizacion_id`) REFERENCES `web_cotizaciones` (`id_cotizacion`);

ALTER TABLE `web_poliza_beneficiarios` ADD FOREIGN KEY (`poliza_id`) REFERENCES `web_polizas` (`id_poliza`);

ALTER TABLE `web_poliza_pagos` ADD FOREIGN KEY (`poliza_id`) REFERENCES `web_polizas` (`id_poliza`);

CREATE TABLE `web_cliente_telefonos` (
  `id_telefono` integer PRIMARY KEY AUTO_INCREMENT,
  `cliente_id` integer NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `tipo` varchar(10) NOT NULL DEFAULT 'telefono',
  FOREIGN KEY (`cliente_id`) REFERENCES `web_clientes` (`id_cliente`) ON DELETE CASCADE
);

CREATE TABLE `web_cliente_emails` (
  `id_email` integer PRIMARY KEY AUTO_INCREMENT,
  `cliente_id` integer NOT NULL,
  `email` varchar(100) NOT NULL,
  FOREIGN KEY (`cliente_id`) REFERENCES `web_clientes` (`id_cliente`) ON DELETE CASCADE
);

CREATE TABLE `web_siniestros` (
  `id_siniestro` integer PRIMARY KEY AUTO_INCREMENT,
  `cliente_id` integer NOT NULL,
  `poliza_id` integer NOT NULL,
  `tipo` varchar(100) NOT NULL,
  `descripcion` text,
  `fecha_ocurrencia` date,
  `etapa` integer NOT NULL DEFAULT 1,
  `estado` varchar(20) NOT NULL DEFAULT 'reportado',
  `fecha_registro` timestamp DEFAULT (now()),
  FOREIGN KEY (`cliente_id`) REFERENCES `web_clientes` (`id_cliente`),
  FOREIGN KEY (`poliza_id`) REFERENCES `web_polizas` (`id_poliza`)
);

CREATE TABLE `web_documentos_cliente` (
  `id_documento` integer PRIMARY KEY AUTO_INCREMENT,
  `cliente_id` integer NOT NULL,
  `poliza_id` integer,
  `nombre` varchar(200) NOT NULL,
  `tipo` varchar(50) NOT NULL DEFAULT 'Documento',
  `estado` varchar(20) NOT NULL DEFAULT 'Disponible',
  `url` varchar(500),
  `fecha_emision` timestamp DEFAULT (now()),
  FOREIGN KEY (`cliente_id`) REFERENCES `web_clientes` (`id_cliente`),
  FOREIGN KEY (`poliza_id`) REFERENCES `web_polizas` (`id_poliza`)
);

CREATE TABLE `web_metodos_pago` (
  `id_metodo` integer PRIMARY KEY AUTO_INCREMENT,
  `cliente_id` integer NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `descripcion` varchar(200),
  `ultimo4` varchar(4),
  `activo` boolean DEFAULT true,
  `fecha_registro` timestamp DEFAULT (now()),
  FOREIGN KEY (`cliente_id`) REFERENCES `web_clientes` (`id_cliente`)
);

INSERT INTO `web_seguros_catalogo` (`nombre`, `categoria`, `ramo`, `descripcion`, `permite_digital`, `permite_tradicional`, `url_externa`, `seguro_activo`, `orden_display`) VALUES
('Seguro de Autos', 'Vehículos', 'auto', 'Cobertura completa para tu vehículo ante accidentes, robo, daños materiales y responsabilidad civil. Incluye vehículo de reemplazo y robo de accesorios.', false, true, NULL, true, 1),
('RCI Argentina', 'Vehículos', 'rci', 'Seguro de Responsabilidad Civil Internacional para vehículos que ingresan a Argentina. Cobertura de 0,17 UF por día. Obligatorio para cruzar la frontera.', true, true, 'https://rcionline.bciseguros.cl/Seguro-Obligatorio-Argentina/Tarifa.aspx?r=NwA4ADQANAA3ADEAMQAxAA==&co=cAByAGkAbQBhAHIAeQA%3D', true, 2),
('SOAP', 'Vehículos', 'soap', 'Seguro Obligatorio de Accidentes Personales causados por vehículos motorizados. Cubre lesiones y muerte de conductores, pasajeros y peatones.', false, true, NULL, true, 3),
('Seguro de Hogar', 'Personas', 'hogar', 'Protege tu vivienda ante incendio, sismo y daños en estructura y contenido. Incluye asistencias técnicas de cerrajería, cristalería, gasfitería y electricidad.', false, true, NULL, true, 4),
('Mujer Segura', 'Personas', 'mujer_segura', 'Seguro de accidentes personales para mujeres de 18 a 80 años. Cubre muerte accidental, incapacidad total y permanente, desmembramiento y gastos de sepelio. Valor: 0,33 UF anual.', false, true, NULL, true, 5),
('Seguro de Accidentes Personales', 'Personas', 'accidentes', 'Cobertura ante lesiones, invalidez o fallecimiento causados por accidentes. Protección para personas naturales con o sin actividad laboral.', false, true, NULL, true, 6),
('Asistencia en Viaje', 'Personas', 'viaje', 'Asistencia médica integral para viajes internacionales: hospitalización, repatriación, pérdida de equipaje y cancelación de viaje. Valor: 0,32 UF anual.', true, true, 'https://viajes.prietocorreaseguros.cl/', true, 7),
('Seguro de Mascotas', 'Personas', 'mascotas', 'Cobertura veterinaria para perros y gatos ante accidentes y enfermedades. Planes Básico (0,15 UF/mes), Medio (0,26 UF/mes) y Full (0,40 UF/mes).', true, true, 'https://cotizadormascotas.bciseguros.cl/inicio/26C75F16605805356643A23BCAED180E', true, 8),
('Seguro de Garantías', 'Empresas y otros', 'garantias', 'Asegura el cumplimiento contractual de tus compromisos con terceros en obras y licitaciones. Cubre seriedad de oferta, fiel cumplimiento, ejecución de obras y más.', false, true, NULL, true, 9);
