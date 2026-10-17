import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { ChevronDown, Check, AlertCircle } from 'lucide-react-native';

import { CoachOrb } from './src/components/CoachOrb';
import { SingleHabitCard } from './src/components/SingleHabitCard';
import { MemoryTimeline } from './src/components/MemoryTimeline';
import { UserHabitProfile, DemoPersona, ActionTriggerResponse } from './src/types/coach';

const API_BASE = 'http://localhost:8000';

const FALLBACK_PERSONAS: DemoPersona[] = [
  { user_id: '1751385702744480', display_name: 'Ramesh (Discretionary Spender)' },
  { user_id: '1750577443897920', display_name: 'Sunita (Gig Worker / Mandate Risk)' },
  { user_id: '1750389254784005', display_name: 'Amit (Micro-SIP Saver)' },
];

const INITIAL_PROFILE: UserHabitProfile = {
  user_id: '1751385702744480',
  persona_name: 'Ramesh (Discretionary Spender)',
  habit_resilience_score: 64,
  top_vulnerability: 'Weekend food delivery debits causing Monday bank bounce',
  active_habit: {
    habit_id: 'HABIT_MORNING_SHIELD_50',
    title: 'The ₹50 Morning Auto-Shield',
    tagline: 'Save ₹50 daily before evening discretionary spends',
    rationale: 'Locks ₹50 into Smart Reserve every morning so weekend debits never bounce.',
    current_streak_days: 3,
    best_streak_days: 8,
    money_protected_inr: 150.0,
    action_type: 'MICRO_SAVE',
    suggested_amount_inr: 50.0,
  },
  last_week_commitment: {
    commitment_id: 'comm_w41',
    week_number: 41,
    date: '2026-10-07',
    target_description: 'Maintain ₹100 buffer in Canara Bank account for loan EMI',
    outcome: 'BROKEN',
    evidence_snippet: 'Canara Bank: Txn of Rs.950 to RINGCAPITAL failed due to INSUFFICIENT FUNDS on 07-Oct',
    reflection: 'Festival weekend UPI expenses drained the minimum balance',
  },
};

export default function App() {
  const [personas, setPersonas] = useState<DemoPersona[]>(FALLBACK_PERSONAS);
  const [selectedUserId, setSelectedUserId] = useState<string>(FALLBACK_PERSONAS[0].user_id);
  const [profile, setProfile] = useState<UserHabitProfile>(INITIAL_PROFILE);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [coachSpeech, setCoachSpeech] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);
  const [personaModalVisible, setPersonaModalVisible] = useState(false);

  // 1. Fetch demo personas
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);

    fetch(`${API_BASE}/api/coach/demo-users`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data: DemoPersona[]) => {
        clearTimeout(timer);
        if (data && data.length > 0) {
          setPersonas(data);
          setSelectedUserId(data[0].user_id);
        }
      })
      .catch(() => {
        clearTimeout(timer);
      });
  }, []);

  // 2. Fetch selected profile
  useEffect(() => {
    if (!selectedUserId) return;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);

    fetch(`${API_BASE}/api/coach/profile/${selectedUserId}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data: UserHabitProfile) => {
        clearTimeout(timer);
        setProfile(data);
      })
      .catch(() => {
        clearTimeout(timer);
      });
  }, [selectedUserId]);

  // Voice Check-in interaction
  const handleOrbPress = async () => {
    if (!profile) return;
    setIsListening(true);
    setCoachSpeech('Listening to you...');

    try {
      const res = await fetch(`${API_BASE}/api/coach/voice-checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: profile.user_id,
          text_prompt: 'Namaste Coach, pichle hafte ka kya update hai?',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsListening(false);
        setIsSpeaking(true);
        setCoachSpeech(data.coach_reply_text);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setTimeout(() => setIsSpeaking(false), 5000);
        return;
      }
    } catch {
      // Offline fallback
    }

    setTimeout(() => {
      setIsListening(false);
      setIsSpeaking(true);
      const text = `Namaste ${profile.persona_name} ji! Pichle hafte humne buffer ka target rakha tha. Is hafte hum sirf EK simple habit par focus karenge: ${profile.active_habit.title}. Kya main aaj ka ₹${profile.active_habit.suggested_amount_inr} transfer initiate kar doon?`;
      setCoachSpeech(text);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setTimeout(() => setIsSpeaking(false), 5000);
    }, 1200);
  };

  // Autonomous one-tap action
  const handleAction = async () => {
    if (!profile) return;
    setActionLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/coach/execute-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: profile.user_id,
          action_type: profile.active_habit.action_type,
          amount_inr: profile.active_habit.suggested_amount_inr,
        }),
      });
      const data: ActionTriggerResponse = await res.json();

      setProfile({
        ...profile,
        active_habit: {
          ...profile.active_habit,
          current_streak_days: data.updated_streak_days,
          money_protected_inr: data.total_saved_inr,
        },
      });
      setCoachSpeech(data.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch {
      setProfile({
        ...profile,
        active_habit: {
          ...profile.active_habit,
          current_streak_days: profile.active_habit.current_streak_days + 1,
          money_protected_inr: profile.active_habit.money_protected_inr + 50,
        },
      });
      setCoachSpeech('₹50 moved to your Smart Reserve. Streak incremented!');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } finally {
      setActionLoading(false);
    }
  };

  const [activeTab, setActiveTab] = useState<'coach' | 'level1' | 'level2'>('coach');

  const currentPersona = personas.find((p) => p.user_id === selectedUserId) || personas[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appTitle}>Bachatt Mitra</Text>
            <Text style={styles.appSubtitle}>Voice AI Habit Coach · Buildathon</Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.personaButton}
              activeOpacity={0.8}
              onPress={() => setPersonaModalVisible(true)}
            >
              <Text style={styles.personaButtonText} numberOfLines={1}>
                {currentPersona?.display_name.split(' ')[0] || 'User'}
              </Text>
              <ChevronDown size={14} color="#94a3b8" />
            </TouchableOpacity>

            {profile && (
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreText}>Score: {profile.habit_resilience_score}/100</Text>
              </View>
            )}
          </View>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'coach' && styles.tabButtonActive]}
            onPress={() => setActiveTab('coach')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'coach' && styles.tabButtonTextActive]}>
              Coach & Action
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'level1' && styles.tabButtonActive]}
            onPress={() => setActiveTab('level1')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'level1' && styles.tabButtonTextActive]}>
              L1: Explainer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'level2' && styles.tabButtonActive]}
            onPress={() => setActiveTab('level2')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'level2' && styles.tabButtonTextActive]}>
              L2: Intelligence
            </Text>
          </TouchableOpacity>
        </View>

        {/* Top Vulnerability Callout */}
        {profile && (
          <View style={styles.vulnerabilityCard}>
            <View style={styles.vulnerabilityHeader}>
              <AlertCircle size={13} color="#f87171" />
              <Text style={styles.vulnerabilityTitle}>TOP VULNERABILITY</Text>
            </View>
            <Text style={styles.vulnerabilityText}>{profile.top_vulnerability}</Text>
          </View>
        )}

        {/* Tab 1: Coach & Action (Level 3 Core) */}
        {activeTab === 'coach' && (
          <>
            <CoachOrb
              isListening={isListening}
              isSpeaking={isSpeaking}
              onPress={handleOrbPress}
            />

            {coachSpeech !== '' && (
              <View style={styles.dialogueBox}>
                <Text style={styles.dialogueHeader}>COACH DIALOGUE</Text>
                <Text style={styles.dialogueText}>{coachSpeech}</Text>
              </View>
            )}

            {profile && (
              <SingleHabitCard
                habit={profile.active_habit}
                onActionPress={handleAction}
                loading={actionLoading}
              />
            )}

            {profile && <MemoryTimeline commitment={profile.last_week_commitment} />}
          </>
        )}

        {/* Tab 2: Level 1 (Read & Explain: Statement Summariser, Score Explainer, Policy Q&A) */}
        {activeTab === 'level1' && profile.level1 && (
          <View style={styles.tabContent}>
            {/* Statement Summariser */}
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>📄 STATEMENT SUMMARISER</Text>
              <Text style={styles.infoCardBody}>{profile.level1.statement_summary}</Text>
            </View>

            {/* Score Explainer */}
            <View style={styles.infoCard}>
              <View style={styles.flexRowBetween}>
                <Text style={[styles.infoCardTitle, { color: '#818cf8' }]}>🎯 SCORE EXPLAINER</Text>
                <Text style={styles.scorePill}>{profile.habit_resilience_score}/100</Text>
              </View>
              {profile.level1.score_breakdown.map((item, i) => (
                <View key={i} style={styles.scoreItem}>
                  <Text style={styles.scoreItemText}>{item}</Text>
                </View>
              ))}
              <View style={styles.adviceBox}>
                <Text style={styles.adviceText}>💡 {profile.level1.score_advice}</Text>
              </View>
            </View>

            {/* Policy & Mandate Explainer */}
            <View style={styles.infoCard}>
              <Text style={[styles.infoCardTitle, { color: '#38bdf8' }]}>🛡️ POLICY & MANDATE EXPLAINER</Text>
              <Text style={styles.infoCardBody}>{profile.level1.policy_summary}</Text>
              <View style={styles.qaBox}>
                <Text style={styles.qaQuestion}>Q: What happens if daily autopay fails?</Text>
                <Text style={styles.qaAnswer}>
                  A: Care Health enters a grace period. A 2nd consecutive bounce blocks cashless hospital cover.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Tab 3: Level 2 (Intelligence: Cashflow Forecast, Leak Detector, Recommender) */}
        {activeTab === 'level2' && profile.level2 && (
          <View style={styles.tabContent}>
            {/* Forecast Warning */}
            {profile.level2.forecast_warning && (
              <View style={styles.warningBanner}>
                <Text style={styles.warningBannerText}>⚠️ {profile.level2.forecast_warning}</Text>
              </View>
            )}

            {/* 7-Day Cashflow Forecast */}
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>📈 7-DAY CASH-FLOW FORECAST</Text>
              <View style={styles.forecastGrid}>
                {profile.level2.cashflow_forecast.map((day, idx) => {
                  const isDanger = day.status === 'DANGER';
                  const isAtRisk = day.status === 'AT_RISK';
                  return (
                    <View
                      key={idx}
                      style={[
                        styles.forecastItem,
                        isDanger && styles.forecastItemDanger,
                        isAtRisk && styles.forecastItemRisk,
                      ]}
                    >
                      <Text style={styles.forecastDay}>{day.day_name}</Text>
                      <Text style={styles.forecastAmount}>-₹{day.projected_outflow_inr}</Text>
                      <Text
                        style={[
                          styles.forecastStatus,
                          isDanger && styles.textRed,
                          isAtRisk && styles.textYellow,
                        ]}
                      >
                        {day.status}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Subscription & Leak Detector */}
            <View style={styles.infoCard}>
              <Text style={[styles.infoCardTitle, { color: '#fbbf24' }]}>
                🔍 DETECTED RECURRING LEAKS & MANDATES
              </Text>
              {profile.level2.detected_leaks.map((leak, i) => (
                <View key={i} style={styles.leakRow}>
                  <View>
                    <Text style={styles.leakMerchant}>{leak.merchant}</Text>
                    <Text style={styles.leakCategory}>{leak.category} · {leak.frequency}</Text>
                  </View>
                  <Text style={styles.leakAmount}>~₹{leak.est_monthly_inr}/mo</Text>
                </View>
              ))}
            </View>

            {/* Recommendation */}
            <View style={styles.recommendCard}>
              <Text style={styles.recommendTitle}>💡 INTELLIGENCE RECOMMENDATION</Text>
              <Text style={styles.recommendBody}>{profile.level2.recommended_action}</Text>
              <TouchableOpacity
                style={styles.recommendBtn}
                onPress={() => setActiveTab('coach')}
              >
                <Text style={styles.recommendBtnText}>Take Action on Coach Tab →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Persona Selector Modal */}
      <Modal visible={personaModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPersonaModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Demo Persona</Text>
            {personas.map((p) => {
              const isSelected = p.user_id === selectedUserId;
              return (
                <TouchableOpacity
                  key={p.user_id}
                  style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                  onPress={() => {
                    setSelectedUserId(p.user_id);
                    setPersonaModalVisible(false);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  }}
                >
                  <Text style={[styles.modalOptionText, isSelected && styles.modalOptionTextSelected]}>
                    {p.display_name}
                  </Text>
                  {isSelected && <Check size={16} color="#34d399" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  scrollContainer: {
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#34d399',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  personaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0f172a',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  personaButtonText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600',
  },
  scoreBadge: {
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  scoreText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700',
  },
  vulnerabilityCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    marginBottom: 8,
  },
  vulnerabilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  vulnerabilityTitle: {
    color: '#f87171',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  vulnerabilityText: {
    color: '#fecaca',
    fontSize: 12,
    lineHeight: 16,
  },
  dialogueBox: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginVertical: 10,
  },
  dialogueHeader: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  dialogueText: {
    color: '#f1f5f9',
    fontSize: 13,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 14,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
  },
  modalOptionSelected: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
  },
  modalOptionText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
  },
  modalOptionTextSelected: {
    color: '#34d399',
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabButtonActive: {
    backgroundColor: '#059669',
  },
  tabButtonText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  tabContent: {
    gap: 12,
    marginVertical: 4,
  },
  infoCard: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  infoCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#34d399',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  infoCardBody: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
  },
  flexRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scorePill: {
    fontSize: 11,
    fontWeight: '700',
    color: '#818cf8',
    backgroundColor: 'rgba(129, 140, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  scoreItem: {
    backgroundColor: '#020617',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 5,
  },
  scoreItemText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  adviceBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  adviceText: {
    color: '#6ee7b7',
    fontSize: 11,
    lineHeight: 16,
  },
  qaBox: {
    backgroundColor: '#020617',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginTop: 10,
  },
  qaQuestion: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  qaAnswer: {
    color: '#e2e8f0',
    fontSize: 11,
    lineHeight: 16,
  },
  warningBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  warningBannerText: {
    color: '#fecaca',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  forecastGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
    marginTop: 4,
  },
  forecastItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#020617',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  forecastItemDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  forecastItemRisk: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  forecastDay: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '700',
  },
  forecastAmount: {
    color: '#94a3b8',
    fontSize: 8,
    marginTop: 2,
  },
  forecastStatus: {
    color: '#34d399',
    fontSize: 8,
    fontWeight: '800',
    marginTop: 4,
  },
  textRed: {
    color: '#f87171',
  },
  textYellow: {
    color: '#fbbf24',
  },
  leakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#020617',
    borderRadius: 12,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  leakMerchant: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  leakCategory: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 1,
  },
  leakAmount: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '700',
  },
  recommendCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  recommendTitle: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  recommendBody: {
    color: '#a7f3d0',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  recommendBtn: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  recommendBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
