interface BadgeProps {
  children: React.ReactNode;
  color?: "purple" | "pink" | "gold" | "green" | "red" | "blue" | "gray";
}

export function Badge({ children, color = "gray" }: BadgeProps) {
  return <span className={`admin-badge ${color}`}>{children}</span>;
}
