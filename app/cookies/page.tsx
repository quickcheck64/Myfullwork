"use client"

import { useState } from "react"
import Link from "next/link"
import { Pickaxe, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function CookiePolicy() {
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

      {/* Content */}
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Cookie Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 2024</p>

          <Card className="bg-card/95 backdrop-blur-sm">
            <CardContent className="prose prose-slate dark:prose-invert max-w-none p-8">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">1. What Are Cookies?</h2>
                <p className="text-muted-foreground mb-4">
                  Cookies are small text files that are placed on your device when you visit our website. They help us
                  provide you with a better experience by remembering your preferences, analyzing how you use our
                  platform, and improving our services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">2. Types of Cookies We Use</h2>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Essential Cookies</h3>
                  <p className="text-muted-foreground mb-2">
                    These cookies are necessary for the website to function properly. They enable core functionality
                    such as:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>User authentication and account access</li>
                    <li>Security features and fraud prevention</li>
                    <li>Session management</li>
                    <li>Load balancing and performance optimization</li>
                  </ul>
                  <p className="text-muted-foreground mt-2">
                    <strong className="text-foreground">Duration:</strong> Session or up to 1 year
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Functional Cookies</h3>
                  <p className="text-muted-foreground mb-2">
                    These cookies allow us to remember your preferences and provide enhanced features:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Language and region preferences</li>
                    <li>Dark mode or light mode selection</li>
                    <li>Currency display preferences</li>
                    <li>Customized dashboard layouts</li>
                  </ul>
                  <p className="text-muted-foreground mt-2">
                    <strong className="text-foreground">Duration:</strong> Up to 2 years
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Analytics Cookies</h3>
                  <p className="text-muted-foreground mb-2">
                    These cookies help us understand how visitors interact with our platform:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Page views and navigation patterns</li>
                    <li>Time spent on different sections</li>
                    <li>Error tracking and performance monitoring</li>
                    <li>Feature usage statistics</li>
                  </ul>
                  <p className="text-muted-foreground mt-2">
                    <strong className="text-foreground">Duration:</strong> Up to 2 years
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Marketing Cookies</h3>
                  <p className="text-muted-foreground mb-2">
                    These cookies track your activity to deliver relevant advertisements:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Personalized content recommendations</li>
                    <li>Targeted advertising campaigns</li>
                    <li>Social media integration</li>
                    <li>Conversion tracking</li>
                  </ul>
                  <p className="text-muted-foreground mt-2">
                    <strong className="text-foreground">Duration:</strong> Up to 1 year
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">3. Third-Party Cookies</h2>
                <p className="text-muted-foreground mb-4">
                  We may use third-party services that set their own cookies. These include:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    <strong className="text-foreground">Google Analytics:</strong> For website analytics and performance
                    tracking
                  </li>
                  <li>
                    <strong className="text-foreground">Payment Processors:</strong> For secure transaction processing
                  </li>
                  <li>
                    <strong className="text-foreground">Customer Support:</strong> For live chat and support ticket
                    management
                  </li>
                  <li>
                    <strong className="text-foreground">Security Services:</strong> For fraud detection and prevention
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">4. Managing Your Cookie Preferences</h2>
                <p className="text-muted-foreground mb-4">You have several options to manage cookies:</p>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Browser Settings</h3>
                  <p className="text-muted-foreground mb-2">
                    Most browsers allow you to control cookies through their settings:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Block all cookies</li>
                    <li>Block third-party cookies only</li>
                    <li>Delete cookies when you close your browser</li>
                    <li>View and delete individual cookies</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Our Cookie Consent Tool</h3>
                  <p className="text-muted-foreground">
                    When you first visit Smart S9Trading, you'll see a cookie consent banner. You can customize your
                    preferences by selecting which types of cookies you want to accept. You can change these preferences
                    at any time through your account settings.
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Impact of Disabling Cookies</h3>
                  <p className="text-muted-foreground">
                    Please note that disabling certain cookies may affect your experience on our platform. Essential
                    cookies cannot be disabled as they are necessary for the website to function properly.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">5. Do Not Track Signals</h2>
                <p className="text-muted-foreground mb-4">
                  Some browsers include a "Do Not Track" (DNT) feature that signals to websites that you don't want to
                  be tracked. Currently, there is no industry standard for how to respond to DNT signals. We will
                  continue to monitor developments in this area.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">6. Mobile Devices</h2>
                <p className="text-muted-foreground mb-4">
                  Mobile devices use identifiers similar to cookies. You can manage these through your device settings:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    <strong className="text-foreground">iOS:</strong> Settings → Privacy → Advertising → Limit Ad
                    Tracking
                  </li>
                  <li>
                    <strong className="text-foreground">Android:</strong> Settings → Google → Ads → Opt out of Ads
                    Personalization
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">7. Updates to This Policy</h2>
                <p className="text-muted-foreground mb-4">
                  We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or
                  our business practices. We will notify you of significant changes by posting a notice on our website
                  or sending you an email.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">8. Contact Us</h2>
                <p className="text-muted-foreground mb-4">
                  If you have questions about our use of cookies, please contact us:
                </p>
                <ul className="list-none text-muted-foreground space-y-2">
                  <li>Email: smarts9tradingltd@gmail.com</li>
                  <li>
                    Contact Form:{" "}
                    <Link href="/contact" className="text-primary hover:underline">
                      Visit our Contact page
                    </Link>
                  </li>
                </ul>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>

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
