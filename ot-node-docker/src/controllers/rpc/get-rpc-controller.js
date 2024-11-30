import { CONTENT_ASSET_HASH_FUNCTION_ID, DEFAULT_GET_STATE, NETWORK_MESSAGE_TYPES } from '../../constants/constants.js';
import BaseController from './base-rpc-controller.js';

class GetController extends BaseController {
    constructor(ctx) {
        super(ctx);
        this.commandExecutor = ctx.commandExecutor;
        this.operationService = ctx.getService;
    }

    async v1_0_0HandleRequest(message, remotePeerId, protocol) {
        const { operationId, keywordUuid, messageType } = message.header;
        const [handleInitCommand, handleRequestCommand] = this.getCommandSequence(protocol);
        let commandName;
        switch (messageType) {
            case NETWORK_MESSAGE_TYPES.REQUESTS.PROTOCOL_INIT:
                commandName = handleInitCommand;
                break;
            case NETWORK_MESSAGE_TYPES.REQUESTS.PROTOCOL_REQUEST:
                commandName = handleRequestCommand;
                break;
            default:
                throw Error('unknown messageType');
        }

        await this.commandExecutor.add({
            name: commandName,
            sequence: [],
            delay: 0,
            data: {
                remotePeerId,
                operationId,
                keywordUuid,
                protocol,
                assertionId: message.data.assertionId,
                blockchain: message.data.blockchain,
                contract: message.data.contract,
                tokenId: message.data.tokenId,
                keyword: message.data.keyword,
                hashFunctionId: message.data.hashFunctionId ?? CONTENT_ASSET_HASH_FUNCTION_ID,
                state: message.data.state ?? DEFAULT_GET_STATE
            },
            transactional: false,
        });
    }
}

export default GetController;
