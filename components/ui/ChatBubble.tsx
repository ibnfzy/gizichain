import { memo } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

import colors from '@/styles/colors';
import radius from '@/styles/radius';

export type ChatBubbleDirection = 'left' | 'right';

interface ChatBubbleProps extends ViewProps {
  message: string;
  direction?: ChatBubbleDirection;
  timestamp?: string;
  bubbleStyle?: StyleProp<ViewStyle>;
  messageStyle?: StyleProp<TextStyle>;
  timestampStyle?: StyleProp<TextStyle>;
}

const ChatBubbleComponent = ({
  message,
  direction = 'left',
  timestamp,
  style,
  bubbleStyle,
  messageStyle,
  timestampStyle,
  ...viewProps
}: ChatBubbleProps) => {
  const isRight = direction === 'right';

  return (
    <View
      style={[styles.container, isRight ? styles.alignRight : styles.alignLeft, style]}
      {...viewProps}
    >
      <View
        style={[styles.bubble, isRight ? styles.bubbleRight : styles.bubbleLeft, bubbleStyle]}
      >
        <Text style={[styles.message, isRight && styles.messageRight, messageStyle]}>{message}</Text>
        {timestamp ? (
          <Text
            style={[
              styles.timestamp,
              isRight ? styles.timestampRight : styles.timestampLeft,
              timestampStyle,
            ]}
          >
            {timestamp}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

export const ChatBubble = memo(ChatBubbleComponent);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 4,
  },
  alignLeft: {
    alignItems: 'flex-start',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '85%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.lg,
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  bubbleLeft: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 4,
  },
  bubbleRight: {
    backgroundColor: colors.primary,
    borderTopRightRadius: 4,
  },
  message: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  messageRight: {
    color: colors.card,
  },
  timestamp: {
    marginTop: 6,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'right',
  },
  timestampLeft: {
    color: colors.textMuted,
  },
  timestampRight: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
});
