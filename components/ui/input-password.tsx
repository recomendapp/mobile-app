import * as React from "react"
import { Input } from "./input"

import { cn } from "@/lib/utils"
import { EyeOff } from "@/lib/icons/EyeOff"
import { Eye } from "@/lib/icons/Eye"
import { Pressable, TextInput, TextInputProps, View } from "react-native"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const InputPassword = React.forwardRef<React.ElementRef<typeof TextInput>, TextInputProps>(
  ({ className, ...props }, ref) => {
  const [show, setShow] = React.useState(false)
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
      className="absolute top-1/2 right-2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
      onPress={() => setShow(!show)}
      >
        {show ? <EyeOff size={20} className="text-muted-foreground hover:text-foreground" /> : <Eye size={20} className="text-muted-foreground hover:text-foreground" />}
      </Pressable>
    </View>
  )
})
InputPassword.displayName = "InputPassword"

export { InputPassword }
