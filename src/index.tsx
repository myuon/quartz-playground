import { render } from "preact";
import "modern-css-reset";

const App = () => {
  return (
    <div>
      <h1>Quartz Playground</h1>

      <div>
        <p>Code:</p>
        <textarea
          defaultValue={`fun main() {
  println("Hello, world!");
}`}
        ></textarea>

        <button>Run</button>
      </div>
    </div>
  );
};

render(<App />, document.body);
