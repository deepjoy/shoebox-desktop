import {
  Badge,
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  HStack,
  Portal,
  Progress,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { UpdateState } from "./useUpdate";

type Props = {
  state: UpdateState;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UpdateDialog({ state, open, onOpenChange }: Props) {
  const { update, status, downloaded, total, error, installUpdate } = state;
  if (!update) return null;

  const installing = status === "downloading" || status === "installing";
  const progressValue =
    total != null && total > 0 ? Math.min(100, (downloaded / total) * 100) : null;

  const releaseDate = formatDate(update.date);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      size="lg"
      closeOnInteractOutside={!installing}
      closeOnEscape={!installing}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Stack gap="1">
                <Dialog.Title>Update available</Dialog.Title>
                <HStack gap="2" color="fg.muted" fontSize="sm">
                  <Text>v{update.currentVersion}</Text>
                  <Text>→</Text>
                  <Badge colorPalette="green" variant="subtle">
                    v{update.version}
                  </Badge>
                  {releaseDate && (
                    <Text color="fg.subtle">· {releaseDate}</Text>
                  )}
                </HStack>
              </Stack>
            </Dialog.Header>

            <Dialog.Body>
              <Stack gap="3">
                <Text fontSize="sm" fontWeight="medium">
                  What's new
                </Text>
                <Box
                  maxHeight="320px"
                  overflowY="auto"
                  borderWidth="1px"
                  borderRadius="md"
                  borderColor="border.subtle"
                  bg="bg.subtle"
                  px="4"
                  py="3"
                >
                  {update.body ? (
                    <Text
                      fontSize="sm"
                      whiteSpace="pre-wrap"
                      fontFamily="mono"
                      lineHeight="1.6"
                    >
                      {update.body}
                    </Text>
                  ) : (
                    <Text fontSize="sm" color="fg.muted">
                      No release notes were provided for this version.
                    </Text>
                  )}
                </Box>

                {installing && (
                  <Stack gap="2">
                    <Progress.Root
                      value={progressValue}
                      size="sm"
                      colorPalette="teal"
                    >
                      <Progress.Track>
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                    <HStack justify="space-between" fontSize="xs" color="fg.muted">
                      <Text>
                        {status === "installing"
                          ? "Installing…"
                          : total
                            ? `${formatBytes(downloaded)} / ${formatBytes(total)}`
                            : `Downloading… ${formatBytes(downloaded)}`}
                      </Text>
                      {status === "installing" && <Spinner size="xs" />}
                    </HStack>
                  </Stack>
                )}

                {error && (
                  <Box
                    borderWidth="1px"
                    borderColor="red.200"
                    bg="red.50"
                    color="red.800"
                    borderRadius="md"
                    px="3"
                    py="2"
                    fontSize="sm"
                  >
                    {error}
                  </Box>
                )}
              </Stack>
            </Dialog.Body>

            <Dialog.Footer>
              <Flex justify="flex-end" gap="3" width="100%">
                <Dialog.ActionTrigger asChild>
                  <Button variant="ghost" disabled={installing}>
                    Later
                  </Button>
                </Dialog.ActionTrigger>
                <Button
                  colorPalette="teal"
                  onClick={() => installUpdate()}
                  loading={installing}
                  loadingText={
                    status === "installing" ? "Installing" : "Downloading"
                  }
                >
                  Install and restart
                </Button>
              </Flex>
            </Dialog.Footer>

            {!installing && (
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" position="absolute" top="3" right="3" />
              </Dialog.CloseTrigger>
            )}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(raw: string | undefined): string | null {
  if (!raw) return null;
  // Tauri emits a string like "2026-04-19 10:30:00 +0000"; try Date, fall back to raw.
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  return raw;
}
