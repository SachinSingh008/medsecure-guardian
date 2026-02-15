import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Factory, Package, QrCode, AlertTriangle, BarChart3, User, Shield,
  Plus, Download, Eye, Edit, Bell, Lock, TrendingUp, LogOut, Copy
} from "lucide-react";

type AuthMode = "login" | "signup";

interface ManufacturerProfile {
  id: string;
  company_name: string;
  license_number: string;
  factory_address: string | null;
}

interface Medicine {
  id: string;
  medicine_name: string;
  batch_number: string;
  composition: string | null;
  mfg_date: string;
  exp_date: string;
  quantity: number;
  factory_location: string | null;
  region_allocation: string | null;
  distributor_assigned: string | null;
  packaging_type: string | null;
  status: string;
  created_at: string;
}

interface MedicineCode {
  id: string;
  code: string;
  code_type: string;
  status: string;
  medicine_id: string;
}

export default function ManufacturerPortalPage() {
  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [factoryAddress, setFactoryAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState<ManufacturerProfile | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [generatedCodes, setGeneratedCodes] = useState<MedicineCode[]>([]);
  const [selectedMedicineId, setSelectedMedicineId] = useState<string | null>(null);

  // Batch form
  const [batchForm, setBatchForm] = useState({
    medicine_name: "", composition: "", batch_number: "", mfg_date: "", exp_date: "",
    factory_location: "", quantity: "10", packaging_type: "Strip", region_allocation: "",
    distributor_assigned: "", code_type: "QR", notes: "",
  });

  useEffect(() => {
    const checkAuthAndInit = async () => {
      // IMPORTANT: Check if admin is logged in (localStorage)
      const adminLoggedIn = localStorage.getItem('medsecure_admin_logged_in');
      if (adminLoggedIn === 'true') {
        // Admin trying to access manufacturer portal - block them
        localStorage.removeItem('medsecure_admin_logged_in');
        // Also sign out any Supabase session
        await supabase.auth.signOut();
        toast({
          title: "Access Denied",
          description: "This is the Manufacturer Portal. Admin access is through /admin with Admin credentials.",
          variant: "destructive",
          duration: 7000
        });
        return; // Show login screen
      }

      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    checkAuthAndInit();
  }, []);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadMedicines();
    }
  }, [user]);

  const loadProfile = async () => {
    const { data } = await supabase.from("manufacturers").select("*").eq("user_id", user.id).maybeSingle();

    // Check approval status IMMEDIATELY - sign out if not approved
    const profileStatus = (data as any)?.status;

    if (profileStatus === 'pending') {
      // Sign them out immediately
      await supabase.auth.signOut();
      setUser(null);
      toast({
        title: "Account Pending Approval",
        description: "Your account is awaiting approval from Central Admin. You will receive an email once approved.",
        variant: "destructive",
        duration: 8000
      });
      return; // Don't set profile
    }

    if (profileStatus === 'rejected') {
      // Sign them out immediately
      await supabase.auth.signOut();
      setUser(null);
      toast({
        title: "Account Rejected",
        description: "Your manufacturer account was rejected. Please contact support for more information.",
        variant: "destructive",
        duration: 8000
      });
      return; // Don't set profile
    }

    // Only set profile if status is 'approved'
    setProfile(data as ManufacturerProfile | null);
  };

  const loadMedicines = async () => {
    const { data: profData } = await supabase.from("manufacturers").select("id").eq("user_id", user.id).maybeSingle();
    if (!profData) return;
    const { data } = await supabase.from("medicines").select("*").eq("manufacturer_id", (profData as any).id).order("created_at", { ascending: false });
    setMedicines((data as Medicine[]) || []);
  };

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (authMode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // Create manufacturer profile with PENDING status
        const { data: { user: newUser } } = await supabase.auth.getUser();
        if (newUser) {
          const { error: profileError } = await supabase.from("manufacturers").insert({
            user_id: newUser.id,
            company_name: companyName,
            license_number: licenseNumber,
            factory_address: factoryAddress,
            status: "pending"  // PENDING by default, admin must approve
          } as any);
          if (profileError) throw profileError;
        }

        // IMPORTANT: Sign them out immediately since they're pending
        await supabase.auth.signOut();
        setUser(null);

        toast({
          title: "Account Created!",
          description: "Your account is pending approval from Central Admin. You will be notified once approved.",
          duration: 7000
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Welcome back!" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatch = async () => {
    if (!profile) return;

    // Check approval status
    const profileStatus = (profile as any).status;
    if (profileStatus === 'pending') {
      toast({
        title: "Account Pending Approval",
        description: "Your account must be approved by Central Admin before you can create batches.",
        variant: "destructive"
      });
      return;
    }
    if (profileStatus === 'rejected') {
      toast({
        title: "Account Rejected",
        description: "Your account was rejected. Please contact support.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.from("medicines").insert({
        manufacturer_id: profile.id,
        medicine_name: batchForm.medicine_name,
        composition: batchForm.composition || null,
        batch_number: batchForm.batch_number,
        mfg_date: batchForm.mfg_date,
        exp_date: batchForm.exp_date,
        factory_location: batchForm.factory_location || null,
        quantity: parseInt(batchForm.quantity) || 10,
        packaging_type: batchForm.packaging_type,
        region_allocation: batchForm.region_allocation || null,
        distributor_assigned: batchForm.distributor_assigned || null,
      } as any).select().single();
      if (error) throw error;

      // Generate codes via database function
      const qty = parseInt(batchForm.quantity) || 10;
      const { error: codeError } = await supabase.rpc("generate_medicine_codes", {
        p_medicine_id: (data as any).id,
        p_quantity: qty,
        p_code_type: batchForm.code_type,
      } as any);
      if (codeError) throw codeError;

      // Load generated codes
      const { data: codes } = await supabase.from("medicine_codes").select("*").eq("medicine_id", (data as any).id);
      setGeneratedCodes((codes as MedicineCode[]) || []);
      setSelectedMedicineId((data as any).id);

      toast({ title: "Batch created!", description: `${qty} ${batchForm.code_type} codes generated.` });
      loadMedicines();
      setBatchForm({
        medicine_name: "", composition: "", batch_number: "", mfg_date: "", exp_date: "",
        factory_location: "", quantity: "10", packaging_type: "Strip", region_allocation: "",
        distributor_assigned: "", code_type: "QR", notes: "",
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const viewCodes = async (medicineId: string) => {
    const { data } = await supabase.from("medicine_codes").select("*").eq("medicine_id", medicineId);
    setGeneratedCodes((data as MedicineCode[]) || []);
    setSelectedMedicineId(medicineId);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied!", description: code });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setMedicines([]);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center pt-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-8 shadow-elevated border border-border w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-xl bg-teal-gradient flex items-center justify-center mx-auto mb-4 shadow-glow-teal">
              <Factory className="w-7 h-7 text-secondary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Manufacturer Portal</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {authMode === "login" ? "Login to manage your batches" : "Create your manufacturer account"}
            </p>
          </div>
          <div className="space-y-4">
            {authMode === "signup" && (
              <>
                <Input placeholder="Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} className="h-12" />
                <Input placeholder="License Number" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} className="h-12" />
                <Input placeholder="Factory Address" value={factoryAddress} onChange={e => setFactoryAddress(e.target.value)} className="h-12" />
              </>
            )}
            <Input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-12" />
            <Input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="h-12" />
            <Button variant="hero" className="w-full h-12" onClick={handleAuth} disabled={loading}>
              <Lock className="w-4 h-4 mr-2" /> {loading ? "Please wait..." : authMode === "login" ? "Login" : "Sign Up"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {authMode === "login" ? "No account? " : "Already have an account? "}
              <button className="text-secondary underline" onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}>
                {authMode === "login" ? "Sign Up" : "Login"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted pt-16">
      <div className="bg-hero-gradient py-8">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary-foreground">Manufacturer Dashboard</h1>
            <p className="text-primary-foreground/60 text-sm">
              {profile?.company_name ?? "Loading..."} — License: {profile?.license_number ?? "..."}
            </p>
          </div>
          <Button variant="hero-outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Medicines", value: medicines.length, icon: Package },
            { label: "Active Batches", value: medicines.filter(m => m.status === "Active").length, icon: Factory },
            { label: "Expired", value: medicines.filter(m => m.status === "Expired").length, icon: AlertTriangle },
            { label: "Recalled", value: medicines.filter(m => m.status === "Recalled").length, icon: Bell },
          ].map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl p-5 shadow-card border border-border">
              <card.icon className="w-5 h-5 text-secondary mb-2" />
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="batches" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="batches">Batch Management</TabsTrigger>
            <TabsTrigger value="create">Create Batch</TabsTrigger>
            <TabsTrigger value="codes">Generated Codes</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Batch Management */}
          <TabsContent value="batches">
            <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-bold text-foreground">Batch Records</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-muted">
                    {["Medicine", "Batch #", "MFG", "EXP", "Qty", "Region", "Distributor", "Status", "Codes"].map(h => (
                      <th key={h} className="text-left p-3 font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {medicines.length === 0 && (
                      <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">No batches yet. Create your first batch!</td></tr>
                    )}
                    {medicines.map((m) => (
                      <tr key={m.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-3 font-medium text-foreground">{m.medicine_name}</td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">{m.batch_number}</td>
                        <td className="p-3 text-muted-foreground">{m.mfg_date}</td>
                        <td className="p-3 text-muted-foreground">{m.exp_date}</td>
                        <td className="p-3 text-foreground">{m.quantity}</td>
                        <td className="p-3 text-muted-foreground">{m.region_allocation || "-"}</td>
                        <td className="p-3 text-muted-foreground">{m.distributor_assigned || "-"}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${m.status === "Active" ? "bg-success/10 text-success" :
                            m.status === "Expired" ? "bg-warning/10 text-warning" :
                              "bg-destructive/10 text-destructive"
                            }`}>{m.status}</span>
                        </td>
                        <td className="p-3">
                          <button onClick={() => viewCodes(m.id)} className="p-1.5 rounded hover:bg-muted">
                            <Eye className="w-4 h-4 text-secondary" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Create Batch */}
          <TabsContent value="create">
            <div className="bg-card rounded-xl p-6 shadow-card border border-border max-w-3xl">
              <h3 className="text-lg font-bold text-foreground mb-6">Create New Batch & Generate Codes</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Medicine Name *</label>
                  <Input value={batchForm.medicine_name} onChange={e => setBatchForm(f => ({ ...f, medicine_name: e.target.value }))} className="h-11" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Composition / Salt</label>
                  <Input value={batchForm.composition} onChange={e => setBatchForm(f => ({ ...f, composition: e.target.value }))} className="h-11" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Batch Number *</label>
                  <Input value={batchForm.batch_number} onChange={e => setBatchForm(f => ({ ...f, batch_number: e.target.value }))} className="h-11" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Manufacturing Date *</label>
                  <Input type="date" value={batchForm.mfg_date} onChange={e => setBatchForm(f => ({ ...f, mfg_date: e.target.value }))} className="h-11" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Expiry Date *</label>
                  <Input type="date" value={batchForm.exp_date} onChange={e => setBatchForm(f => ({ ...f, exp_date: e.target.value }))} className="h-11" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Factory Location</label>
                  <Input value={batchForm.factory_location} onChange={e => setBatchForm(f => ({ ...f, factory_location: e.target.value }))} className="h-11" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Quantity (# of codes) *</label>
                  <Input type="number" value={batchForm.quantity} onChange={e => setBatchForm(f => ({ ...f, quantity: e.target.value }))} className="h-11" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Code Type</label>
                  <select className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm"
                    value={batchForm.code_type} onChange={e => setBatchForm(f => ({ ...f, code_type: e.target.value }))}>
                    <option value="QR">QR Code</option>
                    <option value="Foil">Foil Code</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Region Allocation</label>
                  <Input value={batchForm.region_allocation} onChange={e => setBatchForm(f => ({ ...f, region_allocation: e.target.value }))} className="h-11" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Distributor</label>
                  <Input value={batchForm.distributor_assigned} onChange={e => setBatchForm(f => ({ ...f, distributor_assigned: e.target.value }))} className="h-11" />
                </div>
              </div>
              <Button variant="hero" className="mt-6" onClick={handleCreateBatch} disabled={loading || !batchForm.medicine_name || !batchForm.batch_number || !batchForm.mfg_date || !batchForm.exp_date}>
                <QrCode className="w-4 h-4 mr-2" /> {loading ? "Generating..." : "Create Batch & Generate Codes"}
              </Button>
            </div>
          </TabsContent>

          {/* Generated Codes */}
          <TabsContent value="codes">
            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
              <h3 className="font-bold text-foreground mb-4">Generated Verification Codes</h3>
              {generatedCodes.length === 0 ? (
                <p className="text-muted-foreground text-sm">Select a batch from Batch Management or create a new batch to see codes.</p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-4">{generatedCodes.length} codes generated. Share these codes with your packaging team.</p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                    {generatedCodes.map(c => (
                      <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                        <div>
                          <p className="font-mono text-sm text-foreground">{c.code}</p>
                          <p className="text-xs text-muted-foreground">{c.code_type} • {c.status}</p>
                        </div>
                        <button onClick={() => copyCode(c.code)} className="p-1.5 rounded hover:bg-background">
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* Profile */}
          <TabsContent value="profile">
            <div className="bg-card rounded-xl p-6 shadow-card border border-border max-w-2xl">
              <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-secondary" /> Manufacturer Profile
              </h3>
              {profile && (
                <div className="space-y-3">
                  {[
                    ["Company Name", profile.company_name],
                    ["License Number", profile.license_number],
                    ["Factory Address", profile.factory_address || "Not set"],
                    ["Email", user?.email || ""],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between p-3 rounded-lg bg-muted">
                      <span className="text-sm text-muted-foreground">{k}</span>
                      <span className="text-sm font-medium text-foreground">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
