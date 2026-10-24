import React, { useState } from "react";
import { EyeIcon, EyeOffIcon, CheckIcon, AlertCircleIcon, KeyIcon } from "./Icons";

function calculateStrength(pwd) {
  if (!pwd) return { score: 0, label: "Empty", barClass: "bg-[var(--border-medium)]", textClass: "text-[var(--text-muted)]" };
  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (pwd.length >= 14) score += 1;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

  if (score <= 1) return { score: 1, label: "Weak Entropy", barClass: "bg-[var(--accent-crimson)]", textClass: "text-[var(--accent-crimson-text)]" };
  if (score <= 3) return { score: 2, label: "Moderate Entropy", barClass: "bg-[var(--accent-amber)]", textClass: "text-[var(--accent-amber-text)]" };
  return { score: 3, label: "Cryptographically Strong", barClass: "bg-[var(--accent-jade)]", textClass: "text-[var(--accent-jade-text)]" };
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
        <label htmlFor={`${idPrefix}-main`} className="flex items-center justify-between text-xs font-mono font-medium text-[var(--text-secondary)] mb-1.5">
          <div className="flex items-center gap-1.5">
            <KeyIcon size={13} className="text-[var(--accent-brass)]" />
            <span>{label}</span>
          </div>
          {password.length > 0 && (
            <span className={`text-[10px] font-mono tracking-tight font-semibold ${strength.textClass}`}>
              {strength.label}
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
            className="w-full h-10 px-3 pr-10 text-xs font-mono bg-[var(--bg-inset)] border border-[var(--border-medium)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-brass)] focus:ring-1 focus:ring-[var(--accent-brass-border)] transition-all"
            autoComplete="new-password"
          />
          <button
            type="button"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1 rounded"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
          </button>
        </div>

        {/* 3-Segment Strength Meter */}
        {password.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${strength.score >= 1 ? strength.barClass : "bg-[var(--border-subtle)]"}`} />
            <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${strength.score >= 2 ? strength.barClass : "bg-[var(--border-subtle)]"}`} />
            <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${strength.score >= 3 ? strength.barClass : "bg-[var(--border-subtle)]"}`} />
          </div>
        )}
      </div>

      {/* Confirmation Password Field */}
      {showConfirmation && (
        <div>
          <label htmlFor={`${idPrefix}-confirm`} className="flex items-center justify-between text-xs font-mono font-medium text-[var(--text-secondary)] mb-1.5">
            <div className="flex items-center gap-1.5">
              <CheckIcon size={13} className="text-[var(--accent-brass)]" />
              <span>Confirm Password</span>
            </div>
            {passwordsMatch && (
              <span className="text-[10px] font-mono text-[var(--accent-jade-text)] flex items-center gap-1 font-semibold">
                <CheckIcon size={11} /> Matches
              </span>
            )}
            {passwordsMismatch && (
              <span className="text-[10px] font-mono text-[var(--accent-crimson-text)] flex items-center gap-1 font-semibold">
                <AlertCircleIcon size={11} /> Mismatch
              </span>
            )}
          </label>

          <div className="relative">
            <input
              id={`${idPrefix}-confirm`}
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              placeholder="Re-enter password to verify..."
              className={`w-full h-10 px-3 pr-10 text-xs font-mono bg-[var(--bg-inset)] border rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none transition-all ${
                passwordsMismatch
                  ? "border-[var(--accent-crimson)] focus:ring-1 focus:ring-[var(--accent-crimson-border)]"
                  : passwordsMatch
                  ? "border-[var(--accent-jade)] focus:ring-1 focus:ring-[var(--accent-jade-border)]"
                  : "border-[var(--border-medium)] focus:border-[var(--accent-brass)] focus:ring-1 focus:ring-[var(--accent-brass-border)]"
              }`}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1 rounded"
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
