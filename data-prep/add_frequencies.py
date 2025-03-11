import json
from random import random
from math import log
from wordfreq import word_frequency

def random_in_scaled_range(min_value, max_value):
    # Randomly pick a number between 0 and 1, and scale it to the range [min_value, max_value]
    return (max_value - min_value) * (random() ** 2) + min_value  # Using the square to skew towards the lower end

# Load the list of words from the JSON file
input_file = 'dictionary_filtered.json'
output_file = 'dictionary_filtered_wfreq_loged.json'

with open(input_file, 'r') as file:
    words = json.load(file)

# Create a dictionary to store words and their frequencies
words_with_frequencies = {}

# Get the frequency for each word
for word in words:
    frequency = word_frequency(word, 'en')
    if (frequency > 0):
        frequency = log(frequency) * -1
        if (frequency > 0):
            frequency -= 4.58
    else:
        frequency = random_in_scaled_range(0.0, 13.81) # 13.81 is the highest value of the non-zero words
    words_with_frequencies[word] = frequency

# Write the new data to a JSON file
with open(output_file, 'w') as file:
    json.dump(words_with_frequencies, file, indent=2)

print(f"Frequencies for words saved to {output_file}")
