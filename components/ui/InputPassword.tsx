import * as React from "react"
import { Input } from "./input"
import { Pressable } from "react-native-gesture-handler"
import { useTheme } from "@/providers/ThemeProvider"
import { Icons } from "@/constants/Icons"
import { useTranslation } from "react-i18next"
import { upperFirst } from "lodash"

export interface InputPasswordProps
  extends React.ComponentProps<typeof Input> {}

const InputPassword = React.forwardRef<React.ComponentRef<typeof Input>, InputPasswordProps>(
  ({ secureTextEntry, icon = Icons.Password, onFocus, onBlur, label, ...props }, ref) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [show, setShow] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  return (
    <Input
      ref={ref}
      secureTextEntry={!show}
      label={label === null ? undefined : (label ?? upperFirst(t('common.form.password.label')))}
      icon={Icons.Password}
      rightComponent={isFocused ? (
        <Pressable onPress={() => setShow((prev) => !prev)}>
          {show ? (
            <Icons.EyeOff size={20} color={colors.mutedForeground} />
          ) : (
            <Icons.Eye size={20} color={colors.mutedForeground} />
          )}
        </Pressable>
      ) : undefined}
      onFocus={(e) => {
        setIsFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        if (show) setShow(false);
        setIsFocused(false);
        onBlur?.(e);
      }}
      {...props}
    />
  )
})
InputPassword.displayName = "InputPassword"

export { InputPassword }
