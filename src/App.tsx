import { useEffect, useRef, useState } from "react";
import { Box, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { Provider } from "./ui/provider";
import { LeftNav } from "./layout/LeftNav";
import { FloatingBar } from "./layout/FloatingBar";
import { useUpdate } from "./updates/useUpdate";
import { UpdateDialog } from "./updates/UpdateDialog";

function App() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const updateState = useUpdate();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (updateState.status === "available") setDialogOpen(true);
  }, [updateState.status]);

  return (
    <Provider>
      <Flex minHeight="100vh" width="100vw" align="stretch" bg="gray.50">
        <LeftNav
          updateState={updateState}
          onShowUpdate={() => setDialogOpen(true)}
        />
        <Box
          ref={scrollRef}
          as="main"
          flex="1"
          height="100vh"
          overflowY="auto"
          position="relative"
        >
          <FloatingBar scrollRoot={scrollRef} />
          <Stack px="10" pb="20" gap="6" maxWidth="960px" mx="auto">
            <Heading size="xl">Welcome back</Heading>
            <Text color="gray.600">
              Hover the pill at the top to expand the bar. Scroll down, then
              back up to see it float.
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
                  floating bar reserves space at the top and becomes floating
                  when you scroll back up.
                </Text>
              </Box>
            ))}
          </Stack>
        </Box>
      </Flex>
      <UpdateDialog
        state={updateState}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Provider>
  );
}

export default App;
