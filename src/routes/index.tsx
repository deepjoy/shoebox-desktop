import { Box, Heading, Text } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";

function HomePage() {
  return (
    <>
      <Heading size="xl">Welcome back</Heading>
      <Text color="gray.600">
        Hover the pill at the top to expand the bar. Scroll down, then back up
        to see it float.
      </Text>
      {Array.from({ length: 24 }).map((_, i) => (
        <Box
          key={i}
          p="6"
          borderRadius="lg"
          bg="white"
          borderWidth="1px"
          borderColor="gray.200"
          boxShadow="sm"
        >
          <Heading size="md" mb="2">
            Card {i + 1}
          </Heading>
          <Text color="gray.600">
            Placeholder content so the page is long enough to scroll. The
            floating bar reserves space at the top and becomes floating when
            you scroll back up.
          </Text>
        </Box>
      ))}
    </>
  );
}

export const Route = createFileRoute("/")({
  component: HomePage,
});
