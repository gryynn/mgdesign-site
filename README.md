# MG Design - Site Web

🌐 Site web : [http://mgdesign.cloud/](https://mgdesign.cloud/)

## Description
Site web vitrine de MG Design, créateurs d'objets personnalisés locaux en Bourgogne. Le site permet aux visiteurs de découvrir nos services, nos réalisations et de demander un devis personnalisé.

## Technologies utilisées
- HTML5
- CSS3
- JavaScript (Vanilla)
- Supabase (Backend & Storage)

## Structure du projet
```
mgdesign-site/
├── index.html          # Page principale
├── form-handler.js     # Gestion du formulaire de contact
├── config.js          # Configuration Supabase (non versionné)
├── .gitignore         # Fichiers à ignorer par Git
├── CNAME             # Configuration du domaine personnalisé
└── assets/           # Images et ressources
    ├── logo-mgdesign.png
    ├── notre-equipe.png
    ├── phototrophee-auxonne.jpg
    └── instagram-icone-gris.png
```

## Configuration
1. Cloner le repository
2. Créer un fichier `config.js` avec vos clés Supabase :
```javascript
const SUPABASE_URL = 'votre_url_supabase';
const SUPABASE_KEY = 'votre_cle_supabase';
```

## Fonctionnalités
- Design responsive
- Formulaire de contact avec upload de fichiers
- Intégration Supabase pour le stockage et la base de données
- Carrousel de réalisations
- Animations et transitions fluides

## Déploiement
Le site est hébergé sur GitHub Pages avec un domaine personnalisé (mgdesign.cloud).

## Sécurité
- Les clés Supabase sont stockées dans `config.js` qui n'est pas versionné
- Validation des données côté client et serveur
- Limite de taille des fichiers uploadés (50MB max)

## Contact
Pour toute question ou suggestion, n'hésitez pas à nous contacter via le formulaire du site ou par email à contact@mgdesign.fr. 
