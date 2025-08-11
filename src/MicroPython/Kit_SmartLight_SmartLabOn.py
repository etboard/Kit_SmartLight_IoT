# ******************************************************************************************
# FileName     : Kit_SmartLight_SmartLabOn.py
# Description  : 이티보드 스마트 가로등 코딩 키트(IoT)
# Author       : 손철수
# Created Date : 2024.09.02 : PEJ 
# Reference    :
# ******************************************************************************************
board_firmware_verion = "smartLgt_0.92";


#===========================================================================================
# 기본 모듈 사용하기
#===========================================================================================
import time
from machine import Pin, ADC, time_pulse_us
from ETboard.lib.pin_define import *                     # ETboard 핀 관련 모듈


#===========================================================================================
# IoT 프로그램 사용하기
#===========================================================================================
from ET_IoT_App import ET_IoT_App, setup, loop
app = ET_IoT_App()


#===========================================================================================
# 전역 변수 선언
#===========================================================================================
cds_pin = ADC(Pin(A3))                                   # 조도 센서 핀: A3

echo_pin = Pin(D8)                                       # 초음파 수신부: D8
trig_pin = Pin(D9)                                       # 초음파 송신부: D9

blue_led = Pin(D2)                                       # 파랑 LED: D2
green_led = Pin(D3)                                      # 초록 LED: D3

blue_led_state = 0                                       # 파랑 LED 상태: 꺼짐
green_led_state = 0                                      # 초록 LED 상태: 꺼짐

operation_mode_led = Pin(D2)                             # 작동 모드 LED: 빨강

cds_threshold = 800                                      # 밝기 임계치: 800
distance_threshold = 10                                  # 거리 임계치: 10

cds_value = 0                                            # 밝기
distance = 0                                             # 거리


#===========================================================================================
def et_setup():                                          #  사용자 맞춤형 설정
#===========================================================================================
    cds_pin.atten(ADC.ATTN_11DB)                         # 조도 센서 입력 모드 설정

    echo_pin.init(Pin.IN)                                # 초음파 수신부: 입력 모드
    trig_pin.init(Pin.OUT)                               # 초음파 송신부: 출력 모드

    blue_led.init(Pin.OUT)                               # 파랑 LED: 출력 모드
    green_led.init(Pin.OUT)                              # 초록 LED: 출력 모드

    app.operation_mode = "automatic";                    # 작동 모드: 자동
    app.send_data("blue_led", "state", blue_led_state);  # 파랑 LED 작동 상태 응답
    app.send_data("green_led", "state", green_led_state);# 초록 LED 작동 상태 응답
    app.send_data("operation_mode", "mode", app.operation_mode);   # 작동 모드    

    recv_message()                                       # 메시지 수신


#===========================================================================================
def et_loop():                                           # 사용자 반복 처리
#===========================================================================================
    do_sensing_proces()                                  # 센싱 처리
    do_automatic_process()                               # 자동화 처리


#===========================================================================================
def do_sensing_proces():                                 # 센싱 처리
#===========================================================================================
    global cds_value, distance
    cds_value = cds_pin.read()                           # 조도 센서 값 저장

    # 초음파 송신
    trig_pin.value(LOW)
    echo_pin.value(LOW)
    time.sleep_ms(2)
    trig_pin.value(HIGH)
    time.sleep_ms(10)
    trig_pin.value(LOW)

    duration = time_pulse_us(echo_pin, HIGH)             # 초음파 수신까지의 시간 계산
    distance = 17 * duration / 1000                      # 거리 계산


#===========================================================================================
def do_automatic_process():                              # 자동화 처리
#===========================================================================================
    if (app.operation_mode != 'automatic'):              # 작동 모드가 automatic 일 경우만
        return

    global cds_value, cds_threshold, green_led_state
    if(cds_value < cds_threshold):                       # 밝기가 기준 값보다 작다면
        green_led.value(HIGH)                            # 초록 LED 켜기
        green_led_state = 1                              # 초록 LED 상태: 켜짐
    else:
        green_led.value(LOW)                             # 초록 LED 끄기
        green_led_state = 0                              # 초록 LED 상태: 꺼짐

    global distance, distance_threshold, blue_led_state
    if(distance < distance_threshold):                   # 거리가 기준 값보다 작다면
        blue_led.value(HIGH)                             # 파랑 LED 켜기
        blue_led_state = 1                               # 파랑 LED 상태: 켜짐
    else:
        blue_led.value(LOW)                              # 파랑 LED 끄기
        blue_led_state = 0                               # 파랑 LED 상태: 꺼짐


#===========================================================================================
def et_short_periodic_process():                         # 사용자 주기적 처리 (예 : 1초마다)
#===========================================================================================
    #  짧은 시간마다 처리할 작업을 여기에 작성하세요.
    pass


#===========================================================================================
def et_long_periodic_process():                          # 사용자 주기적 처리 (예 : 5초마다)
#===========================================================================================
    send_message()                                       # 메시지 송신


#===========================================================================================
def send_message():                                      # 메시지 송신
#===========================================================================================
    global cds_value, distance
    app.add_sensor_data("cds", cds_value);               # 센서 데이터 추가
    app.add_sensor_data("distance", distance);           # 센서 데이터 추가
    app.send_sensor_data();                              # 센서 데이터 송신


#===========================================================================================
def recv_message():                                      # 메시지 수신
#===========================================================================================
    # "get_sensor_type" 메시지를 받으면 send_sensor_type() 실행
    app.setup_recv_message('get_sensor_type', handle_get_sensor_type_request)

#===========================================================================================
def json_to_unicode_escaped(data):                       # 직렬화, 이스케이프
#===========================================================================================
    # JSON 직렬화
    json_string = ujson.dumps(data)

    # JSON 문자열에서 비-ASCII 문자를 Unicode 이스케이프 형식으로 변환
    return ''.join(f'\\u{ord(c):04x}' if ord(c) > 127 else c for c in json_string)


#===========================================================================================
def handle_get_sensor_type_request(topic, msg):          # 센서 타입 송신 처리
#===========================================================================================
    send_sensor_type()


#===========================================================================================
def send_sensor_type():                                  # 센서 타입 전송
#===========================================================================================
    sensor_type = {
        "sensorId": "cds",
        "sensorType": "cds",
        "sensorNicNm": "조도",
        "channelCode": "01",
        "collectUnit": "",
    }
    payload = json_to_unicode_escaped(sensor_type)
    app.send_data("sensor_types", "cds", payload)

    sensor_type = {
        "sensorId": "distance",
        "sensorType": "distance",
        "sensorNicNm": "거리",
        "channelCode": "01",
        "collectUnit": "cm",
    }
    payload = json_to_unicode_escaped(sensor_type)
    app.send_data("sensor_types", "distance", payload)


#===========================================================================================
# 시작 지점                     
#===========================================================================================
if __name__ == "__main__":
    setup(app, et_setup)
    while True:
        loop(app, et_loop, et_short_periodic_process, et_long_periodic_process)


#===========================================================================================
#                                                    
# (주)한국공학기술연구원 http://et.ketri.re.kr       
#
#===========================================================================================