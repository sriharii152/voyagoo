import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Link2, MessageCircle } from "lucide-react";
import useConnectNotifications from "@/hooks/useConnectNotifications";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import GroupSidebar from "@/components/connect/GroupSidebar";
import GroupChat from "@/components/connect/GroupChat";
import CreateGroupModal from "@/components/connect/CreateGroupModal";

interface Group {
  id: string;
  name: string;
  group_type: string;
  invite_code: string;
  created_by: string;
}

const ConnectMePage = () => {
  const { user, loading } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (user) fetchGroups();
  }, [user]);

  const fetchGroups = async () => {
    // Get groups the user is a member of
    const { data: memberships } = await supabase
      .from("connect_group_members")
      .select("group_id")
      .eq("user_id", user!.id);

    if (!memberships || memberships.length === 0) {
      setGroups([]);
      return;
    }

    const groupIds = memberships.map((m) => m.group_id);
    const { data } = await supabase
      .from("connect_groups")
      .select("id, name, group_type, invite_code, created_by")
      .in("id", groupIds)
      .order("created_at", { ascending: false });

    if (data) {
      setGroups(data);
      if (!selectedGroupId && data.length > 0) {
        setSelectedGroupId(data[0].id);
      }
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroupId || !confirm("Delete this group? All messages will be lost.")) return;
    const { error } = await supabase.from("connect_groups").delete().eq("id", selectedGroupId);
    if (error) {
      toast({ title: "Failed to delete", variant: "destructive" });
    } else {
      toast({ title: "Group deleted" });
      setSelectedGroupId(null);
      fetchGroups();
    }
  };

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 pt-16">
        {!user ? (
          <div className="container mx-auto px-4 py-20 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge variant="outline" className="mb-4 gap-1 text-primary border-primary/30">
                <Link2 className="h-3.5 w-3.5" /> ConnectMe
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Stay Connected With Your Travel Group
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                Group chat, voice messages, and live location sharing — all in one place.
              </p>
              <Link to="/auth">
                <Button variant="hero" size="lg">Sign In to Connect</Button>
              </Link>
            </motion.div>
          </div>
        ) : (
          <div className="h-[calc(100vh-4rem)] flex">
            {/* Sidebar */}
            <div className="w-72 shrink-0 border-r border-border">
              <GroupSidebar
                groups={groups}
                selectedGroupId={selectedGroupId}
                onSelectGroup={setSelectedGroupId}
                onCreateClick={() => setShowCreate(true)}
                onGroupsChanged={fetchGroups}
              />
            </div>

            {/* Chat area */}
            <div className="flex-1">
              {selectedGroup ? (
                <GroupChat
                  groupId={selectedGroup.id}
                  groupName={selectedGroup.name}
                  inviteCode={selectedGroup.invite_code}
                  isCreator={selectedGroup.created_by === user.id}
                  onDeleteGroup={handleDeleteGroup}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <MessageCircle className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">No group selected</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Create a new group or join one with an invite code
                  </p>
                  <Button variant="hero" onClick={() => setShowCreate(true)}>
                    Create Group
                  </Button>
                </div>
              )}
            </div>

            <CreateGroupModal open={showCreate} onOpenChange={setShowCreate} onCreated={fetchGroups} />
          </div>
        )}
      </div>
      {!user && <Footer />}
    </div>
  );
};

export default ConnectMePage;
