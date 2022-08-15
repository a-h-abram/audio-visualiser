# Audio Visualiser 3D

![AudioVisualiser](audio-visualiser.png)

## Demo
[The live demo is available in my website](https://ahabram.fr/audio-visualiser/)

## Description
This is a website that propose an auditive experience.  
Based on the user music, the website adapt its animations based on the drums and rythm of your music.  
**I advise you to choose a music with good rythm (drums and bass) for more visual effect.**  
The algorithm is much more efficient with 
electro, trans, dupstep or even rap music.  
I used Web Audio API for all audio processing

## Dependencies
- Three.js - used for rendering the 3D scene
- SimplexNoise - used to animate the ground plane

## Pre-requistes
- Node.js
- Nodemon (installed globally)

## Setup

- Install dependencies
```
npm install
```

- Run the project (will run on port 8080)
```
npm start
```

## Technical Description
Before playing music:  
- Receiving the song from input
- Cloning the song to apply some filters on one & play the original song with the other one
- Applying a "LowShelf" filter to lower the intensity of the bass and keep the high frequencies in order to detect 
correctly drums
- Applying a "LowPass" filter to lower unwanted high frequencies (voices for example) and keep the bass
- Applying a gain filter (without it, the frequencies are too low to detect drums & bass)
- Playing the original song & live-analysing the filtered song

## Author
- Anas ABRAM
> Contact: anas-habib.abram@hotmail.com  

## License
MIT  
