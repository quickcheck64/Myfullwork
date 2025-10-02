"use client"

import { useState } from "react"
import Link from "next/link"
import { Pickaxe, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function PrivacyPolicy() {
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
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 2024</p>

          <Card className="bg-card/95 backdrop-blur-sm">
            <CardContent className="prose prose-slate dark:prose-invert max-w-none p-8">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
                <p className="text-muted-foreground mb-4">
                  Welcome to Smart S9Trading. We respect your privacy and are committed to protecting your personal
                  data. This privacy policy explains how we collect, use, and safeguard your information when you use
                  our cryptocurrency trading and mining platform.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">2. Information We Collect</h2>
                <p className="text-muted-foreground mb-4">We collect several types of information:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    <strong className="text-foreground">Personal Information:</strong> Name, email address, phone
                    number, and identification documents for verification purposes
                  </li>
                  <li>
                    <strong className="text-foreground">Financial Information:</strong> Cryptocurrency wallet addresses,
                    transaction history, and trading activity
                  </li>
                  <li>
                    <strong className="text-foreground">Technical Information:</strong> IP address, browser type, device
                    information, and usage data
                  </li>
                  <li>
                    <strong className="text-foreground">Communication Data:</strong> Support tickets, feedback, and
                    correspondence with our team
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">3. How We Use Your Information</h2>
                <p className="text-muted-foreground mb-4">We use your information to:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Provide and maintain our trading and mining services</li>
                  <li>Process transactions and manage your account</li>
                  <li>Verify your identity and comply with regulatory requirements</li>
                  <li>Improve our platform and develop new features</li>
                  <li>Send important updates and security notifications</li>
                  <li>Provide customer support and respond to inquiries</li>
                  <li>Detect and prevent fraud, abuse, and security incidents</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">4. Data Security</h2>
                <p className="text-muted-foreground mb-4">
                  We implement industry-standard security measures to protect your data:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>End-to-end encryption for sensitive data transmission</li>
                  <li>Secure storage with advanced encryption protocols</li>
                  <li>Two-factor authentication (2FA) for account access</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Cold storage for the majority of cryptocurrency holdings</li>
                  <li>Limited employee access to personal information</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">5. Data Sharing and Disclosure</h2>
                <p className="text-muted-foreground mb-4">
                  We do not sell your personal information. We may share your data only in the following circumstances:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    <strong className="text-foreground">Service Providers:</strong> Third-party vendors who assist in
                    operating our platform
                  </li>
                  <li>
                    <strong className="text-foreground">Legal Compliance:</strong> When required by law or to protect
                    our legal rights
                  </li>
                  <li>
                    <strong className="text-foreground">Business Transfers:</strong> In connection with a merger,
                    acquisition, or sale of assets
                  </li>
                  <li>
                    <strong className="text-foreground">With Your Consent:</strong> When you explicitly authorize us to
                    share your information
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">6. Your Rights</h2>
                <p className="text-muted-foreground mb-4">You have the right to:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Access and review your personal information</li>
                  <li>Request corrections to inaccurate data</li>
                  <li>Delete your account and associated data</li>
                  <li>Object to certain data processing activities</li>
                  <li>Export your data in a portable format</li>
                  <li>Withdraw consent for data processing</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">7. Cookies and Tracking</h2>
                <p className="text-muted-foreground mb-4">
                  We use cookies and similar technologies to enhance your experience, analyze usage patterns, and
                  improve our services. You can manage cookie preferences through your browser settings. For more
                  details, see our{" "}
                  <Link href="/cookies" className="text-primary hover:underline">
                    Cookie Policy
                  </Link>
                  .
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">8. Data Retention</h2>
                <p className="text-muted-foreground mb-4">
                  We retain your personal information for as long as necessary to provide our services and comply with
                  legal obligations. Transaction records are kept for regulatory compliance purposes, typically for 7
                  years after account closure.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">9. International Transfers</h2>
                <p className="text-muted-foreground mb-4">
                  Your information may be transferred to and processed in countries other than your own. We ensure
                  appropriate safeguards are in place to protect your data in accordance with this privacy policy and
                  applicable laws.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">10. Children's Privacy</h2>
                <p className="text-muted-foreground mb-4">
                  Our services are not intended for individuals under 18 years of age. We do not knowingly collect
                  personal information from children. If you believe we have collected information from a child, please
                  contact us immediately.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">11. Changes to This Policy</h2>
                <p className="text-muted-foreground mb-4">
                  We may update this privacy policy periodically. We will notify you of significant changes via email or
                  through a prominent notice on our platform. Your continued use of our services after changes
                  constitutes acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">12. Contact Us</h2>
                <p className="text-muted-foreground mb-4">
                  If you have questions about this privacy policy or wish to exercise your rights, please contact us:
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
