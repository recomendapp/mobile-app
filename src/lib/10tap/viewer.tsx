import useEditor from "./editor";
import { useEffect } from "react";
import { JSONContent } from "@recomendapp/types";
import { RichText } from "@/components/RichText/RichText";

interface ViewerProps {
	content?: JSONContent;
}

const Viewer = ({ content } : ViewerProps) => {
	const editor = useEditor({
		initialContent: content as any,
		editable: false,
	});

	useEffect(() => {
		content && editor.setContent(content);
	}, [content]);
	
	return (
		<RichText
		editor={editor}
		/>
	)
};

export default Viewer;