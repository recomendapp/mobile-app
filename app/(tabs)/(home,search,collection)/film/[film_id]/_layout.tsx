import { Slot } from 'expo-router';
import { ThemedAnimatedView } from '@/components/ui/ThemedAnimatedView';
import tw from '@/lib/tw';

const FilmLayout = () => {
	return (
		<ThemedAnimatedView style={tw.style('flex-1')}>
			<Slot />
		</ThemedAnimatedView>
	);
};

export default FilmLayout;