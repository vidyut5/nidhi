"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
  Building2, 
  Zap, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Calendar, 
  User, 
  ArrowLeft,
  ChevronRight,
  Power,
  Factory,
  Users,
  Map,
  Home,
  TrendingUp,
  Lightbulb
} from 'lucide-react'

// Sample data - In real app, this would come from API
const POWER_GENERATORS = [
  {
    id: '1',
    name: 'NTPC Limited',
    type: 'Thermal',
    capacity: '65,810 MW',
    location: 'New Delhi',
    logo: '/placeholder.svg',
    established: '1975',
    founder: 'Government of India',
    ceo: 'Mr. Gurdeep Singh',
    ceoPhoto: '/placeholder.svg',
    headquarters: 'New Delhi, India',
    phone: '+91-11-2345-6789',
    email: 'info@ntpc.co.in',
    website: 'www.ntpc.co.in',
    description: 'India\'s largest power generation company, committed to providing reliable and affordable electricity.',
    totalPlants: 24,
    employees: '18,000+',
    revenue: '₹1,15,000 Crore',
    posts: [
      {
        id: '1',
        type: 'achievement',
        title: 'NTPC Achieves 100% Plant Load Factor',
        content: 'NTPC has achieved 100% Plant Load Factor across all its thermal power plants, setting a new benchmark in the industry.',
        image: '/placeholder.svg',
        timestamp: '1 day ago',
        likes: 156,
        comments: 34
      },
      {
        id: '2',
        type: 'announcement',
        title: 'New Solar Power Plant Commissioned',
        content: 'We are proud to announce the commissioning of our new 500 MW solar power plant in Rajasthan, contributing to India\'s renewable energy goals.',
        image: '/placeholder.svg',
        timestamp: '3 days ago',
        likes: 89,
        comments: 21
      }
    ]
  },
  {
    id: '2',
    name: 'NHPC Limited',
    type: 'Hydro',
    capacity: '7,071 MW',
    location: 'Faridabad',
    logo: '/placeholder.svg',
    established: '1975',
    founder: 'Government of India',
    ceo: 'Mr. A.K. Singh',
    ceoPhoto: '/placeholder.svg',
    headquarters: 'Faridabad, Haryana, India',
    phone: '+91-129-229-7000',
    email: 'info@nhpc.nic.in',
    website: 'www.nhpc.nic.in',
    description: 'Premier hydropower company of India, harnessing the power of water for sustainable energy generation.',
    totalPlants: 25,
    employees: '6,800+',
    revenue: '₹8,500 Crore',
    posts: [
      {
        id: '1',
        type: 'update',
        title: 'Environmental Conservation Initiative',
        content: 'NHPC launches new environmental conservation program across all hydroelectric projects to protect aquatic ecosystems.',
        image: '/placeholder.svg',
        timestamp: '2 days ago',
        likes: 67,
        comments: 18
      }
    ]
  },
  {
    id: '3',
    name: 'Nuclear Power Corporation',
    type: 'Nuclear',
    capacity: '6,780 MW',
    location: 'Mumbai',
    logo: '/placeholder.svg',
    established: '1987',
    founder: 'Government of India',
    ceo: 'Mr. B.C. Pathak',
    ceoPhoto: '/placeholder.svg',
    headquarters: 'Mumbai, Maharashtra, India',
    phone: '+91-22-2559-3333',
    email: 'info@npcil.nic.in',
    website: 'www.npcil.nic.in',
    description: 'Leading nuclear power generation company, providing clean and sustainable nuclear energy solutions.',
    totalPlants: 7,
    employees: '9,200+',
    revenue: '₹12,000 Crore',
    posts: [
      {
        id: '1',
        type: 'announcement',
        title: 'Safety Excellence Award',
        content: 'NPCIL receives the prestigious Safety Excellence Award for maintaining the highest safety standards in nuclear power generation.',
        image: '/placeholder.svg',
        timestamp: '1 week ago',
        likes: 234,
        comments: 45
      }
    ]
  },
  {
    id: '4',
    name: 'Adani Power',
    type: 'Thermal',
    capacity: '15,250 MW',
    location: 'Ahmedabad',
    logo: '/placeholder.svg',
    established: '1996',
    founder: 'Mr. Gautam Adani',
    ceo: 'Mr. S.B. Khyalia',
    ceoPhoto: '/placeholder.svg',
    headquarters: 'Ahmedabad, Gujarat, India',
    phone: '+91-79-2555-5555',
    email: 'info@adanipower.com',
    website: 'www.adanipower.com',
    description: 'Leading private sector power generation company, committed to sustainable energy solutions and innovation.',
    totalPlants: 5,
    employees: '3,500+',
    revenue: '₹25,000 Crore',
    posts: [
      {
        id: '1',
        type: 'innovation',
        title: 'AI-Powered Plant Optimization',
        content: 'Adani Power implements advanced AI algorithms for plant optimization, improving efficiency by 15% and reducing emissions.',
        image: '/placeholder.svg',
        timestamp: '4 days ago',
        likes: 178,
        comments: 32
      },
      {
        id: '2',
        type: 'sustainability',
        title: 'Carbon Neutral Initiative',
        content: 'We are proud to announce our commitment to becoming carbon neutral by 2030 through renewable energy investments.',
        image: '/placeholder.svg',
        timestamp: '1 week ago',
        likes: 145,
        comments: 28
      }
    ]
  },
  {
    id: '5',
    name: 'Tata Power',
    type: 'Thermal',
    capacity: '13,515 MW',
    location: 'Mumbai',
    logo: '/placeholder.svg',
    established: '1906',
    founder: 'Sir Dorabji Tata',
    ceo: 'Mr. Praveer Sinha',
    ceoPhoto: '/placeholder.svg',
    headquarters: 'Mumbai, Maharashtra, India',
    phone: '+91-22-6665-8282',
    email: 'info@tatapower.com',
    website: 'www.tatapower.com',
    description: 'India\'s largest integrated power company with over a century of excellence in power generation and distribution.',
    totalPlants: 12,
    employees: '4,200+',
    revenue: '₹32,000 Crore',
    posts: [
      {
        id: '1',
        type: 'announcement',
        title: 'Century of Excellence',
        content: 'Celebrating 100 years of Tata Power\'s contribution to India\'s power sector and commitment to sustainable development.',
        image: '/placeholder.svg',
        timestamp: '2 weeks ago',
        likes: 456,
        comments: 89
      },
      {
        id: '2',
        type: 'innovation',
        title: 'Smart Grid Technology',
        content: 'Tata Power launches next-generation smart grid technology in Mumbai, revolutionizing power distribution efficiency.',
        image: '/placeholder.svg',
        timestamp: '5 days ago',
        likes: 123,
        comments: 31
      }
    ]
  }
]

const TRANSMISSION_LINES = [
  {
    id: '1',
    name: 'Power Grid Corporation',
    voltage: '765 kV',
    coverage: 'National',
    headquarters: 'Gurugram',
    logo: '/placeholder.svg',
    established: '1989',
    founder: 'Government of India',
    ceo: 'Mr. K. Sreekant',
    ceoPhoto: '/placeholder.svg',
    address: 'Gurugram, Haryana, India',
    phone: '+91-124-257-0000',
    email: 'info@powergrid.in',
    website: 'www.powergrid.in',
    description: 'Central transmission utility of India, operating the largest transmission network in the world.',
    totalSubstations: 172,
    employees: '12,500+',
    revenue: '₹42,000 Crore',
    posts: [
      {
        id: '1',
        type: 'achievement',
        title: 'World\'s Largest Transmission Network',
        content: 'PGCIL now operates the world\'s largest transmission network spanning over 1,72,000 circuit km across India.',
        image: '/placeholder.svg',
        timestamp: '2 days ago',
        likes: 234,
        comments: 45
      }
    ]
  },
  {
    id: '2',
    name: 'State Transmission Utility',
    voltage: '400 kV',
    coverage: 'State',
    headquarters: 'State Capitals',
    logo: '/placeholder.svg',
    established: '2003',
    founder: 'State Governments',
    ceo: 'Mr. Rajesh Kumar',
    ceoPhoto: '/placeholder.svg',
    address: 'Various State Capitals, India',
    phone: '+91-11-2345-6789',
    email: 'info@stutransmission.gov.in',
    website: 'www.stutransmission.gov.in',
    description: 'State-level transmission utilities ensuring reliable power transmission within states.',
    totalSubstations: 85,
    employees: '8,200+',
    revenue: '₹15,000 Crore',
    posts: [
      {
        id: '1',
        type: 'update',
        title: 'Smart Grid Implementation',
        content: 'State transmission utilities begin implementation of smart grid technology for enhanced monitoring and control.',
        image: '/placeholder.svg',
        timestamp: '1 week ago',
        likes: 89,
        comments: 23
      }
    ]
  },
  {
    id: '3',
    name: 'Regional Grid',
    voltage: '220 kV',
    coverage: 'Regional',
    headquarters: 'Regional Centers',
    logo: '/placeholder.svg',
    established: '1995',
    founder: 'Regional Power Committees',
    ceo: 'Ms. Priya Sharma',
    ceoPhoto: '/placeholder.svg',
    address: 'Regional Centers across India',
    phone: '+91-22-3456-7890',
    email: 'info@regionalgrid.in',
    website: 'www.regionalgrid.in',
    description: 'Regional transmission networks connecting multiple states for efficient power exchange.',
    totalSubstations: 45,
    employees: '5,800+',
    revenue: '₹8,500 Crore',
    posts: [
      {
        id: '1',
        type: 'announcement',
        title: 'Inter-Regional Power Exchange',
        content: 'Regional grids achieve record inter-regional power exchange of 15,000 MW, ensuring grid stability.',
        image: '/placeholder.svg',
        timestamp: '3 days ago',
        likes: 156,
        comments: 34
      }
    ]
  }
]

const DISTRIBUTION_COMPANIES = [
  {
    id: '1',
    name: 'Mumbai Electricity Supply & Transport',
    logo: '/placeholder.svg',
    established: '1905',
    director: 'Mr. Rajesh Kumar',
    directorPhoto: '/placeholder.svg',
    address: 'Mumbai, Maharashtra, India',
    phone: '+91-22-1234-5678',
    email: 'info@mest.com',
    website: 'www.mest.com',
    coverage: 'Mumbai Metropolitan Region',
    customers: '3.2 Million',
    capacity: '2,500 MW',
    description: 'Leading electricity distribution company serving Mumbai with reliable power supply.',
    posts: [
      {
        id: '1',
        type: 'announcement',
        title: 'Scheduled Maintenance - Bandra West',
        content: 'Power supply will be interrupted for maintenance work in Bandra West area on 15th December.',
        image: '/placeholder.svg',
        timestamp: '2 hours ago',
        likes: 45,
        comments: 12
      },
      {
        id: '2',
        type: 'update',
        title: 'New Digital Payment System',
        content: 'We have launched a new digital payment system for faster bill processing and better user experience.',
        image: '/placeholder.svg',
        timestamp: '1 day ago',
        likes: 89,
        comments: 23
      }
    ]
  },
  {
    id: '2',
    name: 'Delhi Electricity Regulatory Commission',
    logo: '/placeholder.svg',
    established: '1999',
    director: 'Ms. Priya Sharma',
    directorPhoto: '/placeholder.svg',
    address: 'New Delhi, Delhi, India',
    phone: '+91-11-2345-6789',
    email: 'info@derc.gov.in',
    website: 'www.derc.gov.in',
    coverage: 'National Capital Territory',
    customers: '2.8 Million',
    capacity: '1,800 MW',
    description: 'Regulatory body ensuring reliable and affordable electricity supply in Delhi.',
    posts: [
      {
        id: '1',
        type: 'announcement',
        title: 'Tariff Revision Notice',
        content: 'New electricity tariffs effective from January 1st, 2024. Check your bill for updated rates.',
        image: '/placeholder.svg',
        timestamp: '3 hours ago',
        likes: 67,
        comments: 18
      }
    ]
  }
]

const INDIAN_STATES = [
  {
    id: '1',
    name: 'Maharashtra',
    capital: 'Mumbai',
    powerCapacity: '45,000 MW',
    discoms: 5,
    logo: '/placeholder.svg',
    address: 'Mantralaya, Madam Cama Road, Mumbai, Maharashtra 400032',
    website: 'www.maharashtra.gov.in',
    email: 'energy@maharashtra.gov.in',
    helpline: '+91-22-2202-1234',
    chiefMinister: 'Shri Eknath Shinde',
    chiefMinisterPhoto: '/placeholder.svg',
    energyMinister: 'Shri Devendra Fadnavis',
    energyMinisterPhoto: '/placeholder.svg',
    energyMix: { thermal: 62, hydro: 18, nuclear: 4, renewable: 16 },
    discomsList: ['MSEDCL', 'BEST', 'TPC-D', 'Adani Electricity', 'Navi Mumbai Municipal'] ,
    posts: [
      {
        id: '1',
        type: 'announcement',
        title: 'State Incentives for Rooftop Solar',
        content: 'Maharashtra announces additional subsidies for residential rooftop solar installations.',
        image: '/placeholder.svg',
        timestamp: '2 days ago',
        likes: 112,
        comments: 26
      },
      {
        id: '2',
        type: 'update',
        title: 'Monsoon Preparedness Drive',
        content: 'DISCOMs complete monsoon preparedness checks across critical substations.',
        image: '/placeholder.svg',
        timestamp: '5 days ago',
        likes: 64,
        comments: 14
      }
    ],
    mandals: [
      { id: '1', name: 'Mumbai City', population: '12.5 Million', powerDemand: '2,800 MW', administrator: 'Municipal Commissioner', divisionController: 'Additional Municipal Commissioner (Power)', controllerPhoto: '/placeholder.svg', officeAddress: 'BMC Head Office, Fort, Mumbai', phone: '+91-22-2262-0251', email: 'mc@mcgm.gov.in', website: 'www.mcgm.gov.in', helpline: '1916', discoms: ['BEST', 'TPC-D', 'Adani Electricity'], posts: [ { id: '1', type: 'alert', title: 'Scheduled Maintenance - South Mumbai', content: 'Night-time maintenance on 220kV lines. Possible brief outages.', image: '/placeholder.svg', timestamp: '3 hours ago', likes: 23, comments: 5 } ] },
      { id: '2', name: 'Pune', population: '6.2 Million', powerDemand: '1,200 MW' },
      { id: '3', name: 'Nagpur', population: '3.1 Million', powerDemand: '650 MW' },
      { id: '4', name: 'Thane', population: '2.5 Million', powerDemand: '450 MW' },
      { id: '5', name: 'Nashik', population: '2.1 Million', powerDemand: '380 MW' }
    ]
  },
  {
    id: '2',
    name: 'Delhi',
    capital: 'New Delhi',
    powerCapacity: '8,500 MW',
    discoms: 3,
    logo: '/placeholder.svg',
    address: 'Delhi Secretariat, IP Estate, New Delhi 110002',
    website: 'www.delhi.gov.in',
    email: 'power@delhi.gov.in',
    helpline: '19123',
    chiefMinister: 'Shri Arvind Kejriwal',
    chiefMinisterPhoto: '/placeholder.svg',
    energyMinister: 'Shri Atishi Marlena',
    energyMinisterPhoto: '/placeholder.svg',
    energyMix: { thermal: 48, hydro: 10, nuclear: 2, renewable: 40 },
    discomsList: ['BSES Rajdhani', 'BSES Yamuna', 'Tata Power-DDL'],
    posts: [
      { id: '1', type: 'announcement', title: 'Peak Demand Managed Successfully', content: 'Delhi meets record peak demand with demand response measures.', image: '/placeholder.svg', timestamp: '1 day ago', likes: 78, comments: 12 }
    ],
    mandals: [
      { id: '1', name: 'New Delhi', population: '8.9 Million', powerDemand: '1,800 MW', administrator: 'NDMC Chairperson', divisionController: 'Chief Engineer (Electricity)', controllerPhoto: '/placeholder.svg', officeAddress: 'NDMC, Palika Kendra, Sansad Marg', phone: '+91-11-2336-0150', email: 'chairman@ndmc.gov.in', website: 'www.ndmc.gov.in', helpline: '1533', discoms: ['Tata Power-DDL', 'BSES Rajdhani'], posts: [ { id: '1', type: 'update', title: 'Smart Meter Rollout', content: 'Phase-2 installation covering 50,000 households underway.', image: '/placeholder.svg', timestamp: '6 hours ago', likes: 31, comments: 7 } ] },
      { id: '2', name: 'North Delhi', population: '2.1 Million', powerDemand: '420 MW' },
      { id: '3', name: 'South Delhi', population: '1.8 Million', powerDemand: '360 MW' }
    ]
  },
  {
    id: '3',
    name: 'Karnataka',
    capital: 'Bengaluru',
    powerCapacity: '28,000 MW',
    discoms: 4,
    mandals: [
      { id: '1', name: 'Bengaluru Urban', population: '12.3 Million', powerDemand: '2,100 MW' },
      { id: '2', name: 'Mysuru', population: '3.1 Million', powerDemand: '580 MW' },
      { id: '3', name: 'Mangaluru', population: '1.8 Million', powerDemand: '320 MW' }
    ]
  },
  {
    id: '4',
    name: 'Tamil Nadu',
    capital: 'Chennai',
    powerCapacity: '32,000 MW',
    discoms: 3,
    mandals: [
      { id: '1', name: 'Chennai', population: '11.0 Million', powerDemand: '1,900 MW' },
      { id: '2', name: 'Coimbatore', population: '2.1 Million', powerDemand: '380 MW' },
      { id: '3', name: 'Madurai', population: '1.6 Million', powerDemand: '280 MW' }
    ]
  }
]

type MainPath = 'selection' | 'power-flow' | 'state-flow'
type PowerFlowStep = 'generator' | 'transmission' | 'distribution' | 'profile' | 'generator-profile' | 'transmission-profile'
type StateFlowStep = 'states' | 'state-detail' | 'mandal-detail'

export default function StateElectricityBoardPage() {
  const [mainPath, setMainPath] = useState<MainPath>('selection')
  const [powerFlowStep, setPowerFlowStep] = useState<PowerFlowStep>('generator')
  const [stateFlowStep, setStateFlowStep] = useState<StateFlowStep>('states')
  
  const [selectedGenerator, setSelectedGenerator] = useState('')
  const [selectedTransmission, setSelectedTransmission] = useState('')
  const [selectedDistribution, setSelectedDistribution] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [selectedMandal, setSelectedMandal] = useState('')

  const selectedCompany = DISTRIBUTION_COMPANIES.find(c => c.id === selectedDistribution)
  const selectedStateData = INDIAN_STATES.find(s => s.id === selectedState)
  const selectedMandalData = selectedStateData?.mandals.find(m => m.id === selectedMandal)

  const resetAll = () => {
    setMainPath('selection')
    setPowerFlowStep('generator')
    setStateFlowStep('states')
    setSelectedGenerator('')
    setSelectedTransmission('')
    setSelectedDistribution('')
    setSelectedState('')
    setSelectedMandal('')
  }

  const goToPowerFlow = () => {
    setMainPath('power-flow')
    setPowerFlowStep('generator')
  }

  const goToStateFlow = () => {
    setMainPath('state-flow')
    setStateFlowStep('states')
  }

  // Power Flow Functions
  const handleGeneratorSelect = (generatorId: string) => {
    setSelectedGenerator(generatorId)
    setPowerFlowStep('generator-profile')
  }

  const handleTransmissionSelect = (transmissionId: string) => {
    setSelectedTransmission(transmissionId)
    setPowerFlowStep('transmission-profile')
  }

  const handleDistributionSelect = (distributionId: string) => {
    setSelectedDistribution(distributionId)
    setPowerFlowStep('profile')
  }

  // State Flow Functions
  const handleStateSelect = (stateId: string) => {
    setSelectedState(stateId)
    setStateFlowStep('state-detail')
  }

  const handleMandalSelect = (mandalId: string) => {
    setSelectedMandal(mandalId)
    setStateFlowStep('mandal-detail')
  }

  const renderMainSelection = () => (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">State Electricity Board Information</h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
          Choose your preferred path to explore electricity board information
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto">
        {/* Power Generation Flow */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 border-2 hover:border-blue-200"
          onClick={goToPowerFlow}
        >
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Power className="h-10 w-10 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Power Generation Flow</h2>
              <p className="text-muted-foreground mb-4">
                Explore the complete power supply chain from generation to distribution
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                <span>Generator → Transmission → Distribution → Profile</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* State-Based Flow */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 border-2 hover:border-green-200"
          onClick={goToStateFlow}
        >
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Map className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">State-Based Flow</h2>
              <p className="text-muted-foreground mb-4">
                Browse electricity information by state and explore mandal-level details
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                <span>State → Districts → Mandals → Details</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderPowerFlow = () => (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-1 sm:space-x-2">
          {['generator', 'generator-profile', 'transmission', 'transmission-profile', 'distribution', 'profile'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium
                ${powerFlowStep === step 
                  ? 'bg-blue-600 text-white' 
                  : index < ['generator', 'generator-profile', 'transmission', 'transmission-profile', 'distribution', 'profile'].indexOf(powerFlowStep)
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
                }
              `}>
                {index + 1}
              </div>
              {index < 5 && (
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 mx-1 sm:mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {powerFlowStep === 'generator' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={() => setMainPath('selection')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Selection
            </Button>
            <div className="flex-1 text-center">
              <h2 className="text-2xl font-bold">Select Power Generator</h2>
              <p className="text-muted-foreground">Choose the power generation company to proceed</p>
            </div>
          </div>
          
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {POWER_GENERATORS.map((generator) => (
              <Card 
                key={generator.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                onClick={() => handleGeneratorSelect(generator.id)}
              >
                <CardContent className="p-4 sm:p-6 text-center space-y-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Power className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg">{generator.name}</h3>
                    <p className="text-sm text-muted-foreground">{generator.type}</p>
                    <Badge variant="secondary" className="mt-2 text-xs">{generator.capacity}</Badge>
                    <div className="text-xs text-muted-foreground mt-1">{generator.location}</div>
                    <div className="text-xs text-muted-foreground mt-1">{generator.employees}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {powerFlowStep === 'transmission' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={() => setPowerFlowStep('generator')} className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex-1 text-center">
              <h2 className="text-2xl font-bold">Select Transmission Line</h2>
              <p className="text-muted-foreground">Choose the transmission utility company</p>
            </div>
          </div>
          
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {TRANSMISSION_LINES.map((transmission) => (
              <Card 
                key={transmission.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                onClick={() => handleTransmissionSelect(transmission.id)}
              >
                <CardContent className="p-4 sm:p-6 text-center space-y-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg">{transmission.name}</h3>
                    <p className="text-sm text-muted-foreground">{transmission.voltage}</p>
                    <Badge variant="secondary" className="mt-2 text-xs">{transmission.coverage}</Badge>
                    <div className="text-xs text-muted-foreground mt-1">{transmission.headquarters}</div>
                    <div className="text-xs text-muted-foreground mt-1">{transmission.employees}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {powerFlowStep === 'distribution' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                                          <Button variant="ghost" size="sm" onClick={() => setPowerFlowStep('transmission')} className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setPowerFlowStep('distribution')} className="w-full sm:w-auto">
            Next: Distribution
          </Button>
            <div className="flex-1 text-center">
              <h2 className="text-2xl font-bold">Select Distribution Company</h2>
              <p className="text-muted-foreground">Choose the distribution company (DISCOM)</p>
            </div>
          </div>
          
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {DISTRIBUTION_COMPANIES.map((company) => (
              <Card 
                key={company.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                onClick={() => handleDistributionSelect(company.id)}
              >
                <CardContent className="p-4 sm:p-6 text-center space-y-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <Factory className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg">{company.name}</h3>
                    <p className="text-sm text-muted-foreground">{company.coverage}</p>
                    <Badge variant="secondary" className="mt-2 text-xs">{company.customers}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {powerFlowStep === 'generator-profile' && renderGeneratorProfile()}
      {powerFlowStep === 'transmission-profile' && renderTransmissionProfile()}
      {powerFlowStep === 'profile' && renderCompanyProfile()}
    </div>
  )

  const renderGeneratorProfile = () => {
    const selectedGen = POWER_GENERATORS.find(g => g.id === selectedGenerator)
    if (!selectedGen) return null

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => setPowerFlowStep('generator')} className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setPowerFlowStep('transmission')} className="w-full sm:w-auto">
            Next: Transmission
          </Button>
          <Button variant="ghost" size="sm" onClick={resetAll} className="w-full sm:w-auto">
            Start Over
          </Button>
        </div>

        {/* Company Header */}
        <Card className="overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col items-center gap-4 sm:gap-6">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-white/20">
                <AvatarImage src={selectedGen.logo} alt={selectedGen.name} />
                <AvatarFallback className="text-xl sm:text-2xl font-bold bg-white/20 text-white">
                  {selectedGen.name.split(' ').map(w => w[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">{selectedGen.name}</h1>
                <p className="text-blue-100 text-base sm:text-lg">{selectedGen.description}</p>
                <div className="flex flex-wrap gap-2 sm:gap-4 mt-4 justify-center">
                  <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                    <Power className="h-3 w-3 mr-1" />
                    {selectedGen.capacity}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                    <MapPin className="h-3 w-3 mr-1" />
                    {selectedGen.location}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {selectedGen.employees}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Company Details */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Established:</span>
                <span className="font-medium">{selectedGen.established}</span>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Founder:</span>
                <span className="font-medium">{selectedGen.founder}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">Headquarters:</span>
                <span className="font-medium">{selectedGen.headquarters}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Phone:</span>
                <span className="font-medium">{selectedGen.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="font-medium">{selectedGen.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Website:</span>
                <a href={`https://${selectedGen.website}`} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline break-all">
                  {selectedGen.website}
                </a>
              </div>
            </CardContent>
          </Card>

          {/* CEO Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                CEO Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedGen.ceoPhoto} alt={selectedGen.ceo} />
                  <AvatarFallback className="text-lg font-bold">
                    {selectedGen.ceo.split(' ').map(w => w[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedGen.ceo}</h3>
                  <p className="text-sm text-muted-foreground">Chief Executive Officer</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Company Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{selectedGen.totalPlants}</div>
                <div className="text-sm text-muted-foreground">Total Plants</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{selectedGen.employees}</div>
                <div className="text-sm text-muted-foreground">Employees</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{selectedGen.revenue}</div>
                <div className="text-sm text-muted-foreground">Annual Revenue</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Company Updates & Announcements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedGen.posts.map((post) => (
              <div key={post.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={selectedGen.logo} alt={selectedGen.name} />
                    <AvatarFallback className="text-sm font-bold">
                      {selectedGen.name.split(' ').map(w => w[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{selectedGen.name}</div>
                    <div className="text-sm text-muted-foreground">{post.timestamp}</div>
                  </div>
                  <Badge variant={post.type === 'announcement' ? 'destructive' : post.type === 'achievement' ? 'default' : 'secondary'} className="flex-shrink-0">
                    {post.type}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg mb-2">{post.title}</h4>
                  <p className="text-muted-foreground">{post.content}</p>
                </div>

                {post.image && (
                  <div className="rounded-lg overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    <span>👍</span>
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    <span>💬</span>
                    <span>{post.comments}</span>
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderTransmissionProfile = () => {
    const selectedTrans = TRANSMISSION_LINES.find(t => t.id === selectedTransmission)
    if (!selectedTrans) return null

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => setPowerFlowStep('transmission')} className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setPowerFlowStep('distribution')} className="w-full sm:w-auto">
            Next: Distribution
          </Button>
          <Button variant="ghost" size="sm" onClick={resetAll} className="w-full sm:w-auto">
            Start Over
          </Button>
        </div>

        {/* Company Header */}
        <Card className="overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col items-center gap-4 sm:gap-6">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-white/20">
                <AvatarImage src={selectedTrans.logo} alt={selectedTrans.name} />
                <AvatarFallback className="text-xl sm:text-2xl font-bold bg-white/20 text-white">
                  {selectedTrans.name.split(' ').map(w => w[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">{selectedTrans.name}</h1>
                <p className="text-green-100 text-base sm:text-lg">{selectedTrans.description}</p>
                <div className="flex flex-wrap gap-2 sm:gap-4 mt-4 justify-center">
                  <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    {selectedTrans.voltage}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                    <MapPin className="h-3 w-3 mr-1" />
                    {selectedTrans.coverage}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {selectedTrans.employees}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Company Details */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Established:</span>
                <span className="font-medium">{selectedTrans.established}</span>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Founder:</span>
                <span className="font-medium">{selectedTrans.founder}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">Address:</span>
                <span className="font-medium">{selectedTrans.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Phone:</span>
                <span className="font-medium">{selectedTrans.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="font-medium">{selectedTrans.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Website:</span>
                <a href={`https://${selectedTrans.website}`} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline break-all">
                  {selectedTrans.website}
                </a>
              </div>
            </CardContent>
          </Card>

          {/* CEO Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                CEO Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedTrans.ceoPhoto} alt={selectedTrans.ceo} />
                  <AvatarFallback className="text-lg font-bold">
                    {selectedTrans.ceo.split(' ').map(w => w[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedTrans.ceo}</h3>
                  <p className="text-sm text-muted-foreground">Chief Executive Officer</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Company Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{selectedTrans.totalSubstations}</div>
                <div className="text-sm text-muted-foreground">Substations</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{selectedTrans.employees}</div>
                <div className="text-sm text-muted-foreground">Employees</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{selectedTrans.revenue}</div>
                <div className="text-sm text-muted-foreground">Annual Revenue</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Company Updates & Announcements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedTrans.posts.map((post) => (
              <div key={post.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={selectedTrans.logo} alt={selectedTrans.name} />
                    <AvatarFallback className="text-sm font-bold">
                      {selectedTrans.name.split(' ').map(w => w[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{selectedTrans.name}</div>
                    <div className="text-sm text-muted-foreground">{post.timestamp}</div>
                  </div>
                  <Badge variant={post.type === 'announcement' ? 'destructive' : post.type === 'achievement' ? 'default' : 'secondary'} className="flex-shrink-0">
                    {post.type}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg mb-2">{post.title}</h4>
                  <p className="text-muted-foreground">{post.content}</p>
                </div>

                {post.image && (
                  <div className="rounded-lg overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    <span>👍</span>
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    <span>💬</span>
                    <span>{post.comments}</span>
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderStateFlow = () => (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-1 sm:space-x-2">
          {['states', 'state-detail', 'mandal-detail'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium
                ${stateFlowStep === step 
                  ? 'bg-green-600 text-white' 
                  : index < ['states', 'state-detail', 'mandal-detail'].indexOf(stateFlowStep)
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
                }
              `}>
                {index + 1}
              </div>
              {index < 2 && (
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 mx-1 sm:mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {stateFlowStep === 'states' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={() => setMainPath('selection')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Selection
            </Button>
            <div className="flex-1 text-center">
              <h2 className="text-2xl font-bold">Select State</h2>
              <p className="text-muted-foreground">Choose a state to explore electricity board information</p>
            </div>
          </div>
          
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {INDIAN_STATES.map((state) => (
              <Card 
                key={state.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                onClick={() => handleStateSelect(state.id)}
              >
                <CardContent className="p-4 sm:p-6 text-center space-y-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Map className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg">{state.name}</h3>
                    <p className="text-sm text-muted-foreground">Capital: {state.capital}</p>
                    <Badge variant="secondary" className="mt-2 text-xs">{state.powerCapacity}</Badge>
                    <div className="text-xs text-muted-foreground mt-1">{state.discoms} DISCOMs</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {stateFlowStep === 'state-detail' && selectedStateData && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={() => setStateFlowStep('states')} className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to States
            </Button>
            <div className="flex-1 text-center">
              <h2 className="text-2xl font-bold">{selectedStateData.name} Electricity Board</h2>
              <p className="text-muted-foreground">Explore districts and mandals</p>
            </div>
          </div>

          {/* State Header */}
          <Card className="overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col items-center gap-4 sm:gap-6">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-white/20">
                  <AvatarImage src={(selectedStateData as any).logo || '/placeholder.svg'} alt={selectedStateData.name} />
                  <AvatarFallback className="text-xl sm:text-2xl font-bold bg-white/20 text-white">
                    {selectedStateData.name.split(' ').map(w => w[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">{selectedStateData.name}</h1>
                  <p className="text-green-100 text-base sm:text-lg">State Electricity Board Information</p>
                  <div className="flex flex-wrap gap-2 sm:gap-4 mt-4 justify-center">
                    <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      {selectedStateData.capital}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      {selectedStateData.powerCapacity}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                      <Building2 className="h-3 w-3 mr-1" />
                      {selectedStateData.discoms} DISCOMs
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* State Admin & Contacts */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Administration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {(selectedStateData as any).chiefMinister && (
                  <div className="flex items-center gap-5">
                    <Avatar className="h-24 w-24 ring-4 ring-white/40 shadow-md">
                      <AvatarImage src={(selectedStateData as any).chiefMinisterPhoto || '/placeholder.svg'} alt={(selectedStateData as any).chiefMinister} />
                      <AvatarFallback className="text-xs font-bold">CM</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm text-muted-foreground leading-tight">Chief Minister</div>
                      <div className="text-lg font-semibold leading-tight">{(selectedStateData as any).chiefMinister}</div>
                    </div>
                  </div>
                )}
                {(selectedStateData as any).energyMinister && (
                  <div className="flex items-center gap-5">
                    <Avatar className="h-24 w-24 ring-4 ring-white/40 shadow-md">
                      <AvatarImage src={(selectedStateData as any).energyMinisterPhoto || '/placeholder.svg'} alt={(selectedStateData as any).energyMinister} />
                      <AvatarFallback className="text-xs font-bold">EM</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm text-muted-foreground leading-tight">Energy Minister</div>
                      <div className="text-lg font-semibold leading-tight">{(selectedStateData as any).energyMinister}</div>
                    </div>
                  </div>
                )}
                {(selectedStateData as any).address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm text-muted-foreground">Address:</span>
                    <span className="font-medium">{(selectedStateData as any).address}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Website:</span>
                  <a href={`https://${(selectedStateData as any).website || 'example.com'}`} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline break-all">
                    {(selectedStateData as any).website || 'N/A'}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="font-medium">{(selectedStateData as any).email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Helpline:</span>
                  <span className="font-medium">{(selectedStateData as any).helpline || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Energy Mix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {['thermal','hydro','nuclear','renewable'].map((k) => (
                    <div key={k} className="rounded-lg p-3 border text-center">
                      <div className="text-xl font-bold">{((selectedStateData as any).energyMix?.[k as keyof any] ?? 0)}%</div>
                      <div className="text-xs text-muted-foreground capitalize">{k}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* DISCOMs & Quick Links */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  DISCOMs in {selectedStateData.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {((selectedStateData as any).discomsList || []).map((d: string) => (
                    <Badge key={d} variant="secondary">{d}</Badge>
                  ))}
                  {(((selectedStateData as any).discomsList || []).length === 0) && (
                    <div className="text-sm text-muted-foreground">No data available</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Quick Links
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <a className="underline text-blue-600" href={`https://${(selectedStateData as any).website || 'example.com'}`} target="_blank" rel="noreferrer">Official Portal</a>
                <a className="underline text-blue-600" href="#">Tariff Orders</a>
                <a className="underline text-blue-600" href="#">Outage Schedule</a>
                <a className="underline text-blue-600" href="#">Apply New Connection</a>
              </CardContent>
            </Card>
          </div>

          {/* State Posts */}
          <Card>
            <CardHeader>
              <CardTitle>State Updates & Announcements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {(((selectedStateData as any).posts) || []).map((post: any) => (
                <div key={post.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage src={(selectedStateData as any).logo || '/placeholder.svg'} alt={selectedStateData.name} />
                      <AvatarFallback className="text-sm font-bold">
                        {selectedStateData.name.split(' ').map(w => w[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{selectedStateData.name}</div>
                      <div className="text-sm text-muted-foreground">{post.timestamp}</div>
                    </div>
                    <Badge variant={post.type === 'announcement' ? 'destructive' : 'default'} className="flex-shrink-0">
                      {post.type}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">{post.title}</h4>
                    <p className="text-muted-foreground">{post.content}</p>
                  </div>
                  {post.image && (
                    <div className="rounded-lg overflow-hidden">
                      <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
          {/* Mandals List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Districts & Mandals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {selectedStateData.mandals.map((mandal) => (
                  <Card 
                    key={mandal.id} 
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                    onClick={() => handleMandalSelect(mandal.id)}
                  >
                    <CardContent className="p-4 text-center space-y-3">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                        <Home className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base">{mandal.name}</h3>
                        <p className="text-sm text-muted-foreground">{mandal.population}</p>
                        <Badge variant="secondary" className="mt-2 text-xs">{mandal.powerDemand}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {stateFlowStep === 'mandal-detail' && selectedMandalData && selectedStateData && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={() => setStateFlowStep('state-detail')} className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to State
            </Button>
            <Button variant="ghost" size="sm" onClick={resetAll} className="w-full sm:w-auto">
              Start Over
            </Button>
          </div>

          {/* Mandal Header */}
          <Card className="overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col items-center gap-4 sm:gap-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-full flex items-center justify-center">
                  <Home className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                </div>
                <div className="text-center">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">{selectedMandalData.name}</h1>
                  <p className="text-emerald-100 text-base sm:text-lg">{selectedStateData.name} District</p>
                  <div className="flex flex-wrap gap-2 sm:gap-4 mt-4 justify-center">
                    <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      {selectedMandalData.population}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      {selectedMandalData.powerDemand}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Mandal Details */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Power Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Population:</span>
                  <span className="font-medium">{selectedMandalData.population}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Power Demand:</span>
                  <span className="font-medium">{selectedMandalData.powerDemand}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">State:</span>
                  <span className="font-medium">{selectedStateData.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Capital:</span>
                  <span className="font-medium">{selectedStateData.capital}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Infrastructure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">DISCOMs:</span>
                  <span className="font-medium">{selectedStateData.discoms}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">State Capacity:</span>
                  <span className="font-medium">{selectedStateData.powerCapacity}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Districts:</span>
                  <span className="font-medium">{selectedStateData.mandals.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Local Leadership
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(selectedStateData as any).chiefMinister && (
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Chief Minister:</span>
                    <span className="font-medium">{(selectedStateData as any).chiefMinister}</span>
                  </div>
                )}
                {(selectedMandalData as any).divisionController && (
                  <div className="flex items-center gap-5">
                    <Avatar className="h-24 w-24 ring-4 ring-white/40 shadow-md">
                      <AvatarImage src={(selectedMandalData as any).controllerPhoto || '/placeholder.svg'} alt={(selectedMandalData as any).divisionController} />
                      <AvatarFallback className="text-xs font-bold">DC</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm text-muted-foreground leading-tight">Division Controller</div>
                      <div className="text-lg font-semibold leading-tight">{(selectedMandalData as any).divisionController}</div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Office:</span>
                  <span className="font-medium">{(selectedMandalData as any).officeAddress || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Phone:</span>
                  <span className="font-medium">{(selectedMandalData as any).phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="font-medium">{(selectedMandalData as any).email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Website:</span>
                  <a href={`https://${(selectedMandalData as any).website || 'example.com'}`} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline break-all">
                    {(selectedMandalData as any).website || 'N/A'}
                  </a>
                </div>
                {(selectedMandalData as any).helpline && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Helpline:</span>
                    <span className="font-medium">{(selectedMandalData as any).helpline}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Mandal Administration & Posts */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Administration & Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(selectedMandalData as any).administrator && (
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Administrator:</span>
                    <span className="font-medium">{(selectedMandalData as any).administrator}</span>
                  </div>
                )}
                {(selectedMandalData as any).officeAddress && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm text-muted-foreground">Office Address:</span>
                    <span className="font-medium">{(selectedMandalData as any).officeAddress}</span>
                  </div>
                )}
                {(selectedMandalData as any).phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Phone:</span>
                    <span className="font-medium">{(selectedMandalData as any).phone}</span>
                  </div>
                )}
                {(selectedMandalData as any).email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Email:</span>
                    <span className="font-medium">{(selectedMandalData as any).email}</span>
                  </div>
                )}
                {(selectedMandalData as any).discoms && (
                  <div className="flex items-start gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm text-muted-foreground">DISCOMs:</span>
                    <div className="flex-1 flex flex-wrap gap-2">
                      {((selectedMandalData as any).discoms || []).map((d: string) => (
                        <Badge key={d} variant="secondary">{d}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Local Updates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(((selectedMandalData as any).posts) || []).map((post: any) => (
                  <div key={post.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={post.type === 'alert' ? 'destructive' : 'default'}>{post.type}</Badge>
                      <span className="text-sm text-muted-foreground ml-auto">{post.timestamp}</span>
                    </div>
                    <div className="font-semibold">{post.title}</div>
                    <div className="text-sm text-muted-foreground">{post.content}</div>
                  </div>
                ))}
                {(!((selectedMandalData as any).posts) || (selectedMandalData as any).posts.length === 0) && (
                  <div className="text-sm text-muted-foreground">No recent updates.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )

  const renderCompanyProfile = () => {
    if (!selectedCompany) return null

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => setPowerFlowStep('distribution')} className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button variant="ghost" size="sm" onClick={resetAll} className="w-full sm:w-auto">
            Start Over
          </Button>
        </div>

        {/* Company Header */}
        <Card className="overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col items-center gap-4 sm:gap-6">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-white/20">
                <AvatarImage src={selectedCompany.logo} alt={selectedCompany.name} />
                <AvatarFallback className="text-xl sm:text-2xl font-bold bg-white/20 text-white">
                  {selectedCompany.name.split(' ').map(w => w[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">{selectedCompany.name}</h1>
                <p className="text-blue-100 text-base sm:text-lg">{selectedCompany.description}</p>
                <div className="flex flex-wrap gap-2 sm:gap-4 mt-4 justify-center">
                  <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                    <MapPin className="h-3 w-3 mr-1" />
                    {selectedCompany.coverage}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {selectedCompany.customers}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    {selectedCompany.capacity}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Company Details */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Established:</span>
                <span className="font-medium">{selectedCompany.established}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">Address:</span>
                <span className="font-medium">{selectedCompany.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Phone:</span>
                <span className="font-medium">{selectedCompany.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="font-medium">{selectedCompany.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Website:</span>
                <a href={`https://${selectedCompany.website}`} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline break-all">
                  {selectedCompany.website}
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Director Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Director Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedCompany.directorPhoto} alt={selectedCompany.director} />
                  <AvatarFallback className="text-lg font-bold">
                    {selectedCompany.director.split(' ').map(w => w[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedCompany.director}</h3>
                  <p className="text-sm text-muted-foreground">Managing Director</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Company Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Company Updates & Announcements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedCompany.posts.map((post) => (
              <div key={post.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={selectedCompany.logo} alt={selectedCompany.name} />
                    <AvatarFallback className="text-sm font-bold">
                      {selectedCompany.name.split(' ').map(w => w[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{selectedCompany.name}</div>
                    <div className="text-sm text-muted-foreground">{post.timestamp}</div>
                  </div>
                  <Badge variant={post.type === 'announcement' ? 'destructive' : 'default'} className="flex-shrink-0">
                    {post.type}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg mb-2">{post.title}</h4>
                  <p className="text-muted-foreground">{post.content}</p>
                </div>

                {post.image && (
                  <div className="rounded-lg overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    <span>👍</span>
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    <span>💬</span>
                    <span>{post.comments}</span>
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 space-y-6">
      {mainPath === 'selection' && renderMainSelection()}
      {mainPath === 'power-flow' && renderPowerFlow()}
      {mainPath === 'state-flow' && renderStateFlow()}
    </div>
  )
}


