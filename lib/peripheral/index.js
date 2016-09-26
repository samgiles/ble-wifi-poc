const noble = require('noble');

const wifiManagerUUID = '01234567890123456789012345678901';
const ssidCharacteristicUUID = '11134567890123456789012345678901';
const wpaCharacteristicUUID = '22234567890123456789012345678901';


noble.on('stateChange', (state) => {
 if (state === 'poweredOn') {
    console.log('scanning...');

   noble.startScanning([wifiManagerUUID], false);
 } else {
    noble.stopScanning();
 }
});

noble.on('discover', (peripheral) => {
  noble.stopScanning();

  console.log('found peripheral');

  let wpaCharacteristic = null;
  let ssidCharacteristic = null;

  peripheral.connect((err) => {
    peripheral.discoverServices([wifiManagerUUID], (err, services) => {
      services.forEach((service) => {
        console.log(`found service ${service.uuid}`);

        service.discoverCharacteristics([], (err, characteristics) => {
          characteristics.forEach((characteristic) => {
            console.log(`found characteristic ${characteristic.uuid}`);

            switch(characteristic.uuid) {
            case ssidCharacteristicUUID:
              ssidCharacteristic = characteristic;
              return;
            case wpaCharacteristicUUID:
              wpaCharacteristic = characteristic;
              return;
            default:
              console.error(`unknown characteristic: ${characteristic.uuid}`);
              return;
            }

          });
          if (ssidCharacteristic && wpaCharacteristic) {
            sendDetails(ssidCharacteristic, wpaCharacteristic);
          } else {
            console.error('missing characteristics');
          }
        });
      });
    });
  });
});

function sendDetails(ssidCharacteristic, wpaCharacteristic) {
  const SSID = 'testwifissid';
  const PASS = 'SuperSecureWifiPassword!';
  const ssid = new Buffer(SSID.length);
  const pass = new Buffer(PASS.length);

  ssid.write(SSID);
  pass.write(PASS);

  ssidCharacteristic.write(ssid, false, (e) => {
    if (e) {
      console.error(e);
      return;
    }

    wpaCharacteristic.write(pass, false, (e) => {
      if (e) {
        console.log(e);
        return;
      }
    });
  });
}
