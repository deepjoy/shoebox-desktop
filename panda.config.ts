import { defineConfig } from "@pandacss/dev";
import chakraPreset from "@chakra-ui/panda-preset";

export default defineConfig({
  preflight: true,
  presets: [chakraPreset],
  include: ["./src/**/*.{ts,tsx,js,jsx}"],
  exclude: [],
  jsxFramework: "react",
  outdir: "styled-system",
  importMap: "styled-system",
});
