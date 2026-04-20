FROM rust:1-trixie


ARG REMOTE_USER=vscode
ARG REMOTE_UID=1000
ARG REMOTE_GID=1000
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=America/Los_Angeles
ENV NO_AT_BRIDGE=1

# Install additional tools if needed
RUN rm -rf /var/lib/apt/lists/* && \
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
        git git-lfs \
        locales-all zsh \
        build-essential sqlite3 python3 python3-setuptools \
        libgit2-dev pkg-config default-jdk nodejs npm rustup \
        util-linux-extra asciinema \
        # Podman and rootless container dependencies
        podman uidmap slirp4netns \
        # Tauri dependencies
        libwebkit2gtk-4.1-dev libjavascriptcoregtk-4.1-dev \
        libsoup-3.0-dev libgtk-3-dev libappindicator3-dev librsvg2-dev \
        libssl-dev \
        # Keychain (Secret Service) build + debug tools
        libdbus-1-dev libsecret-tools \
        # X11 forwarding
        xauth dbus-x11 \
        libcanberra-gtk3-module \
        # Mesa DRI drivers (host GPU is passed through via --device=/dev/dri)
        libgl1-mesa-dri libegl-mesa0 && \
    rm -rf /var/lib/apt/lists/* && \
    corepack enable pnpm


RUN groupadd --gid ${REMOTE_GID} ${REMOTE_USER} && \
    useradd --create-home --uid ${REMOTE_UID} --gid ${REMOTE_GID} --shell /usr/bin/zsh ${REMOTE_USER} && \
    (getent group render >/dev/null || groupadd --system render) && \
    usermod -aG video,render ${REMOTE_USER}

USER ${REMOTE_USER}
ENV HOME /home/${REMOTE_USER}

# Re-declare ARGs after USER instruction (ARG values don't persist across stages/USER changes)
ARG REMOTE_UID
ARG REMOTE_GID

ENV PATH="${HOME}/.cargo/bin:${HOME}/.npm-global/bin:${PATH}"
ENV CARGO_HOME="${HOME}/.cargo"


# Install rust tools
RUN rustup default stable && \
    cargo install bacon && \
    cargo install ast-grep --locked && \
    cargo install cargo-eval && \
    cargo install tauri-cli && \
    rustup component add rust-analyzer && \
    rustup component add rust-src && \
    rustup component add rustfmt && \
    rustup component add clippy

USER ${REMOTE_USER}

SHELL ["/usr/bin/zsh", "-c"]

# Set up working directory
WORKDIR /workspace
