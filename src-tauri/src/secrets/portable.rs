use std::io::{Read, Write};

use age::armor::{ArmoredReader, ArmoredWriter, Format};
use age::secrecy::SecretString;
use age::{Decryptor, Encryptor};
use zeroize::Zeroizing;

use super::errors::{Result, SecretsError};
use super::root::{RootKey, ROOT_KEY_LEN};

/// Encrypt the root under a passphrase using the `age` scrypt recipient and
/// return the ASCII-armored ciphertext.
pub fn encrypt_root(root: &RootKey, passphrase: &str) -> Result<String> {
    if passphrase.is_empty() {
        return Err(SecretsError::PassphraseEmpty);
    }

    let encryptor = Encryptor::with_user_passphrase(SecretString::from(passphrase.to_owned()));

    let mut buf = Vec::new();
    let armor = ArmoredWriter::wrap_output(&mut buf, Format::AsciiArmor)?;
    let mut writer = encryptor.wrap_output(armor)?;
    writer.write_all(root.as_ref())?;
    let armor = writer.finish()?;
    armor.finish()?;

    String::from_utf8(buf).map_err(|_| SecretsError::Corrupt)
}

/// Decrypt an armored age blob under a passphrase and return the 32-byte root.
pub fn decrypt_root(armor: &str, passphrase: &str) -> Result<RootKey> {
    if passphrase.is_empty() {
        return Err(SecretsError::PassphraseEmpty);
    }

    let reader = ArmoredReader::new(armor.as_bytes());
    let decryptor = Decryptor::new(reader).map_err(|_| SecretsError::Corrupt)?;

    let identity = age::scrypt::Identity::new(SecretString::from(passphrase.to_owned()));
    let mut reader = decryptor
        .decrypt(std::iter::once(&identity as &dyn age::Identity))
        .map_err(|_| SecretsError::BadPassphrase)?;

    let mut buf = Zeroizing::new(Vec::with_capacity(ROOT_KEY_LEN));
    reader.read_to_end(&mut buf)?;

    if buf.len() != ROOT_KEY_LEN {
        return Err(SecretsError::WrongLength);
    }

    let mut out = Zeroizing::new([0u8; ROOT_KEY_LEN]);
    out.copy_from_slice(&buf);
    Ok(out)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn fixed_root(byte: u8) -> RootKey {
        Zeroizing::new([byte; ROOT_KEY_LEN])
    }

    #[test]
    fn roundtrip_recovers_same_root() {
        let root = fixed_root(0x37);
        let armor = encrypt_root(&root, "correct horse battery staple").unwrap();
        let recovered = decrypt_root(&armor, "correct horse battery staple").unwrap();
        assert_eq!(root.as_ref(), recovered.as_ref());
    }

    #[test]
    fn output_is_armored_text() {
        let root = fixed_root(0x37);
        let armor = encrypt_root(&root, "pw").unwrap();
        assert!(armor.starts_with("-----BEGIN AGE ENCRYPTED FILE-----"));
    }

    #[test]
    fn wrong_passphrase_is_rejected() {
        let root = fixed_root(0x37);
        let armor = encrypt_root(&root, "right").unwrap();
        let err = decrypt_root(&armor, "wrong").unwrap_err();
        assert!(matches!(err, SecretsError::BadPassphrase));
    }

    #[test]
    fn tampered_blob_is_rejected() {
        let root = fixed_root(0x37);
        let mut armor = encrypt_root(&root, "pw").unwrap();
        // Flip a byte in the middle of the base64 payload.
        let mid = armor.len() / 2;
        let bytes = unsafe { armor.as_bytes_mut() };
        bytes[mid] = if bytes[mid] == b'A' { b'B' } else { b'A' };
        let err = decrypt_root(&armor, "pw").unwrap_err();
        assert!(matches!(err, SecretsError::BadPassphrase | SecretsError::Corrupt));
    }

    #[test]
    fn empty_passphrase_is_rejected_on_encrypt() {
        let root = fixed_root(0x37);
        let err = encrypt_root(&root, "").unwrap_err();
        assert!(matches!(err, SecretsError::PassphraseEmpty));
    }

    #[test]
    fn empty_passphrase_is_rejected_on_decrypt() {
        let err = decrypt_root("anything", "").unwrap_err();
        assert!(matches!(err, SecretsError::PassphraseEmpty));
    }
}
