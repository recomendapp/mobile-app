import * as React from "react"
import { Input } from "./Input"
import { TextInput, TextInputProps, View } from "react-native"
import { Pressable } from "react-native-gesture-handler"
import { useTheme } from "@/providers/ThemeProvider"
import tw from "@/lib/tw"
import { Icons } from "@/constants/Icons"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const InputPassword = React.forwardRef<React.ComponentRef<typeof TextInput>, TextInputProps>(
  ({ style, secureTextEntry, ...props }, ref) => {
  const { colors } = useTheme()
  const [show, setShow] = React.useState(false);
  return (
    <View className="relative">
      <Input
        ref={ref}
        secureTextEntry={!show}
        style={[
          tw.style("pr-10"),
          style,
        ]}
        {...props}
      />
      <Pressable
      style={{ position: "absolute", top: "50%", right: 8, transform: [{ translateY: "-50%" }] }}
      onPress={() => setShow((prev) => !prev)}
      >
        {show ? <Icons.EyeOff color={colors.mutedForeground} size={20} /> : <Icons.Eye color={colors.mutedForeground} size={20} />}
      </Pressable>
    </View>
  )
})
InputPassword.displayName = "InputPassword"

export { InputPassword }
