import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { usePathname, Link } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

const Navbar = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "/(tabs)", icon: "home", label: "Home" },
    { href: "/(tabs)/upload", icon: "upload-file", label: "Upload" },
    { href: "/(tabs)/flashcards", icon: "book", label: "Flashcards" },
    { href: "/(tabs)/tests", icon: "assignment", label: "Tests" },
    { href: "/(tabs)/settings", icon: "settings", label: "Settings" },
  ];

  return (
    <View style={styles.navbar}>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} asChild>
            <TouchableOpacity style={styles.navItem}>
              <MaterialIcons
                name={item.icon}
                size={24}
                color={isActive ? "#06b6d4" : "#666"}
              />
              <Text
                style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          </Link>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 64,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  navLabel: {
    fontSize: 12,
    marginTop: 4,
    color: "#666",
  },
  navLabelActive: {
    color: "#06b6d4",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#06b6d4",
  },
});

export default Navbar;
