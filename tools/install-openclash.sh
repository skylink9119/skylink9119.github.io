#!/bin/sh
set -eu

# Optional environment variables:
#   OPENCLASH_PACKAGE_URL  Direct .ipk/.apk URL. Skips GitHub API lookup.
#   OPENCLASH_API_URL      Override the GitHub API endpoint used for release lookup.
#   OPENCLASH_URL_PREFIX   Prefix added to GitHub API/package URLs, e.g. a proxy or mirror.
#   DOWNLOAD_RETRY         curl retry count. Default: 3
#   CONNECT_TIMEOUT        curl connect timeout in seconds. Default: 15
#   MAX_TIME               curl max transfer time in seconds. Default: 180

DOWNLOAD_RETRY="${DOWNLOAD_RETRY:-3}"
CONNECT_TIMEOUT="${CONNECT_TIMEOUT:-15}"
MAX_TIME="${MAX_TIME:-180}"
OPENCLASH_REPO="${OPENCLASH_REPO:-vernesong/OpenClash}"
OPENCLASH_API_URL="${OPENCLASH_API_URL:-https://api.github.com/repos/${OPENCLASH_REPO}/releases/latest}"
OPENCLASH_PACKAGE_URL="${OPENCLASH_PACKAGE_URL:-}"
OPENCLASH_URL_PREFIX="${OPENCLASH_URL_PREFIX:-}"

TMP_VERSION="/tmp/openclash_release.$$"
TMP_PACKAGE=""

cleanup() {
  rm -f "$TMP_VERSION" ${TMP_PACKAGE:+"$TMP_PACKAGE"}
}

trap cleanup EXIT HUP INT TERM

log() {
  printf '%s\n' "$*"
}

die() {
  printf 'Error: %s\n' "$*" >&2
  exit 1
}

have_cmd() {
  command -v "$1" >/dev/null 2>&1
}

apply_url_prefix() {
  if [ -n "$OPENCLASH_URL_PREFIX" ]; then
    printf '%s%s' "$OPENCLASH_URL_PREFIX" "$1"
  else
    printf '%s' "$1"
  fi
}

fetch_file() {
  url="$1"
  output="$2"

  curl -fL \
    --retry "$DOWNLOAD_RETRY" \
    --retry-delay 2 \
    --connect-timeout "$CONNECT_TIMEOUT" \
    --max-time "$MAX_TIME" \
    --speed-time 30 \
    --speed-limit 1 \
    "$url" \
    -o "$output"
}

if [ "$(id -u)" -ne 0 ]; then
  die "Please run this script as root."
fi

if have_cmd apk; then
  PM="apk"
  EXT="apk"
elif have_cmd opkg; then
  PM="opkg"
  EXT="ipk"
else
  die "Unsupported system. Neither apk nor opkg was found."
fi

if have_cmd fw4; then
  FW="nft"
elif [ "$PM" = "apk" ]; then
  if apk info 2>/dev/null | grep -qx 'firewall4'; then
    FW="nft"
  else
    FW="iptables"
  fi
else
  if opkg list-installed 2>/dev/null | grep -q '^firewall4 '; then
    FW="nft"
  else
    FW="iptables"
  fi
fi

log "Package manager: $PM"
log "Firewall mode: $FW"

if [ "$FW" = "nft" ]; then
  COMMON_DEPS="bash dnsmasq-full curl ca-bundle ip-full ruby ruby-yaml kmod-tun kmod-inet-diag unzip luci-compat luci luci-base"
  EXTRA_DEPS="kmod-nft-tproxy"
else
  COMMON_DEPS="bash dnsmasq-full curl ca-bundle ip-full ruby ruby-yaml kmod-tun kmod-inet-diag unzip luci-compat luci luci-base"
  EXTRA_DEPS="iptables ipset iptables-mod-tproxy iptables-mod-extra"
fi

if [ "$PM" = "apk" ]; then
  apk update
  apk add $COMMON_DEPS $EXTRA_DEPS
else
  opkg update
  opkg install $COMMON_DEPS $EXTRA_DEPS
fi

if [ -n "$OPENCLASH_PACKAGE_URL" ]; then
  download_url="$OPENCLASH_PACKAGE_URL"
  log "Using direct package URL override."
else
  api_url="$(apply_url_prefix "$OPENCLASH_API_URL")"
  log "Fetching latest release metadata..."
  if ! fetch_file "$api_url" "$TMP_VERSION"; then
    die "Failed to fetch release metadata. You can set OPENCLASH_PACKAGE_URL to a direct .${EXT} link or OPENCLASH_URL_PREFIX to a GitHub proxy."
  fi

  if [ "$EXT" = "ipk" ]; then
    asset_pattern='luci-app-openclash_.*_all\.ipk$'
  else
    asset_pattern='luci-app-openclash_.*\.apk$'
  fi

  if have_cmd jsonfilter; then
    download_url="$(jsonfilter -i "$TMP_VERSION" -e '@.assets[*].browser_download_url' | grep -E "$asset_pattern" | head -n 1 || true)"
  else
    download_url="$(grep -o 'https://[^"]*' "$TMP_VERSION" | grep -E "$asset_pattern" | head -n 1 || true)"
  fi

  [ -n "$download_url" ] || die "No matching OpenClash .${EXT} package URL was found in the latest release metadata."
  download_url="$(apply_url_prefix "$download_url")"
fi

TMP_PACKAGE="/tmp/openclash.$$.$EXT"
log "Downloading OpenClash package..."
if ! fetch_file "$download_url" "$TMP_PACKAGE"; then
  die "Failed to download OpenClash package from: $download_url"
fi

if [ "$PM" = "apk" ]; then
  apk add -q --force-overwrite --clean-protected --allow-untrusted "$TMP_PACKAGE"
else
  opkg install "$TMP_PACKAGE"
fi

log "OpenClash installed successfully."
log "Next step: open LuCI > Services > OpenClash, update the Mihomo kernel, then import your config."
