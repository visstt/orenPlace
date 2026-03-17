import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS, SIZES } from '../../utils/constants';

const { width } = Dimensions.get('window');

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export default function SkeletonLoader({
  width: customWidth = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonLoaderProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width: customWidth as any,
          height,
          borderRadius,
          backgroundColor: COLORS.skeleton,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function EventCardSkeleton() {
  return (
    <View style={skeletonStyles.card}>
      <SkeletonLoader height={180} borderRadius={0} />
      <View style={skeletonStyles.content}>
        <SkeletonLoader width={80} height={24} borderRadius={12} />
        <SkeletonLoader
          height={20}
          style={{ marginTop: 10 }}
          borderRadius={6}
        />
        <SkeletonLoader
          width="70%"
          height={14}
          style={{ marginTop: 8 }}
          borderRadius={6}
        />
        <View style={skeletonStyles.footer}>
          <SkeletonLoader width={100} height={14} borderRadius={6} />
          <SkeletonLoader width={60} height={18} borderRadius={6} />
        </View>
      </View>
    </View>
  );
}

export function CategorySkeleton() {
  return (
    <View style={skeletonStyles.categoryCard}>
      <SkeletonLoader width={56} height={56} borderRadius={14} />
      <View style={{ flex: 1, marginLeft: 14 }}>
        <SkeletonLoader width="60%" height={18} borderRadius={6} />
        <SkeletonLoader
          width="40%"
          height={14}
          style={{ marginTop: 6 }}
          borderRadius={6}
        />
      </View>
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: 16,
    overflow: 'hidden',
  },
  content: {
    padding: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 12,
  },
});
