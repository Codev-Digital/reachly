export interface PasswordCriterion {
  key: 'minLength' | 'upperAndLower' | 'number' | 'special';
  label: string;
  met: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0..4 (matches the 4-bar strength indicator)
  label: '' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  message: string;
  criteria: PasswordCriterion[];
}

/**
 * Evaluates password strength against the 4 security criteria:
 * at least 8 characters, uppercase + lowercase letters, a number, and a special character.
 */
export function validatePassword(password: unknown): PasswordValidationResult {
  const pw = typeof password === 'string' ? password : '';

  const criteria: PasswordCriterion[] = [
    { key: 'minLength', label: 'At least 8 characters', met: pw.length >= 8 },
    {
      key: 'upperAndLower',
      label: 'Uppercase & lowercase letters',
      met: /[A-Z]/.test(pw) && /[a-z]/.test(pw),
    },
    { key: 'number', label: 'At least one number', met: /[0-9]/.test(pw) },
    {
      key: 'special',
      label: 'At least one special character (e.g. @, #)',
      met: /[^A-Za-z0-9]/.test(pw),
    },
  ];

  const score = criteria.filter((c) => c.met).length;
  const isValid = score === criteria.length;

  let label: PasswordValidationResult['label'] = '';
  if (pw.length > 0) {
    if (score <= 1) label = 'Weak';
    else if (score === 2) label = 'Fair';
    else if (score === 3) label = 'Good';
    else label = 'Strong';
  }

  let message = '';
  if (!pw) {
    message = 'Please enter a new password.';
  } else if (!isValid) {
    const missing = criteria.filter((c) => !c.met).map((c) => c.label.toLowerCase());
    message = `Password must include: ${missing.join(', ')}.`;
  }

  return { isValid, score, label, message, criteria };
}
