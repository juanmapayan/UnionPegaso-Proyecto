-- Union Pegaso Seed Data

-- Users (password is 'password123' hashed)
INSERT INTO `users` (`nombre`, `email`, `password_hash`, `rol`) VALUES
('Admin User', 'admin@unionpegaso.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Test User', 'user@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cliente');

-- Services
INSERT INTO `services` (`title`, `description`, `price`, `is_active`, `display_order`) VALUES
('Consultoría Básica', 'Una hora de consultoría sobre estrategia digital.', 50.00, 1, 1),
('Desarrollo Web', 'Landing page simple con formulario de contacto.', 300.00, 1, 2),
('SEO Audit', 'Auditoría completa de SEO para su sitio web.', 150.00, 1, 3),
('Mantenimiento Mensual', 'Soporte y actualizaciones mensuales.', 100.00, 0, 4);

-- Example Purchase
INSERT INTO `purchases` (`id_usuario`, `fecha`, `total`) VALUES
(2, NOW(), 350.00);

-- Purchase Items
INSERT INTO `purchase_items` (`id_compra`, `id_servicio`, `cantidad`, `precio_unitario`, `subtotal`) VALUES
(1, 1, 1, 50.00, 50.00),
(1, 2, 1, 300.00, 300.00);

-- Reviews
INSERT INTO `reviews` (`id_usuario`, `id_servicio`, `texto`, `rating`) VALUES
(2, 1, 'Excelente servicio, muy claro todo.', 5),
(2, 2, 'Buen trabajo, entregado a tiempo.', 4);
