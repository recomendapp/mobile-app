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
			background-color: ${colors.background};
			color: ${colors.foreground};
			padding: 0;
			margin: 0;
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
	`, [colors]);
	return useEditorBridge({
			avoidIosKeyboard: avoidIosKeyboard,
			theme: {
				toolbar: {
					toolbarBody: {
						backgroundColor: colors.muted,
						borderTopWidth: 0,
						borderBottomWidth: 0,
						paddingTop: 16,
						paddingBottom: 16,
						height: 'auto',
					},
					toolbarButton: {
						backgroundColor: colors.muted,
					}
				},
				webview: {
					backgroundColor: colors.background,
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