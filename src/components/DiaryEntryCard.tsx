import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Globe, Lock, MapPin, Utensils, Eye, StickyNote, Trash2, Calendar, Mic, Play } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface DiaryEntry {
  id: string;
  user_id: string;
  title: string;
  destination: string;
  entry_date: string;
  notes: string;
  foods: string;
  places: string;
  views_description: string;
  is_public: boolean;
  created_at: string;
}

interface MediaItem {
  id: string;
  file_path: string;
  file_type: string;
  caption: string;
}

interface DiaryEntryCardProps {
  entry: DiaryEntry;
  onDelete?: () => void;
  showAuthor?: boolean;
}

const DiaryEntryCard = ({ entry, onDelete, showAuthor }: DiaryEntryCardProps) => {
  const { user } = useAuth();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [authorName, setAuthorName] = useState("");
  const isOwner = user?.id === entry.user_id;

  useEffect(() => {
    fetchMedia();
    if (showAuthor) fetchAuthor();
  }, [entry.id]);

  const fetchMedia = async () => {
    const { data } = await supabase
      .from("diary_media")
      .select("*")
      .eq("entry_id", entry.id);
    if (data) setMedia(data);
  };

  const fetchAuthor = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", entry.user_id)
      .single();
    if (data) setAuthorName(data.display_name || "Traveler");
  };

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from("diary-media").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleDelete = async () => {
    if (!confirm("Delete this diary entry?")) return;
    // Delete media from storage
    for (const m of media) {
      await supabase.storage.from("diary-media").remove([m.file_path]);
    }
    const { error } = await supabase.from("diary_entries").delete().eq("id", entry.id);
    if (error) {
      toast({ title: "Failed to delete", variant: "destructive" });
    } else {
      toast({ title: "Entry deleted" });
      onDelete?.();
    }
  };

  const images = media.filter(m => m.file_type === "image");
  const videos = media.filter(m => m.file_type === "video");
  const voices = media.filter(m => m.file_type === "voice");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-border/60 hover:border-primary/30 transition-colors bg-card">
        {/* Image gallery */}
        {images.length > 0 && (
          <div className={`grid gap-1 ${images.length === 1 ? "" : images.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
            {images.slice(0, 3).map((img, i) => (
              <div key={img.id} className={`relative ${images.length === 1 ? "h-56" : "h-40"} ${i === 0 && images.length > 2 ? "col-span-2 row-span-1" : ""}`}>
                <img
                  src={getPublicUrl(img.file_path)}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {i === 2 && images.length > 3 && (
                  <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-lg">+{images.length - 3}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-lg font-bold text-foreground truncate">{entry.title}</h3>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {entry.destination && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {entry.destination}
                  </span>
                )}
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {format(new Date(entry.entry_date), "MMM d, yyyy")}
                </span>
                {showAuthor && authorName && (
                  <span className="text-xs text-secondary font-medium">by {authorName}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={entry.is_public ? "default" : "secondary"} className="text-xs gap-1 shrink-0">
                {entry.is_public ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                {entry.is_public ? "Public" : "Private"}
              </Badge>
              {isOwner && onDelete && (
                <Button variant="ghost" size="icon" onClick={handleDelete} className="h-8 w-8 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-0">
          {entry.notes && (
            <div className="flex gap-2">
              <StickyNote className="h-4 w-4 text-accent shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground line-clamp-3">{entry.notes}</p>
            </div>
          )}
          {entry.foods && (
            <div className="flex gap-2">
              <Utensils className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground line-clamp-2">{entry.foods}</p>
            </div>
          )}
          {entry.places && (
            <div className="flex gap-2">
              <MapPin className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground line-clamp-2">{entry.places}</p>
            </div>
          )}
          {entry.views_description && (
            <div className="flex gap-2">
              <Eye className="h-4 w-4 text-accent shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground line-clamp-2">{entry.views_description}</p>
            </div>
          )}

          {/* Videos */}
          {videos.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {videos.map(v => (
                <video
                  key={v.id}
                  src={getPublicUrl(v.file_path)}
                  controls
                  className="w-full rounded-lg border border-border"
                  style={{ maxHeight: 200 }}
                />
              ))}
            </div>
          )}

          {/* Voice recordings */}
          {voices.length > 0 && (
            <div className="space-y-2">
              {voices.map(v => (
                <div key={v.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border">
                  <Mic className="h-4 w-4 text-primary" />
                  <audio src={getPublicUrl(v.file_path)} controls className="flex-1 h-8" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DiaryEntryCard;
