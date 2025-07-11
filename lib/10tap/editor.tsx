// import { useTheme } from "@/providers/ThemeProvider";
// import { CoreBridge, PlaceholderBridge, TenTapStartKit, useEditorBridge } from "@10play/tentap-editor";
// import { useMemo } from "react";

// interface useEditorProps {
// 	initialContent?: string | object;
// 	editable?: boolean;
// }

// const useEditor = ({
// 	...props
// } : useEditorProps) => {
// 	const { colors } = useTheme();
// 	const customCodeBlockCSS = useMemo(() => `
// 		* {
// 			background-color: ${colors.background};
// 			color: ${colors.foreground};
// 		}
// 		blockquote {
// 			border-left: 3px solid #babaca;
// 			padding-left: 1rem;
// 		}
// 		.highlight-background {
// 			background-color: ${colors.background};
// 		}
// 		.placeholder {
// 			color: ${colors.muted};
// 			font-style: italic;
// 		}
// 	`, [colors]);
// 	return useEditorBridge({
// 			avoidIosKeyboard: true,
// 			theme: {
// 				toolbar: {
// 					toolbarBody: {
// 						backgroundColor: colors.muted,
// 						borderTopWidth: 0,
// 						borderBottomWidth: 0,
// 						paddingTop: 16,
// 						paddingBottom: 16,
// 						height: 'auto',
// 					},
// 					toolbarButton: {
// 						backgroundColor: colors.muted,
// 					}
// 				},
// 				webview: {
// 					backgroundColor: colors.background,
// 				}
// 			},
// 			bridgeExtensions: [
// 				...TenTapStartKit,
// 				PlaceholderBridge.configureExtension({
// 					placeholder: 'This movie sucks af...',
// 				}),
// 				CoreBridge.configureCSS(customCodeBlockCSS),
// 			],
// 			dynamicHeight: true,
// 			...props,
// 		});
// };

// export default useEditor;