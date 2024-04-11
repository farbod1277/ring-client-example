import "dotenv/config";
import { RingApi } from "ring-client-api";
import { readFile, writeFile } from "fs";
import { promisify } from "util";

async function example() {
  const { env } = process,
    ringApi = new RingApi({
      // This value comes from the .env file
      refreshToken: env.RING_REFRESH_TOKEN!,
      debug: true,
    }),
    locations = await ringApi.getLocations(),
    allCameras = await ringApi.getCameras();

  console.log(
    `Found ${locations.length} location(s) with ${allCameras.length} camera(s).`
  );

  for (const location of locations) {
    let haveConnected = false;
    location.onConnected.subscribe((connected) => {
      if (!haveConnected && !connected) {
        return;
      } else if (connected) {
        haveConnected = true;
      }

      const status = connected ? "Connected to" : "Disconnected from";
      console.log(`**** ${status} location ${location.name} - ${location.id}`);
    });
  }

  for (const location of locations) {
    const cameras = location.cameras,
      devices = await location.getDevices();

    console.log(
      `\nLocation ${location.name} (${location.id}) has the following ${cameras.length} camera(s):`
    );

    for (const camera of cameras) {
      console.log(`- ${camera.id}: ${camera.name} (${camera.deviceType})`);
    }

    console.log(
      `\nLocation ${location.name} (${location.id}) has the following ${devices.length} device(s):`
    );

    for (const device of devices) {
      console.log(`- ${device.zid}: ${device.name} (${device.deviceType})`);
    }
  }

  // Record for 20s
  if (allCameras.length) {
    allCameras.forEach((camera) => {
      const filename: string = `/home/torabi_home/ring-client-example/videos/vid_${getCurrentDateTime()}.mp4`;
      camera.recordToFile(filename, 20);
      console.log('Recorded Video on Notification.');
    });
  }
}

function getCurrentDateTime(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Adding 1 because getMonth() returns 0-indexed month
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

example();
