import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const isWindows = process.platform === "win32";
const runnerName = isWindows ? "test-storybook.cmd" : "test-storybook";
const storybookCliName = isWindows ? "storybook.cmd" : "storybook";
const runnerPath = path.join(projectRoot, "node_modules", ".bin", runnerName);
const storybookCliPath = path.join(
  projectRoot,
  "node_modules",
  ".bin",
  storybookCliName,
);

const extraArgs = process.argv.slice(2);
const isUpdateSnapshot =
  extraArgs.includes("--updateSnapshot") || extraArgs.includes("-u");

const parsePort = (value) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : 6006;
};

const getExplicitUrlFromArgs = (args) => {
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--url") {
      return args[index + 1];
    }
    if (typeof arg === "string" && arg.startsWith("--url=")) {
      return arg.slice("--url=".length);
    }
  }

  return undefined;
};

const explicitUrlFromArgs = getExplicitUrlFromArgs(extraArgs);
const envUrl =
  process.env.STORYBOOK_TEST_RUNNER_URL ??
  process.env.STORYBOOK_URL ??
  process.env.STORYBOOK_VISUAL_URL;
const storybookPort = parsePort(process.env.STORYBOOK_VISUAL_PORT);
const defaultStorybookUrl = `http://127.0.0.1:${storybookPort}`;
const storybookUrl = explicitUrlFromArgs ?? envUrl ?? defaultStorybookUrl;

const shouldAutoStartStorybook =
  process.env.STORYBOOK_VISUAL_SKIP_AUTOSTART !== "true" &&
  !explicitUrlFromArgs &&
  !envUrl;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForStorybook = async ({
  url,
  processRef,
  timeoutMs = 120_000,
  pollMs = 2_000,
}) => {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    if (processRef.exitCode !== null) {
      throw new Error(
        `Storybook exited before becoming ready (exit code ${processRef.exitCode ?? "unknown"})`,
      );
    }

    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(5_000) });
      if (response.ok) {
        return;
      }
    } catch {
      // retry until timeout elapses
    }

    await delay(pollMs);
  }

  throw new Error(
    `Timed out waiting for Storybook to become available at ${url}`,
  );
};

const startStorybook = async (url, port) => {
  const args = ["dev", "-p", String(port), "--ci", "--host", "127.0.0.1"];
  const child = spawn(storybookCliPath, args, {
    cwd: projectRoot,
    stdio: "inherit",
    env: {
      ...process.env,
      STORYBOOK_DISABLE_TELEMETRY: "1",
      BROWSER: "none",
    },
  });

  const iframeUrl = new URL("iframe.html", url).toString();

  await new Promise((resolve, reject) => {
    const handleReady = () => {
      child.off("error", handleError);
      resolve();
    };

    const handleError = (error) => {
      child.off("error", handleError);
      try {
        child.kill("SIGTERM");
      } catch {
        // ignore failures while attempting cleanup
      }
      reject(error);
    };

    waitForStorybook({
      url: iframeUrl,
      processRef: child,
    }).then(handleReady, handleError);

    child.once("error", handleError);
  });

  return child;
};

const stopProcess = async (child) => {
  if (!child || child.exitCode !== null) {
    return;
  }

  await new Promise((resolve) => {
    const handleExit = () => {
      clearTimeout(forceKillTimer);
      resolve();
    };

    const forceKillTimer = setTimeout(() => {
      if (child.exitCode === null) {
        try {
          child.kill("SIGKILL");
        } catch {
          // ignore platforms that do not support SIGKILL
        }
      }
    }, 5_000);

    child.once("exit", handleExit);

    try {
      const terminated = child.kill("SIGTERM");
      if (!terminated) {
        clearTimeout(forceKillTimer);
        child.removeListener("exit", handleExit);
        resolve();
      }
    } catch {
      clearTimeout(forceKillTimer);
      child.removeListener("exit", handleExit);
      resolve();
    }
  });
};

const runGenerateReport = (exitCode) =>
  new Promise((resolve) => {
    const reportProcess = spawn(
      process.execPath,
      [path.join(projectRoot, "scripts", "generate-visual-report.mjs")],
      {
        cwd: projectRoot,
        stdio: "inherit",
      },
    );

    reportProcess.on("close", (reportCode) => {
      const finalCode = exitCode !== 0 ? exitCode : reportCode;
      resolve(finalCode);
    });
  });

const runTestRunner = (args) =>
  new Promise((resolve, reject) => {
    const child = spawn(runnerPath, args, {
      cwd: projectRoot,
      stdio: "inherit",
      env: {
        ...process.env,
        STORYBOOK_TEST_RUNNER_MAX_WORKERS: process.env.CI ? "2" : undefined,
        STORYBOOK_VISUAL_REGRESSION: "true",
        STORYBOOK_VISUAL_UPDATE: isUpdateSnapshot ? "true" : undefined,
      },
    });

    child.on("error", reject);
    child.on("close", (code) => resolve(code ?? 0));
  });

const baseRunnerArgs = ["--config-dir", ".storybook"];
if (shouldAutoStartStorybook) {
  baseRunnerArgs.push("--url", storybookUrl);
}
const runnerArgs = [...baseRunnerArgs, ...extraArgs];

const main = async () => {
  let storybookProcess;
  let exitCode = 0;

  try {
    if (shouldAutoStartStorybook) {
      storybookProcess = await startStorybook(storybookUrl, storybookPort);
    }

    const runnerExitCode = await runTestRunner(runnerArgs);
    exitCode = await runGenerateReport(runnerExitCode);
  } catch (error) {
    console.error(error);
    exitCode = 1;
  } finally {
    await stopProcess(storybookProcess);
  }

  process.exit(typeof exitCode === "number" ? exitCode : 0);
};

main();
