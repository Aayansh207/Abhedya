import React, { useState } from "react";
import { EyeIcon, EyeOffIcon, LockIcon, CheckIcon, AlertCircleIcon } from "./Icons";

function calculateStrength(pwd) {
  if (!pwd) return { score: 0, label: "Empty", color: "#6b7280" };
  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (pwd.length >= 14) score += 1;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

  if (score <= 1) return { score: 1, label: "Weak", color: "#ef4444" };
  if (score <= 3) return { score: 2, label: "Moderate", color: "#f59e0b" };
  return { score: 3, label: "Strong", color: "#10b981" };
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
    <div className="password-input-group">
      <div className="form-field">
        <label htmlFor={`${idPrefix}-main`} className="field-label">
          <LockIcon size={16} />
          <span>{label}</span>
        </label>
        <div className="input-with-adornment">
          <input
            id={`${idPrefix}-main`}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="Enter strong password (min 8 chars)..."
            className="text-input"
            autoComplete="new-password"
          />
          <button
            type="button"
            className="btn-adornment"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
          </button>
        </div>

        {password.length > 0 && (
          <div className="password-strength-container">
            <div className="strength-bars">
              <span className={`bar ${strength.score >= 1 ? "active" : ""}`} style={{ backgroundColor: strength.score >= 1 ? strength.color : undefined }} />
              <span className={`bar ${strength.score >= 2 ? "active" : ""}`} style={{ backgroundColor: strength.score >= 2 ? strength.color : undefined }} />
              <span className={`bar ${strength.score >= 3 ? "active" : ""}`} style={{ backgroundColor: strength.score >= 3 ? strength.color : undefined }} />
            </div>
            <span className="strength-label" style={{ color: strength.color }}>
              {strength.label}
            </span>
          </div>
        )}
      </div>

      {showConfirmation && (
        <div className="form-field mt-3">
          <label htmlFor={`${idPrefix}-confirm`} className="field-label">
            <CheckIcon size={16} />
            <span>Confirm Password</span>
          </label>
          <div className="input-with-adornment">
            <input
              id={`${idPrefix}-confirm`}
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              placeholder="Re-enter password to confirm..."
              className={`text-input ${passwordsMismatch ? "input-error" : passwordsMatch ? "input-success" : ""}`}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="btn-adornment"
              onClick={() => setShowConfirm(!showConfirm)}
              title={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            </button>
          </div>

          {passwordsMatch && (
            <div className="match-status match-success">
              <CheckIcon size={14} />
              <span>Passwords match</span>
            </div>
          )}
          {passwordsMismatch && (
            <div className="match-status match-error">
              <AlertCircleIcon size={14} />
              <span>Passwords do not match</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
