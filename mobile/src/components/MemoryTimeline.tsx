import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { History, AlertTriangle } from 'lucide-react-native';
import { HabitCommitment } from '../types/coach';

interface MemoryTimelineProps {
  commitment?: HabitCommitment;
}

export const MemoryTimeline: React.FC<MemoryTimelineProps> = ({ commitment }) => {
  if (!commitment) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <History size={14} color="#818cf8" />
        <Text style={styles.headerText}>Coach Remembers Last Week (Week {commitment.week_number})</Text>
      </View>

      <View style={styles.contentBox}>
        <View style={styles.topRow}>
          <Text style={styles.targetDescription}>"{commitment.target_description}"</Text>
          <View style={styles.statusBadge}>
            <AlertTriangle size={11} color="#f87171" />
            <Text style={styles.statusBadgeText}>Bounced</Text>
          </View>
        </View>

        {commitment.evidence_snippet && (
          <View style={styles.snippetBox}>
            <Text style={styles.snippetLabel}>SMS EVIDENCE</Text>
            <Text style={styles.snippetText}>{commitment.evidence_snippet}</Text>
          </View>
        )}

        {commitment.reflection && (
          <Text style={styles.reflectionText}>Coach note: {commitment.reflection}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  headerText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contentBox: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  targetDescription: {
    flex: 1,
    color: '#f1f5f9',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  statusBadgeText: {
    color: '#f87171',
    fontSize: 10,
    fontWeight: '700',
  },
  snippetBox: {
    backgroundColor: '#090d16',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 8,
  },
  snippetLabel: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  snippetText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  reflectionText: {
    color: '#fde68a',
    fontSize: 11,
    fontStyle: 'italic',
    lineHeight: 16,
  },
});
