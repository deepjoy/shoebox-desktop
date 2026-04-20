use base64::{engine::general_purpose::STANDARD, Engine as _};
use keyring::Entry;
use rand::rngs::OsRng;
use rand::RngCore;
use zeroize::Zeroizing;

use super::errors::{Result, SecretsError};

pub const SERVICE: &str = "us.deepjoy.shoebox";
pub const ACCOUNT_ROOT: &str = "root-key-v1";

pub const ROOT_KEY_LEN: usize = 32;
pub type RootKey = Zeroizing<[u8; ROOT_KEY_LEN]>;

pub fn load_or_init() -> Result<RootKey> {
    let entry = Entry::new(SERVICE, ACCOUNT_ROOT)?;
    load_or_init_with(&entry)
}

/// Write a replacement root to the keychain.
///
/// If `overwrite` is false and an entry already exists, returns
/// `SecretsError::AlreadyInitialized` without touching the stored value.
pub fn save(new_root: &RootKey, overwrite: bool) -> Result<()> {
    let entry = Entry::new(SERVICE, ACCOUNT_ROOT)?;
    save_with(&entry, new_root, overwrite)
}

fn load_or_init_with(entry: &Entry) -> Result<RootKey> {
    match entry.get_password() {
        Ok(encoded) => decode_root(&encoded),
        Err(keyring::Error::NoEntry) => {
            let key = generate();
            let encoded = STANDARD.encode(key.as_ref());
            entry.set_password(&encoded)?;
            Ok(key)
        }
        Err(e) => Err(SecretsError::Backend(e)),
    }
}

fn save_with(entry: &Entry, new_root: &RootKey, overwrite: bool) -> Result<()> {
    if !overwrite {
        match entry.get_password() {
            Ok(_) => return Err(SecretsError::AlreadyInitialized),
            Err(keyring::Error::NoEntry) => {}
            Err(e) => return Err(SecretsError::Backend(e)),
        }
    }
    let encoded = STANDARD.encode(new_root.as_ref());
    entry.set_password(&encoded)?;
    Ok(())
}

fn generate() -> RootKey {
    let mut buf = Zeroizing::new([0u8; ROOT_KEY_LEN]);
    OsRng.fill_bytes(buf.as_mut());
    buf
}

fn decode_root(encoded: &str) -> Result<RootKey> {
    let raw = STANDARD.decode(encoded).map_err(|_| SecretsError::Decode)?;
    if raw.len() != ROOT_KEY_LEN {
        return Err(SecretsError::WrongLength);
    }
    let mut buf = Zeroizing::new([0u8; ROOT_KEY_LEN]);
    buf.copy_from_slice(&raw);
    Ok(buf)
}

#[cfg(test)]
mod tests {
    use super::*;
    use keyring::{mock, set_default_credential_builder};
    use std::sync::Once;

    static INIT: Once = Once::new();
    fn use_mock_backend() {
        INIT.call_once(|| {
            set_default_credential_builder(mock::default_credential_builder());
        });
    }

    #[test]
    fn load_or_init_creates_then_returns_same_key() {
        use_mock_backend();
        let entry = Entry::new(SERVICE, "test-load-or-init").unwrap();
        let first = load_or_init_with(&entry).expect("create");
        let second = load_or_init_with(&entry).expect("reload");
        assert_eq!(first.as_ref(), second.as_ref());
    }

    #[test]
    fn decode_rejects_wrong_length() {
        let bad = STANDARD.encode([0u8; 16]);
        let err = decode_root(&bad).unwrap_err();
        assert!(matches!(err, SecretsError::WrongLength));
    }

    #[test]
    fn decode_rejects_non_base64() {
        let err = decode_root("not*base64!").unwrap_err();
        assert!(matches!(err, SecretsError::Decode));
    }

    #[test]
    fn save_without_overwrite_rejects_existing() {
        use_mock_backend();
        let entry = Entry::new(SERVICE, "test-save-no-overwrite").unwrap();
        let first = Zeroizing::new([1u8; ROOT_KEY_LEN]);
        save_with(&entry, &first, false).expect("initial save");

        let second = Zeroizing::new([2u8; ROOT_KEY_LEN]);
        let err = save_with(&entry, &second, false).unwrap_err();
        assert!(matches!(err, SecretsError::AlreadyInitialized));

        let reloaded = load_or_init_with(&entry).unwrap();
        assert_eq!(reloaded.as_ref(), first.as_ref());
    }

    #[test]
    fn save_with_overwrite_replaces_existing() {
        use_mock_backend();
        let entry = Entry::new(SERVICE, "test-save-overwrite").unwrap();
        let first = Zeroizing::new([1u8; ROOT_KEY_LEN]);
        save_with(&entry, &first, false).expect("initial save");

        let second = Zeroizing::new([2u8; ROOT_KEY_LEN]);
        save_with(&entry, &second, true).expect("overwrite");

        let reloaded = load_or_init_with(&entry).unwrap();
        assert_eq!(reloaded.as_ref(), second.as_ref());
    }
}
