mod derive;
mod errors;
mod portable;
mod root;

use std::sync::RwLock;

pub use derive::{CommsKey, StorageKey};
pub use errors::{Result, SecretsError};

use root::RootKey;

/// Owns the in-memory root key and vends per-purpose subkeys.
///
/// Stored in Tauri state as `Arc<Secrets>`. The root never crosses the IPC
/// boundary; callers request narrow subkeys for specific domains. The root is
/// held behind an `RwLock` so `import` can replace it in place.
pub struct Secrets {
    root: RwLock<RootKey>,
}

impl Secrets {
    pub fn load_or_init() -> Result<Self> {
        Ok(Self {
            root: RwLock::new(root::load_or_init()?),
        })
    }

    pub fn storage_key(&self) -> StorageKey {
        let root = self.root.read().expect("root lock poisoned");
        derive::storage_key(&root)
    }

    pub fn comms_key(&self) -> CommsKey {
        let root = self.root.read().expect("root lock poisoned");
        derive::comms_key(&root)
    }

    /// Encrypt the current root under a passphrase and return an armored blob.
    pub fn export(&self, passphrase: &str) -> Result<String> {
        let root = self.root.read().expect("root lock poisoned");
        portable::encrypt_root(&root, passphrase)
    }

    /// Replace the current root with one decrypted from `armor`.
    ///
    /// Persists to the keychain first; only swaps the in-memory key if the
    /// keychain write succeeds. Refuses to overwrite an existing keychain
    /// entry unless `overwrite` is `true`.
    pub fn import(&self, armor: &str, passphrase: &str, overwrite: bool) -> Result<()> {
        let new_root = portable::decrypt_root(armor, passphrase)?;
        root::save(&new_root, overwrite)?;
        let mut root = self.root.write().expect("root lock poisoned");
        *root = new_root;
        Ok(())
    }
}
