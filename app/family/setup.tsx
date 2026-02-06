// Family Setup Screen - Create or join family
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFamily } from '@/hooks/useFamily';
import { useAlert } from '@/template';
import { Button, Input } from '@/components/ui';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

export default function FamilySetupScreen() {
  const router = useRouter();
  const { createFamily, joinFamily, currentFamily, loading: familyLoading } = useFamily();
  const { showAlert } = useAlert();
  
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [relation, setRelation] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect to tabs if user is already in a family
    if (!familyLoading && currentFamily) {
      router.replace('/(tabs)');
    }
  }, [currentFamily, familyLoading]);

  const handleCreateFamily = async () => {
    if (!familyName.trim()) {
      showAlert('Please enter a family name');
      return;
    }

    setLoading(true);
    const { error } = await createFamily(familyName.trim());
    setLoading(false);

    if (error) {
      console.error('Create family error:', error);
      showAlert('Failed to create family', error);
      return;
    }

    showAlert('Family created successfully!');
    router.replace(currentFamily ? '/(tabs)' : '/family/setup');
  };

  const handleJoinFamily = async () => {
    if (!inviteCode.trim()) {
      showAlert('Please enter an invite code');
      return;
    }

    setLoading(true);
    const { error } = await joinFamily(inviteCode.trim(), relation.trim() || undefined);
    setLoading(false);

    if (error) {
      console.error('Join family error:', error);
      showAlert('Failed to join family', error);
      return;
    }

    showAlert('Joined family successfully!');
    router.replace('/(tabs)');
  };

    if (familyLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // If already in a family, show nothing (will redirect)
  if (currentFamily) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <MaterialIcons name="family-restroom" size={80} color={colors.primary} />
          <Text style={styles.title}>Set Up Your Family</Text>
          <Text style={styles.subtitle}>Create a new family or join an existing one</Text>
        </View>

        <View style={styles.modeSelector}>
          <Button
            title="Create Family"
            onPress={() => setMode('create')}
            variant={mode === 'create' ? 'primary' : 'secondary'}
            style={styles.modeButton}
          />
          <Button
            title="Join Family"
            onPress={() => setMode('join')}
            variant={mode === 'join' ? 'primary' : 'secondary'}
            style={styles.modeButton}
          />
        </View>

        {mode === 'create' ? (
          <View style={styles.form}>
            <Text style={styles.label}>Family Name</Text>
            <Input
              placeholder="The Smiths"
              value={familyName}
              onChangeText={setFamilyName}
              editable={!loading}
            />
            <Text style={styles.hint}>
              Choose a name that represents your family circle
            </Text>

            <Button
              title={loading ? 'Creating...' : 'Create Family'}
              onPress={handleCreateFamily}
              disabled={loading}
              style={styles.submitButton}
            />
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.label}>Invite Code</Text>
            <Input
              placeholder="Enter 8-character code"
              value={inviteCode}
              onChangeText={setInviteCode}
              autoCapitalize="characters"
              maxLength={8}
              editable={!loading}
            />

            <Text style={styles.label}>Your Relation (Optional)</Text>
            <Input
              placeholder="Mother, Brother, Cousin, etc."
              value={relation}
              onChangeText={setRelation}
              editable={!loading}
            />

            <Text style={styles.hint}>
              Ask your family admin for the invite code
            </Text>

            <Button
              title={loading ? 'Joining...' : 'Join Family'}
              onPress={handleJoinFamily}
              disabled={loading}
              style={styles.submitButton}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  modeSelector: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  modeButton: {
    flex: 1,
  },
  form: {
    gap: spacing.md,
  },
  label: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: -spacing.sm,
  },
  hint: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
  },
  submitButton: {
    marginTop: spacing.md,
  },
});
