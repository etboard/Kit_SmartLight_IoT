/* --------------------------------------------------------------------------------------
* FileName      : app.js
* Description   : 데이터 표시 및 차트 생성
* Author        : (주)한국공학기술연구원
* Created Date  : 2022.10
* Modifide Date :
* Reference     :
----------------------------------------------------------------------------------------- */
var brightnessData = new Array();
var distanceData = new Array();

function processSensor(payload){

  let obj;
  try {
      obj = JSON.parse(payload);
  } catch (e) {
      return undefined; // Or whatever action you want here
  }

  var today = new Date();

  $('#latestTime').text(today.toLocaleTimeString());
  $('#brightness').text(obj.brightness);
  $('#distance').text(obj.distance);

  $('#brightnessLabel').text(obj.brightness);
  $('#brightnessLabel').addClass('badge-default');

  brightnessData.push({
      "timestamp": Date().slice(16, 24),
      "value": parseInt(obj.brightness)
  });
  if (brightnessData.length >= 10) {
      brightnessData.shift()
  }

  drawChart("brightnessChart", brightnessData);

  $('#distanceLabel').text(obj.distance);
  $('#distanceLabel').addClass('badge-default');

  distanceData.push({
      "timestamp": Date().slice(16, 24),
      "value": parseInt(obj.distance)
  });
  if (distanceData.length >= 10) {
      distanceData.shift()
  }
  drawChart("distanceChart", distanceData);

}

function drawChart(sensor, data) {

    let ctx;

    if ( document.getElementById(sensor)  == null ) {
      return;
    }

    ctx = document.getElementById(sensor).getContext("2d");

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

function onCmnd(type, value) {

    var action;

    if(type == "blueLed")
    {
      action = cmnd + "D3";
    } else if (type == "greenLed") {
      action = cmnd + "D4";
    } else if (type =="manualMode") {
      action = cmnd + "operation_mode";
    } else {
      action = "error";
      return;
    }

    var message = new Paho.MQTT.Message(value);
    message.destinationName = action;
    message.qos = 0;
    mqtt.send(message);

};

$(document).ready(function () {

  $('#inputName').text(window['localStorage'].getItem('inputName'));
  $('#inputAddress').text(window['localStorage'].getItem('inputAddress'));

  $(".btn-group-blue .btn-blue-check").on("click", function(){
      onCmnd("blueLed", $("input:radio[name='btnradioBlue']:checked").val());
  });
  $(".btn-group-green .btn-green-check").on("click", function(){
      onCmnd("greenLed", $("input:radio[name='btnradioGreen']:checked").val());
  });
  $(".btn-group-manual .btn-manual-check").on("click", function(){
      onCmnd("manualMode", $("input:radio[name='btnradioManualMode']:checked").val());
  });

  });
