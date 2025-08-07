import { RichText } from "@10play/tentap-editor";
import useEditor from "./editor";
import { useEffect } from "react";
import tw from "../tw";
import { JSONContent } from "@/types/type.db";

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