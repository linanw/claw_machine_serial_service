String inputString = ""; // A string to hold incoming data
bool stringComplete = false; // Whether the string is complete

// Define pins for each of the actions
const int pinUp = 2;
const int pinDown = 3;
const int pinLeft = 4;
const int pinRight = 5;
const int pinCatch = 6;
const int pinStart = 7;

const int ledPin = 13;

void setup() {
  Serial.begin(9600); // Initialize serial communication at 9600 bps
  inputString.reserve(200); // Reserve 200 bytes for the inputString

    // Set pin modes for each of the defined pins
  pinMode(pinUp, OUTPUT);
  pinMode(pinDown, OUTPUT);
  pinMode(pinLeft, OUTPUT);
  pinMode(pinRight, OUTPUT);
  pinMode(pinCatch, OUTPUT);
  pinMode(pinStart, OUTPUT);

    pinMode(ledPin, OUTPUT); 
  // Initialize the pins to LOW
  digitalWrite(pinUp, LOW);
  digitalWrite(pinDown, LOW);
  digitalWrite(pinLeft, LOW);
  digitalWrite(pinRight, LOW);
  digitalWrite(pinCatch, LOW);
  digitalWrite(pinStart, LOW);

  digitalWrite(ledPin, LOW);
}

void loop() {
  // Check if we have a complete string from Serial input
  // Check if we have a complete string from Serial input
 if (stringComplete) {
    // Switch case based on the input string using .equals()
    if (inputString.equals("up")) {
         Serial.println("Moving Up");
        digitalWrite(pinUp, HIGH);
        delay(300);
        digitalWrite(pinUp, LOW);
        //blinkLED(2);
    } else if (inputString.equals("down")) {
         Serial.println("Moving Down");
        digitalWrite(pinDown, HIGH);
        delay(300);
        digitalWrite(pinDown, LOW);
        //blinkLED(3);
    } else if (inputString.equals("left")) {
         Serial.println("Moving Left");
        digitalWrite(pinLeft, HIGH);
        delay(300);
        digitalWrite(pinLeft, LOW);
        //blinkLED(4);
    } else if (inputString.equals("right")) {
         Serial.println("Moving Right");
        digitalWrite(pinRight, HIGH);
        delay(300);
        digitalWrite(pinRight, LOW);
        //blinkLED(5);
    } else if (inputString.equals("catch")) {
         Serial.println("Catching");
        digitalWrite(pinCatch, HIGH);
        delay(1000);
        digitalWrite(pinCatch, LOW);
        //blinkLED(6);
    } else if (inputString.equals("start")) {
         Serial.println("Starting");
        digitalWrite(pinStart, HIGH);
        delay(1000);
        digitalWrite(pinStart, LOW);
        //blinkLED(7);
    } else {
        // Unknown command received
        Serial.print("Unknown command: ");
        Serial.println(inputString);
    }

    // Clear the string for new input
    inputString = "";
    stringComplete = false;
  }
}
void blinkLED(int times) {
  for (int i = 0; i < times; i++) {
    digitalWrite(ledPin, HIGH);  // Turn the LED on
    delay(300);                  // Wait for half a second (500 milliseconds)
    digitalWrite(ledPin, LOW);   // Turn the LED off

  }
}

void serialEvent() {
  while (Serial.available()) {
    // Get the new byte
    char inChar = (char)Serial.read();
    // If the incoming character is a newline, set a flag so the main loop can process it
    if (inChar == '\n') {
      stringComplete = true;
      break;  // Exit the loop once a newline is detected
    } else {
      // If the character is not a newline, add it to the inputString
      inputString += inChar;
    }
  }
}
