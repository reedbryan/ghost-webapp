# Ghost webapp

Ghost (also known as ghosts or pig) is a written or spoken word game in which players take turns to extend the letters of a word without completing a valid word.

With this app you can play Ghost against an AI opponent. [Click here to play](https://reedbryan.github.io/ghost-webapp/)

## Game Rules

Players take turns to call a letter, adding those letters to a shared, growing word fragment. (For example, if the first player calls "T", the second might call "R" to make "TR".)

Each fragment must be the beginning of an actual word.

The player whose turn it is may — instead of adding a letter — challenge the previous player to prove that the current fragment is actually the beginning of a word. If the challenged player can name such a word, the challenger loses the round; otherwise the challenged player loses the round. If a player bluffs, or completes a word without other players noticing, then play continues.

If a complete word is formed in this way, the player who called the final letter of it loses the round. (the minimum length of a word that counts is four letters.) The losing player earns a "letter" (as in the basketball game horse), with players being eliminated when they have been given all five letters forming the word "ghost".

## Word Bank
The database of words used by the app's bot was created first downloading a .json of the scrabble dictionary I found on github [here](https://github.com/benjamincrom/scrabble/blob/master/scrabble/dictionary.json).

I then filtered out all the words with 3 or less characters since in Ghost we only keep track of words with 4 or more letters. I also checked for any consecutive duplicates.

In order for the AI to make decisions on which letter to select I needed each word in the dictionary to have a "frequency" value which represents how frequently the word is used in daily life. The [wordfreq](https://pypi.org/project/wordfreq/) python library has a "word_frequency(word, lang, wordlist='best', minimum=0.0)" funtion which gives a spoken-frequency rating from 0.0 to 1.0 to the passed word.

Using the [wordfreq](https://pypi.org/project/wordfreq/) I wrote a short Python script that iterates through the dictionary, giving it a value from 0-1 which, when graphed, resulted in the following data:
![Alt text](https://github.com/reedbryan/ghost-webapp/blob/main/data-prep/scrabbledic-plot.png)

After graphing the results of my word-frequecy dictionary I noticed that the majority of words where given incredably small values in comparison to a small subset with very large ones. After some debugging I found that this was due to the heavy hitters like "the" or "is" being given frequencies hundreds of times larger than most other words (which makes sense). To fix this I used a Python's log() function to smooth out the range of frequency values giving this:
![Alt text](https://github.com/reedbryan/ghost-webapp/blob/main/data-prep/scrabbledic-logplot.png)

After tweaking the script a little more to adjust for the log results I endded up with a much more processable range of frequencies with values from 13.81 to 0 with and an average of 10.73:
![Alt text](https://github.com/reedbryan/ghost-webapp/blob/main/data-prep/scrabbledic-finalplot.png)

The final dictionary.json would allow the AI to evaluate words in a more human manor. Weighing the each letter by of all the possible words that it could create and the frequency in which those words appear in the english language. The data is also alphabetized which allows the AI to more quickly evaluate possible branchs of words that can be derived from a new letter.

All plots and versions of the dictionary can be found under [data-prep](https://github.com/reedbryan/ghost-webapp/tree/main/data-prep)


## The AI
AI's logic is to search the wordbank for all possible words created from the current sequence of letters. It then weighs each letter by the combine weight of all word from that list based on the following logic.
- if the word would end with the user choosing the final letter (the user loses the game) then that word's weight is its _positive_ frequency
- if the word would end with the AI choosing the final letter (the AI loses the game) then that word's weight is its _negative_ frequency

Since the data is alphabetized, in the code the AI groups collections of words that share the same prefix to compare next first few letters. This way if there is a group of words are continuations of a word that ends well for the AI it will weight all those words possitively because they could be considered by the player but could never be reached without spelling that first word. An example of this is the word ['fantast'](https://www.wordplays.com/scrabble-dictionary/fantast). The AI evaluates this group as such:

current_sequence: fanta

potential_next_letter: s

current_group: fantast (fantast is a word in scrable dict)

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
  "fantasts": 0.0,

The fantast group has a total weight of 48.7058901139179, added to 's'

New group for letter: s with base word: fantasy

...

If the word group ends in a "player win" (baseEndsWell is true), the frequency of the next_word is added to the group_weight, which represents the importance of that letter in forming the optimal word.
This way a letter is evaluated by how often the user will select their letter with the goal of spelling a word that would eventually lose them the game.
