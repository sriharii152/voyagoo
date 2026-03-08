import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DiaryEntryForm from "@/components/DiaryEntryForm";
import DiaryEntryCard from "@/components/DiaryEntryCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, BookOpen, Globe, Lock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const TripDiaryPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [myEntries, setMyEntries] = useState<any[]>([]);
  const [publicEntries, setPublicEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("public");

  const fetchMyEntries = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("diary_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setMyEntries(data);
  };

  const fetchPublicEntries = async () => {
    const { data } = await supabase
      .from("diary_entries")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setPublicEntries(data);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchMyEntries(), fetchPublicEntries()]);
      setLoading(false);
    };
    if (!authLoading) load();
  }, [user, authLoading]);

  const handleSuccess = () => {
    setShowForm(false);
    fetchMyEntries();
    fetchPublicEntries();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <BookOpen className="h-4 w-4" /> Trip Diary
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Your Travel Stories
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Capture memories with photos, videos, voice recordings, notes about foods, places, and views.
          </p>
        </motion.div>

        {/* New Entry Button / Form */}
        {user ? (
          showForm ? (
            <div className="max-w-2xl mx-auto mb-10">
              <DiaryEntryForm onSuccess={handleSuccess} onCancel={() => setShowForm(false)} />
            </div>
          ) : (
            <div className="flex justify-center mb-8">
              <Button variant="hero" size="lg" onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="h-5 w-5" /> New Diary Entry
              </Button>
            </div>
          )
        ) : (
          <div className="text-center mb-8 p-6 rounded-xl bg-muted/50 border border-border max-w-md mx-auto">
            <p className="text-muted-foreground mb-3">Sign in to create your own travel diary</p>
            <Link to="/auth">
              <Button variant="hero">Sign In</Button>
            </Link>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="public" className="gap-1">
              <Globe className="h-4 w-4" /> Public Feed
            </TabsTrigger>
            {user && (
              <TabsTrigger value="mine" className="gap-1">
                <Lock className="h-4 w-4" /> My Diary
              </TabsTrigger>
            )}
          </TabsList>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <TabsContent value="public">
                {publicEntries.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <Globe className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No public diary entries yet. Be the first to share!</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {publicEntries.map(entry => (
                      <DiaryEntryCard key={entry.id} entry={entry} showAuthor />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="mine">
                {myEntries.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Your diary is empty. Start capturing your travel memories!</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {myEntries.map(entry => (
                      <DiaryEntryCard
                        key={entry.id}
                        entry={entry}
                        onDelete={() => {
                          fetchMyEntries();
                          fetchPublicEntries();
                        }}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default TripDiaryPage;
