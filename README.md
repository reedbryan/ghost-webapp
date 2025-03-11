# Ghost webapp

Ghost (also known as ghosts or pig) is a written or spoken word game in which players take turns to extend the letters of a word without completing a valid word.

With this app you can play Ghost against an AI opponent. [Click here to play](https://reedbryan.github.io/ghost-webapp/)

## Game Rules

Players take turns to call a letter, adding those letters to a shared, growing word fragment. (For example, if the first player calls "T", the second might call "R" to make "TR".)

Each fragment must be the beginning of an actual word.

The player whose turn it is may — instead of adding a letter — challenge the previous player to prove that the current fragment is actually the beginning of a word. If the challenged player can name such a word, the challenger loses the round; otherwise the challenged player loses the round. If a player bluffs, or completes a word without other players noticing, then play continues.

If a complete word is formed in this way, the player who called the final letter of it loses the round. (the minimum length of a word that counts is four letters.) The losing player earns a "letter" (as in the basketball game horse), with players being eliminated when they have been given all five letters forming the word "ghost".

# Word Bank
The database of words used by the app's bot was created first downloading a .json of the scrabble disctionary I found on github [here](https://github.com/benjamincrom/scrabble/blob/master/scrabble/dictionary.json).

I then filtered out all the words with 3 or less characters since in Ghost we only keep track of words with 4 or more letters. I also checked for any consecutive duplicates.

Then wrote a short python script using the [wordfreq](https://pypi.org/project/wordfreq/) python library to spit out anotth .json where each word in the wordbank is given a spoken-frequency rating from 0 to 8. This data is used by the AI to chose its next letter.

# The AI
AI's logic is to search the wordbank for all possible words created from the user's first letter. It then selects a word from that list based on frequency and an element of random an sends the next letter to be reviewed by the user. The user will then either challange the AI to spell a possible word from the current sequence of letter or will input another letter. On that input the AI will again find all possible words that can be spelled from the current sequence, if none are found it will challange the user, if there are it select another word based on frequency/randomness and send back the next letter. The process repeats as such until a word it spelled or a challange is issued.
