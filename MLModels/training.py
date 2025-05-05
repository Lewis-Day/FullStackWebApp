# File that was used to train the Neural Network model

import tensorflow as tf
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

print("version")
print(tf.__version__)

# Load the data
trainData = pd.read_csv('trainingData.csv')

userid = trainData['userId'].astype('int64')
gameid = trainData['gameIdFact'].astype('int64')
userRatings = trainData['userRating'].astype('float64')

# Get the number of unique user and game IDs
user_embedding_size = userid.nunique() + 1
game_embedding_size = gameid.nunique() + 1

# Ensure all userId and gameId are within valid ranges
max_user_id = user_embedding_size - 1
max_game_id = game_embedding_size - 1

# Remove data out of range
userid = np.clip(userid, 0, max_user_id)
gameid = np.clip(gameid, 0, max_game_id)

# Definition of the model

# Shape the input layers correctly as a 1 dimensional vector
users = tf.keras.layers.Input(shape=(1,))
games = tf.keras.layers.Input(shape=(1,))

# Embedding Layers
userLayer = tf.keras.layers.Embedding(input_dim=userid.max()+1, output_dim=112)(users)
gameLayer = tf.keras.layers.Embedding(input_dim=gameid.max()+1, output_dim=112)(games)

userGameLayer = tf.keras.layers.Concatenate()([userLayer, gameLayer])

# Fully connected layers
# Dense layer uses relu activation with 384 neurons
flattenLayer = tf.keras.layers.Flatten()(userGameLayer)
denseLayer = tf.keras.layers.Dense(384, activation='relu')(flattenLayer)
outputLayer = tf.keras.layers.Dense(1)(denseLayer)

model = tf.keras.Model(inputs=[users, games], outputs=outputLayer)

# Compile the model
model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=0.001), loss='mean_squared_error', metrics=['mae'])

# Train the model - 7 optimum epochs
fitresult = model.fit([userid.values, gameid.values], userRatings.values, epochs=14, batch_size=128, verbose=1)

# Save the model
model.save('evaluateModel2lessbatch.keras')