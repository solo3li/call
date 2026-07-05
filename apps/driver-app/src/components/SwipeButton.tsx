import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions, Platform } from 'react-native';
import { ArrowRight, Check } from 'lucide-react-native';

interface SwipeButtonProps {
  onComplete: () => void;
  title: string;
}

export default function SwipeButton({ onComplete, title }: SwipeButtonProps) {
  const [completed, setCompleted] = useState(false);
  const pan = useRef(new Animated.ValueXY()).current;
  
  // Track button width to calculate when swipe is complete
  const [buttonWidth, setButtonWidth] = useState(0);
  const sliderWidth = 60; // Width of the draggable slider

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !completed,
      onMoveShouldSetPanResponder: () => !completed,
      onPanResponderMove: (e, gestureState) => {
        if (gestureState.dx > 0 && gestureState.dx < buttonWidth - sliderWidth - 4) {
          pan.setValue({ x: gestureState.dx, y: 0 });
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dx > (buttonWidth - sliderWidth) * 0.75) {
          // Swipe completed
          Animated.spring(pan, {
            toValue: { x: buttonWidth - sliderWidth - 6, y: 0 },
            useNativeDriver: false,
            bounciness: 0
          }).start(() => {
            setCompleted(true);
            onComplete();
            
            // Reset after a delay so it can be used again if needed
            setTimeout(() => {
              setCompleted(false);
              Animated.spring(pan, {
                toValue: { x: 0, y: 0 },
                useNativeDriver: false,
                bounciness: 10
              }).start();
            }, 2000);
          });
        } else {
          // Snap back
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            bounciness: 10
          }).start();
        }
      }
    })
  ).current;

  return (
    <View 
      style={[styles.container, completed && styles.containerCompleted]}
      onLayout={(e) => setButtonWidth(e.nativeEvent.layout.width)}
    >
      <View style={styles.textContainer}>
        <Text style={[styles.title, completed && styles.titleCompleted]}>
          {completed ? 'تم التوصيل بنجاح' : title}
        </Text>
      </View>
      
      <Animated.View 
        style={[
          styles.slider, 
          { transform: [{ translateX: pan.x }] },
          completed && styles.sliderCompleted
        ]}
        {...panResponder.panHandlers}
      >
        {completed ? (
          <Check color="#FFFFFF" size={24} strokeWidth={3} />
        ) : (
          <ArrowRight color="#1A1A1A" size={24} strokeWidth={3} />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#1A1A1A',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 10,
    ...Platform.select({
      web: { boxShadow: '4px 4px 0px #1A1A1A' },
      default: { elevation: 0 }
    }),
  },
  containerCompleted: {
    backgroundColor: '#00E676',
  },
  textContainer: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  titleCompleted: {
    color: '#1A1A1A',
  },
  slider: {
    height: 54,
    width: 60,
    backgroundColor: '#FFD700',
    borderRightWidth: 3,
    borderColor: '#1A1A1A',
    position: 'absolute',
    left: 0,
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  sliderCompleted: {
    backgroundColor: '#1A1A1A',
    borderRightWidth: 0,
  }
});
