# ShotJack Ultimate 🃏🍻

Le meilleur du blackjack à gorgées ! Un jeu de blackjack multijoueur en temps réel avec système de boisson.

## 🚀 Architecture de déploiement

Cette application utilise une architecture séparée :

### 🔧 **Backend (Railway)**
- **URL** : `wss://shotjack-production.up.railway.app`
- **Rôle** : WebSocket serveur + API
- **Configuration** : Dockerfile + variables d'environnement Railway
- **Port** : Variable `PORT` configurée automatiquement

### 🎨 **Frontend (Vercel)**
- **Rôle** : Interface React + connexion WebSocket au backend
- **Configuration** : `vercel.json` avec `VITE_WS_URL`
- **Build** : `cd frontend && npm run build`

### ⚙️ **Variables d'environnement**
**Vercel** (frontend) :
- `VITE_WS_URL` = `wss://shotjack-production.up.railway.app`

**Railway** (backend) :
- `PORT` = (configuré automatiquement)

## 🎮 Fonctionnalités

- **Blackjack multijoueur** en temps réel
- **Système de gorgées** : distribuer ou boire selon les résultats
- **Codes de partie** format `12AB` (2 chiffres + 2 lettres)
- **Interface responsive** avec Tailwind CSS
- **Reconnexion automatique** en cas de déconnexion
- **Règles intégrées** avec navigation automatique

## 🛠 Développement local

```bash
# Installer les dépendances
npm run install:all

# Lancer en mode développement
npm run dev

# Build pour production
npm run build

# Démarrer le serveur
npm start
```

## 📱 Utilisation

1. **Créer une partie** : génère un code à 4 caractères
2. **Rejoindre** : entrer le code de partie
3. **Jouer** : utiliser les boutons Tirer, Arrêter, Doubler, Diviser
4. **Boire/Distribuer** selon les résultats du blackjack

## 🎯 Technologies

- **Frontend** : React + TypeScript + Tailwind CSS
- **Backend** : Node.js + WebSocket
- **Build** : Vite + Docker multi-stage
- **Déploiement** : Railway