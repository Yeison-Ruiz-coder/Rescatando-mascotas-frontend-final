// src/globals.js
import { Buffer } from 'buffer';

// Hacer Buffer disponible globalmente
window.Buffer = Buffer;
globalThis.Buffer = Buffer;