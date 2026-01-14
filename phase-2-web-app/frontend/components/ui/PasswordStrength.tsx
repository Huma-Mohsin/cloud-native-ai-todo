/**
 * Password Strength Indicator Component
 *
 * Visual indicator showing password strength (weak/medium/strong)
 */

'use client';

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const getStrength = (pwd: string): { level: number; label: string; color: string } => {
    let strength = 0;

    // Length check
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;

    // Character variety checks
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    if (strength <= 2) {
      return { level: 1, label: 'Weak', color: 'bg-red-500' };
    } else if (strength <= 4) {
      return { level: 2, label: 'Medium', color: 'bg-yellow-500' };
    } else {
      return { level: 3, label: 'Strong', color: 'bg-green-500' };
    }
  };

  const strength = getStrength(password);

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              level <= strength.level ? strength.color : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-400">
        Password strength: <span className="font-medium">{strength.label}</span>
      </p>
    </div>
  );
}
