"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button/Button";

export default function AuthButton({ className = "", onClick }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => { if (active) setUser(data.user); })
      .catch(() => { if (active) setUser(null); });
    return () => { active = false; };
  }, []);

  return (
    <Button href={user ? "/portal" : "/login"} variant="red" className={className} onClick={onClick}>
      {user ? "My Portal" : "Register / Login"}
    </Button>
  );
}
