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
import Animated, { FadeInUp } from 'react-native-reanimated';

import colors from '@/styles/colors';
import radius from '@/styles/radius';

export type ChatBubbleDirection = 'left' | 'right';
export type ChatBubbleVariant = 'ibu' | 'pakar' | 'system' | 'user' | 'mentor';

interface ChatBubbleProps extends ViewProps {
  message: string;
  direction?: ChatBubbleDirection;
  timestamp?: string;
  bubbleStyle?: StyleProp<ViewStyle>;
  messageStyle?: StyleProp<TextStyle>;
  timestampStyle?: StyleProp<TextStyle>;
  variant?: ChatBubbleVariant;
  role?: ChatBubbleVariant;
  animated?: boolean;
}

const ChatBubbleComponent = ({
  message,
  direction = 'left',
  timestamp,
  variant,
  role,
  animated = true,
  style,
  bubbleStyle,
  messageStyle,
  timestampStyle,
  ...viewProps
}: ChatBubbleProps) => {
  const isRight = direction === 'right';
  const resolvedVariant = variant ?? role ?? (isRight ? 'user' : 'pakar');
  const variantStyles = CHAT_BUBBLE_VARIANTS[resolvedVariant];

  const animationProps = animated
    ? { entering: FadeInUp.duration(220).springify().damping(18).stiffness(120) }
    : {};

  return (
    <View
      style={[styles.container, isRight ? styles.alignRight : styles.alignLeft, style]}
      {...viewProps}
    >
      <Animated.View
        {...animationProps}
        style={[
          styles.bubble,
          isRight ? styles.bubbleRight : styles.bubbleLeft,
          variantStyles.bubble,
          bubbleStyle,
        ]}
      >
        <Text
          style={[styles.message, isRight && styles.messageRight, variantStyles.message, messageStyle]}
        >
          {message}
        </Text>
        {timestamp ? (
          <Text
            style={[
              styles.timestamp,
              isRight ? styles.timestampRight : styles.timestampLeft,
              variantStyles.timestamp,
              timestampStyle,
            ]}
          >
            {timestamp}
          </Text>
        ) : null}
      </Animated.View>
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
    borderTopLeftRadius: 4,
  },
  bubbleRight: {
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
  timestampLeft: {},
  timestampRight: {},
});

const CHAT_BUBBLE_VARIANTS: Record<
  ChatBubbleVariant,
  {
    bubble: ViewStyle;
    message: TextStyle;
    timestamp: TextStyle;
  }
> = {
  ibu: {
    bubble: {
      backgroundColor: colors.bubbleIbu,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.secondaryPastel,
    },
    message: {
      color: colors.textPrimary,
    },
    timestamp: {
      color: '#a06b8a',
    },
  },
  pakar: {
    bubble: {
      backgroundColor: colors.bubblePakar,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.lavenderPastel,
    },
    message: {
      color: colors.textPrimary,
    },
    timestamp: {
      color: colors.textMuted,
    },
  },
  system: {
    bubble: {
      backgroundColor: colors.bubbleSystem,
      borderLeftWidth: 3,
      borderColor: colors.primary,
    },
    message: {
      color: colors.textPrimary,
    },
    timestamp: {
      color: colors.textMuted,
    },
  },
  user: {
    bubble: {
      backgroundColor: colors.bubbleUser,
    },
    message: {
      color: colors.textInverted,
    },
    timestamp: {
      color: 'rgba(255, 255, 255, 0.82)',
    },
  },
  mentor: {
    bubble: {
      backgroundColor: colors.bubbleMentor,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.accent,
    },
    message: {
      color: colors.textPrimary,
    },
    timestamp: {
      color: '#b57b52',
    },
  },
};
