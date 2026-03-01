import { StyleSheet, Text, View } from 'react-native';

type PieSlice = {
  category: string;
  amount: number;
  color: string;
};

type PieChartProps = {
  slices: PieSlice[];
};

export function PieChart({ slices }: PieChartProps) {
  const total = slices.reduce((sum, slice) => sum + slice.amount, 0);

  if (!slices.length || total <= 0) {
    return <Text style={styles.empty}>No expense data for this month.</Text>;
  }

  return (
    <View>
      <View style={styles.chart}>
        {slices.map((slice) => {
          const percentage = (slice.amount / total) * 100;
          return (
            <View key={slice.category} style={styles.barRow}>
              <View style={[styles.bar, { width: `${Math.max(percentage, 4)}%`, backgroundColor: slice.color }]} />
            </View>
          );
        })}
      </View>
      <View style={styles.legend}>
        {slices.map((slice) => (
          <View key={slice.category} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: slice.color }]} />
            <Text style={styles.legendText}>
              {slice.category} ({Math.round((slice.amount / total) * 100)}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  barRow: {
    width: '100%',
    height: 14,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 999,
  },
  legend: {
    marginTop: 14,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: '#374151',
    fontSize: 13,
  },
  empty: {
    color: '#6b7280',
  },
});
