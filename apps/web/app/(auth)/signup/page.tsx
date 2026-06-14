import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return <SignUpForm />;
}
