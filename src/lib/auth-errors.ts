// src/lib/auth-errors.ts

type AuthErrorMap = {
    [key: string]: string;
};

const authErrorMap: AuthErrorMap = {
    'auth/invalid-email': 'El formato del correo electrónico no es válido.',
    'auth/user-not-found': 'No se encontró ninguna cuenta con este correo electrónico.',
    'auth/wrong-password': 'La contraseña es incorrecta. Por favor, inténtalo de nuevo.',
    'auth/email-already-in-use': 'Este correo electrónico ya está registrado. Por favor, inicia sesión.',
    'auth/weak-password': 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.',
    'auth/too-many-requests': 'Se ha bloqueado el acceso debido a demasiados intentos. Inténtalo más tarde.',
    'auth/network-request-failed': 'Error de red. Por favor, comprueba tu conexión a internet.',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
};

/**
 * Traduce un código de error de Firebase Auth a un mensaje amigable en español.
 * @param errorCode El código de error de Firebase (ej. 'auth/wrong-password').
 * @returns Un string con el mensaje de error en español.
 */
export function getFriendlyAuthErrorMessage(errorCode: string): string {
    return authErrorMap[errorCode] || 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
}
