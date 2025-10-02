"use client"

import { useState } from "react"
import Link from "next/link"
import { Pickaxe, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function TermsOfService() {
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
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 2024</p>

          <Card className="bg-card/95 backdrop-blur-sm">
            <CardContent className="prose prose-slate dark:prose-invert max-w-none p-8">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground mb-4">
                  By accessing and using Smart S9Trading ("the Platform", "we", "us", or "our"), you accept and agree to
                  be bound by these Terms of Service. If you do not agree to these terms, please do not use our
                  services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">2. Eligibility</h2>
                <p className="text-muted-foreground mb-4">To use Smart S9Trading, you must:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Be at least 18 years of age</li>
                  <li>Have the legal capacity to enter into binding contracts</li>
                  <li>Not be prohibited from using our services under applicable laws</li>
                  <li>Reside in a jurisdiction where cryptocurrency trading and mining are legal</li>
                  <li>Complete our identity verification process (KYC)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">3. Account Registration and Security</h2>
                <p className="text-muted-foreground mb-4">When creating an account, you agree to:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Keep your password secure and confidential</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Not share your account with others or create multiple accounts</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">4. Trading and Mining Services</h2>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-3">4.1 Trading Services</h3>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>All trades are final and cannot be reversed once executed</li>
                    <li>Cryptocurrency prices are volatile and can change rapidly</li>
                    <li>We do not guarantee any specific trading outcomes or profits</li>
                    <li>You are responsible for understanding the risks of cryptocurrency trading</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-3">4.2 Mining Services</h3>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Mining returns are estimates and not guaranteed</li>
                    <li>Mining difficulty and rewards can fluctuate</li>
                    <li>We reserve the right to adjust mining allocations based on network conditions</li>
                    <li>Mining contracts may have specific terms and minimum commitment periods</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">5. Fees and Payments</h2>
                <p className="text-muted-foreground mb-4">You agree to pay all applicable fees:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Trading fees as displayed on the platform (typically 0.1% per transaction)</li>
                  <li>Withdrawal fees that vary by cryptocurrency</li>
                  <li>Network transaction fees for blockchain operations</li>
                  <li>Any other fees clearly disclosed before transactions</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  We reserve the right to modify our fee structure with 30 days' notice.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">6. Deposits and Withdrawals</h2>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>You are responsible for providing accurate wallet addresses</li>
                  <li>Transactions sent to incorrect addresses cannot be recovered</li>
                  <li>Withdrawals may be delayed for security reviews</li>
                  <li>We reserve the right to refuse or reverse transactions that violate these terms</li>
                  <li>Minimum deposit and withdrawal amounts apply</li>
                  <li>Processing times vary based on network congestion and security checks</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">7. Prohibited Activities</h2>
                <p className="text-muted-foreground mb-4">You agree not to:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Use the platform for illegal activities or money laundering</li>
                  <li>Manipulate markets or engage in fraudulent trading</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Use automated trading bots without authorization</li>
                  <li>Provide false information or impersonate others</li>
                  <li>Interfere with other users' access to the platform</li>
                  <li>Reverse engineer or copy our software or systems</li>
                  <li>Use the platform in violation of applicable laws</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">8. Risk Disclosure</h2>
                <p className="text-muted-foreground mb-4">
                  Cryptocurrency trading and mining involve significant risks:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    <strong className="text-foreground">Volatility:</strong> Cryptocurrency prices can fluctuate
                    dramatically
                  </li>
                  <li>
                    <strong className="text-foreground">Loss of Capital:</strong> You may lose some or all of your
                    investment
                  </li>
                  <li>
                    <strong className="text-foreground">Regulatory Risk:</strong> Laws governing cryptocurrencies may
                    change
                  </li>
                  <li>
                    <strong className="text-foreground">Technical Risk:</strong> Blockchain networks may experience
                    issues
                  </li>
                  <li>
                    <strong className="text-foreground">Security Risk:</strong> Despite our security measures, no system
                    is completely secure
                  </li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  You acknowledge that you understand these risks and accept full responsibility for your trading and
                  mining decisions.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">9. Limitation of Liability</h2>
                <p className="text-muted-foreground mb-4">To the maximum extent permitted by law:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>We are not liable for any indirect, incidental, or consequential damages</li>
                  <li>Our total liability is limited to the fees you paid in the past 12 months</li>
                  <li>We are not responsible for losses due to market volatility</li>
                  <li>We are not liable for third-party actions or blockchain network issues</li>
                  <li>We do not guarantee uninterrupted or error-free service</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">10. Indemnification</h2>
                <p className="text-muted-foreground mb-4">
                  You agree to indemnify and hold harmless Smart S9Trading, its officers, directors, employees, and
                  agents from any claims, damages, losses, or expenses arising from:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Your violation of these Terms of Service</li>
                  <li>Your use of the platform</li>
                  <li>Your violation of any laws or third-party rights</li>
                  <li>Any unauthorized access to your account</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">11. Account Suspension and Termination</h2>
                <p className="text-muted-foreground mb-4">We reserve the right to suspend or terminate your account:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>If you violate these Terms of Service</li>
                  <li>If we suspect fraudulent or illegal activity</li>
                  <li>If required by law or regulatory authorities</li>
                  <li>If your account remains inactive for an extended period</li>
                  <li>At our discretion with or without notice</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  Upon termination, you may withdraw your funds subject to applicable fees and verification
                  requirements.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">12. Intellectual Property</h2>
                <p className="text-muted-foreground mb-4">
                  All content, trademarks, logos, and intellectual property on Smart S9Trading are owned by us or our
                  licensors. You may not use, copy, or distribute any content without our written permission.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">13. Dispute Resolution</h2>
                <p className="text-muted-foreground mb-4">
                  Any disputes arising from these terms will be resolved through:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Good faith negotiations between the parties</li>
                  <li>Binding arbitration if negotiations fail</li>
                  <li>Arbitration conducted in accordance with applicable arbitration rules</li>
                  <li>Waiver of class action lawsuits</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">14. Governing Law</h2>
                <p className="text-muted-foreground mb-4">
                  These Terms of Service are governed by and construed in accordance with the laws of the jurisdiction
                  in which Smart S9Trading operates, without regard to conflict of law principles.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">15. Changes to Terms</h2>
                <p className="text-muted-foreground mb-4">
                  We may modify these Terms of Service at any time. We will notify you of significant changes via email
                  or platform notification. Your continued use of the platform after changes constitutes acceptance of
                  the updated terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">16. Severability</h2>
                <p className="text-muted-foreground mb-4">
                  If any provision of these terms is found to be invalid or unenforceable, the remaining provisions will
                  continue in full force and effect.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">17. Contact Information</h2>
                <p className="text-muted-foreground mb-4">
                  For questions about these Terms of Service, please contact us:
                </p>
                <ul className="list-none text-muted-foreground space-y-2">
                  <li>Email: smarts9tradingltd@gmail.com</li>
                  <li>
                    Contact Form:{" "}
                    <Link href="/contact" className="text-primary hover:underline">
                      Visit our Contact page
                    </Link>
                  </li>
                  <li>
                    Support:{" "}
                    <Link href="/help" className="text-primary hover:underline">
                      Visit our Help Center
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
