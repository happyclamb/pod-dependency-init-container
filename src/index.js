const { checkRunningPods } = require('./lib/k8s');
const { podLabels, namespace, maxRetry, retryTimeOut } = require('./lib/config');

const CurrentDate = () => { };
CurrentDate.toString = () => `[${new Date().toISOString()}]`;
console.info = console.info.bind(console, '%s', CurrentDate);
console.error = console.error.bind(console, '%s', CurrentDate);

let noOfTrys = 1;
console.info(`Started pod dependency lookup, maxRetries ${maxRetry} with retryTimeOut ${retryTimeOut}`);
console.info(`Using namespace '${namespace}' and looking for podLabels ${podLabels}`);
const checkIfPodsRunning = async () => {
  try {
    console.info(`Checking for running pods try ${noOfTrys}`);
    const podsNotRunning = await checkRunningPods();
    if (podsNotRunning.length === 0) {
      console.info(`Found running pods with label(s) ${podLabels}`);
      process.exit(0);
    } else if (noOfTrys < maxRetry) {
      console.info(`Following pods not found: ${podsNotRunning.toString()}`);
      setTimeout(checkIfPodsRunning, retryTimeOut);
    } else {
      console.error(`Following pod(s) not running: ${podsNotRunning.toString()}`);
      console.error(`Didn't find running pods with label(s) ${podLabels} after ${noOfTrys} try(s)`);
      process.exit(1);
    }
    noOfTrys++;
  } catch (error) {
    console.error(`Couldn't fetch running pods`);
    console.error(error, error.message, error.stack);
    process.exit(1);
  }
};
setTimeout(checkIfPodsRunning, retryTimeOut);
