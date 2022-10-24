/* --------------------------------------------------------------------------------------
* FileName      : mqtt.js
* Description   : MQTT 접속 및 데이터 가져오기 / 차트 생성
* Author        : (주)한국공학기술연구원
* Created Date  : 2022.10
* Modifide Date :
* Reference     :
----------------------------------------------------------------------------------------- */

let host = window['localStorage'].getItem('url');
let port = parseInt(window['localStorage'].getItem('port'));
let macAdress = window['localStorage'].getItem('macAddress');
let id = window['localStorage'].getItem('id');
let password = window['localStorage'].getItem('pw');

let topic = macAdress + '/et/smpl/tele/#';
let cmnd = macAdress + '/et/smpl/cmnd/';
let useTLS = false;
let cleansession = true;
let reconnectTimeout = 3000;
let mqtt;

function MQTTconnect() {
    if (typeof path == "undefined") {
        path = '/';
    }

    let clientId = "wc_" + parseInt(Math.random() * 10000, 10);
    mqtt = new Paho.MQTT.Client(host, port, clientId);
    let options = {
        timeout: 3,
        useSSL: useTLS,
        cleanSession: cleansession,
        onSuccess: onConnect,
        onFailure: function (message) {
            $('#status').html("Connection failed: " + message.errorMessage + "Retrying...")
                .attr('class', 'alert alert-danger');
            setTimeout(MQTTconnect, reconnectTimeout);
        }
    };

    mqtt.onConnectionLost = onConnectionLost;
    mqtt.onMessageArrived = onMessageArrived;
    console.log("Host: " + host + ", Port: " + port + ", Path: " + path + " TLS: " + useTLS);
    mqtt.connect(options);
};

function onConnect() {
    $('#status').html('Connected to ' + host + ':' + port + path)
        .attr('class', 'alert alert-success');
    mqtt.subscribe(topic, { qos: 0 });
    $('#topic').html(topic);
};

function onConnectionLost(response) {
    console.log("connection lost");
    setTimeout(MQTTconnect, reconnectTimeout);
    $('#status').html("Connection lost. Reconnecting...")
        .attr('class', 'alert alert-warning');
};

function onMessageArrived(message) {
    let topic = message.destinationName;
    let payload = message.payloadString;
    console.log("Topic: " + topic + ", Message payload: " + payload);
    $('#message').html(topic + ', ' + payload);
    let topics = topic.split('/');
    let area = topics[4];

    if (area === 'sensor') {
      processSensor(payload);
    } else {
      console.log('Error: Data do not match the MQTT topic.');
    }
};


$(document).ready(function () {
    MQTTconnect();
});
