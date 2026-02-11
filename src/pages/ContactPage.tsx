import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, MapPin, Send, Building2, Users } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-muted">
      <section className="bg-hero-gradient py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-primary-foreground mb-3"
          >
            Contact Us
          </motion.h1>
          <p className="text-primary-foreground/60 max-w-2xl mx-auto">
            Get in touch with the MedSecure team for inquiries, partnerships, or support.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-xl p-8 shadow-elevated border border-border"
          >
            <h2 className="text-xl font-bold text-foreground mb-6">Send us a message</h2>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label><Input placeholder="Your name" className="h-11" /></div>
                <div><label className="text-sm font-medium text-foreground mb-1.5 block">Email</label><Input placeholder="email@example.com" type="email" className="h-11" /></div>
              </div>
              <div><label className="text-sm font-medium text-foreground mb-1.5 block">Organization</label><Input placeholder="Company / Hospital / Government Body" className="h-11" /></div>
              <div><label className="text-sm font-medium text-foreground mb-1.5 block">Subject</label><Input placeholder="How can we help?" className="h-11" /></div>
              <div><label className="text-sm font-medium text-foreground mb-1.5 block">Message</label>
                <textarea className="w-full h-32 rounded-lg border border-input bg-background p-3 text-sm resize-none" placeholder="Tell us more..." />
              </div>
              <Button variant="hero" className="w-full h-12"><Send className="w-4 h-4 mr-2" /> Send Message</Button>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2"><Building2 className="w-5 h-5 text-secondary" /> Partnership Inquiry</h3>
              <p className="text-sm text-muted-foreground mb-4">Interested in integrating MedSecure into your hospital, pharmacy chain, or distribution network?</p>
              <Button variant="accent" size="sm"><Users className="w-4 h-4 mr-1" /> Request Partnership Info</Button>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            {[
              { icon: Mail, label: "Email", value: "info@medsecure.in", sub: "support@medsecure.in" },
              { icon: Phone, label: "Phone", value: "+91-1800-MED-SAFE", sub: "Mon–Sat, 9AM–6PM IST" },
              { icon: MapPin, label: "Office", value: "MedSecure Technologies Pvt. Ltd.", sub: "Connaught Place, New Delhi – 110001" },
            ].map((item) => (
              <div key={item.label} className="bg-card rounded-xl p-6 shadow-card border border-border flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{item.label}</h3>
                  <p className="text-foreground text-sm">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
              </div>
            ))}

            <div className="bg-hero-gradient rounded-xl p-8 text-center">
              <h3 className="text-xl font-bold text-primary-foreground mb-2">Request a Demo</h3>
              <p className="text-primary-foreground/60 text-sm mb-4">See MedSecure in action with a personalized walkthrough.</p>
              <Button variant="hero">Schedule Demo</Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
