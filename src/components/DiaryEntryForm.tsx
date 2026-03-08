import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Camera, Video, Mic, MicOff, X, Upload, Globe, Lock, Utensils, MapPin, Eye, StickyNote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CityAutocomplete from "./CityAutocomplete";

interface DiaryEntryFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const DiaryEntryForm = ({ onSuccess, onCancel }: DiaryEntryFormProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [notes, setNotes] = useState("");
  const [foods, setFoods] = useState("");
  const [places, setPlaces] = useState("");
  const [viewsDescription, setViewsDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [files, setFiles] = useState<{ file: File; type: string; preview: string }[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [saving, setSaving] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const selected = e.target.files;
    if (!selected) return;
    const newFiles = Array.from(selected).map(file => ({
      file,
      type,
      preview: type === "voice" ? "" : URL.createObjectURL(file),
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const updated = [...prev];
      if (updated[index].preview) URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
        setFiles(prev => [...prev, { file, type: "voice", preview: URL.createObjectURL(blob) }]);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      toast({ title: "Microphone access denied", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleSubmit = async () => {
    if (!user || !title.trim()) {
      toast({ title: "Please enter a title", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      // Create diary entry
      const { data: entry, error: entryError } = await supabase
        .from("diary_entries")
        .insert({
          user_id: user.id,
          title: title.trim(),
          destination: destination.trim(),
          notes: notes.trim(),
          foods: foods.trim(),
          places: places.trim(),
          views_description: viewsDescription.trim(),
          is_public: isPublic,
        })
        .select()
        .single();

      if (entryError) throw entryError;

      // Upload media files
      for (const { file, type } of files) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${entry.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        
        const { error: uploadError } = await supabase.storage
          .from("diary-media")
          .upload(path, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          continue;
        }

        await supabase.from("diary_media").insert({
          entry_id: entry.id,
          user_id: user.id,
          file_path: path,
          file_type: type,
        });
      }

      toast({ title: "Diary entry saved! ✨" });
      onSuccess();
    } catch (err: any) {
      toast({ title: "Failed to save", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="border-primary/20 bg-card">
        <CardHeader>
          <CardTitle className="text-xl font-display text-foreground flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-primary" />
            New Diary Entry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label className="text-foreground font-medium">Title *</Label>
            <Input
              placeholder="My amazing day in..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="bg-background"
            />
          </div>

          {/* Destination */}
          <div className="space-y-2">
            <Label className="text-foreground font-medium flex items-center gap-1">
              <MapPin className="h-4 w-4 text-secondary" /> Destination
            </Label>
            <CityAutocomplete
              value={destination}
              onChange={setDestination}
              placeholder="Search for a city..."
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-foreground font-medium flex items-center gap-1">
              <StickyNote className="h-4 w-4 text-accent" /> Notes & Memories
            </Label>
            <Textarea
              placeholder="Write about your experience..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
              className="bg-background"
            />
          </div>

          {/* Foods */}
          <div className="space-y-2">
            <Label className="text-foreground font-medium flex items-center gap-1">
              <Utensils className="h-4 w-4 text-primary" /> Foods & Cuisine
            </Label>
            <Textarea
              placeholder="What delicious food did you try?"
              value={foods}
              onChange={e => setFoods(e.target.value)}
              rows={2}
              className="bg-background"
            />
          </div>

          {/* Places */}
          <div className="space-y-2">
            <Label className="text-foreground font-medium flex items-center gap-1">
              <MapPin className="h-4 w-4 text-secondary" /> Places Visited
            </Label>
            <Textarea
              placeholder="List the places you explored..."
              value={places}
              onChange={e => setPlaces(e.target.value)}
              rows={2}
              className="bg-background"
            />
          </div>

          {/* Views */}
          <div className="space-y-2">
            <Label className="text-foreground font-medium flex items-center gap-1">
              <Eye className="h-4 w-4 text-accent" /> Views & Scenery
            </Label>
            <Textarea
              placeholder="Describe the beautiful views..."
              value={viewsDescription}
              onChange={e => setViewsDescription(e.target.value)}
              rows={2}
              className="bg-background"
            />
          </div>

          {/* Media Upload */}
          <div className="space-y-3">
            <Label className="text-foreground font-medium">Media</Label>
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => handleFileSelect(e, "image")}
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={e => handleFileSelect(e, "video")}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-1"
              >
                <Camera className="h-4 w-4" /> Photos
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => videoInputRef.current?.click()}
                className="gap-1"
              >
                <Video className="h-4 w-4" /> Videos
              </Button>
              <Button
                type="button"
                variant={isRecording ? "destructive" : "outline"}
                size="sm"
                onClick={isRecording ? stopRecording : startRecording}
                className="gap-1"
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isRecording ? "Stop Recording" : "Voice Memory"}
              </Button>
            </div>

            {/* File previews */}
            <AnimatePresence>
              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3"
                >
                  {files.map((f, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative rounded-lg overflow-hidden border border-border bg-muted aspect-square"
                    >
                      {f.type === "image" && (
                        <img src={f.preview} alt="" className="w-full h-full object-cover" />
                      )}
                      {f.type === "video" && (
                        <video src={f.preview} className="w-full h-full object-cover" />
                      )}
                      {f.type === "voice" && (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
                          <Mic className="h-6 w-6 text-primary" />
                          <span className="text-xs text-muted-foreground text-center">Voice</span>
                          {f.preview && <audio src={f.preview} controls className="w-full mt-1" style={{ height: 24 }} />}
                        </div>
                      )}
                      <button
                        onClick={() => removeFile(i)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Visibility Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-2">
              {isPublic ? (
                <Globe className="h-5 w-5 text-secondary" />
              ) : (
                <Lock className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium text-foreground">
                  {isPublic ? "Public — visible to all travelers" : "Private — only you can see this"}
                </p>
              </div>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSubmit} disabled={saving} variant="hero" className="flex-1 gap-2">
              <Upload className="h-4 w-4" />
              {saving ? "Saving..." : "Save Entry"}
            </Button>
            <Button onClick={onCancel} variant="outline">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DiaryEntryForm;
