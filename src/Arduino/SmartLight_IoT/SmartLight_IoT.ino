/******************************************************************************************
 * FileName     : SmartLight_IoT.ino
 * Description  : 이티보드 스마트 가로등 코딩 키트(IoT)
 * Author       : SCS
 * Created Date : 2022.08.06
 * Reference    : 
 * Modified     : 2022.08.10 : SCS
 * Modified     : 2022.12.28 : YSY : 변수 명명법 통일
 * Modified     : 2024.09.02 : PEJ : 프로그램 구조 변경
******************************************************************************************/
const char* board_firmware_verion = "smartLgt_0.92";


//==========================================================================================
// IoT 프로그램 사용하기
//==========================================================================================
#include "ET_IoT_App.h"
ET_IoT_App app;


//==========================================================================================
// 전역 변수 선언
//==========================================================================================
const int cds_pin  = A3;                                 // 조도 센서 핀: A3

const int echo_pin = D8;                                 // 초음파 수신 핀: D8
const int trig_pin = D9;                                 // 초음파 송신 핀: D9

const int blue_led = D3;                                 // 가로등 파랑 LED 핀: D3
const int green_led  = D4;                               // 가로등 초록 LED 핀: D4

int operation_mode_led = D2;                             // 작동 모드 LED 핀: D2

const int cds_threshold = 800;                           // 밝기 임계치
const int distance_threshold = 10;                       // 거리 임계치

int cds_value;                                           // 밝기
float distance;                                          // 거리

int blue_led_state = 0;                                  // 파랑 LED 상태: 꺼짐
int green_led_state = 0;                                 // 초록 LED 상태: 꺼짐


//==========================================================================================
void et_setup()                                          // 사용자 맞춤형 설정
//==========================================================================================
{
  pinMode(trig_pin, OUTPUT);                             // 초음파 송신부: 출력 모드
  pinMode(echo_pin, INPUT);                              // 초음파 수신부: 입력 모드

  app.operation_mode = "automatic";                      // 작동 모드: 자동
  app.send_data("blue_led", "state", LOW);               // 파랑 LED 작동 상태 응답
  app.send_data("green_led", "state", LOW);              // 초록 LED 작동 상태 응답
  app.send_data("operation_mode", "mode", app.operation_mode);   // 작동 모드
}


//==========================================================================================
void et_loop()                                           // 사용자 반복 처리
//==========================================================================================
{
  do_sensing_process();                                  // 센싱 처리

  do_automatic_process();                                // 자동화 처리
}


//==========================================================================================
void do_sensing_process()                                // 센싱 처리
//==========================================================================================
{
  cds_value = analogRead(cds_pin);                       // 조도 센서 값 읽기

  // 초음파 송신
  digitalWrite(trig_pin, LOW);
  digitalWrite(echo_pin, LOW);
  delayMicroseconds(2);
  digitalWrite(trig_pin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig_pin, LOW);

  unsigned long duration  = pulseIn(echo_pin, HIGH);     // 초음파 수신까지의 시간 계산
  distance = duration * 17 / 1000;                        // 거리 계산

  delay(100);
}


//==========================================================================================
void do_automatic_process()                              // 자동화 처리
//==========================================================================================
{
  if(app.operation_mode != "automatic")                  // 작동 모드가 automatic 일 경우만
    return;

  if(distance < distance_threshold) {                    // 거리가 기준 값보다 작다면
    digitalWrite(blue_led, HIGH);                        // 파랑 LED 켜기
    blue_led_state = 1;                                  // 파랑 LED 상태 저장
  } else {
    digitalWrite(blue_led, LOW);                         // 파랑 LED 끄기
    blue_led_state = 0;                                  // 파랑 LED 상태 저장
  }

  if(cds_value < cds_threshold) {                        // 조도 값이 기준 값보다 작다면
    digitalWrite(green_led, HIGH);                       // 초록 LED 켜기
    green_led_state = 1;                                 // 초록 LED 상태 저장
  } else {
    digitalWrite(green_led, LOW);                        // 초록 LED 끄기
    green_led_state = 0;                                 // 초록 LED 상태 저장
  }
}


//==========================================================================================
void et_short_periodic_process()                         // 사용자 주기적 처리 (예 : 1초마다)
//==========================================================================================
{   
  // 짧은 시간마다 처리할 작업을 여기에 작성하세요.
}


//==========================================================================================
void et_long_periodic_process()                          // 사용자 주기적 처리 (예 : 5초마다)
//==========================================================================================
{
  send_message();                                        // 메시지 송신
}


//==========================================================================================
void send_message()                                      // 메시지 송신
//==========================================================================================
{
  app.add_sensor_data("cds", cds_value);                 // 센서 데이터 추가
  app.add_sensor_data("distance", distance);             // 센서 데이터 추가
  app.send_sensor_data();                                // 센서 데이터 송신

  app.send_data("blue_led", "state", blue_led_state);    // 파랑 LED 상태 응답
  app.send_data("green_led", "state", green_led_state);  // 초록 LED 상태 응답
}


//==========================================================================================
void recv_message()                                      // 메시지 수신
//==========================================================================================
{
  // "operation_mode" 메시지를 받으면 process_operation_mode() 실행
  app.setup_recv_message("operation_mode", process_operation_mode);

  // "blue_led" 메시지를 받으면 process_blue_led_control() 실행
  app.setup_recv_message("blue_led", process_blue_led_control);

  // "green_led" 메시지를 받으면 process_green_led_control() 실행
  app.setup_recv_message("green_led", process_green_led_control);
}


//==========================================================================================
void process_operation_mode(const String &msg)           // 작동 모드 처리
//==========================================================================================
{
  pinMode(operation_mode_led, OUTPUT);                   // 작동 모드 LED: 출력 모드

  if (msg == "automatic") {                              // 작동 모드: 자동
    app.operation_mode = "automatic";
    digitalWrite(operation_mode_led, HIGH);
    Serial.println("작동모드: automatic, 빨강 LED on");
  } else {                                               // 작동 모드: 수동
    app.operation_mode = "manual";
    digitalWrite(operation_mode_led, LOW);
    Serial.println("작동모드: manual, 빨강 LED off");
  }
}


//==========================================================================================
void process_blue_led_control(const String &msg)         // 파랑 LED 제어 처리
//==========================================================================================
{
  // 자동 모드인 경우에는 파랑 LED를 원격에서 제어를 할 수 없음
  if (app.operation_mode == "automatic")
    return;

  // 수동 모드인 경우이면서
  if (msg == "1") {                                      // 1이면
    digitalWrite(blue_led, HIGH);                        // 파랑 LED: 켜짐
    blue_led_state = 1;
    Serial.println("파랑 LED: 켜짐");
  } else {                                               // 그렇지 않으면
    digitalWrite(blue_led, LOW);                         // 파랑 LED: 꺼짐
    blue_led_state = 0;
    Serial.println("파랑 LED: 꺼짐");
  }

  app.send_data("blue_led", "state", blue_led_state);    // 파랑 LED 상태 응답
}


//==========================================================================================
void process_green_led_control(const String &msg)        // 초록 LED 제어 처리
//==========================================================================================
{
  // 자동 모드인 경우에는 초록 LED를 원격에서 제어를 할 수 없음
  if (app.operation_mode == "automatic") 
    return;

  // 수동 모드인 경우이면서
  if (msg == "1") {                                      // 1이면
    digitalWrite(green_led, HIGH);                       // 초록 LED: 켜짐
    green_led_state = 1;
    Serial.println("초록 LED: 켜짐");
  } else {                                               // 그렇지 않으면
    digitalWrite(green_led, LOW);                        // 초록 LED: 꺼짐
    green_led_state = 0;
    Serial.println("초록 LED: 꺼짐");
  }

  app.send_data("green_led", "state", green_led_state);  // 초록 LED 상태 응답
}


//==========================================================================================
//
// (주)한국공학기술연구원 http://et.ketri.re.kr
//
//==========================================================================================