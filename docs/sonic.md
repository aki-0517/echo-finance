# Getting Started

Sonic offers developers two distinct networks to build and deploy their apps. First, the [Sonic testnet](https://testnet.soniclabs.com/) serves as a dedicated environment where you can rigorously test your smart contract code and deployments, ensuring everything functions correctly using faucet tokens.

Once your contracts are thoroughly vetted on the testnet, you can confidently deploy your live apps to the Sonic mainnet, the production environment where end users will interact with your apps.

The following are the network details:

{% tabs %}
{% tab title="Sonic Mainnet" %}
* **Network name**: Sonic
* **RPC URL:** [**https://rpc.soniclabs.com**](https://rpc.soniclabs.com)
* **Explorer URL:** [**https://sonicscan.org**](https://sonicscan.org)
* **Chain ID**: 146
* **Currency symbol**: S
{% endtab %}

{% tab title="Sonic Testnet" %}
* **Network name**: Sonic Testnet
* **RPC URL:** [**https://rpc.testnet.soniclabs.com**](https://rpc.blaze.soniclabs.com)
* **Explorer URL:** [**https://testnet.sonicscan.org**](https://testnet.sonicscan.org)
* **Chain ID**: 14601
* **Currency symbol**: S
* **Faucet:** [**https://testnet.soniclabs.com/account**](https://testnet.soniclabs.com/account)
{% endtab %}

{% tab title="Blaze Testnet (Legacy)" %}
* **Network name**: Sonic Blaze Testnet
* **RPC URL:** [**https://rpc.blaze.soniclabs.com**](https://rpc.blaze.soniclabs.com)
* **Explorer URL:** [**https://testnet.sonicscan.org**](https://testnet.sonicscan.org)
* **Chain ID**: 57054
* **Currency symbol**: S
* **Faucet:** [**https://testnet.soniclabs.com/account**](https://testnet.soniclabs.com/account)

_The Sonic Blaze testnet (2.0) will be depreciated soon._
{% endtab %}
{% endtabs %}

{% hint style="info" %}
To meet other builders and receive support, join the [official Sonic builders group](https://t.me/SonicBuilders).
{% endhint %}

# Deploy Contracts

At the software level, deploying to Sonic is the same as deploying to any other EVM network.

The only difference is which network you connect to. Use [https://rpc.testnet.soniclabs.com](https://rpc.blaze.soniclabs.com) as the connection endpoint for the Sonic testnet or [https://rpc.soniclabs.com](https://rpc.soniclabs.com) for the mainnet.

For the Sonic testnet, you can use the [Sonic testnet dashboard](https://testnet.soniclabs.com/account) to obtain an initial amount of S to execute transactions on the testnet.

Here are example configurations for Hardhat to deploy on the Sonic mainnet or testnet:

{% tabs %}
{% tab title="Sonic Mainnet" %}
```solidity
require("@nomicfoundation/hardhat-toolbox");

// Replace this private key with your Sonic account private key
const SONIC_PRIVATE_KEY = "YOUR SONIC TEST ACCOUNT PRIVATE KEY";

module.exports = {
  solidity: "0.8.26",
  networks: {
    sonic: {
      url: "https://rpc.soniclabs.com",
      accounts: [SONIC_PRIVATE_KEY]
    }
  }
};
```


{% endtab %}

{% tab title="Sonic Testnet" %}
```solidity
require("@nomicfoundation/hardhat-toolbox");

// Replace this private key with your Sonic account private key
const SONIC_PRIVATE_KEY = "YOUR SONIC TEST ACCOUNT PRIVATE KEY";

module.exports = {
  solidity: "0.8.26",
  networks: {
    sonic: {
      url: "https://rpc.testnet.soniclabs.com",
      accounts: [SONIC_PRIVATE_KEY]
    }
  }
};
```


{% endtab %}
{% endtabs %}

To deploy, execute `npx hardhat run scripts/deploy.js --network sonic`.&#x20;

{% hint style="info" %}
Please note that the **Sonic testnet** is a testing playground designed to showcase technology capabilities. The data stored on the network might eventually be deleted, with or without notice.
{% endhint %}


