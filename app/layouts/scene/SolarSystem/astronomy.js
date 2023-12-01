import { HelioVector, Body } from 'astronomy-engine';

const astronomyEngineController = {

    planetsVectors: {},

    calculatePlanetsVectors(date) {
        // const that = this;
        if (!date) date = new Date();
        this.planetsVectors = {};

        let a = [
            Body.Sun,
            Body.Mercury,
            Body.Venus,
            Body.Earth,
            Body.Moon,
            Body.Mars,
            Body.Jupiter,
            Body.Saturn,
            Body.Uranus,
            Body.Neptune,
            Body.Pluto,
        ]

        for (let i in a) {
            this.planetsVectors[a[i].toLowerCase()] = HelioVector(a[i], date);
        }
        console.log(this.planetsVectors);
    }

}

export default astronomyEngineController;