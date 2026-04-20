import { useEffect, useRef, useState } from "react";
import { Box, Flex, Stack } from "@chakra-ui/react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Provider } from "../ui/provider";
import { LeftNav } from "../layout/LeftNav";
import { FloatingBar } from "../layout/FloatingBar";
import { useUpdate } from "../updates/useUpdate";
import { UpdateDialog } from "../updates/UpdateDialog";

function RootLayout() {
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
            <Outlet />
          </Stack>
        </Box>
      </Flex>
      <UpdateDialog
        state={updateState}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
      {import.meta.env.DEV && (
        <TanStackRouterDevtools position="bottom-right" />
      )}
    </Provider>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});
