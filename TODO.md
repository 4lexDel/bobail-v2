# TODO

## Objectifs
- Reprise du projet MinMax initier dans ce [repository](https://github.com/4lexDel/MinMax-Algorithms)
- Amélioration de l'IA appliqué aux jeu bobail
- Refonte de l'innterface utilisateur
- Utilisation de technologies maintenable : React, Typescript

## IA
- Améliorer l'évaluation
	* Recherche des différentes features
		+ Avancée moyenne des pièces
		+ Avancée du bobail
		+ Nombre de liberté des pièces
		+ Voisin du bobail
		+ Pièces en contact du bobail
		+ Grid avec position stratégique à occuper
- Doit gagner au plus vite si victoire possible
- Optimisation
	* Optimisation des paramètres : ajout d'un grid search et faire concourir toutes les occurences chacune contre les autres)
	* Ajouter une table de transposition (à mettre à jours)
	* Ajout d'une heuristique pour réduire le nombre de coup possible et pour regarder des coups en priorités
		+ Interdire faire reculer le bobail si il peut avancer ?
## UX/UI
- Sélection d'une pièce (zone disponible)
- Grisé les pièces tant que le bobail n'est pas joué
- Grisé le bobail quand il est joué
- Chargement lors de la réflexion de l'IA
- Affichage des mouvements succins de l'IA
- Fin de partie

## Prompt initial ChatGPT
Développe moi un algorithme MinMax en Typescript.
Utilise un design pattern stratégie, l'objet en question doit implémenter les méthodes suivantes :
- evaluateState : donne l'évaluation d'une position
- generateChildren : renvoie la liste des coups possible à partir d'une position
- isGameOver : renvoie true si des 2 joueurs gagne à partir d'une position

Définition d'une position : une position est définis par le joueur à qui c'est le tour, ainsi que la grille définissant l'état du jeu actuel

Optimisation :
- Implémente l'élagage alpha-beta
- Ajoute une table de transposition pour fournir directement l'évaluation d'une position connu (voir la définition d'une position plus haut) 