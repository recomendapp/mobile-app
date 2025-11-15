import React, { useMemo } from 'react';
import { DEFAULT_TOOLBAR_ITEMS, EditorBridge, ToolbarItem, Toolbar as RNToolbar } from '@10play/tentap-editor';
import { KeyboardToolbar } from '@/components/ui/KeyboardToolbar';
import { KeyboardToolbarProps } from 'react-native-keyboard-controller';

interface ToolbarProps extends KeyboardToolbarProps {
  editor: EditorBridge;
}

export function Toolbar({
	editor,
	showArrows = false,
	...props
}: ToolbarProps) {
	const items = useMemo<ToolbarItem[]>(() => {
		return [
			DEFAULT_TOOLBAR_ITEMS[13], // undo
			DEFAULT_TOOLBAR_ITEMS[14], // redo
			DEFAULT_TOOLBAR_ITEMS[0], // bold
			DEFAULT_TOOLBAR_ITEMS[6], // underline
			DEFAULT_TOOLBAR_ITEMS[1], // italic
			DEFAULT_TOOLBAR_ITEMS[7], // strikethrough
			DEFAULT_TOOLBAR_ITEMS[2], // link
		];
	}, [])
	return (
	<KeyboardToolbar
	showArrows={showArrows}
	content={
		<RNToolbar
		editor={editor}
		items={items}
		/>
	}
	{...props}
	/>
	)
}
