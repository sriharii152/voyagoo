import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Plane, Hash, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Group {
  id: string;
  name: string;
  group_type: string;
  invite_code: string;
  created_by: string;
}

interface GroupSidebarProps {
  groups: Group[];
  selectedGroupId: string | null;
  onSelectGroup: (id: string) => void;
  onCreateClick: () => void;
  onGroupsChanged: () => void;
}

const GroupSidebar = ({ groups, selectedGroupId, onSelectGroup, onCreateClick, onGroupsChanged }: GroupSidebarProps) => {
  const { user } = useAuth();
  const [inviteCode, setInviteCode] = useState("");
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (!inviteCode.trim() || !user) return;
    setJoining(true);

    // Find group by invite code
    const { data: group } = await supabase
      .from("connect_groups")
      .select("id")
      .eq("invite_code", inviteCode.trim())
      .single();

    if (!group) {
      toast({ title: "Invalid invite code", variant: "destructive" });
      setJoining(false);
      return;
    }

    const { error } = await supabase.from("connect_group_members").insert({
      group_id: group.id,
      user_id: user.id,
    });

    if (error) {
      if (error.code === "23505") {
        toast({ title: "You're already in this group" });
      } else {
        toast({ title: "Failed to join", variant: "destructive" });
      }
    } else {
      toast({ title: "Joined group!" });
      setInviteCode("");
      onGroupsChanged();
    }
    setJoining(false);
  };

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      <div className="p-4 border-b border-border">
        <h2 className="font-display font-bold text-foreground text-lg mb-3">Groups</h2>
        <Button onClick={onCreateClick} variant="hero" size="sm" className="w-full gap-2">
          <Plus className="h-4 w-4" /> New Group
        </Button>
      </div>

      {/* Join by code */}
      <div className="p-3 border-b border-border">
        <div className="flex gap-2">
          <Input
            placeholder="Invite code..."
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="text-sm h-9"
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          />
          <Button size="sm" variant="outline" onClick={handleJoin} disabled={joining} className="shrink-0 h-9">
            <LogIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Groups list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {groups.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">No groups yet. Create one or join with a code!</p>
        )}
        {groups.map((group) => (
          <button
            key={group.id}
            onClick={() => onSelectGroup(group.id)}
            className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center gap-3 ${
              selectedGroupId === group.id
                ? "bg-primary/10 text-primary"
                : "text-foreground hover:bg-muted"
            }`}
          >
            <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
              group.group_type === "trip" ? "bg-secondary/20 text-secondary" : "bg-primary/20 text-primary"
            }`}>
              {group.group_type === "trip" ? <Plane className="h-4 w-4" /> : <Users className="h-4 w-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{group.name}</p>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 mt-0.5">
                <Hash className="h-2.5 w-2.5 mr-0.5" />{group.invite_code}
              </Badge>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GroupSidebar;
