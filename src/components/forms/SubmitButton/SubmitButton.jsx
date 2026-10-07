"use client";

import { useFormStatus } from "react-dom";
import Button from "@/components/ui/Button/Button";

export default function SubmitButton({ children, pendingText = "Submitting...", className = "", variant = "solid", disabled = false }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;
  return (
    <Button type="submit" variant={variant} disabled={isDisabled} aria-disabled={isDisabled} className={`${isDisabled ? "cursor-wait opacity-70" : ""} ${className}`}>
      {isDisabled ? pendingText : children}
    </Button>
  );
}
