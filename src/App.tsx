import { useEffect, useRef } from "react";
import { Box, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { Provider } from "./ui/provider";
import { LeftNav } from "./layout/LeftNav";
import { DynamicIsland } from "./layout/DynamicIsland";

async function runUpdateCheck() {
  const update = await check();
  if (!update) return;
  await update.downloadAndInstall();
  await relaunch();
}

function App() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    runUpdateCheck().catch((err) => console.error("update check failed", err));
  }, []);

  return (
    <Provider>
      <Flex minHeight="100vh" width="100vw" align="stretch" bg="gray.50">
        <LeftNav />
        <Box
          ref={scrollRef}
          as="main"
          flex="1"
          height="100vh"
          overflowY="auto"
          position="relative"
        >
          <DynamicIsland scrollRoot={scrollRef} />
          <Stack px="10" pb="20" gap="6" maxWidth="960px" mx="auto">
            <Heading size="xl">Welcome back</Heading>
            <Text color="gray.600">
              Hover the island at the top to expand the bar. Scroll down, then
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
                  dynamic island reserves space at the top and becomes floating
                  when you scroll back up.
                </Text>
              </Box>
            ))}
          </Stack>
        </Box>
      </Flex>
    </Provider>
  );
}

export default App;
