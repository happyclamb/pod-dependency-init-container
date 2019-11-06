const Client = require('kubernetes-client').Client;
const config = require('kubernetes-client').config;
const { namespace, podLabels } = require('./config');

const client = new Client({ config: config.getInCluster() });
let specLoaded = false;

const checkRunningPods = async () => {
  try {
    if (!specLoaded) {
      await client.loadSpec();
      specLoaded = true;
    }

    const podLabelArray = podLabels.split(',').map(label => label.trim());
    const podsNotRunning = await Promise.all(
        podLabelArray.map(async podLabel => {
          const response = await client.api.v1.namespaces(namespace).pods.get({ qs: { labelSelector: podLabel, fieldSelector: 'status.phase=Running' } });
          return (response.body.items.length > 0 ? null : podLabel);
        })
    );

    return(podsNotRunning.filter(podName => podName != null));

  } catch (error) {
    throw (error);
  }
};

module.exports = {
  checkRunningPods
};
