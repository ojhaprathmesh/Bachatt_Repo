import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Flame, ShieldCheck } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { ActiveHabit } from '../types/coach';

interface SingleHabitCardProps {
  habit: ActiveHabit;
  onActionPress: () => void;
  loading?: boolean;
}

export const SingleHabitCard: React.FC<SingleHabitCardProps> = ({ habit, onActionPress, loading }) => {
  const handlePress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onActionPress();
  };

  return (
    <View style={styles.card}>
      {/* Top Badges */}
      <View style={styles.badgeRow}>
        <View style={styles.focusBadge}>
          <ShieldCheck size={14} color="#34d399" />
          <Text style={styles.focusBadgeText}>Single Habit Focus</Text>
        </View>

        <View style={styles.streakBadge}>
          <Flame size={15} color="#fbbf24" fill="#fbbf24" />
          <Text style={styles.streakText}>{habit.current_streak_days} Day Streak</Text>
        </View>
      </View>

      {/* Habit Title & Tagline */}
      <Text style={styles.title}>{habit.title}</Text>
      <Text style={styles.tagline}>{habit.tagline}</Text>

      {/* Rationale Block */}
      <View style={styles.rationaleBox}>
        <Text style={styles.rationaleLabel}>Why this matters:</Text>
        <Text style={styles.rationaleText}>{habit.rationale}</Text>
      </View>

      {/* Weekly Consistency Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Weekly Habit Goal</Text>
          <Text style={styles.progressCount}>{habit.current_streak_days} / 7 days</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.min(100, Math.max(10, Math.round((habit.current_streak_days / 7) * 100)))}%` },
            ]}
          />
        </View>
      </View>

      {/* Action Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.metricLabel}>Protected so far</Text>
          <Text style={styles.metricValue}>₹{habit.money_protected_inr}</Text>
        </View>

        <TouchableOpacity
          style={[styles.actionBtn, loading && styles.btnDisabled]}
          activeOpacity={0.8}
          disabled={loading}
          onPress={handlePress}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.actionBtnText}>Save ₹{habit.suggested_amount_inr} Now</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginVertical: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  focusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  focusBadgeText: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '600',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  streakText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 14,
    lineHeight: 18,
  },
  rationaleBox: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  rationaleLabel: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  rationaleText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 17,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  metricLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '500',
  },
  metricValue: {
    color: '#34d399',
    fontSize: 18,
    fontWeight: '800',
  },
  actionBtn: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    elevation: 3,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  progressCount: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
});
