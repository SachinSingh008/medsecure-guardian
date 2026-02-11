import { motion } from "framer-motion";
import {
  Shield, Lock, Fingerprint, Database, FileCheck, Eye, Server,
  CheckCircle2, Globe, Cloud
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const } }),
};

const securityFeatures = [
  { icon: Lock, title: "End-to-End Encryption", desc: "All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Medicine codes are cryptographically signed." },
  { icon: Fingerprint, title: "Digital Signatures", desc: "Every code is digitally signed by the manufacturer's private key, ensuring tamper-proof authentication." },
  { icon: Database, title: "Secure Database", desc: "Distributed, redundant database with real-time replication across multiple availability zones." },
  { icon: Shield, title: "Offline Verification", desc: "Cryptographic signatures embedded in codes allow verification without internet connectivity." },
  { icon: Eye, title: "Audit Logs", desc: "Immutable, timestamped logs of every action — code generation, scans, recalls, and administrative changes." },
  { icon: FileCheck, title: "Data Privacy", desc: "GDPR and India DPDP Act compliant. Minimal data collection with user consent management." },
];

const compliance = [
  { icon: Shield, label: "ISO 27001 Ready", desc: "Information security management system" },
  { icon: Globe, label: "Government Compliance", desc: "Compliant with CDSCO & FDA guidelines" },
  { icon: Cloud, label: "Secure Cloud Deployment", desc: "SOC 2 Type II certified infrastructure" },
  { icon: Server, label: "Data Sovereignty", desc: "All data stored within India's borders" },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-muted">
      <section className="bg-hero-gradient py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-primary-foreground mb-3"
          >
            Security & Compliance
          </motion.h1>
          <p className="text-primary-foreground/60 max-w-2xl mx-auto">
            Enterprise-grade security protecting India's pharmaceutical supply chain.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Security Features */}
        <div>
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">
            Security <span className="text-gradient-teal">Architecture</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {securityFeatures.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="bg-card rounded-xl p-6 shadow-card border border-border hover:shadow-elevated transition-shadow duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Compliance Badges */}
        <div>
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">
            Compliance <span className="text-gradient-teal">Certifications</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {compliance.map((c, i) => (
              <motion.div
                key={c.label}
                variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="bg-card rounded-xl p-6 shadow-card border border-border text-center hover:shadow-elevated transition-shadow duration-300"
              >
                <div className="w-16 h-16 rounded-full bg-hero-gradient flex items-center justify-center mx-auto mb-4">
                  <c.icon className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="font-bold text-foreground mb-1">{c.label}</h3>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
                <CheckCircle2 className="w-5 h-5 text-success mx-auto mt-3" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trust CTA */}
        <div className="bg-hero-gradient rounded-2xl p-12 text-center max-w-4xl mx-auto">
          <Shield className="w-12 h-12 text-secondary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary-foreground mb-3">Built for Trust</h2>
          <p className="text-primary-foreground/60 max-w-xl mx-auto">
            MedSecure's security architecture is designed to meet the highest standards of pharmaceutical safety and cybersecurity compliance.
          </p>
        </div>
      </div>
    </div>
  );
}
