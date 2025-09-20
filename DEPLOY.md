# 🚀 Guide de Déploiement Séparé

## Architecture actuelle

- **Backend Railway** : `wss://shotjack-production.up.railway.app`
- **Frontend Vercel** : Interface web avec connexion au backend Railway

## 🔧 Déploiement Backend (Railway)

### Variables d'environnement Railway
```
PORT=(configuré automatiquement)
```

### Déploiement automatique
1. **Push sur GitHub** : Railway détecte automatiquement les changements
2. **Build Docker** : Dockerfile optimisé pour le backend
3. **WebSocket disponible** : `wss://shotjack-production.up.railway.app`

## 🎨 Déploiement Frontend (Vercel)

### Variables d'environnement Vercel
```
VITE_WS_URL=wss://shotjack-production.up.railway.app
```

### Configuration Vercel
- **Build Command** : `cd frontend && npm run build`
- **Output Directory** : `frontend/dist`
- **Install Command** : `cd frontend && npm install`

### Déploiement automatique
1. **Push sur GitHub** : Vercel détecte automatiquement les changements
2. **Build frontend** : Interface React avec WebSocket vers Railway
3. **Frontend disponible** : URL Vercel avec connexion au backend Railway

## 🧪 Test local

### Avec backend local
```bash
npm run dev
```

### Avec backend Railway
```bash
export VITE_WS_URL=wss://shotjack-production.up.railway.app
npm run dev:frontend
```

## ✅ État du déploiement

- **Railway (Backend)** : WebSocket serveur opérationnel
- **Vercel (Frontend)** : Interface web connectée au backend Railway
