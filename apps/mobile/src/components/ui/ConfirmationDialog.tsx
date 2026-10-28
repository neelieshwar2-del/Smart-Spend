import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../common/Button';

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}) => {
  const { colors, radii, spacing, typography } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
        <View
          style={[
            styles.dialog,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radii.card,
              padding: spacing.xl,
            },
          ]}
        >
          {destructive && (
            <View style={[styles.iconBox, { backgroundColor: colors.dangerLight, borderRadius: radii.pill }]}>
              <AlertTriangle size={24} color={colors.danger} />
            </View>
          )}

          <Text style={[typography.title, { color: colors.textPrimary, textAlign: 'center', marginTop: destructive ? 8 : 0 }]}>
            {title}
          </Text>

          <Text style={[typography.bodySm, { color: colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20 }]}>
            {message}
          </Text>

          <View style={[styles.actionsRow, { marginTop: spacing.xl }]}>
            <Button
              title={cancelText}
              onPress={onCancel}
              variant="outline"
              size="md"
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title={confirmText}
              onPress={onConfirm}
              variant={destructive ? 'danger' : 'primary'}
              size="md"
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconBox: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    width: '100%',
  },
});
