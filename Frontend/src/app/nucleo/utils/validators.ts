import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador para emails corporativos (excluye dominios gratuitos comunes)
 */
export function corporateEmailValidator(): ValidatorFn {
  const freeEmailDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
    'live.com', 'icloud.com', 'aol.com', 'mail.com'
  ];

  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    const email = control.value.toLowerCase();
    const domain = email.split('@')[1];
    
    if (freeEmailDomains.includes(domain)) {
      return { corporateEmail: { message: 'Por favor, usa tu email corporativo' } };
    }
    
    return null;
  };
}

/**
 * Validador para teléfonos españoles
 */
export function spanishPhoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    const phone = control.value.replace(/\s/g, '');
    const spanishPhoneRegex = /^(\+34)?[6789]\d{8}$/;
    
    if (!spanishPhoneRegex.test(phone)) {
      return { spanishPhone: { message: 'Introduce un teléfono español válido' } };
    }
    
    return null;
  };
}

/**
 * Validador para URLs
 */
export function urlValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    try {
      new URL(control.value.startsWith('http') ? control.value : `https://${control.value}`);
      return null;
    } catch {
      return { invalidUrl: { message: 'Introduce una URL válida' } };
    }
  };
}

/**
 * Validador para que al menos N checkboxes estén seleccionados
 */
export function minSelectedValidator(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value || !Array.isArray(control.value)) return null;
    
    if (control.value.length < min) {
      return { minSelected: { required: min, actual: control.value.length } };
    }
    
    return null;
  };
}
