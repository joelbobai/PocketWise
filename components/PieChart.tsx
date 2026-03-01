import { StyleSheet, Text, View } from 'react-native';

type PieData = {
  label: string;
  value: number;
  color: string;
};

type PieChartProps = {
  data: PieData[];
};

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7'];

export function buildPieData(values: Record<string, number>): PieData[] {
  return Object.entries(values)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], index) => ({ label, value, color: COLORS[index % COLORS.length] }));
}

export function PieChart({ data }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (!data.length || total <= 0) {
    return <Text style={styles.empty}>No expense data for this month yet.</Text>;
  }

  return (
    <View style={styles.wrapper}>
      {data.map((slice) => {
        const width = `${(slice.value / total) * 100}%` as const;

        return (
          <View key={slice.label} style={styles.legendItem}>
            <View style={styles.legendLine}>
              <View style={[styles.fill, { width, backgroundColor: slice.color }]} />
            </View>
            <Text style={styles.legendText}>
              {slice.label}: ${slice.value.toFixed(2)} ({((slice.value / total) * 100).toFixed(0)}%)
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 12,
    gap: 8,
  },
  legendLine: {
    width: '100%',
    height: 12,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  legendItem: {
    gap: 6,
  },
  legendText: {
    color: '#1f2937',
    fontSize: 13,
  },
  empty: {
    marginTop: 8,
    color: '#6b7280',
  },
});
