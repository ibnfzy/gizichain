import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type ListRenderItem,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { AppTextInput, ChatBubble, InfoCard } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import {
  Consultation,
  ConsultationMessage,
  fetchConsultationMessages,
  fetchLatestConsultation,
  sendConsultationMessage,
} from '@/services/api';
import { colors, globalStyles, radius, spacing, typography } from '@/styles';

const SEND_DELAY_MS = 2000;

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const formatMessageTimestamp = (message: ConsultationMessage) => {
  if (message.humanize) {
    return message.humanize;
  }

  if (!message.createdAt) {
    return undefined;
  }

  const date = new Date(message.createdAt);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const getMessageAppearance = (sender: string) => {
  if (sender === 'ibu') {
    return { direction: 'right' as const, variant: 'ibu' as const };
  }

  if (sender === 'pakar') {
    return { direction: 'left' as const, variant: 'pakar' as const };
  }

  return { direction: 'left' as const, variant: 'system' as const };
};

export function ChatScreen() {
  const { motherId } = useAuth();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [conversationError, setConversationError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const listRef = useRef<FlatList<ConsultationMessage>>(null);
  const inputRef = useRef<TextInput>(null);

  const screenStyle = globalStyles.screen as StyleProp<ViewStyle>;
  const trimmedMessage = messageInput.trim();

  const loadConversation = useCallback(async () => {
    if (!motherId) {
      setConsultation(null);
      setMessages([]);
      return;
    }

    setLoading(true);
    setConversationError(null);
    setSendError(null);

    try {
      const latestConsultation = await fetchLatestConsultation({ motherId });
      setConsultation(latestConsultation);

      if (latestConsultation) {
        const fetchedMessages = await fetchConsultationMessages(latestConsultation.id);
        setMessages(fetchedMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.warn('Failed to load consultation', error);
      setConversationError('Tidak dapat memuat percakapan. Tarik ke bawah untuk mencoba lagi.');
      setConsultation(null);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [motherId]);

  const handleRefresh = useCallback(async () => {
    if (!motherId) {
      return;
    }

    setRefreshing(true);

    try {
      if (!consultation) {
        await loadConversation();
      } else {
        const fetchedMessages = await fetchConsultationMessages(consultation.id);
        setMessages(fetchedMessages);
        setConversationError(null);
      }
    } catch (error) {
      console.warn('Failed to refresh consultation', error);
      setConversationError('Tidak dapat memuat percakapan. Tarik ke bawah untuk mencoba lagi.');
    } finally {
      setRefreshing(false);
    }
  }, [consultation, loadConversation, motherId]);

  const handleSendMessage = useCallback(async () => {
    if (!consultation || sending) {
      return;
    }

    if (trimmedMessage.length === 0) {
      return;
    }

    setMessageInput('');
    setSendError(null);
    setSending(true);

    try {
      const sendPromise = sendConsultationMessage({
        consultationId: consultation.id,
        text: trimmedMessage,
      });

      const [sentMessage] = await Promise.all([
        sendPromise,
        delay(SEND_DELAY_MS),
      ]);

      setMessages((previous) => [...previous, sentMessage]);

      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
    } catch (error) {
      console.warn('Failed to send consultation message', error);
      setSendError('Pesan gagal dikirim. Coba lagi sebentar lagi.');
      setMessageInput(trimmedMessage);
      inputRef.current?.focus();
    } finally {
      setSending(false);
    }
  }, [consultation, trimmedMessage, sending]);

  const renderMessage = useCallback<ListRenderItem<ConsultationMessage>>(
    ({ item }) => {
      const { direction, variant } = getMessageAppearance(item.sender);

      return (
        <ChatBubble
          message={item.text}
          timestamp={formatMessageTimestamp(item)}
          direction={direction}
          variant={variant}
        />
      );
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      loadConversation();
    }, [loadConversation]),
  );

  useEffect(() => {
    if (!motherId) {
      setConsultation(null);
      setMessages([]);
    }
  }, [motherId]);

  useEffect(() => {
    if (!consultation) {
      setSendError(null);
    }
  }, [consultation]);

  useEffect(() => {
    if (messages.length === 0 || loading) {
      return;
    }

    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages, loading]);

  const isComposerDisabled =
    !consultation || sending || trimmedMessage.length === 0;

  const listRefreshControl = useMemo(() => {
    if (!consultation) {
      return undefined;
    }

    return (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
        tintColor={colors.primary}
        colors={[colors.primary]}
      />
    );
  }, [consultation, handleRefresh, refreshing]);

  const conversationContent = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Memuat percakapan...</Text>
        </View>
      );
    }

    if (!consultation) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>Sesi chat akan dimulai oleh pakar.</Text>
        </View>
      );
    }

    return (
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderMessage}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={listRefreshControl}
        ListEmptyComponent={
          <View style={styles.emptyMessageContainer}>
            <Text style={styles.emptyMessageText}>Belum ada pesan dalam sesi ini.</Text>
          </View>
        }
      />
    );
  }, [consultation, listRefreshControl, loading, messages, renderMessage]);

  const composer = useMemo(() => {
    if (!consultation) {
      return null;
    }

    return (
      <View style={styles.composerContainer}>
        <View style={styles.composerInputContainer}>
          <AppTextInput
            ref={inputRef}
            value={messageInput}
            onChangeText={setMessageInput}
            placeholder="Tulis pesan untuk pakar..."
            editable={!sending}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
            blurOnSubmit={false}
            containerStyle={styles.inputWrapper}
          />
        </View>
        <TouchableOpacity
          style={[styles.sendButton, isComposerDisabled && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={isComposerDisabled}
          accessibilityRole="button"
          accessibilityLabel="Kirim pesan"
        >
          {sending ? (
            <ActivityIndicator size="small" color={colors.textInverted} />
          ) : (
            <Feather name="send" size={20} color={colors.textInverted} />
          )}
        </TouchableOpacity>
      </View>
    );
  }, [consultation, handleSendMessage, isComposerDisabled, messageInput, sending]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={[screenStyle, styles.container]}>
        <View style={styles.header}>
          <Text style={styles.title}>Chat dengan Pakar</Text>
          <Text style={styles.subtitle}>
            Gunakan percakapan ini untuk memantau perkembangan dan konsultasi singkat kapan pun.
          </Text>

          <InfoCard title="Tips komunikasi" variant="pastel" style={styles.tipCard}>
            <Text style={styles.tipText}>
              Sampaikan keluhan secara spesifik dan laporkan perubahan berat badan mingguan untuk rekomendasi lebih
              akurat.
            </Text>
          </InfoCard>

          {conversationError ? <Text style={styles.errorText}>{conversationError}</Text> : null}
        </View>

        <View style={styles.conversationWrapper}>{conversationContent}</View>

        {composer}

        {consultation && sendError ? (
          <Text style={styles.errorText}>{sendError}</Text>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  } as ViewStyle,
  container: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
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
  conversationWrapper: {
    flex: 1,
  } as ViewStyle,
  listContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  } as ViewStyle,
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  } as ViewStyle,
  loadingText: {
    ...typography.body,
    color: colors.textMuted,
  } as TextStyle,
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  } as ViewStyle,
  emptyStateText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  } as TextStyle,
  emptyMessageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  } as ViewStyle,
  emptyMessageText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  } as TextStyle,
  composerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.sm,
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  } as ViewStyle,
  composerInputContainer: {
    flex: 1,
  } as ViewStyle,
  inputWrapper: {
    flex: 1,
  } as ViewStyle,
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  sendButtonDisabled: {
    backgroundColor: colors.border,
  } as ViewStyle,
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  } as TextStyle,
});
