import { Link, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import type { Route } from './+types/home';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { APP_CONFIG } from '~/config/app';
import { useAuthStore } from '~/stores/authStore';
import {
  BarChart3,
  FileUp,
  PieChart,
  ArrowRight,
  Check,
  ChefHat,
  TrendingUp,
  Calculator,
  Shield,
  Zap,
  Star,
  ChevronDown,
  Menu,
  X,
  Target,
  User,
} from 'lucide-react';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: `${APP_CONFIG.name} - Food Business Costing Assistant for Filipino Entrepreneurs` },
    {
      name: 'description',
      content:
        'Free web-based costing tool for Filipino food businesses. Track ingredient costs, calculate recipe profits, manage inventory, and generate financial reports. Perfect for small restaurants, home bakers, and food startups.',
    },
    { name: 'keywords', content: APP_CONFIG.keywords.join(', ') },
    { name: 'author', content: APP_CONFIG.name },
    { tagName: 'link', rel: 'canonical', href: APP_CONFIG.url },

    // Open Graph / Facebook
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: APP_CONFIG.url },
    {
      property: 'og:title',
      content: `${APP_CONFIG.name} - Smart Costing for Filipino Food Businesses`,
    },
    {
      property: 'og:description',
      content:
        'Free costing assistant for food businesses. Track costs, calculate profits, manage inventory, and grow your food business with data-driven insights.',
    },
    { property: 'og:image', content: `${APP_CONFIG.url}${APP_CONFIG.ogImage}` },
    { property: 'og:locale', content: 'en_PH' },
    { property: 'og:site_name', content: APP_CONFIG.name },

    // Twitter
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:url', content: APP_CONFIG.url },
    { name: 'twitter:title', content: `${APP_CONFIG.name} - Food Business Costing Assistant` },
    {
      name: 'twitter:description',
      content:
        'Free web-based costing tool for Filipino food businesses. Track costs, manage inventory, and maximize profits.',
    },
    { name: 'twitter:image', content: `${APP_CONFIG.url}${APP_CONFIG.ogImage}` },

    // Additional SEO
    { name: 'robots', content: 'index, follow' },
    { name: 'googlebot', content: 'index, follow' },
    { name: 'language', content: 'English' },
    { name: 'geo.region', content: 'PH' },
    { name: 'geo.placename', content: 'Philippines' },
  ];
}

// Animated counter component
function AnimatedCounter({
  end,
  duration = 2000,
  suffix = '',
}: {
  end: number;
  duration?: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(`counter-${end}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [end]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <span id={`counter-${end}`}>
      {count}
      {suffix}
    </span>
  );
}

// FAQ Accordion Item
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100">
      <button
        className="w-full py-5 flex items-center justify-between text-left hover:text-primary transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-gray-900">{question}</span>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 pb-5' : 'max-h-0'
        }`}
      >
        <p className="text-gray-500 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, isAdmin, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Redirect authenticated users to dashboard after OAuth login
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Check if user just logged in (session is fresh)
      // This will auto-redirect Google OAuth users to dashboard
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.has('code') || window.location.hash.includes('access_token')) {
        navigate(isAdmin ? '/dashboard/admin' : '/dashboard');
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, navigate]);

  // Structured Data (JSON-LD) for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: APP_CONFIG.name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: APP_CONFIG.description,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'PHP',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '120',
    },
    author: {
      '@type': 'Organization',
      name: APP_CONFIG.name,
      url: APP_CONFIG.url,
    },
    featureList: [
      'Cost Management',
      'Recipe Costing',
      'Inventory Tracking',
      'Sales Analysis',
      'Financial Reports',
      'Receipt Scanning',
    ],
  };

  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: APP_CONFIG.name,
    url: APP_CONFIG.url,
    logo: `${APP_CONFIG.url}/logo-text.svg`,
    description: APP_CONFIG.description,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'PH',
    },
    sameAs: [],
  };

  const features = [
    {
      icon: BarChart3,
      title: 'Cost Management',
      description: 'Track ingredients, labor, and overhead expenses with ease',
      details:
        'Accurately compute COGS, operating expenses, and profit margins for your food products.',
      color: 'bg-primary/10 text-primary',
    },
    {
      icon: FileUp,
      title: 'Bulk Upload',
      description: 'Import data from Excel or CSV files',
      details: 'Save time by uploading ingredients, expenses, and sales data in bulk.',
      color: 'bg-secondary/10 text-lightgreenz',
    },
    {
      icon: PieChart,
      title: 'Financial Reports',
      description: 'Generate comprehensive financial statements',
      details: 'Income statements, profit summaries, and expense reports at your fingertips.',
      color: 'bg-lightgreenz/10 text-greenz',
    },
    {
      icon: ChefHat,
      title: 'Recipe Costing',
      description: 'Calculate exact costs per dish',
      details: 'Break down ingredient costs and determine profitable pricing for each menu item.',
      color: 'bg-amber-100 text-amber-600',
    },
    {
      icon: TrendingUp,
      title: 'Sales Tracking',
      description: 'Monitor daily and monthly sales',
      details: 'Track revenue, identify top performers, and spot trends in your business.',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: Calculator,
      title: 'Profit Analysis',
      description: 'Understand your profit margins',
      details: "Get clear insights into what's making money and what needs attention.",
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Set Up Your Profile',
      description: 'Enter your business details and customize settings for your food business.',
    },
    {
      step: '02',
      title: 'Add Your Ingredients',
      description: 'Input your ingredients with costs, or bulk upload from a spreadsheet.',
    },
    {
      step: '03',
      title: 'Create Recipes',
      description: 'Build recipes using your ingredients to automatically calculate costs.',
    },
    {
      step: '04',
      title: 'Track & Analyze',
      description: 'Record sales, monitor expenses, and generate insightful reports.',
    },
  ];

  const stats = [
    { value: 100, suffix: '%', label: 'Accurate Calculations' },
    { value: 0, suffix: '', label: 'Setup Fee' },
    { value: 24, suffix: '/7', label: 'Access' },
    { value: 100, suffix: '%', label: 'Free to Start' },
  ];

  const testimonials: never[] = [];

  const faqs = [
    {
      question: 'Is KwentaMo free to use?',
      answer:
        'Yes! KwentaMo offers a free tier perfect for small food businesses. You can manage ingredients, create recipes, and generate basic reports at no cost.',
    },
    {
      question: 'Can I import my existing data?',
      answer:
        'Absolutely! You can bulk upload ingredients, expenses, and sales data from Excel or CSV files. We also provide templates to make the process even easier.',
    },
    {
      question: 'How accurate is the costing calculation?',
      answer:
        'Our calculations are based on your actual ingredient costs and quantities. The accuracy depends on the data you input, but our system ensures precise computations down to the centavo.',
    },
    {
      question: 'Is my business data secure?',
      answer:
        'Yes, we take security seriously. Your data is encrypted and stored securely. We never share your business information with third parties.',
    },
    {
      question: 'Can I access KwentaMo on my phone?',
      answer:
        'Yes! KwentaMo is fully responsive and works great on mobile devices. You can manage your business from anywhere.',
    },
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '₱0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: ['Up to 50 ingredients', 'Up to 20 recipes', 'Basic reports', 'Email support'],
      cta: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '₱499',
      period: 'per month',
      description: 'For growing businesses',
      features: [
        'Unlimited ingredients',
        'Unlimited recipes',
        'Advanced reports',
        'Bulk upload',
        'Priority support',
        'Export to PDF/Excel',
      ],
      cta: 'Start Free Trial',
      highlighted: true,
    },
    {
      name: 'Business',
      price: '₱999',
      period: 'per month',
      description: 'For established operations',
      features: [
        'Everything in Pro',
        'Multiple branches',
        'Team access',
        'API access',
        'Dedicated support',
        'Custom integrations',
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Structured Data (JSON-LD) for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />

      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-4">
            <img src="/logo-text.svg" alt="Kwenta MO" className="h-10" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" className="text-gray-600 hover:text-primary transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-600 hover:text-primary transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-primary transition-colors">
              Pricing
            </a>
            <a href="#faq" className="text-gray-600 hover:text-primary transition-colors">
              FAQ
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Dashboard'}
                  </Link>
                </Button>
                <Button className="bg-greenz hover:bg-greenz/90" asChild>
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button className="bg-greenz hover:bg-greenz/90" asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t animate-in slide-in-from-top-2">
            <nav className="container mx-auto px-6 py-4 flex flex-col gap-4">
              <a
                href="#features"
                className="text-gray-600 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features{' '}
              </a>
              <a
                href="#how-it-works"
                className="text-gray-600 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <a
                href="#pricing"
                className="text-gray-600 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <a
                href="#faq"
                className="text-gray-600 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t">
                {isAuthenticated ? (
                  <>
                    <Button variant="outline" asChild>
                      <Link to="/dashboard" className="flex items-center gap-2 justify-center">
                        <User className="h-4 w-4" />
                        {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Account'}
                      </Link>
                    </Button>
                    <Button className="bg-greenz" asChild>
                      <Link to="/dashboard">Go to Dashboard</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild>
                      <Link to="/login">Sign In</Link>
                    </Button>
                    <Button className="bg-greenz" asChild>
                      <Link to="/register">Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-6 overflow-hidden bg-gradient-to-br from-lightgreenz/10 via-white to-greenz/5">
          {/* Food Images */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden lg:block animate-in fade-in slide-in-from-left duration-1000 delay-700">
            <img
              src="/assets/pizza.png"
              alt="Pizza"
              className="h-96 object-contain drop-shadow-2xl"
            />
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block animate-in fade-in slide-in-from-right duration-1000 delay-700">
            <img
              src="/assets/sisig.png"
              alt="Sisig"
              className="h-96 object-contain drop-shadow-2xl"
            />
          </div>

          <div className="container mx-auto max-w-5xl text-center relative z-10">
            {/* Badge */}
            <div className="h-20"></div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-gray-900 mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              Smart Costing for Your
              <span className="text-primary block mt-2">Food Business</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              Track ingredients, calculate recipe costs, and maximize profits—all in one simple
              platform designed for small food businesses in Cebu City.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <Button
                size="lg"
                className="text-base px-8 h-12 bg-greenz hover:bg-greenz/90 shadow-lg shadow-greenz/25"
                asChild
              >
                <Link to="/register">
                  Start Free Today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 h-12" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500 animate-in fade-in duration-700 delay-500">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <span>Free to Start</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>No Credit Card Required</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-6 border-y">
          <div className="container mx-auto max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-primary/90 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="py-20 px-6 scroll-mt-20 bg-gradient-to-b from-white via-lightgreenz/5 to-white"
        >
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
                Everything you need to manage costs
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto text-lg">
                Simple tools designed for small food business owners
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="group border border-gray-100 shadow-none hover:shadow-lg hover:border-primary/20 transition-all duration-300 bg-white cursor-pointer"
                >
                  <CardHeader className="pb-3">
                    <div
                      className={`h-12 w-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
                    <CardDescription className="text-gray-500">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-400">{feature.details}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="py-20 px-6 bg-gradient-to-br from-greenz/10 via-midgreenz/10 to-lightgreenz/10 scroll-mt-20"
        >
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
                Get started in minutes
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto text-lg">
                Four simple steps to better business insights
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/30 to-primary/10" />
                  )}
                  <div className="relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
                    <div className="text-4xl font-bold text-primary/20 mb-4">{step.step}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-6 ">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
                Be among the first users
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto text-lg">
                Join us as an early adopter and help shape the future of food business costing
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-2 border-greenz/20 shadow-lg hover:shadow-xl hover:border-greenz/40 transition-all bg-white">
                <CardContent className="pt-6 text-center">
                  <div className="h-16 w-16 rounded-full bg-greenz flex items-center justify-center mx-auto mb-4">
                    <ChefHat className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Early Access</h3>
                  <p className="text-gray-500 text-sm">
                    Get started today with full access to all features
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-midgreenz/20 shadow-lg hover:shadow-xl hover:border-midgreenz/40 transition-all bg-white">
                <CardContent className="pt-6 text-center">
                  <div className="h-16 w-16 rounded-full bg-midgreenz flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Shape the Product</h3>
                  <p className="text-gray-500 text-sm">
                    Your feedback will directly influence future features
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-lightgreenz/20 shadow-lg hover:shadow-xl hover:border-lightgreenz/40 transition-all bg-white">
                <CardContent className="pt-6 text-center">
                  <div className="h-16 w-16 rounded-full bg-lightgreenz flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Exclusive Benefits</h3>
                  <p className="text-gray-500 text-sm">
                    Early adopters get special perks and priority support
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        {/* <section id="pricing" className="py-20 px-6 bg-gray-50/50 scroll-mt-20">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
                Simple, transparent pricing
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto text-lg">
                Start free and upgrade as you grow
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {pricingPlans.map((plan, index) => (
                <Card
                  key={index}
                  className={`relative border ${
                    plan.highlighted
                      ? "border-primary shadow-lg shadow-primary/10 scale-105"
                      : "border-gray-100 shadow-none"
                  } transition-all duration-300 hover:shadow-lg`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
                      Most Popular
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-lg font-medium text-gray-900">
                      {plan.name}
                    </CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.price}
                      </span>
                      <span className="text-gray-500 ml-1">/{plan.period}</span>
                    </div>
                    <CardDescription className="mt-2">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <Check className="h-4 w-4 text-greenz flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full ${
                        plan.highlighted
                          ? "bg-greenz hover:bg-greenz/90"
                          : "bg-gray-900 hover:bg-gray-800"
                      }`}
                      asChild
                    >
                      <Link to="/register">{plan.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section> */}

        {/* FAQ Section */}
        <section
          id="faq"
          className="py-20 px-6 scroll-mt-20 bg-gradient-to-b from-white to-greenz/5"
        >
          <div className="container mx-auto max-w-2xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
                Frequently asked questions
              </h2>
              <p className="text-gray-500 text-lg">Everything you need to know</p>
            </div>

            <div className="divide-y divide-gray-100">
              {faqs.map((faq, index) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-gradient-to-br from-greenz/5 to-lightgreenz/10">
          <div className="container mx-auto max-w-4xl">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-greenz via-midgreenz to-lightgreenz p-12 text-center shadow-2xl">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-lightgreenz/30 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-greenz/30 rounded-full blur-3xl" />

              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
                  Ready to take control of your costs?
                </h2>
                <p className="text-white/80 mb-8 text-lg max-w-lg mx-auto">
                  Join hundreds of food entrepreneurs who are already saving time and maximizing
                  profits.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-white text-greenz hover:bg-white/90 text-base px-8 h-12 font-semibold shadow-lg"
                    asChild
                  >
                    <Link to="/register">
                      Create Free Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-primary hover:bg-white/10 text-base px-8 h-12"
                    asChild
                  >
                    <Link to="/login">Sign In</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 px-6 bg-gray-50/50">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <img src="/logo-text.svg" alt="Kwenta MO" className="h-8 mb-4" />
              <p className="text-sm text-gray-500 max-w-xs">
                Smart costing solutions for Filipino food businesses. Track costs, calculate
                profits, and grow your business.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>
                  <a href="#features" className="hover:text-primary transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-primary transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-primary transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>
                  <Link to="/privacy" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © 2025 {APP_CONFIG.name}. A research proposal by the BSBA Financial Management.
            </p>
            <div className="flex items-center gap-4">
              <Shield className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Secured with Supabase</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
