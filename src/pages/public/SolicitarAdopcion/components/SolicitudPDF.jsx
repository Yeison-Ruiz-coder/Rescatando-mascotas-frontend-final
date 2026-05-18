// src/pages/public/SolicitarAdopcion/components/SolicitudPDF.jsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// ============================================
// COLORES MODO CLARO - COLORES GLOBALES
// ============================================
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  accent: '#ff8c42',
  heart: '#ff6b9d',
  success: '#2ecc71',
  danger: '#ff4757',
  warning: '#ffc107',
  text: '#1b202b',
  textMuted: '#39414d',
  textLight: '#7a8592',
  background: '#f7f2fc',
  cardBg: '#ffffff',
  border: 'rgba(0, 0, 0, 0.08)',
  dark: '#1b202b',
  gold: '#ff8c42',
};

// ============================================
// LOGO EN BASE64
// ============================================
const LOGO_BASE64 = 'https://res.cloudinary.com/dixyebg5i/image/upload/v1778998343/logo-oscuro.png_1_ndpy2u.png'; // <--- COLOCA AQUÍ TU BASE64

// ============================================
// FUNCIÓN PARA IMÁGENES DE MASCOTAS
// ============================================
const getCloudinaryUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `https://res.cloudinary.com/dixyebg5i/image/upload/w_80,h_80,c_fill/${imagePath}`;
};

const styles = StyleSheet.create({
  page: {
    padding: 35,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: COLORS.background,
  },
  
  header: {
    marginBottom: 25,
    padding: 20,
    backgroundColor: COLORS.dark,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  logoContainer: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.cardBg,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  
  logoImage: {
    width: 45,
    height: 45,
    objectFit: 'cover',
  },
  
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  
  headerTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  
  headerSubtitle: {
    fontSize: 7,
    color: COLORS.gold,
    marginTop: 3,
  },
  
  documentNumber: {
    fontSize: 8,
    color: COLORS.textMuted,
    backgroundColor: '#ffffff',
    padding: '6px 12px',
    borderRadius: 20,
  },
  
  // pageBreakInside: 'avoid' evita que se corten al cambiar de página
  card: {
    marginBottom: 14,
    padding: 14,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    pageBreakInside: 'avoid',
  },
  
  cardTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.primary,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    paddingLeft: 8,
  },
  
  row: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  
  label: {
    width: 95,
    fontWeight: 'bold',
    fontSize: 8,
    color: COLORS.textMuted,
  },
  
  value: {
    flex: 1,
    fontSize: 8,
    color: COLORS.text,
  },
  
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  
  badge: {
    padding: '3px 10px',
    borderRadius: 15,
    backgroundColor: COLORS.success,
    alignSelf: 'flex-end',
  },
  
  badgeText: {
    fontSize: 7,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  
  compromisoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
    padding: 6,
    backgroundColor: COLORS.background,
    borderRadius: 6,
  },
  
  compromisoCheck: {
    width: 14,
    height: 14,
    backgroundColor: COLORS.success,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  compromisoCheckText: {
    fontSize: 8,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  
  compromisoText: {
    fontSize: 8,
    color: COLORS.text,
    flex: 1,
  },
  
  footer: {
    marginTop: 25,
    padding: 12,
    backgroundColor: COLORS.dark,
    borderRadius: 12,
    alignItems: 'center',
    pageBreakInside: 'avoid',
  },
  
  footerText: {
    fontSize: 7,
    color: '#ffffff',
    marginBottom: 3,
    textAlign: 'center',
    opacity: 0.8,
  },
  
  footerHighlight: {
    fontSize: 8,
    color: COLORS.gold,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  divider: {
    height: 1,
    backgroundColor: COLORS.textLight,
    marginVertical: 8,
    opacity: 0.3,
  },
  
  mascotaSection: {
    marginBottom: 14,
    padding: 14,
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    pageBreakInside: 'avoid',
  },
  
  mascotaImage: {
    width: 55,
    height: 55,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  
  mascotaInfo: {
    flex: 1,
  },
  
  mascotaNombre: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 3,
  },
  
  mascotaDetalle: {
    fontSize: 7,
    color: '#ffffff',
    opacity: 0.85,
  },
});

const SolicitudPDF = ({ solicitud, mascota, formData }) => {
  const fecha = new Date().toLocaleDateString('es-ES');
  const mascotaInfo = mascota || solicitud?.solicitable || {};
  const mascotaImageUrl = getCloudinaryUrl(mascotaInfo?.foto_principal);
  
  // Verificar si hay logo base64
  const hasLogo = LOGO_BASE64 && LOGO_BASE64.trim() !== '';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              {hasLogo ? (
                <Image style={styles.logoImage} src={LOGO_BASE64} />
              ) : (
                <View style={styles.logoImage} />
              )}
            </View>
            <View>
              <Text style={styles.headerTitle}>RESCATANDO MASCOTAS FOREVER</Text>
              <Text style={styles.headerSubtitle}>Sanando su historia</Text>
            </View>
          </View>
          <View style={styles.badgeContainer}>
            <View style={styles.documentNumber}>
              <Text>N° {solicitud?.id || 'PENDIENTE'}</Text>
            </View>
          </View>
        </View>

        {/* Mascota */}
        <View style={styles.mascotaSection}>
          {mascotaImageUrl && (
            <Image style={styles.mascotaImage} src={mascotaImageUrl} />
          )}
          <View style={styles.mascotaInfo}>
            <Text style={styles.mascotaNombre}>{mascotaInfo?.nombre_mascota || 'Mascota'}</Text>
            <Text style={styles.mascotaDetalle}>
              {[mascotaInfo?.especie, mascotaInfo?.genero, mascotaInfo?.edad_aprox ? mascotaInfo.edad_aprox + ' años' : null]
                .filter(Boolean)
                .join(' • ')}
            </Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{solicitud?.estado || 'PENDIENTE'}</Text>
          </View>
        </View>

        {/* Datos Personales */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>DATOS PERSONALES</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre completo</Text>
            <Text style={styles.value}>{formData?.nombre} {formData?.apellido}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Documento</Text>
            <Text style={styles.value}>{formData?.documento_identidad}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{formData?.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Teléfono</Text>
            <Text style={styles.value}>{formData?.telefono}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Ocupación</Text>
            <Text style={styles.value}>{formData?.ocupacion || 'No especifica'}</Text>
          </View>
        </View>

        {/* Vivienda */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>INFORMACIÓN DE VIVIENDA</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Dirección</Text>
            <Text style={styles.value}>{formData?.direccion}, {formData?.ciudad}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tipo vivienda</Text>
            <Text style={styles.value}>
              {formData?.tipo_vivienda === 'casa' ? 'Casa' :
               formData?.tipo_vivienda === 'apartamento' ? 'Apartamento' :
               formData?.tipo_vivienda === 'finca' ? 'Finca' : 'No especifica'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Propietario</Text>
            <Text style={styles.value}>
              {formData?.es_propietario === 'si' ? 'Sí, propietario' : 
               formData?.es_propietario === 'no' ? 'Arrienda' : 
               formData?.es_propietario === 'familiar' ? 'Vivienda familiar' : 'No especifica'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Hijos</Text>
            <Text style={styles.value}>{formData?.cantidad_hijos || '0'}</Text>
          </View>
        </View>

        {/* Experiencia */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>EXPERIENCIA CON MASCOTAS</Text>
          <Text style={styles.value}>{formData?.experiencia_mascotas || 'No especifica'}</Text>
        </View>

        {/* Motivo */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>MOTIVO DE ADOPCIÓN</Text>
          <Text style={styles.value}>{formData?.motivo_adopcion || 'No especifica'}</Text>
        </View>

        {/* Compromisos */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>COMPROMISOS ACEPTADOS</Text>
          <View style={styles.compromisoItem}>
            <View style={styles.compromisoCheck}>
              <Text style={styles.compromisoCheckText}>✓</Text>
            </View>
            <Text style={styles.compromisoText}>Brindar cuidado responsable y bienestar al animal</Text>
          </View>
          <View style={styles.compromisoItem}>
            <View style={styles.compromisoCheck}>
              <Text style={styles.compromisoCheckText}>✓</Text>
            </View>
            <Text style={styles.compromisoText}>Esterilización para evitar reproducción no deseada</Text>
          </View>
          <View style={styles.compromisoItem}>
            <View style={styles.compromisoCheck}>
              <Text style={styles.compromisoCheckText}>✓</Text>
            </View>
            <Text style={styles.compromisoText}>Permitir seguimiento post-adopción</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Este documento es un resumen de tu solicitud de adopción.</Text>
          <Text style={styles.footerText}>Fecha: {fecha}</Text>
          <View style={styles.divider} />
          <Text style={styles.footerHighlight}>Rescatando Mascotas Forever - Sanando su historia</Text>
        </View>
      </Page>
    </Document>
  );
};

export default SolicitudPDF;