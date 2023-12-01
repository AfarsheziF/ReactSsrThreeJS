# Earth Signal Universe Wide (ESUW)

Live version: https://orsarfat.uber.space/ESUW

ESUW Is a server side rendered react.js application wrapping a ThreeJs WebGl visualization of a transmitted radio wave in the solar system.

## How to use

Install it and run:

```sh
npm install
npm run start
```

## Open Discussions / Decisions

### Opacity Fading Parameterization
We need to decide on minimum and maximum for opacity shading, so that particles don't disappear completely. Might also be related to blur - so holding this decision for now. 

### Volumetric Shader
For now this is not a part of the proposed solution. We will be able to reach same effect using blur.

### Star System Proportionate Size
To emphasize the partcile system, we need to proportionately scale the solar system. The spectrum is between scientific percision and the emphasis on the effect of the partciles, and user experience.

### Keep the crust
Try to make the 1/4th last part of the radius of expansion of particles always at opacity 1, to make sure that the crust is always visible.
_It might be better to first try and see if the blur resolves this issue_

### Start Movement
Q: Do we want to stars to move? At what pace?
A: Yes, we would like the stars to move. Movement pace can be determined using an equation - no need for API.

### ISS Movement
We want the ISS to move. Rate can be proportionate to time (probably an equation - no need for API)

### Moons and other Solar System details
Probalby won't get to do moons for individual stars, will get to the moon of earth and saturn's rings.

### Gradual acceletion
In the beginning, the pace should be slower - to allow detailed view of the beginning of the transmission and interaction with nearby objects (ISS, Earth, Moon).

### Interaction - activation of transmission
Add a button to trigger the beginning of a transmission

### Make transmission temporal - and temporary
The transmission's length should be limited to a couple of seconds.

### Add the ISS
The source of particle emissions should be the ISS as it moves around the earth

## User Interaction

### Transmission timeline
A Slider that lets you change the point you are at within the transmission. For example, taking the slider all the way to its beginning, takes the transmission to its 0 point. The transmission's velocity accelerates the speed that the slider moves

### Collision Notification
Add a text signaling of a collision of the transmission with one of the stars

### Planet hover overlay
Add a textual representation of the planet (name + possibly mass / material) 

### Camera Movement

#### Planet focus (option)
Focus on a specific planet when its clicked

#### Planet autoplay (option)
Move towards and point camera on a planet before a collision is about to occur
