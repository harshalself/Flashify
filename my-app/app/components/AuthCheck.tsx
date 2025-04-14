import React from "react";
import { useAuth } from "../../context/AuthContext";
import { router } from "expo-router";
import { View, ActivityIndicator } from "react-native";

interface AuthCheckProps {
  children: React.ReactNode;
}

const AuthCheck: React.FC<AuthCheckProps> = ({ children }) => {
  const { user, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace("/(auth)/login");
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#06b6d4" />
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default AuthCheck;
