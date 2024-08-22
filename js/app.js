/* GAMEPLAY LOGIC */

// Initialize the word letiable
// Initialize and fill possible words array with all words from dic file
let current_word = "";
let all_words = [];
let possible_words = [];
let word_freq = [];

const MAX_WORD_FREQ = 13.81;
const AV_WORD_FREQ = 10.73;

const bot_difficulty = 1.0; // decimal 0.0 - 1.0

let base_ghost_string = 'GHOST';
let player_ghost_string = '';
let bot_ghost_string = '';
let player_under_challange = false;

async function initializeGame() {
    await loadDictionary('js/dictionaries/dictionary_filtered.json'); // Loads from index.html file (ion why)
    await loadDictionaryFreqKeys('js/dictionaries/dictionary_filtered_wfreq_loged.json');
}
  
initializeGame();

// Get elements from page
const form = document.getElementById('text-input-form');
const response_text = document.getElementById('response-text');
const current_word_text = document.getElementById('current-word-text');
const textInputField = document.getElementById('textInput');


// Add an event listener for the form submit event
form.addEventListener('submit', function(event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    OnSubmitClick();
});


/* FUNCTION DEFINITIONS */

function EndGame(winner){
    console.log('Game Over, ' + winner + ' wins.');
    response_text.textContent = 'Game Over, ' + winner + ' wins.';
    current_word_text.textContent = 'Choose a letter to begin the word';
    ResetGameVariables(true);
}
function ResetGameVariables(gameOver){
    current_word = '';
    possible_words = all_words;
    player_under_challange = false;

    if (gameOver){
        player_ghost_string = '';
        bot_ghost_string = '';
    }
}
function GiveLetter(target){
    ResetGameVariables(false);

    console.log("Giving " + target + " a letter");
    if (target == 'player'){
        let currlen = player_ghost_string.length;
        player_ghost_string += base_ghost_string[currlen];
        currlen+=1;
        if (currlen >= 5){
            EndGame('bot');
        }
        current_word_text.textContent = 'Choose a letter to begin the word';
    }
    else if (target == 'bot'){
        let currlen = bot_ghost_string.length;
        bot_ghost_string += base_ghost_string[currlen];
        currlen+=1;
        if (currlen >= 5){
            EndGame('player');
        }
        else{
            GenerateResponse();
        }
    }
    else {console.log("GiveLetter() recived an invalid input")}

    document.getElementById('player-display').textContent = 'Player: ' + player_ghost_string;
    document.getElementById('bot-display').textContent = 'Bot: ' + bot_ghost_string;

    response_text.textContent += target + ' was given a letter';    
}
// On key-button pressed
function OnKeyClick(key){
    if (key === '!'){
        PlayerChallange();
    }
    else{
        ProcessInput(key);
        GenerateResponse();

        current_word_text.textContent = current_word;

        console.log('Current word: ' + current_word);
    }
}
// On submit button
function OnSubmitClick(){

    if (ProcessInput(textInputField.value)){
        console.log('Generate Response')
        GenerateResponse();
    }

    // make challange textbox invisible again
    form.classList.add('inactive');
    
    console.log('Current word: ' + current_word);
}
function ProcessInput(input){
    // Check/correct input validity
    if (player_under_challange){
        
        /*  Check if the inputed word matchs one of the possible words */
        possible_words.forEach(word =>{
            if (word == input){
                response_text.textContent = 'your right ' + word + ' could have been spelled. '
                GiveLetter('bot');
                return true;
            }
        });

        response_text.textContent = input + ' is not a word. '
        GiveLetter('player');
        return false;
        
    }
    else{
        if (isLetter(input) == false){
            console.log('Invalid input please try again.');
            response_text.textContent = 'Invalid input please try again.';
            return false;
        }
        input = input.toLowerCase();
        
        current_word = current_word + input;

        response_text.textContent = 'You entered the letter ' + input + ' and ';

        // Remove all words that can no longer be spelled
        prunePossible_words();
    
        return true;
    }
}
// Response to a valid input
function GenerateResponse(){   
    
    /*  Check if the current word matches a word in the dictionary,
        if so then give player a letter */
    possible_words.forEach(word =>{
        if (word == current_word){
            response_text.textContent += 'have spelled the word ' + word + '. ';
            GiveLetter('player');
            return false;
        }
    });

    // Response
    let new_letter = '';
    
    // current_word len=0
    if (current_word.length == 0){
        new_letter = getRandomLetter();
    }
    else{
        if (possible_words.length == 0){
            // CHALLANGE: 
            response_text.textContent = 'I challage, enter the word you are spelling.';       
            BotChallange();
        }
        else{
            // ADD NEW LETTER:

            /*  calculate the number of words that should be removed
                based on the bot's difficulty setting */ 
            let words_to_remove = possible_words.length - (possible_words.length * bot_difficulty);

            //console.log('PRE PRUNE: ' + possible_words.length + ' Removing: ' + elements_to_remove + ' elements');
            
            // remove words at random
            for (let i = 0; i < words_to_remove; i++) {
                possible_words.splice(getRandomInt(0, possible_words.length), 1);
            }
            
            // generate a vaible new letter
            // RANDOM POSSIBLE LETTER: let new_letter = possible_words[getRandomInt(0, possible_words.length - 1)][cur_word_len];
            new_letter = getOptimalLetter();

            response_text.textContent += ' I respond with the letter ' + new_letter;
            console.log('New letter by bot: ' + new_letter);

            //console.log('POST PRUNE: ' + possible_words.length);
        }
    }

    // add a letter to the current word
    current_word = current_word + new_letter;

    // update ui
    current_word_text.textContent = current_word;

    // Remove all words that can no longer be spelled
    prunePossible_words();

    //console.log('possible words: ' + possible_words);
}
function getOptimalLetter(){
    const letter_weights = {};
    for (let i = 0; i < 26; i++) {
        const letter = String.fromCharCode(97 + i); // 97 is the char code for 'a'
        letter_weights[letter] = 0;
    }
    
    
    for (let i=0; i < possible_words.length; i++){
        const base_word = possible_words[i]
        // the difference between the legth of the word being looked at and the current word
        const baseword_lettersLeft = base_word.length - current_word.length
        const baseEndsWell = baseword_lettersLeft % 2 === 0
        const group_letter = base_word[current_word.length]

        if (baseword_lettersLeft == 1 || letter_weights[group_letter] == -Infinity){
            // if the next letter leads to a word being spelled -> get rid of that letter
            letter_weights[group_letter] += -Infinity;
            console.log("The letter " + group_letter + " would spell the word " + base_word.slice(0, current_word.length + 1) + " letter eliminated");
            continue
        }

        console.log("new group for letter: " + group_letter + " with base word: " + base_word);

        let next_word = possible_words[i+1]        
        let letter_group = [base_word]
        let group_weight = 0
        let group_index = i
        while (next_word !== undefined // check that we arnt at the end of the list
                && base_word.slice(0, current_word.length + 2)
                === next_word.slice(0, current_word.length + 2)){
            
            group_index+=1;

            if (baseEndsWell){
                // and base_word ends with the player (good) -> add the weight as a positive
                // * if not the weight will be ignored
                group_weight += Math.abs(word_freq[next_word]);
                console.log(base_word + " ends well so " + Math.abs(word_freq[next_word]) + " was added to " + group_letter + " for the word " + next_word);
            }
            else{
                console.log(base_word + " ends bad so nothing was added to " + group_letter);
            }

            /*
            if (next_word.slice(0, base_word.length) == base_word){
                // next_word contains base_word
                if (baseEndsWell){
                    // and base_word ends with the player (good) -> add the weight as a positive
                    // * if not the weight will be ignored
                    group_weight += Math.abs(word_freq[next_word]);
                    console.log(base_word + " ends well so " + Math.abs(word_freq[next_word]) + " was added to " + group_letter + " for the word " + next_word);
                }
                else{
                    console.log(base_word + " ends bad so nothing was added to " + group_letter);
                }
            }
            else {
                console.log(next_word + " was not accounted for");
            }
            */

            letter_group[group_index] = next_word;
            next_word = possible_words[group_index+1];
        }
        
        i = group_index;
        letter_weights[group_letter] += group_weight;
        console.log("The " + base_word + " group has a weight of " + group_weight);
    }
    

    console.log(letter_weights);
    //return getRandomLetter(); easy mode (for debugging)
    return findMaxKey(letter_weights);
}
function BotChallange(){
    player_under_challange = true;

    // make challange textbox visible
    form.classList.remove('inactive');
}
function PlayerChallange(){
    console.log("player is challanging");
    
    /*  Check if the current word matches a word in the dictionary,
    if so then end the game */
    current_word_isAWord = false;
    possible_words.forEach(word =>{
        if (word == current_word){
            current_word_isAWord = true;
        }
    });

    if (current_word_isAWord){
        console.log("player challange successful");
        response_text.textContent = 'I spelled the word ' + current_word + ', you got me（ᗒロᗕ）.';
        GiveLetter('bot');
    }
    else if (possible_words.length !== 0){
        let response =  current_word + ' can spell the following words: ';
        console.log("player challange unsuccessful");

        for (let i = 0; i < 3 && possible_words[i] != null; i++){
            response += possible_words[i] + ', ';
        } response += 'etc... ';

        response_text.textContent = response;
        GiveLetter('player');
    }
    else {
        console.log("player challange successful");
        response_text.textContent = 'I was bluffing, you got me（ᗒロᗕ）.';
        GiveLetter('bot');
    }
}
// Functions to load and parse the JSON files
async function loadDictionary(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        possible_words = data; // Assign the fetched data to the global variable
        all_words = data;
    } 
    catch (error) {
        console.error('Error loading the Scrabble dictionary:', error);
    }
}
async function loadDictionaryFreqKeys(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        word_freq = data; // Assign the fetched data to the global variable
    } 
    catch (error) {
        console.error('Error loading the Scrabble dictionary:', error);
    }
}
function getRandomLetter() {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const randomIndex = Math.floor(Math.random() * letters.length);
    return letters[randomIndex];
}
function getRandomInt(min, max) {
    min = Math.ceil(min); // Ensure the min value is rounded up to the nearest integer
    max = Math.floor(max); // Ensure the max value is rounded down to the nearest integer
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function isLetter(char) {
    // Ensure the input is a single character
    if (char.length != 1) {
        return false;
    }
    
    // Regular expression to match a single letter (uppercase or lowercase)
    const regex = /^[A-Za-z]$/;
    return regex.test(char);
}
function findMaxKey(obj) {
    let maxKey = getRandomLetter();
    let maxValue = -Infinity;
  
    for (const [key, value] of Object.entries(obj)) {
        if (value > maxValue && value != 0) { // lots of the datapoints are 0 by default
            maxValue = value;
            maxKey = key;
        }
    }

    if (maxValue === -Infinity){
        // bluff
        const vowels = ['a', 'e', 'i', 'o', 'u'];
        randomIndex = Math.floor(Math.random() * vowels.length);
        maxKey = vowels[randomIndex];
    }
    
    return maxKey;
}
function firstNLettersIdentical(str1, str2, n) {
    // Check if the input strings are not null and n is a positive integer
    if (typeof str1 !== 'string' || typeof str2 !== 'string' || n <= 0) {
        throw new Error("Invalid input: Ensure the strings are valid and 'n' is a positive integer.");
    }
    
    // Extract the first n letters from both strings
    const firstNLetters1 = str1.substring(0, n);
    const firstNLetters2 = str2.substring(0, n);

    // Compare the first n letters
    return firstNLetters1 === firstNLetters2;
}
function prunePossible_words(){
    let cur_word_len = current_word.length;
    possible_words = possible_words.filter(word => word.slice(0, cur_word_len) === current_word);
}