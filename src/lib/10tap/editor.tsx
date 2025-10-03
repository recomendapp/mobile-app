import { useTheme } from "@/providers/ThemeProvider";
import { CoreBridge, EditorBridge, PlaceholderBridge, TenTapStartKit, useEditorBridge } from "@10play/tentap-editor";
import { useMemo } from "react";

const useEditor = ({
	theme,
	avoidIosKeyboard = false,
	dynamicHeight = true,
	...props
}: Partial<EditorBridge> = {}) => {
	const { colors } = useTheme();
	const customCodeBlockCSS = useMemo(() => `
		* {
			background-color: 'transparent';
			color: ${colors.foreground};
			padding: 0;
			margin: 0;
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		}
		strong, b {
			color: ${colors.accentYellow};
		}
		blockquote {
			border-left: 3px solid #babaca;
			padding-left: 1rem;
		}
		.highlight-background {
			background-color: ${colors.background};
		}
		.placeholder {
			color: ${colors.muted};
			font-style: italic;
		}
		a {
			color: ${colors.accentPink};
		}
	`, [colors]);
	return useEditorBridge({
			avoidIosKeyboard: avoidIosKeyboard,
			theme: {
				toolbar: {
					toolbarBody: {
						backgroundColor: 'transparent',
						borderTopWidth: 0,
						borderBottomWidth: 0,
					},
					toolbarButton: {
						backgroundColor: 'transparent',
					},
					iconWrapper: {
						backgroundColor: 'transparent',
					},
					iconWrapperActive: {
						backgroundColor: 'transparent',
					},
					icon: {
						tintColor: colors.foreground,
					},
					iconActive: {
						tintColor: colors.accentYellow,
					},
					iconDisabled: {
						tintColor: colors.mutedForeground,
					},
					linkBarTheme: {
						addLinkContainer: {
							backgroundColor: 'transparent',
							borderTopWidth: 0,
							borderBottomWidth: 0,
						},
						linkInput: {
							color: colors.foreground,
						},
						placeholderTextColor: colors.mutedForeground,
						doneButtonText: {
							color: colors.accentYellow,
						},
						doneButton: {
							backgroundColor: colors.muted,
						},
					},
				},
				webview: {
					backgroundColor: 'transparent',
				},
				...(theme || {}) 
			},
			bridgeExtensions: [
				...TenTapStartKit,
				PlaceholderBridge.configureExtension({
					placeholder: 'This movie sucks af...',
				}),
				CoreBridge.configureCSS(customCodeBlockCSS),
			],
			dynamicHeight: dynamicHeight,
			...props,
		});
};

export default useEditor;