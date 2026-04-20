use serde::ser::{Serialize, SerializeStruct, Serializer};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum SecretsError {
    #[error("keychain backend error: {0}")]
    Backend(#[from] keyring::Error),

    #[error("stored root key is not valid base64")]
    Decode,

    #[error("stored root key has wrong length (expected 32 bytes)")]
    WrongLength,

    #[error("passphrase must not be empty")]
    PassphraseEmpty,

    #[error("passphrase is incorrect or the blob is corrupt")]
    BadPassphrase,

    #[error("encrypted payload is malformed")]
    Corrupt,

    #[error("root key already initialized; pass overwrite=true to replace")]
    AlreadyInitialized,

    #[error("i/o error: {0}")]
    Io(#[from] std::io::Error),
}

impl SecretsError {
    pub fn code(&self) -> &'static str {
        match self {
            Self::Backend(_) => "backend",
            Self::Decode => "decode",
            Self::WrongLength => "wrong_length",
            Self::PassphraseEmpty => "passphrase_empty",
            Self::BadPassphrase => "bad_passphrase",
            Self::Corrupt => "corrupt",
            Self::AlreadyInitialized => "already_initialized",
            Self::Io(_) => "io",
        }
    }
}

impl Serialize for SecretsError {
    fn serialize<S: Serializer>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error> {
        let mut s = serializer.serialize_struct("SecretsError", 2)?;
        s.serialize_field("code", self.code())?;
        s.serialize_field("message", &self.to_string())?;
        s.end()
    }
}

pub type Result<T> = std::result::Result<T, SecretsError>;
