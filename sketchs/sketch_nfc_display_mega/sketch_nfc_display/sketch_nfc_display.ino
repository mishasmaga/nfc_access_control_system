//display
#include <LiquidCrystal.h>

//rfid reader 125 kHz
#include <rdm6300.h>

//rfid reader 13,5 MHz
#include <Wire.h>
#include <PN532_I2C.h>
#include <PN532.h>
#include <NfcAdapter.h>

//ethernet
#include <SPI.h>
#include <Ethernet.h>

inline static void initSS() { digitalWrite(2, HIGH); };
inline static void setSS() { digitalWrite(2, LOW); };
inline static void resetSS() { digitalWrite(2, HIGH); };

//display
LiquidCrystal lcd(8, 9, 4, 5, 6, 7);

//rfid reader 125 kHz
rdm6300 reader125 = new rdm6300(10, 11)

    //rfid reader 13.5 MHz
    PN532_I2C pn532_i2c(Wire);
NfcAdapter nfc = NfcAdapter(pn532_i2c);

//ethernet
IPAddress server(192, 168, 0, 100); // numeric IP (no DNS)
//char server[] = "192.168.0.100:8000/check_tag/1";    // name address (using DNS)

// Enter a MAC address and IP address for your controller below.
// The IP address will be dependent on your local network:
byte mac[] = {
    0x00, 0xAA, 0xBB, 0xCC, 0xDE, 0x02};
IPAddress ip(192, 168, 0, 102);
IPAddress myDns(192, 168, 0, 1);

// Initialize the Ethernet client library
// with the IP address and port of the server
// that you want to connect to (port 80 is default for HTTP):
EthernetClient client;

void setup()
{
  //serial
  Serial.begin(9600);
  while (!Serial)
  {
    ; // wait for serial port to connect. Needed for native USB port only
  }
  //rfid 13.5 MHz
  nfc.begin();

  //rfid 125 kHz
  reader125.begin();

  // LCD
  lcd.begin(16, 2);
  //lcd.commandWrite(0x0F);//cursor on, display on, blink on.  (nasty!)
  lcd.clear();
  lcd.write("NFC reader");
  lcd.setCursor(0, 2);
  lcd.write("            ");

  //ethernet
  delay(2000);
  // start the Ethernet connection and the server:
  if (Ethernet.begin(mac) == 0)
  {
    Serial.println("Failed to configure Ethernet using DHCP");
    // Check for Ethernet hardware present
    while (Ethernet.hardwareStatus() == EthernetNoHardware)
    {
      Serial.println("Ethernet shield was not found.  Sorry, can't run without hardware. :(");
      Serial.println("try check conection after 1 sec...");
      delay(1000); // do nothing, no point running without Ethernet hardware
    }
    if (Ethernet.linkStatus() == LinkOFF)
    {
      Serial.println("Ethernet cable is not connected.");
    }
    // try to congifure using IP address instead of DHCP:
    Ethernet.begin(mac, ip, myDns);
  }
  else
  {
    Serial.print("  DHCP assigned IP ");
    Serial.println(Ethernet.localIP());
  }
  Serial.print("setup end");
  delay(1000);
}

void loop()
{
  lcd.clear();
  lcd.write("Read NFC tag");

  //check 13.5 MHz tag is present
  if(nfc.tagPresent()){
    NfcTag tag = nfc.read();
    String tagID = tag.getUidString();
    tagID.replace(" ", "");

    char copy[8];
    tagID.toCharArray(copy, 12);
    Serial.println(copy);
  }

  //check 125 kHZ tag is present
  if(copy==Null && reader125.tagPresent() ){
    copy = reader125.read();    
  }

  if(copy!=null)
  {
    // if you get a connection, report back via serial:
    //send request
    if (client.connect(server, 8000))
    {
      Serial.println("send req");

      // Make a HTTP request:
      client.println("GET /check_tag/" + tagID + " HTTP/1.1");
      client.println("Host: www.google.com");
      client.println("Connection: close");
      client.println();
    }
    else
    {
      // if you didn't get a connection to the server:
      Serial.println("connection failed");
      lcd.clear();
      lcd.write("con error");
    }
    //get response
    bool isConnnectionError = false;
    while (client.connected())
    {
      if (client.available() > 0)
      {
        String rS = client.readString();
        int indexS = rS.indexOf("@");
        int lIndexS = rS.lastIndexOf("@");
        String res = rS.substring(indexS + 1, lIndexS);
        char copy[20];
        res.toCharArray(copy, 20);
        Serial.write("copy");
        Serial.write(copy);
        lcd.clear();
        lcd.write(copy);
      }
      else
      {
        delay(1);
      }
    }
    if (!client.connected())
    {
      client.stop();
    }
  }

  delay(2000);
}
