import { motion } from "framer-motion";
import { Shield, Target, Eye, Users, Globe, Award } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const } }),
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-muted">
      <section className="bg-hero-gradient py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-primary-foreground mb-3"
          >
            About MedSecure
          </motion.h1>
          <p className="text-primary-foreground/60 max-w-2xl mx-auto">
            Building India's most trusted pharmaceutical authentication platform.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 space-y-16">
        <div className="max-w-3xl mx-auto text-center">
          <motion.p variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-lg text-muted-foreground leading-relaxed"
          >
            MedSecure was founded with a single mission: eliminate counterfeit medicines from India's pharmaceutical supply chain.
            Our patented dual-verification system — QR codes at strip level and unique foil codes at tablet level — ensures
            every single tablet can be authenticated, even when strips are cut and sold individually.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { icon: Target, title: "Our Mission", desc: "To protect every patient in India by ensuring every medicine they consume is authentic and safe." },
            { icon: Eye, title: "Our Vision", desc: "A world where no one ever has to worry about the authenticity of their medicines." },
            { icon: Shield, title: "Our Technology", desc: "Patented dual-layer verification with cryptographic signatures and AI-powered packaging analysis." },
            { icon: Users, title: "Our Reach", desc: "1,247 manufacturers, 45,832 pharmacies, and millions of consumers trust MedSecure daily." },
            { icon: Globe, title: "National Network", desc: "Covering 28 states and 8 union territories with region-locked supply chain tracking." },
            { icon: Award, title: "Recognition", desc: "Recognized by NITI Aayog, CDSCO, and WHO as a pioneering pharmaceutical safety platform." },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="bg-card rounded-xl p-6 shadow-card border border-border"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
