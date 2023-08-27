import styles from "./App.module.css";
import { useState } from "preact/hooks";
import { loadQuartz, version } from "./quartz";

const defaultCode = `fun main() {
  println("Hello, world!");
}`;

export const App = () => {
  const [loading, setLoading] = useState(false);
  const [stdout, setStdout] = useState("");
  const [stderr, setStderr] = useState("");

  return (
    <main className={styles.main}>
      <h1>Quartz Playground (v{version})</h1>

      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setLoading(true);

          const formData = new FormData(event.currentTarget);
          const input = formData.get("code") as string;

          const { stdout: newStdout, stderr: newStderr } = await loadQuartz(
            input
          );

          setLoading(false);

          setStdout(newStdout);
          setStderr(newStderr);
        }}
        className={styles.codeArea}
      >
        <div>
          <p>
            Code (<code>input.qz</code>):
          </p>
          <textarea name="code" defaultValue={defaultCode}></textarea>
        </div>

        <div>
          <button disabled={loading} className={styles.primaryButton}>
            {loading ? "..." : "Run"}
          </button>
        </div>
      </form>

      {stdout && (
        <pre className={styles.codeArea}>
          <p>Stdout:</p>
          <code>{stdout}</code>
        </pre>
      )}

      {stderr && (
        <pre className={styles.codeArea}>
          <p>Stderr:</p>
          <code>{stderr}</code>
        </pre>
      )}
    </main>
  );
};
