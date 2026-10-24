import React, { useState } from "react";
import { EyeIcon, EyeOffIcon, LockIcon, CheckIcon, AlertCircleIcon, KeyIcon } from "./Icons";

function calculateStrength(pwd) {
  if (!pwd) return { score: 0, label: "Empty", colorClass: "bg-zinc-700", textClass: "text-zinc-500" };
  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (pwd.length >= 14) score += 1;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

  if (score <= 1) return { score: 1, label: "Weak Entropy", colorClass: "bg-rose-500", textClass: "text-rose-400" };
  if (score <= 3) return { score: 2, label: "Moderate Entropy", colorClass: "bg-amber-500", textClass: "text-amber-400" };
  return { score: 3, label: "Cryptographically Strong", colorClass: "bg-[#10b981]", textClass: "text-[#34d399]" };
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
    <div className="space-y-4">
      {/* Primary Password Field */}
      <div>
        <label htmlFor={`${idPrefix}-main`} className="flex items-center justify-between text-xs font-mono font-medium text-zinc-300 mb-1.5">
          <div className="flex items-center gap-1.5">
            <KeyIcon size={14} className="text-[#c5a059]" />
            <span>{label}</span>
          </div>
          {password.length > 0 && (
            <span className={`text-[11px] font-mono tracking-tight ${strength.textClass}`}>
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
            className="w-full h-10 px-3.5 pr-10 text-xs font-mono bg-[#090b0e] border border-white/10 rounded-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]/40 transition-all"
            autoComplete="new-password"
          />
          <button
            type="button"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors p-1 rounded"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
          </button>
        </div>

        {/* Tactical 3-Segment Strength Meter */}
        {password.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${strength.score >= 1 ? strength.colorClass : "bg-white/10"}`} />
            <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${strength.score >= 2 ? strength.colorClass : "bg-white/10"}`} />
            <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${strength.score >= 3 ? strength.colorClass : "bg-white/10"}`} />
          </div>
        )}
      </div>

      {/* Confirmation Password Field */}
      {showConfirmation && (
        <div>
          <label htmlFor={`${idPrefix}-confirm`} className="flex items-center justify-between text-xs font-mono font-medium text-zinc-300 mb-1.5">
            <div className="flex items-center gap-1.5">
              <CheckIcon size={14} className="text-[#c5a059]" />
              <span>Confirm Password</span>
            </div>
            {passwordsMatch && (
              <span className="text-[11px] font-mono text-[#34d399] flex items-center gap-1">
                <CheckIcon size={12} /> Matches
              </span>
            )}
            {passwordsMismatch && (
              <span className="text-[11px] font-mono text-rose-400 flex items-center gap-1">
                <AlertCircleIcon size={12} /> Mismatch
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
              className={`w-full h-10 px-3.5 pr-10 text-xs font-mono bg-[#090b0e] border rounded-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none transition-all ${
                passwordsMismatch
                  ? "border-rose-500/70 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30"
                  : passwordsMatch
                  ? "border-[#10b981]/70 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/30"
                  : "border-white/10 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]/40"
              }`}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors p-1 rounded"
              onClick={() => setShowConfirm(!showConfirm)}
              title={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
