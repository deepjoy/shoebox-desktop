use hkdf::Hkdf;
use sha2::Sha256;
use zeroize::Zeroizing;

use super::root::RootKey;

pub const SUBKEY_LEN: usize = 32;
pub type SubKey = Zeroizing<[u8; SUBKEY_LEN]>;

pub const INFO_STORAGE_V1: &[u8] = b"shoebox/storage/v1";
pub const INFO_COMMS_V1: &[u8] = b"shoebox/comms/v1";

pub struct StorageKey(pub SubKey);
pub struct CommsKey(pub SubKey);

pub fn derive_subkey(root: &RootKey, info: &[u8]) -> SubKey {
    let hk = Hkdf::<Sha256>::new(None, root.as_ref());
    let mut out = Zeroizing::new([0u8; SUBKEY_LEN]);
    hk.expand(info, out.as_mut())
        .expect("SUBKEY_LEN is within HKDF-SHA256 output bounds");
    out
}

pub fn storage_key(root: &RootKey) -> StorageKey {
    StorageKey(derive_subkey(root, INFO_STORAGE_V1))
}

pub fn comms_key(root: &RootKey) -> CommsKey {
    CommsKey(derive_subkey(root, INFO_COMMS_V1))
}

#[cfg(test)]
mod tests {
    use super::*;
    use super::super::root::ROOT_KEY_LEN;

    fn fixed_root(byte: u8) -> RootKey {
        Zeroizing::new([byte; ROOT_KEY_LEN])
    }

    #[test]
    fn derive_is_deterministic() {
        let root = fixed_root(0x42);
        let a = derive_subkey(&root, INFO_STORAGE_V1);
        let b = derive_subkey(&root, INFO_STORAGE_V1);
        assert_eq!(a.as_ref(), b.as_ref());
    }

    #[test]
    fn different_info_yields_different_keys() {
        let root = fixed_root(0x42);
        let storage = derive_subkey(&root, INFO_STORAGE_V1);
        let comms = derive_subkey(&root, INFO_COMMS_V1);
        assert_ne!(storage.as_ref(), comms.as_ref());
    }

    #[test]
    fn different_roots_yield_different_keys() {
        let a = derive_subkey(&fixed_root(0x01), INFO_STORAGE_V1);
        let b = derive_subkey(&fixed_root(0x02), INFO_STORAGE_V1);
        assert_ne!(a.as_ref(), b.as_ref());
    }
}
