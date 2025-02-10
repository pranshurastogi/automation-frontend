import React, { useState } from "react";
import { ConnectButton } from "thirdweb/react";
import thirdwebIcon from "./thirdweb.svg";
import { client } from "./client";
import { ethers, Wallet } from "ethers";
import axios from "axios";

import { PushAPI, CONSTANTS } from "@pushprotocol/restapi";

// SAMPLE_NAME_EMITTER_SC=0x113c9A8B7C5bd7772bc1A790bA5b5b4743Eb677C

export function App() {
  // State to store form inputs
  const [formData, setFormData] = useState({
    channelAddress: "",
    workflowName: "",
    payload: {
      body: "",
      subject: "",
      clickUrl: "",
      imgUrl: "",
    },
    audience: {
      type: "ALL_EPNS_SUBSCRIBERS",
      addresses: "",
    },
    trigger: {
      type: "NEW_SUBSCRIBER",
      address: "",
      eventName: "",
      spaceId: "",
      eventType: "",
    },
    org: "",
    action: "CREATE",
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [formattedData, setFormattedData] = useState(null);
  const [workflowId, setWorkflowId] = useState(0);
  const [delegateChannelAddress, setDelegateChannelAddress] = useState("");

  const formatData = async (unformattedData) => {
    console.log(unformattedData);
    if (unformattedData.trigger.type === "NEW_SUBSCRIBER") {
      const formattedData = {
        name: unformattedData.workflowName,
        message: {
          body: unformattedData.payload.body,
          subject: unformattedData.payload.subject,
          clickUrl: unformattedData.payload.clickUrl,
          imgUrl: unformattedData.payload.imgUrl,
          apps: ["EPNS", "EMAIL", "TELEGRAM", "DISCORD"],
          audience: {
            type: unformattedData.audience.type,
            values:
              unformattedData.audience.type === "ALL_EPNS_SUBSCRIBERS"
                ? []
                : unformattedData.audience.addresses
                    .split(",")
                    .map((address) => address.trim()),
          },
          settings: [
            { type: 1, index: 1 },
            { type: 2, index: 2 },
          ],
        },
        trigger: {
          type: "NEW_SUBSCRIBER",
          contract: "",
          incomingWebhookId: "",
          snapshot: "",
        },
        org: "",
        action: "CREATE",
      };
      return formattedData;
    }
    if (unformattedData.trigger.type === "CONTRACT_CALL") {
      // Add logic for CONTRACT_CALL if necessary
      const formattedData = {
        name: unformattedData.workflowName,
        message: {
          body: unformattedData.payload.body,
          subject: unformattedData.payload.subject,
          clickUrl: unformattedData.payload.clickUrl,
          imgUrl: unformattedData.payload.imgUrl,
          apps: ["EPNS", "EMAIL", "TELEGRAM", "DISCORD"],
          audience: {
            type: unformattedData.audience.type,
            values:
              unformattedData.audience.type === "ALL_EPNS_SUBSCRIBERS"
                ? []
                : unformattedData.audience.addresses
                    .split(",")
                    .map((address) => address.trim()),
          },
          settings: [
            { type: 1, index: 1 },
            { type: 2, index: 2 },
          ],
        },
        trigger: {
          type: "CONTRACT_CALL",
          contract: {
            contractAddress: unformattedData.trigger.address,
            eventName: unformattedData.trigger.eventName,
          },
          incomingWebhookId: "",
          snapshot: "",
        },
        org: "",
        action: "CREATE",
      };
      return formattedData;
    }
    if (unformattedData.trigger.type === "SNAPSHOT_EVENT") {
      // Add logic for SNAPSHOT_EVENT if necessary
      const formattedData = {
        name: unformattedData.workflowName,
        message: {
          body: unformattedData.payload.body,
          subject: unformattedData.payload.subject,
          clickUrl: unformattedData.payload.clickUrl,
          imgUrl: unformattedData.payload.imgUrl,
          apps: ["EPNS", "EMAIL", "TELEGRAM", "DISCORD"],
          audience: {
            type: unformattedData.audience.type,
            values:
              unformattedData.audience.type === "ALL_EPNS_SUBSCRIBERS"
                ? []
                : unformattedData.audience.addresses
                    .split(",")
                    .map((address) => address.trim()),
          },
          settings: [
            { type: 1, index: 1 },
            { type: 2, index: 2 },
          ],
        },
        trigger: {
          type: "SNAPSHOT_EVENT",
          contract: "",
          incomingWebhookId: "",
          snapshot: {
            space: unformattedData.trigger.spaceId,
            event: unformattedData.trigger.eventType,
          },
        },
        org: "",
        action: "CREATE",
      };
      return formattedData;
    }
  };

  const handleSubmit = async (formattedData) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Define EIP-712 domain
      const domain = {
        name: "EPNS COMM V1", // Application name
        chainId: 11155111, // Replace with the correct chain ID
        verifyingContract: "0x9dDCD7ed7151afab43044E4D694FA064742C428c", // Replace with contract address if applicable
      };

      let types;

      if (formattedData.trigger.type === "NEW_SUBSCRIBER") {
        // Define the data types (EIP-712 schema)
        types = {
          Notification: [
            { name: "name", type: "string" },
            { name: "message", type: "Message" },
            { name: "trigger", type: "Trigger" },
            { name: "org", type: "string" },
            { name: "action", type: "string" },
          ],
          Message: [
            { name: "body", type: "string" },
            { name: "subject", type: "string" },
            { name: "clickUrl", type: "string" },
            { name: "imgUrl", type: "string" },
            { name: "apps", type: "string[]" },
            { name: "audience", type: "Audience" },
            { name: "settings", type: "Setting[]" },
          ],
          Audience: [
            { name: "type", type: "string" },
            { name: "values", type: "string[]" },
          ],
          Setting: [
            { name: "type", type: "uint256" },
            { name: "index", type: "uint256" },
          ],
          Trigger: [
            { name: "type", type: "string" },
            { name: "contract", type: "string" },
            { name: "incomingWebhookId", type: "string" },
            { name: "snapshot", type: "string" },
          ],
        };
      }
      if (formattedData.trigger.type === "CONTRACT_CALL") {
        // Define the data types (EIP-712 schema)
        types = {
          Notification: [
            { name: "name", type: "string" },
            { name: "message", type: "Message" },
            { name: "trigger", type: "Trigger" },
            { name: "org", type: "string" },
            { name: "action", type: "string" },
          ],
          Message: [
            { name: "body", type: "string" },
            { name: "subject", type: "string" },
            { name: "clickUrl", type: "string" },
            { name: "imgUrl", type: "string" },
            { name: "apps", type: "string[]" },
            { name: "audience", type: "Audience" },
            { name: "settings", type: "Setting[]" },
          ],
          Audience: [
            { name: "type", type: "string" },
            { name: "values", type: "string[]" },
          ],
          Setting: [
            { name: "type", type: "uint256" },
            { name: "index", type: "uint256" },
          ],
          Trigger: [
            { name: "type", type: "string" },
            { name: "contract", type: "Contract" },
            { name: "incomingWebhookId", type: "string" },
            { name: "snapshot", type: "string" },
          ],
          Contract: [
            { name: "contractAddress", type: "string" },
            { name: "eventName", type: "string"}
          ]
        };
      }

      // The data to be signed
      const value = {
        name: formattedData.name,
        message: formattedData.message,
        trigger: formattedData.trigger,
        org: formattedData.org,
        action: formattedData.action,
      };

      console.log("Value to sign:", value);

      // Sign the data using the wallet
      const signature = await signer._signTypedData(domain, types, value);
      console.log("Signature:", signature);

      const payload = {
        data: formattedData,
        verificationProof: `eip712:${signature}`,
      };

      console.log(payload);

      const channelAddress = formData.channelAddress;

      // Make the POST request using axios
      const response = await axios.post(
        `http://localhost:5432/automation/channels/${channelAddress}/workflow/create`,
        payload
      );

      console.log("Response from server:", response.data);
      setWorkflowId(response.data.data.workflows[0].id);
      setModalVisible(true);

      return response.data;
    } catch (error) {
      console.error("Error signing form data:", error);
    }
  };

  const handleApprove = async () => {
    try {
      // Check if Ethereum provider (MetaMask) is available
      if (!window.ethereum) {
        throw new Error(
          "Ethereum provider not found. Please install MetaMask."
        );
      }

      // Initialize ethers provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Get the connected wallet address (spender address)
      const spenderAddress = "0xb03865D0Ce7B71acD1Ea13dDA80095Baaaec4217";

      // Define the token contract address and ABI
      const tokenAddress = "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238"; // USDC on Sepolia
      const tokenABI = [
        {
          inputs: [
            { internalType: "address", name: "spender", type: "address" },
            { internalType: "uint256", name: "amount", type: "uint256" },
          ],
          name: "approve",
          outputs: [{ internalType: "bool", name: "", type: "bool" }],
          stateMutability: "nonpayable",
          type: "function",
        },
      ];
      const amount = ethers.utils.parseUnits("0.1", 6);

      // Initialize the contract instance
      const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);

      // Approve the connected wallet address to spend the specified amount
      const tx = await tokenContract.approve(spenderAddress, amount);

      console.log("Transaction sent:", tx.hash);

      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      console.log("Transaction mined:", receipt);

      // alert(
      //   `Approval successful for ${spenderAddress}! Transaction Hash: ${tx.hash}`
      // );
    } catch (error) {
      console.error("Error approving usdc:", error);
    }
  };

  const handleStake = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractAddress = "0xb03865D0Ce7B71acD1Ea13dDA80095Baaaec4217";
      const contractABI = [
        {
          inputs: [
            { internalType: "uint256", name: "_workflowId", type: "uint256" },
          ],
          name: "stake",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ];

      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      const tx = await contract.stake(Number(workflowId));
      console.log("Transaction sent:", tx.hash);

      const receipt = await tx.wait();
      console.log("Transaction mined:", receipt);

      // Make the POST request using axios
      const response = await axios.post(
        `http://localhost:5432/automation/channels/stake/update`,
        {
          workflowId: workflowId,
          transactionHash: tx.hash,
        }
      );

      console.log("Response from DB Staking server:", response.data);

      alert(`Stake successful! Transaction Hash: ${tx.hash}`);
      setModalVisible(false);
    } catch (error) {
      console.error("Error staking:", error);
    }
  };

  const generateWallet = async () => {
    try {
      const encryptionKey = "automation_encryptionKey";

      // 1. Generate a new Ethereum wallet (private-public key pair)
      const wallet = Wallet.createRandom();

      // 2. Extract the public address and private key
      const publicAddress = wallet.address;
      const privateKey = wallet.privateKey;

      const encryptedPrivateKey = await new Wallet(privateKey).encrypt(
        encryptionKey
      );
      const decryptedPrivateKey = await Wallet.fromEncryptedJson(
        encryptedPrivateKey,
        encryptionKey
      );

      console.log(
        "Returning public address and encrypted private key: ",
        publicAddress,
        encryptedPrivateKey
      );
      console.log(
        "Returning public address and decrypted private key: ",
        publicAddress,
        decryptedPrivateKey.privateKey
      );

      // 3. Encrypt the private key with keccak256 and the provided encryptionKey
      console.log(
        "Returning public address and private key: ",
        publicAddress,
        privateKey
      );

      return { publicAddress, encryptedPrivateKey };
    } catch (error) {
      console.error("Error generating wallet:", error);
    }
  };

  const addDelegate = async (publicAddress: any) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const userAlice = await PushAPI.initialize(signer, {
        env: CONSTANTS.ENV.STAGING,
      });
      const addedDelegate = await userAlice.channel.delegate.add(
        `eip155:11155111:${publicAddress}`
      );
      console.log("Delegate added: ", addedDelegate);
    } catch (error) {
      console.error("Error adding delegate: ", error);
    }
  };

  const setupDelegate = async () => {
    try {
      // 1. Generate a random wallet
      const wallet = await generateWallet();

      // 2. User adds delegate to their channel
      const addDelegateRes = await addDelegate(wallet?.publicAddress);

      // 3. Send the public key and encrypted private key to server
      const body = {
        publicAddress: wallet?.publicAddress,
        encryptedPrivateKey: wallet?.encryptedPrivateKey,
      };

      // const channelAddress = formData.channelAddress;

      // Make the POST request using axios
      const response = await axios.post(
        `http://localhost:5432/automation/channels/${delegateChannelAddress}/delegate/add`,
        body
      );

      console.log("Response from DB Delegate server:", response.data);
    } catch (error) {
      console.error("Error setting up delegate:", error);
    }
  };

  const checkDelegate = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const userAlice = await PushAPI.initialize(signer, {
        env: CONSTANTS.ENV.STAGING,
      });
      const delegates = await userAlice.channel.delegate.get();
      // const removeDelegates = await userAlice.channel.delegate.remove(
      //   `eip155:11155111:0xf6c9a537c2F08509e7d33754Db7B81F1480CaB18`
      // );
      // console.log(removeDelegates);
      console.log(delegates);
    } catch (error) {
      console.log("Error checking delegate:", error);
    }
  };
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("payload.")) {
      setFormData((prev) => ({
        ...prev,
        payload: {
          ...prev.payload,
          [name.split(".")[1]]: value,
        },
      }));
    } else if (name.startsWith("audience.")) {
      setFormData((prev) => ({
        ...prev,
        audience: {
          ...prev.audience,
          [name.split(".")[1]]: value,
        },
      }));
    } else if (name.startsWith("trigger.")) {
      setFormData((prev) => ({
        ...prev,
        trigger: {
          ...prev.trigger,
          [name.split(".")[1]]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto relative">
      {/* Connect Button */}
      <div className="absolute top-4 right-4">
        <ConnectButton
          client={client}
          appMetadata={{
            name: "Workflow Automation",
            url: "https://app.push.org/",
          }}
        />
      </div>

      {/* Form */}
      <form className="p-8 rounded-lg shadow-lg w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-4">Create Workflow</h1>

        {/* Channel Address */}
        <div className="mb-4">
          <label className="block font-medium mb-2">
            Channel Address (CAIP Format)
          </label>
          <input
            type="text"
            name="channelAddress"
            value={formData.channelAddress}
            onChange={handleChange}
            className="text-gray-800 w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* Workflow Name */}
        <div className="mb-10">
          <label className="block font-medium mb-2">Workflow Name</label>
          <input
            type="text"
            name="workflowName"
            value={formData.workflowName}
            onChange={handleChange}
            className="text-gray-800 w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* Payload Section */}
        <div className="mb-10">
          <h2 className="font-bold mb-2">Payload</h2>

          <div className="mb-2">
            <label className="block">Body</label>
            <input
              type="text"
              name="payload.body"
              value={formData.payload.body}
              onChange={handleChange}
              className="text-gray-800 w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div className="mb-2">
            <label className="block">Subject</label>
            <input
              type="text"
              name="payload.subject"
              value={formData.payload.subject}
              onChange={handleChange}
              className="text-gray-800 w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div className="mb-2">
            <label className="block">Click URL</label>
            <input
              type="text"
              name="payload.clickUrl"
              value={formData.payload.clickUrl}
              onChange={handleChange}
              className="text-gray-800 w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block">Image URL</label>
            <input
              type="text"
              name="payload.imgUrl"
              value={formData.payload.imgUrl}
              onChange={handleChange}
              className="text-gray-800 w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        {/* Audience Section */}
        <div className="mb-10">
          <label className="font-bold block mb-2">Audience</label>
          <select
            name="audience.type"
            value={formData.audience.type}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded text-gray-500 placeholder-dropdown"
          >
            <option value="" disabled hidden>
              Select Audience
            </option>
            <option>ALL_EPNS_SUBSCRIBERS</option>
            <option>MANUAL</option>
          </select>
          {formData.audience.type === "MANUAL" && (
            <input
              type="text"
              name="audience.addresses"
              placeholder="Comma separated wallet addresses"
              value={formData.audience.addresses}
              onChange={handleChange}
              className="text-gray-800 w-full p-2 border border-gray-300 rounded mt-2"
            />
          )}
        </div>

        {/* Trigger Section */}
        <div className="mb-4">
          <label className="block font-medium mb-2">Trigger</label>
          <select
            name="trigger.type"
            value={formData.trigger.type}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded text-gray-500 placeholder-dropdown"
          >
            <option value="" disabled hidden>
              Select Trigger
            </option>
            <option>NEW_SUBSCRIBER</option>
            <option>CONTRACT_CALL</option>
            <option>SNAPSHOT_EVENT</option>
          </select>

          {formData.trigger.type === "CONTRACT_CALL" && (
            <div className="mt-2">
              <label className="block">Address</label>
              <input
                type="text"
                name="trigger.address"
                value={formData.trigger.address}
                onChange={handleChange}
                className="text-gray-800 w-full p-2 border border-gray-300 rounded"
              />
              <label className="block mt-2">Event Name</label>
              <input
                type="text"
                name="trigger.eventName"
                value={formData.trigger.eventName}
                onChange={handleChange}
                className="text-gray-800 w-full p-2 border border-gray-300 rounded"
              />
            </div>
          )}

          {formData.trigger.type === "SNAPSHOT_EVENT" && (
            <div className="mt-2">
              <label className="block">Space ID</label>
              <input
                type="text"
                name="trigger.spaceId"
                value={formData.trigger.spaceId}
                onChange={handleChange}
                className="text-gray-800 w-full p-2 border border-gray-300 rounded"
              />
              <label className="block mt-2">Event Type</label>
              <input
                type="text"
                name="trigger.eventType"
                value={formData.trigger.eventType}
                onChange={handleChange}
                className="text-gray-800 w-full p-2 border border-gray-300 rounded"
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={async () => {
            try {
              const formattedData = await formatData(formData); // Await the formatted data
              const workflow = await handleSubmit(formattedData);
              // await setupDelegate();
              // await checkDelegate();
            } catch (error) {
              console.error("Error formatting data:", error);
            }
          }}
          className="w-full bg-blue-500 text-white py-2 rounded"
        >
          Submit
        </button>

        <div className="mt-4 mb-4">
          <label className="block font-medium mb-2">
            Channel Address (CAIP Format) for delegate
          </label>
          <input
            type="text"
            name="channelAddress"
            value={delegateChannelAddress} // Bind the input value to the state
            onChange={(e) => setDelegateChannelAddress(e.target.value)} // Update state on change
            className="text-gray-800 w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={async () => {
            try {
              await setupDelegate();
            } catch (error) {
              console.error("Error formatting data:", error);
            }
          }}
          className="w-full bg-blue-500 text-white py-2 rounded"
        >
          Add Delegate
        </button>
        <button
          type="button"
          onClick={async () => {
            try {
              await checkDelegate();
            } catch (error) {
              console.error("Error formatting data:", error);
            }
          }}
          className="mt-4 w-full bg-blue-500 text-white py-2 rounded"
        >
          Check Delegate
        </button>
      </form>
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-gray-800 text-xl font-bold mb-4">
              Confirm Staking
            </h2>
            <p className="text-gray-800 mb-4">
              Do you want to proceed to stake 0.1 USDC?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setModalVisible(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await handleApprove();
                    await handleStake();
                  } catch (error) {
                    console.error("Error formatting data:", error);
                  }
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Stake
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
