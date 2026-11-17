# SoundDeck

Fabrique des bruitages rétro pour tes jeux, en quelques clics : 16 familles, 23 réglages, des mélanges et des jingles.

*English version: [README.en.md](README.en.md)*

![SoundDeck](screenshots/1.jpg)

## Version téléphone

Même affichage que sur PC, en une colonne : le son et les pads en haut, les réglages en dessous. Un toucher sur un pad le joue ou y range le son ; un appui long le reprend, le renomme ou le vide. Le clavier est remplacé par une rangée de notes (Do à Do). Les fichiers exportés s'enregistrent dans le dossier Téléchargements/NeoDex du téléphone.

## Tirer un son au hasard

16 familles : **pièce**, **saut**, **laser**, **explosion**, **bonus**, **touché**, **clic**, **porte**, **tir**, **pas**, **magie**, **alarme**, **moteur**, **menu**, **aïe** et **montée**. Chaque clic tire un nouveau son de la famille et le joue. **🎲 Variante** change un peu les réglages du son en cours, **🎲 Hasard total** tire tous les réglages.

## Régler

- 6 formes d'onde : carrée, dent de scie, sinus, triangle, bruit et bruit métal (le bruit « court » de la NES).
- 23 curseurs rangés en 5 rubriques :
  - **Hauteur** : hauteur, glissando, répétition (le glissando qui recommence, pour les sirènes et les montées), largeur de la carrée et largeur qui bouge.
  - **Enveloppe** : attaque, tenue, chute, punch.
  - **Modulation** : vibrato, arpège (un saut de hauteur à un moment donné), trémolo, et leurs vitesses.
  - **Filtres** : filtre avec résonance, passe-haut.
  - **Effets** : distorsion, écrasement (son plus « 8 bits »), écho et son délai, volume.
- **🔒** à côté d'un curseur (ou de la forme) : le verrouiller. Variante, Hasard et les familles ne le touchent plus.
- La forme d'onde est dessinée en direct (l'écho en violet), avec un curseur pendant la lecture ; un clic dessus (ou **Espace**) joue le son.
- **✎** renomme le son, **↶ ↷** (ou **Ctrl+Z / Ctrl+Y**) annulent et refont. L'**historique** garde les 12 derniers sons tirés.
- **Clavier** : **A S D F G H J K** (et **W E T Y U** pour les dièses) jouent le son en notes, sur une octave.

## Mélange

Empile jusqu'à 12 sons, chacun avec son moment de départ et son volume : **+ Son actuel** l'ajoute à la fin. **Jingles** en donne cinq tout faits (victoire, défaite, niveau suivant, bonus, game over), à modifier. **▶ Mélange** pour l'écouter, **WAV** pour l'exporter, et clic droit sur un pad vide pour l'y ranger.

## Les pads

12 pads pour ranger tes sons (♪) et tes mélanges (♫) : clic sur un pad vide pour y ranger le son en cours, clic sur un pad plein pour le jouer, clic droit pour le reprendre, le renommer ou le vider. Les touches **1** à **9**, **0**, **-** et **=** jouent les pads, comme une boîte à rythmes. **Exporter la banque** et **Ouvrir une banque** : les 12 pads dans un fichier. **Tous en WAV** : un fichier par pad.

## Exporter

**Exporter WAV** : le son en cours, en mono, en 44,1, 22 ou 11 kHz et en 16 ou 8 bits, prêt pour un moteur de jeu.

## Données

Le son en cours, les verrous, le mélange et les pads sont gardés dans le dossier du plugin. Autorisation : `storage` seulement.
