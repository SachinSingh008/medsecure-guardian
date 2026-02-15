import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Shield, Factory, Store, QrCode, AlertTriangle, Users,
  Lock, Download, Bell, MapPin, Eye, Search, Ban, CheckCircle2, FileText, Key, Activity, LogOut
} from "lucide-react";

export default function CentralAdminPage() {
  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [manufacturers, setManufacturers] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [codes, setCodes] = useState<any[]>([]);
  const [scanLogs, setScanLogs] = useState<any[]>([]);
  const [codeSearch, setCodeSearch] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    if (user) loadAll();
  }, [user]);

  const loadAll = async () => {
    const [mfgRes, medRes, codeRes, logRes] = await Promise.all([
      supabase.from("manufacturers").select("*").order("created_at", { ascending: false }),
      supabase.from("medicines").select("*").order("created_at", { ascending: false }),
      supabase.from("medicine_codes").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("scan_logs").select("*").order("scanned_at", { ascending: false }).limit(50),
    ]);
    setManufacturers(mfgRes.data || []);
    setMedicines(medRes.data || []);
    setCodes(codeRes.data || []);
    setScanLogs(logRes.data || []);
  };

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (authMode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast({ title: "Admin account created!" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const searchCode = async () => {
    if (!codeSearch.trim()) return;
    const { data } = await supabase.from("medicine_codes").select("*").eq("code", codeSearch.trim()).maybeSingle();
    if (data) {
      const { data: med } = await supabase.from("medicines").select("*").eq("id", (data as any).medicine_id).single();
      setSearchResult({ code: data, medicine: med });
    } else {
      setSearchResult(null);
      toast({ title: "Code not found", variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center pt-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-8 shadow-elevated border border-border w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-xl bg-hero-gradient flex items-center justify-center mx-auto mb-4 shadow-elevated">
              <Shield className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Central Admin Portal</h1>
            <p className="text-sm text-muted-foreground mt-1">MedSecure Authority Dashboard</p>
          </div>
          <div className="space-y-4">
            <Input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-12" />
            <Input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="h-12" />
            <Button variant="navy" className="w-full h-12" onClick={handleAuth} disabled={loading}>
              <Lock className="w-4 h-4 mr-2" /> {loading ? "Please wait..." : authMode === "login" ? "Secure Login" : "Sign Up"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {authMode === "login" ? "No account? " : "Already have one? "}
              <button className="text-secondary underline" onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}>
                {authMode === "login" ? "Sign Up" : "Login"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  const totalCodes = codes.length;
  const activeMeds = medicines.filter(m => m.status === "Active").length;
  const expiredMeds = medicines.filter(m => m.status === "Expired").length;
  const recalledMeds = medicines.filter(m => m.status === "Recalled").length;

  return (
    <div className="min-h-screen bg-muted pt-16">
      <div className="bg-hero-gradient py-8">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary-foreground">Central Admin Dashboard</h1>
            <p className="text-primary-foreground/60 text-sm">MedSecure Authority Portal — National Overview</p>
          </div>
          <div className="flex gap-2">
            <Button variant="hero" size="sm" onClick={loadAll}><Activity className="w-4 h-4 mr-1" /> Refresh</Button>
            <Button variant="hero-outline" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4 mr-1" /> Logout</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Manufacturers", value: manufacturers.length, icon: Factory },
            { label: "Total Medicines", value: medicines.length, icon: QrCode },
            { label: "Active Batches", value: activeMeds, icon: CheckCircle2 },
            { label: "Total Codes", value: totalCodes, icon: Key },
            { label: "Total Scans", value: scanLogs.length, icon: Search },
            { label: "Expired", value: expiredMeds, icon: AlertTriangle },
            { label: "Recalled", value: recalledMeds, icon: Ban },
            { label: "Scan Logs", value: scanLogs.length, icon: Activity },
          ].map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-card rounded-xl p-5 shadow-card border border-border">
              <card.icon className="w-5 h-5 text-secondary mb-2" />
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="manufacturers" className="space-y-6">
          <TabsList className="bg-card border border-border flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="manufacturers">Manufacturers</TabsTrigger>
            <TabsTrigger value="medicines">Medicines & Batches</TabsTrigger>
            <TabsTrigger value="codes">Code Database</TabsTrigger>
            <TabsTrigger value="scans">Scan Logs</TabsTrigger>
          </TabsList>

          {/* Manufacturers */}
          <TabsContent value="manufacturers">
            <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-bold text-foreground">Registered Manufacturers</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-muted">
                    {["Company", "License", "Address", "Registered"].map(h => (
                      <th key={h} className="text-left p-3 font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {manufacturers.length === 0 && (
                      <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No manufacturers registered yet.</td></tr>
                    )}
                    {manufacturers.map((m: any) => (
                      <tr key={m.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-3 font-medium text-foreground">{m.company_name}</td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">{m.license_number}</td>
                        <td className="p-3 text-muted-foreground">{m.factory_address || "-"}</td>
                        <td className="p-3 text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Medicines */}
          <TabsContent value="medicines">
            <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-bold text-foreground">All Medicines & Batches</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-muted">
                    {["Medicine", "Batch #", "MFG", "EXP", "Qty", "Region", "Distributor", "Status"].map(h => (
                      <th key={h} className="text-left p-3 font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {medicines.length === 0 && (
                      <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No medicines yet.</td></tr>
                    )}
                    {medicines.map((m: any) => (
                      <tr key={m.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-3 font-medium text-foreground">{m.medicine_name}</td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">{m.batch_number}</td>
                        <td className="p-3 text-muted-foreground">{m.mfg_date}</td>
                        <td className="p-3 text-muted-foreground">{m.exp_date}</td>
                        <td className="p-3 text-foreground">{m.quantity}</td>
                        <td className="p-3 text-muted-foreground">{m.region_allocation || "-"}</td>
                        <td className="p-3 text-muted-foreground">{m.distributor_assigned || "-"}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            m.status === "Active" ? "bg-success/10 text-success" :
                            m.status === "Expired" ? "bg-warning/10 text-warning" :
                            "bg-destructive/10 text-destructive"
                          }`}>{m.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Code Database */}
          <TabsContent value="codes">
            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
              <h3 className="font-bold text-foreground mb-4">Code Database Search</h3>
              <div className="flex gap-3 mb-6">
                <Input placeholder="Enter exact code (e.g. QR-A1B2C3D4E5F6)" value={codeSearch} onChange={e => setCodeSearch(e.target.value)} className="h-10 max-w-md" />
                <Button variant="hero" size="sm" onClick={searchCode}><Search className="w-4 h-4 mr-1" /> Search</Button>
              </div>
              {searchResult && (
                <div className="p-4 rounded-lg bg-muted space-y-2">
                  <p className="text-sm"><strong>Code:</strong> {searchResult.code.code}</p>
                  <p className="text-sm"><strong>Type:</strong> {searchResult.code.code_type}</p>
                  <p className="text-sm"><strong>Status:</strong> {searchResult.code.status}</p>
                  <p className="text-sm"><strong>Medicine:</strong> {searchResult.medicine?.medicine_name || "Unknown"}</p>
                  <p className="text-sm"><strong>Batch:</strong> {searchResult.medicine?.batch_number || "N/A"}</p>
                </div>
              )}
              <h4 className="font-bold text-foreground mt-6 mb-3">Recent Codes</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-muted">
                    {["Code", "Type", "Status", "Created"].map(h => (
                      <th key={h} className="text-left p-3 font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {codes.map((c: any) => (
                      <tr key={c.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-3 font-mono text-xs text-foreground">{c.code}</td>
                        <td className="p-3 text-muted-foreground">{c.code_type}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            c.status === "Unused" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                          }`}>{c.status}</span>
                        </td>
                        <td className="p-3 text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Scan Logs */}
          <TabsContent value="scans">
            <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-bold text-foreground">Recent Scan Logs</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-muted">
                    {["Scan ID", "Code ID", "Location", "Result", "Time"].map(h => (
                      <th key={h} className="text-left p-3 font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {scanLogs.length === 0 && (
                      <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No scans yet.</td></tr>
                    )}
                    {scanLogs.map((log: any) => (
                      <tr key={log.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-3 font-mono text-xs text-muted-foreground">{log.id.slice(0, 8)}...</td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">{log.code_id.slice(0, 8)}...</td>
                        <td className="p-3 text-foreground">{log.scan_location || "-"}</td>
                        <td className="p-3 text-foreground">{log.result}</td>
                        <td className="p-3 text-muted-foreground">{new Date(log.scanned_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
