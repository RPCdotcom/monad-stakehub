# StakeHub Deployment Kılavuzu

Bu döküman StakeHub projesini Vercel ve IPFS üzerinde nasıl yayınlayacağınızı adım adım anlatır.

## Vercel ile Deployment

### 1. Vercel CLI ile deploy etme
```bash
# Vercel CLI kurulumu
npm install -g vercel

# Proje klasöründe
vercel login
vercel
```

### 2. Vercel Dashboard ile deploy etme
1. [vercel.com](https://vercel.com) adresine gidin ve giriş yapın
2. "Import Project" seçeneğini tıklayın
3. GitHub repo URL'sini yapıştırın veya "Upload" ile proje dosyalarınızı yükleyin
4. Root directory olarak `/frontend` seçin
5. Environment variables bölümünde aşağıdakileri ekleyin:
   - `NEXT_PUBLIC_MONAD_RPC_URL`: https://rpc.ankr.com/monad_testnet
   - `NEXT_PUBLIC_STAKEHUB_CONTRACT`: [Contract adresi] (deploy edildikten sonra)
6. "Deploy" butonuna tıklayın

## IPFS ile Deployment

### 1. Build oluşturma ve IPFS'e yükleme
```bash
# Execute the deploy script
./scripts/deploy-to-ipfs.sh
```

### 2. Fleek ile IPFS deployment (Alternatif)
1. [Fleek](https://fleek.co/) hesabı oluşturun
2. "Add new site" seçeneğini tıklayın
3. GitHub repo seçin veya dosyaları manuel olarak yükleyin
4. Hosting tipi olarak "IPFS" seçin
5. Build komutunu `cd frontend && npm run build && npm run export` olarak ayarlayın
6. Publish directory'yi `frontend/out` olarak ayarlayın
7. Environment variables bölümünde aşağıdakileri ekleyin:
   - `NEXT_PUBLIC_IPFS_BUILD`: true
   - `NEXT_PUBLIC_MONAD_RPC_URL`: https://rpc.ankr.com/monad_testnet
   - `NEXT_PUBLIC_STAKEHUB_CONTRACT`: [Contract adresi] (deploy edildikten sonra)
8. "Deploy site" butonuna tıklayın

## ENS ile İsim Ayarlama (Opsiyonel)

StakeHub'ı ENS (Ethereum Name Service) ile birlikte kullanarak stakehub.eth gibi kullanıcı dostu bir alan adı ayarlamak için:

1. [ENS App](https://app.ens.domains/)'i ziyaret edin ve cüzdanınızı bağlayın
2. İstediğiniz .eth alan adını satın alın
3. İçerik kısmında "IPFS" seçeneğini seçin ve CID'nizi (IPFS content identifier) girin
4. "Save" butonuna tıklayın

Artık stakehub.eth.limo veya stakehub.eth.link gibi gateway'ler üzerinden projenize erişilebilir olacaktır.

## Backend Deployment

StakeHub backend'ini bir sunucuda çalıştırmak için:

1. Bir VPS kiralayın (DigitalOcean, AWS, GCP, vb.)
2. Repository'yi klonlayın ve backend klasörüne gidin
3. .env dosyası oluşturun ve gerekli çevresel değişkenleri ayarlayın
4. PostgreSQL kurulumu yapın ve veritabanını oluşturun
5. PM2 gibi bir process manager kullanarak uygulamayı çalıştırın:

```bash
npm install -g pm2
cd backend
npm install
pm2 start index.js --name "stakehub-api"
```

## Contract Deployment

StakeHub smart contract'ini Monad testnet'e deploy etmek için:

```bash
cd contracts
npx hardhat run scripts/deploy.js --network monad_testnet
```

Deploy edildikten sonra contract adresini frontend ve backend yapılandırmalarında güncelleyin.