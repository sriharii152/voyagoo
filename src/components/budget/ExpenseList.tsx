import { useState } from "react";
import { Wallet, Trash2, Pencil, Check, X, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { categoryIcons, categories } from "./BudgetSummaryCard";

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  expense_date: string;
}

interface ExpenseListProps {
  expenses: Expense[];
  isLoading: boolean;
  onUpdate: (e: { id: string; description: string; amount: number; category: string; date: string }) => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
}

const ExpenseList = ({ expenses, isLoading, onUpdate, onDelete, isUpdating }: ExpenseListProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDate, setEditDate] = useState<Date>(new Date());

  const startEdit = (exp: Expense) => {
    setEditingId(exp.id);
    setEditDesc(exp.description);
    setEditAmount(String(exp.amount));
    setEditCategory(exp.category);
    setEditDate(new Date(exp.expense_date));
  };

  const saveEdit = () => {
    if (!editingId || !editDesc.trim() || !editAmount) return;
    onUpdate({
      id: editingId,
      description: editDesc.trim(),
      amount: parseFloat(editAmount),
      category: editCategory,
      date: format(editDate, "yyyy-MM-dd"),
    });
    setEditingId(null);
  };

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-travel p-6">
      <h3 className="font-display text-lg font-bold text-foreground mb-4">Recent Expenses</h3>
      <div className="space-y-2">
        {isLoading && <p className="text-center text-muted-foreground text-sm py-6">Loading...</p>}
        {!isLoading && expenses.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-6">No expenses yet. Start tracking!</p>
        )}
        {expenses.slice(0, 50).map((exp) => {
          const Icon = categoryIcons[exp.category] || Wallet;
          const isEditing = editingId === exp.id;

          if (isEditing) {
            return (
              <div key={exp.id} className="p-3 bg-muted rounded-xl space-y-2">
                <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Description" />
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} min="0" step="0.01" />
                  <Select value={editCategory} onValueChange={setEditCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal" size="sm">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(editDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editDate}
                      onSelect={(d) => d && setEditDate(d)}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <div className="flex gap-2">
                  <Button size="sm" variant="hero" className="flex-1" onClick={saveEdit} disabled={!editDesc.trim() || !editAmount || isUpdating}>
                    <Check className="h-4 w-4 mr-1" /> Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          }

          return (
            <div key={exp.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl group hover:bg-muted transition-colors">
              <Icon className="h-5 w-5 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground truncate">{exp.description}</p>
                <p className="text-xs text-muted-foreground">{exp.category} · {new Date(exp.expense_date).toLocaleDateString()}</p>
              </div>
              <span className="text-sm font-bold text-primary whitespace-nowrap">${Number(exp.amount).toLocaleString()}</span>
              <button onClick={() => startEdit(exp)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => onDelete(exp.id)} className="opacity-0 group-hover:opacity-100 text-destructive transition-opacity">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpenseList;
