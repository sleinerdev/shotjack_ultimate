# ShotJack Ultimate

Le meilleur du blackjack à gorgées ! Combinaison des meilleures fonctionnalités de ShotjackMono et ShotjackV2.

## Fonctionnalités

### De ShotjackMono
- ✅ Interface overview complète avec vue d'ensemble des joueurs
- ✅ Interface de gorgées (distribué vs bu) dans l'UI
- ✅ Landing page avec UI propre
- ✅ Fonctionnalité retour à l'accueil et recréation de partie
- ✅ Pool de pseudos aléatoires

### De ShotjackV2  
- ✅ Système de passage entre parties (rounds) fluide
- ✅ Contrôles complets du blackjack (hit, stand, split, double)
- ✅ Architecture moderne avec GameProvider

## Installation

```bash
npm run install:all
```

## Développement

```bash
npm run dev
```

## Production

```bash
npm run build
npm start
```

## Structure

```
shotjack_ultimate/
├── backend/           # Serveur WebSocket
│   └── server/        # Code serveur principal
├── frontend/          # Interface React avec Tailwind CSS
├── package.json       # Scripts pour lancer le projet complet
└── README.md          # Cette documentation
```

