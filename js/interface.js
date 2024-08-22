const alphabet = [];
for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(97 + i); // 97 is the char code for 'a'
    alphabet[i] = letter;
}
alphabet[26] = '!';

const info = document.querySelector('#keyboard');
let details = alphabet.map(function(item){
    return '<button class="hoverable" onclick="OnKeyClick(\''+ item +'\')">' + item +  '</button >';
});
info.innerHTML = details.join('\n');


const elements = document.querySelectorAll('.hoverable');
elements.forEach(element => {
    element.addEventListener('mouseenter', () => {
        if(!element.classList.contains('hover')){
            element.classList.add('hover');
        }
    });
    element.addEventListener('mouseleave', () => {
        if(element.classList.contains('hover')){
            element.classList.remove('hover');
        }
    }); 
});