import { ThemedText } from "@/components/ui/ThemedText";
import { useAuth } from "@/context/AuthProvider";
import { useTheme } from "@/context/ThemeProvider";
import { useUserUpdateMutation } from "@/features/user/userMutations";
import tw from "@/lib/tw";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { Controller, Form, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, View } from "react-native";
import * as z from 'zod';
import * as Burnt from 'burnt';
import { Label } from "@/components/ui/Label";
import { Input, InputBottomSheet } from "@/components/ui/Input";
import { Button, ButtonText } from "@/components/ui/Button";
import { useUsernameAvailability } from "@/hooks/useUsernameAvailability";
import useDebounce from "@/hooks/useDebounce";

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 15;

const AccountSettings = () => {
	const { user, session } = useAuth();
	const { t } = useTranslation();
	const { colors } = useTheme();
	const updateProfileMutation = useUserUpdateMutation({
		userId: user?.id,
	});
	const [ isLoading, setIsLoading ] = useState(false);
	const date = new Date();
	const dateLastUsernameUpdate = user?.username_updated_at
		? new Date(user.username_updated_at)
		: new Date('01/01/1970');

	const accountFormSchema = z.object({
		username: z
		.string()
		.min(USERNAME_MIN_LENGTH, {
			message: t('common.form.length.char_min', { count: USERNAME_MIN_LENGTH }),
		})
		.max(USERNAME_MAX_LENGTH, {
			message: t('common.form.length.char_max', { count: USERNAME_MAX_LENGTH }),
		})
		.regex(/^[^\W]/, {
			message: t('common.form.username.schema.first_char'),
		})
		.regex(/^(?!.*\.\.)/, {
			message: t('common.form.username.schema.double_dot'),
		})
		.regex(/^(?!.*\.$)/, {
			message: t('common.form.username.schema.ends_with_dot'),
		})
		.regex(/^[\w.]+$/, {
			message: t('common.form.username.schema.format'),
		}),
		private: z.boolean(),
		email: z.string()
		.email({
			message: t('common.form.email.error.invalid'),
		})
	});
	type AccountFormValues = z.infer<typeof accountFormSchema>;
	const defaultValues: Partial<AccountFormValues> = {
		username: user?.username,
		private: user?.private,
		email: session?.user.email,
	};
	const form = useForm<AccountFormValues>({
		resolver: zodResolver(accountFormSchema),
		defaultValues,
		mode: 'onChange',
	});
	const usernameAvailability = useUsernameAvailability();
	const usernameToCheck = useDebounce(form.watch('username'), 500);

	const onSubmit = async (values: AccountFormValues) => {
		try {
			if (!user) return;
			setIsLoading(true);
			if (
				values.username !== user.username
				|| values.private !== user.private
			) {
				await updateProfileMutation.mutateAsync({
					username: values.username,
					privateAccount: values.private,
				});
			}
			Burnt.toast({
				title: t('common.word.saved'),
				preset: 'done',
			})
		} catch (error: any) {
			Burnt.toast({
				title: error.message,
				preset: 'error',
			});
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (user || session) {
			form.reset({
				username: user?.username,
				private: user?.private,
				email: session?.user.email
			});
		}
	}, [user, session]);

	return (
		<>
			<Controller
			name='username'
			control={form.control}
			render={({ field: { onChange, onBlur, value} }) => (
				<View style={tw`gap-2`}>
					<View style={tw`flex-row items-center justify-between`}>
						<Label>{t('pages.settings.account.username.label')}</Label>
						<ThemedText>{value?.length ?? 0} / {USERNAME_MAX_LENGTH}</ThemedText>
					</View>
					<InputBottomSheet
					placeholder={t('pages.settings.account.username.placeholder')}
					value={value}
					autoCorrect={false}
					onBlur={onBlur}
					onChangeText={onChange}
					/>
					<Text style={[{ color: colors.mutedForeground }, tw`text-sm text-justify`]}>
						{t('pages.settings.account.username.description')}
					</Text>
				</View>
			)}
			/>
			<Button
			onPress={form.handleSubmit(onSubmit)}
			disabled={isLoading}
			>
				{isLoading ? <ActivityIndicator color={colors.background} /> : null}
				<ButtonText>{t('common.word.save')}</ButtonText>
			</Button>
		</>
	)
};

export default AccountSettings;