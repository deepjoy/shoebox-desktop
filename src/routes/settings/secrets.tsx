import { useMemo, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Flex,
  HStack,
  Heading,
  IconButton,
  Input,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { invoke } from "@tauri-apps/api/core";

type BackendError = { code: string; message: string };

function errorMessage(e: unknown): string {
  if (e && typeof e === "object" && "message" in e) {
    const msg = (e as BackendError).message;
    if (typeof msg === "string" && msg.length > 0) return msg;
  }
  if (e instanceof Error) return e.message;
  return String(e);
}

function SecretsSettings() {
  return (
    <Stack gap="8" maxWidth="720px">
      <Box>
        <Heading size="xl">Settings · Secrets</Heading>
        <Text color="fg.muted" mt="1">
          Back up the encryption key that protects your Shoebox data, or
          restore it from a previous backup.
        </Text>
      </Box>
      <ExportSection />
      <ImportSection />
    </Stack>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <Box
      borderWidth="1px"
      borderColor="border.subtle"
      borderRadius="lg"
      bg="bg.panel"
      p="6"
    >
      <Stack gap="4">{children}</Stack>
    </Box>
  );
}

function Banner({
  kind,
  children,
}: {
  kind: "info" | "warn" | "error" | "success";
  children: React.ReactNode;
}) {
  const palette = {
    info: { bg: "blue.50", border: "blue.200", fg: "blue.800" },
    warn: { bg: "yellow.50", border: "yellow.300", fg: "yellow.900" },
    error: { bg: "red.50", border: "red.200", fg: "red.800" },
    success: { bg: "green.50", border: "green.200", fg: "green.800" },
  }[kind];
  return (
    <Box
      borderWidth="1px"
      borderColor={palette.border}
      bg={palette.bg}
      color={palette.fg}
      borderRadius="md"
      px="3"
      py="2"
      fontSize="sm"
    >
      {children}
    </Box>
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [reveal, setReveal] = useState(false);
  return (
    <HStack gap="2">
      <Input
        type={reveal ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      <IconButton
        aria-label={reveal ? "Hide passphrase" : "Show passphrase"}
        variant="ghost"
        size="sm"
        onClick={() => setReveal((r) => !r)}
      >
        {reveal ? "🙈" : "👁"}
      </IconButton>
    </HStack>
  );
}

function ExportSection() {
  const [pw, setPw] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [armor, setArmor] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const mismatch = pwConfirm.length > 0 && pw !== pwConfirm;
  const canGenerate = pw.length > 0 && pw === pwConfirm && !busy;

  const filename = useMemo(() => {
    const stamp = new Date()
      .toISOString()
      .replace(/[:T]/g, "-")
      .replace(/\..+$/, "");
    return `shoebox-root-key-${stamp}.age`;
  }, [armor]);

  async function generate() {
    setBusy(true);
    setError(null);
    setArmor(null);
    setCopied(false);
    try {
      const result = await invoke<string>("secrets_export", {
        passphrase: pw,
      });
      setArmor(result);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  function clearOutput() {
    setArmor(null);
    setCopied(false);
    setPw("");
    setPwConfirm("");
  }

  async function copyArmor() {
    if (!armor) return;
    await navigator.clipboard.writeText(armor);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function downloadArmor() {
    if (!armor) return;
    const blob = new Blob([armor], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <SectionCard>
      <HStack justify="space-between" align="start">
        <Box>
          <Heading size="md">Export backup</Heading>
          <Text color="fg.muted" fontSize="sm" mt="1">
            Encrypts your root key under a passphrase you choose. Save the
            resulting file somewhere safe — anyone with the file and the
            passphrase can decrypt your data.
          </Text>
        </Box>
        <Badge colorPalette="purple" variant="subtle">
          age / scrypt
        </Badge>
      </HStack>

      <Stack gap="3">
        <Box>
          <Text fontSize="sm" mb="1" fontWeight="medium">
            Passphrase
          </Text>
          <PasswordInput
            value={pw}
            onChange={setPw}
            placeholder="Choose a strong passphrase"
            autoComplete="new-password"
          />
        </Box>
        <Box>
          <Text fontSize="sm" mb="1" fontWeight="medium">
            Confirm passphrase
          </Text>
          <PasswordInput
            value={pwConfirm}
            onChange={setPwConfirm}
            placeholder="Re-enter to confirm"
            autoComplete="new-password"
          />
          {mismatch && (
            <Text fontSize="xs" color="red.600" mt="1">
              Passphrases don't match.
            </Text>
          )}
        </Box>
      </Stack>

      {error && <Banner kind="error">{error}</Banner>}

      <Flex justify="flex-end" gap="2">
        {armor && (
          <Button variant="ghost" onClick={clearOutput}>
            Clear
          </Button>
        )}
        <Button
          colorPalette="teal"
          onClick={generate}
          loading={busy}
          loadingText="Encrypting"
          disabled={!canGenerate}
        >
          Generate backup
        </Button>
      </Flex>

      {armor && (
        <Stack gap="3">
          <Banner kind="warn">
            Save this file or copy the text somewhere safe. You won't see it
            again after you close this view.
          </Banner>
          <Textarea
            value={armor}
            readOnly
            rows={10}
            fontFamily="mono"
            fontSize="xs"
            onFocus={(e) => e.currentTarget.select()}
          />
          <HStack justify="flex-end" gap="2">
            <Button variant="outline" onClick={copyArmor}>
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button variant="outline" onClick={downloadArmor}>
              Download .age
            </Button>
          </HStack>
        </Stack>
      )}
    </SectionCard>
  );
}

function ImportSection() {
  const [armor, setArmor] = useState("");
  const [pw, setPw] = useState("");
  const [overwrite, setOverwrite] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit =
    armor.trim().length > 0 && pw.length > 0 && overwrite && !busy;

  async function submit() {
    setBusy(true);
    setError(null);
    setSuccess(false);
    try {
      await invoke("secrets_import", {
        armor: armor.trim(),
        passphrase: pw,
        overwrite,
      });
      setSuccess(true);
      setArmor("");
      setPw("");
      setOverwrite(false);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function onFilePicked(file: File) {
    const text = await file.text();
    setArmor(text);
    setError(null);
    setSuccess(false);
  }

  return (
    <SectionCard>
      <Box>
        <Heading size="md">Restore from backup</Heading>
        <Text color="fg.muted" fontSize="sm" mt="1">
          Replace this device's root key with one decrypted from a previous
          backup. Any data already encrypted under the current key will be
          unreadable afterwards.
        </Text>
      </Box>

      <Stack gap="3">
        <Box>
          <HStack justify="space-between" mb="1">
            <Text fontSize="sm" fontWeight="medium">
              Encrypted backup
            </Text>
            <Button
              size="xs"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose file…
            </Button>
          </HStack>
          <input
            ref={fileInputRef}
            type="file"
            accept=".age,.txt,text/plain"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFilePicked(file);
              e.target.value = "";
            }}
          />
          <Textarea
            value={armor}
            onChange={(e) => setArmor(e.target.value)}
            placeholder="Paste the -----BEGIN AGE ENCRYPTED FILE----- block here, or choose a file above."
            rows={8}
            fontFamily="mono"
            fontSize="xs"
          />
        </Box>

        <Box>
          <Text fontSize="sm" mb="1" fontWeight="medium">
            Passphrase
          </Text>
          <PasswordInput
            value={pw}
            onChange={setPw}
            placeholder="Passphrase used when the backup was made"
            autoComplete="current-password"
          />
        </Box>

        <Checkbox.Root
          checked={overwrite}
          onCheckedChange={(e) => setOverwrite(e.checked === true)}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Label fontSize="sm">
            I understand this replaces the current root key and may make
            existing encrypted data unreadable.
          </Checkbox.Label>
        </Checkbox.Root>
      </Stack>

      {error && <Banner kind="error">{error}</Banner>}
      {success && (
        <Banner kind="success">Root key imported successfully.</Banner>
      )}

      <Flex justify="flex-end">
        <Button
          colorPalette="red"
          onClick={submit}
          loading={busy}
          loadingText="Importing"
          disabled={!canSubmit}
        >
          Import and replace
        </Button>
      </Flex>
    </SectionCard>
  );
}

export const Route = createFileRoute("/settings/secrets")({
  component: SecretsSettings,
});
