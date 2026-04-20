import { useState } from "react";
import {
  Badge,
  Box,
  Flex,
  IconButton,
  Menu,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useNavigate } from "@tanstack/react-router";
import { css } from "../../styled-system/css";
import type { UpdateState } from "../updates/useUpdate";

type NavItem = { label: string; icon: string };

const items: NavItem[] = [
  { label: "Home", icon: "⌂" },
  { label: "Library", icon: "⌘" },
  { label: "Recent", icon: "◷" },
  { label: "Shared", icon: "⇆" },
  { label: "Trash", icon: "⌫" },
];

type Props = {
  updateState: UpdateState;
  onShowUpdate: () => void;
};

export function LeftNav({ updateState, onShowUpdate }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const width = collapsed ? "64px" : "240px";
  const updateAvailable = updateState.status === "available";
  const navigate = useNavigate();

  return (
    <Flex
      as="nav"
      direction="column"
      position="sticky"
      top={0}
      height="100vh"
      width={width}
      flexShrink={0}
      borderRightWidth="1px"
      borderColor="gray.200"
      bg="white"
      transition="width 180ms ease"
      className={css({ _dark: { bg: "gray.900", borderColor: "gray.800" } })}
    >
      <Flex
        align="center"
        justify={collapsed ? "center" : "space-between"}
        px="3"
        height="56px"
        borderBottomWidth="1px"
        borderColor="inherit"
      >
        {!collapsed && (
          <Text fontWeight="semibold" fontSize="sm">
            Shoebox
          </Text>
        )}
        <IconButton
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          size="sm"
          variant="ghost"
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? "›" : "‹"}
        </IconButton>
      </Flex>

      <VStack align="stretch" gap="1" px="2" py="3" flex="1" overflowY="auto">
        {items.map((item) => (
          <Flex
            key={item.label}
            align="center"
            gap="3"
            px="3"
            py="2"
            borderRadius="md"
            cursor="pointer"
            _hover={{ bg: "gray.100" }}
            title={collapsed ? item.label : undefined}
          >
            <Box fontSize="lg" width="20px" textAlign="center">
              {item.icon}
            </Box>
            {!collapsed && <Text fontSize="sm">{item.label}</Text>}
          </Flex>
        ))}
      </VStack>

      <Box
        borderTopWidth="1px"
        borderColor="inherit"
        position="sticky"
        bottom={0}
        bg="inherit"
      >
        <Menu.Root positioning={{ placement: "top-start" }}>
          <Menu.Trigger asChild>
            <Flex
              as="button"
              align="center"
              gap="3"
              px="3"
              py="3"
              width="100%"
              textAlign="left"
              cursor="pointer"
              _hover={{ bg: "gray.50" }}
              _focusVisible={{ outline: "2px solid", outlineColor: "teal.400" }}
            >
              <Box position="relative" flexShrink={0}>
                <Box
                  width="32px"
                  height="32px"
                  borderRadius="full"
                  bgGradient="linear(to-br, teal.400, purple.500)"
                  color="white"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontWeight="bold"
                  fontSize="sm"
                >
                  DJ
                </Box>
                {updateAvailable && (
                  <Box
                    position="absolute"
                    top="-2px"
                    right="-2px"
                    width="10px"
                    height="10px"
                    borderRadius="full"
                    bg="green.400"
                    borderWidth="2px"
                    borderColor="white"
                    aria-label="Update available"
                  />
                )}
              </Box>
              {!collapsed && (
                <Box minWidth="0" flex="1">
                  <Text fontSize="sm" fontWeight="medium" truncate>
                    DJ Majumdar
                  </Text>
                  <Text fontSize="xs" color="gray.500" truncate>
                    claude@deepjoy.us
                  </Text>
                </Box>
              )}
              {!collapsed && (
                <Text fontSize="md" color="gray.400" flexShrink={0}>
                  ⋯
                </Text>
              )}
            </Flex>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content minWidth="220px">
                <Menu.Item value="profile">
                  <Menu.ItemText>Profile</Menu.ItemText>
                </Menu.Item>
                <Menu.Item
                  value="settings"
                  onClick={() => navigate({ to: "/settings/secrets" })}
                >
                  <Menu.ItemText>Settings</Menu.ItemText>
                </Menu.Item>
                <Menu.Separator />
                <UpdateMenuEntry
                  updateState={updateState}
                  onShowUpdate={onShowUpdate}
                />
                <Menu.Separator />
                <Menu.Item value="sign-out" color="red.600">
                  <Menu.ItemText>Sign out</Menu.ItemText>
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </Box>
    </Flex>
  );
}

function UpdateMenuEntry({
  updateState,
  onShowUpdate,
}: {
  updateState: UpdateState;
  onShowUpdate: () => void;
}) {
  const { status, update, checkForUpdate } = updateState;

  if (status === "available" && update) {
    return (
      <Menu.Item
        value="update"
        onClick={onShowUpdate}
        closeOnSelect
      >
        <Flex align="center" justify="space-between" width="100%" gap="3">
          <Menu.ItemText>Update available</Menu.ItemText>
          <Badge colorPalette="green" variant="subtle">
            v{update.version}
          </Badge>
        </Flex>
      </Menu.Item>
    );
  }

  const label =
    status === "checking"
      ? "Checking for updates…"
      : status === "up-to-date"
        ? "You're up to date"
        : status === "error"
          ? "Check for updates (retry)"
          : "Check for updates";

  return (
    <Menu.Item
      value="check-update"
      onClick={() => checkForUpdate()}
      disabled={status === "checking"}
      closeOnSelect={false}
    >
      <Menu.ItemText>{label}</Menu.ItemText>
    </Menu.Item>
  );
}
