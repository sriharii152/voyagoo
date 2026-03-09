import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Utensils, Hotel, Plane, ShoppingBag, Plus, TrendingUp, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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

export const categories = ["Transport", "Accommodation", "Food & Dining", "Shopping", "Activities", "Other"];
export { categoryIcons, categoryColors };

interface BudgetSummaryCardProps {
  budget: number;
  setBudget: (v: number) => void;
  editBudget: boolean;
  setEditBudget: (v: boolean) => void;
  totalSpent: number;
  percentage: number;
  expenses: any[];
  onAddExpense: (e: { description: string; amount: number; category: string; date: string }) => void;
  isAdding: boolean;
}

const BudgetSummaryCard = ({
  budget, setBudget, editBudget, setEditBudget,
  totalSpent, percentage, expenses, onAddExpense, isAdding,
}: BudgetSummaryCardProps) => {
  const [showForm, setShowForm] = useState(false);
  const [newDesc, setNewDesc] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState("Other");
  const [newDate, setNewDate] = useState<Date>(new Date());

  const byCategory = categories
    .map((cat) => ({
      name: cat,
      spent: expenses.filter((e) => e.category === cat).reduce((s, e) => s + Number(e.amount), 0),
    }))
    .filter((c) => c.spent > 0);

  const handleAdd = () => {
    if (!newDesc.trim() || !newAmount) return;
    onAddExpense({
      description: newDesc.trim(),
      amount: parseFloat(newAmount),
      category: newCategory,
      date: format(newDate, "yyyy-MM-dd"),
    });
    setNewDesc("");
    setNewAmount("");
    setNewCategory("Other");
    setNewDate(new Date());
    setShowForm(false);
  };

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-travel p-8">
      {/* Summary */}
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
              ₹{budget.toLocaleString('en-IN')}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Spent</p>
          <p className={cn("font-display text-3xl font-bold", percentage >= 90 ? "text-destructive" : "text-primary")}>
            ₹{totalSpent.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div className="mb-2 flex justify-between text-xs text-muted-foreground">
        <span>{percentage.toFixed(0)}% used</span>
        <span>₹{Math.max(budget - totalSpent, 0).toLocaleString('en-IN')} remaining</span>
      </div>
      <Progress value={percentage} className={cn("h-3 mb-6", percentage >= 90 && "[&>div]:bg-destructive")} />

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
                  <span className="text-sm font-semibold text-card-foreground">₹{cat.spent.toLocaleString('en-IN')}</span>
                </div>
                <Progress value={budget > 0 ? (cat.spent / budget) * 100 : 0} className="h-1.5" />
              </div>
            </div>
          );
        })}
        {byCategory.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-4">No expenses yet</p>
        )}
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
                <Input type="number" placeholder="Amount ($)" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} min="0" step="0.01" />
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(newDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newDate}
                    onSelect={(d) => d && setNewDate(d)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <Button variant="hero" className="w-full" onClick={handleAdd} disabled={!newDesc.trim() || !newAmount || isAdding}>
                {isAdding ? "Saving..." : "Save Expense"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BudgetSummaryCard;
