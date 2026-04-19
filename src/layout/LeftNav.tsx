import { useState } from "react";
import { Box, Flex, IconButton, Text, VStack } from "@chakra-ui/react";
import { css } from "../../styled-system/css";

type NavItem = { label: string; icon: string };

const items: NavItem[] = [
  { label: "Home", icon: "⌂" },
  { label: "Library", icon: "⌘" },
  { label: "Recent", icon: "◷" },
  { label: "Shared", icon: "⇆" },
  { label: "Trash", icon: "⌫" },
];

export function LeftNav() {
  const [collapsed, setCollapsed] = useState(false);
  const width = collapsed ? "64px" : "240px";

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

      <Flex
        align="center"
        gap="3"
        px="3"
        py="3"
        borderTopWidth="1px"
        borderColor="inherit"
        position="sticky"
        bottom={0}
        bg="inherit"
      >
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
          flexShrink={0}
        >
          DJ
        </Box>
        {!collapsed && (
          <Box minWidth="0">
            <Text fontSize="sm" fontWeight="medium" truncate>
              DJ Majumdar
            </Text>
            <Text fontSize="xs" color="gray.500" truncate>
              claude@deepjoy.us
            </Text>
          </Box>
        )}
      </Flex>
    </Flex>
  );
}
