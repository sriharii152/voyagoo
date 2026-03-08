import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Utensils, Hotel, Plane, ShoppingBag, Plus, Trash2, TrendingUp, Pencil, Check, X, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BudgetSummaryCard from "@/components/budget/BudgetSummaryCard";
import ExpenseList from "@/components/budget/ExpenseList";

const BudgetPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [budget, setBudget] = useState(2500);
  const [editBudget, setEditBudget] = useState(false);

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["expenses", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("budget_expenses")
        .select("*")
        .eq("user_id", user.id)
        .order("expense_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const addExpense = useMutation({
    mutationFn: async (expense: { description: string; amount: number; category: string; date: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("budget_expenses").insert({
        user_id: user.id,
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        expense_date: expense.date,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense added!");
    },
    onError: (err) => toast.error("Failed to add expense: " + err.message),
  });

  const updateExpense = useMutation({
    mutationFn: async (expense: { id: string; description: string; amount: number; category: string; date: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("budget_expenses")
        .update({
          description: expense.description,
          amount: expense.amount,
          category: expense.category,
          expense_date: expense.date,
        })
        .eq("id", expense.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense updated!");
    },
    onError: (err) => toast.error("Failed to update: " + err.message),
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("budget_expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense removed");
    },
    onError: (err) => toast.error("Failed to delete: " + err.message),
  });

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const percentage = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;

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
            <BudgetSummaryCard
              budget={budget}
              setBudget={setBudget}
              editBudget={editBudget}
              setEditBudget={setEditBudget}
              totalSpent={totalSpent}
              percentage={percentage}
              expenses={expenses}
              onAddExpense={(e) => addExpense.mutate(e)}
              isAdding={addExpense.isPending}
            />

            <ExpenseList
              expenses={expenses}
              isLoading={isLoading}
              onUpdate={(e) => updateExpense.mutate(e)}
              onDelete={(id) => deleteExpense.mutate(id)}
              isUpdating={updateExpense.isPending}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BudgetPage;
