import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";
import { fs } from "memfs";

// WHY??
const args = ["quartz", "compile", "-o", "output.qz", "input.qz"];
let instance = null as unknown as WebAssembly.Instance;
let stdout = "";
let stderr = "";

let next_fd = 4;
let fds = {
  1: {},
  2: {},
  3: {},
} as Record<
  number,
  {
    dirfd?: number;
    dirflags?: number;
    path?: string;
    oflags?: number;
    fs_rights_base?: number;
    fs_rights_inheriting?: number;
    fs_flags?: number;
  }
>;

const getMemoryView = () => {
  return new DataView((instance.exports.memory as WebAssembly.Memory).buffer);
};

export const loadQuartz = async (input: string) => {
  fs.writeFileSync("input.qz", input);

  const result = await WebAssembly.instantiateStreaming(
    fetch(await getDownloadURL(ref(storage, "quartz/quartz-2.3.0.wasm"))),
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
        fd_write(
          fd: number,
          ciovs: number,
          ciovs_len: number,
          nwritten: number
        ) {
          if (ciovs_len !== 1) {
            throw new Error(
              `[fd_write] ciovs_len=${ciovs_len} is not supported.`
            );
          }

          const mem = getMemoryView();

          const address = mem.getUint32(ciovs, true);
          const length = mem.getUint32(ciovs + 4, true);

          const data = new Uint8Array(mem.buffer, address, length);

          if (fd === 1) {
            stdout += new TextDecoder().decode(data);
            mem.setInt32(nwritten, length, true);
          } else if (fd === 2) {
            stderr += new TextDecoder().decode(data);
            mem.setInt32(nwritten, length, true);
          } else {
            throw new Error(`[fd_write] fd=${fd} is not supported.`);
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
          const mem = getMemoryView();
          const filepath = new TextDecoder().decode(
            new Uint8Array(mem.buffer, path, path_len)
          );

          mem.setInt32(fd, next_fd, true);
          fds[next_fd] = {
            dirfd,
            dirflags,
            path: filepath,
            oflags,
            fs_rights_base,
            fs_rights_inheriting,
            fs_flags,
          };
          next_fd++;
        },
        fd_close(fd: number) {
          console.log(`[fd_close] fd=${fd}`);
          throw new Error("todo");
        },
        fd_read(fd: number, iovs: number, iovs_len: number, nread: number) {
          const mem = getMemoryView();

          console.log(
            `[fd_read] fd=${fd} iovs=${iovs} iovs_len=${iovs_len} nread=${nread}`
          );

          const address = mem.getUint32(iovs, true);
          const length = mem.getUint32(iovs + 4, true);
          console.log(address, length);
          throw new Error("todo");
        },
        fd_filestat_get(fd: number, buf: number) {
          const mem = getMemoryView();
          const stat = fds[fd];
          if (!stat) {
            throw new Error(`[fd_filestat_get] fd=${fd} is not found.`);
          }
          const fsStat = fs.statSync(stat.path);

          /* According to the document, offset:24 seems to be linkcount, but the actual behavior seems to be different.
           *
           * Example:
           *   quartz/std.qz
           *    offset=0  I32(0) (0b000000000000000000000000000000 | 0b0)
           *    offset=8  I32(1032) (0b000000000000000000010000001000 | 0b0)
           *    offset=16 I32(4) (0b000000000000000000000000000100 | 0b0)
           *    offset=24 I32(36178) (0b000000000000001000110101010010 | 0b0)
           */
          mem.setUint32(buf, 0, true); // device ID
          mem.setUint32(buf + 8, 0, true); // inode
          mem.setUint32(buf + 16, 0, true); // file type
          mem.setUint32(buf + 24, fsStat.size, true); // size
          // mem.setUint8(buf + 56, 0); // linkcount
          mem.setBigUint64(
            buf + 32,
            BigInt(fsStat.atime.getTime() * 1000),
            true
          ); // atim
          mem.setBigUint64(
            buf + 40,
            BigInt(fsStat.mtime.getTime() * 1000),
            true
          ); // mtim
          mem.setBigUint64(
            buf + 48,
            BigInt(fsStat.ctime.getTime() * 1000),
            true
          ); // ctim
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
          const mem = getMemoryView();
          mem.setUint32(argc, args.length, true);
          mem.setUint32(
            argv_buf_size,
            args.map((c) => c.length + 1).reduce((p, c) => p + c, 0),
            true
          );
        },
        args_get(argv: number, argv_buf: number) {
          const mem = getMemoryView();
          mem.setUint32(argv, argv_buf, true);

          let position = 0;
          args.forEach((arg, i) => {
            const data = new TextEncoder().encode(arg);

            for (let i = 0; i < data.length; i++) {
              mem.setUint8(argv_buf + position + i, data[i]);
            }
            mem.setUint8(argv_buf + position + data.length, 0);

            position += data.length + 1;
            mem.setUint32(argv + (i + 1) * 4, argv_buf + position, true);
          });
        },
      },
    }
  );
  instance = result.instance;

  const main = instance.exports.main as CallableFunction;
  try {
    main();
  } catch (err) {
    console.error(err);
  }

  if (stdout) {
    console.log(stdout);
  }
  if (stderr) {
    console.error(stderr);
  }
};
