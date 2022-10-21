/* --------------------------------------------------------------------------------------
* FileName      : index.js
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
let useTLS = false;
//let useTLS = true;
let cleansession = true;
let reconnectTimeout = 3000;
let tempData = new Array();
let humiData = new Array();
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

function processSensor(payload){
  let obj;
  try {
      obj = JSON.parse(payload);
  } catch (e) {
      return undefined; // Or whatever action you want here
  }

  $('#Solar').text(obj.Solar);
  $('#Windturbine').text(obj.Windturbine);
  $('#Solar_Max').text(obj.Solar_Max);
  $('#Wind_Max').text(obj.Wind_Max);


  // temperature
  $('#temperatureSensor').html('(Sensor value: ' + obj.Solar + ')');
  $('#temperatureLabel').text(obj.Solar);
  $('#temperatureLabel').addClass('badge-default');

  tempData.push({
      "timestamp": Date().slice(16, 24),
      "value": parseInt(obj.Solar)
  });
  if (tempData.length >= 10) {
      tempData.shift()
  }
  drawChart("temperature", tempData);

  // humidty
  $('#humiditySensor').html('(Sensor value: ' + obj.Windturbine + ')');
  $('#humidityLabel').text(obj.Windturbine);
  $('#humidityLabel').addClass('badge-default');

  humiData.push({
      "timestamp": Date().slice(16, 24),
      "value": parseInt(obj.Windturbine)
  });
  if (humiData.length >= 10) {
      humiData.shift()
  }
  drawChart("humidity", humiData);

}

function drawChart(sensor, data) {
    let ctx;
    if (sensor === "temperature") {
        ctx = document.getElementById("tempChart").getContext("2d");
    } else if (sensor === "humidity") {
        ctx = document.getElementById("humiChart").getContext("2d");
    } else {
      return;
    };

    let values = []
    let timestamps = []

    data.map((entry) => {
        values.push(entry.value);
        timestamps.push(entry.timestamp);
    });

    let chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timestamps,
            datasets: [{
                backgroundColor: 'rgb(84, 0, 255)',
                borderColor: 'rgb(84, 0, 255)',
                data: values
            }]
        },
        options: {
            legend: {
                display: false
            }
        }
    });
}

$(document).ready(function () {
    //drawChart("temperature", tempData);
    MQTTconnect();
});
