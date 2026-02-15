import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Shield, Factory, QrCode, AlertTriangle, Users, Lock, Search,
  CheckCircle2, Key, Activity, LogOut, UserPlus, Trash2, X, Check, Clock
} from "lucide-react";

// Hardcoded admin credentials
const ADMIN_EMAIL = "Admin@gmail.com";
const ADMIN_PASSWORD = "Test@123";

export default function CentralAdminPage() {
  // Admin authentication state (local, NOT Supabase)
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Data state
  const [manufacturers, setManufacturers] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [codes, setCodes] = useState<any[]>([]);
  const [scanLogs, setScanLogs] = useState<any[]>([]);

  // User management state
  const [newUserForm, setNewUserForm] = useState({
    company_name: "", license_number: "", factory_address: "", email: "", password: ""
  });

  useEffect(() => {
    // IMPORTANT: Central Admin uses HARDCODED credentials only
    // If user has Supabase session, sign them out (they're a manufacturer)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Manufacturer is logged in - kick them out from admin
        supabase.auth.signOut();
        toast({
          title: "Access Denied",
          description: "Central Admin uses separate credentials. Manufacturer accounts cannot access this portal.",
          variant: "destructive"
        });
      }
    });

    // Check if admin was logged in before refresh
    const savedAdminState = localStorage.getItem('medsecure_admin_logged_in');
    if (savedAdminState === 'true') {
      setIsAdmin(true);
      loadAllAdminData();
    } else {
      loadPublicData();
    }
  }, []);

  const loadPublicData = async () => {
    // Load only approved manufacturers for public view
    const { data } = await supabase
      .from("manufacturers")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    setManufacturers(data || []);
  };

  const loadAllAdminData = async () => {
    // Load ALL data for admin view
    const [mfgRes, medRes, codeRes, logRes] = await Promise.all([
      supabase.from("manufacturers").select("*").order("created_at", { ascending: false }),
      supabase.from("medicines").select("*").order("created_at", { ascending: false }),
      supabase.from("medicine_codes").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("scan_logs").select("*").order("scanned_at", { ascending: false }).limit(100),
    ]);
    setManufacturers(mfgRes.data || []);
    setMedicines(medRes.data || []);
    setCodes(codeRes.data || []);
    setScanLogs(logRes.data || []);
  };

  const handleAdminLogin = async () => {
    if (loginEmail === ADMIN_EMAIL && loginPassword === ADMIN_PASSWORD) {
      // Sign out any existing Supabase session
      await supabase.auth.signOut();

      setIsAdmin(true);
      localStorage.setItem('medsecure_admin_logged_in', 'true');
      setShowLoginModal(false);
      setLoginEmail("");
      setLoginPassword("");
      toast({ title: "Admin Access Granted", description: "Welcome to the admin dashboard" });
      loadAllAdminData();
    } else {
      toast({ title: "Invalid Credentials", description: "Incorrect email or password", variant: "destructive" });
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('medsecure_admin_logged_in');
    toast({ title: "Logged Out", description: "Returned to public view" });
    loadPublicData();
  };

  const handleApproveUser = async (userId: string) => {
    const { error } = await supabase
      .from("manufacturers")
      .update({ status: "approved" } as any)
      .eq("id", userId);

    if (error) {
      console.error("Approve error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "User Approved", description: "Manufacturer account has been approved" });
      loadAllAdminData();
    }
  };

  const handleRejectUser = async (userId: string) => {
    const { error } = await supabase
      .from("manufacturers")
      .update({ status: "rejected" } as any)
      .eq("id", userId);

    if (error) {
      console.error("Reject error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "User Rejected", description: "Manufacturer request has been rejected" });
      loadAllAdminData();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This will also delete all their medicines and codes.")) return;

    const { error } = await supabase.from("manufacturers").delete().eq("id", userId);

    if (error) {
      console.error("Delete user error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "User Deleted" });
      loadAllAdminData();
    }
  };

  const handleCreateUser = async () => {
    if (!newUserForm.company_name || !newUserForm.license_number || !newUserForm.email || !newUserForm.password) {
      toast({ title: "Validation Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    try {
      // Create auth user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: newUserForm.email,
        password: newUserForm.password,
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered") || signUpError.message.includes("already exists")) {
          throw new Error(`Email ${newUserForm.email} is already registered. Please use a different email.`);
        }
        throw signUpError;
      }

      const newUser = signUpData.user;
      if (!newUser) throw new Error("User creation failed");

      // Create manufacturer profile as approved
      const { error: profileError } = await supabase.from("manufacturers").insert({
        user_id: newUser.id,
        company_name: newUserForm.company_name,
        license_number: newUserForm.license_number,
        factory_address: newUserForm.factory_address || null,
        status: "approved"
      } as any);

      if (profileError) throw profileError;

      toast({ title: "User Created Successfully!", description: `${newUserForm.company_name} can now login` });
      setNewUserForm({ company_name: "", license_number: "", factory_address: "", email: "", password: "" });
      loadAllAdminData();
    } catch (err: any) {
      console.error("Error creating user:", err);
      toast({ title: "Error Creating User", description: err.message, variant: "destructive" });
    }
  };

  // PUBLIC VIEW
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-muted pt-16">
        <div className="bg-hero-gradient py-8">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">Central Admin Portal</h1>
              <p className="text-primary-foreground/60 text-sm">MedSecure Authority - Registered Manufacturers</p>
            </div>
            <Button variant="hero" size="sm" onClick={() => setShowLoginModal(true)}>
              <img src="/shield-logo.png" alt="Admin" className="w-5 h-5 mr-2" /> Admin Login
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-bold text-foreground">Registered Manufacturers</h3>
              <p className="text-sm text-muted-foreground mt-1">Approved and verified pharmaceutical manufacturers</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted">
                  {["Company Name", "License Number", "Factory Address", "Registered Date"].map(h => (
                    <th key={h} className="text-left p-3 font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {manufacturers.length === 0 && (
                    <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No registered manufacturers yet.</td></tr>
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
        </div>

        {/* Admin Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-xl p-8 shadow-elevated border border-border w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Admin Login</h2>
                <button onClick={() => setShowLoginModal(false)} className="p-2 hover:bg-muted rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                  <Input
                    type="email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="h-11"
                    placeholder="Admin email"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
                  <Input
                    type="password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="h-11"
                    placeholder="Admin password"
                    onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
                  />
                </div>
                <Button variant="hero" className="w-full h-11" onClick={handleAdminLogin}>
                  <img src="/shield-logo.png" alt="Login" className="w-5 h-5 mr-2" /> Login
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  // ADMIN VIEW
  const pendingUsers = manufacturers.filter((m: any) => m.status === "pending");
  const approvedUsers = manufacturers.filter((m: any) => m.status === "approved");
  const rejectedUsers = manufacturers.filter((m: any) => m.status === "rejected");

  return (
    <div className="min-h-screen bg-muted pt-16">
      <div className="bg-hero-gradient py-8">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary-foreground">Central Admin Dashboard</h1>
            <p className="text-primary-foreground/60 text-sm">MedSecure Authority Portal — Full Access</p>
          </div>
          <div className="flex gap-2">
            <Button variant="hero" size="sm" onClick={loadAllAdminData}>
              <Activity className="w-4 h-4 mr-1" /> Refresh
            </Button>
            <Button variant="hero-outline" size="sm" onClick={handleAdminLogout}>
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Manufacturers", value: manufacturers.length, icon: Factory },
            { label: "Pending Requests", value: pendingUsers.length, icon: Clock, highlight: true },
            { label: "Total Medicines", value: medicines.length, icon: QrCode },
            { label: "Total Codes", value: codes.length, icon: Key },
          ].map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={`bg-card rounded-xl p-5 shadow-card border ${card.highlight && pendingUsers.length > 0 ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-border'}`}>
              <card.icon className={`w-5 h-5 mb-2 ${card.highlight && pendingUsers.length > 0 ? 'text-orange-500' : 'text-secondary'}`} />
              <p className={`text-2xl font-bold ${card.highlight && pendingUsers.length > 0 ? 'text-orange-500' : 'text-foreground'}`}>{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-card border border-border flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="users">
              Users {pendingUsers.length > 0 && <span className="ml-1.5 px-1.5 py-0.5 bg-orange-500 text-white text-xs rounded-full">{pendingUsers.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="manufacturers">Manufacturers</TabsTrigger>
            <TabsTrigger value="medicines">Medicines & Batches</TabsTrigger>
            <TabsTrigger value="codes">Code Database</TabsTrigger>
            <TabsTrigger value="scans">Scan Logs</TabsTrigger>
          </TabsList>

          {/* USERS TAB */}
          <TabsContent value="users" className="space-y-6">
            {/* Pending Requests */}
            <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
              <div className="p-4 border-b border-border bg-orange-50 dark:bg-orange-950/20">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  Pending Requests ({pendingUsers.length})
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Manufacturer signup requests awaiting approval</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-muted">
                    {["Company", "License", "Address", "Registered", "Actions"].map(h => (
                      <th key={h} className="text-left p-3 font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {pendingUsers.length === 0 && (
                      <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No pending requests</td></tr>
                    )}
                    {pendingUsers.map((m: any) => (
                      <tr key={m.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-3 font-medium text-foreground">{m.company_name}</td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">{m.license_number}</td>
                        <td className="p-3 text-muted-foreground">{m.factory_address || "-"}</td>
                        <td className="p-3 text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button onClick={() => handleApproveUser(m.id)} className="p-2 rounded-md bg-green-500 hover:bg-green-600 text-white" title="Approve">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleRejectUser(m.id)} className="p-2 rounded-md bg-red-500 hover:bg-red-600 text-white" title="Reject">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add User Manually */}
            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-secondary" />
                Add User Manually
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Company Name *</label>
                  <Input value={newUserForm.company_name} onChange={e => setNewUserForm(f => ({ ...f, company_name: e.target.value }))} className="h-10" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">License Number *</label>
                  <Input value={newUserForm.license_number} onChange={e => setNewUserForm(f => ({ ...f, license_number: e.target.value }))} className="h-10" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Factory Address</label>
                  <Input value={newUserForm.factory_address} onChange={e => setNewUserForm(f => ({ ...f, factory_address: e.target.value }))} className="h-10" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Email *</label>
                  <Input type="email" value={newUserForm.email} onChange={e => setNewUserForm(f => ({ ...f, email: e.target.value }))} className="h-10" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Password *</label>
                  <Input type="password" value={newUserForm.password} onChange={e => setNewUserForm(f => ({ ...f, password: e.target.value }))} className="h-10" />
                </div>
              </div>
              <Button variant="hero" onClick={handleCreateUser}>
                <UserPlus className="w-4 h-4 mr-2" /> Create User
              </Button>
            </div>

            {/* Approved Users */}
            <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-bold text-foreground">Approved Users ({approvedUsers.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-muted">
                    {["Company", "License", "Address", "Approved", "Actions"].map(h => (
                      <th key={h} className="text-left p-3 font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {approvedUsers.map((m: any) => (
                      <tr key={m.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-3 font-medium text-foreground">{m.company_name}</td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">{m.license_number}</td>
                        <td className="p-3 text-muted-foreground">{m.factory_address || "-"}</td>
                        <td className="p-3 text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</td>
                        <td className="p-3">
                          <button onClick={() => handleDeleteUser(m.id)} className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rejected Users */}
            {rejectedUsers.length > 0 && (
              <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="font-bold text-foreground">Rejected Users ({rejectedUsers.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border bg-muted">
                      {["Company", "License", "Rejected", "Actions"].map(h => (
                        <th key={h} className="text-left p-3 font-medium text-muted-foreground">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {rejectedUsers.map((m: any) => (
                        <tr key={m.id} className="border-b border-border hover:bg-muted/50">
                          <td className="p-3 font-medium text-muted-foreground">{m.company_name}</td>
                          <td className="p-3 font-mono text-xs text-muted-foreground">{m.license_number}</td>
                          <td className="p-3 text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</td>
                          <td className="p-3">
                            <button onClick={() => handleDeleteUser(m.id)} className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>

          {/* MANUFACTURERS TAB */}
          <TabsContent value="manufacturers">
            <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-bold text-foreground">All Manufacturers</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-muted">
                    {["Company", "License", "Address", "Status", "Registered"].map(h => (
                      <th key={h} className="text-left p-3 font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {manufacturers.map((m: any) => (
                      <tr key={m.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-3 font-medium text-foreground">{m.company_name}</td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">{m.license_number}</td>
                        <td className="p-3 text-muted-foreground">{m.factory_address || "-"}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${m.status === "approved" ? "bg-green-500/10 text-green-500" :
                            m.status === "pending" ? "bg-orange-500/10 text-orange-500" :
                              "bg-red-500/10 text-red-500"
                            }`}>{m.status}</span>
                        </td>
                        <td className="p-3 text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* MEDICINES TAB */}
          <TabsContent value="medicines">
            <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-bold text-foreground">All Medicines & Batches</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-muted">
                    {["Medicine", "Batch #", "MFG", "EXP", "Qty", "Status"].map(h => (
                      <th key={h} className="text-left p-3 font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {medicines.length === 0 && (
                      <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No medicines yet.</td></tr>
                    )}
                    {medicines.map((m: any) => (
                      <tr key={m.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-3 font-medium text-foreground">{m.medicine_name}</td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">{m.batch_number}</td>
                        <td className="p-3 text-muted-foreground">{m.mfg_date}</td>
                        <td className="p-3 text-muted-foreground">{m.exp_date}</td>
                        <td className="p-3 text-foreground">{m.quantity}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${m.status === "Active" ? "bg-success/10 text-success" :
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

          {/* CODES TAB */}
          <TabsContent value="codes">
            <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-bold text-foreground">Code Database (Recent {codes.length})</h3>
              </div>
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
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === "Unused" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
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

          {/* SCANS TAB */}
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
