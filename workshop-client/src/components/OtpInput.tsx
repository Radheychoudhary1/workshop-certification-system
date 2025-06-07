import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../firebase";

interface OtpInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  type: "phone" | "email";
  setVerified: (verified: boolean) => void;
  setOtpError: React.Dispatch<React.SetStateAction<string>>;
  setOtpLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export default function OtpInput({
  label,
  value,
  onChange,
  name,
  type,
  setVerified,
  setOtpError,
  setOtpLoading,
}: OtpInputProps) {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setOtpError(error);
  }, [error]);

  useEffect(() => {
    setOtpLoading(loading || verifying);
  }, [loading, verifying]);

  const sendOtp = async () => {
    setError("");
    setVerified(false);
    setOtp("");
    setOtpSent(false);
    setLoading(true);

    if (!value) {
      setError(`Please enter a valid ${type}`);
      setLoading(false);
      return;
    }

    if (type === "phone") {
      try {
        if (!window.recaptchaVerifier) {
          window.recaptchaVerifier = new RecaptchaVerifier(
            auth,
            "recaptcha-container",
            {
              size: "invisible",
            }
          );
        }
        const appVerifier = window.recaptchaVerifier;
        const confirmationResult = await signInWithPhoneNumber(
          auth,
          value,
          appVerifier
        );
        setConfirmation(confirmationResult);
        setOtpSent(true);
      } catch (err) {
        console.error("Phone OTP error:", err);
        setError("Failed to send OTP to phone. Use +91XXXXXXXXXX format.");
      }
    } else {
      try {
        const res = await fetch("/sendEmailOtp", {
          method: "POST",
          body: JSON.stringify({ email: value }),
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          setOtpSent(true);
        } else {
          const data = await res.json();
          setError(data.message || "Failed to send OTP to email.");
        }
      } catch (err) {
        console.error("Email OTP error:", err);
        setError("Server error while sending email OTP.");
      }
    }

    setLoading(false);
  };

  const verifyOtp = async () => {
    setError("");
    setVerifying(true);

    if (!otp) {
      setError("Please enter the OTP.");
      setVerifying(false);
      return;
    }

    if (type === "phone" && confirmation) {
      try {
        await confirmation.confirm(otp);
        setVerified(true);
      } catch (err) {
        console.error("Phone OTP verification error:", err);
        setError("Invalid phone OTP.");
      }
    } else if (type === "email") {
      try {
        const res = await fetch("/verifyEmailOtp", {
          method: "POST",
          body: JSON.stringify({ email: value, otp }),
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          setVerified(true);
        } else {
          const data = await res.json();
          setError(data.message || "Invalid email OTP.");
        }
      } catch (err) {
        console.error("Email OTP verification error:", err);
        setError("Server error verifying email OTP.");
      }
    }

    setVerifying(false);
  };

  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <div className="d-flex gap-2 mb-2">
        <input
          type={type === "phone" ? "tel" : "email"}
          className="form-control"
          name={name}
          value={value}
          onChange={onChange}
          required
        />
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={sendOtp}
          disabled={loading || verifying}
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </div>

      {otpSent && (
        <div className="d-flex gap-2">
          <input
            type="text"
            placeholder="Enter OTP"
            className="form-control"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-outline-success"
            onClick={verifyOtp}
            disabled={verifying}
          >
            {verifying ? "Verifying..." : "Verify"}
          </button>
        </div>
      )}

      {error && <div className="text-danger mt-2">{error}</div>}

      {/* Invisible container for reCAPTCHA */}
      <div id="recaptcha-container"></div>
    </div>
  );
}
