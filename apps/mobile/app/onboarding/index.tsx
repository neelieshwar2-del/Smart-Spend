import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShieldCheck, Sparkles, TrendingUp, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';
import { Button } from '../../src/components/common/Button';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, radii, spacing, typography } = useTheme();

  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'Effortless Expense Tracking',
      description: 'Record any UPI, cash, or card expense in under 3 seconds with our tactile numeric keypad and smart auto-categorization.',
      icon: <TrendingUp size={44} color={colors.accent} />,
    },
    {
      title: 'Deterministic Budget Pacing',
      description: 'Always know your exact safe daily allowance. Real-time integer paise math ensures zero rounding drift or balance discrepancies.',
      icon: <ShieldCheck size={44} color={colors.accent} />,
    },
    {
      title: 'AI Financial Copilot',
      description: 'Ask questions in plain English and receive instant answers grounded 100% in your verified transaction ledger.',
      icon: <Sparkles size={44} color={colors.accent} />,
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  const slide = slides[currentSlide];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: Math.max(insets.top, 24),
          paddingBottom: Math.max(insets.bottom, 24),
          paddingHorizontal: spacing.xl,
        },
      ]}
    >
      {/* Top Header / Skip */}
      <View style={styles.topRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={[styles.brandDot, { backgroundColor: colors.accent }]} />
          <Text style={[typography.title, { color: colors.textPrimary, fontWeight: '700' }]}>
            SmartSpend
          </Text>
        </View>

        <TouchableOpacity activeOpacity={0.7} onPress={handleSkip}>
          <Text style={[typography.bodySm, { color: colors.textSecondary, fontWeight: '600' }]}>
            Skip
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <View style={styles.centerContent}>
        <View style={[styles.iconCard, { backgroundColor: colors.primary, borderRadius: radii.card }]}>
          {slide.icon}
        </View>

        <Text style={[typography.hero, { color: colors.textPrimary, textAlign: 'center', marginTop: 32 }]}>
          {slide.title}
        </Text>

        <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 24, maxWidth: 320 }]}>
          {slide.description}
        </Text>

        {/* Step Indicator Dots */}
        <View style={styles.dotsRow}>
          {slides.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                {
                  backgroundColor: idx === currentSlide ? colors.accent : colors.cardSubtle,
                  width: idx === currentSlide ? 24 : 8,
                  borderRadius: radii.pill,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Bottom CTA Row */}
      <View style={styles.bottomRow}>
        <Button
          title={currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          variant="primary"
          size="lg"
          style={{ width: '100%' }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  iconCard: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 6px 10px rgba(0, 0, 0, 0.15)',
    elevation: 6,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 28,
  },
  dot: {
    height: 8,
  },
  bottomRow: {
    width: '100%',
  },
});
