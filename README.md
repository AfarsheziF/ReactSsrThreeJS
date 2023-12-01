# Earth Signal Universe Wide (ESUW)

Live version: https://orsarfat.uber.space/ESUW

ESUW Is a server side rendered react.js application wrapping a ThreeJs WebGl visualization of a transmitted radio wave in the solar system.

## How to use

Install it and run:

```sh
npm install
npm run start
```

## React loader
- load all materials and lunch scene

## Open Discussions / Decisions

## User Interaction

### Transmission timeline
[ ] Slider
  - Add a possibility to go back in time - reset shader and go until the marked point // a bit buggy.
  - Set maximum - radius of the star that is the furthest away

### Collision Notification
[ V ] Add a text signaling of a collision of the transmission with one of the stars
- sort titles by distance from transmission

### Planet hover overlay
[ V ] Add a textual representation of the planet (name + possibly mass / material)

### Camera Movement

#### Planet focus (option)
[ V ] Focus on a specific planet when its clicked
- add iss

#### Materials
[ ] Reduce textures size

#### 2D Elements

[] Start BTN
[] Planets UI
[] Timeline Slider
[] Settings dialog
[] Info dialog

#### Mobile

Diable camera drag

## Last Updates

- Radius is now calculated with scale to feed more accurate radius to the shader. Scale gui will not affect anymore.

####

#### Last stretch
#### 
[ ] Camera movement - move towards and point camera on a planet before a collision is about to occur + rotation

[v] ISS Model should rotate the earth // working without rotation
[v] Autoplay (pending Hannes)
[ ] UI Changes (pending Hannes)
[ ] iframe enablement (pending Hannes)



