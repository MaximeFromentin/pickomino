var app = new Vue({
    el: '#pickomino',
    data: {
        //définit l'état du jeu
        etat: "preparation",
        // nombre total de dés dans le jeu
        nombre_des: 8,
        // liste des joueurs (à remplir lors de la phase de préparation du jeu)
        joueurs: [
            {
                nom: "",
                pickominos: []
            },
            {
                nom: "",
                pickominos: []
            },
            {
                nom: "",
                pickominos: []
            },
            {
                nom: "",
                pickominos: []
            },
        ],
        // joueur dont c'est le tour
        joueur_courant: undefined,
        // phase du tour du joueur en cours
        phase_tour: "",
        // liste des dés gardés (c'est à dire mis de côtés pour faire des points)
        garde: [],
        // liste des dés lancés
        lance: [],
        // liste des pickominos disponible au centre du jeu
        brochette: [
            {
                valeur: 21,
                vers: 1,
                etat: "libre"
            },
            {
                valeur: 22,
                vers: 1,
                etat: "libre"
            },
            {
                valeur: 23,
                vers: 1,
                etat: "libre"
            },
            {
                valeur: 24,
                vers: 1,
                etat: "libre"
            },
            {
                valeur: 25,
                vers: 2,
                etat: "libre"
            },
            {
                valeur: 26,
                vers: 2,
                etat: "libre"
            },
            {
                valeur: 27,
                vers: 2,
                etat: "libre"
            },
            {
                valeur: 28,
                vers: 2,
                etat: "libre"
            },
            {
                valeur: 29,
                vers: 3,
                etat: "libre"
            },
            {
                valeur: 30,
                vers: 3,
                etat: "libre"
            },
            {
                valeur: 31,
                vers: 3,
                etat: "libre"
            },
            {
                valeur: 32,
                vers: 3,
                etat: "libre"
            },
            {
                valeur: 33,
                vers: 4,
                etat: "libre"
            },
            {
                valeur: 34,
                vers: 4,
                etat: "libre"
            },
            {
                valeur: 35,
                vers: 4,
                etat: "libre"
            },
            {
                valeur: 36,
                vers: 4,
                etat: "libre"
            },

        ]
    },
    computed: {
        garde_possible() {
            // Retourne la liste des dés que le joueur courant peut garder
            // S'il ne peut pas garder de dés, le tableau retourné est vide.
            // Attention, on ne veut voir apparaître qu'une seule fois la valeur des dés.
            let garde_possible = [];

            // On parcourt la liste des dés lancés
            for (const de of this.lance) {
                // Si le dé n'est pas déjà dans la liste des dés gardés, et
                // s'il n'est pas déjà dans la liste garde_possible
                // (car on ne le veut qu'une seule fois dans la liste)...
                if (!this.garde.includes(de) && !garde_possible.includes(de)) {
                    // ... alors on ajoute le dé.
                    garde_possible.push(de);
                }
            }
            return garde_possible;
        },
        total_garde() {
            // Retourne le score total des dés gardés
            let total = 0;
            for (const de of this.garde) {
                // ATTENTION, le ver (face 6) vaut 5 en réalité!
                // Donc si le dé vaut 6, on retourne 5, sinon on retourne simplement la valeur du dé.                
                total += (de == 6 ? 5 : de);
            }

            // On aurait aussi pu utiliser la fonction "reduce() à la place"
            return total;
        },
        fin_du_jeu() {
            // retourne vrai s'il n'y a plus de pickomino libre dans la brochette
            // retourne faux sinon

            for (const pickomino of this.brochette) {
                // Si on trouve un pickomino libre, le jeu n'est pas fini
                if (pickomino.etat == "libre") {
                    return false;
                }
            }
            // Aucun pickomino n'est libre, c'est la fin du jeu!
            return true;
        },
        pickomino_recuperable() {
            // Retourne un objet contenant les informations sur le pickomino qui peut être récupéré
            // par le joueur courant grâce à son score aux dés. Si aucun pickomino n'est récupérable,
            // on retourne undefined.

            // Il FAUT que le joueur possède au moins 1 ver (valeur 6) pour récupérer un pickomino.
            if (!this.garde.includes(6)) {
                return undefined;
            }

            // On regarde s'il peut récupérer un pickomino chez un autre joueur
            let index_joueur = this.pickomino_recuperable_joueur(this.total_garde);
            // Si c'est le cas (index_joueur != undefined)...
            if (index_joueur != undefined) {
                // ... on retourne l'objet suivant, qui contient toutes les indications nécessaires.
                return { emplacement: "joueur", joueur: index_joueur, valeur: this.total_garde };
            }

            // Si on arrive ici, c'est qu'on n'a pas trouvé de pickomino intéressant chez les autres joueurs

            // On regarde s'il peut récupérer un pickomino chez un autre joueur
            let valeur_pickomino_brochette = this.pickomino_recuperable_brochette(this.total_garde);
            // Si c'est le cas (valeur_pickomino_brochette != undefined)...
            if (valeur_pickomino_brochette) {
                // ... on retourne l'objet suivant, qui contient toutes les indications nécessaires.
                return { emplacement: "brochette", indice_brochette: valeur_pickomino_brochette.indice_brochette, valeur: valeur_pickomino_brochette.valeur };
            }

            // Si on arrive ici, c'est qu'on n'a pas trouvé non plus de pickomino à prendre sur la brochette...
            // On retourne undefined (c'est ce qui est retourné même si on ne met rien, mais c'est plus clair de l'écrire)
            return undefined;
        }
    },
    methods: {
        go() {
            // Le jeu commence! 
            // On enlève de la liste des joueurs ceux qui n'ont pas de nom (pas de saisie de nom == pas de joueur)
            this.joueurs = this.joueurs.filter(joueur => joueur.nom != "")

            // Le jeu est "en cours"
            this.etat = "en cours";
            // C'est au premier joueur de commencer
            this.joueur_courant = 0;
            // Il peut donc lancer les dés!
            this.phase_tour = "lancer";
        },
        async lancer_des() {
            // La fonction est 'async' car elle utilise 'await' dans son code (c'est comme ça)

            // On va lancer les dés. Si des dés ont été gardés de côté, il ne faut pas les relancer
            // On soustrait donc leur nombre à la quantité à lancer.
            for (let i = 0; i < this.nombre_des - this.garde.length; i++) {
                // On lance un dé, et on ajoute sa valeur à la liste des dés lancés.
                this.lance.push(this.lancer_de());
            }

            // On attend que VueJs mette à jour ses propriétés, car on va utiliser this.garde_possible, et
            // sa valeur dépend du contenu du tableau this.lance, dont on vient de modifier le contenu ci-dessus.
            await this.$nextTick();

            // Si on peut garder des dés...
            if (this.garde_possible.length > 0) {
                // ... on passe à la phase "garder", c'est à dire qu'on va demander au joueur quels dés
                // il veut mettre de côté
                this.phase_tour = "garder";
            }
            else {
                // Si le joueur ne peut plus mettre de dés de côté, son tour est fini, et il va devoir rendre
                // un pickomino.
                this.phase_tour = "perdu";
            }
        },
        lancer_de() {
            // Retourne une valeur entre 1 et 6 inclus
            return Math.floor(Math.random() * 6) + 1;
        },
        async garder(valeur) {
            // La fonction est 'async' car elle utilise le mot clé 'await' dans son code (c'est comme ça)

            // Ici, on va ajouter à la liste des dés gardés tous les dés de la valeur voulue qui se trouvent
            // dans la liste des dés lancés.

            // On parcourt les dés lancés...
            for (const de of this.lance) {
                // Si la valeur du dé nous intéresse...
                if (de == valeur) {
                    // On l'ajoute au dés gardés
                    this.garde.push(de);
                }
            }

            // On vide le tableau de lancer
            this.lance = [];

            // On attend que VueJs remette à jour ses valeurs, car on va utiliser this.pickomino_recuperable, dont 
            // la valeur dépend de la liste de dés gardés qu'on vient de modifier juste au dessus
            await this.$nextTick();

            // Si on peut récupérer un pickomino..   (valeur de this.pickomino_recuperable != undefined)
            if (this.pickomino_recuperable) {
                // ...on passe à la phase "continuer?", c'est à dire qu'on va demander au joueur courant s'il
                // veut prendre le pickomino ou continuer à lancer les dés
                this.phase_tour = "continuer?";
            }
            else {
                // Si on ne peut pas récupérer de pickomino, il faut relancer les dés

                // Mais si tous les dés sont gardés, il n'y a plus de dés à lancer, donc on arrête...
                if (this.garde.length == this.nombre_des) {
                    this.phase_tour = "perdu";
                }
                else {
                    // S'il reste des dés à lancer, on passe à la phase de lancer
                    this.phase_tour = "lancer";
                }

            }

        },
        pickomino_recuperable_joueur(valeur) {
            // Est-ce qu'un joueur a le pickomino de la valeur recherchée au dessus de sa pile?
            // (dessus de la pile == premier pickomino du tableau)

            // On parcourt la liste des joueurs
            for (let i = 0; i < this.joueurs.length; i++) {
                // Si ce joueur possède des pickominos, on regarde si le premier du tableau est celui qu'on cherche
                if (this.joueurs[i].pickominos.length > 0 && this.joueurs[i].pickominos[0].valeur == valeur) {
                    // Si le joueur en question c'est le joueur en cours, dommage, on ne peut pas se voler soit même :(
                    // dans ce cas il faut retourner undefined. Mais si c'est un autre joueur, c'est bon.
                    return i == this.joueur_courant ? undefined : i;
                    // On retourne l'indice du joueur qui possède le pickomino recherché, comme ça on saura
                    // où aller le cherche si le joueur en cours décide de le prendre.
                }
            }
            return undefined;
        },
        pickomino_recuperable_brochette(valeur) {
            // Est-ce qu'il y a un pickomino récupérable sur la brochette?

            // On va parcourir le tableau brochette en partant de la fin
            for (let i = this.brochette.length - 1; i >= 0; i--) {
                // Si on tombe sur un pickomino qui est libre, et dont la valeur est égale ou supérieur
                // à la valeur qu'on cherche, on peut le prendre
                if (this.brochette[i].etat == "libre" && this.brochette[i].valeur <= valeur) {
                    // On retourne un objet qui contient toutes les informations utiles:
                    // Sa valeur: car elle peut être inférieure à celle recherchée
                    // L'indice où il se trouve: pour aller le chercher si le joueur décide de le prendre
                    return { indice_brochette: i, valeur: this.brochette[i].valeur };
                }
            }
            return undefined;
        },
        async prendre_pickomino() {
            // Le joueur courant va récupérer un pickomino

            // Est-ce que le  pickomino à récupérer se trouve sur la brochette?
            if (this.pickomino_recuperable.emplacement == "brochette") {
                // Oui! Alors l'enlève de la brochette grace à la fonction splice(), et on l'ajoute
                // au début du tableau de pickominos du joueur courant avec la fonction unshift()
                this.joueurs[this.joueur_courant].pickominos.unshift(this.brochette.splice(this.pickomino_recuperable.indice_brochette, 1)[0]);
            }
            else {
                // Non, donc c'est à un autre joueur qu'on va le prendre
                // On enlève le premier pickomino dans le tableau du joueur concerné avec shift()
                // et on l'ajoute au début du tableau de pickominos du joueur courant avec la fonction unshift()
                this.joueurs[this.joueur_courant].pickominos.unshift(this.joueurs[this.pickomino_recuperable.joueur].pickominos.shift());
            }

            // On a peut-être modifié la brochette, il faut prendre en compte le changement
            await this.$nextTick();

            // Comme le joueur peut avoir pris un pickomino de la brochette, on teste si c'est la fin du jeu
            if (this.fin_du_jeu) {
                this.etat = "fin";
                this.calculer_les_scores();
            }
            else {
                // C'est pas encore fini, donc on passe au joueur suivant.
                this.joueur_suivant();
            }
        },
        calculer_les_scores() {
            // Ajoute la propriété "score" pour chaque joueur
            for (let joueur of this.joueurs) {
                // On calcul le score grâce à la fonction reduce
                let score = joueur.pickominos.reduce((total, pickomino) => total += pickomino.vers, 0);
                // On utilise $set pour que VueJs capte le changement
                this.$set(joueur, "score", score)
            }
        },
        vainqueur() {
            // Retourne le vainqueur

            let meilleur_score = -1;
            // On va chercher dans le meilleur score (il peut y avoir égalité)
            for (const joueur of this.joueurs) {
                // Si ce joueur a un meilleur score, il devient le meilleur joueur
                if (joueur.score > meilleur_score) {
                    meilleur_score = joueur.score;
                }
            }

            // Maintenant, on va récupérer le tableau des joueurs qui ont ce meilleur score:
            let meilleurs_joueurs = this.joueurs.filter(joueur => joueur.score == meilleur_score);

            // S'il n'y a qu'un joueur qui a le meilleur score, il gagne
            if (meilleurs_joueurs.length == 1) {
                return meilleurs_joueurs[0];
            }
            else {
                // Sinon, c'est celui qui a le pickomino de plus grande valeur qui gagne
                let pickomino_de_plus_grande_valeur = 0;
                let gagnant;

                // On parcourt la liste des joueurs qui ont le meilleur score
                for (const joueur of meilleurs_joueurs) {
                    // On regarde leurs pickominos
                    for (const pickomino of joueur.pickominos) {
                        // On teste la valeur de tous les pickominos, pour trouver celui qui a la plus grande valeur.
                        // Celui qui possède ce pickomino est le gagnant.
                        if (pickomino.valeur > pickomino_de_plus_grande_valeur) {
                            pickomino_de_plus_grande_valeur = pickomino.valeur;
                            gagnant = joueur;
                        }
                    }
                }
                return gagnant;
            }

        },
        rendre() {
            // Le joueur courant doit remettre le premier pickomino de son tableau dans la brochette

            // S'il a au moins 1 pickomino...
            if (this.joueurs[this.joueur_courant].pickominos.length > 0) {

                // On le prend...
                let pickomino_rendu = this.joueurs[this.joueur_courant].pickominos.shift();

                // Et on trouve l'endroit où le mettre dans la brochette.
                for (let i = 0; i < this.brochette.length; i++) {
                    // Pour insérer le pickomino au bon endroit dans la brochette
                    // En partant du début, dès qu'on trouve un pickomino dont la valeur est supérieure 
                    // au pickomino à rendre, on sait que c'est ici qu'il faut insérer le pickomino à rendre
                    if (this.brochette[i].valeur > pickomino_rendu.valeur) {
                        // La fonction splice() permet d'insérer le pickomino à l'endroit voulu
                        this.brochette.splice(i, 0, pickomino_rendu);

                        // Maintenant on regarde quel pickomino est à retourner (c'est le dernier libre dans la brochette)
                        for (let j = this.brochette.length - 1; j >= 0; j--) {
                            if (this.brochette[j].etat == "libre") {
                                // Si c'est celui qu'on vient juste de rendre, alors on ne le retourne pas
                                // Donc on le retourne uniquement si la valeur est différente
                                if (this.brochette[j].valeur != pickomino_rendu.valeur) {
                                    // Pour modifier la propriété d'un objet de VueJs, on doit utiliser la fonction $set
                                    // Si on ne le fait pas, VueJs ne capte pas le changement, et les valeurs ne se mettent pas à jour
                                    this.$set(this.brochette[j], "etat", "retourné");
                                }
                                // On passe au tour du joueur suivant
                                this.joueur_suivant();
                                return;
                            }
                        }
                        this.joueur_suivant();
                        return;
                    }
                }

            }
            this.joueur_suivant();
        },
        joueur_suivant() {
            // On va passer au joueur suivant            
            this.joueur_courant++;

            // Si on est à la fin du tableau de joueur...
            if (this.joueur_courant >= this.joueurs.length) {
                // ... on revient au début
                this.joueur_courant = 0;
            }

            // On réinitialise le tableau de dés lancés, de dés gardés, et on passe à la phase "lancer"
            this.lance = [];
            this.garde = [];
            this.phase_tour = "lancer";
        }


    }
})