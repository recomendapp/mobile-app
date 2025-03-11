import * as React from "react"
import { Input } from "./input"
import { EyeOff } from "@/lib/icons/EyeOff"
import { Eye } from "@/lib/icons/Eye"
import { TextInput, TextInputProps, View } from "react-native"
import { Pressable } from "react-native-gesture-handler"
import { useTheme } from "@/context/ThemeProvider"
import tw from "@/lib/tw"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const InputPassword = React.forwardRef<React.ElementRef<typeof TextInput>, TextInputProps>(
  ({ style, ...props }, ref) => {
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
        {show ? <EyeOff color={colors.mutedForeground} size={20} /> : <Eye color={colors.mutedForeground} size={20} />}
      </Pressable>
    </View>
  )
})
InputPassword.displayName = "InputPassword"

export { InputPassword }
