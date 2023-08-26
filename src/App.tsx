import styles from "./App.module.css";
import { useState } from "preact/hooks";
import { loadQuartz } from "./quartz";

const defaultCode = `fun main() {
  println("Hello, world!");
}`;

export const App = () => {
  const [loading, setLoading] = useState(false);

  return (
    <main className={styles.main}>
      <h1>Quartz Playground</h1>

      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setLoading(true);

          const formData = new FormData(event.currentTarget);
          const input = formData.get("code") as string;

          await loadQuartz(input);

          setLoading(false);
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
    </main>
  );
};
