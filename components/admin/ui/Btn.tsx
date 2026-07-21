"use client";

import type { LucideIcon } from "lucide-react";

interface BtnProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  icon?: LucideIcon;
  type?: "button" | "submit";
  disabled?: boolean;
  danger?: boolean;
}

export function Btn({
  children,
  onClick,
  variant = "secondary",
  size = "sm",
  icon: Icon,
  type = "button",
  disabled,
  danger,
}: BtnProps) {
  const v = danger ? "danger" : variant;
  return (
    <button
      type={type}
      className={`admin-btn ${v} ${size === "md" ? "md" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && <Icon size={13} />}
      {children}
    </button>
  );
}
