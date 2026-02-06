// Chats Tab - Real chat functionality
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui';
import { useAuth } from '@/template';
import { useFamily } from '@/hooks/useFamily';
import { chatService } from '@/services/chatService';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { formatTimestamp } from '@/utils/dateUtils';

export default function ChatsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { currentFamily } = useFamily();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadChats = async () => {
    if (!currentFamily) return;

    try {
      setLoading(true);
      const data = await chatService.getChats(currentFamily.id);
      setChats(data);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, [currentFamily]);

  const handleChatPress = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  const handleNewChat = () => {
    router.push('/chat/new');
  };

  const renderChat = ({ item }: { item: any }) => {
    const participants = item.chat_participants?.map((p: any) => p.user?.username).filter((n: string) => n) || [];
    const lastMessage = item.messages?.[0];
    const displayName = item.name || participants.join(', ') || 'Unknown';

    return (
      <Pressable
        style={({ pressed }) => [styles.chatItem, pressed && styles.pressed]}
        onPress={() => handleChatPress(item.id)}
      >
        <Avatar name={displayName} uri={item.avatar} size={56} />
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName} numberOfLines={1}>{displayName}</Text>
            {lastMessage && (
              <Text style={styles.chatTime}>
                {formatTimestamp(lastMessage.created_at)}
              </Text>
            )}
          </View>
          {lastMessage && (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {lastMessage.sender?.username}: {lastMessage.content}
            </Text>
          )}
          {!lastMessage && (
            <Text style={styles.noMessages}>No messages yet</Text>
          )}
        </View>
      </Pressable>
    );
  };

  if (!currentFamily) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Please set up your family first</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View>
          <Text style={styles.headerTitle}>Chats</Text>
          <Text style={styles.headerSubtitle}>{currentFamily.name}</Text>
        </View>
        <Pressable onPress={handleNewChat} style={styles.newChatButton}>
          <MaterialIcons name="edit" size={24} color={colors.primary} />
        </Pressable>
      </View>

      {loading && chats.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={item => item.id}
          renderItem={renderChat}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadChats} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="chat-bubble-outline" size={64} color={colors.border} />
              <Text style={styles.emptyText}>No chats yet</Text>
              <Text style={styles.emptySubtext}>Start a conversation with your family</Text>
            </View>
          }
        />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatItem: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  pressed: {
    opacity: 0.7,
    backgroundColor: colors.background,
  },
  chatInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
  },
  chatName: {
    flex: 1,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  chatTime: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    marginLeft: spacing.sm,
  },
  lastMessage: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  noMessages: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  emptySubtext: {
    fontSize: typography.sizes.base,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
});
