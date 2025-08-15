export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  imageUrl: string;
  images: string[];
  description: string;
  specifications: { [key: string]: string };
  stock: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  tags: string[];
  material?: string;
  certification?: string[];
  warranty?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
  subcategories: string[];
  productCount: number;
  isPopular?: boolean;
}

// Helper function to generate product IDs
const generateId = (category: string, index: number): string => {
  const categoryCode = category.split('-').map(word => word.charAt(0)).join('').toUpperCase();
  return `${categoryCode}${String(index + 1).padStart(3, '0')}`;
};

// Helper function to generate realistic pricing
const generatePricing = (basePrice: number, hasDiscount = false) => {
  const price = basePrice + Math.floor(Math.random() * basePrice * 0.5);
  if (hasDiscount) {
    const discount = 10 + Math.floor(Math.random() * 30); // 10-40% discount
    const originalPrice = Math.floor(price / (1 - discount / 100));
    return { price, originalPrice, discount };
  }
  return { price };
};

// Brands by category
const brands = {
  'wires-cables': ['Polycab', 'KEI', 'Havells', 'Finolex', 'RR Kabel', 'Anchor'],
  'switches-outlets': ['Legrand', 'Havells', 'Anchor', 'Schneider', 'Panasonic', 'Wipro'],
  'lighting': ['Philips', 'Havells', 'Bajaj', 'Syska', 'Crompton', 'Orient'],
  'circuit-breakers': ['Schneider', 'ABB', 'Siemens', 'Legrand', 'L&T', 'Havells'],
  'conduits': ['Precision', 'Finolex', 'Supreme', 'Captain', 'Astral', 'Prince'],
  'motors': ['Crompton', 'ABB', 'Siemens', 'Havells', 'Kirloskar', 'Bajaj'],
  'panels': ['Schneider', 'ABB', 'Siemens', 'L&T', 'Legrand', 'Havells'],
  'safety': ['3M', 'Honeywell', 'Karam', 'Venus', 'Udyogi', 'Mallcom'],
  'tools': ['Bosch', 'Stanley', 'Makita', 'Black & Decker', 'Dewalt', 'Hitachi'],
  'transformers': ['ABB', 'Schneider', 'Siemens', 'Crompton', 'Havells', 'Kirloskar']
};

// Categories
export const categories: Category[] = [
  {
    id: 'wires-cables',
    name: 'Wires & Cables',
    slug: 'wires-cables',
    description: 'High-quality electrical wires and cables for all applications',
    icon: '🔌',
    image: '/images/wires-and-cables/wires1.jpeg',
    subcategories: ['Power Cables', 'Control Cables', 'Instrumentation Cables', 'House Wires', 'Flexible Cables'],
    productCount: 25,
    isPopular: true,
  },
  {
    id: 'switches-outlets',
    name: 'Switches & Outlets',
    slug: 'switches-outlets',
    description: 'Modern switches and power outlets for residential and commercial use',
    icon: '💡',
    image: '/images/switches/electric_switch_white_bg.jpeg',
    subcategories: ['Wall Switches', 'Industrial Switches', 'Socket Outlets', 'Switch Plates', 'Dimmer Switches'],
    productCount: 25,
    isPopular: true,
  },
  {
    id: 'lighting',
    name: 'Lighting Solutions',
    slug: 'lighting',
    description: 'Energy-efficient lighting solutions for every space',
    icon: '💡',
    image: '/images/lights/philips_bulb_single_white_bg.jpeg',
    subcategories: ['LED Bulbs', 'Tube Lights', 'Event Lights', 'Street Lights', 'Decorative Lights'],
    productCount: 25,
    isPopular: true,
  },
  {
    id: 'circuit-breakers',
    name: 'Circuit Breakers',
    slug: 'circuit-breakers',
    description: 'Reliable circuit protection for electrical systems',
    icon: '⚡',
    image: '/images/circuit-breakers/circuit_breakers_single_white_bg (1).jpeg',
    subcategories: ['MCB', 'MCCB', 'RCBO', 'ACB', 'Miniature Breakers'],
    productCount: 25,
    isPopular: true,
  },
  {
    id: 'conduits',
    name: 'Conduits & Raceways',
    slug: 'conduits',
    description: 'Cable management and protection systems',
    icon: '🔧',
    image: '/images/conduits/electric_conduits_single_white_bg.jpeg',
    subcategories: ['PVC Conduits', 'Metal Conduits', 'Flexible Conduits', 'Cable Trays', 'Ducting'],
    productCount: 25,
  },
  {
    id: 'motors',
    name: 'Electric Motors',
    slug: 'motors',
    description: 'High-performance electric motors for industrial applications',
    icon: '⚙️',
    image: '/images/motors/electric_motors_with_white_bg.jpeg',
    subcategories: ['Induction Motors', 'Servo Motors', 'Stepper Motors', 'DC Motors', 'Gear Motors'],
    productCount: 25,
  },
  {
    id: 'panels',
    name: 'Electrical Panels',
    slug: 'panels',
    description: 'Distribution panels and control systems',
    icon: '📋',
    image: '/images/panels/electric_panels_60w_single_white_bg.jpeg',
    subcategories: ['Distribution Boards', 'Control Panels', 'Motor Control Centers', 'Panel Boards', 'Switch Gear'],
    productCount: 25,
  },
  {
    id: 'safety',
    name: 'Safety Equipment',
    slug: 'safety',
    description: 'Personal protective equipment for electrical work',
    icon: '🦺',
    image: '/images/safety/safety_gloves_single_white_bg.jpeg',
    subcategories: ['Safety Gloves', 'Fire Suits', 'Safety Helmets', 'Insulated Tools', 'Arc Flash Protection'],
    productCount: 25,
  },
  {
    id: 'tools',
    name: 'Tools & Equipment',
    slug: 'tools',
    description: 'Professional electrical tools and testing equipment',
    icon: '🔨',
    image: '/images/tools/electric_tools_single_white_bg.jpeg',
    subcategories: ['Hand Tools', 'Power Tools', 'Testing Equipment', 'Crimping Tools', 'Stripping Tools'],
    productCount: 25,
    isPopular: true,
  },
  {
    id: 'transformers',
    name: 'Transformers',
    slug: 'transformers',
    description: 'Power and distribution transformers',
    icon: '🔄',
    image: '/images/transformer/electric_transformers_should_be_with_white_bg.jpeg',
    subcategories: ['Power Transformers', 'Distribution Transformers', 'Current Transformers', 'Potential Transformers', 'Isolation Transformers'],
    productCount: 25,
  },
];

// Generate comprehensive product catalog
export const products: Product[] = [
  // WIRES & CABLES (25 products)
  ...Array.from({ length: 25 }, (_, i) => {
    const wireImages = [
      '/images/wires-and-cables/wires1.jpeg',
      '/images/wires-and-cables/wires2.jpeg', 
      '/images/wires-and-cables/wires3.jpeg',
      '/images/wires-and-cables/wires4.jpeg',
      '/images/wires-and-cables/wires5.jpeg',
      '/images/wires-and-cables/wires6.jpeg',
      '/images/wires-and-cables/wires7.jpeg',
      '/images/wires-and-cables/wires8.jpeg',
      '/images/wires-and-cables/wires9.jpeg',
      '/images/black_wire.jpeg',
      '/images/black_wire (1).jpeg'
    ];
    
    const wireTypes = [
      'House Wire', 'Power Cable', 'Control Cable', 'Instrumentation Cable', 'Flexible Cable',
      'Armoured Cable', 'Coaxial Cable', 'Fiber Optic Cable', 'Multi-Core Cable', 'Single Core Wire'
    ];
    
    const sizes = ['1.5 sq mm', '2.5 sq mm', '4 sq mm', '6 sq mm', '10 sq mm', '16 sq mm', '25 sq mm', '35 sq mm'];
    const voltages = ['230V', '415V', '1100V', '3.3kV', '11kV'];
    
    const pricing = generatePricing(50, i % 4 === 0);
    const brand = brands['wires-cables'][i % brands['wires-cables'].length];
    const wireType = wireTypes[i % wireTypes.length];
    const size = sizes[i % sizes.length];
    const voltage = voltages[i % voltages.length];
    
    return {
      id: generateId('wires-cables', i),
      name: `${brand} ${wireType} ${size} ${voltage}`,
      slug: `${brand.toLowerCase()}-${wireType.toLowerCase().replace(/\s+/g, '-')}-${size.replace(/\s+/g, '')}-${i + 1}`,
      category: 'wires-cables',
      subcategory: ['Power Cables', 'Control Cables', 'House Wires', 'Flexible Cables'][i % 4],
      brand,
      ...pricing,
      imageUrl: wireImages[i % wireImages.length],
      images: [
        wireImages[i % wireImages.length] || '/product-1.jpg',
        wireImages[(i + 1) % wireImages.length] || '/product-1.jpg',
        wireImages[(i + 2) % wireImages.length] || '/product-1.jpg',
        wireImages[(i + 3) % wireImages.length] || '/product-1.jpg',
        wireImages[(i + 4) % wireImages.length] || '/product-1.jpg',
      ],
      description: `High-quality ${wireType.toLowerCase()} designed for ${voltage} applications. Features excellent insulation and conductor quality for reliable electrical connections.`,
      specifications: {
        'Conductor Size': size,
        'Voltage Rating': voltage,
        'Conductor Material': 'Electrolytic Copper',
        'Insulation': 'PVC/XLPE',
        'Temperature Rating': '90°C',
        'Standards': 'IS 694:2010'
      },
      stock: 50 + Math.floor(Math.random() * 200),
      rating: 4.0 + Math.random() * 1.0,
      reviewCount: 10 + Math.floor(Math.random() * 90),
      inStock: true,
      isNew: i < 3,
      isFeatured: i < 5,
      isPopular: i < 10,
      tags: ['wire', 'cable', 'electrical', 'copper', 'insulated'],
      material: 'Copper',
      certification: ['ISI', 'BIS'],
      warranty: '2 years'
    };
  }),

  // SWITCHES & OUTLETS (25 products)  
  ...Array.from({ length: 25 }, (_, i) => {
    const switchImages = [
      '/images/switches/electric_switch_white_bg.jpeg',
      '/images/switches/electric_switch_white_bg_(1).jpeg',
      '/images/switches/electric_switch_white_bg_(2).jpeg',
      '/images/switches/electric_switch_white_bg_(3).jpeg',
      '/images/switches/industrial_switches_with_white_bg.jpeg',
      '/images/switches/industrial_switches_with_white_bg_(1).jpeg',
      '/images/switches/switch_white_bg.jpeg'
    ];
    
    const switchTypes = [
      'Single Switch', 'Double Switch', 'Triple Switch', 'Socket Outlet', 'USB Socket',
      'Dimmer Switch', 'Fan Regulator', 'Bell Push', 'Indicator Switch', 'Modular Switch'
    ];
    
    const ratings = ['6A', '10A', '16A', '20A', '25A', '32A'];
    const colors = ['White', 'Ivory', 'Silver', 'Black', 'Gold'];
    
    const pricing = generatePricing(80, i % 3 === 0);
    const brand = brands['switches-outlets'][i % brands['switches-outlets'].length];
    const switchType = switchTypes[i % switchTypes.length];
    const rating = ratings[i % ratings.length];
    const color = colors[i % colors.length];
    
    return {
      id: generateId('switches-outlets', i),
      name: `${brand} ${switchType} ${rating} ${color}`,
      slug: `${brand.toLowerCase()}-${switchType.toLowerCase().replace(/\s+/g, '-')}-${rating}-${i + 1}`,
      category: 'switches-outlets',
      subcategory: ['Wall Switches', 'Industrial Switches', 'Socket Outlets', 'Dimmer Switches'][i % 4],
      brand,
      ...pricing,
      imageUrl: switchImages[i % switchImages.length],
      images: [
        switchImages[i % switchImages.length] || '/product-1.jpg',
        switchImages[(i + 1) % switchImages.length] || '/product-1.jpg',
        switchImages[(i + 2) % switchImages.length] || '/product-1.jpg',
        switchImages[(i + 3) % switchImages.length] || '/product-1.jpg',
        switchImages[(i + 4) % switchImages.length] || '/product-1.jpg',
      ],
      description: `Premium quality ${switchType.toLowerCase()} with ${rating} current rating. Features modern design and reliable switching mechanism.`,
      specifications: {
        'Current Rating': rating,
        'Voltage': '230V AC',
        'Material': 'Polycarbonate',
        'Color': color,
        'Mounting': 'Surface/Flush',
        'Standards': 'IS 3854:2007'
      },
      stock: 30 + Math.floor(Math.random() * 150),
      rating: 4.0 + Math.random() * 1.0,
      reviewCount: 15 + Math.floor(Math.random() * 85),
      inStock: true,
      isNew: i < 4,
      isFeatured: i < 6,
      isPopular: i < 8,
      tags: ['switch', 'outlet', 'modular', 'electrical', 'home'],
      material: 'Polycarbonate',
      certification: ['ISI', 'BIS'],
      warranty: '5 years'
    };
  }),

  // LIGHTING SOLUTIONS (25 products)
  ...Array.from({ length: 25 }, (_, i) => {
    const lightImages = [
      '/images/lights/philips_bulb_single_white_bg.jpeg',
      '/images/lights/philips_bulb_single_white_bg (1).jpeg',
      '/images/lights/philips_bulb_single_white_bg (2).jpeg',
      '/images/lights/philips_bulb_single_white_bg (3).jpeg',
      '/images/lights/philips_bulb_single_white_bg (4).jpeg',
      '/images/lights/tube_lights_60w_single_white_bg (1).jpeg',
      '/images/lights/tube_lights_60w_single_white_bg (2).jpeg',
      '/images/lights/event_lights_60w_single_white_bg.jpeg',
      '/images/lights/event_lights_60w_single_white_bg (1).jpeg',
      '/images/lights/event_lights_60w_single_white_bg (2).jpeg'
    ];
    
    const lightTypes = [
      'LED Bulb', 'Tube Light', 'Event Light', 'Street Light', 'Panel Light',
      'Flood Light', 'Spot Light', 'Emergency Light', 'Solar Light', 'Smart Bulb'
    ];
    
    const wattages = ['9W', '12W', '15W', '18W', '20W', '24W', '36W', '40W', '60W', '100W'];
    const colorTemps = ['2700K', '3000K', '4000K', '6500K'];
    
    const pricing = generatePricing(150, i % 5 === 0);
    const brand = brands['lighting'][i % brands['lighting'].length];
    const lightType = lightTypes[i % lightTypes.length];
    const wattage = wattages[i % wattages.length];
    const colorTemp = colorTemps[i % colorTemps.length];
    
    return {
      id: generateId('lighting', i),
      name: `${brand} ${lightType} ${wattage} ${colorTemp}`,
      slug: `${brand.toLowerCase()}-${lightType.toLowerCase().replace(/\s+/g, '-')}-${wattage}-${i + 1}`,
      category: 'lighting',
      subcategory: ['LED Bulbs', 'Tube Lights', 'Event Lights', 'Panel Lights'][i % 4],
      brand,
      ...pricing,
      imageUrl: lightImages[i % lightImages.length],
      images: [
        lightImages[i % lightImages.length] || '/product-1.jpg',
        lightImages[(i + 1) % lightImages.length] || '/product-1.jpg',
        lightImages[(i + 2) % lightImages.length] || '/product-1.jpg',
        lightImages[(i + 3) % lightImages.length] || '/product-1.jpg',
        lightImages[(i + 4) % lightImages.length] || '/product-1.jpg',
      ],
      description: `Energy-efficient ${lightType.toLowerCase()} with ${wattage} power consumption. Provides bright, uniform illumination with long lifespan.`,
      specifications: {
        'Wattage': wattage,
        'Color Temperature': colorTemp,
        'Lumens': `${parseInt(wattage) * 80}-${parseInt(wattage) * 120}`,
        'Voltage': '220-240V AC',
        'Life': '25,000 hours',
        'Base Type': 'B22/E27'
      },
      stock: 40 + Math.floor(Math.random() * 160),
      rating: 4.2 + Math.random() * 0.8,
      reviewCount: 20 + Math.floor(Math.random() * 80),
      inStock: true,
      isNew: i < 5,
      isFeatured: i < 7,
      isPopular: i < 12,
      tags: ['led', 'light', 'energy-efficient', 'bright', 'durable'],
      material: 'Aluminum/Plastic',
      certification: ['BEE', 'ISI'],
      warranty: '2 years'
    };
  }),

  // CIRCUIT BREAKERS (25 products)
  ...Array.from({ length: 25 }, (_, i) => {
    const breakerImages = [
      '/images/circuit-breakers/circuit_breakers_single_white_bg (1).jpeg',
      '/images/circuit-breakers/circuit_breakers_single_white_bg (2).jpeg',
      '/images/circuit-breakers/circuit_breakers_single_white_bg (3).jpeg',
      '/images/circuit-breakers/circuit_breakers_single_white_bg (4).jpeg',
      '/images/circuit-breakers/circuit_breakers_single_white_bg (5).jpeg',
      '/images/circuit-breakers/circuit_breakers_single_white_bg (6).jpeg',
      '/images/circuit-breakers/circuit_breakers_single_white_bg (7).jpeg',
      '/images/circuit-breakers/circuit_breakers_single_white_bg (8).jpeg',
      '/images/circuit-breakers/circuit_breakers_single_white_bg (9).jpeg',
      '/images/circuit-breakers/circuit_breakers_single_white_bg (10).jpeg'
    ];
    
    const breakerTypes = ['MCB', 'MCCB', 'RCBO', 'ELCB', 'ACB'];
    const ratings = ['6A', '10A', '16A', '20A', '25A', '32A', '40A', '50A', '63A', '100A'];
    const poles = ['Single Pole', 'Double Pole', 'Triple Pole', 'Four Pole'];
    const curves = ['C Curve', 'B Curve', 'D Curve'];
    
    const pricing = generatePricing(200, i % 4 === 0);
    const brand = brands['circuit-breakers'][i % brands['circuit-breakers'].length];
    const breakerType = breakerTypes[i % breakerTypes.length];
    const rating = ratings[i % ratings.length];
    const pole = poles[i % poles.length];
    const curve = curves[i % curves.length];
    
    return {
      id: generateId('circuit-breakers', i),
      name: `${brand} ${breakerType} ${rating} ${pole} ${curve}`,
      slug: `${brand.toLowerCase()}-${breakerType.toLowerCase()}-${rating}-${pole.toLowerCase().replace(/\s+/g, '-')}-${i + 1}`,
      category: 'circuit-breakers',
      subcategory: ['MCB', 'MCCB', 'RCBO', 'ELCB'][i % 4],
      brand,
      ...pricing,
      imageUrl: breakerImages[i % breakerImages.length],
      images: [
        breakerImages[i % breakerImages.length] || '/product-1.jpg',
        breakerImages[(i + 1) % breakerImages.length] || '/product-1.jpg',
        breakerImages[(i + 2) % breakerImages.length] || '/product-1.jpg',
        breakerImages[(i + 3) % breakerImages.length] || '/product-1.jpg',
        breakerImages[(i + 4) % breakerImages.length] || '/product-1.jpg',
      ],
      description: `Reliable ${breakerType} circuit breaker with ${rating} current rating. Provides excellent protection against overload and short circuit conditions.`,
      specifications: {
        'Type': breakerType,
        'Current Rating': rating,
        'Poles': pole,
        'Breaking Capacity': '6kA',
        'Trip Curve': curve,
        'Standards': 'IEC 60898'
      },
      stock: 25 + Math.floor(Math.random() * 100),
      rating: 4.3 + Math.random() * 0.7,
      reviewCount: 12 + Math.floor(Math.random() * 70),
      inStock: true,
      isNew: i < 3,
      isFeatured: i < 6,
      isPopular: i < 10,
      tags: ['mcb', 'protection', 'circuit-breaker', 'safety', 'electrical'],
      material: 'Thermoplastic',
      certification: ['IEC', 'IS'],
      warranty: '3 years'
    };
  }),

  // CONDUITS (25 products)
  ...Array.from({ length: 25 }, (_, i) => {
    const conduitImages = [
      '/images/conduits/electric_conduits_single_white_bg.jpeg',
      '/images/conduits/electric_conduits_single_white_bg (1).jpeg',
      '/images/conduits/electric_conduits_single_white_bg (2).jpeg',
      '/images/conduits/electric_conduits_single_white_bg (3).jpeg',
      '/images/conduits/electric_conduits_single_white_bg (4).jpeg',
      '/images/conduits/electric_conduits_single_white_bg (5).jpeg',
      '/images/conduits/electric_conduits_single_white_bg (6).jpeg',
      '/images/conduits/electric_conduits_single_white_bg (7).jpeg'
    ];
    
    const conduitTypes = ['PVC Conduit', 'Metal Conduit', 'Flexible Conduit', 'EMT Conduit', 'Rigid Conduit'];
    const sizes = ['16mm', '20mm', '25mm', '32mm', '40mm', '50mm', '63mm', '75mm'];
    const colors = ['White', 'Black', 'Grey', 'Orange'];
    
    const pricing = generatePricing(30, i % 6 === 0);
    const brand = brands['conduits'][i % brands['conduits'].length];
    const conduitType = conduitTypes[i % conduitTypes.length];
    const size = sizes[i % sizes.length];
    const color = colors[i % colors.length];
    
    return {
      id: generateId('conduits', i),
      name: `${brand} ${conduitType} ${size} ${color}`,
      slug: `${brand.toLowerCase()}-${conduitType.toLowerCase().replace(/\s+/g, '-')}-${size}-${i + 1}`,
      category: 'conduits',
      subcategory: ['PVC Conduits', 'Metal Conduits', 'Flexible Conduits', 'Cable Trays'][i % 4],
      brand,
      ...pricing,
      imageUrl: conduitImages[i % conduitImages.length],
      images: [
        conduitImages[i % conduitImages.length] || '/product-1.jpg',
        conduitImages[(i + 1) % conduitImages.length] || '/product-1.jpg',
        conduitImages[(i + 2) % conduitImages.length] || '/product-1.jpg',
        conduitImages[(i + 3) % conduitImages.length] || '/product-1.jpg',
        conduitImages[(i + 4) % conduitImages.length] || '/product-1.jpg',
      ],
      description: `High-quality ${conduitType.toLowerCase()} for cable protection and management. Suitable for residential and commercial electrical installations.`,
      specifications: {
        'Type': conduitType,
        'Size': size,
        'Color': color,
        'Material': conduitType.includes('PVC') ? 'PVC' : 'Metal',
        'Length': '3 meters',
        'Standards': 'IS 9537'
      },
      stock: 60 + Math.floor(Math.random() * 200),
      rating: 4.1 + Math.random() * 0.9,
      reviewCount: 8 + Math.floor(Math.random() * 60),
      inStock: true,
      isNew: i < 4,
      isFeatured: i < 5,
      isPopular: i < 8,
      tags: ['conduit', 'cable-management', 'protection', 'electrical', 'installation'],
      material: conduitType.includes('PVC') ? 'PVC' : 'Metal',
      certification: ['ISI'],
      warranty: '10 years'
    };
  }),

  // MOTORS (25 products)
  ...Array.from({ length: 25 }, (_, i) => {
    const motorImages = [
      '/images/motors/electric_motors_with_white_bg.jpeg',
      '/images/motors/electric_motors_with_white_bg (1).jpeg',
      '/images/motors/electric_motors_with_white_bg (2).jpeg',
      '/images/motors/electric_motors_with_white_bg (3).jpeg',
      '/images/motors/electric_motors_with_white_bg (4).jpeg',
      '/images/motors/electric_motors_with_white_bg (5).jpeg',
      '/images/motors/electric_motors_with_white_bg (6).jpeg',
      '/images/motors/electric_motors_with_white_bg (7).jpeg'
    ];
    
    const motorTypes = ['Induction Motor', 'Servo Motor', 'Stepper Motor', 'DC Motor', 'Gear Motor'];
    const powers = ['0.5HP', '1HP', '2HP', '3HP', '5HP', '7.5HP', '10HP', '15HP'];
    const speeds = ['1440 RPM', '2880 RPM', '3600 RPM', '1800 RPM'];
    const phases = ['Single Phase', 'Three Phase'];
    
    const pricing = generatePricing(2500, i % 3 === 0);
    const brand = brands['motors'][i % brands['motors'].length];
    const motorType = motorTypes[i % motorTypes.length];
    const power = powers[i % powers.length];
    const speed = speeds[i % speeds.length];
    const phase = phases[i % phases.length];
    
    return {
      id: generateId('motors', i),
      name: `${brand} ${motorType} ${power} ${phase}`,
      slug: `${brand.toLowerCase()}-${motorType.toLowerCase().replace(/\s+/g, '-')}-${power.replace(/\./g, '-')}-${i + 1}`,
      category: 'motors',
      subcategory: ['Induction Motors', 'Servo Motors', 'DC Motors', 'Gear Motors'][i % 4],
      brand,
      ...pricing,
      imageUrl: motorImages[i % motorImages.length],
      images: [
        motorImages[i % motorImages.length] || '/product-1.jpg',
        motorImages[(i + 1) % motorImages.length] || '/product-1.jpg',
        motorImages[(i + 2) % motorImages.length] || '/product-1.jpg',
        motorImages[(i + 3) % motorImages.length] || '/product-1.jpg',
        motorImages[(i + 4) % motorImages.length] || '/product-1.jpg',
      ],
      description: `High-performance ${motorType.toLowerCase()} with ${power} rating. Designed for industrial applications with excellent efficiency and reliability.`,
      specifications: {
        'Type': motorType,
        'Power': power,
        'Speed': speed,
        'Phase': phase,
        'Voltage': phase === 'Single Phase' ? '230V' : '415V',
        'Efficiency': 'IE2/IE3'
      },
      stock: 10 + Math.floor(Math.random() * 50),
      rating: 4.4 + Math.random() * 0.6,
      reviewCount: 15 + Math.floor(Math.random() * 40),
      inStock: true,
      isNew: i < 3,
      isFeatured: i < 4,
      isPopular: i < 8,
      tags: ['motor', 'industrial', 'power', 'machinery', 'electric'],
      material: 'Cast Iron',
      certification: ['IE2', 'IE3', 'BIS'],
      warranty: '2 years'
    };
  }),

  // PANELS (25 products)
  ...Array.from({ length: 25 }, (_, i) => {
    const panelImages = [
      '/images/panels/electric_panels_60w_single_white_bg.jpeg',
      '/images/panels/electric_panels_60w_single_white_bg (1).jpeg',
      '/images/panels/electric_panels_60w_single_white_bg (2).jpeg',
      '/images/panels/electric_panels_60w_single_white_bg (3).jpeg',
      '/images/panels/electric_panels_60w_single_white_bg (4).jpeg',
      '/images/panels/electric_panels_60w_single_white_bg (5).jpeg'
    ];
    
    const panelTypes = ['Distribution Board', 'Control Panel', 'MCC Panel', 'PCC Panel', 'APFC Panel'];
    const ratings = ['25A', '32A', '63A', '100A', '160A', '250A', '400A', '630A'];
    const ways = ['4 Way', '6 Way', '8 Way', '12 Way', '18 Way', '24 Way', '36 Way'];
    
    const pricing = generatePricing(1500, i % 4 === 0);
    const brand = brands['panels'][i % brands['panels'].length];
    const panelType = panelTypes[i % panelTypes.length];
    const rating = ratings[i % ratings.length];
    const way = ways[i % ways.length];
    
    return {
      id: generateId('panels', i),
      name: `${brand} ${panelType} ${rating} ${way}`,
      slug: `${brand.toLowerCase()}-${panelType.toLowerCase().replace(/\s+/g, '-')}-${rating}-${way.replace(/\s+/g, '-')}-${i + 1}`,
      category: 'panels',
      subcategory: ['Distribution Boards', 'Control Panels', 'Motor Control Centers', 'Switch Gear'][i % 4],
      brand,
      ...pricing,
      imageUrl: panelImages[i % panelImages.length],
      images: [
        panelImages[i % panelImages.length] || '/product-1.jpg',
        panelImages[(i + 1) % panelImages.length] || '/product-1.jpg',
        panelImages[(i + 2) % panelImages.length] || '/product-1.jpg',
        panelImages[(i + 3) % panelImages.length] || '/product-1.jpg',
        panelImages[(i + 4) % panelImages.length] || '/product-1.jpg',
      ],
      description: `Robust ${panelType.toLowerCase()} with ${rating} main switch capacity. Features ${way.toLowerCase()} for organized power distribution.`,
      specifications: {
        'Type': panelType,
        'Main Switch': rating,
        'Ways': way,
        'Material': 'MS Powder Coated',
        'IP Rating': 'IP54',
        'Standards': 'IS 8623'
      },
      stock: 15 + Math.floor(Math.random() * 75),
      rating: 4.2 + Math.random() * 0.8,
      reviewCount: 10 + Math.floor(Math.random() * 50),
      inStock: true,
      isNew: i < 4,
      isFeatured: i < 5,
      isPopular: i < 6,
      tags: ['panel', 'distribution', 'control', 'electrical', 'switchgear'],
      material: 'MS Steel',
      certification: ['ISI', 'BIS'],
      warranty: '5 years'
    };
  }),

  // SAFETY EQUIPMENT (25 products)
  ...Array.from({ length: 25 }, (_, i) => {
    const safetyImages = [
      '/images/safety/safety_gloves_single_white_bg.jpeg',
      '/images/safety/safety_gloves_single_white_bg (1).jpeg',
      '/images/safety/safety_gloves_single_white_bg (2).jpeg',
      '/images/safety/safety_gloves_single_white_bg (3).jpeg',
      '/images/safety/fireman_suit_safety_single_white_bg.jpeg',
      '/images/safety/fireman_suit_safety_single_white_bg (1).jpeg',
      '/images/safety/fireman_suit_safety_single_white_bg (2).jpeg',
      '/images/safety/fireman_suit_safety_single_white_bg (3).jpeg'
    ];
    
    const safetyTypes = [
      'Safety Gloves', 'Fire Suit', 'Safety Helmet', 'Safety Shoes', 'Safety Goggles',
      'Arc Flash Suit', 'Insulated Tools', 'Fall Protection', 'First Aid Kit', 'Safety Harness'
    ];
    
    const voltageRatings = ['1kV', '11kV', '33kV', '132kV'];
    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    const colors = ['Red', 'Yellow', 'Orange', 'Blue', 'White'];
    
    const pricing = generatePricing(500, i % 5 === 0);
    const brand = brands['safety'][i % brands['safety'].length];
    const safetyType = safetyTypes[i % safetyTypes.length];
    const voltageRating = voltageRatings[i % voltageRatings.length];
    const size = sizes[i % sizes.length];
    const color = colors[i % colors.length];
    
    return {
      id: generateId('safety', i),
      name: `${brand} ${safetyType} ${voltageRating} Size ${size}`,
      slug: `${brand.toLowerCase()}-${safetyType.toLowerCase().replace(/\s+/g, '-')}-${voltageRating}-${size}-${i + 1}`,
      category: 'safety',
      subcategory: ['Safety Gloves', 'Fire Suits', 'Safety Helmets', 'Insulated Tools'][i % 4],
      brand,
      ...pricing,
      imageUrl: safetyImages[i % safetyImages.length],
      images: [
        safetyImages[i % safetyImages.length] || '/product-1.jpg',
        safetyImages[(i + 1) % safetyImages.length] || '/product-1.jpg',
        safetyImages[(i + 2) % safetyImages.length] || '/product-1.jpg',
        safetyImages[(i + 3) % safetyImages.length] || '/product-1.jpg',
        safetyImages[(i + 4) % safetyImages.length] || '/product-1.jpg',
      ],
      description: `Professional ${safetyType.toLowerCase()} rated for ${voltageRating} electrical work. Provides excellent protection and comfort for electrical professionals.`,
      specifications: {
        'Type': safetyType,
        'Voltage Rating': voltageRating,
        'Size': size,
        'Color': color,
        'Material': 'Flame Resistant',
        'Standards': 'ASTM/EN/IS'
      },
      stock: 20 + Math.floor(Math.random() * 80),
      rating: 4.3 + Math.random() * 0.7,
      reviewCount: 12 + Math.floor(Math.random() * 60),
      inStock: true,
      isNew: i < 5,
      isFeatured: i < 6,
      isPopular: i < 10,
      tags: ['safety', 'protection', 'electrical', 'ppe', 'workwear'],
      material: 'Flame Resistant Fabric',
      certification: ['ASTM', 'EN', 'IS'],
      warranty: '1 year'
    };
  }),

  // TOOLS & EQUIPMENT (25 products)
  ...Array.from({ length: 25 }, (_, i) => {
    const toolImages = [
      '/images/tools/electric_tools_single_white_bg.jpeg',
      '/images/tools/electric_tools_single_white_bg (1).jpeg',
      '/images/tools/electric_tools_single_white_bg (2).jpeg',
      '/images/tools/electric_tools_single_white_bg (3).jpeg',
      '/images/tools/electric_tools_single_white_bg (4).jpeg',
      '/images/tools/electric_tools_single_white_bg (5).jpeg',
      '/images/tools/screwdriver_single_white_bg.jpeg',
      '/images/tools/screwdriver_single_white_bg (1).jpeg',
      '/images/tools/screwdriver_single_white_bg (2).jpeg',
      '/images/tools/screwdriver_single_white_bg (3).jpeg'
    ];
    
    const toolTypes = [
      'Wire Stripper', 'Crimping Tool', 'Digital Multimeter', 'Insulation Tester', 'Earth Tester',
      'Screwdriver Set', 'Pliers Set', 'Cable Cutter', 'Voltage Tester', 'Oscilloscope'
    ];
    
    const ranges = ['600V', '1000V', '1500V', '2500V'];
    const accuracies = ['±0.5%', '±1%', '±2%', '±3%'];
    
    const pricing = generatePricing(800, i % 3 === 0);
    const brand = brands['tools'][i % brands['tools'].length];
    const toolType = toolTypes[i % toolTypes.length];
    const range = ranges[i % ranges.length];
    const accuracy = accuracies[i % accuracies.length];
    
    return {
      id: generateId('tools', i),
      name: `${brand} ${toolType} ${range} ${accuracy}`,
      slug: `${brand.toLowerCase()}-${toolType.toLowerCase().replace(/\s+/g, '-')}-${range}-${i + 1}`,
      category: 'tools',
      subcategory: ['Hand Tools', 'Power Tools', 'Testing Equipment', 'Crimping Tools'][i % 4],
      brand,
      ...pricing,
      imageUrl: toolImages[i % toolImages.length],
      images: [
        toolImages[i % toolImages.length] || '/product-1.jpg',
        toolImages[(i + 1) % toolImages.length] || '/product-1.jpg',
        toolImages[(i + 2) % toolImages.length] || '/product-1.jpg',
        toolImages[(i + 3) % toolImages.length] || '/product-1.jpg',
        toolImages[(i + 4) % toolImages.length] || '/product-1.jpg',
      ],
      description: `Professional grade ${toolType.toLowerCase()} with ${range} voltage range and ${accuracy} accuracy. Essential tool for electrical professionals.`,
      specifications: {
        'Type': toolType,
        'Voltage Range': range,
        'Accuracy': accuracy,
        'Display': 'Digital LCD',
        'Safety Rating': 'CAT III',
        'Standards': 'IEC 61010'
      },
      stock: 25 + Math.floor(Math.random() * 100),
      rating: 4.4 + Math.random() * 0.6,
      reviewCount: 18 + Math.floor(Math.random() * 70),
      inStock: true,
      isNew: i < 4,
      isFeatured: i < 7,
      isPopular: i < 12,
      tags: ['tools', 'testing', 'electrical', 'professional', 'measurement'],
      material: 'High Grade Plastic/Metal',
      certification: ['IEC', 'CAT III'],
      warranty: '2 years'
    };
  }),

  // TRANSFORMERS (25 products)
  ...Array.from({ length: 25 }, (_, i) => {
    const transformerImages = [
      '/images/transformer/electric_transformers_should_be_with_white_bg.jpeg',
      '/images/transformer/electric_transformers_should_be_with_white_bg (1).jpeg',
      '/images/transformer/electric_transformers_should_be_with_white_bg (2).jpeg',
      '/images/transformer/electric_transformers_should_be_with_white_bg (3).jpeg',
      '/images/transformer/electric_transformers_should_be_with_white_bg (4).jpeg',
      '/images/transformer/electric_transformers_should_be_with_white_bg (5).jpeg',
      '/images/transformer/electric_transformers_should_be_with_white_bg (6).jpeg',
      '/images/transformer/electric_transformers_should_be_with_white_bg (7).jpeg'
    ];
    
    const transformerTypes = [
      'Distribution Transformer', 'Power Transformer', 'Current Transformer', 'Potential Transformer', 'Isolation Transformer'
    ];
    
    const kvaRatings = ['25kVA', '63kVA', '100kVA', '160kVA', '250kVA', '400kVA', '630kVA', '1000kVA'];
    const voltageRatios = ['11kV/433V', '33kV/11kV', '132kV/33kV', '230V/110V'];
    const coolingTypes = ['ONAN', 'ONAF', 'OFAF', 'ODAF'];
    
    const pricing = generatePricing(25000, i % 3 === 0);
    const brand = brands['transformers'][i % brands['transformers'].length];
    const transformerType = transformerTypes[i % transformerTypes.length];
    const kvaRating = kvaRatings[i % kvaRatings.length];
    const voltageRatio = voltageRatios[i % voltageRatios.length];
    const coolingType = coolingTypes[i % coolingTypes.length];
    
    return {
      id: generateId('transformers', i),
      name: `${brand} ${transformerType} ${kvaRating} ${voltageRatio}`,
      slug: `${brand.toLowerCase()}-${transformerType.toLowerCase().replace(/\s+/g, '-')}-${kvaRating.toLowerCase()}-${i + 1}`,
      category: 'transformers',
      subcategory: ['Distribution Transformers', 'Power Transformers', 'Current Transformers', 'Isolation Transformers'][i % 4],
      brand,
      ...pricing,
      imageUrl: transformerImages[i % transformerImages.length],
      images: [
        transformerImages[i % transformerImages.length] || '/product-1.jpg',
        transformerImages[(i + 1) % transformerImages.length] || '/product-1.jpg',
        transformerImages[(i + 2) % transformerImages.length] || '/product-1.jpg',
        transformerImages[(i + 3) % transformerImages.length] || '/product-1.jpg',
        transformerImages[(i + 4) % transformerImages.length] || '/product-1.jpg',
      ],
      description: `High-efficiency ${transformerType.toLowerCase()} with ${kvaRating} capacity. Features ${coolingType} cooling for reliable power transformation.`,
      specifications: {
        'Type': transformerType,
        'Rating': kvaRating,
        'Voltage Ratio': voltageRatio,
        'Cooling': coolingType,
        'Frequency': '50Hz',
        'Standards': 'IS 1180'
      },
      stock: 5 + Math.floor(Math.random() * 25),
      rating: 4.5 + Math.random() * 0.5,
      reviewCount: 8 + Math.floor(Math.random() * 30),
      inStock: true,
      isNew: i < 2,
      isFeatured: i < 3,
      isPopular: i < 5,
      tags: ['transformer', 'power', 'distribution', 'electrical', 'industrial'],
      material: 'CRGO Steel Core',
      certification: ['ISI', 'BIS', 'IEC'],
      warranty: '5 years'
    };
  }),
];

// Helper function to get products by category
export const getProductsByCategory = (categorySlug: string): Product[] => {
  if (categorySlug === 'all') {
    return products;
  }
  return products.filter(product => product.category === categorySlug);
};

// Helper function to search products
export const searchProducts = (query: string): Product[] => {
  const searchTerm = query.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(searchTerm) ||
    product.brand.toLowerCase().includes(searchTerm) ||
    product.description.toLowerCase().includes(searchTerm) ||
    product.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    product.category.toLowerCase().includes(searchTerm)
  );
};

// Helper function to get featured products
export const getFeaturedProducts = (): Product[] => {
  return products.filter(product => product.isFeatured).slice(0, 12);
};

// Helper function to get popular products
export const getPopularProducts = (): Product[] => {
  return products.filter(product => product.isPopular).slice(0, 16);
};

// Helper function to get new products
export const getNewProducts = (): Product[] => {
  return products.filter(product => product.isNew).slice(0, 8);
};