#!/bin/bash

# IPFS için statik build oluşturur
# IPFS'e yüklemek için kullanılacak

# Environment değişkenlerini ayarla
export NEXT_PUBLIC_IPFS_BUILD=true

# Next.js'i build et
cd /Users/rfc/Desktop/monad-blitz-ankara/frontend
npm run build

# out/ klasörü yoksa export komutu çalıştır
if [ ! -d "out" ]; then
  npm run export || echo "Export command not found, using the build output"
fi

# Build veya export outputunu IPFS için prepare et
mkdir -p ipfs-build
if [ -d "out" ]; then
  cp -R out/* ipfs-build/
else
  cp -R .next/static ipfs-build/
fi

# IPFS CLI kurulu ise direkt olarak IPFS'e ekle
if command -v ipfs &> /dev/null
then
    echo "IPFS'e yükleniyor..."
    HASH=$(ipfs add -r ipfs-build | tail -n 1 | awk '{print $2}')
    echo "IPFS Hash: $HASH"
    echo "IPFS Gateway URL: https://ipfs.io/ipfs/$HASH"
    echo "Cloudflare IPFS Gateway: https://cloudflare-ipfs.com/ipfs/$HASH"
else
    echo "IPFS CLI bulunamadı. Manual olarak ipfs-build/ klasörünü bir IPFS istemcisiyle yükleyebilirsiniz."
    echo "Alternatif olarak Pinata, Fleek veya NFT.Storage gibi servisler kullanabilirsiniz."
fi