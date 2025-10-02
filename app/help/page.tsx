"use client"

import { useState } from "react"
import Link from "next/link"
import { Pickaxe, Search, ChevronDown, ChevronUp, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        q: "How do I create an account?",
        a: 'Click the "Get Started" button on the homepage and fill out the registration form with your email and password. You\'ll receive a verification email to activate your account.',
      },
      {
        q: "What cryptocurrencies can I trade?",
        a: "Smart S9Trading supports Bitcoin (BTC), Ethereum (ETH), and other major cryptocurrencies. You can view the complete list in your dashboard.",
      },
      {
        q: "Is there a minimum deposit?",
        a: "The minimum deposit varies by cryptocurrency. Check the deposit section in your dashboard for current minimums.",
      },
    ],
  },
  {
    category: "Trading & Mining",
    questions: [
      {
        q: "How does the mining process work?",
        a: "Our platform uses advanced algorithms to optimize mining operations. Once you deposit funds, our system automatically allocates resources to maximize your returns.",
      },
      {
        q: "What are the trading fees?",
        a: "Trading fees are competitive and transparent. Standard trading fees are 0.1% per transaction, with discounts available for high-volume traders.",
      },
      {
        q: "How long does it take to see returns?",
        a: "Returns are calculated daily and credited to your account. You can view your earnings in real-time through the dashboard.",
      },
    ],
  },
  {
    category: "Withdrawals & Deposits",
    questions: [
      {
        q: "How do I withdraw funds?",
        a: "Navigate to the Withdrawals section in your dashboard, enter the amount and your wallet address, then confirm the transaction. Withdrawals are typically processed within 24-48 hours.",
      },
      {
        q: "Are there withdrawal limits?",
        a: "Withdrawal limits depend on your account verification level. Fully verified accounts have higher limits.",
      },
      {
        q: "How long do deposits take?",
        a: "Cryptocurrency deposits are credited after the required network confirmations, typically within 30 minutes to 2 hours.",
      },
    ],
  },
  {
    category: "Security",
    questions: [
      {
        q: "How is my account secured?",
        a: "We use industry-standard encryption, two-factor authentication (2FA), and cold storage for the majority of funds to ensure maximum security.",
      },
      {
        q: "What should I do if I suspect unauthorized access?",
        a: "Immediately change your password, enable 2FA if not already active, and contact our support team through the Contact Us page.",
      },
      {
        q: "Do you store my private keys?",
        a: "We use secure wallet infrastructure with multi-signature technology. Your funds are protected with enterprise-grade security measures.",
      },
    ],
  },
]

export default function HelpCenter() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
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

  const filteredFaqs = faqs
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.a.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.questions.length > 0)

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
              <Link href="/help" className="text-foreground font-medium">
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
              <Link href="/help" className="block text-foreground font-medium">
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
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">How Can We Help You?</h1>
          <p className="text-xl text-muted-foreground mb-8">Search our knowledge base or browse categories below</p>

          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg bg-card/95 backdrop-blur-sm"
            />
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="pb-20 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {filteredFaqs.map((category, categoryIndex) => (
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
                        <span className="font-medium text-foreground">{item.q}</span>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                        )}
                      </button>
                      {isExpanded && <p className="text-muted-foreground mt-2 pl-2">{item.a}</p>}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))}

          {filteredFaqs.length === 0 && (
            <Card className="bg-card/95 backdrop-blur-sm">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No results found for "{searchQuery}". Try different keywords or{" "}
                  <Link href="/contact" className="text-primary hover:underline">
                    contact our support team
                  </Link>
                  .
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
              <p className="text-lg mb-6 opacity-90">Our support team is here to assist you 24/7</p>
              <Link href="/contact">
                <Button size="lg" variant="secondary">
                  Contact Support
                </Button>
              </Link>
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
