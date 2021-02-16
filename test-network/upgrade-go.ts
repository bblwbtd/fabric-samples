import { execSync } from "child_process";

interface EnvOption {
  CORE_PEER_MSPCONFIGPATH: string;
  CORE_PEER_TLS_ENABLED?: boolean;
  CORE_PEER_LOCALMSPID: string;
  CORE_PEER_TLS_ROOTCERT_FILE: string;
  CORE_PEER_ADDRESS: string;
}

const Org1Option: EnvOption = {
  CORE_PEER_MSPCONFIGPATH:
    "$PWD/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp",
  CORE_PEER_LOCALMSPID: "Org1MSP",
  CORE_PEER_TLS_ROOTCERT_FILE:
    "$PWD/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt",
  CORE_PEER_ADDRESS: "localhost:7051",
};

const Org2Option: EnvOption = {
  CORE_PEER_MSPCONFIGPATH:
    "$PWD/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp",
  CORE_PEER_LOCALMSPID: "Org2MSP",
  CORE_PEER_TLS_ROOTCERT_FILE:
    "$PWD/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt",
  CORE_PEER_ADDRESS: "localhost:9051",
};

function getEnv(options: EnvOption) {
  const {
    CORE_PEER_MSPCONFIGPATH,
    CORE_PEER_TLS_ENABLED = true,
    CORE_PEER_LOCALMSPID,
    CORE_PEER_TLS_ROOTCERT_FILE,
    CORE_PEER_ADDRESS,
  } = options;
  return `
    export PATH=$PWD/../bin:$PATH;
    export FABRIC_CFG_PATH=$PWD/../config/;
    export CORE_PEER_TLS_ENABLED=${CORE_PEER_TLS_ENABLED};
    export CORE_PEER_LOCALMSPID=${CORE_PEER_LOCALMSPID};
    export CORE_PEER_TLS_ROOTCERT_FILE=${CORE_PEER_TLS_ROOTCERT_FILE};
    export CORE_PEER_MSPCONFIGPATH=${CORE_PEER_MSPCONFIGPATH};
    export CORE_PEER_ADDRESS=${CORE_PEER_ADDRESS};
    `;
}

function findInstalled(label: string, envOption: EnvOption) {
  const response = JSON.parse(
    execSync(`
  ${getEnv(envOption)}
  peer lifecycle chaincode queryinstalled --output=json
  `).toString()
  );
  const record = response.installed_chaincodes?.find(
    (value) => value.label === label
  );
  return record;
}

function getNextVersion(name: string, envOption: EnvOption) {
  let version = 1;

  while (true) {
    if (findInstalled(`${name}_${version}`, envOption)) {
      version += 1;
      continue;
    } else {
      break;
    }
  }

  return version;
}

function getSequence(
  channelID: string,
  name: string,
  version: number,
  envOption: EnvOption
) {
  let sequence = 1;

  try {
    execSync(`
      ${getEnv(envOption)}
      peer lifecycle chaincode checkcommitreadiness --channelID ${channelID} --name ${name} --version ${version} --sequence ${sequence}
      `);
  } catch (error) {
    return error.message.split(" ").pop().trim();
  }

  return Number(sequence);
}

// const cmd = createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

// cmd.question("ChannelID:", (channelID) => {

//   cmd.close();
// });

async function main() {
  // Collect basic info
  const channelID = "mychannel";
  const name = "block_drive";
  const version = getNextVersion(name, Org1Option);
  const sequence = getSequence(channelID, name, version, Org1Option);
  const contractPath = "/Users/chenjienan/go/src/fabric-fs-go";

  console.log({
    name,
    version,
  });

  // Install and commit chaincode
  execSync(
    `
  ${getEnv(Org1Option)}
  ./network.sh deployCC -ccn ${name} -ccp ${contractPath} -ccv ${version} -ccl go -ccs ${sequence}
  `,
    {
      stdio: "inherit",
    }
  );
}

main();
