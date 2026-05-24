export interface FeatureFlags {
  devTools: boolean;
  mockData: boolean;
  chat: boolean;
  contentManagement: boolean;
  coinSystem: boolean;
  teacherConnections: boolean;
  schoolManagement: boolean;
  paymentIntegration: boolean;
}

export function getFeatureFlags(env: { NODE_ENV: string }): FeatureFlags {
  const isDev = env.NODE_ENV === "development";

  return {
    devTools: isDev,
    mockData: isDev,
    chat: true,
    contentManagement: true,
    coinSystem: false,
    teacherConnections: false,
    schoolManagement: false,
    paymentIntegration: false,
  };
}
