import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { useAccessibility } from '@/context/AccessibilityContext';

export interface PatientProfile {
  hn: string;
  fullName: string;
  dob?: string;
  gender?: string;
  idCard?: string;
  phone?: string;
}

interface DigitalPatientCardModalProps {
  visible: boolean;
  onClose: () => void;
  patient: PatientProfile | null;
}

export const DigitalPatientCardModal: React.FC<DigitalPatientCardModalProps> = ({
  visible,
  onClose,
  patient,
}) => {
  const { isLargeText } = useAccessibility();

  if (!patient) return null;

  const qrData = `KHH-HN:${patient.hn}|NAME:${patient.fullName}|STATUS:VERIFIED`;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.cardContainer}>
              {/* Header Badge */}
              <View style={styles.cardHeader}>
                <View style={styles.hospitalInfo}>
                  <Ionicons name="medical" size={20} color="#0D9488" />
                  <Text style={styles.hospitalName}>โรงพยาบาลคลองหาด</Text>
                </View>
                <View style={styles.offlineBadge}>
                  <Ionicons name="wifi-outline" size={12} color="#059669" />
                  <Text style={styles.offlineBadgeText}>พร้อมใช้ออฟไลน์</Text>
                </View>
              </View>

              <Text style={styles.cardTitle}>บัตรประจำตัวผู้ป่วยดิจิทัล</Text>

              {/* Patient Photo Avatar & Basic Info */}
              <View style={styles.patientProfileRow}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitial}>
                    {patient.fullName ? patient.fullName.charAt(0) : 'พ'}
                  </Text>
                </View>
                <View style={styles.patientInfoCol}>
                  <Text style={[styles.patientName, isLargeText && styles.largeText]}>
                    {patient.fullName}
                  </Text>
                  <View style={styles.hnTag}>
                    <Text style={styles.hnText}>HN: {patient.hn}</Text>
                  </View>
                </View>
              </View>

              {/* QR Code Container */}
              <View style={styles.qrContainer}>
                <QRCode value={qrData} size={170} color="#0F172A" backgroundColor="#FFFFFF" />
                <Text style={styles.qrInstruction}>
                  ยื่นคิวอาร์โค้ดนี้ให้เจ้าหน้าที่สแกนเข้าตรวจ OPD
                </Text>
              </View>

              {/* Footer Actions */}
              <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
                <Text style={styles.closeButtonText}>ปิดหน้าต่าง</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  hospitalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hospitalName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0D9488',
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  offlineBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
    textAlign: 'center',
  },
  patientProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 16,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  patientInfoCol: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  largeText: {
    fontSize: 19,
  },
  hnTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  hnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D9488',
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  qrInstruction: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 12,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
