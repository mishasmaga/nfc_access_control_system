/*
rdm6300.h - бібліотека для роботи з радіочастотними мітками на частоті 125 кГц,
з допомогою модуля RDM 6300 (https://arduino.ua/prod259-rfid-modyl-rdm6300-125kgc)

Бібліотека дає можливість перевірити чи присутня радіочастотна мітка, 
та зчитати її ідентифікатор.
*/

#include "Arduino.h"
#include "rdm6300.h"
#include "SoftwareSerial.h"

// метод, що робить необхідну ініціалізацю перед початком роботи 
void rdm6300::begin(){
    _rx_counter = 0; // init counter
    softSerial.begin(9600);
}

// метод дозволяє перевірити чи присутня радіочастотна мітка
boolean rdm6300::tagPresent(){
    return softSerial.available() > 0;
} 

// метод дозволяє зчитати ідентифікатор з радіочастотної мітки
byte rdm6300::read() {
    byte result[10];
    _rx_data[_rx_counter] = softSerial.read();
    if (_rx_counter == 0 && _rx_data[0] != STX) {
      return result;
    } else {
      _rx_counter++;
    }
    if (_rx_counter >= 14) {
      _rx_counter = 0; // скидаємо рахівник
      if (_rx_data[0] == STX && _rx_data[13] == ETX) { // пакет починається з STX і закінчується з ETX
        byte calc_checksum = 0;
        for (int i = 0; i < 6; i++) { // розраховуємо  контрольну суму
          calc_checksum ^= ascii_char_to_num(_rx_data[i*2+1]) * 16 + ascii_char_to_num(_rx_data[i*2+2]);
        }
        //формуємо результат
        if (calc_checksum == 0) {
          for (int i = 1; i <= 10; i++) {
              result[i]=_rx_data[i];
          }
        }
      } 
    }
    return  result;
}

// опис конструктору класу rdm6300
// рекомендовані значення 10,11
rdm6300::rdm6300(byte pin1, byte pin2) {
    SoftwareSerial softSerial(pin1, pin2);
}

// пертворення символу в 16-вій системі числення у байт з допомогою ASCII таблиці (https://ru.wikipedia.org/wiki/ASCII)
byte rdm6300::ascii_char_to_num(byte a) {
  a -= '0'; // 0..9
  if (a > 9) a -= 7; // A..F
  return a;
} 