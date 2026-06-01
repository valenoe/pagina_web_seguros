CREATE TABLE `web_seguros_catalogo` (
  `id_seguro` integer PRIMARY KEY AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `permite_digital` boolean DEFAULT false,
  `permite_tradicional` boolean DEFAULT true,
  `url_externa` varchar(500),
  `seguro_activo` boolean DEFAULT true,
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
  `email` varchar(100),
  `telefono` varchar(20),
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
  `fecha_inicio` date,
  `fecha_vencimiento` date,
  `prima` decimal(12,2),
  `estado` varchar(20) DEFAULT 'activa',
  `origen` varchar(20) NOT NULL
);

CREATE TABLE `web_poliza_beneficiarios` (
  `id_beneficiario` integer PRIMARY KEY AUTO_INCREMENT,
  `poliza_id` integer NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `rut` varchar(20),
  `relacion` varchar(50)
);

ALTER TABLE `web_cotizaciones` ADD FOREIGN KEY (`seguro_id`) REFERENCES `web_seguros_catalogo` (`id_seguro`);

ALTER TABLE `web_cotizaciones` ADD FOREIGN KEY (`cliente_id`) REFERENCES `web_clientes` (`id_cliente`);

ALTER TABLE `web_portal_accesos` ADD FOREIGN KEY (`cliente_id`) REFERENCES `web_clientes` (`id_cliente`);

ALTER TABLE `web_polizas` ADD FOREIGN KEY (`cliente_id`) REFERENCES `web_clientes` (`id_cliente`);

ALTER TABLE `web_polizas` ADD FOREIGN KEY (`seguro_id`) REFERENCES `web_seguros_catalogo` (`id_seguro`);

ALTER TABLE `web_polizas` ADD FOREIGN KEY (`cotizacion_id`) REFERENCES `web_cotizaciones` (`id_cotizacion`);

ALTER TABLE `web_poliza_beneficiarios` ADD FOREIGN KEY (`poliza_id`) REFERENCES `web_polizas` (`id_poliza`);
