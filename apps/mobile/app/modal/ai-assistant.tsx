import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Send, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';
import { api } from '../../src/services/api';
import { AiChatMessage } from '../../src/types';

export default function AiAssistantModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radii, typography } = useTheme();
  const scrollViewRef = useRef<any>(null);

  const [inputMessage, setInputMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'assistant',
      text: "Hello! I'm your SmartSpend AI assistant. Ask me anything about your current budget, category pacing, or upcoming subscriptions!",
      timestamp: 'Just now',
      model: 'smartspend-fintech-engine',
    },
  ]);

  const suggestions = [
    '🍽️ Can I afford dinner tonight?',
    '📊 Top spend category?',
    '💡 How to save ₹5,000?',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMsg: AiChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Just now',
    };

    setMessages((prev: AiChatMessage[]) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const res = await api.chatAi(text);
      const assistantMsg: AiChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: res.answer,
        timestamp: 'Just now',
        model: res.model,
        metrics: res.metrics,
      };
      setMessages((prev: AiChatMessage[]) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: AiChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I encountered an issue retrieving your latest metrics. Please try again in a moment.',
        timestamp: 'Just now',
      };
      setMessages((prev: AiChatMessage[]) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 16) }]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.surfaceContainer,
          },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={[styles.aiIcon, { backgroundColor: colors.secondaryContainer }]}>
            <Sparkles size={18} color={colors.secondary} />
          </View>
          <View>
            <Text style={[typography.title, { color: colors.textPrimary, fontWeight: '700' }]}>
              SmartSpend AI
            </Text>
            <Text style={[typography.caption, { color: colors.secondary, fontWeight: '600' }]}>
              Your Financial Copilot
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={[styles.closeBtn, { backgroundColor: colors.surfaceContainer }]}
        >
          <X size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Suggested Prompt Chips */}
      <View style={[styles.suggestionsBar, { borderBottomColor: colors.surfaceContainer, backgroundColor: colors.surfaceContainerLow }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 8 }}>
          {suggestions.map((s) => (
            <TouchableOpacity
              key={s}
              activeOpacity={0.7}
              onPress={() => handleSend(s)}
              style={[
                styles.sugChip,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: '600' }]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ padding: spacing.lg, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                isUser ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' },
              ]}
            >
              {!isUser && (
                <View style={[styles.msgAvatar, { backgroundColor: colors.secondaryContainer, marginRight: 8 }]}>
                  <Sparkles size={14} color={colors.secondary} />
                </View>
              )}

              <View
                style={[
                  styles.bubble,
                  {
                    maxWidth: '82%',
                    padding: 12,
                    borderRadius: 18,
                    backgroundColor: isUser ? colors.primary : colors.surfaceContainer,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.bodySm,
                    {
                      color: isUser ? colors.textInverse : colors.textPrimary,
                      lineHeight: 20,
                    },
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
            </View>
          );
        })}

        {isTyping && (
          <View style={[styles.messageRow, { justifyContent: 'flex-start', alignItems: 'center' }]}>
            <View style={[styles.msgAvatar, { backgroundColor: colors.secondaryContainer, marginRight: 8 }]}>
              <Sparkles size={14} color={colors.secondary} />
            </View>
            <View style={[styles.bubble, { padding: 12, borderRadius: 18, backgroundColor: colors.surfaceContainer }]}>
              <ActivityIndicator size="small" color={colors.secondary} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Form Bar */}
      <View
        style={[
          styles.inputContainer,
          {
            paddingBottom: Math.max(insets.bottom, 12),
            paddingTop: 10,
            paddingHorizontal: spacing.lg,
            borderTopWidth: 1,
            borderTopColor: colors.surfaceContainer,
            backgroundColor: colors.card,
          },
        ]}
      >
        <TextInput
          placeholder="Ask AI finance question..."
          placeholderTextColor={colors.textMuted}
          value={inputMessage}
          onChangeText={setInputMessage}
          onSubmitEditing={() => handleSend()}
          style={[
            typography.bodySm,
            styles.chatInput,
            { backgroundColor: colors.surfaceContainer, color: colors.textPrimary },
          ]}
        />
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleSend()}
          style={[
            styles.sendBtn,
            {
              backgroundColor: colors.primary,
              opacity: inputMessage.trim().length > 0 ? 1 : 0.5,
            },
          ]}
        >
          <Send size={16} color={colors.textInverse} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionsBar: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  sugChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  bubble: {
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    height: 44,
    borderRadius: 9999,
    paddingHorizontal: 16,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
