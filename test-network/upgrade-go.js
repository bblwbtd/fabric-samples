"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var child_process_1 = require("child_process");
var Org1Option = {
    CORE_PEER_MSPCONFIGPATH: "$PWD/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp",
    CORE_PEER_LOCALMSPID: "Org1MSP",
    CORE_PEER_TLS_ROOTCERT_FILE: "$PWD/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt",
    CORE_PEER_ADDRESS: "localhost:7051"
};
var Org2Option = {
    CORE_PEER_MSPCONFIGPATH: "$PWD/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp",
    CORE_PEER_LOCALMSPID: "Org2MSP",
    CORE_PEER_TLS_ROOTCERT_FILE: "$PWD/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt",
    CORE_PEER_ADDRESS: "localhost:9051"
};
function getEnv(options) {
    var CORE_PEER_MSPCONFIGPATH = options.CORE_PEER_MSPCONFIGPATH, _a = options.CORE_PEER_TLS_ENABLED, CORE_PEER_TLS_ENABLED = _a === void 0 ? true : _a, CORE_PEER_LOCALMSPID = options.CORE_PEER_LOCALMSPID, CORE_PEER_TLS_ROOTCERT_FILE = options.CORE_PEER_TLS_ROOTCERT_FILE, CORE_PEER_ADDRESS = options.CORE_PEER_ADDRESS;
    return "\n    export PATH=$PWD/../bin:$PATH;\n    export FABRIC_CFG_PATH=$PWD/../config/;\n    export CORE_PEER_TLS_ENABLED=" + CORE_PEER_TLS_ENABLED + ";\n    export CORE_PEER_LOCALMSPID=" + CORE_PEER_LOCALMSPID + ";\n    export CORE_PEER_TLS_ROOTCERT_FILE=" + CORE_PEER_TLS_ROOTCERT_FILE + ";\n    export CORE_PEER_MSPCONFIGPATH=" + CORE_PEER_MSPCONFIGPATH + ";\n    export CORE_PEER_ADDRESS=" + CORE_PEER_ADDRESS + ";\n    ";
}
function findInstalled(label, envOption) {
    var _a;
    var response = JSON.parse(child_process_1.execSync("\n  " + getEnv(envOption) + "\n  peer lifecycle chaincode queryinstalled --output=json\n  ").toString());
    var record = (_a = response.installed_chaincodes) === null || _a === void 0 ? void 0 : _a.find(function (value) { return value.label === label; });
    return record;
}
function getNextVersion(name, envOption) {
    var version = 1;
    while (true) {
        if (findInstalled(name + "_" + version, envOption)) {
            version += 1;
            continue;
        }
        else {
            break;
        }
    }
    return version;
}
function getSequence(channelID, name, version, envOption) {
    var sequence = 1;
    try {
        child_process_1.execSync("\n      " + getEnv(envOption) + "\n      peer lifecycle chaincode checkcommitreadiness --channelID " + channelID + " --name " + name + " --version " + version + " --sequence " + sequence + "\n      ");
    }
    catch (error) {
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
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var channelID, name, version, sequence, contractPath;
        return __generator(this, function (_a) {
            channelID = "mychannel";
            name = "block_drive";
            version = getNextVersion(name, Org1Option);
            sequence = getSequence(channelID, name, version, Org1Option);
            contractPath = "/Users/chenjienan/go/src/fabric-fs-go";
            console.log({
                name: name,
                version: version
            });
            // Install and commit chaincode
            child_process_1.execSync("\n  " + getEnv(Org1Option) + "\n  ./network.sh deployCC -ccn " + name + " -ccp " + contractPath + " -ccv " + version + " -ccl go -ccs " + sequence + "\n  ", {
                stdio: "inherit"
            });
            return [2 /*return*/];
        });
    });
}
main();
