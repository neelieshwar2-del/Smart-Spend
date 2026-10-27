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
import { X, Send, Sparkles, Bot, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';
import { api } from '../../src/services/api';
import { AiChatMessage } from '../../src/types';

export default function AiAssistantModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radii, typography } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  const [inputMessage, setInputMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'assistant',
      text: 'Hello Rohan! I am SmartSpend AI, your personal financial copilot. I analyze your live ledger to give you factual, grounded insights. How can I help you today?',
      timestamp: 'Just now',
      model: 'smartspend-fintech-engine',
    },
  ]);

  const suggestions = [
    'Can I afford dinner tonight? 🍽️',
    'Where did most of my money go this month? 📊',
    'What is my remaining safe budget? 🎯',
    'How much can I save by cutting dining out? 💡',
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
    } catch (e: any) {
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
      style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={[styles.aiIcon, { backgroundColor: colors.accent }]}>
            <Sparkles size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={[typography.title, { color: colors.textPrimary }]}>SmartSpend Copilot</Text>
            <Text style={[typography.caption, { color: colors.success, fontWeight: '600' }]}>
              ● Grounded in live ledger
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={[styles.closeBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <X size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Suggested Chips */}
      <View style={{ paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 8 }}>
          {suggestions.map((s) => (
            <TouchableOpacity
              key={s}
              activeOpacity={0.7}
              onPress={() => handleSend(s)}
              style={[
                styles.sugChip,
                { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radii.pill },
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
        contentContainerStyle={{ padding: spacing.lg, gap: 14 }}
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
                <View style={[styles.msgAvatar, { backgroundColor: colors.cardSubtle, marginRight: 8 }]}>
                  <Bot size={16} color={colors.textPrimary} />
                </View>
              )}

              <View
                style={[
                  styles.bubble,
                  {
                    maxWidth: '82%',
                    padding: spacing.md,
                    borderRadius: radii.xl,
                    backgroundColor: isUser ? colors.primary : colors.card,
                    borderColor: colors.border,
                    borderWidth: isUser ? 0 : 1,
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

                {msg.metrics && (
                  <View style={[styles.metricsBox, { backgroundColor: colors.cardSubtle, borderRadius: radii.md, marginTop: 8 }]}>
                    {msg.metrics.remainingBudget && (
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>
                        Remaining: <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{msg.metrics.remainingBudget}</Text>
                      </Text>
                    )}
                    {msg.metrics.topCategory && (
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>
                        Top Category: <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{msg.metrics.topCategory}</Text>
                      </Text>
                    )}
                  </View>
                )}
              </View>

              {isUser && (
                <View style={[styles.msgAvatar, { backgroundColor: colors.accent, marginLeft: 8 }]}>
                  <User size={16} color={colors.primary} />
                </View>
              )}
            </View>
          );
        })}

        {isTyping && (
          <View style={[styles.messageRow, { justifyContent: 'flex-start' }]}>
            <View style={[styles.msgAvatar, { backgroundColor: colors.cardSubtle, marginRight: 8 }]}>
              <Bot size={16} color={colors.textPrimary} />
            </View>
            <View style={[styles.bubble, { padding: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg }]}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Bar */}
      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + 8,
            paddingTop: 8,
            paddingHorizontal: spacing.lg,
          },
        ]}
      >
        <TextInput
          placeholder="Ask a question about your spending..."
          placeholderTextColor={colors.textMuted}
          value={inputMessage}
          onChangeText={setInputMessage}
          onSubmitEditing={() => handleSend()}
          style={[
            styles.textInput,
            {
              backgroundColor: colors.cardSubtle,
              borderColor: colors.border,
              borderRadius: radii.pill,
              color: colors.textPrimary,
            },
          ]}
        />
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleSend()}
          disabled={!inputMessage.trim()}
          style={[
            styles.sendBtn,
            {
              backgroundColor: inputMessage.trim() ? colors.accent : colors.cardSubtle,
              borderRadius: radii.pill,
            },
          ]}
        >
          <Send size={18} color={inputMessage.trim() ? colors.primary : colors.textMuted} />
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  sugChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  metricsBox: {
    padding: 8,
    marginTop: 6,
    gap: 2,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    gap: 8,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    fontSize: 14,
  },
  sendBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
