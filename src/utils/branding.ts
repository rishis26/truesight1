// Branding Configuration for trueSight
export const BRAND_CONFIG = {
  companyName: 'trueSight',
  slogan: 'AUTHORITY OF ACCURACY.',
  tagline: 'Advanced Threat Detection & Analysis',
  
  // Logo variants - using actual logo files from public/logo/
  logos: {
    logo: {
      name: 'trueSight Logo',
      description: 'Main logo emblem',
      file: '/logo/logo.png',
      alt: 'trueSight logo emblem'
    },
    nameLogo: {
      name: 'trueSight Name Logo',
      description: 'Company name logo',
      file: '/logo/name_logo.png',
      alt: 'trueSight company name'
    }
  },
  
  // Color scheme
  colors: {
    primary: '#D4AF37', // Metallic gold
    secondary: '#1F2937', // Dark gray
    accent: '#3B82F6', // Blue accent
    background: {
      light: '#F9FAFB',
      dark: '#111827'
    }
  },
  
  // Typography
  fonts: {
    primary: 'Inter, system-ui, sans-serif',
    display: 'Inter, system-ui, sans-serif'
  }
};

// Brand display helpers
export const getBrandDisplay = (variant: 'full' | 'name' | 'slogan' | 'tagline' = 'full') => {
  switch (variant) {
    case 'full':
      return `${BRAND_CONFIG.companyName} - ${BRAND_CONFIG.slogan}`;
    case 'name':
      return BRAND_CONFIG.companyName;
    case 'slogan':
      return BRAND_CONFIG.slogan;
    case 'tagline':
      return BRAND_CONFIG.tagline;
    default:
      return BRAND_CONFIG.companyName;
  }
};
