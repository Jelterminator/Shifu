import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BORDER_RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { useThemeStore } from '../../stores/themeStore';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = true,
}) => {
  const { colors, phaseColor } = useThemeStore();

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
          
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }]} 
              onPress={onCancel}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>{cancelLabel}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                  styles.button, 
                  { backgroundColor: isDestructive ? '#FF3B30' : phaseColor }
              ]} 
              onPress={onConfirm}
            >
              <Text style={[styles.buttonText, { color: '#FFF' }]}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
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
    padding: SPACING.l,
  },
  container: {
    width: '100%',
    maxWidth: 320,
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.l,
    ...SHADOWS.level3,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: SPACING.s,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: SPACING.l,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    gap: SPACING.m,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.m,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
