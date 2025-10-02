"use client"

import { useState } from "react"
import Link from "next/link"
import { Pickaxe, Shield, TrendingUp, Users, Award, Globe, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutUs() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-gray-900 dark:via-gray-950 dark:to-black transition-colors">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Pickaxe className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">Smart S9Trading</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                Help Center
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-primary hover:bg-primary/90">Get Started</Button>
              </Link>
            </div>

            <button className="md:hidden text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-card/95 backdrop-blur-sm border-t border-border">
            <div className="px-4 py-4 space-y-3">
              <Link href="/" className="block text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/help" className="block text-muted-foreground hover:text-foreground transition-colors">
                Help Center
              </Link>
              <Link href="/contact" className="block text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
              <Link href="/login">
                <Button variant="outline" className="w-full bg-transparent">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="w-full bg-primary hover:bg-primary/90">Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">About Smart S9Trading</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Empowering individuals worldwide to participate in the cryptocurrency revolution through secure trading and
            efficient mining operations.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card/95 backdrop-blur-sm">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-foreground mb-6 text-center">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed text-center">
                At Smart S9Trading, we believe that everyone should have access to the opportunities presented by
                cryptocurrency. Our mission is to provide a secure, user-friendly platform that makes crypto trading and
                mining accessible to both beginners and experienced investors. We combine cutting-edge technology with
                exceptional customer service to help our users achieve their financial goals.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Values Section */}
      <section className="pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Security First</CardTitle>
                <CardDescription>
                  Your assets and data are protected with bank-level security, including cold storage, 2FA, and regular
                  security audits.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Innovation</CardTitle>
                <CardDescription>
                  We continuously improve our platform with the latest technology to provide optimal trading and mining
                  experiences.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Customer Focus</CardTitle>
                <CardDescription>
                  Our 24/7 support team is dedicated to helping you succeed with responsive, knowledgeable assistance.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <Award className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Transparency</CardTitle>
                <CardDescription>
                  We believe in clear communication with no hidden fees, straightforward terms, and honest reporting.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <Globe className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Global Reach</CardTitle>
                <CardDescription>
                  Serving users worldwide with support for multiple cryptocurrencies and international payment methods.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <Pickaxe className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Efficiency</CardTitle>
                <CardDescription>
                  Optimized mining operations and fast transaction processing to maximize your returns and minimize wait
                  times.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card/95 backdrop-blur-sm">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Smart S9Trading was founded by a team of cryptocurrency enthusiasts, blockchain developers, and
                  financial experts who recognized the need for a more accessible and secure platform for crypto trading
                  and mining.
                </p>
                <p>
                  We started with a simple vision: to create a platform that combines the power of professional-grade
                  trading tools with the simplicity that newcomers need. Over the years, we've grown from a small
                  startup to a trusted platform serving thousands of users worldwide.
                </p>
                <p>
                  Our team has decades of combined experience in cryptocurrency, cybersecurity, and financial services.
                  We've built Smart S9Trading on a foundation of cutting-edge technology, rigorous security protocols,
                  and a genuine commitment to our users' success.
                </p>
                <p>
                  Today, we continue to innovate and expand our services, always keeping our users' needs at the
                  forefront of everything we do. Whether you're making your first crypto trade or managing a
                  sophisticated mining operation, Smart S9Trading is here to support your journey.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-8 text-center">
                <div className="text-4xl font-bold mb-2">10,000+</div>
                <div className="text-lg opacity-90">Active Users</div>
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-8 text-center">
                <div className="text-4xl font-bold mb-2">$50M+</div>
                <div className="text-lg opacity-90">Trading Volume</div>
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-8 text-center">
                <div className="text-4xl font-bold mb-2">24/7</div>
                <div className="text-lg opacity-90">Customer Support</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card/95 backdrop-blur-sm">
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">Join Our Community</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Start your cryptocurrency journey with Smart S9Trading today
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card/95 backdrop-blur-sm border-t border-border py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Pickaxe className="h-6 w-6 text-primary" />
                <span className="font-bold text-foreground">Smart S9Trading</span>
              </div>
              <p className="text-sm text-muted-foreground">Secure crypto trading and mining platform</p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-foreground transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-foreground transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Smart S9Trading. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
            }
          
