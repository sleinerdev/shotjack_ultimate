# ShotJack Ultimate 🃏🍻

Le meilleur du blackjack à gorgées ! Un jeu de blackjack multijoueur en temps réel avec système de boisson.

## 🚀 Déploiement Railway

### 1. Configuration automatique
Railway détecte automatiquement le `Dockerfile` et build l'application.

### 2. Variables d'environnement à configurer
Dans Railway, ajoutez cette variable :
- `VITE_WS_URL` = `wss://votre-app.railway.app` (remplacez par votre URL Railway)

### 3. Port
Railway configure automatiquement le port via la variable `PORT`.

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