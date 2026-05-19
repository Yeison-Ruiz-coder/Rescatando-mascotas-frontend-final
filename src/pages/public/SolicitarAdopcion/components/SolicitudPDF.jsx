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
  white: '#ffffff',
  gold: '#ff8c42',
};

// ============================================
// LOGO EN BASE64
// ============================================
const LOGO_BASE64 = 'https://res.cloudinary.com/dixyebg5i/image/upload/v1778998343/logo-oscuro.png_1_ndpy2u.png';

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
    padding: 15,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 12,
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
  
  // ========== ESTILOS SIN CUADROS ==========
  section: {
    marginBottom: 18,
  },
  
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    paddingBottom: 3,
  },
  
  row: {
    flexDirection: 'row',
    marginBottom: 5,
    paddingVertical: 2,
  },
  
  label: {
    width: 100,
    fontWeight: 'bold',
    fontSize: 9,
    color: COLORS.textMuted,
  },
  
  value: {
    flex: 1,
    fontSize: 9,
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
    marginBottom: 6,
    gap: 8,
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
    fontSize: 9,
    color: COLORS.text,
    flex: 1,
  },
  
  // Footer SIMPLE y ESTÁTICO (sin recuadro)
  footer: {
    marginTop: 40,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.textLight,
    alignItems: 'center',
  },
  
  footerText: {
    fontSize: 7,
    color: COLORS.textMuted,
    marginBottom: 3,
    textAlign: 'center',
  },
  
  footerHighlight: {
    fontSize: 8,
    color: COLORS.primary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Sección de mascota SIN cuadro
  mascotaSection: {
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 3,
  },
  
  mascotaDetalle: {
    fontSize: 8,
    color: COLORS.textMuted,
  },
  
  textBlock: {
    fontSize: 9,
    color: COLORS.text,
    marginBottom: 5,
    lineHeight: 1.4,
  },
});

const SolicitudPDF = ({ solicitud, mascota, formData }) => {
  const fecha = new Date().toLocaleDateString('es-ES');
  const mascotaInfo = mascota || solicitud?.solicitable || {};
  const mascotaImageUrl = getCloudinaryUrl(mascotaInfo?.foto_principal);
  const hasLogo = LOGO_BASE64 && LOGO_BASE64.trim() !== '';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header - CON cuadro (solo este se mantiene) */}
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

        {/* Sección Mascota - SIN cuadro */}
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

        {/* DATOS PERSONALES - SIN cuadro */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATOS PERSONALES</Text>
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

        {/* VIVIENDA - SIN cuadro */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMACIÓN DE VIVIENDA</Text>
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

        {/* EXPERIENCIA - SIN cuadro */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EXPERIENCIA CON MASCOTAS</Text>
          <Text style={styles.textBlock}>{formData?.experiencia_mascotas || 'No especifica'}</Text>
        </View>

        {/* MOTIVO - SIN cuadro */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MOTIVO DE ADOPCIÓN</Text>
          <Text style={styles.textBlock}>{formData?.motivo_adopcion || 'No especifica'}</Text>
        </View>

        {/* COMPROMISOS - SIN cuadro */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>COMPROMISOS ACEPTADOS</Text>
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

        {/* Footer SIMPLE - SIN recuadro, solo línea superior */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Este documento es un resumen de tu solicitud de adopción.</Text>
          <Text style={styles.footerText}>Fecha: {fecha}</Text>
          <Text style={styles.footerHighlight}>Rescatando Mascotas Forever</Text>
        </View>
      </Page>
    </Document>
  );
};

export default SolicitudPDF;