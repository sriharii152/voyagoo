import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, Utensils, Hotel, Plane, ShoppingBag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

const categories = [
  { name: "Transport", icon: Plane, spent: 37500, color: "bg-ocean" },
  { name: "Accommodation", icon: Hotel, spent: 56500, color: "bg-primary" },
  { name: "Food & Dining", icon: Utensils, spent: 26500, color: "bg-forest" },
  { name: "Shopping", icon: ShoppingBag, spent: 12500, color: "bg-sunset" },
];

const BudgetSection = () => {
  const totalBudget = 2500;
  const [budget] = useState(totalBudget);
  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);
  const percentage = (totalSpent / budget) * 100;

  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Budget</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2">
            Budget Tracker
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Keep your spending on track with real-time expense monitoring
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-2xl border border-border/50 shadow-travel p-8">
            {/* Summary */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="font-display text-3xl font-bold text-card-foreground">₹{budget.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Spent</p>
                <p className="font-display text-3xl font-bold text-primary">₹{totalSpent.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="mb-2 flex justify-between text-xs text-muted-foreground">
              <span>{percentage.toFixed(0)}% used</span>
              <span>₹{(budget - totalSpent).toLocaleString('en-IN')} remaining</span>
            </div>
            <Progress value={percentage} className="h-3 mb-8" />

            {/* Categories */}
            <div className="space-y-4">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl"
                >
                  <div className={`w-10 h-10 rounded-lg ${cat.color} flex items-center justify-center`}>
                    <cat.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-card-foreground">{cat.name}</span>
                      <span className="text-sm font-semibold text-card-foreground">₹{cat.spent.toLocaleString('en-IN')}</span>
                    </div>
                    <Progress value={(cat.spent / budget) * 100} className="h-1.5" />
                  </div>
                </motion.div>
              ))}
            </div>

            <Button variant="hero" className="w-full mt-6">
              <Plus className="h-4 w-4 mr-2" /> Add Expense
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BudgetSection;
