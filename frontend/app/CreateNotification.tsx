// @ts-nocheck
import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import CreateNotificationScreen from '../screen/CreateNotificationScreen';

export default function CreateNotificationPage() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Reconstruct notification object if passed as params
  const notification = params?.notification
    ? (typeof params.notification === 'string' ? JSON.parse(params.notification) : params.notification)
    : undefined;

  const route = { params: notification ? { notification } : {} };
  const navigation = { goBack: () => router.back() };

  return <CreateNotificationScreen route={route} navigation={navigation} />;
}