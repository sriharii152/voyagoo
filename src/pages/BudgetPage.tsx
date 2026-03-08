import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Utensils, Hotel, Plane, ShoppingBag, Plus, Trash2, DollarSign, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const categoryIcons: Record<string, typeof Plane> = {
  Transport: Plane,
  Accommodation: Hotel,
  "Food & Dining": Utensils,
  Shopping: ShoppingBag,
  Activities: TrendingUp,
  Other: Wallet,
};

const categoryColors: Record<string, string> = {
  Transport: "bg-secondary",
  Accommodation: "bg-primary",
  "Food & Dining": "bg-accent",
  Shopping: "bg-destructive",
  Activities: "bg-primary",
  Other: "bg-muted-foreground",
};

const categories = ["Transport", "Accommodation", "Food & Dining", "Shopping", "Activities", "Other"];

const BudgetPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [budget, setBudget] = useState(2500);
  const [editBudget, setEditBudget] = useState(false);
  const [newDesc, setNewDesc] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState("Other");
  const [showForm, setShowForm] = useState(false);

  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("budget_expenses").select("*").eq("user_id", user.id).order("expense_date", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const addExpense = useMutation({
    mutationFn: async () => {
      if (!user || !newDesc.trim() || !newAmount) return;
      await supabase.from("budget_expenses").insert({
        user_id: user.id,
        description: newDesc.trim(),
        amount: parseFloat(newAmount),
        category: newCategory,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setNewDesc("");
      setNewAmount("");
      setNewCategory("Other");
      setShowForm(false);
      toast.success("Expense added!");
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("budget_expenses").delete().eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense removed");
    },
  });

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const percentage = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;

  // Group by category
  const byCategory = categories.map((cat) => ({
    name: cat,
    spent: expenses.filter((e) => e.category === cat).reduce((s, e) => s + Number(e.amount), 0),
  })).filter((c) => c.spent > 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground">Sign in to use Budget Tracker</h2>
          <p className="text-muted-foreground mt-2">Track expenses and manage your travel budget</p>
          <Button variant="hero" className="mt-6" onClick={() => window.location.href = "/auth"}>Sign In</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <span className="text-primary font-semibold text-sm uppercase tracking-widest">Budget</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2">Budget Tracker</h1>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto">Set budgets, log expenses, and get real-time spending breakdowns</p>
          </motion.div>

          <div className="max-w-2xl mx-auto space-y-6">
            {/* Summary Card */}
            <div className="bg-card rounded-2xl border border-border/50 shadow-travel p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                  {editBudget ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-32" />
                      <Button size="sm" onClick={() => setEditBudget(false)}>Set</Button>
                    </div>
                  ) : (
                    <p className="font-display text-3xl font-bold text-card-foreground cursor-pointer hover:text-primary transition-colors" onClick={() => setEditBudget(true)}>
                      ${budget.toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Spent</p>
                  <p className="font-display text-3xl font-bold text-primary">${totalSpent.toLocaleString()}</p>
                </div>
              </div>
              <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                <span>{percentage.toFixed(0)}% used</span>
                <span>${Math.max(budget - totalSpent, 0).toLocaleString()} remaining</span>
              </div>
              <Progress value={percentage} className="h-3 mb-6" />

              {/* Category Breakdown */}
              <div className="space-y-3">
                {byCategory.map((cat) => {
                  const Icon = categoryIcons[cat.name] || Wallet;
                  const color = categoryColors[cat.name] || "bg-muted-foreground";
                  return (
                    <div key={cat.name} className="flex items-center gap-4 p-3 bg-muted/50 rounded-xl">
                      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
                        <Icon className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-card-foreground">{cat.name}</span>
                          <span className="text-sm font-semibold text-card-foreground">${cat.spent.toLocaleString()}</span>
                        </div>
                        <Progress value={budget > 0 ? (cat.spent / budget) * 100 : 0} className="h-1.5" />
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button variant="hero" className="w-full mt-6" onClick={() => setShowForm(!showForm)}>
                <Plus className="h-4 w-4 mr-2" /> Add Expense
              </Button>

              {/* Add Form */}
              <AnimatePresence>
                {showForm && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mt-4 p-4 bg-muted/50 rounded-xl space-y-3">
                      <Input placeholder="Description..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                      <div className="grid grid-cols-2 gap-3">
                        <Input type="number" placeholder="Amount ($)" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
                        <Select value={newCategory} onValueChange={setNewCategory}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button variant="hero" className="w-full" onClick={() => addExpense.mutate()} disabled={!newDesc.trim() || !newAmount}>
                        Save Expense
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Recent Expenses */}
            <div className="bg-card rounded-2xl border border-border/50 shadow-travel p-6">
              <h3 className="font-display text-lg font-bold text-foreground mb-4">Recent Expenses</h3>
              <div className="space-y-2">
                {expenses.slice(0, 20).map((exp) => {
                  const Icon = categoryIcons[exp.category] || Wallet;
                  return (
                    <div key={exp.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl group hover:bg-muted transition-colors">
                      <Icon className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-card-foreground">{exp.description}</p>
                        <p className="text-xs text-muted-foreground">{exp.category} · {new Date(exp.expense_date).toLocaleDateString()}</p>
                      </div>
                      <span className="text-sm font-bold text-primary">${Number(exp.amount).toLocaleString()}</span>
                      <button onClick={() => deleteExpense.mutate(exp.id)} className="opacity-0 group-hover:opacity-100 text-destructive transition-opacity">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
                {expenses.length === 0 && <p className="text-center text-muted-foreground text-sm py-6">No expenses yet. Start tracking!</p>}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BudgetPage;
