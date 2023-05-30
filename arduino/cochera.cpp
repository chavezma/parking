#include <ArduinoJson.h>
#include <ArduinoJson.hpp>
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266HTTPClient.h>
#include <TelnetSpy.h>
#include <WifiUDP.h>
#include <NTPClient.h>
#include <Time.h>
#include <TimeLib.h>
#include <Timezone.h>


int TRIG = D5;		
int ECO = 4;		
int ROJO = D6;
int VERDE = D7;
int AZUL = SCL;  
int DURACION;
int DISTANCIA;
int status_wifi = SS;
int status_server = SCK;
bool ocup = 0;
bool lib = 0;
bool res = 0;

TelnetSpy SerialAndTelnet;

#define SER  SerialAndTelnet

// Definir propiedades NTP
#define NTP_OFFSET   60 * 180                                                                                               // En segundos
#define NTP_INTERVAL 60 * 1000                                                                                             // En milisegundos
#define NTP_ADDRESS  "pool.ntp.org"     

WiFiUDP ntpUDP;                                                                                                            // Configura el cliente NTP UDP 
NTPClient timeClient(ntpUDP, NTP_ADDRESS, NTP_OFFSET, NTP_INTERVAL);
TimeChangeRule usMST = {"MST", First, Sun, Nov, 2, -360};
Timezone usAZ(usMST, usMST);
time_t local, utc;

const char * days[] = {"Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"} ;                        // Configurar Fecha y hora
const char * months[] = {"Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"} ; 

const char *host_cochera = "http://parkingpruebas.ddns.net:8000/api/park/";

String str_host_cochera = "http://parkingpruebas.ddns.net:8000/api/park/";

const char *host_sensor = "http://parkingpruebas.ddns.net:8000/api/sensor?ip=192.168.1.103";

String str_host_sensor = "http://parkingpruebas.ddns.net:8000/api/sensor?ip=192.168.1.103";

String str_url_put;

String str_url_sensor;

String ping_url;

//-------------------------------------CONECXION INTERNET-------------------------------------------------
const char* ssid="Invitados";
const char* password = "einstein65";
int status = WL_IDLE_STATUS; 

IPAddress ip(192,168,1,103);
IPAddress gateway(192,168,1,1);   
IPAddress subnet(255,255,255,0);
IPAddress dns1(186,130,128,250);
//--------------------------------------------------------------------------------------------------------
void setup () {
//-------------------------------------CONECXION INTERNET-------------------------------------------------
  WiFiClient client;
  HTTPClient http;    

  //-------------------------------------SENSOR ULTRASONICO-------------------------------------------------

  pinMode(TRIG, OUTPUT); 	// trigger como salida
  pinMode(ECO, INPUT);		// echo como entrada
  pinMode(ROJO, OUTPUT);
  pinMode(VERDE, OUTPUT);
  pinMode(AZUL, OUTPUT);
  pinMode(status_wifi, OUTPUT);
  pinMode(status_server, OUTPUT); 
//--------------------------------------------------------------------------------------------------------

  SER.begin(115200);  
  SER.println("\nWiFi station setting");  
  WiFi.mode (WIFI_STA);
  WiFi.config(ip, gateway, subnet,dns1);
  status = WiFi.begin (ssid,password);
  SER.print("connecting");  
  SER.print("MY MAC Address is:   ");
  SER.println(WiFi.macAddress());
  SER.printf("\nEstado de la conexion: %d\n", WiFi.status());  
  SER.println("\nWiFi ready");
  SER.print("my ip adress: ");
  SER.println(WiFi.localIP());   
  SER.println("");
  

  http.begin(client,host_sensor);  
  http.GET();  
  int httpCode = http.GET();
  String payload = http.getString();
  http.end();   
  
  StaticJsonDocument<256> resp;
  DeserializationError err = deserializeJson(resp, payload);  
  
  if (err){
    Serial.print("ERROR; ");
    Serial.println(err.c_str());
  
  return;  
  }    

  long json_cochera = resp["cochera"];
  bool json_reservado = resp["reservado"];
  SER.println("EL NUMERO DE JSON COCHERA ES..."); 
  SER.println(json_cochera);   
  str_url_put = str_host_cochera + json_cochera;     

}

void loop() {
  SerialAndTelnet.handle(); 
  
  WiFiClient client;
  HTTPClient http;
  String getData, link;
  link = str_url_put;  
  String str_url_sensor;
  str_url_sensor = str_host_sensor;

  if(WiFi.status() == 3){
    timeClient.update();                                                                                                // Actualizar el cliente NTP y obtener la marca de tiempo UNIX UTC
    unsigned long utc =  timeClient.getEpochTime();
    local = usAZ.toLocal(utc);   
    printTime(local); 
    SER.println("");
    delay(2000);  

    SER.println("WIFI OK");
    digitalWrite(status_wifi, HIGH);
    http.begin(client,link);
    int httpCode = http.GET();

    if (httpCode > 0){
      String payload = http.getString();
      SER.println(httpCode);
      SER.println("REQUEST OK...");
      digitalWrite(status_server, HIGH);  
    } else {
      SER.println("ERROR EN REQUEST");
      digitalWrite(status_server, LOW); 
      delay(5000);
    }

  } else { 
    SER.println("No hay WIFI ");
    digitalWrite(status_wifi, LOW);
  }

//-------------------------------------SENSOR ULTRASONICO-------------------------------------------------

  digitalWrite(TRIG, HIGH); 		// generacion del pulso a enviar
  delay(1);				// al pin conectado al trigger
  digitalWrite(TRIG, LOW);		// del sensor  
  DURACION = pulseIn(ECO, HIGH);	// con funcion pulseIn se espera un pulso  				
  DISTANCIA = DURACION / 58.2;		// distancia medida en centimetros

//--------------------------------------------------------------------------------------------------------
//--------------------------------------SENSA/LIBRE/OCUPADO-----------------------------------------------
  if (DISTANCIA < 30){
   ocup=1;
   lib=0;
  } 
  else{
   ocup=0;
   lib=1;
  } 
//---------------------------------------------------ESTRUCTURAGERAL------------------------------------------
  //Reserva();

  if (res==1){
    Azul();   
    //Reserva();
  }
   if (ocup==1 && res==0){
    Rojo();
    put_ocupado();   
  }
   if (lib==1 && res==0){
    Verde();
    put_libre();   
  }
  Reserva();
}

//-----------------------------------------------------ESTRUCTURAGERAL------------------------------------------------------------------------
void Rojo (){
  digitalWrite(ROJO, LOW);   
  digitalWrite(AZUL, HIGH);   
  digitalWrite(VERDE, HIGH); 
  SER.println("OCUPADO");
}

void Verde (){
  digitalWrite(ROJO, HIGH);   
  digitalWrite(AZUL, HIGH);   
  digitalWrite(VERDE, LOW); 
  SER.println("LIBRE");
}

void Azul (){
  digitalWrite(ROJO, HIGH);   
  digitalWrite(AZUL, LOW);   
  digitalWrite(VERDE, HIGH); 
  SER.println("RESERVADO");
}

void put_libre(){

  WiFiClient client;
  HTTPClient http;
  String getData, link;
  link = str_url_put;  

  http.begin(client,link);    
  http.addHeader("Content-Type", "text/plain");     
  int httpCode = http.PUT("{\"ip_cochera\":\"192.168.1.103\", \"estado\":\"LIBRE\", \"origen\":\"ARDUINO\"}");
  String payload = http.getString();
  SER.print("Response Code:");
  SER.println(httpCode);
  SER.print("Returned data from SERVER: ");
  SER.println(payload);  
  http.end();  

}

void put_ocupado(){
  WiFiClient client;
  HTTPClient http;
  String getData, link;
  link = str_url_put;  

  http.begin(client,link);    
  http.addHeader("Content-Type", "text/plain");     
  int httpCode = http.PUT("{\"ip_cochera\":\"192.168.1.103\", \"estado\":\"OCUPADO\", \"origen\":\"ARDUINO\"}");
  String payload = http.getString();
  SER.print("Response Code:");
  SER.println(httpCode);
  SER.print("Returned data from SERVER: ");
  SER.println(payload);
  http.end();
}

void Reserva (){

  WiFiClient client;
  HTTPClient http;
  String getData, link;
  link = str_url_put;  
  http.begin(client,link);

  http.GET();  
  int httpCode = http.GET();
  String payload = http.getString();
  http.end();  
  StaticJsonDocument<256> resp;
  DeserializationError err = deserializeJson(resp, payload);
  
  if (err){
    SER.print("ERROR; ");
    SER.println(err.c_str()); 
    return;      
  }
  String el_json_reservado = resp["parking"]["id_estado_sensor_id__codigo"];
  SER.println("EL ESTADO DE LA RESERVA ES...");  
  SER.println(el_json_reservado);

  if (el_json_reservado == "RESERVADO") {
    res = 1;
  } else {
    res = 0;
  }
  
}

void printTime(time_t t)                                                                                              // Funcion para mandar hora por puerto serie    
{
  SER.println("");
  SER.print("Fecha local: ");
  SER.print(convertirTimeATextoFecha(t));
  SER.println("");
  SER.print("Hora local: ");
  SER.print(convertirTimeATextoHora(t));

}

String convertirTimeATextoFecha(time_t t)                                                                               // Funcion para formatear en texto la fecha  
{
  String date = "";
  date += days[weekday(t)-1];
  date += ", ";
  date += day(t);
  date += " ";
  date += months[month(t)-1];
  date += ", ";
  date += year(t);
  return date;
}

String convertirTimeATextoFechaSinSemana(time_t t)                                                                    // Funcion para formatear en texto la fecha sin dia de la semana
{
  String date = "";
  date += months[month(t)-1];
  date += "   ";
  date += year(t);
  return date;
}

String convertirTimeATextoHora(time_t t)                                                                              // Funcion para formatear en texto la hora                                                                          
{
  String hora ="";                                                                                                    // Funcion para formatear en texto la hora  
  if(hour(t) < 10)
  hora += "0";
  hora += hour(t);
  hora += ":";
  if(minute(t) < 10)                                                                                                  // Agregar un cero si el minuto es menor de 10
    hora += "0";
  hora += minute(t);
  return hora;
}
