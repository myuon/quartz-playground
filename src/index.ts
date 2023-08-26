import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

console.log("initialized!");

void (async () => {
  const instance = await WebAssembly.instantiateStreaming(
    fetch(await getDownloadURL(ref(storage, "quartz/quartz-2.2.0.wasm"))),
    {
      env: {
        debug(arg: unknown) {
          console.log(`[DEBUG] ${arg}`);
        },
      },
    }
  );

  const main = instance.instance.exports.main as CallableFunction;
  main();
})();
