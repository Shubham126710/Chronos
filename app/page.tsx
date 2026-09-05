"use client";

import React from "react";
import { LandingPage } from "../components/landing/LandingPage";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <LandingPage onEnterApp={() => router.push("/login")} />
  );
}
