/**
 * @module WrapChimera
 */

const {DeinterlaceMode} = require('./VlcEnums')

/**
 * Deinterlace control
 */
class VlcDeinterlace {
    constructor(deinterlace) {
        this._deinterlace = deinterlace;
    }

    /**
     *  Enable deinterlacing with 'mode'. Enabling too soon deinterlacing may cause some problems. You have to wait that all variable are available before enabling it.
     * @param {('blend'| 'bob'| 'discard'| 'linear'| 'mean'| 'x'| 'yadif'| 'yadif2x')} mode
     * @returns {void}
     */
    enable(mode) {
        if (!DeinterlaceMode.includes(mode))
            throw new Error("Deinterlace mode should be one of " + DeinterlaceMode.toString())
        this._deinterlace.enable(mode);
    }

    /**
     * Disable interlacing
     * @returns {void}
     */
    disable() {
        this._deinterlace.disable();
    }
}

module.exports = VlcDeinterlace;