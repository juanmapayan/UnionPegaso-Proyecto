export interface PortfolioItem {
  id: string;
  title: string;
  type: 'image' | 'video';
  src: string;
  poster?: string;
  category: string;
  description?: string;
  year?: number;
  tags?: string[];
}

export const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 'case-1',
    title: 'Campanya SEO E-commerce',
    type: 'image',
    src: '/assets/portfolio/case-1.webp',
    category: 'SEO',
    description: 'Aumento del 150% en tráfico orgánico',
    year: 2024,
    tags: ['SEO', 'E-commerce', 'Ranking']
  },
  {
    id: 'case-2',
    title: 'Campaña Paid Media SaaS',
    type: 'video',
    src: '/assets/portfolio/campaign-saas.mp4',
    poster: '/assets/portfolio/campaign-saas-poster.webp',
    category: 'Publicidad',
    description: 'Estrategia multicanal con ROAS 4.5x',
    year: 2024,
    tags: ['PPC', 'Google Ads', 'ROI']
  },
  {
    id: 'case-3',
    title: 'Rediseño Web B2B',
    type: 'image',
    src: '/assets/portfolio/web-redesign-b2b.webp',
    category: 'Diseño Web',
    description: 'Nuevo sitio con conversión +35%',
    year: 2024,
    tags: ['UX/UI', 'Conversión', 'B2B']
  },
  {
    id: 'case-4',
    title: 'Social Media Branding',
    type: 'video',
    src: '/assets/portfolio/social-campaign.mp4',
    poster: '/assets/portfolio/social-campaign-poster.webp',
    category: 'Redes Sociales',
    description: 'Estrategia de contenido con 200K alcance',
    year: 2023,
    tags: ['Instagram', 'TikTok', 'Engagement']
  },
  {
    id: 'case-5',
    title: 'Landing Page Conversión',
    type: 'image',
    src: '/assets/portfolio/landing-page.webp',
    category: 'Diseño Web',
    description: 'Tasa de conversión 12% en 30 días',
    year: 2023,
    tags: ['CRO', 'Landing', 'Conversión']
  },
  {
    id: 'case-6',
    title: 'Email Marketing Automation',
    type: 'image',
    src: '/assets/portfolio/email-campaign.webp',
    category: 'Email Marketing',
    description: 'Automatización con ROI 800%',
    year: 2023,
    tags: ['Email', 'Automation', 'Lead Generation']
  }
];
