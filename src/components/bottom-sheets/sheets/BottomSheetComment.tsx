import React, { useCallback, useMemo } from 'react';
import tw from '@/lib/tw';
import { upperFirst } from 'lodash';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { Button } from '@/components/ui/Button';
import TrueSheet from '@/components/ui/TrueSheet';
import { BottomSheetProps } from '../BottomSheetManager';
import { useTranslations } from 'use-intl';
import { BORDER_RADIUS, GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from '@/theme/globals';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/text';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { View } from '@/components/ui/view';
import { useTheme } from '@/providers/ThemeProvider';
import { Pressable } from 'react-native';

interface BottomSheetCommentProps extends BottomSheetProps {
	comment: string | null;
	commentMinLength?: number;
	commentMaxLength?: number;
	onSave?: (newComment: string | null) => Promise<void>;
	isAllowedToEdit?: boolean;
};

export const BottomSheetComment = React.forwardRef<
  React.ComponentRef<typeof TrueSheet>,
  BottomSheetCommentProps
>(({ id, comment, commentMinLength = 1, commentMaxLength = 180, onSave, isAllowedToEdit = false, ...props }, ref) => {
	const { colors } = useTheme();
	const closeSheet = useBottomSheetStore((state) => state.closeSheet);
	const t = useTranslations();
	const [internalComment, setInternalComment] = React.useState<string | null>(null);
	const [isEditing, setIsEditing] = React.useState<boolean | undefined>();
	const [isLoading, setIsLoading] = React.useState(false);

	/* ---------------------------------- FORM ---------------------------------- */
	const commentSchema = useMemo(() => z.object({
		comment: z.string()
			.min(commentMinLength, { message: upperFirst(t('common.form.length.char_min', { count: commentMinLength }))})
			.max(commentMaxLength, { message: upperFirst(t('common.form.length.char_max', { count: commentMaxLength }))})
			.nullable(),
	}), [commentMinLength, commentMaxLength, t]);
	type CommentFormValues = z.infer<typeof commentSchema>;
	const defaultValues = useMemo((): Partial<CommentFormValues> => ({
		comment: comment || null,
	}), [comment]);
	const form = useForm<CommentFormValues>({
		resolver: zodResolver(commentSchema),
		defaultValues: defaultValues,
		mode: 'onChange',
	});
	/* -------------------------------------------------------------------------- */

	// Handlers
	const handleSave = useCallback(async (values: CommentFormValues) => {
		if (values.comment === comment) {
			closeSheet(id);
			return;
		}
		try {
			setIsLoading(true);
			await onSave?.(values.comment);
			setInternalComment(values.comment);
			setIsEditing(false);
		} finally {
			setIsLoading(false);
		}
	}, [onSave, comment, closeSheet, id]);

	// useEffects
	React.useEffect(() => {
		setInternalComment(comment);
	}, [comment]);
	React.useEffect(() => {
		setIsEditing(comment ? false : isAllowedToEdit);
	}, [comment, isAllowedToEdit]);

	return (
    <TrueSheet
	ref={ref}
	style={{
		gap: GAP,
		paddingTop: PADDING_VERTICAL * 2,
		paddingHorizontal: PADDING_HORIZONTAL,
	}}
	{...props}
	>
		<Text style={tw`text-center text-xl font-bold`}>{upperFirst(t('common.messages.comment', { count: 1 }))}</Text>
		
		{isEditing ? (
		<>
			<Controller
			name='comment'
			control={form.control}
			render={({ field: { onChange, onBlur, value} }) => (
				<View style={tw`gap-2 w-full`}>
					<Input
					variant='outline'
					placeholder={upperFirst(t('common.messages.add_comment', { count: 1 }))}
					value={value || ''}
					autoCorrect={false}
					onBlur={onBlur}
					onChangeText={(text) => onChange(text || null)}
					type='textarea'
					/>
					{form.formState.errors.comment && (
						<Text style={{ color: colors.destructive }}>
						{form.formState.errors.comment.message}
						</Text>
					)}
				</View>
			)}
			/>
			<Button
			loading={isLoading}
			onPress={form.handleSubmit(handleSave)}
			disabled={isLoading || !form.formState.isValid}
			>
				{upperFirst(t('common.messages.save'))}
			</Button>
		</>
		) : (
			<Pressable onPress={isAllowedToEdit ? () => setIsEditing(true) : undefined} style={{ position: 'relative', backgroundColor: colors.background, padding: GAP, borderRadius: BORDER_RADIUS }}>
				{internalComment ? (
					<Text>
						{internalComment}
					</Text>
				) : (
					<Text textColor='muted' style={tw`text-center`}>
						{upperFirst(t('common.messages.no_comment', { count: 1 }))}
					</Text>
				)}
			</Pressable>
		)}
    </TrueSheet>
  );
});
BottomSheetComment.displayName = 'BottomSheetComment';
