import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

export type AuthStackParamList = {
  Authenticate: undefined;
};

export type AppStackParamList = {
  Batches: undefined;
  ClusterOverview: {
    batchId: string;
  };
  IdeaDetails: {
    batchId: string;
    clusterId: string;
    ideaId: string;
  };
};

export type AppStackScreenProps<RouteName extends keyof AppStackParamList> = {
  navigation: NativeStackNavigationProp<AppStackParamList, RouteName>;
  route: RouteProp<AppStackParamList, RouteName>;
};

export type AuthStackScreenProps<RouteName extends keyof AuthStackParamList> = {
  navigation: NativeStackNavigationProp<AuthStackParamList, RouteName>;
  route: RouteProp<AuthStackParamList, RouteName>;
};
