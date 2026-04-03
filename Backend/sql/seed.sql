-- Union Pegaso - Datos iniciales (Fase 1)

-- password: password123
INSERT INTO users (nombre, email, password_hash, rol) VALUES
('Admin Unión Pegaso', 'admin@unionpegaso.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Cliente Demo', 'cliente@unionpegaso.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cliente');

INSERT INTO services (title, slug, description, price, icon_key, featured, is_active, display_order) VALUES
('SEO y Posicionamiento', 'seo-y-posicionamiento', 'Optimización SEO técnica y de contenidos para mejorar visibilidad orgánica.', 300.00, 'search', 1, 1, 1),
('Publicidad Digital', 'publicidad-digital', 'Campañas de pago en Google Ads y Meta Ads con foco en conversión.', 450.00, 'megaphone', 1, 1, 2),
('Gestión de Redes Sociales', 'gestion-de-redes-sociales', 'Planificación, diseño y publicación de contenido para redes sociales.', 250.00, 'palette', 1, 1, 3),
('Diseño Web', 'diseno-web', 'Diseño de webs corporativas y landing pages orientadas a negocio.', 600.00, 'code', 1, 1, 4),
('Branding y Creatividad', 'branding-y-creatividad', 'Creatividades, identidad visual y piezas publicitarias para marca.', 350.00, 'zap', 0, 1, 5),
('Consultoría Digital', 'consultoria-digital', 'Análisis de situación y estrategia digital adaptada al cliente.', 150.00, 'trending', 0, 1, 6);

INSERT INTO success_cases (
    title, slug, client, category, excerpt, description,
    metric_value, metric_label, image_url, featured, visible, display_order
) VALUES
(
    'Escalado de captación para clínica local',
    'escalado-captacion-clinica-local',
    'Clínica Demo',
    'Salud',
    'Aumento notable en solicitudes de contacto gracias a campañas y optimización de landings.',
    'Se rediseñó el flujo de captación y se ajustó la estrategia de anuncios y formularios.',
    '+180%',
    'Leads cualificados',
    '/assets/cases/clinica-demo.jpg',
    1,
    1,
    1
),
(
    'Rebranding y contenido para restaurante',
    'rebranding-y-contenido-restaurante',
    'Restaurante Demo',
    'Hostelería',
    'Mejora de imagen de marca y presencia en redes sociales.',
    'Se renovó la identidad visual y se trabajó contenido continuo para redes.',
    '+220%',
    'Interacciones',
    '/assets/cases/restaurante-demo.jpg',
    1,
    1,
    2
),
(
    'Landing de captación para negocio local',
    'landing-de-captacion-negocio-local',
    'Negocio Demo',
    'Servicios',
    'Creación de una landing enfocada a contacto y presupuesto.',
    'Se diseñó una página específica orientada a formularios y llamadas a la acción.',
    '+95%',
    'Conversión web',
    '/assets/cases/negocio-demo.jpg',
    0,
    1,
    3
);

INSERT INTO portfolio_items (
    title, slug, type, media_url, poster_url, orientation, category,
    description, year, featured, visible, display_order
) VALUES
('Landing Clínica', 'landing-clinica', 'image', '/assets/portafolio/landing-clinica.jpg', '/assets/portafolio/landing-clinica.jpg', 'horizontal', 'Diseño Web', 'Landing enfocada a conversión para sector salud.', 2026, 1, 1, 1),
('Creativo Social 01', 'creativo-social-01', 'image', '/assets/portafolio/social-01.jpg', '/assets/portafolio/social-01.jpg', 'vertical', 'Redes Sociales', 'Creativo vertical para campañas en redes.', 2026, 1, 1, 2),
('Creativo Social 02', 'creativo-social-02', 'image', '/assets/portafolio/social-02.jpg', '/assets/portafolio/social-02.jpg', 'vertical', 'Redes Sociales', 'Variación creativa orientada a test A/B.', 2026, 0, 1, 3),
('Proyecto Web 01', 'proyecto-web-01', 'image', '/assets/portafolio/web-01.jpg', '/assets/portafolio/web-01.jpg', 'horizontal', 'Diseño Web', 'Diseño corporativo con estilo oscuro premium.', 2026, 1, 1, 4),
('Video Promocional', 'video-promocional', 'video', '/assets/portafolio/video-promocional.mp4', '/assets/portafolio/video-promocional.jpg', 'vertical', 'Video', 'Pieza de video para campañas publicitarias.', 2026, 0, 1, 5),
('Branding Pack', 'branding-pack', 'image', '/assets/portafolio/branding-pack.jpg', '/assets/portafolio/branding-pack.jpg', 'square', 'Branding', 'Pack visual para identidad de marca.', 2026, 0, 1, 6);

INSERT INTO contact_leads (
    lead_type, nombre, email, telefono, empresa, service_id, budget_range, message, source_page, status
) VALUES
('quote', 'Cliente Interesado', 'lead@demo.com', '600000000', 'Empresa Demo', 1, '500-1500', 'Estoy interesado en mejorar el posicionamiento de mi negocio.', '/presupuesto', 'new');