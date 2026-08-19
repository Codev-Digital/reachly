// All client-side fetch wrappers for auth API routes

export const signUp = async (name: string, email: string,ref:string): Promise<any> => {
  // let body ; 
  //  if(ref.trim() === ""){
  //     body: JSON.stringify({ name, email }),
  //   }else{
  //     body: JSON.stringify({ name, email, ref }),
  //   } 
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: ref === null ? JSON.stringify({ name, email }) : JSON.stringify({ name, email, ref }),
  });
  return res.json();
};

export const verifyOTP = async (email: string, otp: string): Promise<any> => {
  const res = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  return res.json();
};

export const resendOTP = async (email: string): Promise<any> => {
  const res = await fetch('/api/auth/resend-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
};

export const setPassword = async (
  email: string,
  password: string,
  confirmPassword: string
): Promise<any> => {
  const res = await fetch('/api/auth/set-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, confirmPassword }),
  });
  return res.json();
};

export const forgotPassword = async (email: string): Promise<any> => {
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
};

export const resetPassword = async (
  email: string,
  otp: string,
  password: string,
  confirmPassword: string
): Promise<any> => {
  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, password, confirmPassword }),
  });
  return res.json();
};

export const requestChangeEmail = async (
  currentEmail: string,
  newEmail: string
): Promise<any> => {
  const res = await fetch('/api/auth/request-change-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentEmail, newEmail }),
  });
  return res.json();
};

export const verifyChangeEmail = async (
  currentEmail: string,
  otp: string
): Promise<any> => {
  const res = await fetch('/api/auth/verify-change-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentEmail, otp }),
  });
  return res.json();
};

// Password strength checker (client-side, mirrors server logic)
export const checkPasswordStrength = (
  password: string
): { strength: 'weak' | 'medium' | 'strong'; message: string } => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.match(/[A-Z]/)) score++;
  if (password.match(/[a-z]/)) score++;
  if (password.match(/[0-9]/)) score++;
  if (password.match(/[^A-Za-z0-9]/)) score++;

  if (score <= 2) {
    return {
      strength: 'weak',
      message:
        'Weak — use at least 8 characters with uppercase, lowercase, numbers, and special characters.',
    };
  } else if (score <= 3) {
    return {
      strength: 'medium',
      message: 'Medium — add more special characters for better security.',
    };
  } else {
    return { strength: 'strong', message: 'Strong password!' };
  }
};

export const updateCreatorProfile = async (formData: FormData): Promise<any> => {
  const res = await fetch('/api/creator-onboarding/step-2', {
    method: 'POST',
    body: formData,
  });
  return res.json();
};

export const getCurrentUser = async (): Promise<any> => {
  try {
    const res = await fetch('/api/user/me', {
      method: 'GET',
      cache: 'no-store',
    });
    if (!res.ok) {
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const updateSessionTypes = async (sessionTypes: any[]): Promise<any> => {
  try {
    const res = await fetch('/api/creator-onboarding/step-3', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionTypes }),
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    return { success: false, error: 'Failed to save session types' };
  }
};
