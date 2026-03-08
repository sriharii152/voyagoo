import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, MapPin, ArrowRight, Heart, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

interface DiaryPreview {
  id: string;
  title: string;
  destination: string;
  entry_date: string;
  notes: string | null;
  user_id: string;
}

const DiaryCarouselSection = () => {
  const [entries, setEntries] = useState<DiaryPreview[]>([]);
  const [images, setImages] = useState<Record<string, string>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [authors, setAuthors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const { data } = await supabase
      .from("diary_entries")
      .select("id, title, destination, entry_date, notes, user_id")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!data || data.length === 0) return;
    setEntries(data);

    const entryIds = data.map((e) => e.id);
    const userIds = [...new Set(data.map((e) => e.user_id))];

    // Fetch first image per entry, likes, comments, authors in parallel
    const [mediaRes, likesRes, commentsRes, profilesRes] = await Promise.all([
      supabase
        .from("diary_media")
        .select("entry_id, file_path")
        .in("entry_id", entryIds)
        .eq("file_type", "image"),
      supabase.from("diary_likes").select("entry_id").in("entry_id", entryIds),
      supabase.from("diary_comments").select("entry_id").in("entry_id", entryIds),
      supabase.from("profiles").select("user_id, display_name").in("user_id", userIds),
    ]);

    // First image per entry
    if (mediaRes.data) {
      const imgMap: Record<string, string> = {};
      for (const m of mediaRes.data) {
        if (!imgMap[m.entry_id]) {
          const { data: urlData } = supabase.storage.from("diary-media").getPublicUrl(m.file_path);
          imgMap[m.entry_id] = urlData.publicUrl;
        }
      }
      setImages(imgMap);
    }

    // Like counts
    if (likesRes.data) {
      const counts: Record<string, number> = {};
      likesRes.data.forEach((l) => {
        counts[l.entry_id] = (counts[l.entry_id] || 0) + 1;
      });
      setLikeCounts(counts);
    }

    // Comment counts
    if (commentsRes.data) {
      const counts: Record<string, number> = {};
      commentsRes.data.forEach((c) => {
        counts[c.entry_id] = (counts[c.entry_id] || 0) + 1;
      });
      setCommentCounts(counts);
    }

    // Authors
    if (profilesRes.data) {
      const map: Record<string, string> = {};
      profilesRes.data.forEach((p) => {
        map[p.user_id] = p.display_name || "Traveler";
      });
      setAuthors(map);
    }
  };

  if (entries.length === 0) return null;

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4 gap-1 text-primary border-primary/30">
            <BookOpen className="h-3.5 w-3.5" /> Community Stories
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Latest Travel Diaries
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Real stories from fellow travelers around the world
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto px-12">
          <Carousel opts={{ align: "start", loop: true }}>
            <CarouselContent>
              {entries.map((entry) => (
                <CarouselItem key={entry.id} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="overflow-hidden border-border/60 hover:border-primary/30 transition-all hover:shadow-lg group h-full">
                    {images[entry.id] ? (
                      <div className="h-40 overflow-hidden">
                        <img
                          src={images[entry.id]}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="h-40 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                        <BookOpen className="h-10 w-10 text-primary/30" />
                      </div>
                    )}
                    <CardContent className="p-4 space-y-2">
                      <h3 className="font-display font-bold text-foreground truncate">{entry.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {entry.destination && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="h-3 w-3" /> {entry.destination}
                          </span>
                        )}
                        <span>{format(new Date(entry.entry_date), "MMM d")}</span>
                      </div>
                      {entry.notes && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{entry.notes}</p>
                      )}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-secondary font-medium">
                          {authors[entry.user_id] || "Traveler"}
                        </span>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <Heart className="h-3 w-3" /> {likeCounts[entry.id] || 0}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <MessageCircle className="h-3 w-3" /> {commentCounts[entry.id] || 0}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>

        <div className="text-center mt-10">
          <Link to="/diary">
            <Button variant="hero" size="lg" className="gap-2">
              Explore All Diaries <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DiaryCarouselSection;
