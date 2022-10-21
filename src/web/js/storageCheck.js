/* --------------------------------------------------------------------------------------
* FileName      : storageCheck.js
* Description   : 웹브라우저 HTML LocalStorage 지원 여부 체크
* Author        : (주)한국공학기술연구원
* Created Date  : 2022.10
* Modifide Date :
* Reference     :
----------------------------------------------------------------------------------------- */

$(document).ready(function() {

  if (!storageAvailable('localStorage')) {
    alert("지원되지 않는 브라우저입니다. 다른 브라우저(Chrome, Edge, Safari)를 이용하세요");
  }

});

function storageAvailable(type) {
    var storage;
    try {
        storage = window[type];
        var x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // Firefox를 제외한 모든 브라우저
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // 코드가 존재하지 않을 수도 있기 떄문에 이름 필드도 확인합니다.
            // Firefox를 제외한 모든 브라우저
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // 이미 저장된 것이있는 경우에만 QuotaExceededError를 확인하십시오.
            (storage && storage.length !== 0);
    }
}
