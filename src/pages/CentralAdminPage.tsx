import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield, Factory, Store, QrCode, AlertTriangle, BarChart3, Users,
  Lock, Download, Bell, MapPin, Eye, Search, Ban, CheckCircle2, FileText, Key, Activity
} from "lucide-react";

const overviewCards = [
  { label: "Registered Manufacturers", value: "1,247", icon: Factory },
  { label: "Registered Pharmacies", value: "45,832", icon: Store },
  { label: "Active Codes", value: "12.4M", icon: QrCode },
  { label: "Verified Scans Today", value: "89,241", icon: CheckCircle2 },
  { label: "Suspicious Today", value: "342", icon: AlertTriangle },
  { label: "Counterfeit Alerts", value: "78", icon: Shield },
  { label: "Recalled Batches", value: "14", icon: Ban },
  { label: "Expired Medicines", value: "2,341", icon: FileText },
];

const manufacturers = [
  { name: "Sun Pharmaceuticals", license: "MFG/MH/2024/0847", status: "Verified", batches: 142 },
  { name: "Cipla Ltd.", license: "MFG/MH/2023/1234", status: "Verified", batches: 230 },
  { name: "Dr. Reddy's", license: "MFG/TG/2024/0567", status: "Pending", batches: 98 },
  { name: "Aurobindo Pharma", license: "MFG/AP/2023/0912", status: "Suspended", batches: 0 },
];

const auditLogs = [
  { action: "Batch Recalled", user: "Admin_Central", target: "SP-CET-2024-0830", time: "2 hours ago" },
  { action: "Manufacturer Suspended", user: "Admin_Central", target: "Aurobindo Pharma", time: "1 day ago" },
  { action: "Codes Generated", user: "Sun Pharma API", target: "50,000 QR codes", time: "2 days ago" },
  { action: "Region Alert Created", user: "System", target: "Mumbai Zone A", time: "3 days ago" },
];

export default function CentralAdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-8 shadow-elevated border border-border w-full max-w-md"
        >
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-xl bg-hero-gradient flex items-center justify-center mx-auto mb-4 shadow-elevated">
              <Shield className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Central Admin Portal</h1>
            <p className="text-sm text-muted-foreground mt-1">MedSecure Authority Dashboard — Secure Login</p>
          </div>
          <div className="space-y-4">
            <Input placeholder="Admin ID" className="h-12" />
            <Input placeholder="Password" type="password" className="h-12" />
            <Input placeholder="2FA Code" className="h-12" />
            <Button variant="navy" className="w-full h-12" onClick={() => setIsLoggedIn(true)}>
              <Lock className="w-4 h-4 mr-2" /> Secure Login
            </Button>
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
            <h1 className="text-2xl font-bold text-primary-foreground">Central Admin Dashboard</h1>
            <p className="text-primary-foreground/60 text-sm">MedSecure Authority Portal — National Overview</p>
          </div>
          <div className="flex gap-2">
            <Button variant="hero-outline" size="sm"><Bell className="w-4 h-4 mr-1" /> Alerts</Button>
            <Button variant="hero" size="sm"><Download className="w-4 h-4 mr-1" /> Export</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-card rounded-xl p-5 shadow-card border border-border"
            >
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
            <TabsTrigger value="distributors">Distributors</TabsTrigger>
            <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
            <TabsTrigger value="recall">Recall & Safety</TabsTrigger>
          </TabsList>

          {/* Manufacturers Tab */}
          <TabsContent value="manufacturers">
            <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-bold text-foreground">Registered Manufacturers</h3>
                <div className="flex gap-2">
                  <Input placeholder="Search..." className="h-9 w-48" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-muted">
                    {["Name", "License", "Status", "Active Batches", "Actions"].map(h => (
                      <th key={h} className="text-left p-3 font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {manufacturers.map((m) => (
                      <tr key={m.license} className="border-b border-border hover:bg-muted/50">
                        <td className="p-3 font-medium text-foreground">{m.name}</td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">{m.license}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            m.status === "Verified" ? "bg-success/10 text-success" :
                            m.status === "Pending" ? "bg-warning/10 text-warning" :
                            "bg-destructive/10 text-destructive"
                          }`}>{m.status}</span>
                        </td>
                        <td className="p-3 text-foreground">{m.batches}</td>
                        <td className="p-3 flex gap-1">
                          <button className="p-1.5 rounded hover:bg-muted"><Eye className="w-4 h-4 text-muted-foreground" /></button>
                          <button className="p-1.5 rounded hover:bg-muted"><CheckCircle2 className="w-4 h-4 text-success" /></button>
                          <button className="p-1.5 rounded hover:bg-destructive/10"><Ban className="w-4 h-4 text-destructive" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Medicines Tab */}
          <TabsContent value="medicines">
            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
              <h3 className="font-bold text-foreground mb-4">All Batch Records</h3>
              <div className="flex gap-3 mb-4">
                <Input placeholder="Search by batch number..." className="h-10 max-w-sm" />
                <Button variant="outline" size="sm"><Search className="w-4 h-4 mr-1" /> Filter</Button>
              </div>
              <p className="text-muted-foreground text-sm">Showing 14,283 batch records across 1,247 manufacturers. Use filters to narrow down.</p>
            </div>
          </TabsContent>

          {/* Code Database */}
          <TabsContent value="codes">
            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
              <h3 className="font-bold text-foreground mb-4">Code Database Search</h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div><label className="text-sm font-medium text-foreground mb-1 block">Search by QR Code</label><Input placeholder="QR-..." className="h-10" /></div>
                <div><label className="text-sm font-medium text-foreground mb-1 block">Search by Foil Code</label><Input placeholder="FOIL-..." className="h-10" /></div>
              </div>
              <Button variant="hero" size="sm"><Search className="w-4 h-4 mr-1" /> Search Code</Button>
            </div>
          </TabsContent>

          {/* Distributors */}
          <TabsContent value="distributors">
            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
              <h3 className="font-bold text-foreground mb-4">Distributors & Pharmacies</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted text-center">
                  <Store className="w-8 h-8 text-secondary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">45,832</p>
                  <p className="text-sm text-muted-foreground">Registered Pharmacies</p>
                </div>
                <div className="p-4 rounded-lg bg-muted text-center">
                  <Users className="w-8 h-8 text-accent mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">3,421</p>
                  <p className="text-sm text-muted-foreground">Distributors</p>
                </div>
                <div className="p-4 rounded-lg bg-muted text-center">
                  <MapPin className="w-8 h-8 text-warning mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">28</p>
                  <p className="text-sm text-muted-foreground">States Covered</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Fraud Detection */}
          <TabsContent value="fraud">
            <div className="space-y-4">
              <div className="bg-card rounded-xl p-6 shadow-card border border-border">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" /> Live Counterfeit Heatmap
                </h3>
                <div className="h-64 rounded-xl bg-muted flex items-center justify-center border border-border">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-muted-foreground">Interactive India heatmap</p>
                    <p className="text-xs text-muted-foreground">Red zones: high suspicious activity • Green: verified zones</p>
                  </div>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5 text-center">
                  <p className="text-3xl font-bold text-destructive">342</p>
                  <p className="text-sm text-muted-foreground">Suspicious Today</p>
                </div>
                <div className="bg-warning/5 border border-warning/20 rounded-xl p-5 text-center">
                  <p className="text-3xl font-bold text-warning">128</p>
                  <p className="text-sm text-muted-foreground">Region Mismatches</p>
                </div>
                <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5 text-center">
                  <p className="text-3xl font-bold text-destructive">12</p>
                  <p className="text-sm text-muted-foreground">High-Risk Pharmacies</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Recall & Safety */}
          <TabsContent value="recall">
            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
              <h3 className="font-bold text-foreground mb-4">Recall & Safety Notices</h3>
              <div className="flex gap-3 mb-6">
                <Button variant="destructive" size="sm"><AlertTriangle className="w-4 h-4 mr-1" /> Mark Batch Recalled</Button>
                <Button variant="outline" size="sm"><Bell className="w-4 h-4 mr-1" /> Broadcast Warning</Button>
              </div>
              <p className="text-sm text-muted-foreground">14 active recalls across 6 manufacturers.</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Audit Logs */}
        <div className="bg-card rounded-xl p-6 shadow-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground flex items-center gap-2"><Activity className="w-5 h-5 text-secondary" /> Audit Logs</h3>
            <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" /> Export Report</Button>
          </div>
          <div className="space-y-2">
            {auditLogs.map((log, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div>
                  <span className="font-medium text-foreground text-sm">{log.action}</span>
                  <span className="text-muted-foreground text-sm"> — {log.target}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{log.user}</p>
                  <p className="text-xs text-muted-foreground">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API & Notifications */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl p-6 shadow-card border border-border">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2"><Key className="w-5 h-5 text-secondary" /> API Management</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-muted"><p className="text-xs text-muted-foreground">Active API Keys</p><p className="font-bold text-foreground">247</p></div>
              <div className="p-3 rounded-lg bg-muted"><p className="text-xs text-muted-foreground">API Calls Today</p><p className="font-bold text-foreground">1.2M</p></div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-card border border-border">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-secondary" /> Send Notification</h3>
            <div className="space-y-3">
              <Button variant="destructive" size="sm" className="w-full">🚨 Counterfeit Warning Alert</Button>
              <Button variant="outline" size="sm" className="w-full">📢 Public Announcement</Button>
              <Button variant="outline" size="sm" className="w-full">🔔 Recall Notification</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
