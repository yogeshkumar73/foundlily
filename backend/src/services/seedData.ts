import { hashPassword } from '../utils';

export const initialUsers = [
  {
    _id: 'u-admin',
    name: 'Admin Founder',
    email: 'admin@foundlily.com',
    passwordHash: hashPassword('admin123'),
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: 'admin' as const,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'u-user1',
    name: 'Sarah Chen',
    email: 'user@foundlily.com',
    passwordHash: hashPassword('user123'),
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    role: 'user' as const,
    createdAt: new Date().toISOString(),
  },
];

export const initialCategories = [
  { _id: 'cat-ai', name: 'Artificial Intelligence', slug: 'ai', description: 'Next-gen LLMs, computer vision, neural networks and generative AI tools.', icon: 'Cpu', isActive: true },
  { _id: 'cat-fintech', name: 'FinTech & DeFi', slug: 'fintech', description: 'Payment gateways, decentralized finance, banking infrastructure and wealthtech.', icon: 'Wallet', isActive: true },
  { _id: 'cat-health', name: 'Biotech & Health', slug: 'health', description: 'Digital therapeutics, precision medicine, genomic sequencing and telemedicine.', icon: 'Activity', isActive: true },
  { _id: 'cat-climate', name: 'Climate & CleanTech', slug: 'climate', description: 'Carbon capture, renewable energy grids, battery storage and green mobility.', icon: 'Leaf', isActive: true },
  { _id: 'cat-saas', name: 'Enterprise SaaS', slug: 'saas', description: 'B2B workflow automation, developer tools, cloud security and productivity suites.', icon: 'Cloud', isActive: true },
  { _id: 'cat-web3', name: 'Web3 & Crypto', slug: 'web3', description: 'Layer 1/2 protocols, smart contract auditing, decentralized storage and DAOs.', icon: 'Layers', isActive: true },
  { _id: 'cat-quantum', name: 'Quantum Computing', slug: 'quantum', description: 'Superconducting qubits, cryptographic security, quantum simulation and SDKs.', icon: 'Zap', isActive: true },
  { _id: 'cat-hardware', name: 'Robotics & Hardware', slug: 'hardware', description: 'Autonomous drones, humanoid robotics, IoT sensors and advanced semiconductors.', icon: 'Cpu', isActive: true },
];

export const initialRegions = [
  {
    _id: 'reg-us', name: 'United States', slug: 'united-states', states: [
      { _id: 'st-ca', name: 'California', slug: 'california', cities: ['San Francisco', 'Silicon Valley', 'Los Angeles'] },
      { _id: 'st-ny', name: 'New York', slug: 'new-york', cities: ['New York City', 'Brooklyn'] }
    ]
  },
  {
    _id: 'reg-in', name: 'India', slug: 'india', states: [
      { _id: 'st-ka', name: 'Karnataka', slug: 'karnataka', cities: ['Bengaluru', 'Mysuru'] },
      { _id: 'st-mh', name: 'Maharashtra', slug: 'maharashtra', cities: ['Mumbai', 'Pune'] }
    ]
  },
  {
    _id: 'reg-uk', name: 'United Kingdom', slug: 'united-kingdom', states: [
      { _id: 'st-eng', name: 'England', slug: 'england', cities: ['London', 'Cambridge'] }
    ]
  },
  {
    _id: 'reg-de', name: 'Germany', slug: 'germany', states: [
      { _id: 'st-ber', name: 'Berlin', slug: 'berlin', cities: ['Berlin', 'Munich'] }
    ]
  },
  {
    _id: 'reg-sg', name: 'Singapore', slug: 'singapore', states: [
      { _id: 'st-sg', name: 'Singapore State', slug: 'singapore-state', cities: ['Singapore'] }
    ]
  }
];


export interface ProfileRecord {
  _id: string;
  ownerId: string;
  name: string;
  slug: string;
  logo: string;
  shortDescription: string;
  description: string;
  website: string;
  founder: string;
  categoryId: string;
  subCategoryId: string;
  countryId: string;
  stateId: string;
  cityId: string;
  foundedYear: number;
  stage: string;
  businessModel: string;
  teamSize: string;
  productService: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    discord?: string;
  };
  funding: string;
  ipInfo: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DRAFT';
  isFeatured: boolean;
  viewCount: number;
  followerCount: number;
  saveCount: number;
  trendingScore: number;
  createdAt: string;
  updatedAt: string;
}

export const initialProfiles: ProfileRecord[] = [
  {
    _id: 'p-1',
    ownerId: 'u-user1',
    name: 'NeuralCognition AI',
    slug: 'neuralcognition-ai',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
    shortDescription: 'Autonomous multi-modal reasoning engine for enterprise workflows.',
    description: 'NeuralCognition AI builds state-of-the-art multi-modal neural architectures capable of complex logical deduction and zero-shot reasoning across engineering, legal, and financial domains.',
    website: 'https://neuralcognition.ai',
    founder: 'Dr. Aris Thorne',
    categoryId: 'cat-ai',
    subCategoryId: 'sub-llm',
    countryId: 'reg-us',
    stateId: 'st-ca',
    cityId: 'San Francisco',
    foundedYear: 2024,
    stage: 'Series A',
    businessModel: 'B2B SaaS / Enterprise API Subscription',
    teamSize: '24',
    productService: 'Enterprise AI Reasoning Suite & Private LLM Deployment',
    socialLinks: { twitter: 'https://twitter.com/neuralcognition', linkedin: 'https://linkedin.com/company/neuralcognition' },
    funding: '$12.5M Series A',
    ipInfo: 'Patented mixture-of-agents routing algorithm (US Patent #982143)',
    status: 'APPROVED' as const,
    isFeatured: true,
    viewCount: 1420,
    followerCount: 310,
    saveCount: 185,
    trendingScore: 94.5,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'p-2',
    ownerId: 'u-user1',
    name: 'AetherChain FinTech',
    slug: 'aetherchain-fintech',
    logo: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=200',
    shortDescription: 'Instant cross-border liquidity and zero-fee institutional settlement.',
    description: 'AetherChain revolutionizes international trade finance by leveraging high-speed zk-rollups for instantaneous atomic settlements between central bank digital currencies.',
    website: 'https://aetherchain.io',
    founder: 'Elena Rostova',
    categoryId: 'cat-fintech',
    subCategoryId: 'sub-defi',
    countryId: 'reg-uk',
    stateId: 'st-eng',
    cityId: 'London',
    foundedYear: 2023,
    stage: 'Seed',
    businessModel: 'Transaction Volume Take-Rate & Institutional License',
    teamSize: '18',
    productService: 'Zk-Settlement Protocol & Liquidity Router',
    socialLinks: { twitter: 'https://twitter.com/aetherchain', github: 'https://github.com/aetherchain' },
    funding: '$4.2M Seed',
    ipInfo: 'Zero-knowledge consensus mechanism patent pending',
    status: 'APPROVED' as const,
    isFeatured: true,
    viewCount: 980,
    followerCount: 215,
    saveCount: 120,
    trendingScore: 81.2,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'p-3',
    ownerId: 'u-admin',
    name: 'BioGenix Therapeutics',
    slug: 'biogenix-therapeutics',
    logo: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=200',
    shortDescription: 'AI-driven synthetic biology for targeted oncology treatments.',
    description: 'BioGenix combines transformer protein folding models with high-throughput microfluidics to discover novel cancer therapeutics in months instead of decades.',
    website: 'https://biogenixbio.com',
    founder: 'Marcus Vance, Ph.D.',
    categoryId: 'cat-health',
    subCategoryId: 'sub-biotech',
    countryId: 'reg-us',
    stateId: 'st-ny',
    cityId: 'New York City',
    foundedYear: 2022,
    stage: 'Series B',
    businessModel: 'Pharma Licensing & Milestone Royalties',
    teamSize: '45',
    productService: 'In-Silico Drug Discovery Platform',
    socialLinks: { linkedin: 'https://linkedin.com/company/biogenix' },
    funding: '$35M Series B',
    ipInfo: 'Proprietary antibody binding prediction library (Protected Trade Secret)',
    status: 'APPROVED' as const,
    isFeatured: true,
    viewCount: 1850,
    followerCount: 420,
    saveCount: 290,
    trendingScore: 98.0,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'p-4',
    ownerId: 'u-user1',
    name: 'GreenVolt Energy Grid',
    slug: 'greenvolt-energy',
    logo: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=200',
    shortDescription: 'AI-optimized decentralized microgrids and battery storage orchestration.',
    description: 'GreenVolt empowers cities and industrial campuses to autonomously manage renewable energy distribution, peak shaving, and EV fleet charging.',
    website: 'https://greenvolt.energy',
    founder: 'Priya Sharma',
    categoryId: 'cat-climate',
    subCategoryId: 'sub-grid',
    countryId: 'reg-in',
    stateId: 'st-ka',
    cityId: 'Bengaluru',
    foundedYear: 2023,
    stage: 'Seed',
    businessModel: 'Grid Management Subscription + Hardware Bundling',
    teamSize: '14',
    productService: 'Microgrid Controller & Real-Time Power Router',
    socialLinks: { twitter: 'https://twitter.com/greenvolt' },
    funding: '$2.8M Seed',
    ipInfo: 'Predictive distributed load balancer algorithm (Patent Issued)',
    status: 'APPROVED' as const,
    isFeatured: false,
    viewCount: 640,
    followerCount: 145,
    saveCount: 88,
    trendingScore: 68.4,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'p-5',
    ownerId: 'u-user1',
    name: 'Kryptos Security SDK',
    slug: 'kryptos-security',
    logo: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=200',
    shortDescription: 'Zero-trust post-quantum cryptographic identity and encryption runtime.',
    description: 'Kryptos provides drop-in post-quantum lattice encryption libraries that protect corporate data and API communications against future quantum computer attacks.',
    website: 'https://kryptossec.io',
    founder: 'Lukas Meyer',
    categoryId: 'cat-quantum',
    subCategoryId: 'sub-crypto',
    countryId: 'reg-de',
    stateId: 'st-ber',
    cityId: 'Berlin',
    foundedYear: 2024,
    stage: 'Bootstrapped',
    businessModel: 'Developer Seat License & Compliance Audit',
    teamSize: '8',
    productService: 'Quantum-Resistant SDK & API Gateway',
    socialLinks: { github: 'https://github.com/kryptos-sec' },
    funding: '$500K Angel',
    ipInfo: 'Lattice-key encapsulation system copyright and trademark',
    status: 'APPROVED' as const,
    isFeatured: false,
    viewCount: 520,
    followerCount: 95,
    saveCount: 64,
    trendingScore: 62.0,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'p-6',
    ownerId: 'u-user1',
    name: 'Veloce Robotics',
    slug: 'veloce-robotics',
    logo: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200',
    shortDescription: 'Vision-guided robotic fulfillment arms for hyper-local micro-warehouses.',
    description: 'Veloce builds compact, ultra-precise robotic arms with sub-millimeter vision guidance capable of picking and packing fragile e-commerce items at 120 units per minute.',
    website: 'https://velocerobotics.com',
    founder: 'Kenji Takahashi',
    categoryId: 'cat-hardware',
    subCategoryId: 'sub-robotics',
    countryId: 'reg-sg',
    stateId: 'st-sg',
    cityId: 'Singapore',
    foundedYear: 2023,
    stage: 'Series A',
    businessModel: 'Robotics-as-a-Service (RaaS) Monthly Subscription',
    teamSize: '32',
    productService: 'Autonomous Picking Arm & Warehouse Vision OS',
    socialLinks: { linkedin: 'https://linkedin.com/company/veloce-robotics' },
    funding: '$8.0M Series A',
    ipInfo: 'Patented tactile gripper feedback mechanism',
    status: 'APPROVED' as const,
    isFeatured: true,
    viewCount: 1100,
    followerCount: 230,
    saveCount: 140,
    trendingScore: 88.5,
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];
