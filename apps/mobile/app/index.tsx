import React from 'react';
import { Redirect } from 'expo-router';

export default function Index() {
  // Directs cleanly to the main authenticated dashboard tabs
  return <Redirect href="/(tabs)" />;
}
