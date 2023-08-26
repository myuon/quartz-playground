import styles from "./App.module.css";

const defaultCode = `fun main() {
  println("Hello, world!");
}`;

export const App = () => {
  return (
    <main className={styles.main}>
      <h1>Quartz Playground</h1>

      <div className={styles.codeArea}>
        <div>
          <p>Code:</p>
          <textarea defaultValue={defaultCode}></textarea>
        </div>

        <div>
          <button className={styles.primaryButton}>Run</button>
        </div>
      </div>
    </main>
  );
};
