import React, { useState } from "react";
import { ConnectButton } from "thirdweb/react";
import thirdwebIcon from "./thirdweb.svg";
import { client } from "./client";
import { ethers } from "ethers";
import axios from "axios";

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

  const formatData = async (unformattedData) => {
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
            values: [],
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
    }
    if (unformattedData.trigger.type === "SNAPSHOT_EVENT") {
      // Add logic for SNAPSHOT_EVENT if necessary
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

      // Define the data types (EIP-712 schema)
      const types = {
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
    } catch (error) {
      console.error("Error signing form data:", error);
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
          {formData.audience.type === "Manual" && (
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
              handleSubmit(formattedData);
            } catch (error) {
              console.error("Error formatting data:", error);
            }
          }}
          className="w-full bg-blue-500 text-white py-2 rounded"
        >
          Submit
        </button>
      </form>
    </main>
  );
}
