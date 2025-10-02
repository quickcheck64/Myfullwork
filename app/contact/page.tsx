"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Pickaxe, Mail, MessageSquare, Clock, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ContactUs() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Send form data to your email API
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setSuccess(null)
  setError(null)

  try {
    const res = await fetch("/api/send-email", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    type: "contact",
    data: formData,
  }),
})

    if (!res.ok) {
      // try to read error message if provided
      let errMsg = "Failed to send message"
      try {
        const json = await res.json()
        if (json?.message) errMsg = json.message
      } catch (_) {}
      throw new Error(errMsg)
    }

    setSuccess("✅ Your message has been sent successfully!")
    setFormData({ name: "", email: "", subject: "", category: "", message: "" })
  } catch (err: any) {
    setError(err?.message || "Something went wrong, please try again.")
  } finally {
    setLoading(false)
  }
  }

  // Open JivoChat widget when user clicks Start Chat
  const openJivoChat = () => {
    if (typeof window !== "undefined" && (window as any).jivo_api) {
      try {
        ;(window as any).jivo_api.open()
      } catch (e) {
        // fallback
        alert("Unable to open live chat right now. Please try again later.")
      }
    } else {
      alert("Live chat is not available at the moment. Please try again later.")
    }
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
              <Link href="/contact" className="text-foreground font-medium">
                Contact
              </Link>
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
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
              <Link href="/contact" className="block text-foreground font-medium">
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
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Get in Touch</h1>
          <p className="text-xl text-muted-foreground">Our support team is here to help you 24/7</p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card/95 backdrop-blur-sm">
              <CardHeader className="text-center">
                <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Email Support</CardTitle>
                <CardDescription>Get a response within 24 hours</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <a href="mailto:smarts9tradingltd@gmail.com" className="text-primary hover:underline">
                  smarts9tradingltd@gmail.com
                </a>
              </CardContent>
            </Card>

            <Card className="bg-card/95 backdrop-blur-sm">
              <CardHeader className="text-center">
                <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Live Chat</CardTitle>
                <CardDescription>Chat with our team in real-time</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full" onClick={openJivoChat}>Start Chat</Button>
              </CardContent>
            </Card>

            <Card className="bg-card/95 backdrop-blur-sm">
              <CardHeader className="text-center">
                <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>24/7 Availability</CardTitle>
                <CardDescription>We're always here to help</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">Round-the-clock support for all users</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Send Us a Message</CardTitle>
              <CardDescription>Fill out the form below and we'll get back to you as soon as possible</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="trading">Trading Support</SelectItem>
                      <SelectItem value="mining">Mining Support</SelectItem>
                      <SelectItem value="account">Account Issues</SelectItem>
                      <SelectItem value="technical">Technical Support</SelectItem>
                      <SelectItem value="billing">Billing & Payments</SelectItem>
                      <SelectItem value="security">Security Concerns</SelectItem>
                      <SelectItem value="feedback">Feedback & Suggestions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your inquiry"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Please provide as much detail as possible..."
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                {/* Feedback */}
                {success && <p className="text-green-600">{success}</p>}
                {error && <p className="text-red-600">{error}</p>}

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Link */}
      <section className="pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Looking for Quick Answers?</h2>
              <p className="text-lg mb-6 opacity-90">Check out our FAQ and Help Center for instant solutions</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/faq">
                  <Button size="lg" variant="secondary">
                    View FAQ
                  </Button>
                </Link>
                <Link href="/help">
                  <Button size="lg" variant="secondary">
                    Help Center
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
