import { useState } from "react";

interface UsePasswordVerificationResult {
  isVerified: boolean;
  isVerifying: boolean;
  error: string | null;
  verifyPassword: (password: string) => Promise<boolean>;
}

export function usePasswordVerification(): UsePasswordVerificationResult {
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyPassword = async (password: string): Promise<boolean> => {
    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch("/api/verify-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        throw new Error("Invalid password");
      }

      setIsVerified(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  return { isVerified, isVerifying, error, verifyPassword };
}
