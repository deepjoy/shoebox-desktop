mod derive;
mod errors;
mod root;

pub use derive::{CommsKey, StorageKey};
pub use errors::Result;

use root::RootKey;

/// Owns the in-memory root key and vends per-purpose subkeys.
///
/// Stored in Tauri state as `Arc<Secrets>`. The root never crosses the IPC
/// boundary; callers request narrow subkeys for specific domains.
pub struct Secrets {
    root: RootKey,
}

impl Secrets {
    pub fn load_or_init() -> Result<Self> {
        Ok(Self {
            root: root::load_or_init()?,
        })
    }

    pub fn storage_key(&self) -> StorageKey {
        derive::storage_key(&self.root)
    }

    pub fn comms_key(&self) -> CommsKey {
        derive::comms_key(&self.root)
    }
}
