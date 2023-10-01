import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Image from "next/image";

export default function Home() {
  const [provider, setProvider] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [signer, setSigner] = useState(null);
  const [signerAddress, setSignerAddress] = useState(null);
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState(null);
  const [inputSignature, setInputSignature] = useState("");
  const [activeTab, setActiveTab] = useState("sign");

  // Function to check if wallet is connected
  const checkIfWalletIsConnected = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        const _signer = await provider.getSigner();
        setSigner(_signer);
        setSignerAddress(accounts[0].address);
        return true;
      }

      return false;
    } catch (err) {
      console.error("Failed to check if wallet is connected:", err);
    }
  };

  // Use effect hook to check if wallet is connected on component mount
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const connectWallet = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const _signer = await provider.getSigner();

      // Get the connected account
      const connectedAccount = await _signer.getAddress();
      setSigner(_signer);
      setSignerAddress(connectedAccount);
    } catch (err) {
      console.error("Failed to connect wallet:", err);
    }
  };

  const handleCopyClick = async () => {
    try {
      // Copy signature to clipboard
      await navigator.clipboard.writeText(JSON.stringify(signature, null, 4));

      // Set state to display "Copied!"
      setIsCopied(true);

      // Reset state back to image after 1 second
      setTimeout(() => setIsCopied(false), 1000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const MyTextArea = () => {
    return (
      <div className="w-full border border-gray-200 rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 ">
        <div className="flex items-center justify-between bg-gray-100">
          <button
            type="button"
            className="p-2 text-teal-900 rounded cursor-pointer ml-auto text-sm"
            onClick={handleCopyClick}
          >
            {isCopied ? (
              "Copied!"
            ) : (
              <Image width="20" height="20" src="/copy.svg" alt="copy" />
            )}
          </button>
          <div
            id="tooltip-fullscreen"
            role="tooltip"
            className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
          >
            Show full screen
            <div className="tooltip-arrow" data-popper-arrow></div>
          </div>
        </div>

        <textarea
          readOnly
          className="block resize-none p-2.5 w-full h-full text-sm text-gray-900 bg-gray-50 rounded-lg self-end focus:outline-none overflow-x-auto"
          rows="7"
          value={JSON.stringify(signature, null, 4)}
        />
      </div>
    );
  };

  const handleSign = async () => {
    if (!(await checkIfWalletIsConnected())) {
      return alert("Wallet is not connected");
    }

    try {
      const sig = await signer.signMessage(message);
      const _signature = {
        msg: message,
        sig: sig,
        address: signerAddress,
      };

      setSignature(_signature);
    } catch (error) {
      console.error("Error signing the message:", error);
      alert("Error signing the message.");
    }
  };

  const handleVerify = async () => {
    try {
      if (!inputSignature) {
        alert("Please enter a valid signature JSON.");
        return;
      }

      let parsedInputSignature;
      try {
        parsedInputSignature = JSON.parse(inputSignature);
        if (
          !(
            parsedInputSignature.msg &&
            parsedInputSignature.address &&
            parsedInputSignature.sig
          )
        ) {
          throw new Error("Invalid JSON");
        }
      } catch (error) {
        console.warn("Invalid JSON input");
        setInputSignature(null);
      }

      const signerAddr = ethers.verifyMessage(
        parsedInputSignature.msg,
        parsedInputSignature.sig
      );

      if (signerAddr === parsedInputSignature.address) {
        alert("Signature verified");
      } else {
        alert("Signature not verified");
      }
    } catch (error) {
      console.error("Error verifying the signature:", error);
      alert("Error verifying the signature.");
    }
  };

  return (
    <div className="grid w-screen min-h-screen bg-gray-800 p-10" style={{ minWidth: '450px' }}>
      <button
        className="h-10 mx-5 mb-5 justify-self-end bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full"
        onClick={connectWallet}
      >
        {signerAddress ? "Connected" : "Connect Wallet"}
      </button>
      <div className="flex flex-col sm:flex-row gap-4 justify-evenly">
        {/* Sidebar */}
        <div className="w-96 p-10 bg-purple-100 rounded text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 px-5 py-2.5">
          <section className="text-white p-10 rounded">
            <h1 className="text-2xl font-bold">
              Unlock A New Level of Security with CryptoSigner
            </h1>
            <p className="text-lg mt-4">
              In today's digital world, the authenticity and integrity of
              messages are more important than ever. CryptoSigner provides an
              easy-to-use, platform for signing and verifying messages.
            </p>
          </section>
        </div>
        <div className="w-96 p-10 bg-gradient-to-r from-lime-200 via-lime-400 to-lime-500 rounded ">
          <div className="flex justify-center">
            <button
              className={
                activeTab === "sign"
                  ? "inline-block border border-teal-500 rounded py-1 px-3 bg-teal-500 text-white"
                  : "inline-block border border-white rounded hover:border-teal-100 text-teal-500 hover:bg-teal-100 py-1 px-3"
              }
              onClick={() => setActiveTab("sign")}
            >
              Sign Message
            </button>
            <button
              className={
                activeTab !== "sign"
                  ? "inline-block border border-teal-500 rounded py-1 px-3 bg-teal-500 text-white"
                  : "inline-block border border-white rounded hover:border-teal-100 text-teal-500 hover:bg-teal-100 py-1 px-3"
              }
              onClick={() => setActiveTab("verify")}
            >
              Verify Message
            </button>
          </div>

          {activeTab === "sign" && (
            <div>
              <textarea
                className="block resize-none my-10 p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-teal-500 dark:focus:border-teal-500"
                rows="10"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter message to sign"
              />
              <div className="flex w-full justify-center">
                <button
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold py-2 px-4 border border-teal-800 rounded"
                  onClick={handleSign}
                >
                  Sign
                </button>
              </div>
              {signature && (
                <div className="mt-4">
                  <label>Signature:</label>
                  <div>
                    <MyTextArea />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "verify" && (
            <div>
              <textarea
                className="block resize-none my-10 p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-teal-500 dark:focus:border-teal-500"
                rows="10"
                placeholder="Enter signature to verify"
                value={inputSignature} // Bind value
                onChange={(e) => setInputSignature(e.target.value)} // Update value
              />
              <div className="flex w-full justify-center">
                <button
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold py-2 px-4 border border-teal-800 rounded"
                  onClick={handleVerify}
                >
                  Verify
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
