// Onboarding Screen - Welcome flow
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/template';
import { useFamily } from '@/hooks/useFamily';
import { Button } from '@/components/ui';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

const { width } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    image: require('@/assets/images/onboarding-1.png'),
    title: 'Welcome to FamilyCircle',
    subtitle: 'Your private space for family connection',
  },
  {
    id: 2,
    image: require('@/assets/images/onboarding-2.png'),
    title: 'Stay Connected',
    subtitle: 'Chat, share moments, and plan together',
  },
  {
    id: 3,
    image: require('@/assets/images/onboarding-3.png'),
    title: 'Never Miss a Moment',
    subtitle: 'Events, birthdays, and special memories',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const { user } = useAuth();
  const { currentFamily, loading: familyLoading } = useFamily();

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / width);
    setCurrentPage(page);
  };

  const handleNext = () => {
    if (currentPage < onboardingData.length - 1) {
      scrollViewRef.current?.scrollTo({ x: width * (currentPage + 1), animated: true });
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = () => {
    // If not logged in, go to login
    if (!user) {
      router.replace('/auth/login');
      return;
    }

    // If logged in and has family, go to main app
    if (!familyLoading && currentFamily) {
      router.replace('/(tabs)');
      return;
    }

    // If logged in but no family, go to family setup
    if (!familyLoading && !currentFamily) {
      router.replace('/family/setup');
      return;
    }

    // Still loading family data, default to login for safety
    router.replace('/auth/login');
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        {currentPage < onboardingData.length - 1 && (
          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {onboardingData.map((item) => (
          <View key={item.id} style={[styles.page, { width }]}>
            <Image
              source={item.image}
              style={styles.image}
              contentFit="contain"
              transition={300}
            />
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, currentPage === index && styles.activeDot]}
            />
          ))}
        </View>

        <Button
          title={currentPage === onboardingData.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  skipButton: {
    padding: spacing.sm,
  },
  skipText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.primary,
  },
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: width * 0.8,
    height: width * 1.2,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.sizes.lg * typography.lineHeights.relaxed,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 24,
  },
  button: {
    width: '100%',
  },
});
