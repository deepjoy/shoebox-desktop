import { useEffect, useRef, useState } from "react";
import { Box, Flex, HStack, Text } from "@chakra-ui/react";

const COLLAPSED_WIDTH = 240;
const EXPANDED_WIDTH = 680;
const HEIGHT = 44;
const RESERVED_SPACE = 64;

type Props = {
  scrollRoot: React.RefObject<HTMLElement | null>;
};

export function FloatingBar({ scrollRoot }: Props) {
  const [hovered, setHovered] = useState(false);
  const [floating, setFloating] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const el = scrollRoot.current;
    if (!el) return;

    const onScroll = () => {
      const y = el.scrollTop;
      const prev = lastScrollY.current;
      if (y <= 4) {
        setFloating(false);
      } else if (y < prev) {
        setFloating(true);
      } else if (y > prev) {
        setFloating(false);
      }
      lastScrollY.current = y;
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollRoot]);

  const expanded = hovered;
  const width = expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  return (
    <Box
      position="sticky"
      top={0}
      height={`${RESERVED_SPACE}px`}
      width="100%"
      zIndex={10}
      pointerEvents="none"
    >
      <Flex justify="center" width="100%" height="100%" align="center">
        <Box
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          position={floating ? "fixed" : "relative"}
          top={floating ? "12px" : undefined}
          left={floating ? "50%" : undefined}
          transform={floating ? "translateX(-50%)" : undefined}
          width={`${width}px`}
          height={`${HEIGHT}px`}
          borderRadius="full"
          bg="gray.900"
          color="whiteAlpha.900"
          boxShadow={
            floating
              ? "0 12px 32px rgba(0,0,0,0.28), 0 2px 6px rgba(0,0,0,0.18)"
              : "0 4px 12px rgba(0,0,0,0.12)"
          }
          transition="width 220ms cubic-bezier(0.22, 1, 0.36, 1), top 220ms ease, box-shadow 220ms ease, transform 220ms ease"
          pointerEvents="auto"
          overflow="hidden"
        >
          <BarContent expanded={expanded} />
        </Box>
      </Flex>
    </Box>
  );
}

function BarContent({ expanded }: { expanded: boolean }) {
  return (
    <Flex align="center" height="100%" px="4" gap="3">
      <Flex align="center" gap="2" flexShrink={0}>
        <Box
          width="8px"
          height="8px"
          borderRadius="full"
          bg="green.400"
          boxShadow="0 0 0 3px rgba(72,187,120,0.22)"
        />
        <Text fontSize="sm" fontWeight="medium">
          Shoebox
        </Text>
      </Flex>

      <Box
        flex="1"
        opacity={expanded ? 1 : 0}
        transform={expanded ? "translateX(0)" : "translateX(8px)"}
        transition="opacity 180ms ease 60ms, transform 180ms ease 60ms"
        overflow="hidden"
        whiteSpace="nowrap"
      >
        <HStack gap="4" justify="center">
          <NavLink label="Dashboard" />
          <NavLink label="Snapshots" />
          <NavLink label="Activity" />
          <NavLink label="Settings" />
        </HStack>
      </Box>

      <Flex
        align="center"
        gap="2"
        flexShrink={0}
        opacity={expanded ? 1 : 0}
        transition="opacity 120ms ease"
      >
        <Text fontSize="xs" color="whiteAlpha.700">
          ⌘K
        </Text>
      </Flex>
    </Flex>
  );
}

function NavLink({ label }: { label: string }) {
  return (
    <Text
      fontSize="sm"
      color="whiteAlpha.800"
      _hover={{ color: "white" }}
      cursor="pointer"
    >
      {label}
    </Text>
  );
}
