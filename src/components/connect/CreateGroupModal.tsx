import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Users, Plane } from "lucide-react";

interface Trip {
  id: string;
  title: string;
  destination: string;
}

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const CreateGroupModal = ({ open, onOpenChange, onCreated }: CreateGroupModalProps) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [groupType, setGroupType] = useState("custom");
  const [tripId, setTripId] = useState<string>("");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) fetchTrips();
  }, [open, user]);

  const fetchTrips = async () => {
    const { data } = await supabase
      .from("saved_trips")
      .select("id, title, destination")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    if (data) setTrips(data);
  };

  const handleCreate = async () => {
    if (!name.trim() || !user) return;
    setLoading(true);

    const { data: group, error } = await supabase
      .from("connect_groups")
      .insert({
        name: name.trim(),
        description: description.trim(),
        group_type: groupType,
        created_by: user.id,
        trip_id: groupType === "trip" && tripId ? tripId : null,
      })
      .select()
      .single();

    if (error || !group) {
      toast({ title: "Failed to create group", variant: "destructive" });
      setLoading(false);
      return;
    }

    // Add creator as admin member
    await supabase.from("connect_group_members").insert({
      group_id: group.id,
      user_id: user.id,
      role: "admin",
    });

    toast({ title: "Group created!" });
    setName("");
    setDescription("");
    setGroupType("custom");
    setTripId("");
    setLoading(false);
    onOpenChange(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Create a Group</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Group Type</Label>
            <Select value={groupType} onValueChange={setGroupType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">
                  <span className="flex items-center gap-2"><Users className="h-4 w-4" /> Custom Group</span>
                </SelectItem>
                <SelectItem value="trip">
                  <span className="flex items-center gap-2"><Plane className="h-4 w-4" /> Trip-based Group</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {groupType === "trip" && (
            <div>
              <Label>Link to Trip</Label>
              <Select value={tripId} onValueChange={setTripId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a trip" />
                </SelectTrigger>
                <SelectContent>
                  {trips.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.title} — {t.destination}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Group Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="E.g. Bali Trip Crew" maxLength={100} />
          </div>

          <div>
            <Label>Description (optional)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this group about?" rows={2} maxLength={500} />
          </div>

          <Button onClick={handleCreate} disabled={loading || !name.trim()} className="w-full" variant="hero">
            {loading ? "Creating..." : "Create Group"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModal;
