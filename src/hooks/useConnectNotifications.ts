import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { MessageCircle } from "lucide-react";

interface UseConnectNotificationsOptions {
  /** The group ID currently being viewed (messages from this group are suppressed) */
  activeGroupId?: string | null;
}

const useConnectNotifications = ({ activeGroupId }: UseConnectNotificationsOptions = {}) => {
  const { user } = useAuth();
  const groupNamesRef = useRef<Record<string, string>>({});
  const activeGroupRef = useRef(activeGroupId);

  // Keep ref in sync
  useEffect(() => {
    activeGroupRef.current = activeGroupId;
  }, [activeGroupId]);

  useEffect(() => {
    if (!user) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setup = async () => {
      // Get all groups the user is in
      const { data: memberships } = await supabase
        .from("connect_group_members")
        .select("group_id")
        .eq("user_id", user.id);

      if (!memberships || memberships.length === 0) return;

      const groupIds = memberships.map((m) => m.group_id);

      // Cache group names
      const { data: groups } = await supabase
        .from("connect_groups")
        .select("id, name")
        .in("id", groupIds);

      if (groups) {
        groups.forEach((g) => { groupNamesRef.current[g.id] = g.name; });
      }

      // Subscribe to all new messages
      channel = supabase
        .channel("connect-notifications")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "connect_messages" },
          async (payload) => {
            const msg = payload.new as any;

            // Skip own messages and messages from the active group
            if (msg.user_id === user.id) return;
            if (msg.group_id === activeGroupRef.current) return;
            if (!groupIds.includes(msg.group_id)) return;

            // Get sender name
            const { data: profile } = await supabase
              .from("profiles")
              .select("display_name")
              .eq("user_id", msg.user_id)
              .single();

            const senderName = profile?.display_name || "Someone";
            const groupName = groupNamesRef.current[msg.group_id] || "a group";
            const preview = msg.message_type === "voice" ? "🎤 Voice message" : (msg.content?.slice(0, 60) || "");

            toast({
              title: `${senderName} in ${groupName}`,
              description: preview,
            });
          }
        )
        .subscribe();
    };

    setup();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [user]);
};

export default useConnectNotifications;
