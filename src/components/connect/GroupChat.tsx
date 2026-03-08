import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Send, Mic, MicOff, MapPin, MapPinOff, Users, Copy, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  user_id: string;
  content: string;
  message_type: string;
  file_path: string | null;
  created_at: string;
  author_name?: string;
}

interface MemberLocation {
  user_id: string;
  latitude: number;
  longitude: number;
  is_sharing: boolean;
  display_name?: string;
}

interface GroupChatProps {
  groupId: string;
  groupName: string;
  inviteCode: string;
  isCreator: boolean;
  onDeleteGroup: () => void;
}

const GroupChat = ({ groupId, groupName, inviteCode, isCreator, onDeleteGroup }: GroupChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const [memberLocations, setMemberLocations] = useState<MemberLocation[]>([]);
  const [sharingLocation, setSharingLocation] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const locationWatchRef = useRef<number | null>(null);

  useEffect(() => {
    fetchMessages();
    fetchMembers();
    fetchLocations();

    // Subscribe to new messages
    const channel = supabase
      .channel(`group-${groupId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "connect_messages", filter: `group_id=eq.${groupId}` }, () => {
        fetchMessages();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "connect_locations", filter: `group_id=eq.${groupId}` }, () => {
        fetchLocations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (locationWatchRef.current !== null) {
        navigator.geolocation.clearWatch(locationWatchRef.current);
      }
    };
  }, [groupId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("connect_messages")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: true })
      .limit(200);

    if (!data) return;

    const userIds = [...new Set(data.map((m) => m.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", userIds);

    const nameMap: Record<string, string> = {};
    profiles?.forEach((p) => { nameMap[p.user_id] = p.display_name || "Traveler"; });

    setMessages(data.map((m) => ({ ...m, author_name: nameMap[m.user_id] || "Traveler" })));
  };

  const fetchMembers = async () => {
    const { count } = await supabase
      .from("connect_group_members")
      .select("*", { count: "exact", head: true })
      .eq("group_id", groupId);
    setMemberCount(count || 0);
  };

  const fetchLocations = async () => {
    const { data } = await supabase
      .from("connect_locations")
      .select("*")
      .eq("group_id", groupId)
      .eq("is_sharing", true);

    if (!data) return;

    const userIds = data.map((l) => l.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", userIds);

    const nameMap: Record<string, string> = {};
    profiles?.forEach((p) => { nameMap[p.user_id] = p.display_name || "Traveler"; });

    setMemberLocations(data.map((l) => ({ ...l, display_name: nameMap[l.user_id] || "Traveler" })));
  };

  const sendTextMessage = async () => {
    if (!newMessage.trim() || !user) return;
    setSending(true);
    await supabase.from("connect_messages").insert({
      group_id: groupId,
      user_id: user.id,
      content: newMessage.trim(),
      message_type: "text",
    });
    setNewMessage("");
    setSending(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await uploadVoice(blob);
      };
      recorder.start();
      setRecording(true);
    } catch {
      toast({ title: "Microphone access denied", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const uploadVoice = async (blob: Blob) => {
    if (!user) return;
    const path = `${user.id}/${Date.now()}.webm`;
    const { error: uploadError } = await supabase.storage.from("connect-media").upload(path, blob);
    if (uploadError) {
      toast({ title: "Failed to upload voice", variant: "destructive" });
      return;
    }
    await supabase.from("connect_messages").insert({
      group_id: groupId,
      user_id: user.id,
      content: "🎤 Voice message",
      message_type: "voice",
      file_path: path,
    });
  };

  const toggleLocationSharing = async () => {
    if (!user) return;
    if (sharingLocation) {
      if (locationWatchRef.current !== null) {
        navigator.geolocation.clearWatch(locationWatchRef.current);
        locationWatchRef.current = null;
      }
      await supabase.from("connect_locations").delete().eq("group_id", groupId).eq("user_id", user.id);
      setSharingLocation(false);
      toast({ title: "Stopped sharing location" });
    } else {
      if (!navigator.geolocation) {
        toast({ title: "Geolocation not supported", variant: "destructive" });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          await supabase.from("connect_locations").upsert({
            group_id: groupId,
            user_id: user.id,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            is_sharing: true,
            updated_at: new Date().toISOString(),
          }, { onConflict: "group_id,user_id" });
          setSharingLocation(true);

          locationWatchRef.current = navigator.geolocation.watchPosition(async (p) => {
            await supabase.from("connect_locations").upsert({
              group_id: groupId,
              user_id: user.id,
              latitude: p.coords.latitude,
              longitude: p.coords.longitude,
              is_sharing: true,
              updated_at: new Date().toISOString(),
            }, { onConflict: "group_id,user_id" });
          });
          toast({ title: "Sharing live location" });
        },
        () => toast({ title: "Location access denied", variant: "destructive" })
      );
    }
  };

  const getVoiceUrl = (path: string) => {
    const { data } = supabase.storage.from("connect-media").getPublicUrl(path);
    return data.publicUrl;
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast({ title: "Invite code copied!" });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-card flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-foreground truncate">{groupName}</h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {memberCount} members</span>
            <button onClick={copyInviteCode} className="flex items-center gap-1 hover:text-primary transition-colors">
              <Copy className="h-3 w-3" /> {inviteCode}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={sharingLocation ? "default" : "outline"}
            onClick={toggleLocationSharing}
            className="gap-1.5 text-xs"
          >
            {sharingLocation ? <MapPinOff className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
            {sharingLocation ? "Stop" : "Share Location"}
          </Button>
          {isCreator && (
            <Button size="sm" variant="ghost" onClick={onDeleteGroup} className="text-destructive h-8 w-8 p-0">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Location pins */}
      {memberLocations.length > 0 && (
        <div className="px-4 py-2 bg-muted/50 border-b border-border flex flex-wrap gap-2">
          {memberLocations.map((loc) => (
            <Badge key={loc.user_id} variant="outline" className="text-xs gap-1">
              <MapPin className="h-3 w-3 text-primary" />
              {loc.display_name}: {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
            </Badge>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isMe = msg.user_id === user?.id;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isMe ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"
                }`}>
                  {!isMe && (
                    <p className="text-xs font-medium mb-1 opacity-70">{msg.author_name}</p>
                  )}
                  {msg.message_type === "voice" && msg.file_path ? (
                    <audio src={getVoiceUrl(msg.file_path)} controls className="max-w-full h-8" />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  )}
                  <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {format(new Date(msg.created_at), "h:mm a")}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-card flex items-end gap-2">
        <Button
          size="icon"
          variant={recording ? "destructive" : "outline"}
          onClick={recording ? stopRecording : startRecording}
          className="shrink-0 h-10 w-10"
        >
          {recording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          rows={1}
          className="min-h-[40px] max-h-[120px] resize-none text-sm"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendTextMessage(); } }}
        />
        <Button
          size="icon"
          variant="hero"
          onClick={sendTextMessage}
          disabled={sending || !newMessage.trim()}
          className="shrink-0 h-10 w-10"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default GroupChat;
