# Maintainer: Your Name <you@example.com>
# DeepSeek Harness (dsh) — Arch Linux package
#
# Installs the npm-published @deepseek-ai/dsh CLI together with its full
# dependency tree (including prebuilt native addons) under
# /usr/lib/node_modules, and exposes /usr/bin/dsh.
#
# No native toolchain (musl-gcc) is required at build time: the native
# addons ship as prebuilt binaries resolved from the npm registry.
#
# NOTE: `npm install -g --prefix` hangs inside makepkg's fakeroot, so
# dependencies are installed locally into a staging directory in
# prepare() and copied into $pkgdir in package().
#
# To bump to a new upstream release, update _npmver below and run
# `makepkg -g` to regenerate sha256sums.
#
# Upstream: https://github.com/deepseek-ai/deepseek-harness

_npmname=@deepseek-ai/dsh
_npmver=0.2.3-alpha.2

pkgname=dsh
# Arch pkgver converts npm's hyphens to dots: 0.2.3-alpha.2 -> 0.2.3.alpha.2
pkgver() {
    printf '%s' "${_npmver//-/.}"
}
pkgrel=1
pkgdesc="DeepSeek Harness CLI — agent harness command-line interface (dsh)"
arch=('x86_64' 'aarch64')
url="https://github.com/deepseek-ai/deepseek-harness"
license=('MIT')
depends=('nodejs')
makedepends=('npm')
# For scoped npm packages the tarball filename drops the scope org:
# https://registry.npmjs.org/@deepseek-ai/dsh/-/dsh-0.2.3-alpha.2.tgz
# ${_npmname##*/} strips "@deepseek-ai/" leaving "dsh".
_tarball=${_npmname##*/}-${_npmver}.tgz
source=("https://registry.npmjs.org/${_npmname}/-/${_tarball}")
noextract=("${_tarball}")

# Run `makepkg -g` to fill in the real checksum after the tarball downloads.
sha256sums=('SKIP')

# Skip stripping/debug symbol processing: hundreds of Node native binaries
# (incl. large sherpa-onnx/onnxruntime shared objects) would otherwise be
# processed by `strip`/`gdb-add-index`/`debugedit` in the tidy step, which
# is heavy and gets OOM-killed in constrained sandboxes. Neither is needed
# for a Node.js package.
options=('!strip' '!debug')

prepare() {
  # Staged local install avoids npm -g hanging inside makepkg's fakeroot.
  local stage="$srcdir/npm-stage"
  rm -rf "$stage"
  mkdir -p "$stage"

  # Minimal package.json so npm does not walk up to the repo root's pnpm
  # workspace (whose workspace: specifiers it cannot resolve).
  cat > "$stage/package.json" <<'EOF'
{
  "name": "dsh-staging",
  "version": "0.0.0",
  "private": true,
  "dependencies": {}
}
EOF

  # Install the scoped tarball + its dependency tree into the staging dir.
  npm install --no-audit --no-fund --no-save \
    --prefix "$stage" \
    "${_npmname}@${_npmver}"
}

package() {
  local stage="$srcdir/npm-stage"
  local target="$pkgdir/usr/lib/node_modules/@deepseek-ai/dsh"

  mkdir -p "$(dirname "$target")"
  cp -a "$stage/node_modules/${_npmname}" "$target"

  # Expose /usr/bin/dsh → ../lib/node_modules/@deepseek-ai/dsh/lib/bin.js
  mkdir -p "$pkgdir/usr/bin"
  ln -s "../lib/node_modules/${_npmname}/lib/bin.js" "$pkgdir/usr/bin/dsh"
}
