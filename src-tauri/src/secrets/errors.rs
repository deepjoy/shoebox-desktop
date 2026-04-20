use thiserror::Error;

#[derive(Debug, Error)]
pub enum SecretsError {
    #[error("keychain backend error: {0}")]
    Backend(#[from] keyring::Error),

    #[error("stored root key is not valid base64")]
    Decode,

    #[error("stored root key has wrong length (expected 32 bytes)")]
    WrongLength,
}

pub type Result<T> = std::result::Result<T, SecretsError>;
