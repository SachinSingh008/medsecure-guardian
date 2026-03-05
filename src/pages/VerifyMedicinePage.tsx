import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scanner } from "@yudiel/react-qr-scanner";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  QrCode, Tablet, CheckCircle2, AlertTriangle, XCircle,
  MapPin, History, Gift, Factory, Truck, Store, User, Search, Camera, Loader2, Shield
} from "lucide-react";

type VerifyStatus = "idle" | "genuine" | "suspicious" | "expired" | "recalled" | "not_found";

interface MedicineResult {
  code: any;
  medicine: any;
  manufacturer: any;
  scanCount: number;
}

const statusConfig: Record<string, { icon: any; label: string; color: string; bg: string }> = {
  genuine: { icon: CheckCircle2, label: "✅ Authentic Medicine Verified", color: "text-success", bg: "bg-success/10 border-success/30" },
  suspicious: { icon: XCircle, label: "🚨 Warning: Duplicate / Already Scanned", color: "text-destructive", bg: "bg-destructive/10 border-destructive/30" },
  expired: { icon: AlertTriangle, label: "⚠️ Expired Medicine", color: "text-warning", bg: "bg-warning/10 border-warning/30" },
  recalled: { icon: XCircle, label: "🚨 Recalled Batch – Do Not Consume", color: "text-destructive", bg: "bg-destructive/10 border-destructive/30" },
  not_found: { icon: XCircle, label: "❌ Code Not Found – Possible Counterfeit", color: "text-destructive", bg: "bg-destructive/10 border-destructive/30" },
};

export default function VerifyMedicinePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<VerifyStatus>("idle");
  const [result, setResult] = useState<MedicineResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleVerify = useCallback(async (codeValue?: string) => {
    const codeToVerify = codeValue || code;
    if (!codeToVerify.trim()) return;

    // Hide confirmation screen if it was open
    setShowConfirmation(false);

    setLoading(true);
    setStatus("idle");
    setResult(null);

    try {
      // Look up the code
      const { data: codeData, error } = await supabase
        .from("medicine_codes")
        .select("*")
        .eq("code", codeToVerify.trim())
        .maybeSingle();

      if (error) throw error;

      if (!codeData) {
        setStatus("not_found");
        setLoading(false);
        return;
      }

      // Get medicine
      const { data: medicine } = await supabase
        .from("medicines")
        .select("*")
        .eq("id", (codeData as any).medicine_id)
        .single();

      // Get manufacturer
      let manufacturer = null;
      if (medicine) {
        const { data: mfg } = await supabase
          .from("manufacturers")
          .select("*")
          .eq("id", (medicine as any).manufacturer_id)
          .single();
        manufacturer = mfg;
      }

      // Count scans for this code
      const { count } = await supabase
        .from("scan_logs")
        .select("*", { count: "exact", head: true })
        .eq("code_id", (codeData as any).id);

      // Log the scan
      await supabase.from("scan_logs").insert({
        code_id: (codeData as any).id,
        scan_location: "Web Portal",
        result: "scanned",
      } as any);

      const scanCount = (count || 0) + 1;

      // Determine status
      const medStatus = (medicine as any)?.status;
      let finalCodeStatus = (codeData as any).status;

      if (medStatus === "Recalled") {
        setStatus("recalled");
      } else if (finalCodeStatus === "Sold" || scanCount > 1) {
        // Mark as suspicious if already scanned
        setStatus("suspicious");
      } else if (medicine && new Date((medicine as any).exp_date) < new Date()) {
        setStatus("expired");
      } else {
        setStatus("genuine");
        // Mark code as Sold
        await supabase.from("medicine_codes").update({ status: "Sold", scanned_at: new Date().toISOString() } as any).eq("id", (codeData as any).id);
        finalCodeStatus = "Sold"; // Update local status for display
      }

      // Set result with UPDATED status
      setResult({
        code: { ...codeData, status: finalCodeStatus },
        medicine,
        manufacturer,
        scanCount
      });

    } catch (err: any) {
      console.error(err);
      setStatus("not_found");
    } finally {
      setLoading(false);
    }
  }, [code]);

  // Check for code in URL on mount
  useEffect(() => {
    const codeParam = searchParams.get("code");
    if (codeParam && !code) {
      setCode(codeParam);
      // Instead of auto-verifying, show the confirmation screen
      setShowConfirmation(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRedeem = () => {
    toast({
      title: "Points Redeemed!",
      description: "10 MedPoints have been added to your wallet.",
      duration: 5000,
    });
  };

  const statusInfo = status !== "idle" ? statusConfig[status] : null;

  return (
    <div className="min-h-screen bg-muted">
      <section className="bg-hero-gradient py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-primary-foreground mb-3">
            Medicine Verification Portal
          </motion.h1>
          <p className="text-primary-foreground/60 max-w-2xl mx-auto">
            Enter or scan your medicine code to verify authenticity instantly.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-8 pb-20">
        {/* Input */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card rounded-xl p-4 sm:p-8 shadow-elevated border border-border max-w-2xl mx-auto mb-8">
          <Tabs defaultValue="enter" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="enter" className="text-sm sm:text-base"><Tablet className="w-4 h-4 mr-2" /> Enter Code</TabsTrigger>
              <TabsTrigger value="scan" className="text-sm sm:text-base"><QrCode className="w-4 h-4 mr-2" /> Scan QR</TabsTrigger>
            </TabsList>

            <TabsContent value="enter" className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input placeholder="Enter QR Code / Tablet Code (e.g. QR-A1B2C3D4E5F6)"
                  value={code} onChange={(e) => setCode(e.target.value)}
                  className="flex-1 h-12" onKeyDown={(e) => e.key === "Enter" && handleVerify()} />
                <Button variant="hero" className="h-12 w-full sm:w-auto" onClick={() => handleVerify()} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                  Verify Now
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="scan">
              <div className="w-full max-w-sm mx-auto overflow-hidden rounded-xl border-2 border-primary/20 bg-black aspect-square flex items-center justify-center">
                <Scanner
                  onScan={(result) => {
                    if (result && result.length > 0) {
                      const scannedCode = result[0].rawValue;
                      if (!scannedCode) return;
                      // Only trigger verify if we scanned a new code (wait for handleVerify state update or pass directly)
                      setCode(scannedCode);
                      handleVerify(scannedCode);
                    }
                  }}
                  components={{
                    audio: false,
                    zoom: false,
                    finder: true
                  }}
                  styles={{
                    container: { width: "100%", height: "100%" }
                  }}
                />
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4">Point your camera at the medicine's QR code</p>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Confirmation Screen */}
        {showConfirmation && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto bg-card rounded-xl p-8 border border-border text-center shadow-elevated mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-secondary"></div>
            <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Verification Required</h2>
            <p className="text-muted-foreground mb-6">
              You scanned the medicine code: <br />
              <span className="font-mono bg-muted px-2 py-1 rounded text-foreground font-medium mt-2 inline-block break-all">{code}</span>
            </p>
            <p className="text-sm text-foreground mb-6">Do you want to proceed with verifying this medication?</p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1" onClick={() => {
                setShowConfirmation(false);
                setCode("");
                // Remove param from URL without refreshing
                const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
                window.history.pushState({ path: newUrl }, '', newUrl);
              }}>
                Cancel
              </Button>
              <Button variant="hero" className="flex-1" onClick={() => handleVerify()} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                Verify Now
              </Button>
            </div>
          </motion.div>
        )}

        {!showConfirmation && status !== "idle" && statusInfo && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Status */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className={`rounded-xl p-8 border-2 ${statusInfo.bg} text-center`}>
              <statusInfo.icon className={`w-16 h-16 mx-auto mb-4 ${statusInfo.color}`} />
              <h2 className={`text-2xl font-bold ${statusInfo.color}`}>{statusInfo.label}</h2>
            </motion.div>

            {/* Medicine Info */}
            {result?.medicine && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-card rounded-xl p-6 shadow-card border border-border">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-secondary" /> Medicine Information
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    ["Medicine Name", result.medicine.medicine_name],
                    ["Manufacturer", result.manufacturer?.company_name || "Unknown"],
                    ["License ID", result.manufacturer?.license_number || "N/A"],
                    ["Batch Number", result.medicine.batch_number],
                    ["MFG Date", result.medicine.mfg_date],
                    ["EXP Date", result.medicine.exp_date],
                    ["Factory Location", result.medicine.factory_location || "N/A"],
                    ["Quantity", result.medicine.quantity],
                    ["Code", result.code.code],
                    ["Code Type", result.code.code_type],
                    ["Code Status", result.code.status],
                    ["Batch Status", result.medicine.status],
                  ].map(([key, val]) => (
                    <div key={key} className="flex justify-between p-3 rounded-lg bg-muted">
                      <span className="text-sm text-muted-foreground">{key}</span>
                      <span className="text-sm font-medium text-foreground">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Scan History */}
            {result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-card rounded-xl p-6 shadow-card border border-border">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-secondary" /> Scan History
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg bg-muted text-center">
                    <p className="text-xs text-muted-foreground">Total Scans</p>
                    <p className="font-bold text-foreground text-lg">{result.scanCount}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted text-center">
                    <p className="text-xs text-muted-foreground">Code Status</p>
                    <p className="font-bold text-foreground text-lg">{result.code.status}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted text-center">
                    <p className="text-xs text-muted-foreground">Region</p>
                    <p className="font-bold text-foreground text-lg">{result.medicine?.region_allocation || "N/A"}</p>
                  </div>
                </div>
                {result.scanCount > 1 && (
                  <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                    <p className="text-sm text-destructive font-medium">
                      ⚠️ This code has been scanned {result.scanCount} times. This may indicate a duplicate or counterfeit medicine.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Rewards */}
            {status === "genuine" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-teal-gradient rounded-xl p-6 shadow-glow-teal text-center">
                <Gift className="w-10 h-10 mx-auto mb-3 text-secondary-foreground" />
                <h3 className="text-xl font-bold text-secondary-foreground mb-2">🎁 You earned 10 MedPoints!</h3>
                <p className="text-secondary-foreground/80 mb-4 text-sm">
                  Thank you for verifying your medicine. Redeem points for health benefits.
                </p>
                <Button variant="navy" size="sm" onClick={handleRedeem}>Redeem Points</Button>
              </motion.div>
            )}
          </div>
        )}

        <div className="text-center mt-16">
          <p className="text-muted-foreground italic">
            "Help India fight counterfeit medicines – always scan before consumption."
          </p>
        </div>
      </div>
    </div>
  );
}
