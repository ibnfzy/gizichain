import {
  FlatList,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { AppButton, ChatBubble, InfoCard } from '@/components/ui';
import { colors, globalStyles, spacing, typography } from '@/styles';

type ConversationMessage = {
  id: string;
  message: string;
  sender: 'mentor' | 'user';
  time: string;
};

const SAMPLE_CONVERSATION: ConversationMessage[] = [
  {
    id: '1',
    message: 'Halo, Bu Siti! Bagaimana kondisi harian dan nafsu makan Anda minggu ini?',
    sender: 'mentor',
    time: '08.12',
  },
  {
    id: '2',
    message: 'Halo Bu Bidan, saya masih mudah lelah dan makan jadi lebih sedikit.',
    sender: 'user',
    time: '08.13',
  },
  {
    id: '3',
    message: 'Baik, coba tambahkan camilan tinggi protein seperti edamame atau telur rebus ya.',
    sender: 'mentor',
    time: '08.14',
  },
  {
    id: '4',
    message: 'Baik, akan saya coba sore ini. Terima kasih 🙏',
    sender: 'user',
    time: '08.15',
  },
];

export function ChatScreen() {
  const screenStyle = globalStyles.screen as StyleProp<ViewStyle>;

  return (
    <View style={screenStyle}>
      <FlatList
        data={SAMPLE_CONVERSATION}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Chat dengan Pakar</Text>
            <Text style={styles.subtitle}>
              Gunakan percakapan ini untuk memantau perkembangan dan konsultasi singkat kapan pun.
            </Text>

            <InfoCard title="Tips komunikasi" variant="pastel" style={styles.tipCard}>
              <Text style={styles.tipText}>
                Sampaikan keluhan secara spesifik dan laporkan perubahan berat badan mingguan untuk rekomendasi
                lebih akurat.
              </Text>
            </InfoCard>
          </View>
        }
        renderItem={({ item }) => (
          <ChatBubble
            message={item.message}
            timestamp={item.time}
            direction={item.sender === 'user' ? 'right' : 'left'}
            variant={item.sender === 'mentor' ? 'mentor' : 'user'}
          />
        )}
        ListFooterComponent={<AppButton label="Tulis Pertanyaan" variant="pastel" style={styles.askButton} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  } as ViewStyle,
  header: {
    gap: spacing.sm,
  } as ViewStyle,
  title: {
    ...typography.heading2,
    color: colors.textPrimary,
  } as TextStyle,
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 22,
    marginTop: spacing.xs,
  } as TextStyle,
  tipCard: {
    marginTop: spacing.lg,
  } as ViewStyle,
  tipText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  } as TextStyle,
  askButton: {
    marginTop: spacing.lg,
  } as ViewStyle,
});
