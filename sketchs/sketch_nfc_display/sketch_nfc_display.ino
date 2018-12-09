//display
#include <LiquidCrystal.h>
//nfc reader
#include <Wire.h>
#include <PN532_I2C.h>
#include <PN532.h>
#include <NfcAdapter.h>

//ethernet
#include <SPI.h>
#include <Ethernet.h>


  inline static void initSS()    { digitalWrite(2, HIGH); };
  inline static void setSS()     { digitalWrite(2, LOW); };
  inline static void resetSS()   { digitalWrite(2, HIGH); };

//display
LiquidCrystal  lcd (8,9,4,5,6,7);

//nfc reader
PN532_I2C pn532_i2c(Wire);
NfcAdapter nfc = NfcAdapter(pn532_i2c);

//ethernet
IPAddress server(192,168,0,103);  // numeric IP (no DNS)
//char server[] = "192.168.0.103:8000/check_tag/1";    // name address (using DNS)

// Enter a MAC address and IP address for your controller below.
// The IP address will be dependent on your local network:
byte mac[] = {
  0x00, 0xAA, 0xBB, 0xCC, 0xDE, 0x02
};
IPAddress ip(192, 168, 0, 102);
IPAddress myDns(192, 168, 0, 1);

// Initialize the Ethernet client library
// with the IP address and port of the server
// that you want to connect to (port 80 is default for HTTP):
EthernetClient client;


void setup() {
  //serial
   Serial.begin(9600);
       while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }
  //nfc
  nfc.begin();
  
  // LCD
  lcd.begin(16, 2);
  //optionally, now set up our application-specific display settings, overriding whatever the lcd did in lcd.init()
  //lcd.commandWrite(0x0F);//cursor on, display on, blink on.  (nasty!)
  lcd.clear();
  lcd.write("NFC reader");
  lcd.setCursor(0,2);
  lcd.write("            ");

  //ethernet
  delay(2000);
  // start the Ethernet connection and the server:
  if (Ethernet.begin(mac) == 0) {
    Serial.println("Failed to configure Ethernet using DHCP");
    // Check for Ethernet hardware present
    while (Ethernet.hardwareStatus() == EthernetNoHardware) {
      Serial.println("Ethernet shield was not found.  Sorry, can't run without hardware. :(");
      Serial.println("try check conection after 1 sec...");
      delay(1000); // do nothing, no point running without Ethernet hardware      
    }
    if (Ethernet.linkStatus() == LinkOFF) {
      Serial.println("Ethernet cable is not connected.");
    }
    // try to congifure using IP address instead of DHCP:
    Ethernet.begin(mac, ip, myDns);
  } else {
    Serial.print("  DHCP assigned IP ");
    Serial.println(Ethernet.localIP());
  }
  Serial.print("setup end");

   delay(1000);
  /*
  // give the Ethernet shield a second to initialize:
  delay(1000);
  Serial.print("connecting to ");
  Serial.print(server);
  Serial.println("...");

  // if you get a connection, report back via serial:
  if (client.connect(server,8000)) {
    Serial.print("connected to ");
    Serial.println(client.remoteIP());
    // Make a HTTP request:
    client.println("GET /check_tag/1 HTTP/1.1");
    client.println("Host: www.google.com");
    client.println("Connection: close");
    client.println();
  } else {
    // if you didn't get a connection to the server:
    Serial.println("connection failed");
  }*/
}

void loop() {
  Serial.println("try read tag");
  lcd.clear();
  lcd.write("Read NFC tag");  
  
  if (nfc.tagPresent())
  {
     NfcTag tag = nfc.read();
     String tagID= tag.getUidString();
     tagID.replace(" ","");
     Serial.write("tag id: ");

         char copy[8];
        tagID.toCharArray(copy,12);
     Serial.println(copy);

      // if you get a connection, report back via serial:
      //send request
  if (client.connect(server,8000)) {
    Serial.println("send req");

    // Make a HTTP request:
    client.println("GET /check_tag/"+ tagID +" HTTP/1.1");
    client.println("Host: www.google.com");
    client.println("Connection: close");
    client.println();
  } else {
    // if you didn't get a connection to the server:
    Serial.println("connection failed");
      lcd.clear();
      lcd.write("con error");     
  }
  //get response
  bool isConnnectionError = false;
  while(client.connected()){
    if (client.available() > 0) {
      String rS = client.readString();
      int indexS = rS.indexOf("@");
      int lIndexS = rS.lastIndexOf("@");
      String res = rS.substring(indexS+1, lIndexS);
      char copy[20];
      res.toCharArray(copy,20);
      Serial.write("copy");
      Serial.write(copy);    
      lcd.clear();
      lcd.write(copy);  
      }
      else{
        delay(1);
      }
      /*else{
      lcd.clear();
      lcd.write("con error");  
      }*/     
  }
  if(!client.connected()){
     client.stop();
  }
  }
  

          /*lcd.setCursor(0,2);  //line=2, x=0*/
        //print to display
     /*  char copy[8];
        s.toCharArray(copy,12);
        lcd.write(copy);        
*/
 delay(2000);
}
