import * as React from "react"
import { Input } from "./input"

import { cn } from "@/lib/utils"
import { EyeOff } from "@/lib/icons/EyeOff"
import { Eye } from "@/lib/icons/Eye"
import { TextInput, TextInputProps, View } from "react-native"
import { Pressable } from "react-native-gesture-handler"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const InputPassword = React.forwardRef<React.ElementRef<typeof TextInput>, TextInputProps>(
  ({ className, ...props }, ref) => {
  const [show, setShow] = React.useState(false);
  return (
    <View className="relative">
      <Input
        ref={ref}
        secureTextEntry={!show}
        className={cn(
          "pr-10",
          className
        )}
        {...props}
      />
      <Pressable
      style={{ position: "absolute", top: "50%", right: 8, transform: [{ translateY: "-50%" }] }}
      onPress={() => setShow((prev) => !prev)}
      >
        {show ? <EyeOff size={20} className="text-muted-foreground hover:text-foreground" /> : <Eye size={20} className="text-muted-foreground hover:text-foreground" />}
      </Pressable>
    </View>
  )
})
InputPassword.displayName = "InputPassword"

export { InputPassword }
