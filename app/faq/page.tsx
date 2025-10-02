"use client"

import { useState } from "react"
import Link from "next/link"
import { Pickaxe, ChevronDown, ChevronUp, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const faqCategories = [
  {
    category: "Account & Registration",
    questions: [
      {
        q: "How do I create an account on Smart S9Trading?",
        a: 'Click the "Get Started" button on our homepage, fill in your email and create a secure password. You\'ll receive a verification email to activate your account. Complete the KYC process to unlock full trading and mining features.',
      },
      {
        q: "What documents do I need for verification?",
        a: "You'll need a government-issued ID (passport, driver's license, or national ID card) and proof of address (utility bill or bank statement dated within the last 3 months). The verification process typically takes 24-48 hours.",
      },
      {
        q: "Can I have multiple accounts?",
        a: "No, each user is allowed only one account per email address. Multiple accounts may result in suspension of all associated accounts.",
      },
      {
        q: "How do I reset my password?",
        a: 'Click "Forgot Password" on the login page, enter your registered email, and follow the instructions sent to your inbox. For security, password reset links expire after 1 hour.',
      },
    ],
  },
  {
    category: "Trading",
    questions: [
      {
        q: "What cryptocurrencies can I trade?",
        a: "Smart S9Trading supports Bitcoin (BTC), Ethereum (ETH), and other major cryptocurrencies. Check your dashboard for the complete list of available trading pairs and real-time prices.",
      },
      {
        q: "What are the trading fees?",
        a: "Our standard trading fee is 0.1% per transaction. High-volume traders can qualify for reduced fees. There are no hidden charges - all fees are displayed before you confirm any transaction.",
      },
      {
        q: "Is there a minimum trade amount?",
        a: "Yes, minimum trade amounts vary by cryptocurrency. Typically, the minimum is equivalent to $10 USD. Check the trading interface for specific minimums for each crypto pair.",
      },
      {
        q: "How do I place a trade?",
        a: "Navigate to the Trading section in your dashboard, select your desired cryptocurrency pair, enter the amount you wish to trade, review the transaction details including fees, and confirm your trade.",
      },
    ],
  },
  {
    category: "Mining Operations",
    questions: [
      {
        q: "How does crypto mining work on your platform?",
        a: "Our platform uses advanced mining algorithms and pooled resources to optimize mining efficiency. When you allocate funds to mining, our system automatically distributes resources across the most profitable mining operations.",
      },
      {
        q: "What is the minimum amount to start mining?",
        a: "The minimum mining allocation varies by cryptocurrency but typically starts at $50 USD equivalent. Higher allocations generally yield better returns due to economies of scale.",
      },
      {
        q: "How often are mining rewards distributed?",
        a: "Mining rewards are calculated daily and credited to your account. You can view your accumulated rewards in real-time through your dashboard and withdraw them at any time.",
      },
      {
        q: "Can I withdraw my mining allocation anytime?",
        a: "Yes, you can withdraw your mining allocation at any time. However, some mining contracts may have minimum commitment periods for optimal returns. Check your specific mining contract details.",
      },
    ],
  },
  {
    category: "Deposits & Withdrawals",
    questions: [
      {
        q: "How do I deposit cryptocurrency?",
        a: "Go to the Deposits section, select your cryptocurrency, copy your unique deposit address, and send funds from your external wallet. Deposits are credited after the required network confirmations (typically 30 minutes to 2 hours).",
      },
      {
        q: "Are there deposit fees?",
        a: "Smart S9Trading does not charge deposit fees. However, you'll need to pay network transaction fees when sending crypto from your external wallet.",
      },
      {
        q: "How long do withdrawals take?",
        a: "Withdrawals are typically processed within 24-48 hours. During high-volume periods, processing may take up to 72 hours. You'll receive email notifications at each stage of the withdrawal process.",
      },
      {
        q: "What are the withdrawal limits?",
        a: "Withdrawal limits depend on your account verification level. Unverified accounts have lower limits, while fully verified accounts enjoy higher daily and monthly withdrawal limits. Check your account settings for specific limits.",
      },
      {
        q: "Are there withdrawal fees?",
        a: "Yes, withdrawal fees vary by cryptocurrency and cover network transaction costs. Fees are clearly displayed before you confirm any withdrawal. We strive to keep fees competitive and transparent.",
      },
    ],
  },
  {
    category: "Security",
    questions: [
      {
        q: "How secure is Smart S9Trading?",
        a: "We employ bank-level security including 256-bit SSL encryption, two-factor authentication (2FA), cold storage for the majority of funds, regular security audits, and DDoS protection. Your security is our top priority.",
      },
      {
        q: "What is two-factor authentication (2FA)?",
        a: "2FA adds an extra layer of security by requiring a second verification code (from an app like Google Authenticator) in addition to your password. We strongly recommend enabling 2FA on your account.",
      },
      {
        q: "What should I do if I suspect unauthorized access?",
        a: "Immediately change your password, enable 2FA if not already active, check your recent activity log, and contact our support team. We'll help secure your account and investigate any suspicious activity.",
      },
      {
        q: "How are my funds protected?",
        a: "The majority of user funds are stored in cold wallets (offline storage) that are not connected to the internet. Only a small percentage needed for daily operations is kept in hot wallets, which are protected by multiple security layers.",
      },
    ],
  },
  {
    category: "Fees & Payments",
    questions: [
      {
        q: "What fees does Smart S9Trading charge?",
        a: "We charge a 0.1% trading fee per transaction, withdrawal fees that vary by cryptocurrency, and no deposit fees. All fees are transparently displayed before you confirm any transaction.",
      },
      {
        q: "Do you charge inactivity fees?",
        a: "No, we do not charge inactivity fees. Your account remains active regardless of how frequently you trade or use our services.",
      },
      {
        q: "Can I get a refund?",
        a: "Cryptocurrency transactions are irreversible by nature. However, if you believe there was an error or unauthorized transaction, contact our support team immediately for investigation.",
      },
    ],
  },
  {
    category: "Technical Support",
    questions: [
      {
        q: "How do I contact customer support?",
        a: "You can reach our 24/7 support team through the Contact Us page, via email at smarts9tradingltd@gmail.com, or through the live chat feature in your dashboard.",
      },
      {
        q: "What if my transaction is stuck or pending?",
        a: "Blockchain transactions can sometimes take longer during network congestion. Check the transaction status in your dashboard. If it's been more than 24 hours, contact support with your transaction ID for assistance.",
      },
      {
        q: "Why is my account restricted?",
        a: "Accounts may be restricted for security reasons, incomplete verification, or suspicious activity. Contact our support team for specific information about your account status and steps to resolve any issues.",
      },
      {
        q: "Do you have a mobile app?",
        a: "Our platform is fully responsive and works seamlessly on mobile browsers. We're currently developing dedicated iOS and Android apps, which will be announced on our website and social media channels.",
      },
    ],
  },
]

export default function FAQ() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())

  const toggleQuestion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId)
    } else {
      newExpanded.add(questionId)
    }
    setExpandedQuestions(newExpanded)
  }

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

      {/* Hero */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground">Find answers to common questions about Smart S9Trading</p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="pb-20 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {faqCategories.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl">{category.category}</CardTitle>
                <CardDescription>Common questions about {category.category.toLowerCase()}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.questions.map((item, questionIndex) => {
                  const questionId = `${categoryIndex}-${questionIndex}`
                  const isExpanded = expandedQuestions.has(questionId)

                  return (
                    <div key={questionIndex} className="border-b border-border last:border-0 pb-4 last:pb-0">
                      <button
                        onClick={() => toggleQuestion(questionId)}
                        className="w-full flex items-center justify-between text-left py-2 hover:text-primary transition-colors"
                      >
                        <span className="font-medium text-foreground pr-4">{item.q}</span>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        )}
                      </button>
                      {isExpanded && <p className="text-muted-foreground mt-2 pl-2">{item.a}</p>}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
              <p className="text-lg mb-6 opacity-90">Our support team is available 24/7 to help you</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button size="lg" variant="secondary">
                    Contact Support
                  </Button>
                </Link>
                <Link href="/help">
                  <Button size="lg" variant="secondary">
                    Visit Help Center
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
      
