import json
import pandas as pd
import matplotlib.pyplot as plt

# Step 1: Load the JSON file
with open('dictionary_filtered_wfreq_loged.json', 'r') as file:
    data = json.load(file)

# Step 2: Convert to a DataFrame
df = pd.DataFrame(list(data.items()), columns=['Word', 'Value'])

# Step 3: Filter values above 0.001
filtered_df = df[df['Value'] > 0.001]

# Step 4: Calculate the average value of filtered data
average_value = filtered_df['Value'].mean()
print(f'Average Value (above 0.001): {average_value}')

# Step 5: Plot the data
plt.figure(figsize=(10, 6))
plt.hist(df['Value'], bins=50, edgecolor='k')
plt.xlabel('Value')
plt.ylabel('Frequency')
plt.title('Distribution of Values')
plt.yscale('log')  # Use logarithmic scale if needed for better visibility

# Step 6: Add average value line
plt.axvline(average_value, color='r', linestyle='dashed', linewidth=1)
min_ylim, max_ylim = plt.ylim()
plt.text(average_value * 1.1, max_ylim * 0.9, f'Avg: {average_value:.2f}', color='r')

plt.show()
