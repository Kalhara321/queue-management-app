import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface NextInLineModalProps {
  visible: boolean;
  onClose: () => void;
  queueName: string;
  tokenNumber: number;
}

const NextInLineModal = ({ visible, onClose, queueName, tokenNumber }: NextInLineModalProps) => {
  const { theme } = useTheme();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.iconWrapBg }]}>
            <MaterialCommunityIcons name="bell-ring" size={40} color="white" />
          </View>
          
          <Text style={[styles.title, { color: theme.colors.text }]}>You are Next!</Text>
          <Text style={[styles.message, { color: theme.colors.subText }]}>
            Your turn is approaching in the <Text style={{ fontWeight: 'bold' }}>{queueName}</Text> queue.
          </Text>
          
          <View style={[styles.tokenBadge, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.tokenLabel, { color: theme.colors.subText }]}>TOKEN</Text>
            <Text style={[styles.tokenValue, { color: theme.colors.iconWrapBg }]}>#{tokenNumber}</Text>
          </View>
          
          <Text style={[styles.instruction, { color: theme.colors.subText }]}>
            Please stay near the counter.
          </Text>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.colors.iconWrapBg }]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Got it!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -70,
    marginBottom: 20,
    borderWidth: 5,
    borderColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  tokenBadge: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  tokenLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  tokenValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  instruction: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 25,
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NextInLineModal;
