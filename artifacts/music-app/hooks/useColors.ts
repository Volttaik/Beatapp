import { useColorScheme } from "react-native";
import colors from "@/constants/colors";

type ColorScheme = typeof colors.dark;

export function useColors(): ColorScheme & { radius: number } {
  const scheme = useColorScheme();
  const palette: ColorScheme = scheme === "light" ? colors.light : colors.dark;
  return { ...palette, radius: colors.radius };
}
