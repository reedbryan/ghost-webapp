function getOptimalLetterNew(){
    const letter_weights = {};
    for (let i = 0; i < 26; i++) {
        const letter = String.fromCharCode(97 + i); // 97 is the char code for 'a'
        letter_weights[letter] = 0;
    }
    
    
    for (let i=0; i < possible_words.length; i++){
        const base_word = possible_words[i]
        const baseEndsWell = (base_word.length - current_word.length) % 2 === 0

        console.log("new group with: " + base_word);

        let next_word = possible_words[i+1]        
        let letter_group = [base_word]
        let group_weight = word_freq[base_word]
        let group_index = i
        while (base_word.slice(0, current_word.length + 1) 
                == next_word.slice(0, current_word.length + 1) 
                && next_word!==null){
            
            group_index+=1;

            console.log(next_word + " is the " + (group_index - i) + "th word in the " + base_word + " group");

            if (base_word !== next_word.slice(0, base_word.length)){
                // next_word contains base_word
                if (baseEndsWell){
                    // and base_word ends with the player (good) -> add the weight as a positive
                    // * if not the weight will be ignored
                    group_weight += Math.abs(word_freq[next_word]);
                }
            }

            letter_group.add(next_word);
            next_word = possible_words[group_index+1];
        }
        
        i = group_index;
        letter_weights[base_word[current_word.length]] += thisWord_nextLetterWeight;
    }

    console.log(letter_weights);

    return findMaxKey(letter_weights);
}





// OLD


function getOptimalLetter(){
    const letter_weights = {};
    for (let i = 0; i < 26; i++) {
        const letter = String.fromCharCode(97 + i); // 97 is the char code for 'a'
        letter_weights[letter] = 0;
    }
    
    let group_word = '';
    let group_weight = 0;
    possible_words.forEach(thisWord => {
        // the difference between the legth of the word being looked at and the current word
        const thisWord_lettersLeft = thisWord.length - current_word.length;
        // the n+1th letter of the word being looked at where n is the length of the current word
        const thisWord_nextLetter = thisWord[current_word.length];
        // the frequency of the word being looked at
        const thisWord_freq = word_freq[thisWord];
        
        let thisWord_nextLetterWeight;
        if (thisWord_lettersLeft == 1){
            // if the next letter leads to a word being spelled -> get rid of that letter
            thisWord_nextLetterWeight = -Infinity;
        }
        else if (thisWord_lettersLeft % 2 == 0){    // forces player to finish word (good)
            thisWord_nextLetterWeight = (MAX_WORD_FREQ - thisWord_freq) * bot_difficulty;
        }
        else{                                       // forces bot to finish word (bad)
            thisWord_nextLetterWeight = (MAX_WORD_FREQ - thisWord_freq) * bot_difficulty * -1;
        }

        if (current_word.length <= 2){
            /* if the current word is longer then 2 letters at this point:
                then when looking at this word and its letter we take into
                account all the words possible if this choise is made to
                better predict the value of the next letter */

            if (group_word == ''){
                group_word = thisWord;
            }
            else if (thisWord.slice(0, group_word.length) == group_word){ // CHECK THIS WORKS!!!!!
                // if this word is contained in the group word
                group_weight += thisWord_nextLetterWeight;
            }
        }

        console.log(thisWord + " has a weight of: " + thisWord_nextLetterWeight);

        letter_weights[thisWord_nextLetter] += thisWord_nextLetterWeight;
    });

    console.log(letter_weights);

    //console.log("BEST LETTER: " + findMaxKey(letter_weights));

    return findMaxKey(letter_weights);
}