import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "@/lib/api"; // ← use your configured api instance

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) { setStatus("error"); return; }

    api.get(`/api/auth/verify-email/?token=${token}`)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {status === "loading" && <p>Verifying your email...</p>}
      {status === "success" && (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Email Verified!</h1>
          <p className="text-muted-foreground mb-4">You can now sign in to MindSpace.</p>
          <Link to="/login" className="text-primary hover:underline">Go to Login</Link>
        </div>
      )}
      {status === "error" && (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Invalid Link</h1>
          <p className="text-muted-foreground">This verification link is invalid or already used.</p>
        </div>
      )}
    </div>
  );
};

export default VerifyEmailPage;