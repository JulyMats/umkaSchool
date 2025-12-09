export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  const phoneNumberRegex = /^\+[1-9]\d{1,14}$/;
  return phoneNumberRegex.test(phoneNumber);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  errors: string[];
} => {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  if (errors.length === 0) {
    strength = password.length >= 12 ? 'strong' : 'medium';
  }
  
  return {
    isValid: errors.length === 0,
    strength,
    errors
  };
};




export const validateEmail = (email: string): string | null => {
  if (!email || email.trim().length === 0) {
    return 'Email is required';
  }
  if (!isValidEmail(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

export const validateName = (name: string, fieldName: string = 'Name'): string | null => {
  if (!name || name.trim().length === 0) {
    return `${fieldName} is required`;
  }
  if (name.trim().length < 2) {
    return `${fieldName} must be at least 2 characters`;
  }
  if (name.trim().length > 50) {
    return `${fieldName} must be less than 50 characters`;
  }
  return null;
};


export const validateFirstName = (firstName: string): string | null => {
  return validateName(firstName, 'First name');
};


export const validateLastName = (lastName: string): string | null => {
  return validateName(lastName, 'Last name');
};


export const validateSurname = (surname: string): string | null => {
  return validateLastName(surname);
};

export const validatePhoneNumber = (phoneNumber: string): string | null => {
  if (!phoneNumber || phoneNumber.trim().length === 0) {
    return 'Phone number is required';
  }
  if (!isValidPhoneNumber(phoneNumber)) {
    return 'Please enter a valid phone number';
  }
  return null;
};

export const validateDateOfBirth = (dateOfBirth: string): string | null => {
  if (!dateOfBirth || dateOfBirth.trim().length === 0) {
    return 'Date of birth is required';
  }
  return null;
};

export const validateLoginPassword = (password: string): string | null => {
  if (!password || password.trim().length === 0) {
    return 'Password is required';
  }
  return null;
};

export const validateRegistrationPassword = (password: string): string | null => {
  if (!password || password.trim().length === 0) {
    return 'Password is required';
  }
  
  const validation = validatePassword(password);
  if (!validation.isValid) {
    return validation.errors[0]; 
  }
  
  return null;
};

export const validateBio = (bio: string): string | null => {
  if (!bio || bio.trim().length === 0) {
    return 'Bio is required';
  }
  if (bio.trim().length < 10) {
    return 'Bio must be at least 10 characters';
  }
  return null;
};

export const isValidNumber = (
  value: string | number,
  min?: number,
  max?: number
): boolean => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num) || !isFinite(num)) {
    return false;
  }
  
  if (min !== undefined && num < min) {
    return false;
  }
  
  if (max !== undefined && num > max) {
    return false;
  }
  
  return true;
};

