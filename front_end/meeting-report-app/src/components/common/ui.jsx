import { motion } from "framer-motion";
import { cn } from "../../utils";

export function Page({ children, className = "" }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className={cn("space-y-6", className)}
    >
      {children}
    </motion.section>
  );
}

export function Card({ children, className = "" }) {
  return <div className={cn("card-shell", className)}>{children}</div>;
}

export function Button({ children, className = "", variant = "primary", ...props }) {
  return (
    <button className={cn("btn", variant === "ghost" ? "btn-ghost" : "btn-primary", className)} {...props}>
      {children}
    </button>
  );
}

export function Input(props) {
  return <input {...props} className={cn("input-shell", props.className)} />;
}

export function Select(props) {
  return <select {...props} className={cn("input-shell", props.className)} />;
}
