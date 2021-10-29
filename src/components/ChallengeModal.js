import React from 'react'

const ChallengeModal = ({accept, close}) => {

    return (
        <div className="modal">
            <div className="wrapper">
                <div className="dialog">
                    <div className="title">
                        <h3>Start a Self Test? &nbsp; &nbsp; <span className="material-icons float_r f22 pointer" title="Close" onClick={() => close(false)}>cancel</span></h3>
                    </div>
                    <div className="body txt_center">
                        <span className="pointer" onClick={() => accept(true)}>Start</span> &nbsp; &nbsp; <span className="pointer" onClick={() => close(false)}>Cancel</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChallengeModal