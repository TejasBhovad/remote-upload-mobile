import { forwardRef } from "react";
import { Link } from "expo-router";
import { ThemedText } from "./ThemedText";

export const LinkText = forwardRef(({ to, style, children, ...props }, ref) => (
  <Link href={to}>
    <ThemedText
      ref={ref}
      type="link"
      style={[
        {
          textDecorationLine: "underline",
          marginVertical: 8,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </ThemedText>
  </Link>
));

LinkText.displayName = "LinkText";
