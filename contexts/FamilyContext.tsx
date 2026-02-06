// Family Context - Global family state management
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/template';
import { getSupabaseClient } from '@/template';

interface Family {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
}

interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string;
  role: 'admin' | 'organizer' | 'member' | 'child';
  relation: string | null;
  joined_at: string;
  user?: {
    username: string;
    email: string;
  };
}

interface FamilyContextType {
  currentFamily: Family | null;
  familyMembers: FamilyMember[];
  loading: boolean;
  createFamily: (name: string) => Promise<{ error: string | null }>;
  joinFamily: (inviteCode: string, relation?: string) => Promise<{ error: string | null }>;
  loadFamily: () => Promise<void>;
  leaveFamily: () => Promise<{ error: string | null }>;
}

export const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentFamily, setCurrentFamily] = useState<Family | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFamily = async () => {
    if (!user) {
      setCurrentFamily(null);
      setFamilyMembers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      // Get user's family memberships (user can be in multiple families)
      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select('family_id, joined_at')
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false })
        .limit(1)
        .single();

      if (memberError) {
        console.error('Load family membership error:', memberError);
        setCurrentFamily(null);
        setFamilyMembers([]);
        return;
      }

      if (!memberData) {
        setCurrentFamily(null);
        setFamilyMembers([]);
        return;
      }

      // Get family details
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .select('*')
        .eq('id', memberData.family_id)
        .maybeSingle();

      if (familyError) {
        console.error('Load family details error:', familyError);
        setCurrentFamily(null);
        return;
      }

      if (!familyData) {
        setCurrentFamily(null);
        return;
      }

      setCurrentFamily(familyData);

      // Get all family members
      const { data: membersData, error: membersError } = await supabase
        .from('family_members')
        .select(`
          *,
          user:user_profiles(username, email)
        `)
        .eq('family_id', familyData.id);

      if (!membersError && membersData) {
        setFamilyMembers(membersData);
      }
    } catch (error) {
      console.error('Error loading family:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFamily();
  }, [user]);

  const createFamily = async (name: string): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const supabase = getSupabaseClient();

      // Create family
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .insert({ name, created_by: user.id })
        .select()
        .single();

      if (familyError) {
        console.error('Family creation error:', familyError);
        return { error: familyError.message || 'Failed to create family' };
      }

      if (!familyData) {
        console.error('No family data returned');
        return { error: 'Failed to create family' };
      }

      // Add creator as admin
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: familyData.id,
          user_id: user.id,
          role: 'admin',
          relation: 'Self',
        });

      if (memberError) {
        console.error('Member creation error:', memberError);
        return { error: memberError.message || 'Failed to add family member' };
      }

      await loadFamily();
      return { error: null };
    } catch (error: any) {
      console.error('Error creating family:', error);
      return { error: error.message || 'An error occurred' };
    }
  };

  const joinFamily = async (inviteCode: string, relation?: string): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const supabase = getSupabaseClient();

      // Find family by invite code
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .select('*')
        .eq('invite_code', inviteCode)
        .maybeSingle();

      if (familyError) {
        console.error('Find family error:', familyError);
        return { error: 'Invalid invite code' };
      }

      if (!familyData) {
        return { error: 'Invalid invite code' };
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('family_members')
        .select('id')
        .eq('family_id', familyData.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingMember) {
        return { error: 'Already a member of this family' };
      }

      // Join family
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: familyData.id,
          user_id: user.id,
          role: 'member',
          relation: relation || null,
        });

      if (memberError) {
        console.error('Join family error:', memberError);
        return { error: memberError.message || 'Failed to join family' };
      }

      await loadFamily();
      return { error: null };
    } catch (error: any) {
      console.error('Error joining family:', error);
      return { error: error.message || 'An error occurred' };
    }
  };

  const leaveFamily = async (): Promise<{ error: string | null }> => {
    if (!user || !currentFamily) return { error: 'No family to leave' };

    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('family_id', currentFamily.id)
        .eq('user_id', user.id);

      if (error) {
        return { error: 'Failed to leave family' };
      }

      setCurrentFamily(null);
      setFamilyMembers([]);
      return { error: null };
    } catch (error) {
      console.error('Error leaving family:', error);
      return { error: 'An error occurred' };
    }
  };

  return (
    <FamilyContext.Provider
      value={{
        currentFamily,
        familyMembers,
        loading,
        createFamily,
        joinFamily,
        loadFamily,
        leaveFamily,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
}