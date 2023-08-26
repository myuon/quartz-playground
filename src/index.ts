import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";
import { fs } from "memfs";

console.log("initialized!");

const args = [];
let memory = new WebAssembly.Memory({ initial: 1 });

void (async () => {
  const instance = await WebAssembly.instantiateStreaming(
    fetch(await getDownloadURL(ref(storage, "quartz/quartz-2.2.0.wasm"))),
    {
      env: {
        debug(arg: unknown) {
          console.log(`[DEBUG] ${arg}`);
        },
        abort() {
          throw new Error("=== ABORTED ===");
        },
        i64_to_string_at(i64: number, buf: number, len: number) {
          console.log(`[i64_to_string_at] i64=${i64} buf=${buf} len=${len}`);
          throw new Error("todo");
        },
      },
      wasi_unstable: {
        fd_write(fd: number, iovs: number, iovs_len: number, nwritten: number) {
          console.log(
            `[fd_write] fd=${fd} iovs=${iovs} iovs_len=${iovs_len} nwritten=${nwritten}`
          );

          if (fd === 1) {
            console.log(
              new TextDecoder().decode(
                new Uint8Array(memory.buffer, iovs, iovs_len)
              )
            );
          } else if (fd === 2) {
            console.error(
              new TextDecoder().decode(
                new Uint8Array(memory.buffer, iovs, iovs_len)
              )
            );
          } else {
            fs.writeSync(
              fd,
              new Uint8Array(memory.buffer, iovs, iovs_len),
              0,
              iovs_len
            );
          }
        },
        path_open(
          dirfd: number,
          dirflags: number,
          path: number,
          path_len: number,
          oflags: number,
          fs_rights_base: number,
          fs_rights_inheriting: number,
          fs_flags: number,
          fd: number
        ) {
          console.log(
            `[path_open] dirfd=${dirfd} dirflags=${dirflags} path=${path} path_len=${path_len} oflags=${oflags} fs_rights_base=${fs_rights_base} fs_rights_inheriting=${fs_rights_inheriting} fs_flags=${fs_flags} fd=${fd}`
          );
          throw new Error("todo");
        },
        fd_close(fd: number) {
          console.log(`[fd_close] fd=${fd}`);
          throw new Error("todo");
        },
        fd_read(fd: number, iovs: number, iovs_len: number, nread: number) {
          console.log(
            `[fd_read] fd=${fd} iovs=${iovs} iovs_len=${iovs_len} nread=${nread}`
          );
          throw new Error("todo");
        },
        fd_filestat_get(fd: number, buf: number) {
          console.log(`[fd_filestat_get] fd=${fd} buf=${buf}`);
          throw new Error("todo");
        },
        environ_sizes_get(environ_count: number, environ_buf_size: number) {
          console.log(
            `[environ_sizes_get] environ_count=${environ_count} environ_buf_size=${environ_buf_size}`
          );
          throw new Error("todo");
        },
        environ_get(environ: number, environ_buf: number) {
          console.log(
            `[environ_get] environ=${environ} environ_buf=${environ_buf}`
          );
          throw new Error("todo");
        },
        args_sizes_get(argc: number, argv_buf_size: number) {
          console.log(
            `[args_sizes_get] argc=${argc} argv_buf_size=${argv_buf_size}`
          );

          new DataView(memory.buffer).setInt32(argv_buf_size, 0);
        },
        args_get(argv: number, argv_buf: number) {
          console.log(`[args_get] argv=${argv} argv_buf=${argv_buf}`);
        },
      },
    }
  );
  memory = instance.instance.exports.memory as WebAssembly.Memory;

  const main = instance.instance.exports.main as CallableFunction;
  main();
})();
