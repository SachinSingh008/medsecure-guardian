import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Shield, QrCode, Tablet, MapPin, History, AlertTriangle, Gift, Brain,
  Wifi, Factory, Truck, Store, User, ArrowRight, CheckCircle2, XCircle
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const features = [
  { icon: QrCode, title: "One-Time Scan Lifecycle", desc: "Each code can only be verified once, preventing reuse and duplication." },
  { icon: MapPin, title: "Region Locking", desc: "Medicines are assigned to specific regions. Out-of-zone scans trigger alerts." },
  { icon: Wifi, title: "Offline Verification", desc: "Verify medicines even without internet using cryptographic signatures." },
  { icon: History, title: "Scan History", desc: "Complete audit trail of every scan with location and timestamp data." },
  { icon: AlertTriangle, title: "Recall Alerts", desc: "Instant notifications when a batch is recalled by manufacturer or authority." },
  { icon: Gift, title: "Rewards System", desc: "Earn MedPoints for verifying medicines. Redeem for health-related benefits." },
  { icon: Brain, title: "AI Packaging Verification", desc: "AI-powered visual inspection of packaging to detect counterfeit designs." },
  { icon: Tablet, title: "Tablet-Level Codes", desc: "Each individual tablet has a unique foil code for verification when strips are cut." },
];

const supplySteps = [
  { icon: Factory, label: "Manufacturer", desc: "Codes generated & assigned" },
  { icon: Truck, label: "Distributor", desc: "Region-locked shipment" },
  { icon: Store, label: "Pharmacy", desc: "Stock verified & sold" },
  { icon: User, label: "Customer", desc: "Scan & verify authenticity" },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center bg-hero-gradient overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-secondary/20 blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-accent/15 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-sm font-medium mb-6">
                <Shield className="w-4 h-4" />
                India's National Medicine Authentication
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight mb-6">
                Verify Every Tablet.{" "}
                <span className="text-gradient-teal">Stop Fake Medicines.</span>
              </h1>
              <p className="text-lg text-primary-foreground/70 leading-relaxed mb-8 max-w-xl">
                MedSecure is a medicine authentication and supply-chain tracking system that enables
                customers to verify medicine authenticity even when strips are cut into single tablets.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/verify">Verify Medicine Now</Link>
                </Button>
                <Button variant="hero-outline" size="lg" asChild>
                  <Link to="/manufacturer">Manufacturer Login</Link>
                </Button>
                <Button variant="navy" size="lg" className="border border-primary-foreground/20" asChild>
                  <Link to="/admin">Admin Dashboard</Link>
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden lg:block"
            >
              <img
                src={heroImage}
                alt="Medicine verification with smartphone scanning QR code on medicine strip"
                className="rounded-2xl shadow-elevated w-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-14"
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              The Counterfeit Medicine <span className="text-destructive">Crisis</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-lg">
              Every year, millions of people consume fake or expired medicines due to supply chain vulnerabilities.
            </motion.p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: XCircle, title: "Fake Medicines Kill", desc: "WHO estimates 1 in 10 medical products in developing countries is substandard or falsified.", color: "text-destructive" },
              { icon: QrCode, title: "QR Systems Fail When Cut", desc: "Existing QR code systems fail when medicine strips are cut and sold as individual tablets.", color: "text-warning" },
              { icon: AlertTriangle, title: "Supply Chain Leakage", desc: "Medicines are diverted to black markets through untracked distribution channels.", color: "text-warning" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="bg-card rounded-xl p-8 shadow-card border border-border hover:shadow-elevated transition-all duration-300"
              >
                <item.icon className={`w-10 h-10 ${item.color} mb-4`} />
                <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-14">
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Two-Layer <span className="text-gradient-teal">Verification</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-lg">
              MedSecure provides dual authentication at both strip and tablet level.
            </motion.p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { icon: QrCode, title: "Full Strip QR Verification", desc: "Scan the QR code on the medicine strip to verify the entire batch, manufacturer, and supply chain history.", color: "bg-secondary" },
              { icon: Tablet, title: "Individual Tablet Foil Code", desc: "Each tablet's foil backing contains a unique circular code. Even when strips are cut, every tablet can be verified independently.", color: "bg-accent" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="bg-card rounded-xl p-8 shadow-card border border-border flex gap-5"
              >
                <div className={`w-14 h-14 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                  <item.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-14">
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Key <span className="text-gradient-teal">Features</span>
            </motion.h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="bg-card rounded-xl p-6 shadow-card border border-border hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                  <f.icon className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-hero-gradient">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-14">
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              How It <span className="text-gradient-teal">Works</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-primary-foreground/60 text-lg">
              Complete supply chain tracking from manufacturer to consumer.
            </motion.p>
          </motion.div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
            {supplySteps.map((step, i) => (
              <motion.div
                key={step.label}
                variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="flex items-center gap-4"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-2xl bg-secondary/15 border border-secondary/30 flex items-center justify-center mb-3">
                    <step.icon className="w-9 h-9 text-secondary" />
                  </div>
                  <h4 className="font-bold text-primary-foreground text-sm">{step.label}</h4>
                  <p className="text-xs text-primary-foreground/50 mt-1 max-w-[120px]">{step.desc}</p>
                </div>
                {i < supplySteps.length - 1 && (
                  <ArrowRight className="w-6 h-6 text-secondary/50 hidden md:block mx-4" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Join India's National Medicine Authentication Network
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Protect patients, build trust, and comply with national drug safety regulations.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="flex flex-wrap justify-center gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/verify">Verify Medicine</Link>
              </Button>
              <Button variant="accent" size="lg">Request Demo</Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Trusted by <span className="text-gradient-teal">Healthcare Leaders</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: "Dr. Priya Sharma", role: "Chief Pharmacist, Apollo", quote: "MedSecure has eliminated counterfeit medicines from our supply chain completely." },
              { name: "Rajesh Kumar", role: "Quality Head, Cipla", quote: "The tablet-level verification is groundbreaking. No other system offers this level of granularity." },
              { name: "Dr. Anil Mehra", role: "Drug Controller, Maharashtra", quote: "MedSecure gives us real-time visibility into the entire pharmaceutical supply chain." },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="bg-card rounded-xl p-6 shadow-card border border-border"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <CheckCircle2 key={j} className="w-4 h-4 text-secondary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{t.quote}"</p>
                <div>
                  <p className="font-bold text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
