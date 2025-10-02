"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Menu,
  Star,
  Shield,
  Users,
  ArrowRight,
  CheckCircle,
  Award,
  TrendingUp,
  Clock,
  Pickaxe,
  Gift,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMenuOpen])

  const handleMenuItemClick = () => {
    setIsMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-gray-900 dark:via-gray-950 dark:to-black transition-colors">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Pickaxe className="text-primary font-bold text-sm h-4 w-4" />
              </div>
              <span className="text-xl font-bold text-foreground">Smart S9Trading</span>
            </div>
            <ul className="hidden md:flex space-x-8">
              <li>
                <Link
                  href="#features"
                  className="text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#how-it-works"
                  className="text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  About Us
                </Link>
              </li>
            </ul>
            <div className="hidden md:flex space-x-4">
              <Button asChild variant="ghost" className="text-muted-foreground hover:text-primary">
                <Link href="/login">Login</Link>
              </Button>
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
              >
                <Link href="/signup">Start Mining</Link>
              </Button>
            </div>
            <button
              ref={buttonRef}
              className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
          {isMenuOpen && (
            <div
              ref={menuRef}
              className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 shadow-lg border-t border-gray-100 dark:border-gray-800 py-4 animate-in slide-in-from-top-2"
            >
              <div className="container mx-auto px-4 space-y-4">
                <Link
                  href="#features"
                  className="block text-muted-foreground hover:text-primary transition-colors py-2"
                  onClick={handleMenuItemClick}
                >
                  Features
                </Link>
                <Link
                  href="#how-it-works"
                  className="block text-muted-foreground hover:text-primary transition-colors py-2"
                  onClick={handleMenuItemClick}
                >
                  How It Works
                </Link>
                <Link
                  href="/contact"
                  className="block text-muted-foreground hover:text-primary transition-colors py-2"
                  onClick={handleMenuItemClick}
                >
                  Contact Us
                </Link>
                <Link
                  href="/about"
                  className="block text-muted-foreground hover:text-primary transition-colors py-2"
                  onClick={handleMenuItemClick}
                >
                  About Us
                </Link>
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Button asChild variant="ghost" className="justify-start" onClick={handleMenuItemClick}>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild className="bg-primary hover:bg-primary/90" onClick={handleMenuItemClick}>
                    <Link href="/signup">Start Trading</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main>
        <section id="hero" className="py-20 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-emerald-100/30 dark:from-primary/5 dark:to-transparent"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200/20 dark:bg-emerald-500/10 rounded-full blur-3xl"></div>

          <div className="container mx-auto px-4 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center px-4 py-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full text-primary text-sm font-medium mb-6 hover:shadow-md transition-all animate-pulse">
                  <Star className="w-4 h-4 mr-2 text-primary" />
                  Trusted by 25,000+ miners worldwide
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                  Invest Crypto with
                  <span className="bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                    {" "}
                    Maximum Profit
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
                  Join our advanced crypto trading platform and start earning Bitcoin and Ethereum with optimized
                  algorithms, secure infrastructure, and instant payouts.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button
                    asChild
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                  >
                    <Link href="/signup" className="flex items-center">
                      Start Trading Today
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-border hover:bg-accent hover:border-primary hover:text-primary transition-all bg-transparent"
                  >
                    <Link href="/login">Access Dashboard</Link>
                  </Button>
                </div>
                <div className="flex items-center justify-center lg:justify-start mt-8 space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    No setup fees
                  </div>
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-blue-500" />
                    Secure trading
                  </div>
                  <div className="flex items-center">
                    <Pickaxe className="w-4 h-4 mr-2 text-primary" />
                    24/7 operations
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-border hover:shadow-3xl transition-all">
                  <Image
                    src="/crypto-mining-dashboard-interface-with-bitcoin-and.png"
                    alt="Mining Dashboard Preview"
                    className="w-full h-auto rounded-lg"
                    width={500}
                    height={400}
                  />
                </div>
                <div className="absolute -top-4 -right-4 bg-card backdrop-blur-sm rounded-lg shadow-lg p-4 border border-border animate-bounce">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-foreground">+0.0025 BTC mined</span>
                  </div>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-card backdrop-blur-sm rounded-lg shadow-lg p-4 border border-border animate-bounce delay-1000">
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Trading active!</span>
                  </div>
                </div>
                <div className="absolute top-1/2 -left-6 bg-card backdrop-blur-sm rounded-lg shadow-lg p-3 border border-border animate-pulse">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-medium text-foreground">98.5% uptime</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Smart S9Trading?</h2>
              <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
                Experience the most reliable and profitable crypto trading platform
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold">Secure & Trusted</h3>
                <p className="text-primary-foreground/80">
                  Your investments are protected with enterprise-grade security
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto">
                  <Pickaxe className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold">High Performance</h3>
                <p className="text-primary-foreground/80">Optimized trading algorithms for maximum profitability</p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold">24/7 Support</h3>
                <p className="text-primary-foreground/80">Our dedicated team is here to help you succeed</p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Multiple Ways to Mine</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Discover various Trading opportunities on our platform. From Bitcoin to Ethereum, there's always a
                profitable Trading option available.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-6">Bitcoin Trading</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground">Advanced ASIC Mining $ Trader</h4>
                      <p className="text-muted-foreground">
                        Access to the latest ASIC miners and trader with optimized hash rates. Earn consistent Bitcoin rewards with
                        our state-of-the-art mining infrastructure.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground">Pool Mining Benefits</h4>
                      <p className="text-muted-foreground">
                        Join our Trading pools for more consistent payouts and reduced variance. Share rewards with other
                        Traders while maintaining competitive rates.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground">Real-time Monitoring</h4>
                      <p className="text-muted-foreground">
                        Track your trading performance with detailed analytics, hash rate monitoring, and profitability
                        calculations updated in real-time.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-8 border border-border">
                <Image
                  src="/bitcoin-mining-interface-with-hash-rate-charts-and.png"
                  alt="Bitcoin Mining Interface"
                  className="w-full h-auto rounded-lg"
                  width={400}
                  height={300}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-8 border border-border order-2 lg:order-1">
                <Image
                  src="/ethereum-mining-dashboard-with-gpu-mining-stats-an.png"
                  alt="Ethereum Mining Activities"
                  className="w-full h-auto rounded-lg"
                  width={400}
                  height={300}
                />
              </div>
              <div className="order-1 lg:order-2">
                <h3 className="text-2xl font-bold text-foreground mb-6">Ethereum & Bitcoin Trading</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground">GPU Mining Farms</h4>
                      <p className="text-muted-foreground">
                        Access high-performance GPU mining rigs optimized for Ethereum, Bitcoin and other profitable alt-coins
                        with automatic profit switching.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground">Smart Contracts</h4>
                      <p className="text-muted-foreground">
                        Participate in decentralized mining & Trading contracts with transparent terms and automated payouts
                        directly to your wallet.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Award className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground">Staking Rewards</h4>
                      <p className="text-muted-foreground">
                        Earn additional rewards through staking mechanisms and participate in network validation for
                        supported proof-of-stake cryptocurrencies.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Gift className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground">Bonus Programs</h4>
                      <p className="text-muted-foreground">
                        Take advantage of limited-time Trading bonuses, referral rewards, and loyalty programs for
                        long-term Traders.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="py-20 md:py-24 bg-accent/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to Start Trading?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of Investors earning cryptocurrency daily through our advanced Trading platform
              </p>
            </div>
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-card/95 backdrop-blur-sm rounded-2xl shadow-sm p-8 border border-border">
                <h3 className="text-xl font-semibold text-foreground mb-4">Getting Started is Simple</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Create your free account, deposit your initial Trading investment, and start earning cryptocurrency
                  with our optimized mining algorithms. Monitor your progress and withdraw earnings anytime.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                    <Link href="/signup">Create Trading Account</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-border hover:bg-accent bg-transparent">
                    <Link href="/login">Access Dashboard</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="cta" className="bg-primary text-primary-foreground py-20 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-32 h-32 bg-primary-foreground/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-primary-foreground/10 rounded-full blur-xl"></div>
          </div>
          <div className="container mx-auto px-4 text-center relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Mining?</h2>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90 leading-relaxed">
              Join thousands of miners who are already earning cryptocurrency. Sign up today and get your first mining
              session.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                size="lg"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <Link href="/signup" className="flex items-center">
                  Start Trading
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <div className="flex items-center text-sm opacity-75">
                <Clock className="w-4 h-4 mr-2" />
                Setup takes less than 5 minutes
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Pickaxe className="text-primary-foreground font-bold text-sm h-4 w-4" />
                </div>
                <span className="text-xl font-bold">Smart S9Trading</span>
              </div>
              <p className="text-gray-400">
                The most trusted platform for cryptocurrency Trading and portfolio management.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/signup" className="hover:text-white transition-colors">
                    Bitcoin Trading
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-white transition-colors">
                    Ethereum Trading
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-white transition-colors">
                    Mining Pools
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <a href="mailto:smarts9tradingltd@gmail.com" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-white transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Smart S9Trading. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
