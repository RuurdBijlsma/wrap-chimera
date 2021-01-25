/**
 * @module WrapChimera
 */

const VlcDeinterlace = require('./VlcDeinterlace')

/**
 * VLC Video
 */
class VlcVideo {
    constructor(video) {
        this._video = video;
        /**
         * Deinterlace control object
         * @type {VlcDeinterlace}
         */
        this.deinterlace = new VlcDeinterlace(this._video.deinterlace);
    }

    /**
     * List video track names
     * @returns {string[]}
     */
    get tracks() {
        let tracks = [];
        for (let i = 0; i < this._video.count; i++)
            tracks.push(this._video[i] === undefined ? i === 0 ? 'Disabled' : `Track ${i}` : this._video[i])
        return tracks;
    }

    /**
     * Track index
     * @returns {int}
     */
    get track() {
        return this._video.track;
    }

    /**
     * Track index
     * @param {int} index
     */
    set track(index) {
        this._video.track = index;
    }

    /**
     * Value range: [0-2]
     * @returns {number}
     */
    get contrast() {
        return this._video.contrast;
    }

    /**
     * Value range: [0-2]
     * @param {number} contrast
     */
    set contrast(contrast) {
        this._video.contrast = contrast;
    }

    /**
     * Value range: [0-2]
     * @returns {number}
     */
    get brightness() {
        return this._video.brightness;
    }

    /**
     * Value range: [0-2]
     * @param {number} brightness
     */
    set brightness(brightness) {
        this._video.brightness = brightness;
    }

    /**
     * Value range: [0-360]
     * @returns {number}
     */
    get hue() {
        return this._video.hue;
    }

    /**
     * Value range: [0-360]
     * @param {number} hue
     */
    set hue(hue) {
        this._video.hue = hue;
    }

    /**
     * Value range: [0-3]
     * @returns {number}
     */
    get saturation() {
        return this._video.saturation;
    }

    /**
     * Value range: [0-3]
     * @param {number} saturation
     */
    set saturation(saturation) {
        this._video.saturation = saturation;
    }

    /**
     * Value range: [0.01-10]
     * @returns {number}
     */
    get gamma() {
        return this._video.gamma;
    }

    /**
     * Value range: [0.01-10]
     * @param {number} gamma
     */
    set gamma(gamma) {
        this._video.gamma = gamma;
    }
}

module.exports = VlcVideo;