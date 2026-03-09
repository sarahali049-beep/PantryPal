import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { createHousehold, joinHouseholdByCode } from '@/services/firestore';

export default function JoinHouseholdScreen() {
  const [householdName, setHouseholdName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, updateHouseholdId } = useAuthStore();

  const handleCreate = async () => {
    if (!user || !householdName.trim()) {
      Alert.alert('Error', 'Please enter a household name');
      return;
    }
    setLoading(true);
    try {
      const household = await createHousehold(user, householdName.trim());
      updateHouseholdId(household.id);
      router.replace('/(tabs)/pantry');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!user || !inviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }
    setLoading(true);
    try {
      const household = await joinHouseholdByCode(user, inviteCode.trim());
      updateHouseholdId(household.id);
      router.replace('/(tabs)/pantry');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Up Your Kitchen</Text>
      <Text style={styles.subtitle}>Create a new household or join your partner's</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Create New Household</Text>
        <Input
          label="Household Name"
          value={householdName}
          onChangeText={setHouseholdName}
          placeholder="e.g., Our Kitchen"
        />
        <Button title="Create Household" onPress={handleCreate} loading={loading} />
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Join Existing Household</Text>
        <Input
          label="Invite Code"
          value={inviteCode}
          onChangeText={setInviteCode}
          placeholder="Enter 6-character code"
          autoCapitalize="characters"
          maxLength={6}
        />
        <Button title="Join Household" onPress={handleJoin} loading={loading} variant="secondary" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#333', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#888', textAlign: 'center', marginBottom: 32 },
  section: { marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E0E0E0' },
  dividerText: { marginHorizontal: 16, color: '#999', fontWeight: '600' },
});
