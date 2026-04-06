// src/pages/public/SolicitarAdopcion/components/SolicitudPDF.jsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    borderBottom: 2,
    borderBottomColor: '#667eea',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
  },
  section: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#667eea',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 100,
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
  },
  footer: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 8,
    color: '#999',
  },
});

const SolicitudPDF = ({ solicitud, mascota, formData }) => {
  const fecha = new Date().toLocaleDateString('es-ES');
  
  // Usar información de mascota si está disponible, sino de solicitud
  const mascotaInfo = mascota || solicitud?.solicitable || {};

  console.log('PDF - Mascota info:', mascotaInfo);
  console.log('PDF - Form data:', formData);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Solicitud de Adopción</Text>
          <Text style={styles.subtitle}>Rescatando Mascotas Forever</Text>
          <Text style={styles.subtitle}>N° Solicitud: {solicitud?.id || 'PENDIENTE'}</Text>
          <Text style={styles.subtitle}>Fecha: {fecha}</Text>
        </View>

        {/* Mascota */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mascota</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.value}>{mascotaInfo?.nombre_mascota || mascotaInfo?.nombre || 'No especificado'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Especie:</Text>
            <Text style={styles.value}>{mascotaInfo?.especie || 'No especificada'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Género:</Text>
            <Text style={styles.value}>{mascotaInfo?.genero || 'No especificado'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Edad:</Text>
            <Text style={styles.value}>{mascotaInfo?.edad_aprox || '?'} años</Text>
          </View>
        </View>

        {/* Datos Personales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos Personales</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre completo:</Text>
            <Text style={styles.value}>
              {formData?.nombre} {formData?.apellido}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Documento:</Text>
            <Text style={styles.value}>{formData?.documento_identidad || solicitud?.numero_documento || 'No especificado'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{formData?.email || solicitud?.email_solicitante || 'No especificado'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Teléfono:</Text>
            <Text style={styles.value}>{formData?.telefono || solicitud?.telefono_solicitante || 'No especificado'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Ocupación:</Text>
            <Text style={styles.value}>{formData?.ocupacion || 'No especifica'}</Text>
          </View>
        </View>

        {/* Vivienda */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de Vivienda</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Dirección:</Text>
            <Text style={styles.value}>{formData?.direccion}, {formData?.ciudad}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tipo de vivienda:</Text>
            <Text style={styles.value}>{formData?.tipo_vivienda}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Propietario:</Text>
            <Text style={styles.value}>
              {formData?.es_propietario === 'si' ? 'Sí' : 
               formData?.es_propietario === 'no' ? 'Arrienda' : 
               formData?.es_propietario === 'familiar' ? 'Vivienda familiar' : 'No especifica'}
            </Text>
          </View>
        </View>

        {/* Experiencia y Motivo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experiencia y Motivo</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Experiencia:</Text>
          </View>
          <Text>{formData?.experiencia_mascotas}</Text>
          <View style={{ marginTop: 8 }}>
            <Text style={styles.label}>Motivo:</Text>
          </View>
          <Text>{formData?.motivo_adopcion}</Text>
        </View>

        {/* Compromisos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compromisos Aceptados</Text>
          <Text>- Compromiso de cuidado responsable</Text>
          <Text>- Compromiso de esterilización</Text>
          <Text>- Compromiso de seguimiento</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Este documento es un resumen de tu solicitud de adopción.</Text>
          <Text>La fundación se pondrá en contacto contigo en los próximos días.</Text>
          <Text>© {new Date().getFullYear()} Rescatando Mascotas Forever</Text>
        </View>
      </Page>
    </Document>
  );
};

export default SolicitudPDF;