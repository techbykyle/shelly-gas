import React, { useState } from 'react'
import { shallowEqual, useSelector } from 'react-redux'
import ChallengeModal from './ChallengeModal'

const ShellyGas = ({device, http, tile, mqtt, useHttp, useMqtt, useMqttSub}) => {

    const device_state = useSelector(state => state.DeviceController.data[tile.id], shallowEqual) || {}
    const client = useMqtt()

    const [show_self_test_challenge, set_self_test_challenge] = useState(false)
    const [accept_seft_test_challenge, set_accept_self_test_challenge] = useState(false)

    let { sensor_state, alarm_state, self_test_state } = device_state[http['get_state']]?.gas_sensor || {}
    let alarm_state_style = {}
    let ppm = 0

    useMqttSub(client, mqtt['get_alarm_state'], tile.id)
    useMqttSub(client, mqtt['get_concentration'], tile.id)
    useMqttSub(client, mqtt['get_operation_state'], tile.id)
    useMqttSub(client, mqtt['get_self_test_state'], tile.id)

    useHttp(device.id, tile.id, http['get_state'])

    const handleClickMute = () => {
        client.publish(mqtt['mute_alarm'], 'mute_alarm')
    }

    const handleClickUnMute = () => {
        client.publish(mqtt['unmute_alarm'], 'unmute_alarm')
    }

    const handleClickStartSelfTest = () => {
        set_self_test_challenge(true)
    }    

    if(device_state[mqtt['get_concentration']]) {
        ppm = device_state[mqtt['get_concentration']]
    }

    if(device_state[mqtt['get_alarm_state']]) {
        alarm_state = device_state[mqtt['get_alarm_state']]
    }

    if(device_state[mqtt['get_operation_state']]) {
        sensor_state = device_state[mqtt['get_operation_state']]
    }

    if(device_state[mqtt['get_self_test_state']]) {
        self_test_state = device_state[mqtt['get_self_test_state']]
    }

    if(alarm_state === 'mild' || sensor_state === 'unknown') {
        alarm_state_style.color = 'orange'
    }

    if(alarm_state === 'heavy' || sensor_state === 'fault') {
        alarm_state_style.color = 'red'
    }

    if(accept_seft_test_challenge) {
        client.publish(mqtt['start_self_test'], 'start_self_test')
        set_accept_self_test_challenge(false)
        set_self_test_challenge(false)
    }

    const show_st_challenge = () => {
        if(show_self_test_challenge) {
            return <ChallengeModal close={set_self_test_challenge} accept={set_accept_self_test_challenge} />
        }
    }

    const show_non_normal_state = () => {

        const show_spinner = (status, status_type) => {
            return (
                <div className="txt_center">
                    <div className="button_loader button_loader_l"></div>
                    <p>{status_type}: <span className="alarm_state_style">{status}</span></p>
                </div>
            )
        }

        if(self_test_state && (self_test_state === 'running' || self_test_state === 'pending')) {
            return show_spinner('Self Test', self_test_state)
        }
        
        if(sensor_state && sensor_state !== 'normal') {
            return show_spinner('Sensor State', sensor_state)
        }
    }

    const show_concentration = () => {
        if(sensor_state && sensor_state === 'normal') return (
            <div>
                <span className="faccented">{ppm}</span>ppm
            </div>
        )
    }
    
    const show_state_icon = () => {
        if(sensor_state && sensor_state === 'normal') return (
            <div className="tile-icon">
                <span 
                    title={`Alarm: ${alarm_state}`}
                    style={alarm_state_style} 
                    className="material-icons f75"
                >blur_on</span>
            </div>
        )
    }

    const show_actions = () => {
        return (
            <div className="tile-actions">
                <span title="Mute Alarm Speaker of this Device" style={alarm_state_style} className='material-icons pointer' onClick={() => handleClickMute()}>volume_off</span> &nbsp;
                <span title="Start a Self Test of this Device" style={alarm_state_style} className='material-icons pointer' onClick={() => handleClickStartSelfTest()}>build_circle</span> &nbsp;
                <span title="Un-Mute Alarm Speaker of this Device" style={alarm_state_style} className='material-icons pointer' onClick={() => handleClickUnMute()}>volume_up</span>
            </div>
        )
    }

    return (
        <>
            {show_st_challenge()}
            <div className="txt_center">
                {show_non_normal_state()}
                {show_state_icon()}
                {show_concentration()}
                {show_actions()}
            </div>
        </>
    )
}

export default ShellyGas