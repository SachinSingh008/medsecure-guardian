import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  QrCode, Tablet, CheckCircle2, AlertTriangle, XCircle, Clock,
  MapPin, History, Gift, Factory, Truck, Store, User, Search, Camera
} from "lucide-react";

type VerifyStatus = "idle" | "genuine" | "suspicious" | "expired" | "recalled";

const mockMedicine = {
  name: "Paracetamol 500mg",
  manufacturer: "Sun Pharmaceuticals",
  licenseId: "MFG/MH/2024/0847",
  batchNumber: "SP-PCM-2025-0412",
  mfgDate: "2025-01-15",
  expDate: "2027-01-15",
  factoryLocation: "Silvassa, Gujarat",
  qualityCert: "GMP Certified, WHO Prequalified",
  tabletCount: "10 tablets / strip",
  codeType: "QR Code",
  codeStatus: "Unused",
};

const timeline = [
  { icon: Factory, label: "Manufactured", location: "Silvassa, Gujarat", date: "Jan 15, 2025" },
  { icon: Truck, label: "Shipped to Distributor", location: "MedDistrib Pvt Ltd, Mumbai", date: "Jan 20, 2025" },
  { icon: Store, label: "Delivered to Pharmacy", location: "LifeCare Pharmacy, Pune", date: "Jan 25, 2025" },
  { icon: User, label: "Customer Scan", location: "Pune, Maharashtra", date: "Feb 10, 2026" },
];

const statusConfig: Record<string, { icon: any; label: string; color: string; bg: string }> = {
  genuine: { icon: CheckCircle2, label: "✅ Authentic Medicine Verified", color: "text-success", bg: "bg-success/10 border-success/30" },
  suspicious: { icon: XCircle, label: "🚨 Warning: Duplicate / Fake Medicine Suspected", color: "text-destructive", bg: "bg-destructive/10 border-destructive/30" },
  expired: { icon: AlertTriangle, label: "⚠️ Expired Medicine", color: "text-warning", bg: "bg-warning/10 border-warning/30" },
  recalled: { icon: XCircle, label: "🚨 Recalled Batch – Do Not Consume", color: "text-destructive", bg: "bg-destructive/10 border-destructive/30" },
};

export default function VerifyMedicinePage() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<VerifyStatus>("idle");

  const handleVerify = () => {
    if (!code.trim()) return;
    const lower = code.toLowerCase();
    if (lower.includes("fake")) setStatus("suspicious");
    else if (lower.includes("exp")) setStatus("expired");
    else if (lower.includes("recall")) setStatus("recalled");
    else setStatus("genuine");
  };

  const result = status !== "idle" ? statusConfig[status] : null;

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <section className="bg-hero-gradient py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-primary-foreground mb-3"
          >
            Medicine Verification Portal
          </motion.h1>
          <p className="text-primary-foreground/60 max-w-2xl mx-auto">
            Enter or scan your medicine code to verify authenticity instantly.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-8 pb-20">
        {/* Scan / Enter Code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card rounded-xl p-8 shadow-elevated border border-border max-w-2xl mx-auto mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Enter QR Code / Tablet Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 h-12"
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            />
            <Button variant="hero" className="h-12" onClick={handleVerify}>
              <Search className="w-4 h-4 mr-2" /> Verify Now
            </Button>
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" size="sm" onClick={() => { setCode("QR-SP-PCM-2025-0412"); }}>
              <Camera className="w-4 h-4 mr-1" /> Scan QR
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setCode("FOIL-TAB-7832"); }}>
              <Tablet className="w-4 h-4 mr-1" /> Scan Foil Code
            </Button>
          </div>
        </motion.div>

        {status !== "idle" && result && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Verification Result */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className={`rounded-xl p-8 border-2 ${result.bg} text-center`}
            >
              <result.icon className={`w-16 h-16 mx-auto mb-4 ${result.color}`} />
              <h2 className={`text-2xl font-bold ${result.color}`}>{result.label}</h2>
            </motion.div>

            {/* Medicine Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-card rounded-xl p-6 shadow-card border border-border"
            >
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-secondary" /> Medicine Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {Object.entries(mockMedicine).map(([key, val]) => (
                  <div key={key} className="flex justify-between p-3 rounded-lg bg-muted">
                    <span className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                    <span className="text-sm font-medium text-foreground">{val}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Supply Chain Timeline */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-card rounded-xl p-6 shadow-card border border-border"
            >
              <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5 text-secondary" /> Supply Chain History
              </h3>
              <div className="space-y-0">
                {timeline.map((step, i) => (
                  <div key={step.label} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center">
                        <step.icon className="w-5 h-5 text-secondary" />
                      </div>
                      {i < timeline.length - 1 && <div className="w-0.5 h-12 bg-secondary/20" />}
                    </div>
                    <div className="pb-8">
                      <p className="font-semibold text-foreground text-sm">{step.label}</p>
                      <p className="text-sm text-muted-foreground">{step.location}</p>
                      <p className="text-xs text-muted-foreground">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Region Locking */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-card rounded-xl p-6 shadow-card border border-border"
            >
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-secondary" /> Region Verification
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground">Assigned Region</p>
                  <p className="font-semibold text-foreground">Mumbai, Maharashtra</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground">Scan Region</p>
                  <p className="font-semibold text-foreground">Pune, Maharashtra</p>
                </div>
                <div className="p-4 rounded-lg bg-success/10 border border-success/30">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-semibold text-success">✅ Verified</p>
                </div>
              </div>
            </motion.div>

            {/* Scan History */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="bg-card rounded-xl p-6 shadow-card border border-border"
            >
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-secondary" /> Scan History
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {[
                  { label: "Total Scans", value: "1" },
                  { label: "First Scan", value: "Feb 10, 2026" },
                  { label: "Last Scan", value: "Feb 10, 2026" },
                  { label: "Last City", value: "Pune" },
                  { label: "Duplicates", value: "0" },
                ].map((s) => (
                  <div key={s.label} className="p-3 rounded-lg bg-muted text-center">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="font-bold text-foreground text-lg">{s.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Rewards */}
            {status === "genuine" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="bg-teal-gradient rounded-xl p-6 shadow-glow-teal text-center"
              >
                <Gift className="w-10 h-10 mx-auto mb-3 text-secondary-foreground" />
                <h3 className="text-xl font-bold text-secondary-foreground mb-2">
                  🎁 You earned 10 MedPoints!
                </h3>
                <p className="text-secondary-foreground/80 mb-4 text-sm">
                  Thank you for verifying your medicine. Redeem points for health benefits.
                </p>
                <Button variant="navy" size="sm">Redeem Points</Button>
              </motion.div>
            )}
          </div>
        )}

        {/* Footer CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground italic">
            "Help India fight counterfeit medicines – always scan before consumption."
          </p>
        </div>
      </div>
    </div>
  );
}
