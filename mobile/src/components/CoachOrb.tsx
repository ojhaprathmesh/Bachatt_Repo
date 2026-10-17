import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Text } from 'react-native';
import { Mic } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface CoachOrbProps {
  isListening: boolean;
  isSpeaking: boolean;
  onPress: () => void;
}

export const CoachOrb: React.FC<CoachOrbProps> = ({ isListening, isSpeaking, onPress }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(1)).current;
  const rippleOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Breathing idle animation
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: isListening || isSpeaking ? 1.18 : 1.06,
          duration: isListening ? 800 : isSpeaking ? 600 : 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: isListening ? 800 : isSpeaking ? 600 : 1800,
          useNativeDriver: true,
        }),
      ])
    );
    breathing.start();

    // Secondary ripple
    const ripple = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(rippleAnim, {
            toValue: 1.35,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(rippleOpacity, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(rippleAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(rippleOpacity, {
            toValue: 0.5,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    ripple.start();

    return () => {
      breathing.stop();
      ripple.stop();
    };
  }, [isListening, isSpeaking]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onPress();
  };

  const orbColor = isListening ? '#f43f5e' : isSpeaking ? '#38bdf8' : '#10b981';

  return (
    <View style={styles.container}>
      {/* Outer Ripple */}
      <Animated.View
        style={[
          styles.ripple,
          {
            borderColor: orbColor,
            opacity: rippleOpacity,
            transform: [{ scale: rippleAnim }],
          },
        ]}
      />

      {/* Main Interactive Orb */}
      <TouchableOpacity activeOpacity={0.85} onPress={handlePress}>
        <Animated.View
          style={[
            styles.orb,
            {
              backgroundColor: orbColor,
              shadowColor: orbColor,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Mic size={32} color="#ffffff" />
        </Animated.View>
      </TouchableOpacity>

      <Text style={styles.statusText}>
        {isListening
          ? 'Listening to you...'
          : isSpeaking
          ? 'Coach is speaking...'
          : 'Tap to check-in with Coach'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
  },
  ripple: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
  },
  orb: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  statusText: {
    marginTop: 14,
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
  },
});
