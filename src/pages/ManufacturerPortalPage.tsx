import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Factory, Package, QrCode, AlertTriangle, BarChart3, User, Shield,
  Plus, Download, Eye, Edit, Trash2, Bell, Lock, TrendingUp
} from "lucide-react";

const dashboardCards = [
  { label: "Total Manufactured", value: "2,45,000", icon: Package, trend: "+12%" },
  { label: "Codes Generated", value: "4,90,000", icon: QrCode, trend: "+8%" },
  { label: "Active Batches", value: "142", icon: Factory, trend: "+3" },
  { label: "Expired Batches", value: "18", icon: AlertTriangle, trend: "-2" },
  { label: "Recalled Batches", value: "3", icon: Bell, trend: "0" },
  { label: "Suspicious Alerts", value: "27", icon: Shield, trend: "+5" },
];

const batches = [
  { id: "B-001", name: "Paracetamol 500mg", batch: "SP-PCM-2025-0412", mfg: "2025-01-15", exp: "2027-01-15", qty: "50,000", region: "Maharashtra", dist: "MedDistrib Pvt Ltd", status: "Active" },
  { id: "B-002", name: "Amoxicillin 250mg", batch: "SP-AMX-2025-0321", mfg: "2025-02-10", exp: "2027-02-10", qty: "30,000", region: "Gujarat", dist: "PharmaLine Corp", status: "Active" },
  { id: "B-003", name: "Ibuprofen 400mg", batch: "SP-IBU-2024-0112", mfg: "2024-01-12", exp: "2026-01-12", qty: "25,000", region: "Delhi NCR", dist: "HealthFirst Dist", status: "Expired" },
  { id: "B-004", name: "Cetirizine 10mg", batch: "SP-CET-2024-0830", mfg: "2024-08-30", exp: "2026-08-30", qty: "40,000", region: "Tamil Nadu", dist: "SouthMed Logistics", status: "Recalled" },
];

const suspiciousAlerts = [
  { type: "Duplicate Scan", medicine: "Paracetamol 500mg", location: "Mumbai", time: "2 hours ago" },
  { type: "Region Mismatch", medicine: "Amoxicillin 250mg", location: "Chennai (assigned: Gujarat)", time: "5 hours ago" },
  { type: "Already Sold", medicine: "Ibuprofen 400mg", location: "Pune", time: "1 day ago" },
];

export default function ManufacturerPortalPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-8 shadow-elevated border border-border w-full max-w-md"
        >
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-xl bg-teal-gradient flex items-center justify-center mx-auto mb-4 shadow-glow-teal">
              <Factory className="w-7 h-7 text-secondary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Manufacturer Portal</h1>
            <p className="text-sm text-muted-foreground mt-1">Login to manage your batches and codes</p>
          </div>
          <div className="space-y-4">
            <Input placeholder="Manufacturer ID" className="h-12" />
            <Input placeholder="Password" type="password" className="h-12" />
            <Input placeholder="OTP (optional)" className="h-12" />
            <Button variant="hero" className="w-full h-12" onClick={() => setIsLoggedIn(true)}>
              <Lock className="w-4 h-4 mr-2" /> Login
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted pt-16">
      <div className="bg-hero-gradient py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-primary-foreground">Manufacturer Dashboard</h1>
          <p className="text-primary-foreground/60 text-sm">Sun Pharmaceuticals — License: MFG/MH/2024/0847</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Dashboard Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {dashboardCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl p-5 shadow-card border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <card.icon className="w-5 h-5 text-secondary" />
                <span className="text-xs text-success font-medium">{card.trend}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="batches" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="batches">Batch Management</TabsTrigger>
            <TabsTrigger value="create">Create Batch</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Batch Management */}
          <TabsContent value="batches">
            <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-bold text-foreground">Batch Records</h3>
                <Button variant="hero" size="sm"><Plus className="w-4 h-4 mr-1" /> New Batch</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted">
                      {["ID", "Medicine", "Batch #", "MFG", "EXP", "Qty", "Region", "Distributor", "Status", "Actions"].map(h => (
                        <th key={h} className="text-left p-3 font-medium text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((b) => (
                      <tr key={b.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-3 font-medium text-foreground">{b.id}</td>
                        <td className="p-3 text-foreground">{b.name}</td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">{b.batch}</td>
                        <td className="p-3 text-muted-foreground">{b.mfg}</td>
                        <td className="p-3 text-muted-foreground">{b.exp}</td>
                        <td className="p-3 text-foreground">{b.qty}</td>
                        <td className="p-3 text-muted-foreground">{b.region}</td>
                        <td className="p-3 text-muted-foreground">{b.dist}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            b.status === "Active" ? "bg-success/10 text-success" :
                            b.status === "Expired" ? "bg-warning/10 text-warning" :
                            "bg-destructive/10 text-destructive"
                          }`}>{b.status}</span>
                        </td>
                        <td className="p-3 flex gap-1">
                          <button className="p-1.5 rounded hover:bg-muted"><Eye className="w-4 h-4 text-muted-foreground" /></button>
                          <button className="p-1.5 rounded hover:bg-muted"><Edit className="w-4 h-4 text-muted-foreground" /></button>
                          <button className="p-1.5 rounded hover:bg-destructive/10"><AlertTriangle className="w-4 h-4 text-destructive" /></button>
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
              <h3 className="text-lg font-bold text-foreground mb-6">Create New Batch</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  "Medicine Name", "Composition / Salt", "Batch Number", "Manufacturing Date",
                  "Expiry Date", "Factory Location", "Quantity Produced", "Packaging Type",
                  "Region Allocation", "Distributor Assigned", "QR Code Type", "Notes"
                ].map((field) => (
                  <div key={field} className={field === "Notes" ? "sm:col-span-2" : ""}>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">{field}</label>
                    {field === "Notes" ? (
                      <textarea className="w-full h-24 rounded-lg border border-input bg-background p-3 text-sm" placeholder={field} />
                    ) : (
                      <Input placeholder={field} className="h-11" />
                    )}
                  </div>
                ))}
              </div>
              <Button variant="hero" className="mt-6"><QrCode className="w-4 h-4 mr-2" /> Generate Codes</Button>
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Daily Scans", value: "1,247", icon: BarChart3 },
                { label: "Genuine %", value: "98.2%", icon: TrendingUp },
                { label: "Suspicious", value: "22", icon: AlertTriangle },
                { label: "Top Region", value: "Maharashtra", icon: Factory },
              ].map((s) => (
                <div key={s.label} className="bg-card rounded-xl p-6 shadow-card border border-border text-center">
                  <s.icon className="w-8 h-8 text-secondary mx-auto mb-3" />
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-card rounded-xl p-6 shadow-card border border-border">
              <h3 className="font-bold text-foreground mb-4">Code Generation & Download</h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="p-4 rounded-lg bg-muted"><p className="text-sm text-muted-foreground">QR Codes Generated</p><p className="text-xl font-bold text-foreground">3,20,000</p></div>
                <div className="p-4 rounded-lg bg-muted"><p className="text-sm text-muted-foreground">Foil Codes Generated</p><p className="text-xl font-bold text-foreground">1,70,000</p></div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" /> Download QR PDF</Button>
                <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" /> Download CSV</Button>
              </div>
            </div>
          </TabsContent>

          {/* Alerts */}
          <TabsContent value="alerts">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">Suspicious Activity Alerts</h3>
                <Button variant="destructive" size="sm"><AlertTriangle className="w-4 h-4 mr-1" /> Recall Batch</Button>
              </div>
              {suspiciousAlerts.map((a, i) => (
                <motion.div
                  key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-destructive text-sm">{a.type}</p>
                    <p className="text-sm text-foreground">{a.medicine} — {a.location}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{a.time}</span>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Profile */}
          <TabsContent value="profile">
            <div className="bg-card rounded-xl p-6 shadow-card border border-border max-w-2xl">
              <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-secondary" /> Manufacturer Profile
              </h3>
              <div className="space-y-3">
                {[
                  ["Company Name", "Sun Pharmaceuticals Ltd."],
                  ["License Number", "MFG/MH/2024/0847"],
                  ["Factory Address", "Plot 42, Industrial Area, Silvassa, Gujarat"],
                  ["Registered Distributors", "12"],
                  ["API Integration", "Active — REST API v2.1"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between p-3 rounded-lg bg-muted">
                    <span className="text-sm text-muted-foreground">{k}</span>
                    <span className="text-sm font-medium text-foreground">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
