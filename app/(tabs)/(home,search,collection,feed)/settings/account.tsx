import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useUserUpdateMutation } from "@/features/user/userMutations";
import tw from "@/lib/tw";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import * as z from 'zod';
import * as Burnt from 'burnt';
import { Button } from "@/components/ui/Button";
import { useUsernameAvailability } from "@/hooks/useUsernameAvailability";
import useDebounce from "@/hooks/useDebounce";
import { Input } from "@/components/ui/Input";
import { Icons } from "@/constants/Icons";
import { useTranslations } from "use-intl";

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 15;

const AccountSettings = () => {
	const { user, session } = useAuth();
	const t = useTranslations();
	const { colors } = useTheme();
	const updateProfileMutation = useUserUpdateMutation({
		userId: user?.id,
	});
	const [ isLoading, setIsLoading ] = useState(false);
	const date = new Date();
	const dateLastUsernameUpdate = user?.username_updated_at
		? new Date(user.username_updated_at)
		: new Date('01/01/1970');
	const usernameDisabled = (date.getTime() - dateLastUsernameUpdate.getTime()) / (1000 * 60 * 60 * 24) < 30 ? true : false;

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
		email: z.email({ error: t('common.form.email.error.invalid') })
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

	// Handlers
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
				title: t('common.messages.saved', { count: 1, gender: 'male' }),
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

	// useEffects
	useEffect(() => {
		if (!form.formState.errors.username?.message && usernameToCheck && usernameToCheck !== user?.username) {
			usernameAvailability.check(usernameToCheck);
		}
	}, [usernameToCheck]);
	useEffect(() => {
		if (usernameAvailability.isAvailable === false) {
			form.setError('username', {
				message: t('common.form.username.schema.unavailable'),
			});
		}
	}, [usernameAvailability.isAvailable, t]);
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
			render={({ field: { onChange, onBlur, value } }) => (
				<Input
				label={t('pages.settings.account.username.label')}
				icon={Icons.User}
				disabled={usernameDisabled}
				autoComplete="username"
				autoCapitalize='none'
				placeholder={t('pages.settings.account.username.placeholder')}
				value={value}
				autoCorrect={false}
				onBlur={onBlur}
				onChangeText={onChange}
				leftSectionStyle={tw`w-auto`}
				rightComponent={!form.formState.errors.username ? (
					usernameAvailability.isLoading ? <Icons.Loader />
					: (
						<View style={[{ backgroundColor: usernameAvailability.isAvailable ? colors.success : colors.destructive }, tw`rounded-full h-6 w-6 items-center justify-center`]}>
							{usernameAvailability.isAvailable ? (
								<Icons.Check size={17} color={colors.successForeground} />
							) : <Icons.Cancel size={17} color={colors.destructiveForeground} />}
						</View>
					)
				) : undefined}
				error={form.formState.errors.username?.message}
				/>
			)}
			/>
			<Button
			loading={isLoading}
			onPress={form.handleSubmit(onSubmit)}
			disabled={isLoading}
			>
				{t('common.messages.save')}
			</Button>
		</>
	)
};

export default AccountSettings;