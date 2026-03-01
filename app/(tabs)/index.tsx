import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

function toNumber(value: string) {
  const parsedValue = Number.parseFloat(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

export default function HomeScreen() {
  const [billAmount, setBillAmount] = useState('85');
  const [tipPercent, setTipPercent] = useState('18');

  const [totalExpense, setTotalExpense] = useState('240');
  const [splitCount, setSplitCount] = useState('3');

  const [income, setIncome] = useState('3200');
  const [needsPercent, setNeedsPercent] = useState('50');
  const [wantsPercent, setWantsPercent] = useState('30');

  const [goalName, setGoalName] = useState('Emergency fund');
  const [goalTarget, setGoalTarget] = useState('2000');
  const [goalSaved, setGoalSaved] = useState('750');

  const [habitCompleted, setHabitCompleted] = useState(4);

  const tipResult = useMemo(() => {
    const bill = toNumber(billAmount);
    const tip = toNumber(tipPercent) / 100;
    const tipAmount = bill * tip;
    const total = bill + tipAmount;
    return { tipAmount, total };
  }, [billAmount, tipPercent]);

  const splitResult = useMemo(() => {
    const expense = toNumber(totalExpense);
    const people = Math.max(1, Math.floor(toNumber(splitCount)));
    return expense / people;
  }, [splitCount, totalExpense]);

  const budgetResult = useMemo(() => {
    const monthlyIncome = toNumber(income);
    const needs = (monthlyIncome * toNumber(needsPercent)) / 100;
    const wants = (monthlyIncome * toNumber(wantsPercent)) / 100;
    const savings = monthlyIncome - needs - wants;
    return { needs, wants, savings };
  }, [income, needsPercent, wantsPercent]);

  const goalProgress = useMemo(() => {
    const target = Math.max(1, toNumber(goalTarget));
    const saved = Math.max(0, toNumber(goalSaved));
    const progress = Math.min(1, saved / target);
    return { target, saved, progress };
  }, [goalSaved, goalTarget]);

  const habitPercent = Math.round((habitCompleted / 7) * 100);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">PocketWise Toolkit</ThemedText>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">1) Tip calculator</ThemedText>
        <ThemedText style={styles.helpText}>Quickly estimate a fair tip and final bill.</ThemedText>
        <TextInput
          keyboardType="decimal-pad"
          value={billAmount}
          onChangeText={setBillAmount}
          style={styles.input}
          placeholder="Bill amount"
          placeholderTextColor="#8a8a8a"
        />
        <TextInput
          keyboardType="decimal-pad"
          value={tipPercent}
          onChangeText={setTipPercent}
          style={styles.input}
          placeholder="Tip %"
          placeholderTextColor="#8a8a8a"
        />
        <ThemedText>Tip: {formatCurrency(tipResult.tipAmount)}</ThemedText>
        <ThemedText type="defaultSemiBold">Total: {formatCurrency(tipResult.total)}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">2) Expense splitter</ThemedText>
        <ThemedText style={styles.helpText}>Split shared costs for trips, meals, or subscriptions.</ThemedText>
        <TextInput
          keyboardType="decimal-pad"
          value={totalExpense}
          onChangeText={setTotalExpense}
          style={styles.input}
          placeholder="Total expense"
          placeholderTextColor="#8a8a8a"
        />
        <TextInput
          keyboardType="number-pad"
          value={splitCount}
          onChangeText={setSplitCount}
          style={styles.input}
          placeholder="Number of people"
          placeholderTextColor="#8a8a8a"
        />
        <ThemedText type="defaultSemiBold">Per person: {formatCurrency(splitResult)}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">3) 50/30/20 budget planner</ThemedText>
        <ThemedText style={styles.helpText}>Adjust percentages to match your own monthly plan.</ThemedText>
        <TextInput
          keyboardType="decimal-pad"
          value={income}
          onChangeText={setIncome}
          style={styles.input}
          placeholder="Monthly income"
          placeholderTextColor="#8a8a8a"
        />
        <ThemedView style={styles.inlineInputs}>
          <TextInput
            keyboardType="decimal-pad"
            value={needsPercent}
            onChangeText={setNeedsPercent}
            style={[styles.input, styles.halfInput]}
            placeholder="Needs %"
            placeholderTextColor="#8a8a8a"
          />
          <TextInput
            keyboardType="decimal-pad"
            value={wantsPercent}
            onChangeText={setWantsPercent}
            style={[styles.input, styles.halfInput]}
            placeholder="Wants %"
            placeholderTextColor="#8a8a8a"
          />
        </ThemedView>
        <ThemedText>Needs: {formatCurrency(budgetResult.needs)}</ThemedText>
        <ThemedText>Wants: {formatCurrency(budgetResult.wants)}</ThemedText>
        <ThemedText type="defaultSemiBold">Savings: {formatCurrency(budgetResult.savings)}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">4) Savings goal tracker</ThemedText>
        <ThemedText style={styles.helpText}>Track progress toward any short-term or long-term target.</ThemedText>
        <TextInput
          value={goalName}
          onChangeText={setGoalName}
          style={styles.input}
          placeholder="Goal name"
          placeholderTextColor="#8a8a8a"
        />
        <TextInput
          keyboardType="decimal-pad"
          value={goalTarget}
          onChangeText={setGoalTarget}
          style={styles.input}
          placeholder="Target amount"
          placeholderTextColor="#8a8a8a"
        />
        <TextInput
          keyboardType="decimal-pad"
          value={goalSaved}
          onChangeText={setGoalSaved}
          style={styles.input}
          placeholder="Already saved"
          placeholderTextColor="#8a8a8a"
        />
        <ThemedText>
          {goalName || 'Goal'}: {Math.round(goalProgress.progress * 100)}% complete
        </ThemedText>
        <ThemedView style={styles.progressTrack}>
          <ThemedView style={[styles.progressFill, { width: `${goalProgress.progress * 100}%` }]} />
        </ThemedView>
        <ThemedText type="defaultSemiBold">
          Remaining: {formatCurrency(goalProgress.target - goalProgress.saved)}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">5) No-spend streak helper</ThemedText>
        <ThemedText style={styles.helpText}>Mark each no-spend day to build stronger money habits.</ThemedText>
        <ThemedText>Completed this week: {habitCompleted} / 7 days</ThemedText>
        <ThemedText type="defaultSemiBold">Progress: {habitPercent}%</ThemedText>
        <ThemedView style={styles.streakActions}>
          <Pressable
            style={styles.actionButton}
            onPress={() => setHabitCompleted((current) => Math.max(0, current - 1))}>
            <ThemedText type="defaultSemiBold">-1</ThemedText>
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => setHabitCompleted((current) => Math.min(7, current + 1))}>
            <ThemedText type="defaultSemiBold">+1</ThemedText>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => setHabitCompleted(0)}>
            <ThemedText type="defaultSemiBold">Reset</ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    marginBottom: 4,
  },
  card: {
    gap: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#4f7a88',
    borderRadius: 14,
    padding: 14,
  },
  helpText: {
    opacity: 0.8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#6f8f98',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#11181C',
    backgroundColor: '#ffffffdd',
  },
  inlineInputs: {
    flexDirection: 'row',
    gap: 8,
  },
  halfInput: {
    flex: 1,
  },
  progressTrack: {
    height: 12,
    width: '100%',
    borderRadius: 999,
    backgroundColor: '#c6d8de',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0a7ea4',
  },
  streakActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: '#6f8f98',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
