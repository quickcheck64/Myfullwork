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

  // ✅ Contact form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(null)
    setError(null)

    try {
      const res = await fetch("https://chainminer.netlify.app/api/app/send-email4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("Failed to send message")

      setSuccess("✅ Your message has been sent successfully!")
      setFormData({ name: "", email: "", subject: "", category: "", message: "" })
    } catch (err: any) {
      setError(err.message || "Something went wrong, please try again.")
    } finally {
      setLoading(false)
    }
  }

  // ✅ Open JivoChat when clicking Live Chat button
  const openJivoChat = () => {
    if (typeof window !== "undefined" && (window as any).jivo_api) {
      (window as any).jivo_api.open()
    } else {
      alert("Live chat is not available at the moment. Please try again later.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-gray-900 dark:via-gray-950 dark:to-black transition-colors">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-border">
        {/* ... your nav code stays unchanged ... */}
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
            {/* Email Support */}
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

            {/* Live Chat */}
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

            {/* Availability */}
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
                {/* Name */}
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

                {/* Email */}
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

                {/* Category */}
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

                {/* Subject */}
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

                {/* Message */}
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

                {/* Feedback messages */}
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

      {/* ✅ Rest of your FAQ + Footer stays unchanged */}
    </div>
  )
}
