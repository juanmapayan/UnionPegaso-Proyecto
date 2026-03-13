export interface PortfolioItem {
  id: string;
  title: string;
  type: 'image' | 'video';
  src: string;
  poster?: string;
  orientation?: 'vertical' | 'horizontal';
  category: string;
  description?: string;
  year?: number;
  tags?: string[];
}

export const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 'alvaro-spot',
    title: 'Spot ALVARO',
    type: 'video',
    src: '/assets/portafolio/ALVARO 0115.mp4',
    orientation: 'vertical',
    category: 'Video',
    description: 'Pieza audiovisual con enfoque en marca personal y narrativa visual.',
    year: 2026,
    tags: ['Spot', 'Branding', 'Storytelling']
  },
  {
    id: 'sergii-spot',
    title: 'Spot SERGII',
    type: 'video',
    src: '/assets/portafolio/SERGII 0121 (1).mp4',
    orientation: 'vertical',
    category: 'Video',
    description: 'Spot dinámico orientado a conversión con ritmo ágil.',
    year: 2026,
    tags: ['Video Ads', 'Performance', 'Creativo']
  },
  {
    id: 'mock-01',
    title: 'Diseño de Landing 01',
    type: 'image',
    src: '/assets/portafolio/WhatsApp Image 2026-01-22 at 15.43.07.jpeg',
    category: 'Diseño Web',
    description: 'Landing visual centrada en propuesta de valor y hero visual.',
    year: 2026,
    tags: ['UI', 'Landing', 'Conversión']
  },
  {
    id: 'mock-02',
    title: 'Diseño de Landing 02',
    type: 'image',
    src: '/assets/portafolio/WhatsApp Image 2026-01-22 at 15.43.07 (1).jpeg',
    category: 'Diseño Web',
    description: 'Variante de layout con foco en secciones de prueba social.',
    year: 2026,
    tags: ['UX', 'Secciones', 'Social Proof']
  },
  {
    id: 'mock-03',
    title: 'Creativo Social 01',
    type: 'image',
    src: '/assets/portafolio/WhatsApp Image 2026-01-22 at 15.52.20.jpeg',
    category: 'Redes Sociales',
    description: 'Creativo vertical optimizado para paid social.',
    year: 2026,
    tags: ['Paid Social', 'Creativo', 'Vertical']
  },
  {
    id: 'mock-04',
    title: 'Creativo Social 02',
    type: 'image',
    src: '/assets/portafolio/WhatsApp Image 2026-01-22 at 15.52.21.jpeg',
    category: 'Redes Sociales',
    description: 'Iteración con énfasis en call-to-action destacado.',
    year: 2026,
    tags: ['CTA', 'Iteración', 'Social Ads']
  },
  {
    id: 'mock-05',
    title: 'Creativo Social 03',
    type: 'image',
    src: '/assets/portafolio/WhatsApp Image 2026-01-22 at 15.52.21 (1).jpeg',
    category: 'Redes Sociales',
    description: 'Variación cromática para test A/B en campañas.',
    year: 2026,
    tags: ['A/B Test', 'Creativo', 'Performance']
  },
  {
    id: 'mock-06',
    title: 'Creativo Social 04',
    type: 'image',
    src: '/assets/portafolio/WhatsApp Image 2026-01-22 at 15.52.21 (2).jpeg',
    category: 'Redes Sociales',
    description: 'Versión enfocada en retención con visual limpio.',
    year: 2026,
    tags: ['Retención', 'Minimal', 'Social']
  },
  {
    id: 'mock-07',
    title: 'Creativo Social 05',
    type: 'image',
    src: '/assets/portafolio/WhatsApp Image 2026-01-22 at 15.57.54.jpeg',
    category: 'Redes Sociales',
    description: 'Creativo con jerarquía tipográfica marcada.',
    year: 2026,
    tags: ['Tipografía', 'Visual', 'Branding']
  },
  {
    id: 'mock-08',
    title: 'Creativo Social 06',
    type: 'image',
    src: '/assets/portafolio/WhatsApp Image 2026-01-22 at 15.57.54 (1).jpeg',
    category: 'Redes Sociales',
    description: 'Cierre de serie creativa para remarketing.',
    year: 2026,
    tags: ['Remarketing', 'Creativo', 'Serie']
  }
];
