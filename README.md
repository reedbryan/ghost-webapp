# Ghost Webapp

Ghost (also known as ghosts or pig) is a written or spoken word game in which players take turns extending the letters of a word without completing a valid word.

With this app, you can play Ghost against an AI opponent. [Click here to play](https://reedbryan.github.io/ghost-webapp/).

## Game Rules

Players take turns calling a letter, adding those letters to a shared, growing word fragment. (For example, if the first player calls "T", the second might call "R" to make "TR".)

Each fragment must be the beginning of an actual word.

The player whose turn it is may — instead of adding a letter — challenge the previous player to prove that the current fragment is actually the beginning of a word. If the challenged player can name such a word, the challenger loses the round; otherwise, the challenged player loses the round. If a player bluffs, or completes a word without other players noticing, then play continues.

If a complete word is formed in this way, the player who called the final letter of it loses the round. (The minimum length of a word that counts is four letters.) The losing player earns a "letter" (as in the basketball game HORSE), with players being eliminated when they have earned all five letters forming the word "GHOST".

## Word Bank

The database of words used by the app's bot was created by first downloading a `.json` file of the Scrabble dictionary I found on GitHub [here](https://github.com/benjamincrom/scrabble/blob/master/scrabble/dictionary.json).

I then filtered out all words with 3 or fewer characters since in Ghost we only keep track of words with 4 or more letters. I also checked for any consecutive duplicates.

In order for the AI to make decisions on which letter to select, I needed each word in the dictionary to have a "frequency" value, which represents how frequently the word is used in daily life. The [wordfreq](https://pypi.org/project/wordfreq/) Python library has a `word_frequency(word, lang, wordlist='best', minimum=0.0)` function that gives a spoken-frequency rating from 0.0 to 1.0 for the passed word.

Using the [wordfreq](https://pypi.org/project/wordfreq/) library, I wrote a short Python script that iterates through the dictionary, assigning it a value from 0 to 1. When graphed, the results looked like this:
![Alt text](https://github.com/reedbryan/ghost-webapp/blob/main/data-prep/scrabbledic-plot.png)

After graphing the results of my word-frequency dictionary, I noticed that the majority of words had incredibly small values compared to a small subset with very large ones. After some debugging, I found that this was due to heavy hitters like "the" or "is" being assigned frequencies hundreds of times larger than most other words (which makes sense). To fix this, I used Python's `log()` function to smooth out the range of frequency values, resulting in the following:
![Alt text](https://github.com/reedbryan/ghost-webapp/blob/main/data-prep/scrabbledic-logplot.png)

After tweaking the script a bit more to adjust for the log results, I ended up with a much more processable range of frequencies with values from 13.81 to 0, and an average of 10.73:
![Alt text](https://github.com/reedbryan/ghost-webapp/blob/main/data-prep/scrabbledic-finalplot.png)

The final `dictionary.json` allows the AI to evaluate words in a more human-like manner, weighing each letter based on all the possible words it could create and the frequency with which those words appear in the English language. The data is also alphabetized, which allows the AI to more quickly evaluate possible branches of words that can be derived from a new letter.

All plots and versions of the dictionary can be found under [data-prep](https://github.com/reedbryan/ghost-webapp/tree/main/data-prep).

## The AI

The AI's logic is to search the word bank for all possible words created from the current sequence of letters. It then weighs each letter by the combined weight of all words in that list based on the following logic:
- If the word would end with the user choosing the final letter (i.e., the user loses the game), then that word's weight is its **positive** frequency.
- If the word would end with the AI choosing the final letter (i.e., the AI loses the game), then that word's weight is its **negative** frequency.

Since the data is alphabetized, the AI groups collections of words that share the same prefix to compare the next few letters. This way, if there is a group of words that are continuations of a word that ends well for the AI, it will weigh all those words positively because they could be considered by the player but could never be reached without spelling that first word.

An example of this is the word `'fantast'` with the current sequence of letters being `fanta`. The AI evaluates this group as follows:

current_sequence: `fanta`

potential_next_letter: `s`

current_group: fantast (fantast is a word in the Scrabble dictionary)

  ```json
  "fantast": 13.540576151502028,
  "fantastic": 5.297819805787551,
  "fantastical": 9.32762584687208,
  "fantasticalities": 0.0,
  "fantasticality": 0.0,
  "fantastically": 9.186720393794841,
  "fantasticalness": 0.0,
  "fantasticalnesses": 0.0,
  "fantasticate": 0.0,
  "fantasticated": 0.0,
  "fantasticates": 0.0,
  "fantasticating": 0.0,
  "fantastication": 0.0,
  "fantastications": 0.0,
  "fantastico": 11.813849152544828,
  "fantasticoes": 0.0,
  "fantastics": 13.079874914918607,
  "fantasts": 0.0
```

The fantast group has a total weight of 48.7058901139179, added to `s`

New group for letter: s with base word: fantasy

...

The logic here is that if the bot choses the next letter 's' then the user may chose 't' trying to spell 'fantastic', 'fantastical' etc, and would lose the game.
