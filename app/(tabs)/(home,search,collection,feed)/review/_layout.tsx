import { Stack } from "expo-router";

const ReviewLayout = () => {
  return (
    <Stack>
      <Stack.Protected guard={true}>
		<Stack.Screen name="review" />
	  </Stack.Protected>
    </Stack>
  );
};

export default ReviewLayout;