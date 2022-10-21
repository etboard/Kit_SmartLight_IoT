/* --------------------------------------------------------------------------------------
* FileName      : setting.js
* Description   : 설정값 초기화 및 저장 (스토리지값이 있으면 스토리지값 가져오기)
* Author        : (주)한국공학기술연구원
* Created Date  : 2022.10
* Modifide Date :
* Reference     :
----------------------------------------------------------------------------------------- */

$(document).ready(function() {
  init();

  $('#saveBtn').click(function(){
      save();
  });
});

function init() {

  if(window['localStorage'].getItem('url'))
  {
    $('#inputUrl').val(window['localStorage'].getItem('url'));
  } else {
    $('#inputUrl').val("broker.hivemq.com");
  }

  if(window['localStorage'].getItem('port'))
  {
    $('#inputPort').val(window['localStorage'].getItem('port'));
  } else {
    $('#inputPort').val("8000");
  }

  if(window['localStorage'].getItem('id'))
  {
    $('#inputID').val(window['localStorage'].getItem('id'));
  } else {
    $('#inputID').val("");
  }

  if(window['localStorage'].getItem('pw'))
  {
    $('#inputPassword').val(window['localStorage'].getItem('pw'));
  } else {
    $('#inputPassword').val("");
  }

  if(window['localStorage'].getItem('macAddress'))
  {
    $('#inputMacAddress').val(window['localStorage'].getItem('macAddress'));
  } else {
    $('#inputMacAddress').val("아이디를 입력하세요");
  }

}

function save() {
  if(validdationCheck())
  {
    window['localStorage'].setItem('url', $('#inputUrl').val());
    window['localStorage'].setItem('port', $('#inputPort').val());
    window['localStorage'].setItem('id', $('#inputID').val());
    window['localStorage'].setItem('pw', $('#inputPassword').val());
    window['localStorage'].setItem('macAddress', $('#inputMacAddress').val());
    alert("설정값이 올바르게 저장되었습니다");
  }
}

function validdationCheck() {
  if(validation("#inputUrl") && validation("#inputPort") && validation("#inputID") && validation("#inputPassword") && validation("#inputMacAddress"))
  {
    return true;
  }

  return false;
}
function validation(id) {
  if($(id).val() == "") {
    alert("값을 입력하세요");
    $(id).focus();
    return false;
  }

  return true;
}
