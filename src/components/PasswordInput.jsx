import React, { useState } from "react";
import { EyeIcon, EyeOffIcon, CheckIcon, AlertCircleIcon, KeyIcon } from "./Icons";

function calculateStrength(pwd) {
  if (!pwd) return { score: 0, label: "AWAITING INPUT", barClass: "bg-[var(--border-medium)]", textClass: "text-[var(--text-muted)]", xp: "0 / 100" };
  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (pwd.length >= 14) score += 1;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

  if (score <= 1) return { score: 1, label: "LOW ENTROPY", barClass: "bg-[var(--accent-crimson)] shadow-[0_0_8px_var(--accent-crimson)]", textClass: "text-[var(--accent-crimson-text)]", xp: "25 / 100" };
  if (score <= 3) return { score: 2, label: "MODERATE ENTROPY", barClass: "bg-[var(--accent-amber)] shadow-[0_0_8px_var(--accent-amber)]", textClass: "text-[var(--accent-amber-text)]", xp: "65 / 100" };
  return { score: 3, label: "CRYPTOGRAPHICALLY SECURE", barClass: "bg-[var(--accent-brass)] shadow-[0_0_10px_var(--accent-brass)]", textClass: "text-[var(--accent-brass-text)]", xp: "100 / 100" };
}

export default function PasswordInput({
  password,
  onPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  showConfirmation = false,
  label = "Encryption Password",
  idPrefix = "pwd"
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = calculateStrength(password);
  const passwordsMatch = showConfirmation && password && confirmPassword && password === confirmPassword;
  const passwordsMismatch = showConfirmation && confirmPassword && password !== confirmPassword;

  return (
    <div className="space-y-3.5">
      {/* Primary Password Field */}
      <div>
        <label htmlFor={`${idPrefix}-main`} className="flex items-center justify-between text-xs font-mono-technical font-medium text-[var(--text-secondary)] mb-1.5">
          <div className="flex items-center gap-1.5">
            <KeyIcon size={13} className="text-[var(--accent-brass)]" />
            <span className="uppercase tracking-wider">{label}</span>
          </div>
          {password.length > 0 && (
            <span className={`text-[10px] font-mono-technical tracking-wider font-bold ${strength.textClass}`}>
              {strength.label} · {strength.xp}
            </span>
          )}
        </label>

        <div className="relative">
          <input
            id={`${idPrefix}-main`}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="Enter passphrase (min 8 characters)..."
            className="w-full h-10 px-3 pr-10 text-xs font-mono-technical bg-[var(--bg-inset)] border border-[var(--border-medium)] cyber-cut-corner-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-brass)] focus:ring-1 focus:ring-[var(--accent-brass)] focus:shadow-[0_0_12px_rgba(0,255,136,0.3)] transition-all"
            autoComplete="new-password"
          />
          <button
            type="button"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--accent-brass)] transition-colors p-1"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
          </button>
        </div>

        {/* High-Tech XP Entropy Meter (Inspired by Reference XP Level Bar) */}
        {password.length > 0 && (
          <div className="space-y-1 mt-2">
            <div className="h-1.5 w-full bg-[var(--bg-inset)] cyber-cut-corner-sm border border-[var(--border-subtle)] overflow-hidden p-[1px] flex gap-1">
              <div className={`h-full flex-1 transition-all duration-300 rounded-[1px] ${strength.score >= 1 ? strength.barClass : "bg-[var(--border-subtle)]"}`} />
              <div className={`h-full flex-1 transition-all duration-300 rounded-[1px] ${strength.score >= 2 ? strength.barClass : "bg-[var(--border-subtle)]"}`} />
              <div className={`h-full flex-1 transition-all duration-300 rounded-[1px] ${strength.score >= 3 ? strength.barClass : "bg-[var(--border-subtle)]"}`} />
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Password Field */}
      {showConfirmation && (
        <div>
          <label htmlFor={`${idPrefix}-confirm`} className="flex items-center justify-between text-xs font-mono-technical font-medium text-[var(--text-secondary)] mb-1.5">
            <div className="flex items-center gap-1.5">
              <CheckIcon size={13} className="text-[var(--accent-brass)]" />
              <span className="uppercase tracking-wider">CONFIRM PASSPHRASE</span>
            </div>
            {passwordsMatch && (
              <span className="text-[10px] font-mono-technical text-[var(--accent-brass-text)] flex items-center gap-1 font-bold">
                <CheckIcon size={11} /> MATCH VERIFIED
              </span>
            )}
            {passwordsMismatch && (
              <span className="text-[10px] font-mono-technical text-[var(--accent-crimson-text)] flex items-center gap-1 font-bold">
                <AlertCircleIcon size={11} /> MISMATCH DETECTED
              </span>
            )}
          </label>

          <div className="relative">
            <input
              id={`${idPrefix}-confirm`}
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              placeholder="Re-enter passphrase to verify..."
              className={`w-full h-10 px-3 pr-10 text-xs font-mono-technical bg-[var(--bg-inset)] border cyber-cut-corner-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none transition-all ${
                passwordsMismatch
                  ? "border-[var(--accent-crimson)] focus:ring-1 focus:ring-[var(--accent-crimson)] focus:shadow-[0_0_12px_rgba(255,42,85,0.3)]"
                  : passwordsMatch
                  ? "border-[var(--accent-brass)] focus:ring-1 focus:ring-[var(--accent-brass)] focus:shadow-[0_0_12px_rgba(0,255,136,0.3)]"
                  : "border-[var(--border-medium)] focus:border-[var(--accent-brass)] focus:ring-1 focus:ring-[var(--accent-brass)] focus:shadow-[0_0_12px_rgba(0,255,136,0.3)]"
              }`}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--accent-brass)] transition-colors p-1"
              onClick={() => setShowConfirm(!showConfirm)}
              title={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
