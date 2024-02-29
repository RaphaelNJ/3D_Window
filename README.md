# 3D_Window

3D_Window est un moteur graphique 3D (ou 2.5D) simple basé sur la même technique de rendu que le premier jeu considéré comme 3D : Doom. Visuellement, Doom semble être en 3D, mais mathématiquement, il n'est ni complètement en 2D ni réellement en 3D. C'est pourquoi on parle de dimension 2.5D. En tant que moteur de rendu, il ne comporte pas de physique et permet de traverser les murs.

Le projet a été initialement développé en un week-end en C, en utilisant le terminal pour afficher les images. C'était ma façon de prouver qu'un jeu 3D peut fonctionner dans un terminal. Malheureusement, j'ai perdu les fichiers originaux, donc je les ai réécrits en utilisant cette fois JavaScript pour gagner du temps et être le plus compréhensible possible (de toute façon il ne fait que 500 lignes au total). Je n'ai pas eu le temps d'implémenter les textures, donc les surfaces sont affichées dans une couleur unie.

Le jeu se compose uniquement de deux fichiers : `index.html` et `index.js`. Node.js n'est pas requis. Le jeu s'appelait initialement "3D_Term" pour mettre l'accent sur son utilisation du terminal, mais il est maintenant appelé "3D_Window" car il s'exécute dans le navigateur.

## Démo

https://github.com/RaphaelNJ/3D_Window/assets/102818995/641ba15b-404e-47e3-ad2f-782c6da39fb5

## Installation

Aucune étapes d'installation particulière est demandé. Il suffit donc seulement de :

1. Clonez ce dépôt sur votre machine locale.
```shell
git clone https://github.com/RaphaelNJ/3D_Window.git
```
2. Lancez un navigateur Web et ouvrez le fichier `index.html`.

## Licence

Ce projet est sous licence [MIT License](https://opensource.org/licenses/MIT).
