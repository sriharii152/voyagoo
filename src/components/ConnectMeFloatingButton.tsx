import { Link } from "react-router-dom";
import { Handshake } from "lucide-react";
import { motion } from "framer-motion";

const ConnectMeFloatingButton = () => {
  return (
    <Link to="/connect" className="fixed top-20 left-4 z-40">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative group"
      >
        {/* Pulsing ring */}
        <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />

        {/* Button */}
        <div className="relative h-14 w-14 rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg flex items-center justify-center border-2 border-background">
          <Handshake className="h-6 w-6 text-primary-foreground" />
        </div>

        {/* Label tooltip */}
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-lg bg-card border border-border shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          <span className="text-sm font-display font-semibold text-foreground">ConnectMe</span>
          <p className="text-[10px] text-muted-foreground">Chat · Voice · Location</p>
        </div>
      </motion.div>
    </Link>
  );
};

export default ConnectMeFloatingButton;
